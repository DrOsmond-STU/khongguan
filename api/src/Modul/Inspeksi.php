<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 02 · Inspeksi.
 *
 * Jumlah butir, butir terjawab, dan temuan dihitung dari butirnya, tidak
 * disimpan pada kepala inspeksi. Angka ringkasan yang disimpan selalu
 * berakhir menyimpang dari rinciannya — dan yang dipercaya orang justru
 * angka ringkasannya.
 */
final class Inspeksi
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'inspection', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'i');

        $baris = Db::semua(
            "SELECT i.id, i.nomor, i.jenis, i.area, i.tanggal, i.jadwal, i.status,
                    pg.nama AS petugas,
                    (SELECT count(*) FROM inspeksi_butir b WHERE b.inspeksi_id = i.id) AS butir,
                    (SELECT count(*) FROM inspeksi_butir b WHERE b.inspeksi_id = i.id
                      AND b.jawab IS NOT NULL) AS selesai,
                    (SELECT count(*) FROM inspeksi_butir b WHERE b.inspeksi_id = i.id
                      AND b.jawab = 'Tidak Sesuai') AS temuan
               FROM inspeksi i
          LEFT JOIN pengguna pg ON pg.id = i.petugas_id
              WHERE i.dihapus_pada IS NULL AND $saring
              ORDER BY i.tanggal DESC, i.nomor DESC", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function butir(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'inspection', 'baca');

        $i = Db::baris('SELECT id, pabrik_id FROM inspeksi WHERE id = :i AND dihapus_pada IS NULL',
            [':i' => $par['id']]);
        if ($i === null) throw Galat::takAda('Inspeksi tidak ditemukan.');
        Wewenang::wajibCakupan($u, $i['pabrik_id']);

        Jawab::kirim(Db::semua(
            'SELECT urutan, butir, jawab, catatan FROM inspeksi_butir
              WHERE inspeksi_id = :i ORDER BY urutan', [':i' => $i['id']]
        ));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'inspection', 'isi');

        $jenis = $p->wajibTeks('jenis');
        $area  = $p->wajibTeks('area');
        $butir = $p->isi('butir', []);
        if (!is_array($butir) || $butir === []) {
            throw Galat::isian('Inspeksi harus memuat sedikitnya satu butir periksa.',
                ['kolom' => 'butir']);
        }

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $jenis, $area, $butir) {
            $nomor = Nomor::berikut('inspeksi');
            $id = (string) Db::nilai(
                'INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal,
                                       jadwal, status, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :j, :a, :pg, :tg, :jd, :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $pabrik, ':j' => $jenis, ':a' => $area,
                 ':pg' => $p->isi('petugas_id', $u['id']),
                 ':tg' => (string) $p->isi('tanggal', date('Y-m-d')),
                 ':jd' => (string) $p->isi('jadwal', 'Bulanan'),
                 ':st' => (string) $p->isi('status', 'Terbuka'), ':o' => $u['id']]
            );
            $urutan = 0;
            foreach ($butir as $b) {
                $urutan++;
                Db::jalankan(
                    'INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab, catatan)
                     VALUES (:i, :u, :b, :j, :c)',
                    [':i' => $id, ':u' => $urutan,
                     ':b' => is_array($b) ? (string) ($b['butir'] ?? '') : (string) $b,
                     ':j' => is_array($b) ? ($b['jawab'] ?? null) : null,
                     ':c' => is_array($b) ? ($b['catatan'] ?? null) : null]
                );
            }
            Jejak::catat('inspeksi', $id, 'buat', null,
                ['nomor' => $nomor, 'jenis' => $jenis, 'butir' => $urutan], $u['id']);
            return ['id' => $id, 'nomor' => $nomor, 'butir' => $urutan];
        });

        Jawab::kirim($hasil, 201);
    }
}
