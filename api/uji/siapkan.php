<?php
declare(strict_types=1);

/**
 * Menyiapkan basis data uji: skema dibuat ulang, acuan dimuat, lalu data
 * secukupnya untuk menguji aturan.
 *
 * Dibuat ulang setiap kali dijalankan. Basis data uji yang menumpuk sisa
 * uji sebelumnya membuat kegagalan sulit dibaca — dan lebih buruk, membuat
 * uji lulus karena kebetulan.
 */

namespace KG\Uji;

use KG\{Db, Jawab, Konfigurasi};

// Penutup balasan diganti supaya beberapa permintaan dapat dijalankan dalam
// satu proses. Lihat catatan pada Jawab::$penutup.
Jawab::$penutup = static function (int $status): void { throw new Keluar($status); };

// Penjaga terakhir sebelum DROP SCHEMA. Nama basis data uji wajib berakhiran
// _uji; tanpa penjagaan ini satu salah konfigurasi menghapus basis data
// pengembangan, dan tidak ada yang menyadarinya sampai datanya dicari.
$dsn = (string) Konfigurasi::satu('db_dsn');
if (!preg_match('/dbname=([^;]+)/', $dsn, $c) || !str_ends_with($c[1], '_uji')) {
    fwrite(STDERR, "Uji menolak berjalan: basis data '" . ($c[1] ?? $dsn)
        . "' bukan basis data uji (nama wajib berakhiran _uji).\n");
    exit(1);
}

$pdo = Db::pdo();
$pdo->exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
foreach (['001_skema', '002_acuan', '004_skema_lanjutan', '006_skema_kpi', '008_skema_oidc'] as $berkas) {
    $pdo->exec(file_get_contents(__DIR__ . "/../migrasi/$berkas.sql"));
}

/** @return array<string,mixed> */
function isi(): array
{
    $cbt = (string) Db::nilai("SELECT id FROM pabrik WHERE kode = 'CBT'");
    $smg = (string) Db::nilai("SELECT id FROM pabrik WHERE kode = 'SMG'");
    $areaCbt = (string) Db::nilai('SELECT id FROM area WHERE pabrik_id = :p ORDER BY urutan LIMIT 1', [':p' => $cbt]);
    $areaSmg = (string) Db::nilai('SELECT id FROM area WHERE pabrik_id = :p ORDER BY urutan LIMIT 1', [':p' => $smg]);

    $buatPengguna = function (string $email, string $nama, string $peran, string $pabrik): string {
        return (string) Db::nilai(
            'INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id)
             VALUES (:e, :n, :i, :r, :p) RETURNING id',
            [':e' => $email, ':n' => $nama, ':i' => strtoupper(substr($nama, 0, 2)),
             ':r' => $peran, ':p' => $pabrik]
        );
    };

    $o = [
        'pabrik_cbt' => $cbt,
        'pabrik_smg' => $smg,
        'area_cbt'   => $areaCbt,
        'area_smg'   => $areaSmg,
        'operator'   => $buatPengguna('operator@kg.test',   'Agus Prasetyo',  'operator',   $cbt),
        'qhse'       => $buatPengguna('qhse@kg.test',       'Fadli Saldi',    'qhse',       $cbt),
        'qhse2'      => $buatPengguna('qhse2@kg.test',      'Rina Wulandari', 'qhse',       $cbt),
        'lingkungan' => $buatPengguna('lingkungan@kg.test', 'Yuni Astuti',    'lingkungan', $cbt),
        'manajemen'  => $buatPengguna('manajer@kg.test',    'Hartono Wijaya', 'manajemen',  $cbt),
        'admin'      => $buatPengguna('admin@kg.test',      'Admin Sistem',   'admin',      $cbt),
        'qhse_smg'   => $buatPengguna('qhse.smg@kg.test',   'QHSE Semarang',  'qhse',       $smg),
    ];

    // Kartu induksi: operator berlaku, manajemen kedaluwarsa (untuk AB-11).
    Db::jalankan(
        "INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, tanggal, berlaku, nilai, status)
         VALUES ('IND-2026-0001', :p, 'Agus Prasetyo', :u, 'Pekerja Baru', current_date - 30,
                 current_date + 300, 88, 'Berlaku')",
        [':p' => $cbt, ':u' => $o['operator']]
    );
    Db::jalankan(
        "INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, tanggal, berlaku, nilai, status)
         VALUES ('IND-2025-0009', :p, 'Hartono Wijaya', :u, 'Kontraktor', current_date - 400,
                 current_date - 40, 90, 'Kedaluwarsa')",
        [':p' => $cbt, ':u' => $o['manajemen']]
    );

    // Tiga JSA: disahkan aman, disahkan dengan langkah Ekstrem, dan draf.
    $o['jsa_aman']    = buatJsa($cbt, $areaCbt, 'JSA-2026-001', 'Disahkan', 2, 3, $o['qhse']);
    $o['jsa_ekstrem'] = buatJsa($cbt, $areaCbt, 'JSA-2026-002', 'Disahkan', 4, 4, $o['qhse']);
    $o['jsa_draf']    = buatJsa($cbt, $areaCbt, 'JSA-2026-003', 'Draf',     2, 2, null);

    // Baris HIRADC dengan pengendalian tambahan masih Terbuka (untuk AB-15).
    $o['hiradc_terbuka'] = (string) Db::nilai(
        "INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                             kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                             kendali_tambahan, status)
         VALUES ('HRD-001', :p, 'Produksi', 'Pembersihan oven', 'Non-rutin', 'Fisik',
                 'Permukaan panas', 'Luka bakar', 'Operator', 4, 4, 'Prosedur pendinginan',
                 4, 3, 'Pemasangan pelindung panas', 'Terbuka') RETURNING id",
        [':p' => $cbt]
    );

    // Pencacah didorong melewati nomor bawaan di atas. Tanpa ini nomor
    // pertama yang dibangkitkan API menabrak nomor bawaan, dan uji gagal
    // karena persiapannya, bukan karena kodenya.
    foreach ([['JSA', 2026, 3], ['HRD', 0, 1], ['IND', 2026, 1], ['IND', 2025, 9]] as [$awalan, $tahun, $nilai]) {
        Db::jalankan(
            'INSERT INTO pencacah_nomor (awalan, tahun, nilai) VALUES (:a, :t, :n)
             ON CONFLICT (awalan, tahun) DO UPDATE SET nilai = greatest(pencacah_nomor.nilai, EXCLUDED.nilai)',
            [':a' => $awalan, ':t' => $tahun, ':n' => $nilai]
        );
    }

    return $o;
}

