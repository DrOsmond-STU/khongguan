<?php
declare(strict_types=1);

namespace KG;

/**
 * Penegakan peran dan cakupan pabrik.
 *
 * Seluruh pemeriksaan ada di peladen, bukan di antarmuka (KNF-22).
 * Antarmuka yang menegakkan aturan hanya menyembunyikan tombol, dan tombol
 * yang tersembunyi masih dapat dipanggil.
 */
final class Wewenang
{
    private const URUTAN = ['baca' => 1, 'isi' => 2, 'verifikasi' => 3, 'kelola' => 4];

    /** @return array<int,string> */
    public static function modul(string $peranKode): array
    {
        return array_column(
            Db::semua('SELECT modul FROM peran_modul WHERE peran_kode = :p ORDER BY modul', [':p' => $peranKode]),
            'modul'
        );
    }

    /** @return array<string,string> */
    public static function kewenangan(string $peranKode): array
    {
        $out = [];
        foreach (Db::semua('SELECT modul, wewenang FROM peran_modul WHERE peran_kode = :p', [':p' => $peranKode]) as $r) {
            $out[$r['modul']] = $r['wewenang'];
        }
        return $out;
    }

    /**
     * Memastikan pengguna punya kewenangan minimal $minimal pada $modul.
     *
     * @param array<string,mixed> $pengguna
     */
    public static function wajib(array $pengguna, string $modul, string $minimal = 'baca'): void
    {
        $punya = $pengguna['kewenangan'][$modul] ?? null;
        if ($punya === null) {
            throw Galat::takBerwenang("Modul '$modul' tidak terbuka untuk peran Anda.");
        }
        if (self::URUTAN[$punya] < self::URUTAN[$minimal]) {
            throw Galat::takBerwenang(
                "Tindakan ini memerlukan kewenangan '$minimal' pada modul '$modul'; peran Anda '$punya'."
            );
        }
    }

    /**
     * Memastikan catatan berada dalam cakupan pabrik pengguna.
     *
     * Ditolak dengan 403, bukan dijawab daftar kosong: daftar kosong tidak
     * dapat dibedakan dari "memang tidak ada data" (KNF-23).
     *
     * @param array<string,mixed> $pengguna
     */
    public static function wajibCakupan(array $pengguna, ?string $pabrikId): void
    {
        if ($pabrikId === null) return;
        if ($pengguna['peran_kode'] === 'admin') return;   // admin melintasi pabrik
        if ($pabrikId !== $pengguna['pabrik_id']) {
            throw Galat::takBerwenang('Catatan ini berada di luar cakupan pabrik Anda.');
        }
    }

    /**
     * Potongan SQL penyaring cakupan, dipakai pada daftar.
     *
     * @param array<string,mixed> $pengguna
     * @return array{0:string,1:array<string,mixed>}
     */
    public static function saringCakupan(array $pengguna, string $alias = 't'): array
    {
        if ($pengguna['peran_kode'] === 'admin') return ['TRUE', []];
        return ["$alias.pabrik_id = :cakupan_pabrik", [':cakupan_pabrik' => $pengguna['pabrik_id']]];
    }

    /** Melapor tidak pernah dibatasi peran (AB-12, docs/04). */
    public static function bolehMelapor(): bool
    {
        return true;
    }
}
