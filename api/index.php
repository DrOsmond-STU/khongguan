<?php
declare(strict_types=1);

/**
 * KG SafeGuard — satu pintu masuk API.
 *
 * Tanpa kerangka dan tanpa tahap build: seluruh berkas dapat dibaca apa
 * adanya, dan pemasangan di peladen bersama tidak menuntut apa pun selain
 * PHP 8.2 ke atas dengan pdo_pgsql.
 */

namespace KG;

require __DIR__ . '/src/muat.php';

date_default_timezone_set('UTC');

$p = Permintaan::dariGlobal();
$r = rute();

try {
    $awalan = '/api/v1';
    $jalur  = str_starts_with($p->jalur, $awalan) ? substr($p->jalur, strlen($awalan)) : $p->jalur;

    $cocok = $r->cari($p->metode, $jalur);
    if ($cocok === null) {
        throw new Galat(404, 'RUTE_TAK_ADA', 'Alamat tidak dikenal: ' . $p->metode . ' ' . $p->jalur);
    }
    [$fn, $par] = $cocok;
    $fn($p, $par);
} catch (Galat $g) {
    Jawab::galat($g);
} catch (\PDOException $e) {
    // Pelanggaran batasan basis data diterjemahkan ke aturan yang
    // bersangkutan, supaya klien menerima kode AB-xx yang sama baik aturan
    // itu ditegakkan aplikasi maupun basis data.
    Jawab::galat(terjemahkanGalatDb($e));
} catch (\Throwable $e) {
    error_log('[KG] ' . $e::class . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    Jawab::galat(new Galat(500, 'GALAT_PELADEN', 'Terjadi kesalahan pada peladen.'));
}
