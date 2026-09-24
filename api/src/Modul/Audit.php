<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 09 · Audit dan temuannya.
 *
 * AB-18 · audit hanya dapat ditutup setelah setiap temuan Major dan Minor
 * punya CAPA. Temuan Observasi tidak menahan penutupan: ia catatan perbaikan,
 * bukan ketidaksesuaian.
 */
final class Audit
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'audit', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'a');

        $baris = Db::semua(
            "SELECT a.id, a.nomor, a.standar, a.lingkup, a.auditor, a.mulai, a.selesai, a.status,
                    (SELECT count(*) FROM temuan_audit t
                      WHERE t.audit_id = a.id AND t.kategori = 'Major')     AS major,
                    (SELECT count(*) FROM temuan_audit t
                      WHERE t.audit_id = a.id AND t.kategori = 'Minor')     AS minor,
                    (SELECT count(*) FROM temuan_audit t
                      WHERE t.audit_id = a.id AND t.kategori = 'Observasi') AS obs
               FROM audit a
              WHERE a.dihapus_pada IS NULL AND $saring
              ORDER BY a.mulai DESC", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function temuan(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'audit', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'a');

        $baris = Db::semua(
            "SELECT t.id, t.nomor, t.klausul, t.kategori, t.isi, t.tenggat, t.status,
                    a.nomor AS audit, pj.nama AS pj,
                    (SELECT count(*) FROM capa c
                      WHERE c.sumber_id = t.id AND c.dihapus_pada IS NULL) AS capa
               FROM temuan_audit t
               JOIN audit a ON a.id = t.audit_id
          LEFT JOIN pengguna pj ON pj.id = t.pj_id
              WHERE a.dihapus_pada IS NULL AND $saring
              ORDER BY t.nomor DESC", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buatTemuan(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'audit', 'isi');

        $a = Db::baris('SELECT id, nomor, pabrik_id, status FROM audit
                         WHERE id = :i AND dihapus_pada IS NULL', [':i' => $par['id']]);
        if ($a === null) throw Galat::takAda('Audit tidak ditemukan.');
        Wewenang::wajibCakupan($u, $a['pabrik_id']);

        if ($a['status'] === 'Selesai') {
            throw Galat::isian('Audit ' . $a['nomor'] . ' sudah ditutup; temuan tidak dapat ditambahkan.',
                ['nomor' => $a['nomor']]);
        }

        $klausul  = $p->wajibTeks('klausul');
        $kategori = $p->wajibTeks('kategori');
        $isi      = $p->wajibTeks('isi');
        if (!in_array($kategori, ['Major', 'Minor', 'Observasi'], true)) {
            throw Galat::isian('Kategori temuan tidak dikenal.', ['kolom' => 'kategori']);
        }

        $hasil = Db::transaksi(function () use ($p, $u, $a, $klausul, $kategori, $isi) {
            $nomor = Nomor::berikut('temuan_audit');
            $id = (string) Db::nilai(
                'INSERT INTO temuan_audit (nomor, audit_id, klausul, kategori, isi, pj_id, tenggat,
                                           status, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :a, :k, :kt, :i, :pj, :tg, :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':a' => $a['id'], ':k' => $klausul, ':kt' => $kategori, ':i' => $isi,
                 ':pj' => $p->isi('pj_id'), ':tg' => $p->isi('tenggat'),
                 ':st' => (string) $p->isi('status', 'Terbuka'), ':o' => $u['id']]
            );
            Jejak::catat('temuan_audit', $id, 'buat', null,
                ['nomor' => $nomor, 'kategori' => $kategori], $u['id']);
            return ['id' => $id, 'nomor' => $nomor];
        });

        Jawab::kirim($hasil, 201);
    }

    public static function tutup(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'audit', 'verifikasi');

        $a = Db::baris('SELECT id, nomor, pabrik_id, status FROM audit
                         WHERE id = :i AND dihapus_pada IS NULL', [':i' => $par['id']]);
        if ($a === null) throw Galat::takAda('Audit tidak ditemukan.');
        Wewenang::wajibCakupan($u, $a['pabrik_id']);

        if ($a['status'] === 'Selesai') {
            throw Galat::isian('Audit ' . $a['nomor'] . ' sudah ditutup.', ['nomor' => $a['nomor']]);
        }
        Aturan::auditBolehDitutup($a['id']);

        Db::transaksi(function () use ($a, $u) {
            Db::jalankan(
                "UPDATE audit SET status = 'Selesai', selesai = coalesce(selesai, current_date),
                        ditutup_oleh = :u, ditutup_pada = now(), diubah_oleh = :u, diubah_pada = now()
                  WHERE id = :i", [':u' => $u['id'], ':i' => $a['id']]
            );
            Jejak::catat('audit', $a['id'], 'tutup',
                ['status' => $a['status']], ['status' => 'Selesai'], $u['id']);
        });

        Jawab::kirim(['id' => $a['id'], 'nomor' => $a['nomor'], 'status' => 'Selesai']);
    }
}
