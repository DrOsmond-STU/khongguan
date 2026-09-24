<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Berkas, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Sinkronisasi antrean aplikasi lapangan.
 *
 * Tiga ketentuan yang mengikat (docs/06):
 *
 *   1. Idempoten. perangkat_id + id_lokal menjadi kunci. Sinyal yang putus
 *      di tengah pengiriman adalah keadaan biasa, bukan kekecualian.
 *   2. Sebagian berhasil adalah hasil yang sah. Satu kiriman ditolak tidak
 *      menggagalkan sisanya.
 *   3. Penolakan menyebutkan aturannya, supaya pelapor dapat memperbaikinya.
 *
 * Tiap kiriman ditulis dalam transaksinya sendiri, bukan satu transaksi untuk
 * seluruh antrean: satu kiriman yang melanggar aturan tidak boleh membatalkan
 * sembilan kiriman lain yang sah.
 */
final class Lapangan
{
    public static function kirim(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $perangkat = $p->wajibTeks('perangkat_id');
        $antrean   = $p->isi('kiriman', []);
        if (!is_array($antrean)) {
            throw Galat::isian("Isian 'kiriman' harus berupa larik.", ['kolom' => 'kiriman']);
        }

        $hasil = [];
        foreach ($antrean as $k) {
            if (!is_array($k) || !isset($k['id_lokal'], $k['jenis'])) {
                $hasil[] = ['id_lokal' => $k['id_lokal'] ?? null, 'status' => 'ditolak',
                            'pesan' => 'Kiriman tanpa id_lokal atau jenis.'];
                continue;
            }
            $hasil[] = self::satu($u, $perangkat, $k);
        }

        Jawab::kirim(['hasil' => $hasil]);
    }

    /**
     * @param array<string,mixed> $u
     * @param array<string,mixed> $k
     * @return array<string,mixed>
     */
    private static function satu(array $u, string $perangkat, array $k): array
    {
        $idLokal = (string) $k['id_lokal'];

        // Ketentuan 1 · idempoten. Kiriman yang sudah pernah diproses
        // menjawab hasil yang sama, tanpa menulis catatan kedua.
        $lama = Db::baris(
            'SELECT hasil, nomor, aturan, pesan FROM kiriman_lapangan
              WHERE perangkat_id = :d AND id_lokal = :l',
            [':d' => $perangkat, ':l' => $idLokal]
        );
        if ($lama !== null) {
            return array_filter([
                'id_lokal' => $idLokal,
                'status'   => $lama['hasil'],
                'nomor'    => $lama['nomor'],
                'aturan'   => $lama['aturan'],
                'pesan'    => $lama['pesan'],
                'diulang'  => true,
            ], fn($v) => $v !== null);
        }

        try {
            return Db::transaksi(function () use ($u, $perangkat, $idLokal, $k) {
                $nomor = match ($k['jenis']) {
                    'bahaya'    => self::simpanBahaya($u, $k),
                    'insiden'   => self::simpanInsiden($u, $k),
                    'apd'       => self::simpanApd($u, $k),
                    'observasi' => self::simpanObservasi($u, $k),
                    'izin'      => self::simpanIzin($u, $k),
                    default     => throw Galat::isian("Jenis kiriman '{$k['jenis']}' tidak dikenal."),
                };
                Db::jalankan(
                    'INSERT INTO kiriman_lapangan (perangkat_id, id_lokal, jenis, hasil, nomor, pengguna_id)
                     VALUES (:d, :l, :j, :h, :n, :u)',
                    [':d' => $perangkat, ':l' => $idLokal, ':j' => (string) $k['jenis'],
                     ':h' => 'diterima', ':n' => $nomor, ':u' => $u['id']]
                );
                return ['id_lokal' => $idLokal, 'status' => 'diterima', 'nomor' => $nomor];
            });
        } catch (Galat $g) {
            // Ketentuan 2 dan 3 · kiriman yang ditolak dicatat beserta kode
            // aturannya, di luar transaksi yang baru saja dibatalkan, supaya
            // perangkat tidak mengirimkannya berulang-ulang tanpa tahu sebab.
            Db::jalankan(
                'INSERT INTO kiriman_lapangan (perangkat_id, id_lokal, jenis, hasil, aturan, pesan, pengguna_id)
                 VALUES (:d, :l, :j, :h, :a, :p, :u)
                 ON CONFLICT (perangkat_id, id_lokal) DO NOTHING',
                [':d' => $perangkat, ':l' => $idLokal, ':j' => (string) $k['jenis'],
                 ':h' => 'ditolak', ':a' => $g->aturan, ':p' => $g->getMessage(), ':u' => $u['id']]
            );
            return array_filter([
                'id_lokal' => $idLokal, 'status' => 'ditolak',
                'aturan' => $g->aturan, 'pesan' => $g->getMessage(),
            ], fn($v) => $v !== null);
        }
    }

