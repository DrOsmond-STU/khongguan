<?php
/**
 * Salin menjadi config.php dan sesuaikan. Berkas config.php tidak pernah
 * masuk repositori — lihat .gitignore.
 */
return [
    'db_dsn'      => 'pgsql:host=127.0.0.1;port=5432;dbname=kg_safeguard',
    'db_pengguna' => 'kg_app',
    'db_sandi'    => 'ganti-dengan-sandi-sebenarnya',

    // Dimatikan pada produksi. Identitas datang dari direktori perusahaan.
    'izinkan_masuk_demo' => false,
];
