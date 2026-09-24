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

    /**
     * Masuk lewat direktori perusahaan (OpenID Connect).
     *
     * Sistem ini tidak pernah menerima, menyimpan, atau memeriksa kata sandi.
     * Kata sandi tetap di direktori, tempat aturan panjang dan pergantiannya
     * sudah berjalan — dan tempat akun ikut mati pada hari orangnya keluar.
     */
    'oidc' => [
        'aktif'          => false,
        // Alamat penerbit, tanpa /.well-known. Contoh Microsoft Entra ID:
        // https://login.microsoftonline.com/<tenant-id>/v2.0
        'penerbit'       => '',
        'client_id'      => '',
        'client_secret'  => '',
        // Harus sama persis dengan yang didaftarkan di penerbit.
        'alamat_kembali' => 'https://khongguan.example.com/masuk/kembali',
        'scope'          => 'openid email profile',

        /**
         * Membuat akun bagi surel yang belum terdaftar.
         *
         * Dibiarkan mati adalah pilihan yang lebih aman. Akun yang dapat lahir
         * dari dua tempat akan berbeda di dua tempat, dan hak aksesnya perlu
         * diputuskan orang, bukan diterka dari klaim direktori. Bila
         * dinyalakan, akun baru berstatus Menunggu dan belum dapat dipakai
         * sampai administrator menetapkan peran dan pabriknya.
         */
        'buat_akun_otomatis' => false,
        'peran_bawaan'       => 'operator',
    ],
];
