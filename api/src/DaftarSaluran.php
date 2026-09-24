<?php
declare(strict_types=1);

namespace KG;

/** Daftar saluran yang hidup pada pemasangan ini. */
final class DaftarSaluran
{
    /** @var array<int,Saluran>|null */
    private static ?array $daftar = null;

    /** @return array<int,Saluran> */
    public static function aktif(): array
    {
        if (self::$daftar !== null) return self::$daftar;

        $daftar = [];
        $smtp = Konfigurasi::satu('smtp');
        if (is_array($smtp) && ($smtp['aktif'] ?? false) === true) $daftar[] = new SaluranSurel();

        $wa = Konfigurasi::satu('whatsapp');
        if (is_array($wa) && ($wa['aktif'] ?? false) === true) $daftar[] = new SaluranWhatsapp();

        return self::$daftar = $daftar;
    }

    /** Dipakai pengujian. @param array<int,Saluran>|null $daftar */
    public static function paksa(?array $daftar): void
    {
        self::$daftar = $daftar;
    }
}
