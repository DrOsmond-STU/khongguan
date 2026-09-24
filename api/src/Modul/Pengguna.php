<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Jawab, Permintaan, Sesi, Wewenang};

/**
 * Modul 24 · Pengguna dan peran.
 *
 * Hanya baca. Pengguna berasal dari direktori perusahaan lewat OIDC (docs/09),
 * bukan dibuat di sini — akun yang dapat dibuat di dua tempat akan berbeda di
 * dua tempat, dan yang satu tidak pernah ikut mati saat orangnya keluar.
 */
final class Pengguna
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'users', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'p');

        $baris = Db::semua(
            "SELECT p.email, p.nama, p.inisial, p.peran_kode, p.status, p.masuk_terakhir,
                    pr.nama AS peran_nama, pb.nama AS pabrik
               FROM pengguna p
               JOIN peran pr  ON pr.kode = p.peran_kode
               JOIN pabrik pb ON pb.id = p.pabrik_id
              WHERE $saring
              ORDER BY p.nama", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }
}
