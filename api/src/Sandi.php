<?php
declare(strict_types=1);

namespace KG;

/**
 * Kata sandi dan tautan penyetelnya.
 *
 * Seluruh aturan tentang sandi ada di satu tempat ini: panjang, hash,
 * pencocokan, batas percobaan, dan tautan undangan/pengaturan ulang. Modul
 * yang memakainya tidak perlu tahu bagaimana semua itu bekerja.
 */
final class Sandi
{
    public const PANJANG_MIN = 10;

    /**
     * Batas atas dalam BYTE, bukan aksara. bcrypt diam-diam memotong masukan
     * setelah 72 byte: sandi 80 aksara dan 72 aksara pertamanya akan sama-sama
     * diterima. Menolak lebih jujur daripada memotong diam-diam.
     */
    public const PANJANG_MAKS_BYTE = 72;

    /** Percobaan gagal per akun sebelum dikunci sementara. */
    public const GAGAL_PER_AKUN = 5;

    /** Percobaan gagal per alamat IP sebelum ditahan sementara. */
    public const GAGAL_PER_IP = 20;

    /** Jendela penghitungan percobaan gagal, dalam menit. */
    public const JENDELA_MENIT = 15;

    public const UMUR_UNDANGAN_HARI = 14;
    public const UMUR_ATUR_ULANG_JAM = 24;

    /**
     * Sandi yang langsung ditolak. Bukan daftar lengkap — daftar lengkap ada
     * jutaan baris — melainkan yang paling mungkin dicoba di pabrik ini.
     */
    private const TERLALU_UMUM = [
        'password', 'password1', 'password123', 'passw0rd', '1234567890', '12345678910',
        'qwertyuiop', 'qwerty1234', 'asdfghjkl1', 'iloveyou12', 'abcdefghij',
        'khongguan', 'khongguan1', 'khongguan123', 'khongguan2026', 'khong guan',
        'safeguard', 'safeguard1', 'kgsafeguard', 'semestateknologi',
        'rahasia123', 'bismillah1', 'indonesia1', 'jakarta123', 'cibitung123',
        'demo123456', 'admin12345', 'administrator',
    ];

    /**
     * Hash tiruan untuk pencocokan terhadap akun yang tidak ada.
     *
     * Tanpa ini, "email tidak terdaftar" dijawab seketika sedangkan "sandi
     * salah" dijawab setelah password_verify — dan selisih waktunya cukup
     * untuk menebak alamat mana yang terdaftar.
     */
    private static ?string $tiruan = null;

    public static function hash(string $sandi): string
    {
        return password_hash($sandi, PASSWORD_DEFAULT);
    }

