<?php
declare(strict_types=1);

/**
 * Kasus uji aturan bisnis dan hak akses — docs/11-rencana-pengujian.md.
 *
 * Setiap aturan pada docs/03 yang sudah diterapkan wajib punya kasus yang
 * membuktikan PENOLAKANNYA, bukan sekadar membuktikan jalur bahagianya.
 */

namespace KG\Uji;

use KG\Db;

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
