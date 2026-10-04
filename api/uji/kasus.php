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

uji('UJ-25c', 'Tren administrator menjumlahkan seluruh pabrik, seperti daftarnya', function () use ($D, $T) {
    panggil('POST', '/bahaya', ['area_id' => $D['area_smg'], 'isi' => 'Bahaya di Semarang'], $T['qhse_smg']);
    panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Bahaya di Cibitung'], $T['qhse']);

    $periode = \KG\Kpi::periode();
    $harap = ['bahaya' => 0, 'insiden' => 0];
    foreach (Db::semua('SELECT id FROM pabrik WHERE aktif') as $pb) {
        $m = \KG\Kpi::mentah($pb['id'], $periode);
        $harap['bahaya'] += $m['bahaya'];
        $harap['insiden'] += $m['insiden'];
    }
    $admin = panggil('GET', '/kpi/tren', [], $T['admin'])['data'];
    $akhir = $admin[count($admin) - 1];
    sama($harap['bahaya'], $akhir['bahaya'], 'bahaya bulan ini = jumlah seluruh pabrik');
    sama($harap['insiden'], $akhir['insiden'], 'insiden bulan ini = jumlah seluruh pabrik');

    $qhse = panggil('GET', '/kpi/tren', [], $T['qhse'])['data'];
    benar($qhse[11]['bahaya'] < $akhir['bahaya'], 'QHSE tetap melihat pabriknya sendiri saja');
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

echo "\nMasuk dengan kata sandi\n";

/**
 * Pengguna uji dengan sandi yang sudah disetel, dibuat langsung ke basis data.
 * Setiap uji memakai surelnya sendiri supaya batas percobaan satu uji tidak
 * menular ke uji lain.
 */
function penggunaBersandi(array $D, string $email, string $sandi, string $peran = 'qhse',
                          string $status = 'Aktif'): string
{
    return (string) Db::nilai(
        "INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, sandi_hash)
         VALUES (:e, 'Pengguna Uji', 'PU', :r, :p, :s, :h) RETURNING id",
        [':e' => $email, ':r' => $peran, ':p' => $D['pabrik_cbt'], ':s' => $status,
         ':h' => \KG\Sandi::hash($sandi)]
    );
}

/** Token dari alamat tautan ".../#/sandi/<token>". */
function tokenTautan(string $alamat): string
{
    benar((bool) preg_match('~#/sandi/([0-9a-f]{64})$~', $alamat, $c), 'bentuk alamat tautan');
    return $c[1];
}

uji('UJ-70', 'Sandi yang benar membuka sesi yang sah', function () use ($D) {
    penggunaBersandi($D, 'masuk1@kg.test', 'Pagar-Oven-Line3');
    $h = panggil('POST', '/sesi/masuk', ['email' => 'Masuk1@KG.test', 'sandi' => 'Pagar-Oven-Line3']);
    sama(200, $h['status'], 'status');
    benar(strlen($h['data']['token'] ?? '') === 64, 'token diberikan');
    $s = panggil('GET', '/saya', [], $h['data']['token']);
    sama('masuk1@kg.test', $s['data']['email'], 'sesi milik pengguna yang benar');
});

uji('UJ-70b', 'Sandi salah, email tak terdaftar, dan akun tanpa sandi dijawab sama persis', function () use ($D) {
    // Jawaban yang berbeda memberi tahu siapa pun alamat mana yang terdaftar.
    penggunaBersandi($D, 'masuk2@kg.test', 'Pagar-Oven-Line3');
    $salah  = panggil('POST', '/sesi/masuk', ['email' => 'masuk2@kg.test', 'sandi' => 'bukan-ini-sandinya']);
    $takAda = panggil('POST', '/sesi/masuk', ['email' => 'tidak.ada@kg.test', 'sandi' => 'bukan-ini-sandinya']);
    $tanpa  = panggil('POST', '/sesi/masuk', ['email' => 'qhse@kg.test', 'sandi' => 'bukan-ini-sandinya']);
    foreach (['sandi salah' => $salah, 'tak terdaftar' => $takAda, 'tanpa sandi' => $tanpa] as $n => $h) {
        sama(401, $h['status'], "$n: status");
        sama('Email atau kata sandi salah.', $h['galat']['pesan'], "$n: pesan");
    }
});

uji('UJ-70c', 'Akun nonaktif baru diungkap setelah sandinya terbukti benar', function () use ($D) {
    penggunaBersandi($D, 'nonaktif1@kg.test', 'Pagar-Oven-Line3', 'qhse', 'Nonaktif');
    $salah = panggil('POST', '/sesi/masuk', ['email' => 'nonaktif1@kg.test', 'sandi' => 'bukan-ini-sandinya']);
    sama(401, $salah['status'], 'sandi salah: jawaban umum, tidak mengungkap status');
    $benar = panggil('POST', '/sesi/masuk', ['email' => 'nonaktif1@kg.test', 'sandi' => 'Pagar-Oven-Line3']);
    sama(403, $benar['status'], 'sandi benar: ditolak');
    benar(str_contains($benar['galat']['pesan'], 'tidak aktif'), 'alasannya disebut');
});

uji('UJ-71', 'Lima kali gagal mengunci akun sementara, termasuk untuk sandi yang benar', function () use ($D) {
    penggunaBersandi($D, 'kunci1@kg.test', 'Pagar-Oven-Line3');
    penggunaBersandi($D, 'kunci2@kg.test', 'Pagar-Oven-Line3');
    for ($i = 0; $i < \KG\Sandi::GAGAL_PER_AKUN; $i++) {
        panggil('POST', '/sesi/masuk', ['email' => 'kunci1@kg.test', 'sandi' => "tebakan-ke-$i"]);
    }
    $h = panggil('POST', '/sesi/masuk', ['email' => 'kunci1@kg.test', 'sandi' => 'Pagar-Oven-Line3']);
    sama(429, $h['status'], 'sandi benar pun ditahan selama terkunci');
    $lain = panggil('POST', '/sesi/masuk', ['email' => 'kunci2@kg.test', 'sandi' => 'Pagar-Oven-Line3']);
    sama(200, $lain['status'], 'akun lain tidak ikut terkunci');
    $takAda = panggil('POST', '/sesi/masuk', ['email' => 'kunci1@kg.test', 'sandi' => 'apa-saja-lagi']);
    sama($h['galat']['pesan'], $takAda['galat']['pesan'], 'pesan penguncian tidak membedakan apa pun');
});

uji('UJ-71b', 'Satu alamat IP yang mencoba banyak akun ditahan; alamat lain tidak', function () use ($D) {
    for ($i = 0; $i < \KG\Sandi::GAGAL_PER_IP; $i++) {
        panggil('POST', '/sesi/masuk', ['email' => "acak$i@kg.test", 'sandi' => 'tebakan-acak'], null, '10.9.9.9');
    }
    penggunaBersandi($D, 'korban.ip@kg.test', 'Pagar-Oven-Line3');
    $h = panggil('POST', '/sesi/masuk', ['email' => 'korban.ip@kg.test', 'sandi' => 'Pagar-Oven-Line3'], null, '10.9.9.9');
    sama(429, $h['status'], 'alamat penebak ditahan');
    $h2 = panggil('POST', '/sesi/masuk', ['email' => 'korban.ip@kg.test', 'sandi' => 'Pagar-Oven-Line3'], null, '10.1.1.1');
    sama(200, $h2['status'], 'pemilik akun dari alamat lain tetap dapat masuk');
});

uji('UJ-72', 'Yang tersimpan hanya hash; sandi tidak pernah ada di basis data', function () use ($D) {
    $id = penggunaBersandi($D, 'hash1@kg.test', 'Pagar-Oven-Line3');
    $h = (string) Db::nilai('SELECT sandi_hash FROM pengguna WHERE id = :i', [':i' => $id]);
    benar(!str_contains($h, 'Pagar-Oven-Line3'), 'sandi tidak tersimpan apa adanya');
    benar(password_verify('Pagar-Oven-Line3', $h), 'hash dapat dicocokkan');
    $jejak = (string) Db::nilai("SELECT coalesce(string_agg(nilai_sesudah::text, ' '), '') FROM jejak_audit");
    benar(!str_contains($jejak, 'Pagar-Oven-Line3') && !str_contains($jejak, '$2y$'),
        'jejak audit tidak memuat sandi maupun hash');
});

uji('UJ-73', 'Sandi lemah ditolak dengan alasan yang dapat dibaca', function () {
    $kasus = [
        'pendek'        => ['Oven3!', 'minimal'],
        'terlalu umum'  => ['khongguan123', 'terlalu umum'],
        'memuat email'  => ['xx-budi.santoso-99', 'email'],
        'memuat nama'   => ['Santoso-Line3-oke', 'nama'],
        'seragam'       => ['aaaaaaaaaaab', 'seragam'],
        'terlalu panjang' => [str_repeat('Ab3-', 20), 'terlalu panjang'],
    ];
    foreach ($kasus as $n => [$sandi, $sebut]) {
        try {
            \KG\Sandi::wajibLayak($sandi, 'budi.santoso@kg.test', 'Budi Santoso');
            throw new \RuntimeException("$n: seharusnya ditolak");
        } catch (\KG\Galat $g) {
            benar(str_contains(mb_strtolower($g->getMessage()), $sebut), "$n: alasannya menyebut '$sebut'");
        }
    }
    \KG\Sandi::wajibLayak('Pagar-Oven-Line3', 'budi.santoso@kg.test', 'Budi Santoso');
});

echo "\nKelola pengguna dan tautan undangan\n";

uji('UJ-74', 'Undangan: akun Menunggu, tautan menyetel sandi sekali, lalu Aktif', function () use ($D, $T) {
    $b = panggil('POST', '/pengguna', ['email' => 'Baru.Satu@KG.test', 'nama' => 'Baru Satu',
        'peran_kode' => 'operator', 'pabrik_id' => $D['pabrik_cbt']], $T['admin']);
    sama(201, $b['status'], 'dibuat');
    sama('Menunggu', $b['data']['status'], 'berstatus Menunggu');
    sama('baru.satu@kg.test', $b['data']['email'], 'email dinormalkan');
    $token = tokenTautan($b['data']['tautan']);

    $cek = panggil('POST', '/sesi/tautan/periksa', ['token' => $token]);
    sama('Baru Satu', $cek['data']['nama'], 'tautan dikenali');
    sama('undangan', $cek['data']['jenis'], 'jenisnya undangan');

    $gagal = panggil('POST', '/sesi/masuk', ['email' => 'baru.satu@kg.test', 'sandi' => 'Pagar-Oven-Line3']);
    sama(401, $gagal['status'], 'belum dapat masuk sebelum tautan dipakai');

    $pakai = panggil('POST', '/sesi/tautan/pakai', ['token' => $token, 'sandi' => 'Pagar-Oven-Line3']);
    sama(200, $pakai['status'], 'sandi disetel');
    sama('baru.satu@kg.test', panggil('GET', '/saya', [], $pakai['data']['token'])['data']['email'],
        'langsung masuk setelah menyetel');
    sama('Aktif', Db::nilai('SELECT status FROM pengguna WHERE id = :i', [':i' => $b['data']['id']]), 'menjadi Aktif');

    $ulang = panggil('POST', '/sesi/tautan/pakai', ['token' => $token, 'sandi' => 'Sandi-Lain-Sekali']);
    sama(410, $ulang['status'], 'tautan yang sama tidak dapat dipakai dua kali');
    sama(200, panggil('POST', '/sesi/masuk', ['email' => 'baru.satu@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['status'],
        'masuk dengan sandi baru');
});

uji('UJ-74b', 'Tautan kedaluwarsa, diganti, atau asal-asalan dijawab sama', function () use ($D, $T) {
    $b = panggil('POST', '/pengguna', ['email' => 'baru.dua@kg.test', 'nama' => 'Baru Dua',
        'peran_kode' => 'operator', 'pabrik_id' => $D['pabrik_cbt']], $T['admin']);
    $lama = tokenTautan($b['data']['tautan']);
    $baru = tokenTautan(panggil('POST', "/pengguna/{$b['data']['id']}/tautan", [], $T['admin'])['data']['tautan']);

    sama(410, panggil('POST', '/sesi/tautan/periksa', ['token' => $lama])['status'], 'tautan lama batal begitu diganti');
    sama(200, panggil('POST', '/sesi/tautan/periksa', ['token' => $baru])['status'], 'tautan baru berlaku');

    Db::jalankan("UPDATE tautan_sandi SET kedaluwarsa = now() - interval '1 minute' WHERE token_hash = :h",
        [':h' => hash('sha256', $baru)]);
    sama(410, panggil('POST', '/sesi/tautan/pakai', ['token' => $baru, 'sandi' => 'Pagar-Oven-Line3'])['status'],
        'tautan kedaluwarsa ditolak');
    sama(410, panggil('POST', '/sesi/tautan/periksa', ['token' => str_repeat('ab', 32)])['status'], 'tautan karangan ditolak');
    sama(410, panggil('POST', '/sesi/tautan/periksa', ['token' => "' OR 1=1 --"])['status'], 'masukan aneh ditolak');
});

uji('UJ-74c', 'Basis data hanya menyimpan hash token tautan', function () use ($D, $T) {
    $b = panggil('POST', '/pengguna', ['email' => 'baru.tiga@kg.test', 'nama' => 'Baru Tiga',
        'peran_kode' => 'operator', 'pabrik_id' => $D['pabrik_cbt']], $T['admin']);
    $token = tokenTautan($b['data']['tautan']);
    sama(0, (int) Db::nilai('SELECT count(*) FROM tautan_sandi WHERE token_hash = :t', [':t' => $token]),
        'token mentah tidak tersimpan');
    sama(1, (int) Db::nilai('SELECT count(*) FROM tautan_sandi WHERE token_hash = :t', [':t' => hash('sha256', $token)]),
        'hashnya tersimpan');
});

uji('UJ-75', 'Hanya administrator yang mengelola pengguna', function () use ($D, $T) {
    foreach (['qhse', 'manajemen', 'operator'] as $peran) {
        $h = panggil('POST', '/pengguna', ['email' => "coba.$peran@kg.test", 'nama' => 'Coba',
            'peran_kode' => 'admin', 'pabrik_id' => $D['pabrik_cbt']], $T[$peran]);
        sama(403, $h['status'], "$peran tidak dapat membuat pengguna");
        $u = panggil('POST', "/pengguna/{$D['operator']}/ubah", ['peran_kode' => 'admin'], $T[$peran]);
        sama(403, $u['status'], "$peran tidak dapat mengubah peran");
    }
    $g = panggil('POST', '/pengguna', ['email' => 'QHSE@kg.test', 'nama' => 'Ganda',
        'peran_kode' => 'qhse', 'pabrik_id' => $D['pabrik_cbt']], $T['admin']);
    sama(409, $g['status'], 'email yang sudah terdaftar ditolak, tanpa peduli huruf besar-kecil');
    $x = panggil('POST', '/pengguna', ['email' => 'bukan-email', 'nama' => 'X',
        'peran_kode' => 'qhse', 'pabrik_id' => $D['pabrik_cbt']], $T['admin']);
    sama(400, $x['status'], 'email tidak sah ditolak');
});

uji('UJ-76', 'Perubahan peran berlaku seketika pada sesi yang sedang berjalan', function () use ($D, $T) {
    $id = penggunaBersandi($D, 'pindah1@kg.test', 'Pagar-Oven-Line3', 'operator');
    $tok = panggil('POST', '/sesi/masuk', ['email' => 'pindah1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['data']['token'];
    benar(!in_array('capa', panggil('GET', '/saya', [], $tok)['data']['modul'], true), 'operator tidak melihat CAPA');

    $u = panggil('POST', "/pengguna/$id/ubah", ['peran_kode' => 'qhse', 'pabrik_id' => $D['pabrik_smg']], $T['admin']);
    sama(200, $u['status'], 'diubah');
    $saya = panggil('GET', '/saya', [], $tok)['data'];
    benar(in_array('capa', $saya['modul'], true), 'sesi yang sama kini melihat CAPA');
    sama($D['pabrik_smg'], $saya['pabrik']['id'], 'pabrik ikut berpindah');
});

uji('UJ-76b', 'Tidak ada yang dapat mengunci sistem dari administratornya sendiri', function () use ($D, $T) {
    $sendiri = panggil('POST', "/pengguna/{$D['admin']}/ubah", ['peran_kode' => 'qhse'], $T['admin']);
    sama(403, $sendiri['status'], 'admin tidak dapat menurunkan perannya sendiri');
    $nonaktif = panggil('POST', "/pengguna/{$D['admin']}/status", ['status' => 'Nonaktif'], $T['admin']);
    sama(403, $nonaktif['status'], 'admin tidak dapat menonaktifkan dirinya sendiri');

    // Admin lain yang bersandi menjadi satu-satunya admin aktif yang dapat masuk.
    $a2 = penggunaBersandi($D, 'admin.dua@kg.test', 'Pagar-Oven-Line3', 'admin');
    $turun = panggil('POST', "/pengguna/$a2/ubah", ['peran_kode' => 'qhse'], $T['admin']);
    sama(400, $turun['status'], 'admin bersandi terakhir tidak dapat diturunkan');
    $mati = panggil('POST', "/pengguna/$a2/status", ['status' => 'Nonaktif'], $T['admin']);
    sama(400, $mati['status'], 'admin bersandi terakhir tidak dapat dinonaktifkan');

    penggunaBersandi($D, 'admin.tiga@kg.test', 'Pagar-Oven-Line3', 'admin');
    sama(200, panggil('POST', "/pengguna/$a2/ubah", ['peran_kode' => 'qhse'], $T['admin'])['status'],
        'dengan admin lain tersedia, penurunan diizinkan');
});

uji('UJ-77', 'Menonaktifkan memutus sesi seketika dan membatalkan tautan', function () use ($D, $T) {
    $id = penggunaBersandi($D, 'keluar1@kg.test', 'Pagar-Oven-Line3', 'operator');
    $tok = panggil('POST', '/sesi/masuk', ['email' => 'keluar1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['data']['token'];
    $tautan = tokenTautan(panggil('POST', "/pengguna/$id/tautan", [], $T['admin'])['data']['tautan']);

    sama(200, panggil('POST', "/pengguna/$id/status", ['status' => 'Nonaktif'], $T['admin'])['status'], 'dinonaktifkan');
    sama(401, panggil('GET', '/saya', [], $tok)['status'], 'sesi yang sedang berjalan langsung mati');
    sama(410, panggil('POST', '/sesi/tautan/pakai', ['token' => $tautan, 'sandi' => 'Sandi-Baru-Sekali'])['status'],
        'tautan yang sempat dikirim ikut batal');

    sama(200, panggil('POST', "/pengguna/$id/status", ['status' => 'Aktif'], $T['admin'])['status'], 'diaktifkan kembali');
    sama(200, panggil('POST', '/sesi/masuk', ['email' => 'keluar1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['status'],
        'masuk lagi dengan sandi lamanya');

    $b = panggil('POST', '/pengguna', ['email' => 'belum.aktif@kg.test', 'nama' => 'Belum Aktif',
        'peran_kode' => 'operator', 'pabrik_id' => $D['pabrik_cbt']], $T['admin']);
    sama(400, panggil('POST', "/pengguna/{$b['data']['id']}/status", ['status' => 'Aktif'], $T['admin'])['status'],
        'akun yang belum pernah menyetel sandi tidak dapat diaktifkan begitu saja');
});

uji('UJ-78', 'Ganti sandi sendiri: sandi lama wajib, perangkat lain terputus, yang ini tetap', function () use ($D) {
    penggunaBersandi($D, 'ganti1@kg.test', 'Pagar-Oven-Line3');
    $ini  = panggil('POST', '/sesi/masuk', ['email' => 'ganti1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['data']['token'];
    $lain = panggil('POST', '/sesi/masuk', ['email' => 'ganti1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['data']['token'];

    $salah = panggil('POST', '/sesi/sandi', ['sandi_lama' => 'bukan-ini', 'sandi_baru' => 'Mesin-Kemas-Baru7'], $ini);
    // Bukan 401: 401 berarti sesi putus, dan antarmuka akan mengeluarkan
    // orang yang hanya salah mengetik sandi lamanya.
    sama(400, $salah['status'], 'sandi lama salah ditolak sebagai isian, bukan sesi putus');
    sama(200, panggil('GET', '/saya', [], $ini)['status'], 'sesi tetap hidup setelah salah ketik');
    $sama = panggil('POST', '/sesi/sandi', ['sandi_lama' => 'Pagar-Oven-Line3', 'sandi_baru' => 'Pagar-Oven-Line3'], $ini);
    sama(400, $sama['status'], 'sandi baru yang sama dengan lama ditolak');

    $ok = panggil('POST', '/sesi/sandi', ['sandi_lama' => 'Pagar-Oven-Line3', 'sandi_baru' => 'Mesin-Kemas-Baru7'], $ini);
    sama(200, $ok['status'], 'diganti');
    sama(200, panggil('GET', '/saya', [], $ini)['status'], 'sesi yang dipakai mengganti tetap hidup');
    sama(401, panggil('GET', '/saya', [], $lain)['status'], 'sesi di perangkat lain diputus');
    sama(401, panggil('POST', '/sesi/masuk', ['email' => 'ganti1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['status'],
        'sandi lama tidak berlaku lagi');
    sama(200, panggil('POST', '/sesi/masuk', ['email' => 'ganti1@kg.test', 'sandi' => 'Mesin-Kemas-Baru7'])['status'],
        'sandi baru berlaku');
});

uji('UJ-78b', 'Atur ulang oleh admin tidak mengunci pemilik akun sebelum tautannya dipakai', function () use ($D, $T) {
    $id = penggunaBersandi($D, 'lupa1@kg.test', 'Pagar-Oven-Line3');
    $lama = panggil('POST', '/sesi/masuk', ['email' => 'lupa1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['data']['token'];

    $t = panggil('POST', "/pengguna/$id/tautan", [], $T['admin']);
    sama('atur-ulang', $t['data']['jenis'], 'akun bersandi mendapat tautan atur ulang');
    sama(200, panggil('GET', '/saya', [], $lama)['status'], 'sesi lama masih hidup setelah tautan dibuat');
    sama(200, panggil('POST', '/sesi/masuk', ['email' => 'lupa1@kg.test', 'sandi' => 'Pagar-Oven-Line3'])['status'],
        'sandi lama masih berlaku sebelum tautan dipakai');

    panggil('POST', '/sesi/tautan/pakai', ['token' => tokenTautan($t['data']['tautan']), 'sandi' => 'Mesin-Kemas-Baru7']);
    sama(401, panggil('GET', '/saya', [], $lama)['status'], 'setelah dipakai, sesi lama diputus');
    sama(200, panggil('POST', '/sesi/masuk', ['email' => 'lupa1@kg.test', 'sandi' => 'Mesin-Kemas-Baru7'])['status'],
        'sandi baru berlaku');
});

uji('UJ-79', 'Setiap tindakan atas akun tercatat atas nama pelakunya', function () use ($D, $T) {
    $b = panggil('POST', '/pengguna', ['email' => 'jejak.akun@kg.test', 'nama' => 'Jejak Akun',
        'peran_kode' => 'operator', 'pabrik_id' => $D['pabrik_cbt']], $T['admin']);
    $id = $b['data']['id'];
    panggil('POST', "/pengguna/$id/ubah", ['peran_kode' => 'qhse'], $T['admin']);
    panggil('POST', "/pengguna/$id/tautan", [], $T['admin']);
    $aksi = array_column(Db::semua(
        "SELECT aksi, pengguna_id FROM jejak_audit WHERE tabel = 'pengguna' AND baris_id = :i ORDER BY id",
        [':i' => $id]), 'pengguna_id', 'aksi');
    foreach (['buat', 'ubah', 'kirim_tautan'] as $a) {
        benar(array_key_exists($a, $aksi), "aksi '$a' tercatat");
        sama($D['admin'], $aksi[$a] ?? null, "aksi '$a' atas nama admin");
    }
});

uji('UJ-79b', 'Admin pertama: tautan ditulis ke berkas 600 dan tidak pernah dicetak', function () {
    $dir = sys_get_temp_dir() . '/kg-uji-admin-' . bin2hex(random_bytes(4));
    mkdir($dir, 0700);
    $berkas = "$dir/tautan.txt";
    $pembungkus = "$dir/jalan.php";
    // Konfigurasi uji dipaksakan di proses anak supaya skrip menulis ke
    // basis data uji, bukan ke basis data yang ditunjuk config.php.
    file_put_contents($pembungkus, '<?php require ' . var_export(dirname(__DIR__) . '/src/muat.php', true) . ";\n"
        . 'KG\\Konfigurasi::paksa(' . var_export(\KG\Konfigurasi::ambil(), true) . ");\n"
        . 'require ' . var_export(dirname(__DIR__) . '/tugas/buat-admin.php', true) . ";\n");

    $jalan = static fn (string $email): string => [
        shell_exec(sprintf('%s %s --email=%s --nama=%s --tautan-ke=%s 2>&1; echo "keluar=$?"',
            escapeshellarg(PHP_BINARY), escapeshellarg($pembungkus), escapeshellarg($email),
            escapeshellarg('Admin Pertama'), escapeshellarg($berkas))) ?? '',
    ][0];

    // Belum ada admin bersandi di data uji (admin@kg.test masuk lewat demo).
    Db::jalankan("UPDATE pengguna SET sandi_hash = NULL WHERE peran_kode = 'admin'");
    $keluar = $jalan('pertama@kg.test');
    benar(str_contains($keluar, 'keluar=0'), 'berhasil: ' . trim($keluar));
    benar(!str_contains($keluar, '#/sandi/'), 'tautan tidak tercetak');
    sama('0600', substr(sprintf('%o', fileperms($berkas)), -4), 'berkas berizin 600');
    $isi = (string) file_get_contents($berkas);
    $token = tokenTautan(trim(substr($isi, (int) strrpos($isi, "\n", -2))));
    sama('pertama@kg.test', panggil('POST', '/sesi/tautan/periksa', ['token' => $token])['data']['email'],
        'tautan di berkas berlaku');

    panggil('POST', '/sesi/tautan/pakai', ['token' => $token, 'sandi' => 'Pagar-Oven-Line3']);
    $lagi = $jalan('kedua@kg.test');
    benar(str_contains($lagi, 'keluar=1') && str_contains($lagi, 'sudah ada'),
        'menolak bila sudah ada admin aktif bersandi');

    @unlink($berkas); @unlink($pembungkus); @rmdir($dir);
});

echo "\nUbah dan hapus catatan K3\n";

/** Jejak audit satu baris, urut waktu. */
function jejakDari(string $tabel, string $id): array
{
    return Db::semua(
        'SELECT aksi, pengguna_id, nilai_sebelum, nilai_sesudah FROM jejak_audit
          WHERE tabel = :t AND baris_id = :i ORDER BY id', [':t' => $tabel, ':i' => $id]);
}

uji('UJ-80', 'Pelapor mengubah laporannya sendiri; jejak hanya memuat yang berubah', function () use ($D, $T) {
    $b = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Lantai licin dekat oven'], $T['operator']);
    $id = $b['data']['id'];
    $u = panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Lantai licin oli dekat oven 3', 'risiko' => 'Tinggi',
                                              'kategori' => 'Unsafe Condition'], $T['operator']);
    sama(200, $u['status'], 'status');
    sama(['isi', 'risiko'], $u['data']['berubah'], 'hanya kolom yang sungguh berubah');

    $lagi = panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Lantai licin oli dekat oven 3'], $T['operator']);
    sama([], $lagi['data']['berubah'], 'kiriman ulang yang sama tidak mengubah apa pun');

    $j = array_values(array_filter(jejakDari('bahaya', $id), fn($r) => $r['aksi'] === 'ubah'));
    sama(1, count($j), 'satu jejak ubah, bukan dua');
    sama($D['operator'], $j[0]['pengguna_id'], 'atas nama pengubah');
    sama(['isi' => 'Lantai licin oli dekat oven 3', 'risiko' => 'Tinggi'],
        json_decode($j[0]['nilai_sesudah'], true), 'nilai sesudah');
    sama(['isi' => 'Lantai licin dekat oven', 'risiko' => 'Sedang'],
        json_decode($j[0]['nilai_sebelum'], true), 'nilai sebelum');
});

uji('UJ-81', 'Status, nomor, dan pabrik tidak dapat diubah lewat formulir', function () use ($D, $T) {
    $b = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Kabel terkelupas'], $T['qhse']);
    $id = $b['data']['id'];
    foreach (['status' => 'Ditangani', 'nomor' => 'HZ-PALSU', 'pabrik_id' => $D['pabrik_smg'],
              'diverifikasi_oleh' => $D['qhse']] as $k => $v) {
        $h = panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Kabel terkelupas di panel', $k => $v], $T['qhse']);
        sama(400, $h['status'], "kolom $k ditolak");
    }
    $r = Db::baris('SELECT status, isi FROM bahaya WHERE id = :i', [':i' => $id]);
    sama('Terbuka', $r['status'], 'status utuh');
    sama('Kabel terkelupas', $r['isi'], 'kiriman yang ditolak tidak menyimpan sebagian');
});

uji('UJ-82', 'Catatan yang sudah diverifikasi terkunci, juga bagi verifikator', function () use ($D, $T) {
    $b = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Pintu darurat terhalang'], $T['operator']);
    $id = $b['data']['id'];
    sama(200, panggil('POST', "/bahaya/$id/verifikasi", [], $T['qhse'])['status'], 'diverifikasi');
    foreach (['operator', 'qhse', 'admin'] as $siapa) {
        $h = panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Diganti sesudah verifikasi'], $T[$siapa]);
        sama(409, $h['status'], "$siapa ditolak");
        sama('TERKUNCI', $h['galat']['kode'] ?? null, 'kode');
    }
    sama(409, panggil('POST', "/bahaya/$id/hapus", ['alasan' => 'Coba hapus'], $T['qhse'])['status'],
        'yang terverifikasi juga tidak dapat dihapus');
});

uji('UJ-83', 'Bukan pembuat dan bukan verifikator: tidak dapat mengubah, tidak dapat menghapus', function () use ($D, $T) {
    $b = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Tangga tanpa pegangan'], $T['qhse']);
    $id = $b['data']['id'];
    sama(403, panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Diubah orang lain'], $T['operator'])['status'],
        'operator tidak dapat mengubah laporan orang lain');

    $milik = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Laporan sendiri'], $T['operator']);
    sama(403, panggil('POST', '/bahaya/' . $milik['data']['id'] . '/hapus', ['alasan' => 'Salah kirim'],
        $T['operator'])['status'], 'pelapor tidak dapat menghapus laporannya sendiri');

    sama(403, panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Dari pabrik lain'], $T['qhse_smg'])['status'],
        'verifikator pabrik lain ditolak cakupannya');
});

uji('UJ-84', 'AB-04 · laporan anonim tidak menyimpan pengirimnya di kolom mana pun', function () use ($D, $T) {
    $b = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Atasan menyuruh lepas APD',
                                     'anonim' => true], $T['operator']);
    $id = $b['data']['id'];
    $r = Db::baris('SELECT pelapor_id, dibuat_oleh, diubah_oleh FROM bahaya WHERE id = :i', [':i' => $id]);
    sama([null, null, null], [$r['pelapor_id'], $r['dibuat_oleh'], $r['diubah_oleh']], 'tiga kolom kosong');
    sama([null], array_column(jejakDari('bahaya', $id), 'pengguna_id'), 'jejak buat tanpa akun');

    $daftar = panggil('GET', '/bahaya', [], $T['operator'])['data'];
    $baris = array_values(array_filter($daftar, fn($x) => $x['id'] === $id))[0];
    sama(false, $baris['milik_saya'], 'daftar tidak mengakuinya sebagai milik pengirim');

    sama(403, panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Ubah'], $T['operator'])['status'],
        'pengirim anonim tidak dapat mengubah (perubahan akan menamainya)');
    sama(200, panggil('POST', "/bahaya/$id/ubah", ['risiko' => 'Tinggi'], $T['qhse'])['status'],
        'verifikator dapat');
});

uji('UJ-85', 'Hapus lunak: wajib beralasan, hilang dari daftar, tercatat di jejak', function () use ($D, $T) {
    $b = panggil('POST', '/bahaya', ['area_id' => $D['area_cbt'], 'isi' => 'Laporan ganda'], $T['operator']);
    $id = $b['data']['id'];
    sama(400, panggil('POST', "/bahaya/$id/hapus", [], $T['qhse'])['status'], 'tanpa alasan ditolak');
    sama(400, panggil('POST', "/bahaya/$id/hapus", ['alasan' => '  '], $T['qhse'])['status'], 'alasan kosong ditolak');

    $h = panggil('POST', "/bahaya/$id/hapus", ['alasan' => 'Ganda dengan ' . $b['data']['nomor']], $T['qhse']);
    sama(200, $h['status'], 'status');
    benar(Db::nilai('SELECT dihapus_pada FROM bahaya WHERE id = :i', [':i' => $id]) !== null, 'baris tetap ada, bertanda');
    benar(!in_array($id, array_column(panggil('GET', '/bahaya', [], $T['qhse'])['data'], 'id'), true),
        'tidak muncul di daftar');

    $j = array_values(array_filter(jejakDari('bahaya', $id), fn($r) => $r['aksi'] === 'hapus_lunak'));
    sama(1, count($j), 'jejak hapus');
    sama($D['qhse'], $j[0]['pengguna_id'], 'atas nama penghapus');
    benar(str_starts_with(json_decode($j[0]['nilai_sesudah'], true)['alasan'], 'Ganda dengan'), 'alasan tersimpan');

    sama(404, panggil('POST', "/bahaya/$id/hapus", ['alasan' => 'Sekali lagi'], $T['qhse'])['status'],
        'yang sudah terhapus tidak ditemukan lagi');
    sama(404, panggil('POST', "/bahaya/$id/ubah", ['isi' => 'Hidupkan lagi'], $T['qhse'])['status'],
        'dan tidak dapat diubah');
});

uji('UJ-86', 'Kejadian: AB-02 pada kenaikan keparahan, AB-01 menahan penghapusan', function () use ($D, $T) {
    $i = panggil('POST', '/insiden', ['area_id' => $D['area_cbt'], 'jenis' => 'Incident', 'keparahan' => 'Ringan',
                                      'ringkas' => 'Jari tergores'], $T['operator']);
    $id = $i['data']['id'];

    $u = panggil('POST', "/insiden/$id/ubah", ['keparahan' => 'Serius', 'hari_kerja_hilang' => 2,
                                               'waktu' => '08:15', 'kronologi' => 'Saat membersihkan pisau'], $T['qhse']);
    sama(200, $u['status'], 'status');
    benar(in_array($D['qhse'], $u['data']['pemberitahuan_ke'] ?? [], true), 'QHSE diberi tahu seketika');
    sama('08:15:00', Db::nilai('SELECT waktu::text FROM insiden WHERE id = :i', [':i' => $id]), 'jam tersimpan');
    sama([], panggil('POST', "/insiden/$id/ubah", ['waktu' => '08:15:00'], $T['qhse'])['data']['berubah'],
        '08:15 dan 08:15:00 nilai yang sama');

    $besok = date('Y-m-d', strtotime('+1 day'));
    sama(400, panggil('POST', "/insiden/$id/ubah", ['tanggal' => $besok], $T['qhse'])['status'], 'tanggal esok ditolak');
    sama(400, panggil('POST', "/insiden/$id/ubah", ['tanggal' => '2026-02-30'], $T['qhse'])['status'], 'tanggal mustahil ditolak');
    sama(400, panggil('POST', "/insiden/$id/ubah", ['hari_kerja_hilang' => -1], $T['qhse'])['status'], 'hari negatif ditolak');
    sama(400, panggil('POST', "/insiden/$id/ubah", ['ringkas' => ''], $T['qhse'])['status'], 'ringkasan wajib');
    sama(400, panggil('POST', "/insiden/$id/ubah", ['area_id' => $D['area_smg']], $T['admin'])['status'],
        'area pabrik lain ditolak, juga bagi admin');

    $c = panggil('POST', '/capa', ['judul' => 'Pelindung pisau', 'sumber_jenis' => 'Insiden', 'sumber_id' => $id,
                                   'pj_id' => $D['operator'], 'tenggat' => date('Y-m-d', strtotime('+7 days'))], $T['qhse']);
    $h = panggil('POST', "/insiden/$id/hapus", ['alasan' => 'Salah input'], $T['qhse']);
    sama(409, $h['status'], 'kejadian ber-CAPA tidak dapat dihapus');
    benar(str_contains($h['galat']['pesan'], $c['data']['nomor']), 'pesan menyebut CAPA penahannya');

    sama(200, panggil('POST', '/capa/' . $c['data']['id'] . '/hapus', ['alasan' => 'Salah input'], $T['qhse'])['status'],
        'CAPA dihapus lebih dulu');
    sama(200, panggil('POST', "/insiden/$id/hapus", ['alasan' => 'Salah input'], $T['qhse'])['status'],
        'lalu kejadiannya');
});

uji('UJ-87', 'CAPA: penanggung jawab harus akun aktif; yang Selesai terkunci', function () use ($D, $T) {
    $i = panggil('POST', '/insiden', ['area_id' => $D['area_cbt'], 'jenis' => 'Nearmiss', 'keparahan' => 'Ringan',
                                      'ringkas' => 'Hampir tertimpa kardus'], $T['qhse']);
    $c = panggil('POST', '/capa', ['judul' => 'Batasi tinggi tumpukan', 'sumber_jenis' => 'Insiden',
                                   'sumber_id' => $i['data']['id'], 'pj_id' => $D['operator'],
                                   'tenggat' => date('Y-m-d', strtotime('+7 days'))], $T['qhse']);
    $id = $c['data']['id'];
    $mati = penggunaBersandi($D, 'nonaktif.capa@kg.test', 'Pagar-Oven-Line3', 'operator', 'Nonaktif');
    sama(400, panggil('POST', "/capa/$id/ubah", ['pj_id' => $mati], $T['qhse'])['status'], 'akun nonaktif ditolak');
    sama(400, panggil('POST', "/capa/$id/ubah", ['pj_id' => 'bukan-uuid'], $T['qhse'])['status'], 'id rusak ditolak');
    $u = panggil('POST', "/capa/$id/ubah", ['pj_id' => $D['qhse2'], 'tenggat' => date('Y-m-d', strtotime('+10 days')),
                                            'prioritas' => 'Tinggi'], $T['qhse']);
    sama(200, $u['status'], 'diubah');
    sama(['pj_id', 'tenggat', 'prioritas'], $u['data']['berubah'], 'kolom berubah');

    panggil('POST', "/capa/$id/verifikasi", ['bukti' => 'Foto rak'], $T['qhse']);
    sama(409, panggil('POST', "/capa/$id/ubah", ['judul' => 'Sesudah selesai'], $T['qhse'])['status'],
        'CAPA Selesai terkunci');
});

uji('UJ-87b', 'Pilihan penanggung jawab: akun aktif sepabrik, tanpa surel, hanya bagi pengisi CAPA', function () use ($D, $T) {
    $pj = panggil('GET', '/acuan', [], $T['qhse'])['data']['penanggung_jawab'];
    benar(count($pj) > 0, 'QHSE mendapat daftar');
    benar(in_array($D['operator'], array_column($pj, 'id'), true), 'rekan sepabrik ada');
    benar(!in_array($D['qhse_smg'], array_column($pj, 'id'), true), 'pabrik lain tidak');
    sama(['id', 'nama', 'pabrik_id'], array_keys($pj[0]), 'hanya id, nama, pabrik');
    sama([], panggil('GET', '/acuan', [], $T['operator'])['data']['penanggung_jawab'], 'operator tidak mengisi CAPA');
    benar(in_array($D['qhse_smg'], array_column(panggil('GET', '/acuan', [], $T['admin'])['data']['penanggung_jawab'], 'id'), true),
        'administrator melihat seluruh pabrik');
});

uji('UJ-88', 'JSA dan izin: yang terlampir tidak dihapus, yang terbit terkunci', function () use ($D, $T) {
    $h = panggil('POST', '/jsa/' . $D['jsa_aman'] . '/hapus', ['alasan' => 'Coba hapus'], $T['manajemen']);
    sama(409, $h['status'], 'JSA Disahkan tidak dapat dihapus');

    $j = panggil('POST', '/jsa', [
        'area_id' => $D['area_cbt'], 'pekerjaan' => 'Ganti sabuk konveyor', 'jenis' => 'Non-rutin',
        'langkah' => [['kerja' => 'Isolasi energi', 'bahaya' => 'Tersengat', 'kemungkinan' => 2, 'keparahan' => 3,
                       'kemungkinan_sisa' => 1, 'keparahan_sisa' => 2]],
    ], $T['qhse']);
    $jid = $j['data']['id'];
    sama(200, panggil('POST', "/jsa/$jid/ubah", ['pekerjaan' => 'Ganti sabuk konveyor line 2'], $T['qhse'])['status'],
        'penyusun (Isi) mengubah drafnya');
    sama(400, panggil('POST', "/jsa/$jid/ubah", ['jenis' => 'Sekali'], $T['qhse'])['status'], 'pilihan di luar daftar');

    $z = panggil('POST', '/izin', ['area_id' => $D['area_cbt'], 'jenis' => 'panas', 'judul' => 'Las rangka',
                                   'pengawas' => 'Budi', 'jsa_id' => $jid], $T['qhse']);
    $hj = panggil('POST', "/jsa/$jid/hapus", ['alasan' => 'Tidak dipakai'], $T['manajemen']);
    sama(409, $hj['status'], 'JSA yang terlampir pada izin tidak dapat dihapus');
    benar(str_contains($hj['galat']['pesan'], $z['data']['nomor']), 'pesan menyebut izinnya');

    $zid = $z['data']['id'];
    sama(400, panggil('POST', "/izin/$zid/ubah", ['pekerja' => 0], $T['qhse'])['status'], 'pekerja nol ditolak');
    $u = panggil('POST', "/izin/$zid/ubah", ['pekerja' => '3', 'mulai' => '2026-10-05 08:00'], $T['qhse']);
    sama(200, $u['status'], 'izin menunggu dapat diubah');
    sama(['pekerja', 'mulai'], $u['data']['berubah'], 'kolom berubah');
    sama(200, panggil('POST', "/izin/$zid/hapus", ['alasan' => 'Pekerjaan dibatalkan'], $T['qhse'])['status'],
        'izin menunggu dapat dihapus');
    sama(200, panggil('POST', "/jsa/$jid/hapus", ['alasan' => 'Pekerjaan dibatalkan'], $T['manajemen'])['status'],
        'setelah izinnya dihapus, JSA-nya boleh');

    $zs = Db::nilai("SELECT id FROM izin WHERE status = 'Aktif' AND dihapus_pada IS NULL LIMIT 1");
    if ($zs !== null) {
        sama(409, panggil('POST', "/izin/$zs/ubah", ['judul' => 'Ubah izin aktif'], $T['admin'])['status'],
            'izin aktif terkunci');
    }
});

uji('UJ-89', 'Penanda catatan yang rusak dijawab 404, bukan galat basis data', function () use ($T) {
    $kolom = ['bahaya' => 'isi', 'insiden' => 'ringkas', 'capa' => 'judul', 'izin' => 'judul', 'jsa' => 'pekerjaan'];
    foreach ($kolom as $j => $k) {
        sama(404, panggil('POST', "/$j/bukan-uuid/ubah", [$k => 'x'], $T['admin'])['status'], "$j ubah");
        sama(404, panggil('POST', "/$j/bukan-uuid/hapus", ['alasan' => 'Penanda rusak'], $T['admin'])['status'], "$j hapus");
    }
});

echo "\nYang sebelumnya belum dapat disimpan\n";

uji('UJ-90', 'Dokumen kepatuhan: masa berlaku wajib, kode CMP berurutan, jejak tercatat', function () use ($T) {
    sama(400, panggil('POST', '/dokumen/eksternal', ['jenis' => 'Izin Peralatan', 'judul' => 'SKLO Kompresor',
        'penerbit' => 'Disnaker'], $T['qhse'])['status'], 'tanpa masa berlaku ditolak');
    sama(400, panggil('POST', '/dokumen/eksternal', ['jenis' => 'Izin Peralatan', 'judul' => 'SKLO', 'penerbit' => 'Disnaker',
        'berlaku' => '2027-02-30'], $T['qhse'])['status'], 'tanggal mustahil ditolak');
    sama(400, panggil('POST', '/dokumen/eksternal', ['jenis' => 'Lain-lain', 'judul' => 'SKLO', 'penerbit' => 'Disnaker',
        'berlaku' => '2027-02-01'], $T['qhse'])['status'], 'jenis di luar daftar ditolak');
    $a = panggil('POST', '/dokumen/eksternal', ['jenis' => 'Izin Peralatan', 'judul' => 'SKLO Bejana Tekan',
        'penerbit' => 'Disnaker', 'nomor' => '560/123', 'berlaku' => '2027-06-30'], $T['qhse']);
    sama(201, $a['status'], 'terdaftar');
    $b = panggil('POST', '/dokumen/eksternal', ['jenis' => 'Izin Lingkungan', 'judul' => 'Persetujuan Teknis',
        'penerbit' => 'DLH', 'berlaku' => '2028-01-01'], $T['qhse']);
    benar((int) substr($b['data']['kode'], 4) === (int) substr($a['data']['kode'], 4) + 1, 'kode berikutnya');
    $daftar = panggil('GET', '/dokumen/eksternal', [], $T['qhse'])['data'];
    benar(in_array($a['data']['kode'], array_column($daftar, 'kode'), true), 'muncul di daftar');
    sama(403, panggil('POST', '/dokumen/eksternal', ['jenis' => 'Izin Peralatan', 'judul' => 'x', 'penerbit' => 'x',
        'berlaku' => '2027-01-01'], $T['operator'])['status'], 'operator tidak berwenang');
});

uji('UJ-91', 'Hasil uji lingkungan: memenuhi dihitung dari angka, bukan dari centang', function () use ($T) {
    $h = panggil('POST', '/lingkungan', ['kode' => 'pppa', 'tanggal' => date('Y-m-d'), 'lab' => 'Lab Uji KAN',
        'parameter' => [
            ['nama' => 'BOD', 'nilai' => '62', 'satuan' => 'mg/L', 'ambang' => '≤ 50', 'memenuhi' => true],
            ['nama' => 'pH', 'nilai' => '7,2', 'ambang' => '6,0 – 9,0'],
            ['nama' => 'Bau', 'nilai' => 'Tidak berbau', 'ambang' => 'Tidak berbau', 'memenuhi' => true],
        ]], $T['qhse']);
    sama(201, $h['status'], 'tersimpan');
    sama(['BOD'], $h['data']['melewati'], 'BOD 62 > 50 melewati walau dicentang memenuhi');

    sama(400, panggil('POST', '/lingkungan', ['kode' => 'pppa', 'tanggal' => date('Y-m-d'), 'lab' => 'Lab',
        'parameter' => [['nama' => 'Warna', 'nilai' => 'Jernih', 'ambang' => 'Jernih']]], $T['qhse'])['status'],
        'ambang bukan angka tanpa pilihan memenuhi ditolak');
    sama(400, panggil('POST', '/lingkungan', ['kode' => 'pppa', 'tanggal' => date('Y-m-d', strtotime('+2 days')),
        'lab' => 'Lab', 'parameter' => [['nama' => 'BOD', 'nilai' => '1', 'ambang' => '≤ 50']]], $T['qhse'])['status'],
        'tanggal esok ditolak');

    $ulang = panggil('POST', '/lingkungan', ['kode' => 'pppa', 'tanggal' => date('Y-m-d'), 'lab' => 'Lab Uji KAN',
        'parameter' => [['nama' => 'BOD', 'nilai' => '41', 'ambang' => '≤ 50']]], $T['qhse']);
    sama(true, $ulang['data']['mengganti'], 'uji ulang bulan yang sama menggantikan');
    $tampil = panggil('GET', '/lingkungan', [], $T['qhse'])['data']['pppa'];
    sama(1, count($tampil['param']), 'parameter lama diganti, tidak ditumpuk');
    sama(true, $tampil['param'][0]['memenuhi'], 'hasil uji ulang memenuhi');
    sama(403, panggil('POST', '/lingkungan', ['kode' => 'pppa', 'tanggal' => date('Y-m-d'), 'lab' => 'x',
        'parameter' => [['nama' => 'BOD', 'nilai' => '1', 'ambang' => '≤ 50']]], $T['operator'])['status'], 'operator tidak berwenang');
});

uji('UJ-92', 'Tandai semua terbaca: hanya kotak masuk sendiri, pengingat tidak berhenti', function () use ($D, $T) {
    Db::jalankan("INSERT INTO notifikasi (pabrik_id, penerima_id, jenis, modul, judul, isi, sebab, aksi)
                  VALUES (:pb, :q, 'high', 'capa', 'Uji 1', 'isi', 'lewat_tenggat', 'capa'),
                         (:pb, :q2, 'high', 'capa', 'Uji 2', 'isi', 'lewat_tenggat', 'capa')",
        [':pb' => $D['pabrik_cbt'], ':q' => $D['qhse'], ':q2' => $D['qhse2']]);
    $h = panggil('POST', '/notifikasi/terbaca-semua', [], $T['qhse']);
    sama(200, $h['status'], 'status');
    benar($h['data']['ditandai'] >= 1, 'sedikitnya satu ditandai');
    sama(null, Db::nilai("SELECT dibaca_pada FROM notifikasi WHERE judul = 'Uji 2'"), 'milik orang lain tidak tersentuh');
    sama(null, Db::nilai("SELECT selesai_pada FROM notifikasi WHERE judul = 'Uji 1'"), 'tidak menutup (AB-31)');
});

echo "\nUbah dan hapus modul lainnya\n";

/** Satu catatan baru per modul, dibuat lewat API yang sama dengan antarmuka. */
function catatanUji(array $D, array $T, string $jenis): string
{
    $hari = date('Y-m-d');
    $buat = [
        'observasi' => ['/observasi', ['area_id' => $D['area_cbt'], 'aman' => 5, 'berisiko' => 0, 'catatan' => 'Uji ubah'], 'qhse'],
        'observasi-apd' => ['/observasi-apd', ['area_id' => $D['area_cbt'], 'diamati' => 5, 'patuh' => 4, 'catatan' => 'Uji ubah'], 'qhse'],
        'inspeksi' => ['/inspeksi', ['jenis' => 'APAR', 'area' => 'Gudang', 'butir' => [['butir' => 'Tekanan normal']]], 'qhse'],
        'checklist' => ['/checklist', ['nama' => 'P2H Forklift', 'frekuensi' => 'Harian', 'butir' => [['butir' => 'Rem']]], 'qhse'],
        'hiradc' => ['/hiradc', ['proses' => 'Oven', 'aktivitas' => 'Bersih', 'bahaya' => 'Panas', 'risiko' => 'Luka bakar',
                                 'korban' => 'Operator', 'kemungkinan' => 3, 'keparahan' => 3, 'kategori' => 'Fisik'], 'qhse'],
        'risiko' => ['/risiko', ['proses' => 'Kompresor', 'ancaman' => 'Bocor', 'penyebab' => 'Seal', 'dampak' => 'Henti',
                                 'kemungkinan' => 2, 'keparahan' => 3, 'mitigasi' => 'Ganti seal'], 'qhse'],
        'induksi' => ['/induksi', ['nama' => 'Peserta Uji', 'jenis' => 'Kontraktor', 'tanggal' => $hari, 'nilai' => 90], 'qhse'],
        'regulasi' => ['/regulasi', ['nomor' => 'PP Uji ' . uniqid(), 'judul' => 'Uji', 'penerbit' => 'Pemerintah', 'bidang' => 'K3 Umum',
                                     'pasal' => '1', 'penerapan' => 'Diterapkan'], 'qhse'],
        'kegiatan' => ['/kegiatan', ['jenis' => 'Safety Talk', 'judul' => 'Uji', 'peserta' => 10], 'qhse'],
        'pelatihan' => ['/pelatihan', ['nama' => 'Uji', 'jenis' => 'Internal', 'target' => 10, 'rencana_tanggal' => 'Nov 2026',
                                       'penyelenggara' => 'Internal'], 'qhse'],
        'dokumen/internal' => ['/dokumen/internal', ['judul' => 'Prosedur Uji', 'jenis' => 'Prosedur', 'level' => 2], 'qhse'],
        'dokumen/eksternal' => ['/dokumen/eksternal', ['jenis' => 'Izin Peralatan', 'judul' => 'SKLO Uji', 'penerbit' => 'Disnaker',
                                                       'berlaku' => '2027-12-31'], 'qhse'],
    ];
    if ($jenis === 'audit') {
        return (string) Db::nilai("INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai)
            VALUES (:n, :p, 'ISO 45001', 'Seluruh pabrik', 'Auditor Uji', current_date) RETURNING id",
            [':n' => 'AUD-UJI-' . uniqid(), ':p' => $D['pabrik_cbt']]);
    }
    [$jalur, $isi, $siapa] = $buat[$jenis];
    $h = panggil('POST', $jalur, $isi, $T[$siapa]);
    if ($h['status'] !== 201) throw new \RuntimeException("membuat $jenis: " . json_encode($h['galat']));
    return $h['data']['id'];
}

uji('UJ-93', 'Seluruh modul lainnya: ubah satu kolom, kolom asing ditolak, hapus beralasan', function () use ($D, $T) {
    $ubah = [
        'observasi' => ['catatan', 'Catatan diperbaiki'], 'observasi-apd' => ['catatan', 'Catatan diperbaiki'],
        'inspeksi' => ['area', 'Gudang Bahan Baku'], 'checklist' => ['lokasi', 'FL-05'],
        'hiradc' => ['korban', 'Operator dan teknisi'], 'risiko' => ['mitigasi', 'Ganti seal tiap 6 bulan'],
        'induksi' => ['asal', 'PT Kontraktor Uji'], 'regulasi' => ['pasal', 'Pasal 2'],
        'kegiatan' => ['durasi_jam', '1,5'], 'pelatihan' => ['status', 'Tertunda'],
        'dokumen/internal' => ['pemilik', 'QHSE Manager'], 'dokumen/eksternal' => ['nomor', '560/999'],
        'audit' => ['auditor', 'Auditor Lain'],
    ];
    foreach ($ubah as $jenis => [$kolom, $nilai]) {
        $id = catatanUji($D, $T, $jenis);
        $siapa = $jenis === 'audit' ? 'admin' : 'qhse';
        $h = panggil('POST', "/$jenis/$id/ubah", [$kolom => $nilai], $T[$siapa]);
        sama(200, $h['status'], "$jenis ubah " . json_encode($h['galat']));
        sama([$kolom], $h['data']['berubah'], "$jenis kolom berubah");
        sama(400, panggil('POST', "/$jenis/$id/ubah", ['pabrik_id' => $D['pabrik_smg']], $T[$siapa])['status'], "$jenis kolom asing");
        sama(400, panggil('POST', "/$jenis/$id/hapus", [], $T['admin'])['status'], "$jenis hapus tanpa alasan");
        sama(200, panggil('POST', "/$jenis/$id/hapus", ['alasan' => 'Catatan percobaan'], $T['admin'])['status'], "$jenis hapus");
        sama(404, panggil('POST', "/$jenis/$id/ubah", [$kolom => $nilai], $T['admin'])['status'], "$jenis sesudah dihapus");
    }
});

uji('UJ-94', 'AB-23/24 · mengubah nilai induksi menghitung ulang status dan masa berlaku', function () use ($D, $T) {
    $id = catatanUji($D, $T, 'induksi');
    $h = panggil('POST', "/induksi/$id/ubah", ['nilai' => 40], $T['qhse']);
    sama(200, $h['status'], 'diubah');
    $r = Db::baris('SELECT status, berlaku FROM induksi WHERE id = :i', [':i' => $id]);
    sama('Tidak Lulus', $r['status'], 'tidak lulus');
    sama(null, $r['berlaku'], 'tanpa masa berlaku');
    benar(in_array('status', $h['data']['berubah'], true), 'perubahan status tercatat');
    panggil('POST', "/induksi/$id/ubah", ['nilai' => 85, 'jenis' => 'Tamu'], $T['qhse']);
    $r = Db::baris('SELECT status, berlaku FROM induksi WHERE id = :i', [':i' => $id]);
    sama(date('Y-m-d', strtotime('+3 months')), $r['berlaku'], 'tamu berlaku 3 bulan');
});

uji('UJ-95', 'AB-22 dan AB-20 tetap berlaku saat mengubah', function () use ($D, $T) {
    $reg = catatanUji($D, $T, 'regulasi');
    $h = panggil('POST', "/regulasi/$reg/ubah", ['status' => 'Terpenuhi'], $T['qhse']);
    sama(409, $h['status'], 'Terpenuhi tanpa bukti ditolak');
    sama('AB-22', $h['galat']['aturan'] ?? null, 'kode aturan');
    sama(200, panggil('POST', "/regulasi/$reg/ubah", ['status' => 'Terpenuhi', 'bukti' => 'Laporan riksa uji 2026'], $T['qhse'])['status'],
        'dengan bukti diterima');
    sama(409, panggil('POST', "/regulasi/$reg/ubah", ['bukti' => ''], $T['qhse'])['status'], 'bukti tidak dapat dikosongkan sesudahnya');

    $dok = catatanUji($D, $T, 'dokumen/internal');
    $h = panggil('POST', "/dokumen/internal/$dok/ubah", ['status' => 'Berlaku', 'tinjau' => ''], $T['qhse']);
    sama('AB-20', $h['galat']['aturan'] ?? null, 'Berlaku tanpa tanggal tinjau ditolak');
});

uji('UJ-96', 'Observasi: perilaku berisiko wajib berkategori; HIRADC: sisa tidak lewat sini', function () use ($D, $T) {
    $o = catatanUji($D, $T, 'observasi');
    sama(400, panggil('POST', "/observasi/$o/ubah", ['berisiko' => 2], $T['qhse'])['status'], 'berisiko tanpa kategori');
    sama(200, panggil('POST', "/observasi/$o/ubah", ['berisiko' => 2, 'kategori' => 'apd'], $T['qhse'])['status'], 'dengan kategori');
    sama(400, panggil('POST', "/observasi/$o/ubah", ['aman' => 0, 'berisiko' => 0], $T['qhse'])['status'], 'tanpa pengamatan');

    $h = catatanUji($D, $T, 'hiradc');
    sama(400, panggil('POST', "/hiradc/$h/ubah", ['kemungkinan_sisa' => 1], $T['qhse'])['status'], 'sisa ditolak (AB-15)');
    sama(400, panggil('POST', "/hiradc/$h/ubah", ['kemungkinan' => 6], $T['qhse'])['status'], 'skala di luar 1–5');
    sama(400, panggil('POST', "/hiradc/$h/ubah", ['kategori' => 'Tidak Ada'], $T['qhse'])['status'], 'sumber bahaya asing');
    sama(200, panggil('POST', "/hiradc/$h/ubah", ['status' => 'Selesai'], $T['qhse'])['status'], 'ditutup');
    sama(409, panggil('POST', "/hiradc/$h/ubah", ['korban' => 'x'], $T['qhse'])['status'], 'yang Selesai terkunci');
});

uji('UJ-97', 'Siapa boleh: pengisi mengubah daftar bersama; HIRADC dihapus Plant Manager', function () use ($D, $T) {
    $reg = catatanUji($D, $T, 'regulasi');
    sama(200, panggil('POST', "/regulasi/$reg/ubah", ['pasal' => 'Pasal 3'], $T['lingkungan'])['status'],
        'petugas lingkungan (Isi) mengubah peraturan yang dibuat QHSE');
    sama(403, panggil('POST', "/regulasi/$reg/ubah", ['pasal' => 'Pasal 4'], $T['manajemen'])['status'], 'manajemen (Baca) tidak');
    sama(403, panggil('POST', "/regulasi/$reg/ubah", ['pasal' => 'Pasal 5'], $T['qhse_smg'])['status'], 'pabrik lain tidak');

    $h = catatanUji($D, $T, 'hiradc');
    sama(403, panggil('POST', "/hiradc/$h/hapus", ['alasan' => 'Ganda dengan baris lain'], $T['qhse'])['status'], 'QHSE (Isi) tidak menghapus HIRADC');
    sama(200, panggil('POST', "/hiradc/$h/hapus", ['alasan' => 'Ganda dengan baris lain'], $T['manajemen'])['status'], 'Plant Manager boleh');

    $obs = catatanUji($D, $T, 'observasi');
    sama(403, panggil('POST', "/observasi/$obs/ubah", ['catatan' => 'x'], $T['operator'])['status'], 'operator bukan pembuatnya');
});

uji('UJ-98', 'Audit bertemuan tidak dihapus; kegiatan tanpa kolom pengubah tetap dapat diubah', function () use ($D, $T) {
    $a = catatanUji($D, $T, 'audit');
    panggil('POST', "/audit/$a/temuan", ['klausul' => '6.1.2', 'kategori' => 'Minor', 'isi' => 'Temuan uji'], $T['qhse']);
    $h = panggil('POST', "/audit/$a/hapus", ['alasan' => 'Salah input'], $T['admin']);
    sama(409, $h['status'], 'audit bertemuan ditahan');

    $k = catatanUji($D, $T, 'kegiatan');
    sama(200, panggil('POST', "/kegiatan/$k/ubah", ['peserta' => 25], $T['qhse'])['status'], 'kegiatan diubah');
    sama('25', (string) Db::nilai('SELECT peserta FROM kegiatan WHERE id = :i', [':i' => $k]), 'tersimpan');
    $j = array_values(array_filter(jejakDari('kegiatan', $k), fn($r) => $r['aksi'] === 'ubah'));
    sama(1, count($j), 'jejak tetap tercatat');
});

echo "\nCAPA dari setiap sumbernya\n";

uji('UJ-99', 'AB-01 · CAPA dari keenam sumber, termasuk temuan audit dan parameter lingkungan', function () use ($D, $T) {
    $tenggat = date('Y-m-d', strtotime('+14 days'));
    $a = catatanUji($D, $T, 'audit');
    $t = panggil('POST', "/audit/$a/temuan", ['klausul' => '8.1', 'kategori' => 'Major', 'isi' => 'APAR kedaluwarsa'], $T['qhse']);
    $l = panggil('POST', '/lingkungan', ['kode' => 'pppu', 'tanggal' => date('Y-m-d'), 'lab' => 'Lab',
        'parameter' => [['nama' => 'NO2', 'nilai' => '450', 'ambang' => '≤ 400']]], $T['qhse']);
    $param = panggil('GET', '/lingkungan', [], $T['qhse'])['data']['pppu']['param'][0]['id'];
    $o = catatanUji($D, $T, 'observasi');
    $sumber = [
        'Insiden'    => panggil('POST', '/insiden', ['area_id' => $D['area_cbt'], 'jenis' => 'Nearmiss', 'keparahan' => 'Ringan',
                                                      'ringkas' => 'Sumber CAPA'], $T['qhse'])['data']['id'],
        'Audit'      => $t['data']['id'],
        'Inspeksi'   => catatanUji($D, $T, 'inspeksi'),
        'HIRADC'     => catatanUji($D, $T, 'hiradc'),
        'Observasi'  => $o,
        'Lingkungan' => $param,
    ];
    foreach ($sumber as $jenis => $id) {
        $h = panggil('POST', '/capa', ['judul' => "Perbaikan dari $jenis", 'sumber_jenis' => $jenis, 'sumber_id' => $id,
            'pj_id' => $D['operator'], 'tenggat' => $tenggat], $T['qhse']);
        sama(201, $h['status'], "CAPA dari $jenis: " . json_encode($h['galat']));
        benar($h['data']['sumber_nomor'] !== '', "$jenis membawa nomor sumber");
    }
    sama(409, panggil('POST', '/capa', ['judul' => 'x', 'sumber_jenis' => 'Audit', 'sumber_id' => 'bukan-uuid',
        'pj_id' => $D['operator'], 'tenggat' => $tenggat], $T['qhse'])['status'], 'sumber rusak → AB-01, bukan galat basis data');

    // Uji ulang lingkungan tidak memutus CAPA yang menunjuk parameternya.
    panggil('POST', '/lingkungan', ['kode' => 'pppu', 'tanggal' => date('Y-m-d'), 'lab' => 'Lab',
        'parameter' => [['nama' => 'NO2', 'nilai' => '310', 'ambang' => '≤ 400']]], $T['qhse']);
    $p2 = panggil('GET', '/lingkungan', [], $T['qhse'])['data']['pppu']['param'][0];
    sama($param, $p2['id'], 'parameter yang sama diperbarui, bukan diganti');
    sama(true, $p2['memenuhi'], 'hasil uji ulang memenuhi');
});

uji('UJ-99b', 'CAPA: penanggung jawab aktif, tenggat sah, prioritas dikenal', function () use ($D, $T) {
    $i = panggil('POST', '/insiden', ['area_id' => $D['area_cbt'], 'jenis' => 'Nearmiss', 'keparahan' => 'Ringan',
        'ringkas' => 'Sumber CAPA'], $T['qhse'])['data']['id'];
    $dasar = ['judul' => 'x', 'sumber_jenis' => 'Insiden', 'sumber_id' => $i, 'pj_id' => $D['operator'],
              'tenggat' => date('Y-m-d', strtotime('+7 days'))];
    sama(400, panggil('POST', '/capa', ['pj_id' => 'bukan-uuid'] + $dasar, $T['qhse'])['status'], 'pj rusak');
    sama(400, panggil('POST', '/capa', ['tenggat' => '2026-02-30'] + $dasar, $T['qhse'])['status'], 'tenggat mustahil');
    sama(400, panggil('POST', '/capa', ['tenggat' => date('Y-m-d', strtotime('-1 day'))] + $dasar, $T['qhse'])['status'], 'tenggat lampau');
    sama(400, panggil('POST', '/capa', ['prioritas' => 'Darurat'] + $dasar, $T['qhse'])['status'], 'prioritas asing');
});

echo "\nHasil inspeksi dan checklist\n";

uji('UJ-100', 'Inspeksi: jawaban per butir, Tidak Sesuai wajib berurai, selesai menuntut semua terjawab', function () use ($D, $T) {
    $i = panggil('POST', '/inspeksi', ['jenis' => 'APAR', 'area' => 'Gudang',
        'butir' => [['butir' => 'Tekanan normal'], ['butir' => 'Segel utuh'], ['butir' => 'Selang baik']]], $T['qhse']);
    $id = $i['data']['id'];
    $b = panggil('GET', "/inspeksi/$id/butir", [], $T['qhse'])['data'];
    sama(3, count($b), 'tiga butir');
    benar(isset($b[0]['id']), 'butir membawa penanda');

    sama(400, panggil('POST', "/inspeksi/$id/jawab", ['jawaban' => [['id' => $b[0]['id'], 'jawab' => 'Tidak Sesuai']]],
        $T['qhse'])['status'], 'Tidak Sesuai tanpa uraian ditolak');
    $h = panggil('POST', "/inspeksi/$id/jawab", ['jawaban' => [
        ['id' => $b[0]['id'], 'jawab' => 'Sesuai'], ['id' => $b[1]['id'], 'jawab' => 'Tidak Sesuai', 'catatan' => 'Segel putus']]], $T['qhse']);
    sama('Dalam Proses', $h['data']['status'], 'sebagian terjawab');
    sama(400, panggil('POST', "/inspeksi/$id/jawab", ['jawaban' => [], 'selesai' => true], $T['qhse'])['status'],
        'belum semua terjawab tidak dapat diselesaikan');
    $s = panggil('POST', "/inspeksi/$id/jawab", ['jawaban' => [['id' => $b[2]['id'], 'jawab' => 'Tidak Berlaku']], 'selesai' => true], $T['qhse']);
    sama('Selesai', $s['data']['status'], 'selesai');
    sama(1, $s['data']['tidak_sesuai'], 'satu temuan');
    sama(409, panggil('POST', "/inspeksi/$id/jawab", ['jawaban' => [['id' => $b[0]['id'], 'jawab' => 'Tidak Sesuai', 'catatan' => 'x']]],
        $T['qhse'])['status'], 'yang selesai terkunci');

    $lain = panggil('POST', '/inspeksi', ['jenis' => 'P3K', 'area' => 'Klinik', 'butir' => [['butir' => 'Isi lengkap']]], $T['qhse']);
    sama(400, panggil('POST', '/inspeksi/' . $lain['data']['id'] . '/jawab', ['jawaban' => [['id' => $b[0]['id'], 'jawab' => 'Sesuai']]],
        $T['qhse'])['status'], 'butir inspeksi lain ditolak');
    sama(403, panggil('POST', "/inspeksi/$id/jawab", ['jawaban' => []], $T['qhse_smg'])['status'], 'pabrik lain ditolak');
});

uji('UJ-101', 'AB-08 · Tidak Sesuai mengunci unit; dibuka hanya oleh checklist ulang yang lulus seluruhnya', function () use ($D, $T) {
    $unit = (string) Db::nilai("INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
        VALUES (:p, :k, 'Forklift Uji', 'Forklift') RETURNING id", [':p' => $D['pabrik_cbt'], ':k' => 'FL-UJI-' . uniqid()]);
    $smgUnit = (string) Db::nilai("INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
        VALUES (:p, :k, 'Forklift SMG', 'Forklift') RETURNING id", [':p' => $D['pabrik_smg'], ':k' => 'FL-SMG-' . uniqid()]);
    sama(400, panggil('POST', '/checklist', ['nama' => 'P2H Forklift', 'unit_id' => $smgUnit,
        'butir' => [['butir' => 'Rem']]], $T['qhse'])['status'], 'unit pabrik lain ditolak');

    $c1 = panggil('POST', '/checklist', ['nama' => 'P2H Forklift', 'unit_id' => $unit,
        'butir' => [['butir' => 'Rem'], ['butir' => 'Klakson']]], $T['qhse'])['data']['id'];
    $b1 = panggil('GET', "/checklist/$c1/butir", [], $T['qhse'])['data'];
    $h = panggil('POST', "/checklist/$c1/jawab", ['jawaban' => [
        ['id' => $b1[0]['id'], 'jawab' => 'Tidak Sesuai', 'catatan' => 'Rem blong'], ['id' => $b1[1]['id'], 'jawab' => 'Sesuai']],
        'selesai' => true], $T['qhse']);
    sama('Terkunci', $h['data']['unit']['status'], 'unit terkunci');

    $c2 = panggil('POST', '/checklist', ['nama' => 'P2H Forklift', 'unit_id' => $unit,
        'butir' => [['butir' => 'Rem'], ['butir' => 'Klakson']]], $T['qhse'])['data']['id'];
    $b2 = panggil('GET', "/checklist/$c2/butir", [], $T['qhse'])['data'];
    $sebagian = panggil('POST', "/checklist/$c2/jawab", ['jawaban' => [['id' => $b2[0]['id'], 'jawab' => 'Sesuai']]], $T['qhse']);
    sama('Terkunci', $sebagian['data']['unit']['status'], 'belum selesai: tetap terkunci');
    $lulus = panggil('POST', "/checklist/$c2/jawab", ['jawaban' => [['id' => $b2[1]['id'], 'jawab' => 'Sesuai']], 'selesai' => true], $T['qhse']);
    sama('Layak', $lulus['data']['unit']['status'], 'checklist ulang yang lulus membuka kunci');
});

echo "\nAudit baru\n";

uji('UJ-102', 'Audit direncanakan dari layar: Terbuka, bernomor AUD, tanggal sah', function () use ($D, $T) {
    $dasar = ['standar' => 'ISO 45001:2018', 'lingkup' => 'Seluruh area produksi', 'auditor' => 'Tim Audit Internal'];
    sama(400, panggil('POST', '/audit', $dasar, $T['qhse'])['status'], 'tanpa tanggal mulai ditolak');
    sama(400, panggil('POST', '/audit', $dasar + ['mulai' => '2026-02-30'], $T['qhse'])['status'], 'tanggal mustahil ditolak');
    sama(400, panggil('POST', '/audit', $dasar + ['mulai' => '2026-11-10', 'selesai' => '2026-11-09'], $T['qhse'])['status'],
        'selesai sebelum mulai ditolak');
    $h = panggil('POST', '/audit', $dasar + ['mulai' => '2026-11-10', 'selesai' => '2026-11-12'], $T['qhse']);
    sama(201, $h['status'], 'dibuat');
    benar(str_starts_with($h['data']['nomor'], 'AUD-'), 'bernomor AUD');
    $a = array_values(array_filter(panggil('GET', '/audit', [], $T['qhse'])['data'], fn($x) => $x['id'] === $h['data']['id']))[0];
    sama('Terbuka', $a['status'], 'berstatus Terbuka');
    $t = panggil('POST', '/audit/' . $h['data']['id'] . '/temuan', ['klausul' => '6.1', 'kategori' => 'Minor', 'isi' => 'Uji'], $T['qhse']);
    sama(201, $t['status'], 'temuan dapat ditambahkan pada audit baru');
    sama(403, panggil('POST', '/audit', $dasar + ['mulai' => '2026-11-10'], $T['operator'])['status'], 'operator tidak berwenang');
    sama(403, panggil('POST', '/audit', $dasar + ['mulai' => '2026-11-10', 'pabrik_id' => $D['pabrik_smg']], $T['qhse'])['status'],
        'pabrik lain ditolak');
});
