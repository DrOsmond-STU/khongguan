<?php
declare(strict_types=1);

/**
 * Menyetel sandi peragaan "demo1234" untuk akun yang belum bersandi.
 *
 * HANYA untuk lingkungan pengembangan dan uji: basis data berisi data contoh
 * (007_contoh.sql) yang akunnya dipakai uji layar dan peragaan. Menolak
 * berjalan bila 'izinkan_masuk_demo' mati — yaitu di setiap peladen
 * produksi — karena sandi yang tertulis di kode sumber bukan sandi.
 *
 * Sandi ini lebih pendek dari batas minimum dan itu disengaja: ia disetel
 * langsung ke basis data, tidak lewat aturan sandi, dan sama dengan yang
 * tertulis di layar masuk purwarupa sejak awal.
 *
 *   php api/tugas/sandi-peragaan.php
 */

require_once __DIR__ . '/../src/muat.php';

use KG\{Db, Konfigurasi, Sandi};

if (!Konfigurasi::satu('izinkan_masuk_demo')) {
    fwrite(STDERR, "Menolak: 'izinkan_masuk_demo' mati. Skrip ini hanya untuk pengembangan dan uji.\n");
    exit(1);
}

$n = Db::jalankan(
    "UPDATE pengguna SET sandi_hash = :h, sandi_diubah = now()
      WHERE sandi_hash IS NULL AND status = 'Aktif'",
    [':h' => Sandi::hash('demo1234')]
);
echo "Sandi peragaan disetel untuk $n akun.\n";
