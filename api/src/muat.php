<?php
declare(strict_types=1);

namespace KG;

/**
 * Pemuat kelas dan daftar rute.
 *
 * Autoloader ditulis sendiri, bukan lewat Composer: satu berkas sepuluh baris
 * lebih mudah dijelaskan kepada tim yang merawat sistem ini tiga tahun lagi
 * daripada rantai pasok yang harus dijaga versinya selama masa dukungan.
 */

spl_autoload_register(static function (string $kelas): void {
    if (!str_starts_with($kelas, 'KG\\')) return;
    $jalur = __DIR__ . '/' . str_replace('\\', '/', substr($kelas, 3)) . '.php';
    if (is_readable($jalur)) require $jalur;
});

function rute(): Rute
{
    $r = new Rute();

    // Sesi
    $r->post('/sesi/masuk-demo', [Modul\Masuk::class, 'demo']);
    $r->post('/sesi/akhiri',     [Modul\Masuk::class, 'akhiri']);
    $r->get('/saya',             [Modul\Saya::class, 'tampil']);
    $r->get('/acuan',            [Modul\Acuan::class, 'tampil']);

    // Modul 04 · Laporan Bahaya
    $r->get('/bahaya',                     [Modul\Bahaya::class, 'daftar']);
    $r->post('/bahaya',                    [Modul\Bahaya::class, 'buat']);
    $r->post('/bahaya/{id}/verifikasi',    [Modul\Bahaya::class, 'verifikasi']);

    // Modul 01 · Incident & Nearmiss
    $r->get('/insiden',              [Modul\Insiden::class, 'daftar']);
    $r->post('/insiden',             [Modul\Insiden::class, 'buat']);
    $r->post('/insiden/{id}/tutup',  [Modul\Insiden::class, 'tutup']);

    // Modul 10 · CAPA
    $r->get('/capa',                    [Modul\Capa::class, 'daftar']);
    $r->post('/capa',                   [Modul\Capa::class, 'buat']);
    $r->post('/capa/{id}/verifikasi',   [Modul\Capa::class, 'verifikasi']);

    // Modul 03 · Work Permit
    $r->get('/izin',                    [Modul\Izin::class, 'daftar']);
    $r->post('/izin',                   [Modul\Izin::class, 'ajukan']);
    $r->post('/izin/{id}/terbitkan',    [Modul\Izin::class, 'terbitkan']);

    // Modul 16 · Observasi APD
    $r->get('/observasi-apd',   [Modul\ObservasiApd::class, 'daftar']);
    $r->post('/observasi-apd',  [Modul\ObservasiApd::class, 'buat']);

    // Modul 06 · Analisis JSA
    $r->get('/jsa',              [Modul\Jsa::class, 'daftar']);
    $r->post('/jsa',             [Modul\Jsa::class, 'buat']);
    $r->post('/jsa/{id}/sahkan', [Modul\Jsa::class, 'sahkan']);

    // Modul 07 · HIRADC K3
    $r->get('/hiradc',                     [Modul\Hiradc::class, 'daftar']);
    $r->post('/hiradc',                    [Modul\Hiradc::class, 'buat']);
    $r->post('/hiradc/{id}/turunkan-sisa', [Modul\Hiradc::class, 'turunkanSisa']);

    // Modul 08 · Induksi K3
    $r->get('/induksi',  [Modul\Induksi::class, 'daftar']);
    $r->post('/induksi', [Modul\Induksi::class, 'buat']);

    // Modul 15 · Observasi perilaku
    $r->get('/observasi',  [Modul\Observasi::class, 'daftar']);
    $r->post('/observasi', [Modul\Observasi::class, 'buat']);

    // Modul 24 · Pengguna
    $r->get('/pengguna', [Modul\Pengguna::class, 'daftar']);

    // Aplikasi lapangan
    $r->post('/lapangan/kirim',   [Modul\Lapangan::class, 'kirim']);
    $r->get('/lapangan/rujukan',  [Modul\Lapangan::class, 'rujukan']);

    return $r;
}

/**
 * Menerjemahkan pelanggaran batasan basis data menjadi galat aturan.
 *
 * Batasan yang sama ditegakkan di dua tempat: aplikasi memberi pesan yang
 * enak dibaca, basis data menjadi jaring terakhir bagi jalur yang terlewat —
 * skrip impor, perbaikan manual, atau modul yang ditulis kemudian.
 */
function terjemahkanGalatDb(\PDOException $e): Galat
{
    $pesan = $e->getMessage();
    $peta = [
        'observasi_apd_patuh_wajar'      => ['AB-07', 'Jumlah patuh tidak boleh melebihi jumlah yang diamati.'],
        'rincian_patuh_wajar'            => ['AB-07', 'Rincian APD: jumlah patuh melebihi jumlah yang diamati.'],
        'capa_bukan_verifikasi_sendiri'  => ['AB-17', 'Penanggung jawab CAPA tidak boleh memverifikasi catatannya sendiri.'],
        'capa_selesai_lengkap'           => ['AB-17', 'CAPA berstatus Selesai wajib punya bukti dan verifikator.'],
        'izin_aktif_butuh_jsa'           => ['AB-09', 'Izin tidak dapat aktif tanpa JSA yang dilampirkan.'],
        'induksi_ambang_lulus'           => ['AB-24', 'Nilai di bawah ambang lulus hanya dapat berstatus Tidak Lulus.'],
        'insiden_anonim_tanpa_pelapor'   => ['AB-04', 'Laporan anonim tidak boleh menyimpan identitas pelapor.'],
        'bahaya_anonim_tanpa_pelapor'    => ['AB-04', 'Laporan anonim tidak boleh menyimpan identitas pelapor.'],
        'jsa_disahkan_lengkap'           => ['AB-09', 'JSA berstatus Disahkan wajib punya pengesah dan tanggal pengesahan.'],
    ];
    foreach ($peta as $batasan => [$aturan, $teks]) {
        if (str_contains($pesan, $batasan)) return Galat::aturan($aturan, $teks, ['batasan' => $batasan]);
    }
    if (str_contains($pesan, 'duplicate key')) {
        return new Galat(409, 'GANDA', 'Catatan dengan penanda yang sama sudah ada.');
    }
    error_log('[KG] PDO: ' . $pesan);
    return new Galat(500, 'GALAT_BASIS_DATA', 'Terjadi kesalahan pada basis data.');
}
