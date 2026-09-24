<?php
declare(strict_types=1);

/**
 * Kasus uji aturan bisnis dan hak akses — docs/11-rencana-pengujian.md.
 *
 * Setiap aturan pada docs/03 yang sudah diterapkan wajib punya kasus yang
 * membuktikan PENOLAKANNYA, bukan sekadar membuktikan jalur bahagianya.
 */

namespace KG\Uji;

use KG\{Db, Konfigurasi};

/** @var array<string,mixed> $D */
/** @var array<string,string> $T */

echo "\nAturan bisnis\n";

uji('UJ-01', 'AB-01 · CAPA tanpa sumber ditolak', function () use ($T) {
    $h = panggil('POST', '/capa', ['judul' => 'Tanpa induk', 'pj_id' => '00000000-0000-0000-0000-000000000000',
                                   'tenggat' => date('Y-m-d')], $T['qhse']);
    sama(409, $h['status'], 'status');
    sama('AB-01', $h['galat']['aturan'] ?? null, 'kode aturan');
});

uji('UJ-01b', 'AB-01 · CAPA dengan sumber yang tidak ada ditolak', function () use ($T) {
    $h = panggil('POST', '/capa', [
        'judul' => 'Sumber palsu', 'sumber_jenis' => 'Insiden',
        'sumber_id' => '11111111-1111-1111-1111-111111111111',
        'pj_id' => '00000000-0000-0000-0000-000000000000', 'tenggat' => date('Y-m-d'),
    ], $T['qhse']);
    sama(409, $h['status'], 'status');
    sama('AB-01', $h['galat']['aturan'] ?? null, 'kode aturan');
});

uji('UJ-02', 'AB-03 · kejadian dengan CAPA terbuka tidak dapat ditutup', function () use ($D, $T) {
    $i = panggil('POST', '/insiden', [
        'area_id' => $D['area_cbt'], 'jenis' => 'Incident', 'keparahan' => 'Sedang',
        'ringkas' => 'Tumpahan oli di jalur troli',
    ], $T['qhse']);
    sama(201, $i['status'], 'insiden dibuat');

    $c = panggil('POST', '/capa', [
        'judul' => 'Pasang penampung oli', 'sumber_jenis' => 'Insiden', 'sumber_id' => $i['data']['id'],
        'pj_id' => $D['operator'], 'tenggat' => date('Y-m-d', strtotime('+14 days')),
    ], $T['qhse']);
    sama(201, $c['status'], 'capa dibuat');

    $t = panggil('POST', '/insiden/' . $i['data']['id'] . '/tutup', [], $T['qhse']);
    sama(409, $t['status'], 'status');
    sama('AB-03', $t['galat']['aturan'] ?? null, 'kode aturan');
    benar(str_contains($t['galat']['pesan'], $c['data']['nomor']),
        'pesan menyebut nomor CAPA penahan');
});

uji('UJ-03', 'AB-17 · penanggung jawab tidak dapat memverifikasi CAPA-nya sendiri', function () use ($D, $T) {
    $i = panggil('POST', '/insiden', [
        'area_id' => $D['area_cbt'], 'jenis' => 'Nearmiss', 'keparahan' => 'Ringan',
        'ringkas' => 'Nyaris tersandung selang',
    ], $T['qhse']);
    $c = panggil('POST', '/capa', [
        'judul' => 'Rapikan selang', 'sumber_jenis' => 'Insiden', 'sumber_id' => $i['data']['id'],
        'pj_id' => $D['qhse'], 'tenggat' => date('Y-m-d', strtotime('+7 days')),
    ], $T['qhse']);

    // qhse adalah penanggung jawabnya sendiri
    $v = panggil('POST', '/capa/' . $c['data']['id'] . '/verifikasi', ['bukti' => 'Sudah rapi'], $T['qhse']);
    sama(409, $v['status'], 'status');
    sama('AB-17', $v['galat']['aturan'] ?? null, 'kode aturan');

    // qhse2 boleh memverifikasi
    $v2 = panggil('POST', '/capa/' . $c['data']['id'] . '/verifikasi', ['bukti' => 'Foto lokasi rapi'], $T['qhse2']);
    sama(200, $v2['status'], 'verifikator lain diterima');
});

uji('UJ-04', 'AB-09 · izin dengan JSA berstatus Draf ditolak', function () use ($D, $T) {
    $z = panggil('POST', '/izin', [
        'area_id' => $D['area_cbt'], 'jenis' => 'panas', 'judul' => 'Pengelasan pipa',
        'pengawas' => 'Budi Santoso', 'jsa_id' => $D['jsa_draf'], 'pelaksana_id' => $D['operator'],
    ], $T['qhse']);
    sama(201, $z['status'], 'izin diajukan');

    $t = panggil('POST', '/izin/' . $z['data']['id'] . '/terbitkan', [], $T['qhse']);
    sama(409, $t['status'], 'status');
    sama('AB-09', $t['galat']['aturan'] ?? null, 'kode aturan');
});

uji('UJ-05', 'AB-10 · izin dengan langkah JSA di zona Ekstrem ditolak', function () use ($D, $T) {
    $z = panggil('POST', '/izin', [
        'area_id' => $D['area_cbt'], 'jenis' => 'panas', 'judul' => 'Pekerjaan panas berisiko',
        'pengawas' => 'Budi Santoso', 'jsa_id' => $D['jsa_ekstrem'], 'pelaksana_id' => $D['operator'],
    ], $T['qhse']);
    $t = panggil('POST', '/izin/' . $z['data']['id'] . '/terbitkan', [], $T['qhse']);
    sama(409, $t['status'], 'status');
    sama('AB-10', $t['galat']['aturan'] ?? null, 'kode aturan');
    benar(str_contains($t['galat']['pesan'], 'langkah 2'), 'pesan menyebut langkah penahan');
});

uji('UJ-06', 'AB-11 · izin bagi pemegang kartu induksi kedaluwarsa ditolak', function () use ($D, $T) {
    $z = panggil('POST', '/izin', [
        'area_id' => $D['area_cbt'], 'jenis' => 'panas', 'judul' => 'Pengelasan penyangga',
        'pengawas' => 'Budi Santoso', 'jsa_id' => $D['jsa_aman'],
        'pelaksana' => 'Hartono Wijaya', 'pelaksana_id' => $D['manajemen'],
    ], $T['qhse']);
    $t = panggil('POST', '/izin/' . $z['data']['id'] . '/terbitkan', [], $T['qhse']);
    sama(409, $t['status'], 'status');
    sama('AB-11', $t['galat']['aturan'] ?? null, 'kode aturan');
});

uji('UJ-06c', 'AB-09 · prasyarat yang ditandai merah di layar menutup penerbitan',
    function () use ($D, $T) {
    // Kartu izin memasang tanda silang pada prasyarat yang belum terpenuhi.
    // Bila penerbitan tetap lolos, tanda merah itu kehilangan artinya, dan
    // pengawas belajar mengabaikannya — termasuk saat yang merah adalah uji
    // gas sebelum masuk ruang terbatas.
    $z = panggil('POST', '/izin', [
        'area_id' => $D['area_cbt'], 'jenis' => 'ruang-terbatas', 'judul' => 'Pembersihan tangki',
        'pengawas' => 'Budi Santoso', 'jsa_id' => $D['jsa_aman'],
        'pelaksana' => 'Agus Prasetyo', 'pelaksana_id' => $D['operator'],
        'prasyarat' => [
            ['t' => 'JSEA lengkap', 'ok' => true],
            ['t' => 'Uji gas O2/LEL/H2S', 'ok' => false],
            ['t' => 'Blower 15 menit sebelum masuk', 'ok' => null],
        ],
    ], $T['qhse']);
    $t = panggil('POST', '/izin/' . $z['data']['id'] . '/terbitkan', [], $T['qhse']);
    sama(409, $t['status'], 'status');
    sama('AB-09', $t['galat']['aturan'] ?? null, 'kode aturan');
    benar(str_contains($t['galat']['pesan'], 'Uji gas'), 'pesan menyebut prasyarat yang menahan');

    // Prasyarat yang diperiksa di lokasi (null) tidak boleh ikut menahan:
    // kalau ikut, tidak ada satu izin pun yang dapat terbit dari meja.
    $z2 = panggil('POST', '/izin', [
        'area_id' => $D['area_cbt'], 'jenis' => 'ruang-terbatas', 'judul' => 'Pembersihan tangki lanjutan',
        'pengawas' => 'Budi Santoso', 'jsa_id' => $D['jsa_aman'],
        'pelaksana' => 'Agus Prasetyo', 'pelaksana_id' => $D['operator'],
        'prasyarat' => [
            ['t' => 'JSEA lengkap', 'ok' => true],
            ['t' => 'Blower 15 menit sebelum masuk', 'ok' => null],
        ],
    ], $T['qhse']);
    $t2 = panggil('POST', '/izin/' . $z2['data']['id'] . '/terbitkan', [], $T['qhse']);
    sama(200, $t2['status'], 'izin dengan prasyarat lokasi tetap terbit');
});

uji('UJ-06b', 'AB-09/10/11 · izin yang memenuhi ketiganya terbit', function () use ($D, $T) {
    $z = panggil('POST', '/izin', [
        'area_id' => $D['area_cbt'], 'jenis' => 'panas', 'judul' => 'Pekerjaan panas terkendali',
        'pengawas' => 'Budi Santoso', 'jsa_id' => $D['jsa_aman'],
        'pelaksana' => 'Agus Prasetyo', 'pelaksana_id' => $D['operator'],
    ], $T['qhse']);
    $t = panggil('POST', '/izin/' . $z['data']['id'] . '/terbitkan', [], $T['qhse']);
    sama(200, $t['status'], 'status');
    sama('Aktif', $t['data']['status'], 'izin menjadi aktif');
});

