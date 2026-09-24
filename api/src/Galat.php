<?php
declare(strict_types=1);

namespace KG;

/**
 * Galat yang dikenali API.
 *
 * Penolakan karena aturan bisnis SELALU membawa kode aturannya (AB-xx).
 * Tanpa itu pengguna hanya tahu ditolak, tidak tahu apa yang harus
 * diperbaiki — dan pengembang tidak dapat menelusuri aturan mana yang
 * bekerja (KNF-50).
 */
class Galat extends \RuntimeException
{
    /** @param array<string,mixed> $rincian */
    public function __construct(
        public readonly int $status,
        public readonly string $kode,
        string $pesan,
        public readonly ?string $aturan = null,
        public readonly array $rincian = []
    ) {
        parent::__construct($pesan);
    }

    /** @param array<string,mixed> $rincian */
    public static function aturan(string $aturan, string $pesan, array $rincian = []): self
    {
        return new self(409, 'ATURAN_DILANGGAR', $pesan, $aturan, $rincian);
    }

    /** @param array<string,mixed> $rincian */
    public static function isian(string $pesan, array $rincian = []): self
    {
        return new self(400, 'ISIAN_TIDAK_SAHIH', $pesan, null, $rincian);
    }

    /** Isian sahih tetapi tidak konsisten satu sama lain. */
    public static function takKonsisten(string $aturan, string $pesan, array $rincian = []): self
    {
        return new self(422, 'ISIAN_TAK_KONSISTEN', $pesan, $aturan, $rincian);
    }

    public static function belumMasuk(): self
    {
        return new self(401, 'BELUM_MASUK', 'Sesi tidak ada atau sudah berakhir.');
    }

    public static function takBerwenang(string $pesan = 'Peran Anda tidak berwenang atas tindakan ini.'): self
    {
        return new self(403, 'TAK_BERWENANG', $pesan);
    }

    public static function takAda(string $pesan = 'Catatan tidak ditemukan.'): self
    {
        return new self(404, 'TAK_ADA', $pesan);
    }
}
