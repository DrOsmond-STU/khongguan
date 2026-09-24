<?php
declare(strict_types=1);

namespace KG;

use PDO;

/** Sambungan basis data. Satu sambungan per permintaan; tidak ada kolam. */
final class Db
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo === null) {
            $k = Konfigurasi::ambil();
            self::$pdo = new PDO($k['db_dsn'], $k['db_pengguna'], $k['db_sandi'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }
        return self::$pdo;
    }

    /** @param array<string,mixed> $p */
    public static function baris(string $sql, array $p = []): ?array
    {
        $s = self::pdo()->prepare($sql);
        $s->execute($p);
        $r = $s->fetch();
        return $r === false ? null : $r;
    }

    /** @param array<string,mixed> $p @return array<int,array<string,mixed>> */
    public static function semua(string $sql, array $p = []): array
    {
        $s = self::pdo()->prepare($sql);
        $s->execute($p);
        return $s->fetchAll();
    }

    /** @param array<string,mixed> $p */
    public static function jalankan(string $sql, array $p = []): int
    {
        $s = self::pdo()->prepare($sql);
        $s->execute($p);
        return $s->rowCount();
    }

    /** @param array<string,mixed> $p */
    public static function nilai(string $sql, array $p = []): mixed
    {
        $s = self::pdo()->prepare($sql);
        $s->execute($p);
        $v = $s->fetchColumn();
        return $v === false ? null : $v;
    }

    /**
     * Menjalankan $fn di dalam satu transaksi.
     *
     * Seluruh penulisan melewati fungsi ini, termasuk penulisan jejak audit,
     * supaya catatan dan jejaknya tidak pernah terpisah: jejak yang tersimpan
     * tanpa catatannya sama menyesatkannya dengan catatan tanpa jejak.
     */
    public static function transaksi(callable $fn): mixed
    {
        $pdo = self::pdo();
        $sudah = $pdo->inTransaction();
        if (!$sudah) $pdo->beginTransaction();
        try {
            $hasil = $fn();
            if (!$sudah) $pdo->commit();
            return $hasil;
        } catch (\Throwable $e) {
            if (!$sudah && $pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
    }
}
