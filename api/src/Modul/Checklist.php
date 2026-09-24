<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 05 · Safety Checklist.
 *
 * AB-08 · satu butir dijawab "Tidak Sesuai" mengunci unitnya dari operasi.
 * Penguncian dilakukan pemicu basis data, bukan kode ini: gerbang operasi
 * yang hanya dijaga aplikasi akan terlewat oleh jalur pengisian berikutnya
 * yang ditulis orang lain.
 */
final class Checklist
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'checklist', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'c');

        $baris = Db::semua(
            "SELECT c.id, c.nomor, c.nama, c.frekuensi, c.shift, c.tanggal, c.waktu, c.status,
                    coalesce(a.nama, c.lokasi) AS area, pg.nama AS pj,
                    up.kode AS unit_kode, up.nama AS unit, up.status AS unit_status,
                    (SELECT count(*) FROM checklist_butir b WHERE b.checklist_id = c.id) AS butir,
                    (SELECT count(*) FROM checklist_butir b WHERE b.checklist_id = c.id
                      AND b.jawab IS NOT NULL) AS selesai,
                    (SELECT count(*) FROM checklist_butir b WHERE b.checklist_id = c.id
                      AND b.jawab = 'Tidak Sesuai') AS temuan
               FROM checklist c
          LEFT JOIN area a  ON a.id = c.area_id
          LEFT JOIN pengguna pg ON pg.id = c.pj_id
          LEFT JOIN unit_periksa up ON up.id = c.unit_id
              WHERE c.dihapus_pada IS NULL AND $saring
              ORDER BY c.tanggal DESC, c.waktu DESC NULLS LAST", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function butir(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'checklist', 'baca');

        $c = Db::baris('SELECT id, pabrik_id FROM checklist WHERE id = :i AND dihapus_pada IS NULL',
            [':i' => $par['id']]);
        if ($c === null) throw Galat::takAda('Checklist tidak ditemukan.');
        Wewenang::wajibCakupan($u, $c['pabrik_id']);

        Jawab::kirim(Db::semua(
            'SELECT urutan, butir, jawab, catatan FROM checklist_butir
              WHERE checklist_id = :i ORDER BY urutan', [':i' => $c['id']]
        ));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'checklist', 'isi');

        $nama  = $p->wajibTeks('nama');
        $butir = $p->isi('butir', []);
        if (!is_array($butir) || $butir === []) {
            throw Galat::isian('Checklist harus memuat sedikitnya satu butir.', ['kolom' => 'butir']);
        }

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $nama, $butir) {
            $nomor = Nomor::berikut('checklist');
            $id = (string) Db::nilai(
                'INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift,
                                        pj_id, tanggal, waktu, status, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :nm, :f, :a, :lk, :un, :sh, :pj, :tg, :w, :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $pabrik, ':nm' => $nama,
                 ':f' => (string) $p->isi('frekuensi', 'Harian'),
                 ':a' => $p->isi('area_id'), ':lk' => $p->isi('lokasi'),
                 ':un' => $p->isi('unit_id'), ':sh' => $p->isi('shift'),
                 ':pj' => $p->isi('pj_id', $u['id']),
                 ':tg' => (string) $p->isi('tanggal', date('Y-m-d')), ':w' => $p->isi('waktu'),
                 ':st' => (string) $p->isi('status', 'Terbuka'), ':o' => $u['id']]
            );

            $urutan = 0;
            $tidakSesuai = 0;
            foreach ($butir as $b) {
                $urutan++;
                $jawab = is_array($b) ? ($b['jawab'] ?? null) : null;
                if ($jawab === 'Tidak Sesuai') $tidakSesuai++;
                Db::jalankan(
                    'INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab, catatan)
                     VALUES (:c, :u, :b, :j, :ct)',
                    [':c' => $id, ':u' => $urutan,
                     ':b' => is_array($b) ? (string) ($b['butir'] ?? '') : (string) $b,
                     ':j' => $jawab, ':ct' => is_array($b) ? ($b['catatan'] ?? null) : null]
                );
            }

            // Penguncian sudah dikerjakan pemicu; dibaca ulang supaya pengisi
            // tahu seketika bahwa unitnya berhenti beroperasi, bukan setelah
            // membuka daftar alat.
            $unit = $p->isi('unit_id') === null ? null : Db::baris(
                'SELECT kode, nama, status FROM unit_periksa WHERE id = :i', [':i' => $p->isi('unit_id')]);

            Jejak::catat('checklist', $id, 'buat', null,
                ['nomor' => $nomor, 'butir' => $urutan, 'tidak_sesuai' => $tidakSesuai], $u['id']);

            return ['id' => $id, 'nomor' => $nomor, 'butir' => $urutan,
                    'temuan' => $tidakSesuai, 'unit' => $unit];
        });

        Jawab::kirim($hasil, 201);
    }

    /** Daftar unit beserta status operasinya (AB-08). */
    public static function unit(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'checklist', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'up');

        Jawab::kirim(Db::semua(
            "SELECT up.kode, up.nama, up.jenis, up.status, up.dikunci_pada, c.nomor AS dikunci_oleh
               FROM unit_periksa up
          LEFT JOIN checklist c ON c.id = up.dikunci_oleh_checklist
              WHERE $saring
              ORDER BY up.status DESC, up.kode", $par
        ));
    }
}
