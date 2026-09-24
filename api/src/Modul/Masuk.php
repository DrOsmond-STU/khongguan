<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Konfigurasi, Permintaan, Sesi};

/**
 * Jalur masuk.
 *
 * Pada produksi identitas datang dari direktori perusahaan lewat OIDC, dan
 * sistem tidak pernah menerima kata sandi. Jalur demo di bawah hanya hidup
 * bila 'izinkan_masuk_demo' dinyalakan — dipakai untuk pengembangan dan
 * pengujian, dan dimatikan pada produksi.
 */
final class Masuk
{
    public static function demo(Permintaan $p): never
    {
        if (!Konfigurasi::satu('izinkan_masuk_demo')) {
            throw Galat::takBerwenang('Jalur masuk demo dimatikan pada lingkungan ini.');
        }
        $email = $p->wajibTeks('email');
        $u = Db::baris('SELECT id, status FROM pengguna WHERE lower(email) = lower(:e)', [':e' => $email]);
        if ($u === null) throw Galat::belumMasuk();
        if ($u['status'] !== 'Aktif') throw Galat::takBerwenang('Akun tidak aktif.');

        $jenis = $p->isi('klien') === 'lapangan' ? 'lapangan' : 'meja';
        Jawab::kirim(['token' => Sesi::buka($u['id'], $jenis), 'jenis_klien' => $jenis]);
    }

    public static function akhiri(Permintaan $p): never
    {
        $kepala = $p->kepala('authorization') ?? '';
        if (preg_match('/^Bearer\s+([0-9a-f]{64})$/i', $kepala, $c)) Sesi::tutup($c[1]);
        Jawab::kirim(['keluar' => true]);
    }
}
