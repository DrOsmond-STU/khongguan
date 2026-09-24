<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 07 · HIRADC K3. */
final class Hiradc
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'hiradc', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'h');

        $sql = "SELECT h.id, h.nomor, h.proses, h.aktivitas, h.sifat, h.kategori, h.bahaya,
                       h.risiko, h.korban, h.kemungkinan, h.keparahan, h.kendali_ada,
                       h.kemungkinan_sisa, h.keparahan_sisa, h.kendali_tambahan,
                       h.hierarki, h.target, h.status, h.skor_awal, h.skor_sisa,
                       kb.nama AS kategori_nama, pj.nama AS pj
                  FROM hiradc h
             LEFT JOIN kategori_bahaya kb ON kb.kode = h.kategori
             LEFT JOIN pengguna pj ON pj.id = h.pj_id
                 WHERE h.dihapus_pada IS NULL AND $saring";
        if (isset($p->kueri['status'])) { $sql .= ' AND h.status = :status'; $par[':status'] = $p->kueri['status']; }
        $sql .= ' ORDER BY h.nomor';

        $baris = array_map(static function (array $r): array {
            $r['zona']      = Aturan::zona((int) $r['skor_awal']);
            $r['zona_sisa'] = Aturan::zona((int) $r['skor_sisa']);
            return $r;
        }, Db::semua($sql, $par));

        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'hiradc', 'isi');

        $proses    = $p->wajibTeks('proses');
        $aktivitas = $p->wajibTeks('aktivitas');
        $bahaya    = $p->wajibTeks('bahaya');
        $risiko    = $p->wajibTeks('risiko');
        $korban    = $p->wajibTeks('korban');

        $km  = $p->wajibBulat('kemungkinan');
        $kp  = $p->wajibBulat('keparahan');
        $kms = (int) $p->isi('kemungkinan_sisa', $km);
        $kps = (int) $p->isi('keparahan_sisa', $kp);

        // Penjagaan konsistensi, bukan salah satu aturan docs/03: skor sisa
        // di atas skor awal berarti pengendalian memperburuk keadaan. Hampir
        // selalu salah ketik, dan diam-diam merusak peringkat risiko seluruh
        // daftar.
        if ($kms * $kps > $km * $kp) {
            throw Galat::isian(
                'Skor sisa (' . ($kms * $kps) . ') tidak boleh melebihi skor awal (' . ($km * $kp) . ').',
                ['skor_awal' => $km * $kp, 'skor_sisa' => $kms * $kps]);
        }

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $proses, $aktivitas, $bahaya,
                                                $risiko, $korban, $km, $kp, $kms, $kps) {
            $nomor = Nomor::berikut('hiradc');
            $id = (string) Db::nilai(
                'INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya,
                                     risiko, korban, kemungkinan, keparahan, kendali_ada,
                                     kemungkinan_sisa, keparahan_sisa, kendali_tambahan,
                                     hierarki, pj_id, target, status, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :pr, :ak, :sf, :kt, :bh, :rs, :kb, :km, :kp, :ka,
                         :kms, :kps, :ktm, :hr, :pj, :tg, :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $pabrik, ':pr' => $proses, ':ak' => $aktivitas,
                 ':sf' => (string) $p->isi('sifat', 'Rutin'),
                 ':kt' => (string) $p->isi('kategori', 'fisik'),
                 ':bh' => $bahaya, ':rs' => $risiko, ':kb' => $korban,
                 ':km' => $km, ':kp' => $kp, ':ka' => $p->isi('kendali_ada'),
                 ':kms' => $kms, ':kps' => $kps, ':ktm' => $p->isi('kendali_tambahan'),
                 ':hr' => $p->isi('hierarki'), ':pj' => $p->isi('pj_id'),
                 ':tg' => $p->isi('target'), ':st' => (string) $p->isi('status', 'Terbuka'),
                 ':o' => $u['id']]
            );
            Jejak::catat('hiradc', $id, 'buat', null,
                ['nomor' => $nomor, 'bahaya' => $bahaya, 'skor_awal' => $km * $kp], $u['id']);
            return ['id' => $id, 'nomor' => $nomor,
                    'zona' => Aturan::zona($km * $kp), 'zona_sisa' => Aturan::zona($kms * $kps)];
        });

        Jawab::kirim($hasil, 201);
    }

    /**
     * Penurunan skor sisa. Inilah satu-satunya jalur yang boleh menurunkannya,
     * dan ia menuntut pengendalian tambahan benar-benar terpasang (AB-15) —
     * bukan direncanakan.
     */
    public static function turunkanSisa(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'hiradc', 'verifikasi');

        $h = Db::baris('SELECT id, nomor, pabrik_id, kemungkinan_sisa, keparahan_sisa, status
                          FROM hiradc WHERE id = :i AND dihapus_pada IS NULL', [':i' => $par['id']]);
        if ($h === null) throw Galat::takAda('Baris HIRADC tidak ditemukan.');
        Wewenang::wajibCakupan($u, $h['pabrik_id']);

        $km = $p->wajibBulat('kemungkinan_sisa');
        $kp = $p->wajibBulat('keparahan_sisa');
        Aturan::sisaHiradcBolehTurun($h['id'], $km, $kp);

        Db::transaksi(function () use ($h, $u, $km, $kp) {
            Db::jalankan(
                'UPDATE hiradc SET kemungkinan_sisa = :km, keparahan_sisa = :kp,
                        diubah_oleh = :u, diubah_pada = now() WHERE id = :i',
                [':km' => $km, ':kp' => $kp, ':u' => $u['id'], ':i' => $h['id']]
            );
            Jejak::catat('hiradc', $h['id'], 'turunkan-sisa',
                ['kemungkinan_sisa' => (int) $h['kemungkinan_sisa'], 'keparahan_sisa' => (int) $h['keparahan_sisa']],
                ['kemungkinan_sisa' => $km, 'keparahan_sisa' => $kp], $u['id']);
        });

        Jawab::kirim(['id' => $h['id'], 'nomor' => $h['nomor'],
                      'skor_sisa' => $km * $kp, 'zona_sisa' => Aturan::zona($km * $kp)]);
    }
}
