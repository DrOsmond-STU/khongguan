<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Jawab, Permintaan, Sesi};

/**
 * Profil pengguna yang sedang masuk.
 *
 * Panggilan pertama setiap klien. Balasannya menentukan menu yang digambar —
 * klien tidak pernah menyusun daftar modulnya sendiri (AB-32). Itulah yang
 * membuat aplikasi meja dan aplikasi lapangan tidak mungkin menampilkan dua
 * daftar modul yang berbeda untuk orang yang sama.
 */
final class Saya
{
    public static function tampil(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Jawab::kirim([
            'id'      => $u['id'],
            'nama'    => $u['nama'],
            'inisial' => $u['inisial'],
            'email'   => $u['email'],
            'peran'   => ['kode' => $u['peran_kode'], 'nama' => $u['peran_nama']],
            'pabrik'  => ['id' => $u['pabrik_id'], 'kode' => $u['pabrik_kode'], 'nama' => $u['pabrik_nama']],
            'modul'   => $u['modul'],
            'kewenangan' => $u['kewenangan'],
        ]);
    }
}
