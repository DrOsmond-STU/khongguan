<?php
declare(strict_types=1);

namespace KG;

/**
 * Router sederhana. Pola memakai {nama} untuk bagian jalur yang berubah,
 * misalnya '/bahaya/{id}/verifikasi'.
 */
final class Rute
{
    /** @var array<int,array{metode:string,bagian:array<int,string>,fn:callable}> */
    private array $daftar = [];

    public function tambah(string $metode, string $pola, callable $fn): void
    {
        $this->daftar[] = [
            'metode' => $metode,
            'bagian' => array_values(array_filter(explode('/', trim($pola, '/')), fn($x) => $x !== '')),
            'fn'     => $fn,
        ];
    }

    public function get(string $p, callable $f): void    { $this->tambah('GET', $p, $f); }
    public function post(string $p, callable $f): void   { $this->tambah('POST', $p, $f); }
    public function patch(string $p, callable $f): void  { $this->tambah('PATCH', $p, $f); }

    /** @return array{0:callable,1:array<string,string>}|null */
    public function cari(string $metode, string $jalur): ?array
    {
        $bagian = array_values(array_filter(explode('/', trim($jalur, '/')), fn($x) => $x !== ''));
        foreach ($this->daftar as $r) {
            if ($r['metode'] !== $metode || count($r['bagian']) !== count($bagian)) continue;
            $param = [];
            $cocok = true;
            foreach ($r['bagian'] as $i => $p) {
                if (str_starts_with($p, '{') && str_ends_with($p, '}')) {
                    $param[substr($p, 1, -1)] = $bagian[$i];
                } elseif ($p !== $bagian[$i]) {
                    $cocok = false;
                    break;
                }
            }
            if ($cocok) return [$r['fn'], $param];
        }
        return null;
    }
}
