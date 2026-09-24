<?php
declare(strict_types=1);

/**
 * Pelari uji.
 *
 * Tanpa kerangka pengujian: memanggil API lewat fungsi yang sama dengan yang
 * dipakai peladen, pada basis data uji yang disiapkan ulang setiap kali
 * dijalankan. Yang diuji bukan "apakah tombolnya bekerja", melainkan apakah
 * aturan yang seharusnya menolak benar-benar menolak (docs/11).
 *
 * Jalankan:  php api/uji/jalankan.php
 */

namespace KG\Uji;

use KG\{Db, Galat, Konfigurasi, Permintaan, Sesi};

require __DIR__ . '/../src/muat.php';

date_default_timezone_set('UTC');

// ── Lingkungan uji ─────────────────────────────────────────────────────
putenv('KG_DB_DSN=' . (getenv('KG_UJI_DSN')
    ?: 'pgsql:host=127.0.0.1;port=5433;dbname=kg_safeguard_uji'));
putenv('KG_DB_PENGGUNA=' . (getenv('KG_UJI_PENGGUNA') ?: 'kg'));
putenv('KG_DB_SANDI=' . (getenv('KG_UJI_SANDI') ?: ''));
putenv('KG_DEMO=1');

$lulus = 0;
$gagal = [];
$nomorUji = '';

function uji(string $kode, string $judul, callable $fn): void
{
    global $lulus, $gagal, $nomorUji;
    $nomorUji = $kode;
    try {
        $fn();
        $lulus++;
        echo "  \033[32m✓\033[0m $kode  $judul\n";
    } catch (\Throwable $e) {
        $gagal[] = "$kode $judul — " . $e->getMessage();
        echo "  \033[31m✗\033[0m $kode  $judul\n      " . $e->getMessage() . "\n";
    }
}

function benar(bool $syarat, string $pesan): void
{
    if (!$syarat) throw new \RuntimeException($pesan);
}

function sama(mixed $harap, mixed $dapat, string $pesan): void
{
    if ($harap !== $dapat) {
        throw new \RuntimeException($pesan . ' — diharapkan ' . var_export($harap, true)
            . ', didapat ' . var_export($dapat, true));
    }
}

/**
 * Menjalankan penangan rute dan menangkap balasannya.
 *
 * Jawab::kirim() memanggil exit, jadi pemanggilan dijalankan di proses ini
 * dengan menangkap Galat, dan keberhasilan ditangkap lewat pengecualian
 * khusus yang dilempar pembungkus di bawah.
 *
 * @param array<string,mixed> $badan
 * @return array{status:int, data:mixed, galat:?array}
 */
function panggil(string $metode, string $jalur, array $badan = [], ?string $token = null): array
{
    Sesi::lupakan();
    $kepala = $token === null ? [] : ['authorization' => 'Bearer ' . $token];
    $p = new Permintaan($metode, $jalur, [], $badan === [] ? '' : json_encode($badan), $kepala);

    $r = \KG\rute();
    $cocok = $r->cari($metode, $jalur);
    if ($cocok === null) return ['status' => 404, 'data' => null, 'galat' => ['kode' => 'RUTE_TAK_ADA']];
    [$fn, $par] = $cocok;

    ob_start();
    $status = 200;
    $galat = null;
    try {
        $fn($p, $par);
    } catch (Keluar $k) {
        $status = $k->status;
    } catch (Galat $g) {
        $status = $g->status;
        $galat = ['kode' => $g->kode, 'aturan' => $g->aturan, 'pesan' => $g->getMessage()];
        ob_end_clean();
        return ['status' => $status, 'data' => null, 'galat' => $galat];
    } catch (\PDOException $e) {
        $g = \KG\terjemahkanGalatDb($e);
        ob_end_clean();
        return ['status' => $g->status, 'data' => null,
                'galat' => ['kode' => $g->kode, 'aturan' => $g->aturan, 'pesan' => $g->getMessage()]];
    }
    $keluaran = ob_get_clean();
    $urai = json_decode((string) $keluaran, true);
    return ['status' => $status, 'data' => $urai['data'] ?? null, 'galat' => $urai['galat'] ?? null];
}

/** Dilempar pengganti exit() saat berjalan di dalam pengujian. */
final class Keluar extends \Exception
{
    public function __construct(public readonly int $status) { parent::__construct('keluar'); }
}

require __DIR__ . '/siapkan.php';
require __DIR__ . '/kasus.php';

echo "\n";
if ($gagal === []) {
    echo "\033[32m$lulus uji lulus, tidak ada yang gagal.\033[0m\n";
    exit(0);
}
echo "\033[31m" . count($gagal) . " gagal, $lulus lulus.\033[0m\n";
foreach ($gagal as $g) echo "  · $g\n";
exit(1);