    /** Mencocokkan sandi dengan hash; hash kosong tetap memakan waktu yang sama. */
    public static function cocok(string $sandi, ?string $hash): bool
    {
        if ($hash === null || $hash === '') {
            self::$tiruan ??= password_hash('tiruan-' . bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            password_verify($sandi, self::$tiruan);
            return false;
        }
        return password_verify($sandi, $hash);
    }

    public static function perluHashUlang(string $hash): bool
    {
        return password_needs_rehash($hash, PASSWORD_DEFAULT);
    }

    /**
     * Memeriksa sandi baru. Melempar Galat berisi alasan yang dapat dibaca
     * orang — bukan "sandi tidak memenuhi syarat" yang membuat orang menebak.
     */
    public static function wajibLayak(string $sandi, string $email, string $nama = ''): void
    {
        if (mb_strlen($sandi) < self::PANJANG_MIN) {
            throw Galat::isian('Kata sandi minimal ' . self::PANJANG_MIN . ' aksara.', ['kolom' => 'sandi']);
        }
        if (strlen($sandi) > self::PANJANG_MAKS_BYTE) {
            throw Galat::isian('Kata sandi terlalu panjang; maksimal ' . self::PANJANG_MAKS_BYTE . ' aksara biasa.',
                ['kolom' => 'sandi']);
        }
        $kecil = mb_strtolower($sandi);
        if (in_array($kecil, self::TERLALU_UMUM, true)) {
            throw Galat::isian('Kata sandi ini terlalu umum dan mudah ditebak. Pilih yang lain.', ['kolom' => 'sandi']);
        }
        if (count(array_unique(mb_str_split($sandi))) < 4) {
            throw Galat::isian('Kata sandi terlalu seragam. Pakai campuran aksara yang lebih beragam.', ['kolom' => 'sandi']);
        }
        $lokal = mb_strtolower((string) strstr($email, '@', true));
        if ($lokal !== '' && mb_strlen($lokal) >= 4 && str_contains($kecil, $lokal)) {
            throw Galat::isian('Kata sandi tidak boleh memuat alamat email Anda.', ['kolom' => 'sandi']);
        }
        foreach (preg_split('/\s+/', mb_strtolower($nama)) ?: [] as $bagian) {
            if (mb_strlen($bagian) >= 4 && str_contains($kecil, $bagian)) {
                throw Galat::isian('Kata sandi tidak boleh memuat nama Anda.', ['kolom' => 'sandi']);
            }
        }
    }

    /* ── Batas percobaan ───────────────────────────────────────────── */

    /**
     * Menolak bila akun atau alamat ini sudah terlalu sering gagal.
     *
     * Pesannya sama untuk keduanya dan untuk akun yang tidak ada, supaya batas
     * ini tidak berubah menjadi cara menebak alamat mana yang terdaftar.
     */
    public static function wajibBelumDibatasi(string $email, string $ip): void
    {
        $r = Db::baris(
            "SELECT
               count(*) FILTER (WHERE email = :e)                  AS per_akun,
               count(*) FILTER (WHERE :ip <> '' AND alamat_ip = :ip) AS per_ip
               FROM percobaan_masuk
              WHERE NOT berhasil
                AND waktu > now() - make_interval(mins => :m)
                AND (email = :e OR (:ip <> '' AND alamat_ip = :ip))",
            [':e' => $email, ':ip' => $ip, ':m' => self::JENDELA_MENIT]
        );
        if ((int) $r['per_akun'] >= self::GAGAL_PER_AKUN || (int) $r['per_ip'] >= self::GAGAL_PER_IP) {
            throw new Galat(429, 'TERLALU_SERING',
                'Terlalu banyak percobaan masuk yang gagal. Tunggu ' . self::JENDELA_MENIT
                . ' menit, lalu coba lagi — atau minta administrator mengatur ulang sandi Anda.');
        }
    }

    public static function catatPercobaan(string $email, string $ip, bool $berhasil): void
    {
        Db::jalankan(
            'INSERT INTO percobaan_masuk (email, alamat_ip, berhasil) VALUES (:e, :ip, :b)',
            [':e' => $email, ':ip' => $ip === '' ? null : $ip, ':b' => $berhasil ? 'true' : 'false']
        );
        // Dibersihkan sambil lalu: catatan lebih tua dari 90 hari tidak lagi
        // dipakai untuk batas mana pun.
        if (random_int(1, 50) === 1) {
            Db::jalankan("DELETE FROM percobaan_masuk WHERE waktu < now() - interval '90 days'");
        }
    }

    /* ── Tautan undangan dan pengaturan ulang ──────────────────────── */

    /**
     * Membuat tautan baru untuk seorang pengguna.
     *
     * Tautan lama yang belum dipakai dibatalkan: hanya boleh ada satu tautan
     * yang berlaku, yaitu yang terakhir dibuat. Tautan yang pernah dikirim ke
     * alamat yang salah berhenti berlaku begitu yang baru dibuat.
     *
     * @return array{token:string,alamat:string,jenis:string,kedaluwarsa:string}
     */
    public static function buatTautan(string $penggunaId, string $jenis, ?string $olehId): array
    {
        $token = bin2hex(random_bytes(32));
        $umur  = $jenis === 'undangan'
            ? self::UMUR_UNDANGAN_HARI . ' days'
            : self::UMUR_ATUR_ULANG_JAM . ' hours';

        Db::jalankan(
            'UPDATE tautan_sandi SET kedaluwarsa = now()
              WHERE pengguna_id = :p AND dipakai_pada IS NULL AND kedaluwarsa > now()',
            [':p' => $penggunaId]
        );
        $kedaluwarsa = (string) Db::nilai(
            'INSERT INTO tautan_sandi (token_hash, pengguna_id, jenis, dibuat_oleh, kedaluwarsa)
             VALUES (:h, :p, :j, :o, now() + CAST(:u AS interval))
             RETURNING kedaluwarsa',
            [':h' => hash('sha256', $token), ':p' => $penggunaId, ':j' => $jenis, ':o' => $olehId, ':u' => $umur]
        );

        return [
            'token'       => $token,
            'alamat'      => self::alamatTautan($token),
            'jenis'       => $jenis,
            'kedaluwarsa' => $kedaluwarsa,
        ];
    }

    public static function alamatTautan(string $token): string
    {
        $dasar = rtrim((string) (Konfigurasi::satu('alamat_aplikasi') ?? ''), '/');
        return $dasar . '/#/sandi/' . $token;
    }

    /**
     * Tautan yang masih berlaku, beserta pemiliknya. Null bila tidak ada,
     * kedaluwarsa, atau sudah dipakai — ketiganya dijawab sama.
     *
     * @return array<string,mixed>|null
     */
    public static function tautanBerlaku(string $token): ?array
    {
        if (!preg_match('/^[0-9a-f]{64}$/', $token)) return null;
        return Db::baris(
            "SELECT t.token_hash, t.jenis, t.pengguna_id, u.email, u.nama, u.status
               FROM tautan_sandi t
               JOIN pengguna u ON u.id = t.pengguna_id
              WHERE t.token_hash = :h AND t.dipakai_pada IS NULL AND t.kedaluwarsa > now()
                AND u.status <> 'Nonaktif'",
            [':h' => hash('sha256', $token)]
        );
    }

    /**
     * Menyetel sandi seorang pengguna dan mencabut seluruh sesinya.
     *
     * Setiap pergantian sandi mengakhiri sesi di perangkat lain. Orang yang
     * mengganti sandi karena curiga akunnya dipakai orang lain berhak yakin
     * orang itu langsung terputus — bukan setelah sesinya habis 30 hari lagi.
     */
    public static function setel(string $penggunaId, string $sandi, ?string $kecualiTokenHash = null): void
    {
        Db::jalankan(
            'UPDATE pengguna SET sandi_hash = :s, sandi_diubah = now(), diubah_pada = now() WHERE id = :p',
            [':s' => self::hash($sandi), ':p' => $penggunaId]
        );
        if ($kecualiTokenHash === null) {
            Db::jalankan('DELETE FROM sesi WHERE pengguna_id = :p', [':p' => $penggunaId]);
        } else {
            Db::jalankan('DELETE FROM sesi WHERE pengguna_id = :p AND token_hash <> :h',
                [':p' => $penggunaId, ':h' => $kecualiTokenHash]);
        }
    }
}