uji('UJ-08', 'AB-15 · skor sisa HIRADC tidak turun saat kendali masih Terbuka', function () use ($D) {
    try {
        \KG\Aturan::sisaHiradcBolehTurun($D['hiradc_terbuka'], 2, 2);
        throw new \RuntimeException('seharusnya ditolak');
    } catch (\KG\Galat $g) {
        sama('AB-15', $g->aturan, 'kode aturan');
    }
    // Menaikkan skor selalu boleh
    \KG\Aturan::sisaHiradcBolehTurun($D['hiradc_terbuka'], 5, 5);
});

uji('UJ-09', 'AB-07 · observasi APD dengan patuh > diamati ditolak', function () use ($D, $T) {
    $h = panggil('POST', '/observasi-apd', [
        'area_id' => $D['area_cbt'], 'diamati' => 14, 'patuh' => 20,
        'catatan' => 'Uji batas kepatuhan',
    ], $T['qhse']);
    sama(422, $h['status'], 'status');
    sama('AB-07', $h['galat']['aturan'] ?? null, 'kode aturan');
});

uji('UJ-09b', 'AB-07 · basis data menolak walau aplikasi dilewati', function () use ($D) {
    try {
        Db::jalankan(
            "INSERT INTO observasi_apd (nomor, pabrik_id, area_id, pengamat_id, tanggal, diamati, patuh, catatan)
             VALUES ('APD-UJI-1', :p, :a, :u, current_date, 10, 11, 'lewat aplikasi')",
            [':p' => $D['pabrik_cbt'], ':a' => $D['area_cbt'], ':u' => $D['qhse']]
        );
        throw new \RuntimeException('basis data seharusnya menolak');
    } catch (\PDOException $e) {
        benar(str_contains($e->getMessage(), 'observasi_apd_patuh_wajar'), 'batasan yang tepat yang menolak');
    }
});

