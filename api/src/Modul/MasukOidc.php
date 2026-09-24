<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Konfigurasi, Oidc, Permintaan, Sesi};

/** Jalur masuk lewat direktori perusahaan. */
final class MasukOidc
{
    /** Menyingkirkan permintaan yang tidak pernah kembali. */
    private static function bersihkan(): void
    {
        Db::jalankan('DELETE FROM oidc_permintaan WHERE kedaluwarsa < now()');
    }

    public static function mulai(Permintaan $p): never
    {
        self::bersihkan();
        $tujuan = $p->isi('tujuan');
        $h = Oidc::mulai(is_string($tujuan) ? $tujuan : null);
        Jawab::kirim(['alamat' => $h['alamat'], 'state' => $h['state']]);
    }

    /**
     * Kembali dari penerbit dengan kode otorisasi.
     *
     * Pencocokan akun memakai surel yang sudah diverifikasi penerbit. Akun
     * tidak dibuat di sini kecuali dinyalakan: akun yang dapat lahir dari dua
     * tempat akan berbeda di dua tempat, dan yang satu tidak pernah ikut mati
     * saat orangnya keluar.
     */
    public static function kembali(Permintaan $p): never
    {
        self::bersihkan();
        $kode  = $p->wajibTeks('code');
        $state = $p->wajibTeks('state');

        $klaim = Oidc::tukar($kode, $state);
        $email = strtolower((string) $klaim['email']);

        $u = Db::baris('SELECT id, nama, status FROM pengguna WHERE lower(email) = :e', [':e' => $email]);

        if ($u === null) {
            $k = Oidc::konfigurasi();
            if (($k['buat_akun_otomatis'] ?? false) !== true) {
                throw Galat::takBerwenang(
                    "Akun $email belum terdaftar pada sistem. Hubungi administrator.");
            }
            $u = self::buatDariKlaim($email, $klaim, (string) ($k['peran_bawaan'] ?? 'operator'));
        }

        // Akun nonaktif ditolak di sini juga, bukan hanya saat membaca sesi:
        // direktori dan sistem ini dapat berbeda pendapat selama beberapa jam,
        // dan yang lebih berhati-hati yang dipakai.
        if ($u['status'] !== 'Aktif') {
            throw Galat::takBerwenang('Akun ini tidak aktif. Hubungi administrator sistem.');
        }

        $jenis = $p->isi('klien') === 'lapangan' ? 'lapangan' : 'meja';
        $token = Sesi::buka($u['id'], $jenis);

        Db::jalankan('UPDATE pengguna SET masuk_terakhir = now() WHERE id = :i', [':i' => $u['id']]);
        Jejak::catat('pengguna', $u['id'], 'masuk', null,
            ['jalur' => 'oidc', 'klien' => $jenis], $u['id']);

        Jawab::kirim(['token' => $token, 'jenis_klien' => $jenis,
                      'nama' => $u['nama'], 'tujuan' => $klaim['tujuan'] ?? null]);
    }

    /**
     * @param array<string,mixed> $klaim
     * @return array<string,mixed>
     */
    private static function buatDariKlaim(string $email, array $klaim, string $peran): array
    {
        $nama = (string) ($klaim['name'] ?? $email);
        $pabrik = Db::nilai('SELECT id FROM pabrik WHERE aktif ORDER BY urutan LIMIT 1');
        if ($pabrik === null) throw new \RuntimeException('Belum ada pabrik terdaftar.');

        $inisial = strtoupper(implode('', array_map(
            static fn (string $b): string => mb_substr($b, 0, 1),
            array_slice(preg_split('/\s+/', trim($nama)) ?: [$nama], 0, 2)
        )));

        $id = (string) Db::nilai(
            'INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status)
             VALUES (:e, :n, :i, :r, :p, :s) RETURNING id',
            [':e' => $email, ':n' => $nama, ':i' => $inisial ?: 'XX', ':r' => $peran,
             ':p' => $pabrik,
             // Peran dan pabrik belum tentu benar; administrator yang
             // menentukannya. Sampai itu terjadi akunnya belum dapat dipakai.
             ':s' => 'Menunggu']
        );
        Jejak::catat('pengguna', $id, 'buat', null,
            ['jalur' => 'oidc', 'email' => $email], $id);

        return ['id' => $id, 'nama' => $nama, 'status' => 'Menunggu'];
    }
}
