<?php
declare(strict_types=1);

namespace KG;

/**
 * Jejak audit.
 *
 * Hanya INSERT. Hak UPDATE dan DELETE pada tabel jejak_audit dicabut di
 * tingkat basis data, termasuk bagi akun aplikasi (KNF-24) — jadi tidak ada
 * jalur mana pun untuk menyunting jejak, termasuk lewat kode ini.
 */
final class Jejak
{
    /**
     * Jejak unduhan, terpisah dari jejak perubahan.
     *
     * jejak_audit menjawab "apa yang berubah"; ini menjawab "siapa mengambil
     * apa keluar dari sistem". Mencampurnya melemahkan keduanya.
     */
    public static function unduhan(?string $penggunaId, string $ekspor, string $bentuk,
                                   int $baris): void
    {
        Db::jalankan(
            'INSERT INTO jejak_unduhan (pengguna_id, ekspor, bentuk, baris, alamat_ip)
             VALUES (:u, :e, :b, :n, :ip)',
            [':u' => $penggunaId, ':e' => $ekspor, ':b' => $bentuk, ':n' => $baris,
             ':ip' => $_SERVER['REMOTE_ADDR'] ?? null]
        );
    }

    /**
     * @param array<string,mixed>|null $sebelum
     * @param array<string,mixed>|null $sesudah
     */
    public static function catat(
        string $tabel,
        string $barisId,
        string $aksi,
        ?array $sebelum,
        ?array $sesudah,
        ?string $penggunaId,
        ?string $ip = null
    ): void {
        // Hanya kolom yang benar-benar berubah yang disimpan. Menyimpan
        // seluruh baris membuat jejak membengkak dan menyembunyikan
        // perubahan yang penting di antara puluhan kolom yang tidak berubah.
        if ($sebelum !== null && $sesudah !== null) {
            $berubah = [];
            foreach ($sesudah as $k => $v) {
                if (!array_key_exists($k, $sebelum) || $sebelum[$k] !== $v) {
                    $berubah[$k] = $v;
                }
            }
            if ($berubah === []) return;
            $sebelum = array_intersect_key($sebelum, $berubah);
            $sesudah = $berubah;
        }

        Db::jalankan(
            'INSERT INTO jejak_audit (tabel, baris_id, aksi, nilai_sebelum, nilai_sesudah, pengguna_id, alamat_ip)
             VALUES (:t, :b, :a, :s1, :s2, :u, :ip)',
            [
                ':t'  => $tabel,
                ':b'  => $barisId,
                ':a'  => $aksi,
                ':s1' => $sebelum === null ? null : json_encode($sebelum, JSON_UNESCAPED_UNICODE),
                ':s2' => $sesudah === null ? null : json_encode($sesudah, JSON_UNESCAPED_UNICODE),
                ':u'  => $penggunaId,
                ':ip' => $ip,
            ]
        );
    }
}