uji('UJ-10', 'AB-06 · tidak ada kolom identitas pekerja yang diamati', function () {
    $kolom = array_column(Db::semua(
        "SELECT column_name FROM information_schema.columns
          WHERE table_name IN ('observasi','observasi_apd','observasi_apd_rincian')"), 'column_name');
    foreach (['pekerja', 'pekerja_id', 'diamati_nama', 'nama_pekerja', 'karyawan_id'] as $terlarang) {
        benar(!in_array($terlarang, $kolom, true), "kolom '$terlarang' tidak boleh ada");
    }
    benar(in_array('pengamat_id', $kolom, true), 'pengamat tetap dicatat');
});

uji('UJ-13', 'AB-24 · induksi di bawah ambang tidak dapat berstatus Berlaku', function () use ($D) {
    try {
        Db::jalankan(
            "INSERT INTO induksi (nomor, pabrik_id, nama, jenis, tanggal, berlaku, nilai, status)
             VALUES ('IND-UJI-1', :p, 'Peserta Uji', 'Tamu', current_date, current_date + 90, 65, 'Berlaku')",
            [':p' => $D['pabrik_cbt']]
        );
        throw new \RuntimeException('seharusnya ditolak');
    } catch (\PDOException $e) {
        benar(str_contains($e->getMessage(), 'induksi_ambang_lulus'), 'batasan ambang yang menolak');
    }
    sama('Tidak Lulus', \KG\Aturan::statusInduksi(65, date('Y-m-d', strtotime('+90 days'))), 'status dihitung');
});

uji('UJ-14', 'AB-16 · umur CAPA dihitung dari terbit, bukan tenggat', function () {
    sama(10, \KG\Aturan::umurCapa(date('Y-m-d', strtotime('-10 days'))), 'umur');
});

uji('UJ-17', 'AB-14 · zona sama untuk skor yang sama di seluruh modul', function () {
    sama('Rendah',  \KG\Aturan::zona(4),  'skor 4');
    sama('Sedang',  \KG\Aturan::zona(9),  'skor 9');
    sama('Tinggi',  \KG\Aturan::zona(12), 'skor 12');
    sama('Ekstrem', \KG\Aturan::zona(15), 'skor 15');
});

uji('UJ-22b', 'AB-22 · regulasi Terpenuhi tanpa bukti ditolak', function () {
    try {
        \KG\Aturan::regulasiBolehTerpenuhi('Terpenuhi', '');
        throw new \RuntimeException('seharusnya ditolak');
    } catch (\KG\Galat $g) {
        sama('AB-22', $g->aturan, 'kode aturan');
    }
    \KG\Aturan::regulasiBolehTerpenuhi('Terpenuhi Sebagian', null);   // tidak menolak
});

uji('UJ-23b', 'AB-23 · masa berlaku induksi menurut jenis peserta', function () {
    $t = '2026-01-15';
    sama('2027-01-15', \KG\Aturan::berlakuInduksi('Pekerja Baru', $t), '12 bulan');
    sama('2026-07-15', \KG\Aturan::berlakuInduksi('Kontraktor', $t),   '6 bulan');
    sama('2026-04-15', \KG\Aturan::berlakuInduksi('Tamu', $t),         '3 bulan');
});

uji('UJ-20', 'AB-02 · kejadian Serius memberi tahu QHSE dan Plant Manager', function () use ($D, $T) {
    $h = panggil('POST', '/insiden', [
        'area_id' => $D['area_cbt'], 'jenis' => 'Accident', 'keparahan' => 'Serius',
        'ringkas' => 'Operator terkena uap panas',
    ], $T['qhse']);
    sama(201, $h['status'], 'status');
    $penerima = $h['data']['pemberitahuan_ke'];
    benar(in_array($D['qhse'], $penerima, true), 'QHSE menerima');
    benar(in_array($D['manajemen'], $penerima, true), 'Plant Manager menerima');
    benar(!in_array($D['qhse_smg'], $penerima, true), 'QHSE pabrik lain tidak ikut');
});

uji('UJ-20b', 'AB-02 · kejadian Ringan tidak memberi tahu siapa pun', function () use ($D, $T) {
    $h = panggil('POST', '/insiden', [
        'area_id' => $D['area_cbt'], 'jenis' => 'Nearmiss', 'keparahan' => 'Ringan',
        'ringkas' => 'Kabel melintang di jalur',
    ], $T['qhse']);
    sama([], $h['data']['pemberitahuan_ke'], 'tidak ada penerima');
});

uji('UJ-04b', 'AB-04 · laporan anonim tidak menyimpan identitas pelapor', function () use ($D, $T) {
    $h = panggil('POST', '/bahaya', [
        'area_id' => $D['area_cbt'], 'isi' => 'Selang APAR bocor di sambungan', 'anonim' => true,
    ], $T['operator']);
    sama(201, $h['status'], 'status');
    $b = Db::baris('SELECT pelapor_id, anonim FROM bahaya WHERE id = :i', [':i' => $h['data']['id']]);
    sama(null, $b['pelapor_id'], 'pelapor tidak disimpan');
    benar($b['anonim'] === true || $b['anonim'] === 't' || $b['anonim'] === 1, 'ditandai anonim');
});

// Matriks docs/04: JSA — Operator Baca, QHSE Isi, Plant Manager Verifikasi.
// Pengesahan karena itu milik Plant Manager, bukan QHSE Supervisor.
uji('UJ-19', 'Pengesahan JSA menuntut kewenangan verifikasi', function () use ($D, $T) {
    $j = panggil('POST', '/jsa', [
        'area_id' => $D['area_cbt'], 'pekerjaan' => 'Uji pengesahan', 'jenis' => 'Non-rutin',
        'langkah' => [['kerja' => 'Langkah', 'bahaya' => 'Bahaya',
                       'kemungkinan' => 2, 'keparahan' => 2,
                       'kemungkinan_sisa' => 1, 'keparahan_sisa' => 2]],
    ], $T['qhse']);
    sama(201, $j['status'], 'QHSE boleh menyusun');

    sama(403, panggil('POST', '/jsa/' . $j['data']['id'] . '/sahkan', [], $T['qhse'])['status'],
        'QHSE tidak boleh mengesahkan');

    $sah = panggil('POST', '/jsa/' . $j['data']['id'] . '/sahkan', [], $T['manajemen']);
    sama(200, $sah['status'], 'Plant Manager boleh mengesahkan');
    sama('Disahkan', $sah['data']['status'], 'status berubah');
});

uji('UJ-19c', 'AB-17 · penyusun JSA tidak dapat mengesahkan susunannya sendiri', function () use ($D, $T) {
    $j = panggil('POST', '/jsa', [
        'area_id' => $D['area_cbt'], 'pekerjaan' => 'Disusun pengesah', 'jenis' => 'Non-rutin',
        'langkah' => [['kerja' => 'Langkah', 'bahaya' => 'Bahaya',
                       'kemungkinan' => 2, 'keparahan' => 2,
                       'kemungkinan_sisa' => 1, 'keparahan_sisa' => 2]],
    ], $T['manajemen']);
    sama(201, $j['status'], 'tersusun');

    $h = panggil('POST', '/jsa/' . $j['data']['id'] . '/sahkan', [], $T['manajemen']);
    sama(409, $h['status'], 'penyusunnya sendiri ditolak');
    sama('AB-17', $h['galat']['aturan'] ?? null, 'kode aturan');
});

uji('UJ-19b', 'JSA tanpa langkah tidak dapat disusun', function () use ($D, $T) {
    $h = panggil('POST', '/jsa', [
        'area_id' => $D['area_cbt'], 'pekerjaan' => 'Tanpa langkah', 'langkah' => [],
    ], $T['qhse']);
    sama(400, $h['status'], 'ditolak');
});

uji('UJ-13b', 'AB-13 · risiko JSA memakai skor tertinggi, bukan rata-rata', function () use ($T) {
    $h = panggil('GET', '/jsa', [], $T['qhse']);
    sama(200, $h['status'], 'daftar terbaca');
    foreach ($h['data'] as $j) {
        if ($j['langkah'] === []) continue;
        $tertinggi = max(array_map(static fn (array $l): int => (int) $l['skor_awal'], $j['langkah']));
        $rata      = array_sum(array_map(static fn (array $l): int => (int) $l['skor_awal'], $j['langkah']))
                     / count($j['langkah']);
        sama($tertinggi, (int) $j['skor'], $j['nomor'] . ' memakai skor tertinggi');
        if ($tertinggi != $rata) {
            benar((int) $j['skor'] !== (int) $rata, $j['nomor'] . ' bukan rata-rata');
        }
    }
});

uji('UJ-34', 'AB-34 · JSA yang seluruh kendalinya APD ditandai, bukan ditolak', function () use ($D, $T) {
    $h = panggil('POST', '/jsa', [
        'area_id' => $D['area_cbt'], 'pekerjaan' => 'Hanya APD', 'jenis' => 'Rutin',
        'langkah' => [['kerja' => 'Kerja', 'bahaya' => 'Bahaya',
                       'kemungkinan' => 3, 'keparahan' => 3, 'kemungkinan_sisa' => 3, 'keparahan_sisa' => 2,
                       'kendali' => [['hierarki' => 'APD', 'teks' => 'Sarung tangan']]]],
    ], $T['qhse']);
    sama(201, $h['status'], 'tetap diterima');

    $d = panggil('GET', '/jsa', [], $T['qhse']);
    $baris = null;
    foreach ($d['data'] as $j) if ($j['nomor'] === $h['data']['nomor']) $baris = $j;
    benar($baris !== null, 'JSA ditemukan pada daftar');
    sama(true, $baris['hanya_apd'], 'ditandai hanya APD');
});

uji('UJ-15b', 'AB-15 · penurunan skor sisa HIRADC lewat API ditolak saat kendali Terbuka',
    function () use ($D, $T) {
        // Yang menilai (QHSE) bukan yang menyetujui penurunannya; matriks
        // docs/04 memberi kewenangan verifikasi kepada Plant Manager.
        sama(403, panggil('POST', '/hiradc/' . $D['hiradc_terbuka'] . '/turunkan-sisa',
            ['kemungkinan_sisa' => 1, 'keparahan_sisa' => 1], $T['qhse'])['status'],
            'QHSE tidak boleh menurunkan sendiri');

        $h = panggil('POST', '/hiradc/' . $D['hiradc_terbuka'] . '/turunkan-sisa',
            ['kemungkinan_sisa' => 1, 'keparahan_sisa' => 1], $T['manajemen']);
        sama(409, $h['status'], 'ditolak selama kendali masih Terbuka');
        sama('AB-15', $h['galat']['aturan'] ?? null, 'kode aturan');
    });

uji('UJ-14b', 'HIRADC dengan skor sisa di atas skor awal ditolak', function () use ($T) {
    $h = panggil('POST', '/hiradc', [
        'proses' => 'Uji', 'aktivitas' => 'Uji', 'bahaya' => 'Uji', 'risiko' => 'Uji', 'korban' => 'Uji',
        'kemungkinan' => 2, 'keparahan' => 2, 'kemungkinan_sisa' => 4, 'keparahan_sisa' => 4,
    ], $T['qhse']);
    sama(400, $h['status'], 'ditolak');
});

uji('UJ-24b', 'AB-23/24 · masa berlaku dan status induksi dihitung peladen', function () use ($T) {
    $lulus = panggil('POST', '/induksi', [
        'nama' => 'Peserta Lulus', 'jenis' => 'Kontraktor', 'tanggal' => date('Y-m-d'), 'nilai' => 85,
    ], $T['qhse']);
    sama(201, $lulus['status'], 'tersimpan');
    sama('Berlaku', $lulus['data']['status'], 'status dihitung');
    sama(date('Y-m-d', strtotime('+6 months')), $lulus['data']['berlaku'], 'kontraktor 6 bulan');

    // Nilai di bawah ambang: tidak ada kartu sama sekali, bukan kartu yang
    // kebetulan sudah lewat.
    $gagal = panggil('POST', '/induksi', [
        'nama' => 'Peserta Gagal', 'jenis' => 'Pekerja Baru', 'tanggal' => date('Y-m-d'), 'nilai' => 70,
    ], $T['qhse']);
    sama(201, $gagal['status'], 'tersimpan');
    sama('Tidak Lulus', $gagal['data']['status'], 'status Tidak Lulus');
    sama(null, $gagal['data']['berlaku'], 'tanpa masa berlaku');
});

uji('UJ-24c', 'Masa berlaku wajib ada selain bagi yang tidak lulus', function () use ($D) {
    try {
        Db::jalankan(
            "INSERT INTO induksi (nomor, pabrik_id, nama, jenis, tanggal, berlaku, status)
             VALUES ('IND-TANPA-BERLAKU', :p, 'Tanpa kartu', 'Tamu', current_date, NULL, 'Berlaku')",
            [':p' => $D['pabrik_cbt']]
        );
        throw new \RuntimeException('basis data seharusnya menolak kartu Berlaku tanpa masa berlaku');
    } catch (\PDOException $e) {
        benar(str_contains($e->getMessage(), 'induksi_berlaku_wajib'), 'ditolak basis data');
    }
});

uji('UJ-07b', 'AB-06 · observasi perilaku tidak punya kolom identitas pekerja', function () {
    $kolom = array_column(
        Db::semua("SELECT column_name FROM information_schema.columns
                    WHERE table_name = 'observasi'"), 'column_name');
    foreach (['pekerja', 'pekerja_id', 'nama_pekerja', 'yang_diamati'] as $terlarang) {
        benar(!in_array($terlarang, $kolom, true), "tidak ada kolom '$terlarang'");
    }
});

uji('UJ-07c', 'Observasi tanpa satu pun pengamatan ditolak', function () use ($D, $T) {
    $h = panggil('POST', '/observasi', [
        'area_id' => $D['area_cbt'], 'kategori' => 'Kepatuhan Prosedur',
        'catatan' => 'Tidak mengamati apa pun', 'aman' => 0, 'berisiko' => 0,
    ], $T['qhse']);
    sama(400, $h['status'], 'ditolak');
});

uji('UJ-08', 'AB-08 · satu butir Tidak Sesuai mengunci unit dari operasi', function () use ($D, $T) {
    $unit = (string) Db::nilai(
        "INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
         VALUES (:p, 'UNIT-UJI-01', 'Forklift uji', 'Kendaraan & alat angkat') RETURNING id",
        [':p' => $D['pabrik_cbt']]
    );
    sama('Layak', Db::nilai('SELECT status FROM unit_periksa WHERE id = :i', [':i' => $unit]),
        'unit mula-mula layak');

    $h = panggil('POST', '/checklist', [
        'nama' => 'P2H Forklift uji', 'frekuensi' => 'Setiap shift', 'unit_id' => $unit,
        'butir' => [
            ['butir' => 'Rem berfungsi', 'jawab' => 'Sesuai'],
            ['butir' => 'Rantai angkat dilumasi', 'jawab' => 'Tidak Sesuai',
             'catatan' => 'Kering dan berkarat ringan'],
        ],
    ], $T['operator']);
    sama(201, $h['status'], 'checklist tersimpan');
    sama(1, $h['data']['temuan'], 'satu temuan');

    // Gerbang operasi, bukan peringatan: penguncian terjadi seketika dan
    // terlihat pada unitnya, bukan hanya di dalam checklist.
    sama('Terkunci', Db::nilai('SELECT status FROM unit_periksa WHERE id = :i', [':i' => $unit]),
        'unit terkunci');
    sama('Terkunci', $h['data']['unit']['status'], 'pengisi diberi tahu seketika');
});

uji('UJ-08b', 'AB-08 · penguncian tetap terjadi walau aplikasi dilewati', function () use ($D) {
    $unit = (string) Db::nilai(
        "INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
         VALUES (:p, 'UNIT-UJI-02', 'Panel uji', 'Fasilitas') RETURNING id",
        [':p' => $D['pabrik_cbt']]
    );
    $cl = (string) Db::nilai(
        "INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, unit_id, tanggal, status)
         VALUES ('CHK-UJI-LANGSUNG', :p, 'Langsung ke tabel', 'Harian', :u, current_date, 'Selesai')
         RETURNING id",
        [':p' => $D['pabrik_cbt'], ':u' => $unit]
    );
    Db::jalankan(
        "INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab)
         VALUES (:c, 1, 'Ditulis langsung tanpa lewat API', 'Tidak Sesuai')", [':c' => $cl]
    );
    sama('Terkunci', Db::nilai('SELECT status FROM unit_periksa WHERE id = :i', [':i' => $unit]),
        'pemicu basis data mengunci');
});

uji('UJ-18', 'AB-18 · audit dengan temuan Major tanpa CAPA tidak dapat ditutup',
    function () use ($D, $T) {
        $a = (string) Db::nilai(
            "INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai, status)
             VALUES ('AUD-UJI-001', :p, 'ISO 45001:2018', 'Uji', 'Tim Internal', current_date, 'Dalam Proses')
             RETURNING id", [':p' => $D['pabrik_cbt']]
        );
        $t = panggil('POST', "/audit/$a/temuan", [
            'klausul' => 'Elemen 6.5', 'kategori' => 'Major', 'isi' => 'Temuan uji',
        ], $T['qhse']);
        sama(201, $t['status'], 'temuan tercatat');

        $tutup = panggil('POST', "/audit/$a/tutup", [], $T['admin']);
        sama(409, $tutup['status'], 'penutupan ditolak');
        sama('AB-18', $tutup['galat']['aturan'] ?? null, 'kode aturan');

        // Temuan Observasi tidak menahan penutupan: ia catatan perbaikan,
        // bukan ketidaksesuaian.
        Db::jalankan("UPDATE temuan_audit SET kategori = 'Observasi' WHERE id = :i",
            [':i' => $t['data']['id']]);
        sama(200, panggil('POST', "/audit/$a/tutup", [], $T['admin'])['status'],
            'temuan Observasi tidak menahan');
    });

uji('UJ-18b', 'Audit yang sudah ditutup tidak menerima temuan baru', function () use ($D, $T) {
    $a = (string) Db::nilai(
        "INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai, selesai,
                            status, ditutup_pada)
         VALUES ('AUD-UJI-002', :p, 'ISO 14001:2015', 'Uji', 'Tim Internal',
                 current_date, current_date, 'Selesai', now()) RETURNING id",
        [':p' => $D['pabrik_cbt']]
    );
    $h = panggil('POST', "/audit/$a/temuan",
        ['klausul' => 'X', 'kategori' => 'Minor', 'isi' => 'Terlambat'], $T['qhse']);
    sama(400, $h['status'], 'ditolak');
});

uji('UJ-20c', 'AB-20 · dokumen internal Berlaku tanpa tanggal tinjau ditolak', function () use ($T) {
    $h = panggil('POST', '/dokumen/internal', [
        'kode' => 'KGP-UJI-01', 'level' => 3, 'jenis' => 'Prosedur',
        'judul' => 'Prosedur uji tanpa tinjau', 'status' => 'Berlaku',
    ], $T['qhse']);
    sama(409, $h['status'], 'ditolak');
    sama('AB-20', $h['galat']['aturan'] ?? null, 'kode aturan');
});

uji('UJ-20d', 'AB-20 · basis data menolak walau aplikasi dilewati', function () use ($D) {
    try {
        Db::jalankan(
            "INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, terbit,
                                           tinjau, pemilik, status)
             VALUES ('KGP-UJI-02', :p, 3, 'Prosedur', 'Langsung ke tabel', current_date,
                     NULL, 'QHSE', 'Berlaku')", [':p' => $D['pabrik_cbt']]
        );
        throw new \RuntimeException('basis data seharusnya menolak');
    } catch (\PDOException $e) {
        benar(str_contains($e->getMessage(), 'dokumen_berlaku_punya_tinjau'), 'ditolak basis data');
    }
});

uji('UJ-21c', 'AB-21 · dokumen eksternal diurutkan menurut sisa masa berlaku', function () use ($T) {
    $h = panggil('GET', '/dokumen/eksternal', [], $T['qhse']);
    sama(200, $h['status'], 'terbaca');
    $sisa = array_map(static fn (array $d): int => (int) $d['sisa'], $h['data']);
    $urut = $sisa;
    sort($urut);
    sama($urut, $sisa, 'menaik menurut sisa, bukan abjad');
});

uji('UJ-22d', 'AB-22 · regulasi Terpenuhi tanpa bukti ditolak lewat API', function () use ($T) {
    $isi = [
        'kode' => 'REG-UJI-01', 'nomor' => 'UU No. 0 Tahun 2026', 'judul' => 'Peraturan uji',
        'penerbit' => 'Pemerintah RI', 'bidang' => 'K3 Umum', 'pasal' => 'Pasal 1',
        'penerapan' => 'Sudah diterapkan seluruhnya, sungguh.', 'status' => 'Terpenuhi',
    ];
    $h = panggil('POST', '/regulasi', $isi, $T['qhse']);
    sama(409, $h['status'], 'ditolak tanpa bukti');
    sama('AB-22', $h['galat']['aturan'] ?? null, 'kode aturan');

    $isi['bukti'] = 'KGK-02 Kebijakan, notulen rapat P2K3 12 Sep 2026';
    sama(201, panggil('POST', '/regulasi', $isi, $T['qhse'])['status'], 'diterima dengan bukti');
});

uji('UJ-25', 'AB-25 · jam pelatihan dihitung dari kegiatan, bukan diisi manual',
    function () use ($D, $T) {
        $awal = panggil('GET', '/kegiatan/jam-pelatihan', [], $T['qhse'])['data']['jam_pelatihan'];

        sama(201, panggil('POST', '/kegiatan', [
            'jenis' => 'Safety Talk', 'judul' => 'Kegiatan uji', 'peserta' => 20,
            'durasi_jam' => 1.5, 'area_id' => $D['area_cbt'], 'tanggal' => date('Y-m-d'),
        ], $T['qhse'])['status'], 'kegiatan tercatat');

        $akhir = panggil('GET', '/kegiatan/jam-pelatihan', [], $T['qhse'])['data'];
        sama(round($awal + 30, 2), round($akhir['jam_pelatihan'], 2), '20 peserta × 1,5 jam = 30 jam');
        benar(str_contains($akhir['sumber'], 'AB-25'), 'sumbernya disebutkan');
    });

uji('UJ-30', 'AB-30 · pemberitahuan hanya untuk tiga sebab', function () use ($D) {
    try {
        Db::jalankan(
            "INSERT INTO notifikasi (pabrik_id, jenis, modul, judul, isi, sebab, aksi)
             VALUES (:p, 'info', 'Uji', 'Status berubah', 'Sekadar memberi tahu',
                     'perubahan_status', 'incident')", [':p' => $D['pabrik_cbt']]
        );
        throw new \RuntimeException('sebab di luar tiga yang diizinkan seharusnya ditolak');
    } catch (\PDOException $e) {
        benar(str_contains($e->getMessage(), 'notifikasi_sebab_check')
              || str_contains($e->getMessage(), 'sebab'), 'ditolak basis data');
    }
});

uji('UJ-31b', 'AB-31 · menandai terbaca tidak menutup pengingat', function () use ($D, $T) {
    $n = (string) Db::nilai(
        "INSERT INTO notifikasi (pabrik_id, jenis, modul, judul, isi, sebab, aksi)
         VALUES (:p, 'critical', 'CAPA', 'CAPA-UJI terlambat 3 hari', 'Tenggat terlewat.',
                 'lewat_tenggat', 'capa') RETURNING id", [':p' => $D['pabrik_cbt']]
    );
    $h = panggil('POST', "/notifikasi/$n/terbaca", [], $T['qhse']);
    sama(200, $h['status'], 'ditandai terbaca');
    sama(true, $h['data']['baca'], 'terbaca');
    sama(false, $h['data']['selesai'], 'tidak ikut tertutup');

    benar(Db::nilai('SELECT selesai_pada IS NULL FROM notifikasi WHERE id = :i', [':i' => $n]) === true,
        'masih akan dikirim ulang sampai ditutup di modulnya');

    // Masih muncul pada kotak masuk: yang menyaring adalah selesai_pada.
    $daftar = panggil('GET', '/notifikasi', [], $T['qhse'])['data'];
    benar(in_array($n, array_column($daftar, 'id'), true), 'masih ada di kotak masuk');
});

uji('UJ-16b', 'Ringkasan inspeksi dihitung dari butirnya, tidak disimpan', function () use ($T) {
    $h = panggil('POST', '/inspeksi', [
        'jenis' => 'APAR & Hydrant', 'area' => 'Seluruh area produksi', 'jadwal' => 'Bulanan',
        'butir' => [
            ['butir' => 'Tekanan manometer hijau', 'jawab' => 'Sesuai'],
            ['butir' => 'Segel utuh', 'jawab' => 'Tidak Sesuai'],
            ['butir' => 'Kartu inspeksi terisi'],
        ],
    ], $T['qhse']);
    sama(201, $h['status'], 'tersimpan');

    $baris = null;
    foreach (panggil('GET', '/inspeksi', [], $T['qhse'])['data'] as $r) {
        if ($r['nomor'] === $h['data']['nomor']) $baris = $r;
    }
    benar($baris !== null, 'ditemukan pada daftar');
    sama(3, (int) $baris['butir'], 'tiga butir');
    sama(2, (int) $baris['selesai'], 'dua terjawab');
    sama(1, (int) $baris['temuan'], 'satu temuan');
});

uji('UJ-26b', 'AB-26 · lagging dan leading tidak pernah satu deret', function () use ($D, $T) {
    Db::jalankan(
        "INSERT INTO jam_kerja_bulanan (pabrik_id, periode, jam_kerja, pekerja)
         VALUES (:p, date_trunc('month', current_date)::date, 200000, 400)",
        [':p' => $D['pabrik_cbt']]
    );
    $h = panggil('GET', '/kpi', [], $T['qhse']);
    sama(200, $h['status'], 'terbaca');
    benar(isset($h['data']['lagging'], $h['data']['leading']), 'dua deret terpisah');

    $kode = static fn (array $d): array => array_column($d, 'kode');
    sama([], array_intersect($kode($h['data']['lagging']), $kode($h['data']['leading'])),
        'tidak ada indikator yang muncul di keduanya');
});

uji('UJ-27c', 'AB-27 · setiap angka KPI membawa rumusnya', function () use ($T) {
    $h = panggil('GET', '/kpi', [], $T['qhse']);
    foreach (array_merge($h['data']['lagging'], $h['data']['leading']) as $k) {
        benar(is_string($k['rumus']) && $k['rumus'] !== '', $k['nama'] . ' punya rumus');
    }
});

uji('UJ-19d', 'AB-19 · setiap angka KPI punya pembanding', function () use ($T) {
    $h = panggil('GET', '/kpi', [], $T['qhse']);
    foreach (array_merge($h['data']['lagging'], $h['data']['leading']) as $k) {
        // Pembanding boleh berupa periode sebelumnya, target, atau catatan
        // yang menyebut akumulasi. Yang tidak boleh adalah angka telanjang.
        benar($k['sebelum'] !== null || $k['target'] !== null || $k['catatan'] !== null,
            $k['nama'] . ' punya pembanding');
    }
});

uji('UJ-27d', 'TRIR dan LTIFR memakai rumus yang disepakati', function () {
    // (TRC × 200.000) ÷ jam kerja
    sama(2.0,  \KG\Kpi::trir(10, 1000000), 'TRIR');
    sama(10.0, \KG\Kpi::ltifr(10, 1000000), 'LTIFR');
    // Jam kerja nol berarti belum dicatat, bukan nol kejadian.
    sama(null, \KG\Kpi::trir(3, 0), 'tanpa jam kerja hasilnya kosong, bukan nol');
});

uji('UJ-26c', 'Angka rekaman dan angka rekap tidak dibandingkan diam-diam',
    function () use ($D, $T) {
        // Bulan lalu hanya punya rekap; bulan ini punya catatan sungguhan.
        Db::jalankan(
            "INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
             VALUES (:p, (date_trunc('month', current_date) - interval '1 month')::date,
                     5, 4, 1, 3, 90)", [':p' => $D['pabrik_cbt']]
        );
        panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Untuk KPI'], $T['qhse']);

        $h = panggil('GET', '/kpi', [], $T['qhse']);
        sama('rekaman',    $h['data']['sumber'], 'bulan ini dari catatan');
        sama('rekap_awal', $h['data']['sumber_sebelum'], 'bulan lalu dari rekap');

        $bahaya = null;
        foreach ($h['data']['leading'] as $k) if ($k['kode'] === 'bahaya') $bahaya = $k;
        benar($bahaya !== null, 'indikator laporan bahaya ada');
        sama(false, $bahaya['banding_setara'], 'perbandingan ditandai tidak setara');
        sama('flat', $bahaya['arah'], 'arah tidak disimpulkan dari sumber berbeda');
    });

uji('UJ-28', 'AB-28 · angka grup tidak menutupi pabrik', function () use ($D, $T) {
    $h = panggil('GET', '/eksekutif', [], $T['admin']);
    sama(200, $h['status'], 'terbaca');
    benar(isset($h['data']['grup'], $h['data']['pabrik']), 'grup dan pabrik dikembalikan bersama');
    benar(count($h['data']['pabrik']) > 1, 'kartu per pabrik ada');

    // Status grup mengikuti pabrik terburuk, bukan rata-ratanya.
    $peringkat = ['Baik' => 0, 'Perhatian' => 1, 'Kritis' => 2];
    $terburuk = 'Baik';
    foreach ($h['data']['pabrik'] as $p) {
        if ($peringkat[$p['status']] > $peringkat[$terburuk]) $terburuk = $p['status'];
    }
    sama($terburuk, $h['data']['grup']['status'], 'status grup = pabrik terburuk');
});

uji('UJ-28d', 'Pabrik tanpa catatan tidak dilaporkan Baik', function () use ($T) {
    $h = panggil('GET', '/eksekutif', [], $T['admin']);
    foreach ($h['data']['pabrik'] as $p) {
        if ($p['tanpa_data'] === true) {
            // TRIR nol di pabrik yang tidak mencatat apa pun bukan kabar baik.
            benar($p['status'] !== 'Baik', $p['nama'] . ' tidak dilaporkan Baik');
            sama('Tanpa catatan', $p['penentu'], $p['nama'] . ' menyebut sebabnya');
        }
    }
});

uji('UJ-28e', 'Dashboard eksekutif tertutup bagi peran yang tidak berhak', function () use ($T) {
    foreach (['qhse', 'operator', 'lingkungan'] as $peran) {
        sama(403, panggil('GET', '/eksekutif', [], $T[$peran])['status'], "peran $peran ditolak");
    }
    sama(200, panggil('GET', '/eksekutif', [], $T['manajemen'])['status'], 'Plant Manager diterima');
});

uji('UJ-25b', 'Tren 12 bulan menyebut sumber tiap titik', function () use ($T) {
    $h = panggil('GET', '/kpi/tren', [], $T['qhse']);
    sama(200, $h['status'], 'terbaca');
    sama(12, count($h['data']), 'dua belas titik');
    foreach ($h['data'] as $t) {
        benar(in_array($t['sumber'], ['rekaman', 'rekap_awal'], true), $t['bln'] . ' menyebut sumbernya');
    }
});

echo "\nHak akses\n";

uji('UJ-21', 'Operator tidak dapat membuka HIRADC', function () use ($T) {
    $u = panggil('GET', '/saya', [], $T['operator']);
    benar(!in_array('hiradc', $u['data']['modul'], true), 'hiradc tidak ada pada daftar modul');
});

uji('UJ-22', 'Petugas Lingkungan tidak dapat membuka JSA', function () use ($T) {
    $u = panggil('GET', '/saya', [], $T['lingkungan']);
    benar(!in_array('jsa', $u['data']['modul'], true), 'jsa tidak ada pada daftar modul');
    benar(in_array('hiradc', $u['data']['modul'], true), 'hiradc ada');
});

uji('UJ-21b', 'Operator ditolak saat menerbitkan izin', function () use ($D, $T) {
    $z = panggil('POST', '/izin', [
        'area_id' => $D['area_cbt'], 'jenis' => 'panas', 'judul' => 'Coba terbitkan',
        'pengawas' => 'Budi', 'jsa_id' => $D['jsa_aman'], 'pelaksana_id' => $D['operator'],
    ], $T['operator']);
    sama(201, $z['status'], 'mengajukan boleh (AB-12)');

    $t = panggil('POST', '/izin/' . $z['data']['id'] . '/terbitkan', [], $T['operator']);
    sama(403, $t['status'], 'menerbitkan ditolak');
});

uji('UJ-23', 'Cakupan pabrik ditolak 403, bukan daftar kosong', function () use ($D, $T) {
    $h = panggil('POST', '/bahaya', [
        'area_id' => $D['area_smg'], 'isi' => 'Dari pabrik lain',
    ], $T['qhse']);
    sama(403, $h['status'], 'status');
    sama('TAK_BERWENANG', $h['galat']['kode'] ?? null, 'kode galat');
});

uji('UJ-23c', 'Daftar hanya memuat pabrik sendiri', function () use ($D, $T) {
    panggil('POST', '/bahaya', ['area_id' => $D['area_smg'], 'isi' => 'Bahaya Semarang'], $T['qhse_smg']);
    $cbt = panggil('GET', '/bahaya', [], $T['qhse']);
    foreach ($cbt['data'] as $b) {
        sama('Cibitung', $b['pabrik'], 'hanya pabrik sendiri yang terbaca');
    }
});

uji('UJ-26', 'AB-12 · Operator boleh mengajukan izin dari lapangan', function () use ($D, $T) {
    $h = panggil('POST', '/lapangan/kirim', [
        'perangkat_id' => 'uji-perangkat-izin',
        'kiriman' => [[
            'id_lokal' => 'WP-L-0001', 'jenis' => 'izin', 'area_id' => $D['area_cbt'],
            'kategori' => 'panas', 'isi' => 'Pengelasan penyangga pipa uap',
            'pengawas' => 'Budi Santoso',
        ]],
    ], $T['operator']);
    sama('diterima', $h['data']['hasil'][0]['status'], 'diterima');
    $st = Db::nilai('SELECT status FROM izin WHERE nomor = :n', [':n' => $h['data']['hasil'][0]['nomor']]);
    sama('Menunggu Supervisor', $st, 'masuk sebagai pengajuan, bukan izin aktif');
});

uji('UJ-24', 'Hanya Administrator yang melihat daftar pengguna', function () use ($T) {
    foreach (['qhse', 'manajemen', 'operator', 'lingkungan'] as $peran) {
        $h = panggil('GET', '/pengguna', [], $T[$peran]);
        sama(403, $h['status'], "peran $peran ditolak");
    }
    sama(200, panggil('GET', '/pengguna', [], $T['admin'])['status'], 'admin diterima');
});

uji('UJ-22c', 'Operator tidak dapat menyusun JSA, hanya membacanya', function () use ($D, $T) {
    sama(200, panggil('GET', '/jsa', [], $T['operator'])['status'], 'boleh membaca');
    $h = panggil('POST', '/jsa', [
        'area_id' => $D['area_cbt'], 'pekerjaan' => 'Oleh operator',
        'langkah' => [['kerja' => 'K', 'bahaya' => 'B', 'kemungkinan' => 1, 'keparahan' => 1,
                       'kemungkinan_sisa' => 1, 'keparahan_sisa' => 1]],
    ], $T['operator']);
    sama(403, $h['status'], 'tidak boleh menyusun');
});

uji('UJ-27', 'Akun nonaktif kehilangan akses', function () use ($D, $T) {
    Db::jalankan("UPDATE pengguna SET status = 'Nonaktif' WHERE id = :i", [':i' => $D['lingkungan']]);
    $h = panggil('GET', '/saya', [], $T['lingkungan']);
    sama(403, $h['status'], 'ditolak');
    Db::jalankan("UPDATE pengguna SET status = 'Aktif' WHERE id = :i", [':i' => $D['lingkungan']]);
});

uji('UJ-27b', 'Tanpa token ditolak 401', function () {
    $h = panggil('GET', '/saya');
    sama(401, $h['status'], 'status');
});

echo "\nMasuk lewat direktori perusahaan\n";

/**
 * Penerbit tiruan: sepasang kunci RSA yang dibuat saat uji berjalan, dipakai
 * untuk menandatangani id_token dan disajikan sebagai JWKS. Dengan begitu
 * seluruh pemeriksaan dapat diuji tanpa memanggil penerbit sungguhan —
 * pemeriksaan yang hanya dapat diuji dengan memanggil pihak ketiga adalah
 * pemeriksaan yang tidak pernah diuji.
 */
final class Penerbit
{
    public \OpenSSLAsymmetricKey $rahasia;
    /** @var array<string,mixed> */
    public array $jwks;

    public function __construct(public string $kid = 'uji-1')
    {
        $this->rahasia = openssl_pkey_new([
            'private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);
        $rincian = openssl_pkey_get_details($this->rahasia);
        $this->jwks = ['keys' => [[
            'kty' => 'RSA', 'kid' => $kid, 'alg' => 'RS256', 'use' => 'sig',
            'n' => self::b64($rincian['rsa']['n']), 'e' => self::b64($rincian['rsa']['e']),
        ]]];
    }

    /** @param array<string,mixed> $klaim */
    public function token(array $klaim, string $alg = 'RS256', bool $tandaSah = true): string
    {
        $kepala = self::b64(json_encode(['alg' => $alg, 'typ' => 'JWT', 'kid' => $this->kid]));
        $isi    = self::b64(json_encode($klaim));
        if ($alg === 'none') return "$kepala.$isi.";
        openssl_sign("$kepala.$isi", $tanda, $this->rahasia, OPENSSL_ALGO_SHA256);
        if (!$tandaSah) $tanda = strrev($tanda);
        return "$kepala.$isi." . self::b64($tanda);
    }

    public static function b64(string $s): string
    {
        return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    }
}

/** @return array<string,mixed> */
function klaimSah(): array
{
    return [
        'iss' => 'https://direktori.khongguan.test', 'aud' => 'kg-safeguard',
        'sub' => 'abc-123', 'email' => 'fadli.saldi@khongguan.co.id', 'email_verified' => true,
        'name' => 'Fadli Saldi', 'nonce' => 'nonce-uji',
        'iat' => time(), 'exp' => time() + 300,
    ];
}

function periksa(array $klaim, ?Penerbit $pn = null, string $alg = 'RS256', bool $tandaSah = true): array
{
    $pn = $pn ?? new Penerbit();
    return \KG\Oidc::periksaToken($pn->token($klaim, $alg, $tandaSah), $pn->jwks,
        'https://direktori.khongguan.test', 'kg-safeguard', 'nonce-uji');
}

/** Memastikan pemanggilan melempar Galat yang menyebut sebabnya. */
function ditolakGalat(callable $fn, string $sebutkan, string $pesan): void
{
    try {
        $fn();
        throw new \RuntimeException("$pesan — seharusnya ditolak");
    } catch (\KG\Galat $g) {
        benar(stripos($g->getMessage(), $sebutkan) !== false,
            "$pesan (pesan menyebut '$sebutkan', didapat: " . $g->getMessage() . ')');
    }
}

/** Memastikan pemeriksaan menolak, dan menyebut sebabnya. */
function ditolak(callable $fn, string $sebutkan, string $pesan): void
{
    try {
        $fn();
        throw new \RuntimeException("$pesan — seharusnya ditolak");
    } catch (\KG\Galat $g) {
        benar(stripos($g->getMessage(), $sebutkan) !== false,
            "$pesan (pesan menyebut '$sebutkan', didapat: " . $g->getMessage() . ')');
    }
}

uji('UJ-40', 'id_token yang sah diterima', function () {
    $k = periksa(klaimSah());
    sama('fadli.saldi@khongguan.co.id', $k['email'], 'surel terbaca');
});

uji('UJ-41', 'Tanda tangan palsu ditolak', function () {
    ditolak(fn () => periksa(klaimSah(), null, 'RS256', false), 'tanda tangan', 'tanda tangan rusak');
});

uji('UJ-42', 'Kunci penerbit lain ditolak', function () {
    $asli = new Penerbit();
    $lain = new Penerbit();          // kid sama, kunci berbeda
    ditolak(function () use ($asli, $lain) {
        \KG\Oidc::periksaToken($lain->token(klaimSah()), $asli->jwks,
            'https://direktori.khongguan.test', 'kg-safeguard', 'nonce-uji');
    }, 'tanda tangan', 'ditandatangani kunci lain');
});

uji('UJ-43', "Algoritma 'none' ditolak", function () {
    ditolak(fn () => periksa(klaimSah(), null, 'none'), 'algoritma', "alg 'none'");
});

uji('UJ-43b', 'Algoritma HMAC ditolak', function () {
    ditolak(fn () => periksa(klaimSah(), null, 'HS256'), 'algoritma', 'alg HS256');
});

uji('UJ-44', 'Penerbit yang tidak cocok ditolak', function () {
    ditolak(fn () => periksa(['iss' => 'https://penerbit.lain'] + klaimSah()),
        'penerbit', 'iss berbeda');
});

uji('UJ-45', 'Audiens yang tidak cocok ditolak', function () {
    ditolak(fn () => periksa(['aud' => 'aplikasi-lain'] + klaimSah()),
        'ditujukan', 'aud berbeda');
});

uji('UJ-45b', 'Audiens ganda tanpa azp yang benar ditolak', function () {
    ditolak(fn () => periksa(['aud' => ['kg-safeguard', 'lain'], 'azp' => 'lain'] + klaimSah()),
        'aplikasi lain', 'azp menunjuk aplikasi lain');
    // Dengan azp yang benar, audiens ganda tetap diterima.
    $k = periksa(['aud' => ['kg-safeguard', 'lain'], 'azp' => 'kg-safeguard'] + klaimSah());
    sama('abc-123', $k['sub'], 'azp benar diterima');
});

uji('UJ-46', 'Token kedaluwarsa ditolak', function () {
    ditolak(fn () => periksa(['exp' => time() - 600] + klaimSah()), 'kedaluwarsa', 'exp lewat');
});

uji('UJ-47', 'Nonce yang tidak cocok ditolak', function () {
    ditolak(fn () => periksa(['nonce' => 'nonce-lain'] + klaimSah()), 'nonce', 'nonce berbeda');
});

uji('UJ-48', 'Surel yang belum diverifikasi direktori ditolak', function () {
    // Siapa pun yang dapat mendaftar dengan surel orang lain akan masuk
    // sebagai orang itu.
    ditolak(fn () => periksa(['email_verified' => false] + klaimSah()),
        'diverifikasi', 'email_verified false');
});

uji('UJ-48b', 'Token tanpa surel ditolak', function () {
    $k = klaimSah();
    unset($k['email']);
    ditolak(fn () => periksa($k), 'surel', 'tanpa klaim email');
});

uji('UJ-49', 'state dipakai sekali dan kedaluwarsa', function () {
    Db::jalankan(
        "INSERT INTO oidc_permintaan (state, nonce, verifier, kedaluwarsa)
         VALUES ('state-uji', 'n', 'v', now() + interval '10 minutes')"
    );
    $pertama = Db::baris(
        "DELETE FROM oidc_permintaan WHERE state = 'state-uji' AND kedaluwarsa > now()
         RETURNING nonce");
    benar($pertama !== null, 'pemakaian pertama berhasil');

    $kedua = Db::baris(
        "DELETE FROM oidc_permintaan WHERE state = 'state-uji' AND kedaluwarsa > now()
         RETURNING nonce");
    sama(null, $kedua, 'pemakaian kedua gagal');

    Db::jalankan(
        "INSERT INTO oidc_permintaan (state, nonce, verifier, kedaluwarsa)
         VALUES ('state-basi', 'n', 'v', now() - interval '1 minute')"
    );
    sama(null, Db::baris(
        "DELETE FROM oidc_permintaan WHERE state = 'state-basi' AND kedaluwarsa > now()
         RETURNING nonce"), 'state kedaluwarsa tidak dapat dipakai');
});

uji('UJ-50', 'Jalur masuk demo dimatikan saat konfigurasi mematikannya', function () {
    // Seluruh konfigurasi uji dikembalikan, bukan sebagiannya: mengembalikan
    // sebagian membuat uji berikutnya gagal karena kunci yang hilang, dan
    // penyebabnya tampak berasal dari kode yang diujinya.
    $semula = Konfigurasi::ambil();
    try {
        Konfigurasi::paksa(['izinkan_masuk_demo' => false] + $semula);
        $h = panggil('POST', '/sesi/masuk-demo', ['email' => 'qhse@kg.test']);
        sama(403, $h['status'], 'ditolak pada lingkungan tanpa jalur demo');
    } finally {
        Konfigurasi::paksa($semula);
    }
});

echo "\nSinkronisasi lapangan\n";

uji('UJ-29', 'Lima jenis laporan diterima dalam satu antrean', function () use ($D, $T) {
    $h = panggil('POST', '/lapangan/kirim', [
        'perangkat_id' => 'uji-perangkat-lima',
        'kiriman' => [
            ['id_lokal' => 'HZ-L-0001',  'jenis' => 'bahaya',    'area_id' => $D['area_cbt'], 'isi' => 'Ceceran oli'],
            ['id_lokal' => 'INC-L-0001', 'jenis' => 'insiden',   'area_id' => $D['area_cbt'], 'isi' => 'Nyaris tertimpa', 'kategori' => 'Nearmiss'],
            ['id_lokal' => 'OBS-L-0001', 'jenis' => 'observasi', 'area_id' => $D['area_cbt'], 'isi' => 'Percakapan APD', 'aman' => 5],
            ['id_lokal' => 'APD-L-0001', 'jenis' => 'apd',       'area_id' => $D['area_cbt'], 'diamati' => 12, 'patuh' => 11, 'isi' => 'Dua tanpa pelindung telinga'],
            ['id_lokal' => 'WP-L-0002',  'jenis' => 'izin',      'area_id' => $D['area_cbt'], 'kategori' => 'ketinggian', 'isi' => 'Perbaikan atap', 'pengawas' => 'Slamet'],
        ],
    ], $T['operator']);
    sama(5, count($h['data']['hasil']), 'lima hasil');
    foreach ($h['data']['hasil'] as $r) {
        sama('diterima', $r['status'], 'kiriman ' . $r['id_lokal']);
    }
});

uji('UJ-31', 'Mengirim ulang antrean yang sama tidak menggandakan', function () use ($D, $T) {
    $kiriman = ['perangkat_id' => 'uji-idempoten', 'kiriman' => [
        ['id_lokal' => 'HZ-L-0009', 'jenis' => 'bahaya', 'area_id' => $D['area_cbt'], 'isi' => 'Lantai licin'],
    ]];
    $a = panggil('POST', '/lapangan/kirim', $kiriman, $T['operator']);
    $b = panggil('POST', '/lapangan/kirim', $kiriman, $T['operator']);

    sama('diterima', $a['data']['hasil'][0]['status'], 'kiriman pertama');
    sama('diterima', $b['data']['hasil'][0]['status'], 'kiriman kedua');
    sama($a['data']['hasil'][0]['nomor'], $b['data']['hasil'][0]['nomor'], 'nomor sama');
    benar($b['data']['hasil'][0]['diulang'] ?? false, 'ditandai sebagai pengulangan');

    $jumlah = (int) Db::nilai('SELECT count(*) FROM bahaya WHERE nomor = :n',
        [':n' => $a['data']['hasil'][0]['nomor']]);
    sama(1, $jumlah, 'hanya satu catatan tersimpan');
});

uji('UJ-32', 'Satu ditolak tidak menggagalkan sisanya', function () use ($D, $T) {
    $h = panggil('POST', '/lapangan/kirim', [
        'perangkat_id' => 'uji-sebagian',
        'kiriman' => [
            ['id_lokal' => 'HZ-L-0011', 'jenis' => 'bahaya', 'area_id' => $D['area_cbt'], 'isi' => 'Sah pertama'],
            ['id_lokal' => 'APD-L-0011', 'jenis' => 'apd', 'area_id' => $D['area_cbt'],
             'diamati' => 8, 'patuh' => 12, 'isi' => 'Melanggar AB-07'],
            ['id_lokal' => 'HZ-L-0012', 'jenis' => 'bahaya', 'area_id' => $D['area_cbt'], 'isi' => 'Sah kedua'],
        ],
    ], $T['operator']);

    $hasil = $h['data']['hasil'];
    sama('diterima', $hasil[0]['status'], 'kiriman pertama');
    sama('ditolak',  $hasil[1]['status'], 'kiriman kedua');
    sama('AB-07',    $hasil[1]['aturan'], 'kode aturan pada yang ditolak');
    sama('diterima', $hasil[2]['status'], 'kiriman ketiga tetap diterima');

    // Yang ditolak tidak meninggalkan catatan setengah jadi.
    sama(0, (int) Db::nilai("SELECT count(*) FROM observasi_apd WHERE catatan = 'Melanggar AB-07'"),
        'tidak ada catatan tersisa dari yang ditolak');
});

uji('UJ-05b', 'AB-05 · kiriman lapangan bernomor awalan berbeda', function () use ($D, $T) {
    $h = panggil('POST', '/lapangan/kirim', [
        'perangkat_id' => 'uji-awalan',
        'kiriman' => [['id_lokal' => 'HZ-L-0021', 'jenis' => 'bahaya',
                       'area_id' => $D['area_cbt'], 'isi' => 'Uji awalan']],
    ], $T['operator']);
    benar(str_starts_with($h['data']['hasil'][0]['nomor'], 'HZ-L-'), 'awalan lapangan dipakai');
});

uji('UJ-28b', 'Rujukan luring disaring menurut peran', function () use ($T) {
    $op = panggil('GET', '/lapangan/rujukan', [], $T['operator']);
    benar(isset($op['data']['jsa']), 'operator menerima JSA');
    benar(!isset($op['data']['hiradc']), 'operator tidak menerima HIRADC');

    $lk = panggil('GET', '/lapangan/rujukan', [], $T['lingkungan']);
    benar(isset($lk['data']['hiradc']), 'lingkungan menerima HIRADC');
    benar(!isset($lk['data']['jsa']), 'lingkungan tidak menerima JSA');
});

echo "\nLampiran, pemberitahuan, dan ekspor\n";

/** PNG 1×1 yang sah, supaya finfo mengenalinya sebagai image/png. */
function pngKecil(): string
{
    return base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
}

uji('UJ-60', 'Lampiran tersimpan dan jenisnya ditentukan dari isi, bukan namanya',
    function () use ($D) {
        // Nama berkas mengaku .pdf, isinya PNG. Yang dipercaya adalah isinya.
        $l = \KG\Berkas::simpan(pngKecil(), 'mengaku.pdf', $D['qhse']);
        sama('image/png', $l['tipe_media'], 'tipe dari isi berkas');
        benar($l['ukuran'] > 0, 'ukuran tercatat');
    });

uji('UJ-60b', 'Jenis berkas di luar daftar ditolak', function () use ($D) {
    try {
        \KG\Berkas::simpan("#!/bin/sh\necho halo\n", 'skrip.sh', $D['qhse']);
        throw new \RuntimeException('skrip seharusnya ditolak');
    } catch (\KG\Galat $g) {
        benar(str_contains($g->getMessage(), 'tidak diterima'), 'ditolak dengan sebab');
    }
});

uji('UJ-61', 'Tautan lampiran kedaluwarsa setelah 15 menit', function () use ($D) {
    $l = \KG\Berkas::simpan(pngKecil(), 'foto.png', $D['qhse']);

    $sampai = time() + 600;
    $tanda  = \KG\Berkas::tanda($l['id'], $D['qhse'], $sampai);
    \KG\Berkas::periksaTanda($l['id'], $D['qhse'], $sampai, $tanda);   // tidak melempar

    ditolakGalat(fn () => \KG\Berkas::periksaTanda($l['id'], $D['qhse'], time() - 1,
        \KG\Berkas::tanda($l['id'], $D['qhse'], time() - 1)), 'kedaluwarsa', 'tautan lewat waktu');

    // Tanda milik pengguna lain tidak berlaku: tautan yang diteruskan lewat
    // pesan tidak boleh membuka berkas bagi penerimanya.
    ditolakGalat(fn () => \KG\Berkas::periksaTanda($l['id'], $D['operator'], $sampai, $tanda),
        'tidak sah', 'tanda milik pengguna lain');
});

uji('UJ-61b', 'Lampiran tidak dapat berpindah induk', function () use ($D, $T) {
    $l = \KG\Berkas::simpan(pngKecil(), 'foto.png', $D['qhse']);
    $b1 = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Pertama'], $T['qhse']);
    $b2 = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Kedua'], $T['qhse']);

    \KG\Berkas::kaitkan($l['id'], 'bahaya', $b1['data']['id']);
    // Satu foto yang berpindah induk membuat dua catatan menunjuk bukti yang
    // sama, dan yang satu kehilangan buktinya tanpa jejak.
    ditolakGalat(fn () => \KG\Berkas::kaitkan($l['id'], 'bahaya', $b2['data']['id']),
        'sudah terkait', 'lampiran dipindahkan');
});

uji('UJ-62', 'AB-30 · pemberitahuan tersusun hanya untuk tiga sebab', function () use ($D) {
    \KG\Pemberitahuan::susun();
    $sebab = array_column(Db::semua(
        'SELECT DISTINCT sebab FROM notifikasi WHERE rujukan_id IS NOT NULL'), 'sebab');
    foreach ($sebab as $x) {
        benar(in_array($x, ['lewat_tenggat', 'menunggu_keputusan', 'melewati_ambang'], true),
            "sebab '$x' termasuk yang diizinkan");
    }
});

uji('UJ-62b', 'Penyusunan pemberitahuan idempoten', function () {
    \KG\Pemberitahuan::susun();
    $sebelum = (int) Db::nilai('SELECT count(*) FROM notifikasi');
    $kedua = \KG\Pemberitahuan::susun();
    sama(0, $kedua['dibuat'], 'jalan kedua tidak membuat apa pun');
    sama($sebelum, (int) Db::nilai('SELECT count(*) FROM notifikasi'), 'jumlah tetap');
});

uji('UJ-62c', 'Tanpa saluran aktif, tidak ada yang ditandai terkirim', function () {
    // Menandainya berarti pemberitahuan hari ini tidak akan pernah dikirim
    // setelah SMTP dipasang besok — hilang tanpa jejak.
    \KG\DaftarSaluran::paksa([]);
    \KG\Pemberitahuan::susun();
    Db::jalankan('UPDATE notifikasi SET dikirim_pada = NULL');
    $h = \KG\Pemberitahuan::kirim();
    sama(0, $h['terkirim'], 'tidak ada yang dikirim');
    sama(0, (int) Db::nilai('SELECT count(*) FROM notifikasi WHERE dikirim_pada IS NOT NULL'),
        'tidak ada yang ditandai');
    \KG\DaftarSaluran::paksa(null);
});

uji('UJ-62d', 'AB-31 · yang lewat tenggat dikirim ulang, yang lain tidak', function () use ($D) {
    $saluran = new class implements \KG\Saluran {
        /** @var array<int,string> */
        public array $terkirim = [];
        public function kirim(array $penerima, array $n): bool
        {
            $this->terkirim[] = (string) $n['id'];
            return true;
        }
    };
    \KG\DaftarSaluran::paksa([$saluran]);

    Db::jalankan('DELETE FROM notifikasi');
    foreach ([['lewat_tenggat', 'A'], ['menunggu_keputusan', 'B']] as [$sebab, $judul]) {
        Db::jalankan(
            "INSERT INTO notifikasi (pabrik_id, jenis, modul, judul, isi, sebab, aksi, dikirim_pada)
             VALUES (:p, 'high', 'Uji', :j, 'isi', :s, 'capa', now() - interval '2 days')",
            [':p' => $D['pabrik_cbt'], ':j' => $judul, ':s' => $sebab]
        );
    }
    \KG\Pemberitahuan::kirim();

    $ulang = Db::semua(
        "SELECT judul FROM notifikasi WHERE dikirim_pada >= current_date ORDER BY judul");
    sama([['judul' => 'A']], $ulang, 'hanya yang lewat tenggat dikirim ulang');
    \KG\DaftarSaluran::paksa(null);
});

uji('UJ-63', 'Ekspor mengikuti hak akses modulnya', function () use ($T) {
    // Ekspor yang melewati pemeriksaan adalah cara paling umum data keluar.
    sama(403, panggil('GET', '/ekspor/hiradc/xlsx', [], $T['operator'])['status'],
        'Operator tidak dapat mengekspor HIRADC');
    sama(200, panggil('GET', '/ekspor/hiradc/xlsx', [], $T['qhse'])['status'],
        'QHSE dapat');
});

uji('UJ-63b', 'Ekspor hanya memuat pabrik sendiri', function () use ($D, $T) {
    panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Milik Cibitung'], $T['qhse']);
    panggil('POST', '/bahaya', ['area_id' => $D['area_smg'], 'isi' => 'Milik Semarang'], $T['qhse_smg']);

    $h = panggil('GET', '/ekspor/bahaya/xlsx', [], $T['qhse']);
    sama(200, $h['status'], 'terunduh');

    $baris = (int) Db::nilai(
        "SELECT baris FROM jejak_unduhan WHERE ekspor = 'bahaya' ORDER BY waktu DESC LIMIT 1");
    $cbt = (int) Db::nilai(
        'SELECT count(*) FROM bahaya WHERE pabrik_id = :p AND dihapus_pada IS NULL',
        [':p' => $D['pabrik_cbt']]);
    sama($cbt, $baris, 'jumlah baris sama dengan milik pabriknya sendiri');
});

uji('UJ-63c', 'Setiap unduhan meninggalkan jejak yang tidak dapat dihapus', function () use ($T) {
    panggil('GET', '/ekspor/capa/xlsx', [], $T['qhse']);
    $j = Db::baris("SELECT ekspor, bentuk FROM jejak_unduhan ORDER BY waktu DESC LIMIT 1");
    sama('capa', $j['ekspor'], 'ekspor tercatat');
    sama('xlsx', $j['bentuk'], 'bentuk tercatat');

    try {
        Db::jalankan('DELETE FROM jejak_unduhan');
        throw new \RuntimeException('penghapusan jejak unduhan seharusnya ditolak');
    } catch (\PDOException $e) {
        benar(str_contains($e->getMessage(), 'hanya menerima INSERT'), 'ditolak basis data');
    }
});

uji('UJ-64', 'Berkas xlsx yang dihasilkan adalah arsip zip yang sah', function () {
    $isi = \KG\Xlsx::tulis('Uji', ['Nomor', 'Jumlah'], [['A-1', 12], ['A-2', 7.5]]);
    benar(str_starts_with($isi, "PK\x03\x04"), 'berawalan tanda zip');

    $berkas = tempnam(sys_get_temp_dir(), 'ujixlsx');
    file_put_contents($berkas, $isi);
    $zip = new \ZipArchive();
    sama(true, $zip->open($berkas) === true, 'dapat dibuka sebagai zip');

    $lembar = (string) $zip->getFromName('xl/worksheets/sheet1.xml');
    benar(str_contains($lembar, '<v>12</v>'), 'angka ditulis sebagai angka');
    benar(str_contains($lembar, '<t>Nomor</t>'), 'kepala kolom ada');
    $zip->close();
    @unlink($berkas);
});

uji('UJ-64b', 'Aksara kendali tidak merusak berkas xlsx', function () {
    // Satu aksara kendali membuat Excel menolak seluruh berkas, dan catatan
    // yang disalin dari dokumen lain sering membawanya.
    $isi = \KG\Xlsx::tulis('Uji', ['Teks'], [["Baris\x07dengan\x00kendali"]]);
    $berkas = tempnam(sys_get_temp_dir(), 'ujixlsx');
    file_put_contents($berkas, $isi);
    $zip = new \ZipArchive();
    $zip->open($berkas);
    $lembar = (string) $zip->getFromName('xl/worksheets/sheet1.xml');
    $zip->close();
    @unlink($berkas);
    benar(simplexml_load_string($lembar) !== false, 'XML tetap sah');
});

uji('UJ-65', 'Daftar membawa bekal yang dibutuhkan tombol persetujuan', function () use ($T) {
    // Tombol verifikasi di layar dibangun dari kolom-kolom ini: tanpa id,
    // alamat tindakannya tidak dapat disusun; tanpa penyusun_id dan pj_id,
    // larangan menyetujui pekerjaan sendiri (AB-17) tidak dapat ditegakkan
    // lebih awal dan orang menekan tombol yang pasti ditolak.
    $wajib = [
        '/bahaya'  => ['id'],
        '/insiden' => ['id'],
        '/izin'    => ['id'],
        '/audit'   => ['id'],
        '/jsa'     => ['id', 'penyusun_id'],
        '/capa'    => ['id', 'pj_id', 'ada_bukti'],
    ];
    foreach ($wajib as $jalur => $kolom) {
        $d = panggil('GET', $jalur, [], $T['qhse'])['data'];
        benar(count($d) > 0, "$jalur berisi data");
        foreach ($kolom as $k) {
            benar(array_key_exists($k, $d[0]), "$jalur membawa $k");
        }
    }
});

uji('UJ-54', 'Bentuk nomor mengikuti purwarupa', function () {
    // Nomor tampil dibaca dan diucapkan orang; bentuk yang berubah memutus
    // rujukan pada laporan, surel, dan berkas lama.
    $bentuk = [
        'insiden'       => '/^INC-\d{4}-\d{4}$/',
        'bahaya'        => '/^HZ-\d{4}-\d{4}$/',
        'izin'          => '/^WP-\d{4}-\d{4}$/',
        'jsa'           => '/^JSA-\d{4}-\d{3}$/',
        'hiradc'        => '/^HRD-\d{3}$/',
        'risiko'        => '/^RSK-\d{4}-\d{3}$/',
        'capa'          => '/^CAPA-\d{4}-\d{4}$/',
        'audit'         => '/^AUD-\d{4}-\d{3}$/',
        'temuan_audit'  => '/^AF-\d{4}-\d{3}$/',
        'induksi'       => '/^IND-\d{4}-\d{4}$/',
        'regulasi'      => '/^REG-\d{3}$/',
        'observasi_apd' => '/^APD-\d{4}-\d{4}$/',
        'observasi'     => '/^OBS-\d{4}-\d{4}$/',
        'inspeksi'      => '/^INS-\d{4}-\d{4}$/',
        'checklist'     => '/^CHK-\d{4}-\d{4}$/',
        'pelatihan'     => '/^TRN-\d{4}-\d{3}$/',
        'kegiatan'      => '/^ACT-\d{4}-\d{3}$/',
    ];
    foreach ($bentuk as $entitas => $pola) {
        $n = \KG\Nomor::berikut($entitas);
        benar(preg_match($pola, $n) === 1, "$entitas menghasilkan '$n' sesuai $pola");
    }
});

uji('UJ-54b', 'Kode dokumen internal mengikuti jenisnya', function () {
    // Awalan yang memberi tahu jenis dokumen sebelum judulnya dibaca.
    foreach (['Manual' => 'KGM', 'Kebijakan' => 'KGK', 'Prosedur' => 'KGP',
              'Instruksi Kerja' => 'KGI', 'Formulir' => 'KGF'] as $jenis => $awalan) {
        $k = \KG\Nomor::dokumenInternal($jenis);
        benar(str_starts_with($k, $awalan . '-'), "$jenis menghasilkan '$k'");
        benar(preg_match('/^[A-Z]{3}-\d{2}$/', $k) === 1, "bentuk '$k' dua angka");
    }
});

uji('UJ-55', 'Kode regulasi dan dokumen dibangkitkan peladen bila tidak disebut',
    function () use ($T) {
        // Kode yang dibuat klien tidak dapat dijamin unik maupun berurutan,
        // dan kedua daftar dibaca menurut kodenya.
        $r = panggil('POST', '/regulasi', [
            'nomor' => 'PP No. 0 Tahun 2026', 'judul' => 'Peraturan uji',
            'penerbit' => 'Pemerintah RI', 'bidang' => 'K3 Umum', 'pasal' => 'Pasal 1',
            'penerapan' => 'Uji penerapan.',
        ], $T['qhse']);
        sama(201, $r['status'], 'regulasi tersimpan');
        benar(preg_match('/^REG-\d{3}$/', $r['data']['kode']) === 1,
            'kode regulasi ' . $r['data']['kode']);

        $d = panggil('POST', '/dokumen/internal', [
            'level' => 3, 'jenis' => 'Instruksi Kerja', 'judul' => 'Instruksi uji',
            'pemilik' => 'QHSE',
        ], $T['qhse']);
        sama(201, $d['status'], 'dokumen tersimpan');
        benar(str_starts_with($d['data']['kode'], 'KGI-'), 'kode dokumen ' . $d['data']['kode']);
    });

echo "\nJejak audit dan penomoran\n";

uji('UJ-51', 'Setiap perubahan meninggalkan jejak', function () use ($D, $T) {
    $h = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Uji jejak audit'], $T['qhse']);
    $j = Db::baris("SELECT aksi, pengguna_id FROM jejak_audit
                     WHERE tabel = 'bahaya' AND baris_id = :i ORDER BY waktu DESC LIMIT 1",
        [':i' => $h['data']['id']]);
    sama('buat', $j['aksi'], 'aksi tercatat');
    sama($D['qhse'], $j['pengguna_id'], 'pelaku tercatat');
});

uji('UJ-51b', 'Jejak audit tidak dapat diubah atau dihapus', function () {
    $id = (int) Db::nilai('SELECT id FROM jejak_audit ORDER BY id LIMIT 1');
    foreach ([['UPDATE jejak_audit SET aksi = \'ubah\' WHERE id = :i', 'UPDATE'],
              ['DELETE FROM jejak_audit WHERE id = :i', 'DELETE']] as [$sql, $nama]) {
        try {
            Db::jalankan($sql, [':i' => $id]);
            throw new \RuntimeException("$nama pada jejak_audit seharusnya ditolak");
        } catch (\PDOException $e) {
            benar(str_contains($e->getMessage(), 'hanya menerima INSERT'), "$nama ditolak basis data");
        }
    }
});

uji('UJ-53', 'Nomor tidak pernah kembar walau diminta berulang', function () {
    $nomor = [];
    for ($i = 0; $i < 25; $i++) $nomor[] = \KG\Nomor::berikut('capa');
    sama(25, count(array_unique($nomor)), 'seluruh nomor unik');
    benar(str_starts_with($nomor[0], 'CAPA-' . date('Y') . '-'), 'bentuk nomor sesuai');
});
