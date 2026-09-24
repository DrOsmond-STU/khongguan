<?php
declare(strict_types=1);

namespace KG;

/** Membaca permintaan masuk: jalur, metode, badan JSON, dan parameter. */
final class Permintaan
{
    /** @var array<string,mixed> */
    private array $badan;

    public function __construct(
        public readonly string $metode,
        public readonly string $jalur,
        /** @var array<string,string> */
        public readonly array $kueri = [],
        string $badanMentah = '',
        /** @var array<string,string> */
        public readonly array $kepala = []
    ) {
        $urai = $badanMentah === '' ? [] : json_decode($badanMentah, true);
        $this->badan = is_array($urai) ? $urai : [];
    }

    public static function dariGlobal(): self
    {
        $jalur = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $kepala = [];
        foreach ($_SERVER as $k => $v) {
            if (str_starts_with($k, 'HTTP_')) {
                $kepala[strtolower(str_replace('_', '-', substr($k, 5)))] = (string) $v;
            }
        }
        return new self(
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            $jalur,
            array_map('strval', $_GET),
            file_get_contents('php://input') ?: '',
            $kepala
        );
    }

    public function isi(string $kunci, mixed $bawaan = null): mixed
    {
        return $this->badan[$kunci] ?? $bawaan;
    }

    /** @return array<string,mixed> */
    public function badan(): array
    {
        return $this->badan;
    }

    public function wajib(string $kunci): mixed
    {
        $v = $this->badan[$kunci] ?? null;
        if ($v === null || $v === '' || (is_array($v) && $v === [])) {
            throw Galat::isian("Isian '$kunci' wajib diisi.", ['kolom' => $kunci]);
        }
        return $v;
    }

    public function wajibTeks(string $kunci): string
    {
        $v = $this->wajib($kunci);
        if (!is_string($v)) throw Galat::isian("Isian '$kunci' harus berupa teks.", ['kolom' => $kunci]);
        $v = trim($v);
        if ($v === '') throw Galat::isian("Isian '$kunci' wajib diisi.", ['kolom' => $kunci]);
        return $v;
    }

    public function wajibBulat(string $kunci): int
    {
        $v = $this->wajib($kunci);
        if (!is_int($v) && !(is_string($v) && ctype_digit($v))) {
            throw Galat::isian("Isian '$kunci' harus berupa bilangan bulat.", ['kolom' => $kunci]);
        }
        return (int) $v;
    }

    public function wajibPilihan(string $kunci, array $pilihan): string
    {
        $v = $this->wajibTeks($kunci);
        if (!in_array($v, $pilihan, true)) {
            throw Galat::isian(
                "Isian '$kunci' harus salah satu dari: " . implode(', ', $pilihan) . '.',
                ['kolom' => $kunci, 'pilihan' => $pilihan]
            );
        }
        return $v;
    }

    public function kepala(string $nama): ?string
    {
        return $this->kepala[strtolower($nama)] ?? null;
    }

    public function hal(): int
    {
        return max(1, (int) ($this->kueri['hal'] ?? 1));
    }

    public function perHal(): int
    {
        return min(200, max(1, (int) ($this->kueri['per_hal'] ?? 50)));
    }
}
