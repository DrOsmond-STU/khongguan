<?php
declare(strict_types=1);

namespace KG;

/**
 * Penyimpanan berkas dan foto.
 *
 * Berkas disimpan di luar docroot dan tidak pernah dilayani peladen web
 * langsung. Satu-satunya jalan mengambilnya adalah lewat endpoint yang
 * memeriksa hak akses, dengan tautan bertanda waktu yang berlaku 15 menit
 * (KNF-25). Foto insiden memuat wajah, luka, dan lokasi kerja; direktori yang
 * dapat ditebak alamatnya membocorkan semuanya tanpa jejak.
 *
 * Nama berkas di disk tidak pernah berasal dari nama yang dikirim pengguna.
 * Nama asli disimpan di basis data untuk ditampilkan, bukan untuk dipakai
 * sebagai jalur.
 */
final class Berkas
{
    /** Hanya jenis yang memang dikirim dari lapangan dan ruang rapat. */
    private const TIPE = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];

    private const UKURAN_MAKS = 12 * 1024 * 1024;   // 12 MB per berkas

    public static function akar(): string
    {
        $jalur = (string) (Konfigurasi::satu('jalur_berkas') ?: sys_get_temp_dir() . '/kg-berkas');
        if (!is_dir($jalur) && !@mkdir($jalur, 0770, true) && !is_dir($jalur)) {
            throw new \RuntimeException("Direktori berkas tidak dapat dibuat: $jalur");
        }
        return rtrim($jalur, '/');
    }

    /**
     * Menyimpan satu berkas dan mengembalikan barisnya.
     *
     * @return array<string,mixed>
     */
    public static function simpan(string $isi, ?string $namaAsli, string $penggunaId): array
    {
        if ($isi === '') throw Galat::isian('Berkas kosong.');
        if (strlen($isi) > self::UKURAN_MAKS) {
            throw Galat::isian('Ukuran berkas melebihi ' . (self::UKURAN_MAKS / 1048576) . ' MB.',
                ['ukuran' => strlen($isi)]);
        }

        // Tipe ditentukan dari ISI berkas, bukan dari nama atau header yang
        // dikirim klien. Keduanya dapat ditulis apa saja oleh pengirim.
        $info = new \finfo(FILEINFO_MIME_TYPE);
        $tipe = (string) $info->buffer($isi);
        if (!isset(self::TIPE[$tipe])) {
            throw Galat::isian("Jenis berkas '$tipe' tidak diterima.",
                ['diterima' => array_keys(self::TIPE)]);
        }

        $kunci = date('Y/m/') . bin2hex(random_bytes(16)) . '.' . self::TIPE[$tipe];
        $tujuan = self::akar() . '/' . $kunci;
        if (!is_dir(dirname($tujuan))) @mkdir(dirname($tujuan), 0770, true);
        if (file_put_contents($tujuan, $isi) === false) {
            throw new \RuntimeException('Berkas gagal ditulis.');
        }
        @chmod($tujuan, 0640);

        $id = (string) Db::nilai(
            'INSERT INTO lampiran (kunci_objek, nama_asli, tipe_media, ukuran, dibuat_oleh)
             VALUES (:k, :n, :t, :u, :o) RETURNING id',
            [':k' => $kunci, ':n' => $namaAsli, ':t' => $tipe, ':u' => strlen($isi), ':o' => $penggunaId]
        );

        return ['id' => $id, 'tipe_media' => $tipe, 'ukuran' => strlen($isi),
                'nama_asli' => $namaAsli];
    }

    /**
     * Menyimpan foto yang dikirim aplikasi lapangan sebagai data URL.
     *
     * @return array<string,mixed>|null
     */
    public static function simpanDataUrl(?string $dataUrl, string $penggunaId): ?array
    {
        if ($dataUrl === null || $dataUrl === '') return null;
        if (!preg_match('~^data:([a-z]+/[a-z0-9.+-]+);base64,~i', $dataUrl, $c)) {
            throw Galat::isian('Foto bukan data URL base64 yang sah.');
        }
        $isi = base64_decode(substr($dataUrl, strlen($c[0])), true);
        if ($isi === false) throw Galat::isian('Foto tidak dapat dibaca.');
        return self::simpan($isi, null, $penggunaId);
    }

    /** Mengaitkan lampiran yatim ke catatan yang baru dibuat. */
    public static function kaitkan(?string $lampiranId, string $tabel, string $indukId): void
    {
        if ($lampiranId === null) return;
        $n = Db::jalankan(
            'UPDATE lampiran SET induk_tabel = :t, induk_id = :i
              WHERE id = :l AND induk_id IS NULL',
            [':t' => $tabel, ':i' => $indukId, ':l' => $lampiranId]
        );
        if ($n === 0) {
            // Lampiran yang sudah terkait catatan lain tidak dipindahkan:
            // satu foto yang berpindah induk membuat dua catatan menunjuk bukti
            // yang sama, dan yang satu kehilangan buktinya tanpa jejak.
            throw Galat::isian('Lampiran tidak ditemukan atau sudah terkait catatan lain.',
                ['lampiran_id' => $lampiranId]);
        }
    }

    /**
     * Tanda tangan tautan unduh, berlaku 15 menit (KNF-25).
     *
     * Ditandatangani dengan rahasia peladen, bukan disimpan di basis data:
     * tautan yang perlu dicari dulu di tabel menjadi mahal pada halaman yang
     * menampilkan dua puluh foto sekaligus.
     */
    public static function tanda(string $lampiranId, string $penggunaId, int $sampai): string
    {
        return hash_hmac('sha256', "$lampiranId|$penggunaId|$sampai", self::rahasia());
    }

    public static function periksaTanda(string $lampiranId, string $penggunaId,
                                        int $sampai, string $tanda): void
    {
        if ($sampai < time()) throw Galat::takBerwenang('Tautan berkas sudah kedaluwarsa.');
        if (!hash_equals(self::tanda($lampiranId, $penggunaId, $sampai), $tanda)) {
            throw Galat::takBerwenang('Tanda tautan berkas tidak sah.');
        }
    }

    private static function rahasia(): string
    {
        $r = (string) (Konfigurasi::satu('rahasia_tanda') ?: '');
        if (strlen($r) < 32) {
            throw new \RuntimeException(
                "Konfigurasi 'rahasia_tanda' belum diisi atau terlalu pendek (minimal 32 aksara).");
        }
        return $r;
    }

    public static function jalur(string $kunciObjek): string
    {
        // Kunci dibangkitkan peladen dan tidak pernah berasal dari pengguna,
        // tetapi diperiksa juga di sini: satu jalur impor yang lalai membuat
        // seluruh berkas peladen terbaca lewat '../'.
        if (str_contains($kunciObjek, '..') || str_starts_with($kunciObjek, '/')) {
            throw Galat::takBerwenang('Kunci berkas tidak sah.');
        }
        return self::akar() . '/' . $kunciObjek;
    }
}
