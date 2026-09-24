<?php
declare(strict_types=1);

namespace KG;

/** Bentuk balasan JSON baku. Lihat docs/06-spesifikasi-api.md. */
final class Jawab
{
    /**
     * Cara balasan diakhiri.
     *
     * Bawaannya exit, seperti permintaan HTTP biasa. Pengujian menggantinya
     * dengan penutup yang melempar, supaya beberapa permintaan dapat
     * dijalankan dalam satu proses tanpa mematikannya. Satu sambungan ini
     * lebih jujur daripada pengujian yang memanggil lapisan yang berbeda
     * dari yang dijalankan peladen.
     *
     * @var null|callable(int):void
     */
    public static $penutup = null;

    private static function kepala(int $status): void
    {
        if (PHP_SAPI === 'cli') return;
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
    }

    private static function selesai(int $status): void
    {
        if (self::$penutup !== null) { (self::$penutup)($status); return; }
        exit;
    }

    public static function kirim(mixed $data, int $status = 200): void
    {
        self::kepala($status);
        echo json_encode(['data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        self::selesai($status);
    }

    /** @param array<int,mixed> $data */
    public static function daftar(array $data, int $hal = 1, int $perHal = 50, ?int $total = null): void
    {
        self::kepala(200);
        echo json_encode([
            'data'    => $data,
            'hal'     => $hal,
            'per_hal' => $perHal,
            'total'   => $total ?? count($data),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        self::selesai(200);
    }

    public static function galat(Galat $g): void
    {
        self::kepala($g->status);
        $isi = ['kode' => $g->kode, 'pesan' => $g->getMessage()];
        if ($g->aturan !== null)   $isi['aturan']  = $g->aturan;
        if ($g->rincian !== [])    $isi['rincian'] = $g->rincian;
        echo json_encode(['galat' => $isi], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        self::selesai($g->status);
    }
}
