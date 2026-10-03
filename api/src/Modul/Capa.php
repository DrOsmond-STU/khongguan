<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 10 · CAPA. */
final class Capa
{
    /**
     * Modul sumber yang sah dan cara memeriksanya (AB-01): id, nomor yang
     * dibaca orang, dan pabriknya.
     *
     * Satu kueri per sumber, bukan satu pola untuk semua: temuan audit
     * mengambil pabriknya dari auditnya, dan parameter lingkungan tidak
     * punya nomor sendiri. Pola "SELECT id, nomor, pabrik_id FROM <tabel>"
     * yang sempat dipakai membuat CAPA dari temuan audit dan dari parameter
     * lingkungan selalu gagal dengan galat basis data.
     */
    private const SUMBER = [
        'Insiden'    => 'SELECT id, nomor, pabrik_id FROM insiden WHERE id = :i AND dihapus_pada IS NULL',
        'Inspeksi'   => 'SELECT id, nomor, pabrik_id FROM inspeksi WHERE id = :i AND dihapus_pada IS NULL',
        'Audit'      => 'SELECT t.id, t.nomor, a.pabrik_id FROM temuan_audit t JOIN audit a ON a.id = t.audit_id
                          WHERE t.id = :i AND a.dihapus_pada IS NULL',
        'Lingkungan' => "SELECT pr.id, upper(pl.kode) || ' ' || to_char(pl.periode, 'YYYY-MM') || ' · ' || pr.nama AS nomor,
                                pl.pabrik_id
                           FROM parameter_lingkungan pr JOIN pemantauan_lingkungan pl ON pl.id = pr.pemantauan_id
                          WHERE pr.id = :i",
        'Observasi'  => 'SELECT id, nomor, pabrik_id FROM observasi WHERE id = :i AND dihapus_pada IS NULL',
        'HIRADC'     => 'SELECT id, nomor, pabrik_id FROM hiradc WHERE id = :i AND dihapus_pada IS NULL',
    ];

    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'capa', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'c');

        $baris = Db::semua(
            "SELECT c.id, c.nomor, c.judul, c.sumber_jenis, c.sumber_nomor, c.terbit, c.tenggat,
                    c.prioritas, c.status, pj.nama AS pj, c.pj_id, c.pabrik_id, c.diverifikasi_pada,
                    (c.dibuat_oleh IS NOT DISTINCT FROM :saya::uuid) AS milik_saya,
                    (c.bukti IS NOT NULL) AS ada_bukti,
                    (current_date - c.terbit) AS umur,
                    (c.tenggat < current_date AND c.status <> 'Selesai') AS terlambat
               FROM capa c JOIN pengguna pj ON pj.id = c.pj_id
              WHERE c.dihapus_pada IS NULL AND $saring
              ORDER BY c.terbit DESC", $par + [':saya' => $u['id']]
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /**
     * AB-01 · CAPA tidak dapat dibuat berdiri sendiri.
     *
     * Sumber diperiksa benar-benar ada, bukan sekadar diisi. Nomor sumber
     * yang mengarah ke catatan yang tidak ada sama tidak bergunanya bagi
     * auditor dengan CAPA tanpa sumber sama sekali.
     */
    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'capa', 'isi');

        $jenis = $p->isi('sumber_jenis');
        $sid   = $p->isi('sumber_id');

        if ($jenis === null || $sid === null) {
            throw Galat::aturan('AB-01',
                'CAPA tidak dapat dibuat berdiri sendiri. Setiap CAPA harus berasal dari modul lain '
                . '(Insiden, Inspeksi, Audit, Lingkungan, Observasi, atau HIRADC).',
                ['perlu' => ['sumber_jenis', 'sumber_id']]);
        }
        if (!isset(self::SUMBER[$jenis])) {
            throw Galat::aturan('AB-01', "Jenis sumber '$jenis' tidak dikenal.",
                ['pilihan' => array_keys(self::SUMBER)]);
        }

        $sumber = preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', (string) $sid)
            ? Db::baris(self::SUMBER[$jenis], [':i' => $sid]) : null;
        if ($sumber === null) {
            throw Galat::aturan('AB-01', "Catatan sumber tidak ditemukan pada modul $jenis.",
                ['sumber_jenis' => $jenis, 'sumber_id' => $sid]);
        }
        Wewenang::wajibCakupan($u, $sumber['pabrik_id']);

        $judul  = $p->wajibTeks('judul');
        $pjId   = $p->wajibTeks('pj_id');
        $tenggat = $p->wajibTeks('tenggat');
        $prioritas = (string) $p->isi('prioritas', 'Sedang');
        if (!in_array($prioritas, ['Rendah', 'Sedang', 'Tinggi'], true)) {
            throw Galat::isian('Prioritas harus Rendah, Sedang, atau Tinggi.', ['kolom' => 'prioritas']);
        }
        if (Db::nilai("SELECT 1 FROM pengguna WHERE id::text = :i AND status = 'Aktif'", [':i' => $pjId]) === null) {
            throw Galat::isian('Penanggung jawab harus akun yang aktif.', ['kolom' => 'pj_id']);
        }
        $tg = \DateTimeImmutable::createFromFormat('!Y-m-d', $tenggat);
        if ($tg === false || $tg->format('Y-m-d') !== $tenggat) {
            throw Galat::isian("Isian 'tenggat' harus tanggal YYYY-MM-DD.", ['kolom' => 'tenggat']);
        }
        if ($tenggat < date('Y-m-d')) {
            throw Galat::isian('Tenggat tidak boleh sebelum hari ini.', ['kolom' => 'tenggat']);
        }

        $rec = Db::transaksi(function () use ($u, $sumber, $jenis, $judul, $pjId, $tenggat, $prioritas) {
            $nomor = Nomor::berikut('capa');
            $id = (string) Db::nilai(
                'INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor,
                                   pj_id, terbit, tenggat, prioritas, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :j, :sj, :si, :sn, :pj, current_date, :tg, :pr, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $sumber['pabrik_id'], ':j' => $judul,
                 ':sj' => $jenis, ':si' => $sumber['id'], ':sn' => $sumber['nomor'],
                 ':pj' => $pjId, ':tg' => $tenggat,
                 ':pr' => $prioritas, ':o' => $u['id']]
            );
            Jejak::catat('capa', $id, 'buat', null,
                ['nomor' => $nomor, 'sumber' => $jenis . ':' . $sumber['nomor']], $u['id']);
            return ['id' => $id, 'nomor' => $nomor, 'sumber_nomor' => $sumber['nomor']];
        });

        Jawab::kirim($rec, 201);
    }

    /** AB-17 · Verifikator tidak boleh penanggung jawabnya sendiri. */
    public static function verifikasi(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'capa', 'verifikasi');

        $c = Db::baris('SELECT id, nomor, pabrik_id, pj_id, bukti, status FROM capa WHERE id = :i AND dihapus_pada IS NULL',
            [':i' => $par['id']]);
        if ($c === null) throw Galat::takAda('CAPA tidak ditemukan.');
        Wewenang::wajibCakupan($u, $c['pabrik_id']);

        if ($c['pj_id'] === $u['id']) {
            throw Galat::aturan('AB-17',
                'Anda adalah penanggung jawab ' . $c['nomor'] . ', jadi tidak dapat memverifikasinya sendiri. '
                . 'Sistem K3 yang memperbolehkan penutupan sendiri kehilangan gunanya sebagai bukti audit.',
                ['capa' => $c['nomor']]);
        }

        $bukti = $c['bukti'] ?? $p->isi('bukti');
        if ($bukti === null || trim((string) $bukti) === '') {
            throw Galat::isian('CAPA tidak dapat diverifikasi tanpa bukti penyelesaian.', ['kolom' => 'bukti']);
        }

        Db::transaksi(function () use ($c, $u, $bukti) {
            Db::jalankan(
                "UPDATE capa SET status = 'Selesai', bukti = :b, verifikator_id = :u,
                        diverifikasi_pada = now(), diubah_oleh = :u, diubah_pada = now()
                  WHERE id = :i",
                [':b' => $bukti, ':u' => $u['id'], ':i' => $c['id']]
            );
            Jejak::catat('capa', $c['id'], 'verifikasi',
                ['status' => $c['status']], ['status' => 'Selesai'], $u['id']);
        });

        Jawab::kirim(['id' => $c['id'], 'nomor' => $c['nomor'], 'status' => 'Selesai']);
    }
}
