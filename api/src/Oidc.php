<?php
declare(strict_types=1);

namespace KG;

/**
 * Masuk lewat direktori perusahaan (OpenID Connect).
 *
 * Sistem ini tidak pernah menerima, menyimpan, atau memeriksa kata sandi.
 * Kata sandi tetap di direktori perusahaan, tempat aturan panjangnya,
 * pergantiannya, dan penguncian akunnya sudah dijalankan — dan tempat akun
 * ikut mati pada hari orangnya keluar. Aplikasi yang menyimpan kata sandinya
 * sendiri akan tertinggal dari kejadian itu.
 *
 * Alur yang dipakai: authorization code + PKCE. PKCE dipakai walaupun ada
 * client secret, karena kode otorisasi yang bocor di log peladen perantara
 * tidak dapat ditukar tanpa verifier yang hanya diketahui peladen ini.
 *
 * Yang diperiksa pada id_token, semuanya wajib:
 *   tanda tangan  terhadap kunci publik penerbit (JWKS)
 *   iss           penerbit yang sama dengan yang dikonfigurasi
 *   aud           berisi client_id kita
 *   exp / iat     belum kedaluwarsa, dengan toleransi jam 60 detik
 *   nonce         sama dengan yang dikirim saat memulai
 *
 * Melewatkan salah satunya berarti menerima token yang dibuat orang lain.
 */
final class Oidc
{
    private const TOLERANSI_JAM = 60;

    public static function aktif(): bool
    {
        $k = Konfigurasi::satu('oidc');
        return is_array($k) && ($k['aktif'] ?? false) === true;
    }

    /** @return array<string,mixed> */
    public static function konfigurasi(): array
    {
        $k = Konfigurasi::satu('oidc');
        if (!is_array($k) || ($k['aktif'] ?? false) !== true) {
            throw Galat::takBerwenang('Masuk lewat direktori perusahaan belum dikonfigurasi.');
        }
        foreach (['penerbit', 'client_id', 'client_secret', 'alamat_kembali'] as $wajib) {
            if (empty($k[$wajib])) {
                throw new \RuntimeException("Konfigurasi oidc.$wajib belum diisi.");
            }
        }
        return $k;
    }

    /**
     * Dokumen penemuan penerbit. Disimpan sementara supaya tidak diambil pada
     * setiap permintaan masuk, tetapi tidak selamanya: penerbit memutar
     * kuncinya, dan simpanan yang tidak pernah kedaluwarsa akan menolak token
     * yang sah beberapa bulan kemudian.
     *
     * @return array<string,mixed>
     */
    public static function penemuan(): array
    {
        $k = self::konfigurasi();
        return self::ambilJson(
            rtrim($k['penerbit'], '/') . '/.well-known/openid-configuration',
            'oidc_penemuan', 3600
        );
    }

    /** @return array<string,mixed> */
    public static function kunci(): array
    {
        $p = self::penemuan();
        if (empty($p['jwks_uri'])) throw new \RuntimeException('Penerbit tidak menyebutkan jwks_uri.');
        return self::ambilJson((string) $p['jwks_uri'], 'oidc_jwks', 3600);
    }