function buatJsa(string $pabrik, string $area, string $nomor, string $status,
                 int $kSisa, int $sSisa, ?string $pengesah): string
{
    $id = (string) Db::nilai(
        'INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, status, pengesah_id, disahkan)
         VALUES (:n, :p, :a, :k, :j, :s, :pg, :tg) RETURNING id',
        [':n' => $nomor, ':p' => $pabrik, ':a' => $area, ':k' => 'Pekerjaan uji ' . $nomor,
         ':j' => 'Non-rutin', ':s' => $status,
         ':pg' => $status === 'Disahkan' ? $pengesah : null,
         ':tg' => $status === 'Disahkan' ? date('Y-m-d') : null]
    );
    Db::jalankan(
        'INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                                  kemungkinan_sisa, keparahan_sisa)
         VALUES (:i, 1, :k, :b, 4, 4, 2, 2)',
        [':i' => $id, ':k' => 'Persiapan', ':b' => 'Terpeleset']
    );
    Db::jalankan(
        'INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                                  kemungkinan_sisa, keparahan_sisa)
         VALUES (:i, 2, :k, :b, 4, 5, :ks, :ss)',
        [':i' => $id, ':k' => 'Pekerjaan utama', ':b' => 'Paparan panas',
         ':ks' => $kSisa, ':ss' => $sSisa]
    );
    return $id;
}

/** Membuka sesi lewat jalur masuk demo, seperti klien sungguhan. */
function masuk(string $email): string
{
    $h = panggil('POST', '/sesi/masuk-demo', ['email' => $email]);
    if (!isset($h['data']['token'])) {
        throw new \RuntimeException("Gagal masuk sebagai $email: " . json_encode($h));
    }
    return $h['data']['token'];
}

$D = isi();
$T = [
    'operator'   => masuk('operator@kg.test'),
    'qhse'       => masuk('qhse@kg.test'),
    'qhse2'      => masuk('qhse2@kg.test'),
    'lingkungan' => masuk('lingkungan@kg.test'),
    'manajemen'  => masuk('manajer@kg.test'),
    'admin'      => masuk('admin@kg.test'),
    'qhse_smg'   => masuk('qhse.smg@kg.test'),
];
