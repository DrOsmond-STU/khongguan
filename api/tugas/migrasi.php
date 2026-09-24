<?php
declare(strict_types=1);

/**
 * Pelari migrasi.
 *
 * Mencatat berkas yang sudah dijalankan pada tabel migrasi, lalu menjalankan
 * yang belum, berurutan menurut namanya. Aman dijalankan berulang: itulah
 * gunanya. Pemasangan yang menuntut orang mengingat berkas mana yang sudah
 * dijalankan akan salah pada pemasangan kedua, dan salahnya baru ketahuan
 * saat ada kolom yang hilang di tengah pekerjaan.
 *
 *   php api/tugas/migrasi.php            jalankan yang belum
 *   php api/tugas/migrasi.php --daftar   tampilkan saja, tanpa menjalankan
 *   php api/tugas/migrasi.php --contoh   ikut memuat data contoh (007)
 *
 * Data contoh TIDAK dimuat kecuali diminta. Basis data produksi yang berisi
 * data peragaan tidak dapat dibedakan dari yang berisi catatan sungguhan.
 */

require __DIR__ . '/../src/muat.php';

use KG\Db;

$daftarSaja = in_array('--daftar', $argv, true);
$ikutContoh = in_array('--contoh', $argv, true);

Db::pdo()->exec(
    'CREATE TABLE IF NOT EXISTS migrasi (
       berkas       text PRIMARY KEY,
       sidik        text NOT NULL,
       dijalankan   timestamptz NOT NULL DEFAULT now()
     )'
);

$sudah = [];
foreach (Db::semua('SELECT berkas, sidik FROM migrasi') as $b) {
    $sudah[$b['berkas']] = $b['sidik'];
}

$berkas = glob(__DIR__ . '/../migrasi/*.sql') ?: [];
sort($berkas);

$dijalankan = 0;
$galat = 0;

foreach ($berkas as $jalur) {
    $nama = basename($jalur);
    $isi  = (string) file_get_contents($jalur);
    $sidik = hash('sha256', $isi);

    if (str_contains($nama, 'contoh') && !$ikutContoh) {
        echo "  lewati  $nama (data contoh; pakai --contoh bila memang diminta)\n";
        continue;
    }

    if (isset($sudah[$nama])) {
        // Migrasi yang sudah dijalankan lalu disunting adalah cara paling
        // umum dua lingkungan diam-diam berbeda skemanya.
        if ($sudah[$nama] !== $sidik) {
            echo "  BERUBAH $nama — sudah dijalankan, tetapi isinya kini berbeda.\n";
            echo "          Buat berkas migrasi baru; jangan menyunting yang sudah jalan.\n";
            $galat++;
        } else {
            echo "  ada     $nama\n";
        }
        continue;
    }

    if ($daftarSaja) {
        echo "  akan    $nama\n";
        continue;
    }

    try {
        // Setiap berkas sudah membungkus dirinya dengan BEGIN/COMMIT.
        Db::pdo()->exec($isi);
        Db::jalankan('INSERT INTO migrasi (berkas, sidik) VALUES (:b, :s)',
            [':b' => $nama, ':s' => $sidik]);
        echo "  jalan   $nama\n";
        $dijalankan++;
    } catch (\Throwable $e) {
        echo "  GAGAL   $nama — " . $e->getMessage() . "\n";
        $galat++;
        break;   // berhenti di kegagalan pertama; berkas berikutnya bersandar padanya
    }
}

echo $galat === 0
    ? "Migrasi selesai: $dijalankan dijalankan.\n"
    : "Migrasi berhenti dengan $galat masalah.\n";

exit($galat === 0 ? 0 : 1);
