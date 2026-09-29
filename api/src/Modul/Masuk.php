<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Konfigurasi, Permintaan, Sandi, Sesi};

/**
 * Jalur masuk.
 *
 * Dua jalur hidup berdampingan pada tabel pengguna yang sama: kata sandi yang
 * disimpan sistem ini (di bawah), dan direktori perusahaan lewat OIDC
 * (MasukOidc). Jalur demo hanya hidup bila 'izinkan_masuk_demo' dinyalakan —
 * untuk pengembangan dan pengujian, dan dimatikan pada produksi.
 */
final class Masuk
{
    /** POST /sesi/masuk — email dan kata sandi. */
    public static function sandi(Permintaan $p): never
    {
        $email = mb_strtolower(trim((string) $p->isi('email', '')));
        $sandi = (string) $p->isi('sandi', '');
        if ($email === '' || $sandi === '') {
            throw Galat::isian('Email dan kata sandi wajib diisi.');
        }

        Sandi::wajibBelumDibatasi($email, $p->ip);

        $u = Db::baris(
            'SELECT id, nama, status, sandi_hash FROM pengguna WHERE lower(email) = :e',
            [':e' => $email]
        );

        // Satu pesan untuk tiga keadaan: akun tidak ada, belum menyetel sandi,
        // dan sandi salah. Membedakannya berarti memberi tahu siapa pun alamat
        // mana yang terdaftar di sistem K3 ini.
        if (!Sandi::cocok($sandi, $u['sandi_hash'] ?? null)) {
            Sandi::catatPercobaan($email, $p->ip, false);
            throw new Galat(401, 'SANDI_SALAH', 'Email atau kata sandi salah.');
        }

        // Status baru diungkap SETELAH sandinya terbukti benar: orang yang
        // tidak tahu sandinya tidak perlu tahu akun itu ada tapi nonaktif.
        if ($u['status'] !== 'Aktif') {
            Sandi::catatPercobaan($email, $p->ip, false);
            throw Galat::takBerwenang('Akun ini tidak aktif. Hubungi administrator sistem.');
        }

        Sandi::catatPercobaan($email, $p->ip, true);
        if (Sandi::perluHashUlang((string) $u['sandi_hash'])) {
            Db::jalankan('UPDATE pengguna SET sandi_hash = :s WHERE id = :i',
                [':s' => Sandi::hash($sandi), ':i' => $u['id']]);
        }

        $jenis = $p->isi('klien') === 'lapangan' ? 'lapangan' : 'meja';
        Jawab::kirim(['token' => Sesi::buka($u['id'], $jenis), 'jenis_klien' => $jenis]);
    }

    /**
     * POST /sesi/sandi — mengganti sandi sendiri.
     *
     * Sandi lama tetap diminta walau sesinya sah: perangkat yang ditinggal
     * dalam keadaan masuk tidak boleh cukup untuk mengambil alih akun.
     */
    public static function gantiSandi(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $lama = (string) $p->isi('sandi_lama', '');
        $baru = (string) $p->isi('sandi_baru', '');

        $hash = Db::nilai('SELECT sandi_hash FROM pengguna WHERE id = :i', [':i' => $u['id']]);
        if (!Sandi::cocok($lama, is_string($hash) ? $hash : null)) {
            // Dihitung sebagai percobaan gagal: perangkat yang ditinggal dalam
            // keadaan masuk tidak boleh menjadi tempat menebak sandi sepuasnya.
            Sandi::catatPercobaan(mb_strtolower($u['email']), $p->ip, false);
            // 400, bukan 401. Sesinya sah; yang salah isiannya. 401 dibaca
            // seluruh aplikasi sebagai "sesi putus" dan akan mengeluarkan
            // orang yang sekadar salah ketik.
            throw Galat::isian('Kata sandi saat ini tidak cocok.', ['kolom' => 'sandi_lama']);
        }
        if (Sandi::cocok($baru, (string) $hash)) {
            throw Galat::isian('Kata sandi baru harus berbeda dari yang lama.', ['kolom' => 'sandi_baru']);
        }
        Sandi::wajibLayak($baru, $u['email'], $u['nama']);

        Db::transaksi(function () use ($u, $baru, $p) {
            Sandi::setel($u['id'], $baru, Sesi::tokenHash($p));
            Jejak::catat('pengguna', $u['id'], 'ganti_sandi', null, ['sandi' => 'diganti'], $u['id'], $p->ip ?: null);
        });

        Jawab::kirim(['diganti' => true, 'sesi_lain_diakhiri' => true]);
    }

    /**
     * POST /sesi/tautan/periksa — apakah tautan undangan/atur ulang masih
     * berlaku, dan untuk siapa. Dipanggil halaman penyetel sandi sebelum
     * menampilkan formulirnya, supaya orang tidak mengetik sandi baru ke
     * tautan yang ternyata sudah mati.
     */
    public static function tautanPeriksa(Permintaan $p): never
    {
        $t = Sandi::tautanBerlaku((string) $p->isi('token', ''));
        if ($t === null) throw self::tautanMati();
        Jawab::kirim(['nama' => $t['nama'], 'email' => $t['email'], 'jenis' => $t['jenis']]);
    }

    /**
     * POST /sesi/tautan/pakai — menyetel sandi lewat tautan, lalu langsung
     * masuk. Tautan hanya dapat dipakai sekali.
     */
    public static function tautanPakai(Permintaan $p): never
    {
        $token = (string) $p->isi('token', '');
        $sandi = (string) $p->isi('sandi', '');

        $t = Sandi::tautanBerlaku($token);
        if ($t === null) throw self::tautanMati();
        Sandi::wajibLayak($sandi, $t['email'], $t['nama']);

        $sesi = Db::transaksi(function () use ($t, $sandi, $p) {
            // Ditandai terpakai lebih dulu dan diperiksa hasilnya: dua tab yang
            // mengirim tautan yang sama bersamaan hanya boleh berhasil sekali.
            $n = Db::jalankan(
                'UPDATE tautan_sandi SET dipakai_pada = now()
                  WHERE token_hash = :h AND dipakai_pada IS NULL AND kedaluwarsa > now()',
                [':h' => $t['token_hash']]
            );
            if ($n !== 1) throw self::tautanMati();

            Sandi::setel($t['pengguna_id'], $sandi);
            $sebelum = $t['status'];
            if ($sebelum === 'Menunggu') {
                Db::jalankan("UPDATE pengguna SET status = 'Aktif', diubah_pada = now() WHERE id = :i",
                    [':i' => $t['pengguna_id']]);
            }
            Jejak::catat('pengguna', $t['pengguna_id'], 'setel_sandi',
                ['status' => $sebelum], ['status' => 'Aktif', 'sandi' => 'disetel', 'lewat' => $t['jenis']],
                $t['pengguna_id'], $p->ip ?: null);

            return Sesi::buka($t['pengguna_id'], 'meja');
        });

        Jawab::kirim(['token' => $sesi, 'jenis_klien' => 'meja']);
    }

    private static function tautanMati(): Galat
    {
        return new Galat(410, 'TAUTAN_MATI',
            'Tautan ini sudah tidak berlaku — mungkin sudah dipakai, sudah kedaluwarsa, atau sudah '
            . 'diganti tautan yang lebih baru. Minta administrator mengirim tautan baru.');
    }

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
