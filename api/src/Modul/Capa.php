<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 10 · CAPA. */
final class Capa
{
    /** Modul sumber yang sah dan tabel tempat memeriksanya (AB-01). */
    private const SUMBER = [
        'Insiden'    => 'insiden',
        'Inspeksi'   => 'inspeksi',
        'Audit'      => 'temuan_audit',
        'Lingkungan' => 'parameter_lingkungan',
        'Observasi'  => 'observasi',
        'HIRADC'     => 'hiradc',
    ];

    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'capa', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'c');

        $baris = Db::semua(
            "SELECT c.id, c.nomor, c.judul, c.sumber_jenis, c.sumber_nomor, c.terbit, c.tenggat,
                    c.prioritas, c.status, pj.nama AS pj,
                    (current_date - c.terbit) AS umur,
                    (c.tenggat < current_date AND c.status <> 'Selesai') AS terlambat
               FROM capa c JOIN pengguna pj ON pj.id = c.pj_id
              WHERE c.dihapus_pada IS NULL AND $saring
              ORDER BY c.terbit DESC", $par
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

        $tabel  = self::SUMBER[$jenis];
        $sumber = Db::baris("SELECT id, nomor, pabrik_id FROM $tabel WHERE id = :i", [':i' => $sid]);
        if ($sumber === null) {
            throw Galat::aturan('AB-01', "Catatan sumber tidak ditemukan pada modul $jenis.",
                ['sumber_jenis' => $jenis, 'sumber_id' => $sid]);
        }
        Wewenang::wajibCakupan($u, $sumber['pabrik_id']);

        $judul  = $p->wajibTeks('judul');
        $pjId   = $p->wajibTeks('pj_id');
        $tenggat = $p->wajibTeks('tenggat');

        $rec = Db::transaksi(function () use ($u, $sumber, $jenis, $judul, $pjId, $tenggat, $p) {
            $nomor = Nomor::berikut('capa');
            $id = (string) Db::nilai(
                'INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor,
                                   pj_id, terbit, tenggat, prioritas, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :j, :sj, :si, :sn, :pj, current_date, :tg, :pr, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $sumber['pabrik_id'], ':j' => $judul,
                 ':sj' => $jenis, ':si' => $sumber['id'], ':sn' => $sumber['nomor'],
                 ':pj' => $pjId, ':tg' => $tenggat,
                 ':pr' => (string) $p->isi('prioritas', 'Sedang'), ':o' => $u['id']]
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