    /**
     * Menyiapkan pengalihan ke halaman masuk penerbit.
     *
     * state dan nonce disimpan di peladen, bukan di kuki penjelajah: kuki yang
     * hilang karena penjelajah lapangan membuka tautan di jendela baru membuat
     * masuk selalu gagal, dan yang paling mungkin dilakukan orang berikutnya
     * adalah mematikan pemeriksaannya.
     *
     * @return array{alamat:string, state:string}
     */
    public static function mulai(?string $tujuan = null): array
    {
        $k = self::konfigurasi();
        $p = self::penemuan();

        $state    = bin2hex(random_bytes(16));
        $nonce    = bin2hex(random_bytes(16));
        $verifier = rtrim(strtr(base64_encode(random_bytes(48)), '+/', '-_'), '=');
        $challenge = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');

        Db::jalankan(
            'INSERT INTO oidc_permintaan (state, nonce, verifier, tujuan, kedaluwarsa)
             VALUES (:s, :n, :v, :t, now() + interval \'10 minutes\')',
            [':s' => $state, ':n' => $nonce, ':v' => $verifier, ':t' => $tujuan]
        );

        $par = [
            'response_type'         => 'code',
            'client_id'             => $k['client_id'],
            'redirect_uri'          => $k['alamat_kembali'],
            'scope'                 => (string) ($k['scope'] ?? 'openid email profile'),
            'state'                 => $state,
            'nonce'                 => $nonce,
            'code_challenge'        => $challenge,
            'code_challenge_method' => 'S256',
        ];
        return [
            'alamat' => $p['authorization_endpoint'] . '?' . http_build_query($par),
            'state'  => $state,
        ];
    }

    /**
     * Menukar kode otorisasi menjadi identitas terverifikasi.
     *
     * @return array<string,mixed> klaim id_token yang sudah diperiksa
     */
    public static function tukar(string $kode, string $state): array
    {
        $k = self::konfigurasi();
        $p = self::penemuan();

        // state dipakai sekali. DELETE ... RETURNING membuat dua permintaan
        // bersamaan dengan state yang sama tidak mungkin dua-duanya berhasil.
        $minta = Db::baris(
            'DELETE FROM oidc_permintaan WHERE state = :s AND kedaluwarsa > now()
             RETURNING nonce, verifier, tujuan',
            [':s' => $state]
        );
        if ($minta === null) {
            throw Galat::takBerwenang('Permintaan masuk tidak dikenali atau sudah kedaluwarsa.');
        }

        $balasan = self::kirimForm((string) $p['token_endpoint'], [
            'grant_type'    => 'authorization_code',
            'code'          => $kode,
            'redirect_uri'  => $k['alamat_kembali'],
            'client_id'     => $k['client_id'],
            'client_secret' => $k['client_secret'],
            'code_verifier' => $minta['verifier'],
        ]);
        if (empty($balasan['id_token'])) {
            throw Galat::takBerwenang('Penerbit tidak mengembalikan id_token.');
        }

        $klaim = self::periksaToken((string) $balasan['id_token'], self::kunci(),
            (string) $k['penerbit'], (string) $k['client_id'], (string) $minta['nonce']);
        $klaim['tujuan'] = $minta['tujuan'];
        return $klaim;
    }

    /**
     * Memeriksa id_token. Dipisahkan supaya dapat diuji tanpa penerbit
     * sungguhan — pemeriksaan yang hanya dapat diuji dengan memanggil pihak
     * ketiga adalah pemeriksaan yang tidak pernah diuji.
     *
     * @param array<string,mixed> $jwks
     * @return array<string,mixed>
     */
    public static function periksaToken(string $token, array $jwks, string $penerbit,
                                        string $clientId, ?string $nonce): array
    {
        $bagian = explode('.', $token);
        if (count($bagian) !== 3) throw Galat::takBerwenang('Bentuk id_token tidak sah.');

        [$kepalaB64, $isiB64, $tandaB64] = $bagian;
        $kepala = json_decode(self::b64($kepalaB64), true);
        $klaim  = json_decode(self::b64($isiB64), true);
        if (!is_array($kepala) || !is_array($klaim)) {
            throw Galat::takBerwenang('Isi id_token tidak dapat dibaca.');
        }

        $alg = (string) ($kepala['alg'] ?? '');
        // "none" dan HMAC ditolak tegas. Penerima yang menerima alg apa pun
        // dari pengirim mempersilakan pengirim memilih cara memverifikasi
        // dirinya sendiri.
        if (!in_array($alg, ['RS256', 'RS384', 'RS512'], true)) {
            throw Galat::takBerwenang("Algoritma tanda tangan '$alg' tidak diterima.");
        }

        $kunci = self::kunciCocok($jwks, $kepala['kid'] ?? null);
        $ok = openssl_verify(
            $kepalaB64 . '.' . $isiB64,
            self::b64($tandaB64),
            $kunci,
            ['RS256' => OPENSSL_ALGO_SHA256, 'RS384' => OPENSSL_ALGO_SHA384,
             'RS512' => OPENSSL_ALGO_SHA512][$alg]
        );
        if ($ok !== 1) throw Galat::takBerwenang('Tanda tangan id_token tidak sah.');

        if (rtrim((string) ($klaim['iss'] ?? ''), '/') !== rtrim($penerbit, '/')) {
            throw Galat::takBerwenang('Penerbit id_token bukan penerbit yang dikonfigurasi.');
        }
        $aud = $klaim['aud'] ?? null;
        $daftarAud = is_array($aud) ? $aud : [$aud];
        if (!in_array($clientId, $daftarAud, true)) {
            throw Galat::takBerwenang('id_token tidak ditujukan untuk aplikasi ini.');
        }
        // azp wajib diperiksa bila audiensnya lebih dari satu; tanpa itu token
        // yang diterbitkan untuk aplikasi lain dapat dipakai di sini.
        if (count($daftarAud) > 1 && ($klaim['azp'] ?? null) !== $clientId) {
            throw Galat::takBerwenang('id_token diterbitkan untuk aplikasi lain.');
        }
        $kini = time();
        if (!isset($klaim['exp']) || (int) $klaim['exp'] + self::TOLERANSI_JAM < $kini) {
            throw Galat::takBerwenang('id_token sudah kedaluwarsa.');
        }
        if (isset($klaim['iat']) && (int) $klaim['iat'] - self::TOLERANSI_JAM > $kini) {
            throw Galat::takBerwenang('id_token diterbitkan di masa depan.');
        }
        if ($nonce !== null && ($klaim['nonce'] ?? null) !== $nonce) {
            throw Galat::takBerwenang('Nonce id_token tidak cocok.');
        }
        if (empty($klaim['email'])) {
            throw Galat::takBerwenang('Direktori tidak mengirimkan alamat surel.');
        }
        // Surel yang belum diverifikasi penerbit tidak boleh menjadi dasar
        // pencocokan akun: siapa pun yang dapat mendaftar dengan surel orang
        // lain akan masuk sebagai orang itu.
        if (array_key_exists('email_verified', $klaim) && $klaim['email_verified'] !== true) {
            throw Galat::takBerwenang('Alamat surel belum diverifikasi direktori.');
        }

        return $klaim;
    }

    /** @param array<string,mixed> $jwks */
    private static function kunciCocok(array $jwks, ?string $kid): \OpenSSLAsymmetricKey
    {
        foreach (($jwks['keys'] ?? []) as $k) {
            if (($k['kty'] ?? '') !== 'RSA') continue;
            if ($kid !== null && ($k['kid'] ?? null) !== $kid) continue;
            $pem = self::rsaKePem((string) $k['n'], (string) $k['e']);
            $kunci = openssl_pkey_get_public($pem);
            if ($kunci !== false) return $kunci;
        }
        throw Galat::takBerwenang('Kunci penanda tangan id_token tidak ditemukan pada JWKS.');
    }

    /** Menyusun kunci publik RSA dari modulus dan eksponen JWKS. */
    private static function rsaKePem(string $n, string $e): string
    {
        $bil = static function (string $b64): string {
            $bin = self::b64($b64);
            if (ord($bin[0]) > 0x7f) $bin = "\x00" . $bin;   // jaga agar tidak terbaca negatif
            return "\x02" . self::panjangDer(strlen($bin)) . $bin;
        };
        $urutan = $bil($n) . $bil($e);
        $rsa    = "\x30" . self::panjangDer(strlen($urutan)) . $urutan;
        $bit    = "\x03" . self::panjangDer(strlen($rsa) + 1) . "\x00" . $rsa;
        $oid    = "\x30\x0d\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x01\x05\x00";
        $luar   = "\x30" . self::panjangDer(strlen($oid) + strlen($bit)) . $oid . $bit;

        return "-----BEGIN PUBLIC KEY-----\n"
            . chunk_split(base64_encode($luar), 64, "\n")
            . "-----END PUBLIC KEY-----\n";
    }

    private static function panjangDer(int $n): string
    {
        if ($n < 0x80) return chr($n);
        $b = ltrim(pack('N', $n), "\x00");
        return chr(0x80 | strlen($b)) . $b;
    }

    public static function b64(string $s): string
    {
        $t = strtr($s, '-_', '+/');
        $sisa = strlen($t) % 4;
        if ($sisa) $t .= str_repeat('=', 4 - $sisa);
        $hasil = base64_decode($t, true);
        if ($hasil === false) throw Galat::takBerwenang('Bagian id_token bukan base64url yang sah.');
        return $hasil;
    }

    /* ── Perjalanan ke penerbit ────────────────────────────────────── */

    /** @return array<string,mixed> */
    private static function ambilJson(string $alamat, string $kunciSimpan, int $umur): array
    {
        $simpan = Db::baris(
            'SELECT isi FROM simpanan WHERE kunci = :k AND kedaluwarsa > now()',
            [':k' => $kunciSimpan . ':' . $alamat]
        );
        if ($simpan !== null) return json_decode((string) $simpan['isi'], true) ?: [];

        $mentah = @file_get_contents($alamat, false, stream_context_create([
            'http' => ['timeout' => 8, 'header' => "Accept: application/json\r\n"],
        ]));
        if ($mentah === false) {
            throw new \RuntimeException("Gagal menghubungi penerbit: $alamat");
        }
        $isi = json_decode($mentah, true);
        if (!is_array($isi)) throw new \RuntimeException("Balasan penerbit bukan JSON: $alamat");

        Db::jalankan(
            'INSERT INTO simpanan (kunci, isi, kedaluwarsa)
             VALUES (:k, :i, now() + make_interval(secs => :u))
             ON CONFLICT (kunci) DO UPDATE SET isi = EXCLUDED.isi, kedaluwarsa = EXCLUDED.kedaluwarsa',
            [':k' => $kunciSimpan . ':' . $alamat, ':i' => $mentah, ':u' => $umur]
        );
        return $isi;
    }

    /**
     * @param array<string,string> $isi
     * @return array<string,mixed>
     */
    private static function kirimForm(string $alamat, array $isi): array
    {
        $mentah = @file_get_contents($alamat, false, stream_context_create([
            'http' => [
                'method'  => 'POST',
                'timeout' => 8,
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\nAccept: application/json\r\n",
                'content' => http_build_query($isi),
                'ignore_errors' => true,
            ],
        ]));
        if ($mentah === false) throw new \RuntimeException('Gagal menukar kode ke penerbit.');
        $hasil = json_decode($mentah, true);
        if (!is_array($hasil)) throw new \RuntimeException('Balasan penukaran kode bukan JSON.');
        if (isset($hasil['error'])) {
            throw Galat::takBerwenang('Penerbit menolak penukaran kode: ' . $hasil['error']);
        }
        return $hasil;
    }
}