    /**
     * Foto dari lapangan datang sebagai data URL di dalam antrean, bukan
     * sebagai unggahan multipart: antrean disimpan sebagai JSON di perangkat,
     * dan harus utuh saat sinyal kembali.
     *
     * Foto yang gagal disimpan tidak boleh menjatuhkan laporannya. Bahaya yang
     * tercatat tanpa foto masih bahaya yang tercatat; bahaya yang hilang
     * karena fotonya bermasalah hilang sama sekali.
     *
     * @param array<string,mixed> $k
     */
    private static function lampirkan(array $k, string $tabel, string $indukId, string $penggunaId): void
    {
        $foto = $k['foto'] ?? null;
        if (!is_string($foto) || $foto === '') return;
        try {
            $l = Berkas::simpanDataUrl($foto, $penggunaId);
            if ($l !== null) Berkas::kaitkan($l['id'], $tabel, $indukId);
        } catch (\Throwable $e) {
            error_log('[KG] foto lapangan gagal disimpan untuk ' . $tabel . ' ' . $indukId
                . ': ' . $e->getMessage());
        }
    }

    /** @param array<string,mixed> $u @param array<string,mixed> $k */
    private static function area(array $u, array $k): array
    {
        $a = Db::baris('SELECT id, pabrik_id FROM area WHERE id = :i AND aktif',
            [':i' => (string) ($k['area_id'] ?? '')]);
        if ($a === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => 'area_id']);
        Wewenang::wajibCakupan($u, $a['pabrik_id']);
        return $a;
    }

    private static function simpanBahaya(array $u, array $k): string
    {
        $a = self::area($u, $k);
        $nomor = Nomor::lapangan('bahaya');
        $ko = $k['koordinat'] ?? null;
        $id = (string) Db::nilai(
            'INSERT INTO bahaya (nomor, nomor_asal, pabrik_id, area_id, kategori, isi, risiko,
                                 pelapor_id, koordinat_lat, koordinat_lon, koordinat_akurasi_m,
                                 dibuat_oleh, diubah_oleh)
             VALUES (:n, :na, :pb, :a, :k, :i, :r, :pl, :lat, :lon, :ak, :o, :o) RETURNING id',
            [':n' => $nomor, ':na' => $nomor, ':pb' => $a['pabrik_id'], ':a' => $a['id'],
             ':k' => (string) ($k['kategori'] ?? 'Unsafe Condition'),
             ':i' => (string) ($k['isi'] ?? ''), ':r' => (string) ($k['risiko'] ?? 'Sedang'),
             ':pl' => $u['id'],
             ':lat' => is_array($ko) ? ($ko['lat'] ?? null) : null,
             ':lon' => is_array($ko) ? ($ko['lon'] ?? null) : null,
             ':ak'  => is_array($ko) ? ($ko['akurasi_m'] ?? null) : null,
             ':o' => $u['id']]
        );
        self::lampirkan($k, 'bahaya', $id, $u['id']);
        Jejak::catat('bahaya', $id, 'buat', null, ['nomor' => $nomor, 'dari' => 'lapangan'], $u['id']);
        return $nomor;
    }

    private static function simpanInsiden(array $u, array $k): string
    {
        $a = self::area($u, $k);
        $nomor = Nomor::lapangan('insiden');
        $id = (string) Db::nilai(
            'INSERT INTO insiden (nomor, nomor_asal, pabrik_id, area_id, jenis, keparahan, tanggal,
                                  pelapor_id, ringkas, cedera, dibuat_oleh, diubah_oleh)
             VALUES (:n, :na, :pb, :a, :j, :kp, current_date, :pl, :r, :c, :o, :o) RETURNING id',
            [':n' => $nomor, ':na' => $nomor, ':pb' => $a['pabrik_id'], ':a' => $a['id'],
             ':j' => (string) ($k['kategori'] ?? 'Nearmiss'), ':kp' => (string) ($k['keparahan'] ?? 'Ringan'),
             ':pl' => $u['id'], ':r' => (string) ($k['isi'] ?? ''), ':c' => $k['cedera'] ?? null,
             ':o' => $u['id']]
        );
        self::lampirkan($k, 'insiden', $id, $u['id']);
        Jejak::catat('insiden', $id, 'buat', null, ['nomor' => $nomor, 'dari' => 'lapangan'], $u['id']);
        return $nomor;
    }

    private static function simpanApd(array $u, array $k): string
    {
        $a = self::area($u, $k);
        $diamati = (int) ($k['diamati'] ?? 0);
        $patuh   = (int) ($k['patuh'] ?? 0);
        if ($diamati < 1) {
            throw Galat::isian('Jumlah pekerja yang diamati belum diisi.', ['kolom' => 'diamati']);
        }
        if ($patuh > $diamati) {
            throw Galat::takKonsisten('AB-07',
                "Jumlah patuh ($patuh) tidak boleh melebihi jumlah yang diamati ($diamati).",
                ['diamati' => $diamati, 'patuh' => $patuh]);
        }
        $nomor = Nomor::lapangan('apd');
        $id = (string) Db::nilai(
            'INSERT INTO observasi_apd (nomor, nomor_asal, pabrik_id, area_id, pengamat_id, tanggal,
                                        diamati, patuh, catatan, dibuat_oleh, diubah_oleh)
             VALUES (:n, :na, :pb, :a, :pg, current_date, :d, :p, :c, :o, :o) RETURNING id',
            [':n' => $nomor, ':na' => $nomor, ':pb' => $a['pabrik_id'], ':a' => $a['id'],
             ':pg' => $u['id'], ':d' => $diamati, ':p' => $patuh,
             ':c' => (string) ($k['isi'] ?? ''), ':o' => $u['id']]
        );
        self::lampirkan($k, 'observasi_apd', $id, $u['id']);
        Jejak::catat('observasi_apd', $id, 'buat', null, ['nomor' => $nomor, 'dari' => 'lapangan'], $u['id']);
        return $nomor;
    }

    private static function simpanObservasi(array $u, array $k): string
    {
        $a = self::area($u, $k);
        $nomor = Nomor::lapangan('observasi');
        $id = (string) Db::nilai(
            'INSERT INTO observasi (nomor, nomor_asal, pabrik_id, area_id, pengamat_id, tanggal,
                                    kategori, aman, berisiko, catatan, dibuat_oleh, diubah_oleh)
             VALUES (:n, :na, :pb, :a, :pg, current_date, :k, :am, :br, :c, :o, :o) RETURNING id',
            [':n' => $nomor, ':na' => $nomor, ':pb' => $a['pabrik_id'], ':a' => $a['id'],
             ':pg' => $u['id'], ':k' => (string) ($k['kategori'] ?? 'Alat Pelindung Diri'),
             ':am' => (int) ($k['aman'] ?? 0), ':br' => (int) ($k['berisiko'] ?? 0),
             ':c' => (string) ($k['isi'] ?? ''), ':o' => $u['id']]
        );
        self::lampirkan($k, 'observasi', $id, $u['id']);
        Jejak::catat('observasi', $id, 'buat', null, ['nomor' => $nomor, 'dari' => 'lapangan'], $u['id']);
        return $nomor;
    }

    /** AB-12 · pengajuan dari lapangan tidak pernah langsung menjadi izin aktif. */
    private static function simpanIzin(array $u, array $k): string
    {
        $a = self::area($u, $k);
        $pengawas = trim((string) ($k['pengawas'] ?? ''));
        if ($pengawas === '') {
            throw Galat::isian('Nama pengawas pekerjaan belum diisi.', ['kolom' => 'pengawas']);
        }
        $jenis = (string) ($k['kategori'] ?? 'panas');
        if (Db::baris('SELECT kode FROM jenis_izin WHERE kode = :k', [':k' => $jenis]) === null) {
            throw Galat::isian("Jenis izin '$jenis' tidak dikenal.", ['kolom' => 'kategori']);
        }
        $nomor = Nomor::lapangan('izin');
        $id = (string) Db::nilai(
            'INSERT INTO izin (nomor, nomor_asal, pabrik_id, area_id, jenis, judul, pelaksana, pelaksana_id,
                               pengawas, durasi, prasyarat, status, dibuat_oleh, diubah_oleh)
             VALUES (:n, :na, :pb, :a, :j, :ju, :pl, :pli, :pw, :d, :pr, :st, :o, :o) RETURNING id',
            [':n' => $nomor, ':na' => $nomor, ':pb' => $a['pabrik_id'], ':a' => $a['id'],
             ':j' => $jenis, ':ju' => (string) ($k['isi'] ?? ''),
             ':pl' => $u['nama'], ':pli' => $u['id'], ':pw' => $pengawas,
             ':d' => $k['durasi'] ?? null,
             ':pr' => json_encode($k['prasyarat'] ?? [], JSON_UNESCAPED_UNICODE),
             ':st' => 'Menunggu Supervisor', ':o' => $u['id']]
        );
        self::lampirkan($k, 'izin', $id, $u['id']);
        Jejak::catat('izin', $id, 'buat', null, ['nomor' => $nomor, 'dari' => 'lapangan'], $u['id']);
        return $nomor;
    }

    /**
     * Rujukan luring: hanya yang berubah sejak waktu yang disebut klien,
     * dan hanya modul yang terbuka untuk perannya (AB-32).
     */
    public static function rujukan(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $sejak = $p->kueri['sejak'] ?? '1970-01-01T00:00:00Z';
        $boleh = fn(string $m) => in_array($m, $u['modul'], true);
        [$saring, $par] = Wewenang::saringCakupan($u, 'x');
        $par[':sejak'] = $sejak;

        $out = ['sejak' => $sejak, 'sampai' => gmdate('c')];

        if ($boleh('jsa')) {
            $out['jsa'] = Db::semua(
                "SELECT x.id, x.nomor, x.pekerjaan, x.jenis, x.status, x.tinjau, x.revisi, a.nama AS area,
                        (SELECT max(skor_sisa) FROM jsa_langkah l WHERE l.jsa_id = x.id) AS risiko_sisa
                   FROM jsa x JOIN area a ON a.id = x.area_id
                  WHERE x.dihapus_pada IS NULL AND x.diubah_pada > :sejak AND $saring
                  ORDER BY x.nomor", $par);
        }
        if ($boleh('hiradc')) {
            $out['hiradc'] = Db::semua(
                "SELECT x.id, x.nomor, x.proses, x.aktivitas, x.sifat, x.kategori, x.bahaya, x.risiko,
                        x.skor_awal, x.skor_sisa, x.status
                   FROM hiradc x
                  WHERE x.dihapus_pada IS NULL AND x.diubah_pada > :sejak AND $saring
                  ORDER BY x.skor_sisa DESC", $par);
        }
        if ($boleh('induksi')) {
            $out['induksi_saya'] = Db::semua(
                'SELECT nomor, jenis, tanggal, berlaku, status FROM induksi
                  WHERE pengguna_id = :u AND dihapus_pada IS NULL ORDER BY berlaku DESC LIMIT 1',
                [':u' => $u['id']]);
        }

        Jawab::kirim($out);
    }
}
