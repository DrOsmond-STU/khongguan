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

    // Alamat aplikasi, dipakai pada tautan di dalam surel pemberitahuan.
    'alamat_aplikasi' => 'https://khongguan.example.com',

    /**
     * Penyimpanan berkas dan foto.
     *
     * WAJIB di luar docroot. Foto insiden memuat wajah, luka, dan lokasi
     * kerja; direktori yang dapat ditebak alamatnya membocorkan semuanya
     * tanpa jejak. Satu-satunya jalan mengambilnya adalah lewat endpoint
     * yang memeriksa hak akses.
     */
    'jalur_berkas' => '/home/pengguna/berkas-kg',

    /**
     * Rahasia penanda tautan unduh (minimal 32 aksara acak).
     *
     * Bangkitkan sekali:  php -r "echo bin2hex(random_bytes(32));"
     *
     * Menggantinya membuat seluruh tautan yang sedang beredar berhenti
     * berlaku — itu yang diinginkan bila ia pernah bocor.
     */
    'rahasia_tanda' => '',

    /**
     * Pengiriman surel pemberitahuan.
     *
     * Fungsi mail() PHP sengaja tidak dipakai: pada hosting bersama ia
     * mengirim lewat alamat yang tidak punya SPF dan DKIM domain ini, dan
     * surelnya berakhir di folder sampah — yang berarti pemberitahuan tidak
     * sampai, tanpa ada yang tahu.
     */
    'smtp' => [
        'aktif'    => false,
        'host'     => 'mail.example.com',
        'porta'    => 587,
        'starttls' => true,
        // true bila memakai porta 465 (TLS sejak awal, bukan STARTTLS).
        'tls_langsung' => false,
        'pengguna' => 'qhse@example.com',
        'sandi'    => '',
        'dari'     => 'qhse@example.com',
        'nama_dari' => 'KG SafeGuard',
    ],

    /**
     * Pengiriman WhatsApp lewat penyedia.
     *
     * Berbentuk adaptor HTTP karena penyedia di Indonesia berganti syarat dan
     * harga lebih cepat daripada masa dukungan sistem ini. Nomor penerima
     * diambil dari kolom pengguna.telepon; yang tidak punya nomor dilewati.
     */
    'whatsapp' => [
        'aktif'  => false,
        'alamat' => 'https://penyedia.example.com/kirim',
        'kepala' => ['Authorization: Bearer ganti-dengan-kunci'],
    ],

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
