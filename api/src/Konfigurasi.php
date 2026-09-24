<?php
declare(strict_types=1);

namespace KG;

/**
 * Konfigurasi dibaca dari berkas config.php di akar api/, atau dari peubah
 * lingkungan. Berkas itu tidak pernah masuk repositori; contohnya ada pada
 * config.contoh.php.
 */
final class Konfigurasi
{
    /** @var array<string,mixed>|null */
    private static ?array $nilai = null;

    /** @return array<string,mixed> */
    public static function ambil(): array
    {
        if (self::$nilai !== null) return self::$nilai;

        $berkas = dirname(__DIR__) . '/config.php';
        $dari_berkas = is_readable($berkas) ? (require $berkas) : [];

        $bawaan = [
            'db_dsn'         => getenv('KG_DB_DSN') ?: 'pgsql:host=127.0.0.1;port=5432;dbname=kg_safeguard',
            'db_pengguna'    => getenv('KG_DB_PENGGUNA') ?: 'kg',
            'db_sandi'       => getenv('KG_DB_SANDI') ?: '',
            'zona_waktu'     => 'Asia/Jakarta',
            'umur_sesi_meja' => 12 * 3600,
            'umur_sesi_lapangan' => 30 * 24 * 3600,
            'ambang_lulus_induksi' => 80,
            // Dipakai hanya pada lingkungan pengembangan dan uji; pada
            // produksi identitas datang dari direktori perusahaan.
            'izinkan_masuk_demo' => (getenv('KG_DEMO') === '1'),
        ];

        return self::$nilai = array_merge($bawaan, is_array($dari_berkas) ? $dari_berkas : []);
    }

    public static function satu(string $kunci): mixed
    {
        return self::ambil()[$kunci] ?? null;
    }
}
