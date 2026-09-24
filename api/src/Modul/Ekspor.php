<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Konfigurasi, Permintaan, Sesi, Wewenang, Xlsx};

/**
 * Modul ekspor · Excel dan berkas cetak.
 *
 * Tiga hal yang mengikat:
 *
 *   1. Ekspor menembus hak akses bila tidak dijaga. Setiap ekspor melewati
 *      pemeriksaan modul dan cakupan pabrik yang sama dengan layarnya — inilah
 *      cara paling umum data pabrik lain keluar dari sistem.
 *   2. Ekspor dicatat pada jejak audit. Siapa mengunduh apa, kapan. Catatan K3
 *      memuat nama, cedera, dan nilai ujian; unduhan yang tidak berjejak tidak
 *      dapat dipertanggungjawabkan saat ada yang bocor.
 *   3. Kolomnya mengikuti layarnya. Ekspor yang berisi kolom lain membuat dua
 *      versi kebenaran, dan yang dibawa ke rapat adalah yang lebih mudah
 *      dibaca, bukan yang benar.
 */
final class Ekspor
{
    /**
     * Daftar yang dapat diekspor: modul, judul, kolom tampil, dan kuerinya.
     *
     * @return array<string,array{modul:string,judul:string,kolom:array<string,string>,sql:string,urut:string}>
     */
    private static function daftar(): array
    {
        return [
            'bahaya' => ['modul' => 'hazard', 'judul' => 'Laporan Bahaya K3L',
                'kolom' => ['nomor' => 'Nomor', 'kategori' => 'Kategori', 'area' => 'Area',
                            'isi' => 'Keterangan', 'risiko' => 'Risiko', 'pelapor' => 'Pelapor',
                            'status' => 'Status', 'dibuat' => 'Dilaporkan'],
                'sql' => "SELECT b.nomor, b.kategori, a.nama AS area, b.isi, b.risiko,
                                 CASE WHEN b.anonim THEN 'Anonim' ELSE pl.nama END AS pelapor,
                                 b.status, to_char(b.dibuat_pada, 'YYYY-MM-DD HH24:MI') AS dibuat
                            FROM bahaya b JOIN area a ON a.id = b.area_id
                       LEFT JOIN pengguna pl ON pl.id = b.pelapor_id
                           WHERE b.dihapus_pada IS NULL AND {saring}",
                'urut' => 'b.dibuat_pada DESC'],

            'insiden' => ['modul' => 'incident', 'judul' => 'Incident & Nearmiss',
                'kolom' => ['nomor' => 'Nomor', 'jenis' => 'Jenis', 'keparahan' => 'Keparahan',
                            'area' => 'Area', 'tanggal' => 'Tanggal', 'waktu' => 'Waktu',
                            'ringkas' => 'Ringkasan', 'hari_kerja_hilang' => 'Hari Hilang',
                            'status' => 'Status'],
                'sql' => "SELECT i.nomor, i.jenis, i.keparahan, a.nama AS area, i.tanggal,
                                 to_char(i.waktu, 'HH24:MI') AS waktu, i.ringkas,
                                 i.hari_kerja_hilang, i.status
                            FROM insiden i JOIN area a ON a.id = i.area_id
                           WHERE i.dihapus_pada IS NULL AND {saring}",
                'urut' => 'i.tanggal DESC'],

            'capa' => ['modul' => 'capa', 'judul' => 'CAPA',
                'kolom' => ['nomor' => 'Nomor', 'judul' => 'Judul', 'sumber_jenis' => 'Jenis Sumber',
                            'sumber_nomor' => 'Sumber', 'pj' => 'Penanggung Jawab',
                            'terbit' => 'Terbit', 'tenggat' => 'Tenggat', 'umur' => 'Umur (hari)',
                            'prioritas' => 'Prioritas', 'status' => 'Status'],
                'sql' => "SELECT c.nomor, c.judul, c.sumber_jenis, c.sumber_nomor, pj.nama AS pj,
                                 c.terbit, c.tenggat, (current_date - c.terbit) AS umur,
                                 c.prioritas, c.status
                            FROM capa c JOIN pengguna pj ON pj.id = c.pj_id
                           WHERE c.dihapus_pada IS NULL AND {saring}",
                'urut' => 'c.tenggat'],

            'izin' => ['modul' => 'permit', 'judul' => 'Izin Kerja',
                'kolom' => ['nomor' => 'Nomor', 'jenis' => 'Jenis', 'judul' => 'Pekerjaan',
                            'area' => 'Area', 'pelaksana' => 'Pelaksana', 'pekerja' => 'Pekerja',
                            'pengawas' => 'Pengawas', 'mulai' => 'Mulai', 'jsa' => 'JSA',
                            'status' => 'Status'],
                'sql' => "SELECT z.nomor, ji.nama AS jenis, z.judul, a.nama AS area, z.pelaksana,
                                 z.pekerja, z.pengawas,
                                 to_char(z.mulai, 'YYYY-MM-DD HH24:MI') AS mulai,
                                 j.nomor AS jsa, z.status
                            FROM izin z JOIN area a ON a.id = z.area_id
                            JOIN jenis_izin ji ON ji.kode = z.jenis
                       LEFT JOIN jsa j ON j.id = z.jsa_id
                           WHERE z.dihapus_pada IS NULL AND {saring}",
                'urut' => 'z.mulai DESC NULLS LAST'],

            'hiradc' => ['modul' => 'hiradc', 'judul' => 'HIRADC',
                'kolom' => ['nomor' => 'Nomor', 'proses' => 'Proses', 'aktivitas' => 'Aktivitas',
                            'sifat' => 'Sifat', 'kategori' => 'Kategori', 'bahaya' => 'Bahaya',
                            'risiko' => 'Risiko', 'skor_awal' => 'Skor Awal',
                            'skor_sisa' => 'Skor Sisa', 'pj' => 'Penanggung Jawab',
                            'target' => 'Target', 'status' => 'Status'],
                'sql' => "SELECT h.nomor, h.proses, h.aktivitas, h.sifat, h.kategori, h.bahaya,
                                 h.risiko, h.skor_awal, h.skor_sisa, pj.nama AS pj, h.target, h.status
                            FROM hiradc h LEFT JOIN pengguna pj ON pj.id = h.pj_id
                           WHERE h.dihapus_pada IS NULL AND {saring}",
                'urut' => 'h.skor_sisa DESC, h.nomor'],

            'observasi-apd' => ['modul' => 'bbs', 'judul' => 'Observasi APD',
                'kolom' => ['nomor' => 'Nomor', 'tanggal' => 'Tanggal', 'area' => 'Area',
                            'pengamat' => 'Pengamat', 'diamati' => 'Diamati', 'patuh' => 'Patuh',
                            'kepatuhan' => 'Kepatuhan (%)', 'catatan' => 'Catatan'],
                'sql' => "SELECT o.nomor, o.tanggal, a.nama AS area, pg.nama AS pengamat,
                                 o.diamati, o.patuh,
                                 round(o.patuh::numeric * 100 / o.diamati) AS kepatuhan, o.catatan
                            FROM observasi_apd o JOIN area a ON a.id = o.area_id
                            JOIN pengguna pg ON pg.id = o.pengamat_id
                           WHERE o.dihapus_pada IS NULL AND {saring}",
                'urut' => 'o.tanggal DESC'],

            'regulasi' => ['modul' => 'regulasi', 'judul' => 'Regulasi K3',
                'kolom' => ['kode' => 'Kode', 'nomor' => 'Peraturan', 'judul' => 'Judul',
                            'bidang' => 'Bidang', 'pasal' => 'Pasal', 'penerapan' => 'Penerapan',
                            'bukti' => 'Bukti', 'evaluasi' => 'Evaluasi', 'status' => 'Status'],
                'sql' => "SELECT r.kode, r.nomor, r.judul, r.bidang, r.pasal, r.penerapan,
                                 r.bukti, r.evaluasi, r.status
                            FROM regulasi r WHERE r.dihapus_pada IS NULL AND {saring}",
                'urut' => 'r.kode'],

            'dokumen-eksternal' => ['modul' => 'docext', 'judul' => 'Dokumen Kepatuhan',
                'kolom' => ['kode' => 'Kode', 'jenis' => 'Jenis', 'judul' => 'Dokumen',
                            'penerbit' => 'Penerbit', 'nomor' => 'Nomor', 'terbit' => 'Terbit',
                            'berlaku' => 'Berlaku Sampai', 'sisa' => 'Sisa (hari)'],
                'sql' => "SELECT d.kode, d.jenis, d.judul, d.penerbit, d.nomor, d.terbit, d.berlaku,
                                 (d.berlaku - current_date) AS sisa
                            FROM dokumen_eksternal d WHERE d.dihapus_pada IS NULL AND {saring}",
                // AB-21 · yang hampir habis lebih dulu, di layar maupun di ekspor.
                'urut' => 'd.berlaku'],

            'induksi' => ['modul' => 'induksi', 'judul' => 'Induksi K3',
                'kolom' => ['nomor' => 'Nomor', 'nama' => 'Nama', 'jenis' => 'Jenis',
                            'asal' => 'Asal', 'tanggal' => 'Tanggal', 'pemandu' => 'Pemandu',
                            'nilai' => 'Nilai', 'berlaku' => 'Berlaku Sampai', 'status' => 'Status'],
                'sql' => "SELECT i.nomor, i.nama, i.jenis, i.asal, i.tanggal, i.pemandu,
                                 i.nilai, i.berlaku, i.status
                            FROM induksi i WHERE i.dihapus_pada IS NULL AND {saring}",
                'urut' => 'i.tanggal DESC'],
        ];
    }

    public static function daftarTersedia(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $out = [];
        foreach (self::daftar() as $kode => $d) {
            if (!isset($u['kewenangan'][$d['modul']])) continue;
            $out[] = ['kode' => $kode, 'judul' => $d['judul'], 'modul' => $d['modul'],
                      'xlsx' => "/api/v1/ekspor/$kode/xlsx", 'cetak' => "/api/v1/ekspor/$kode/cetak"];
        }
        Jawab::kirim($out);
    }

    public static function xlsx(Permintaan $p, array $par): never
    {
        [$u, $d, $baris] = self::ambil($p, $par['kode']);

        $isi = Xlsx::tulis($d['judul'], array_values($d['kolom']),
            array_map(static fn (array $r): array => array_map(
                static fn (string $k) => $r[$k] ?? null, array_keys($d['kolom'])), $baris));

        self::catat($u, $par['kode'], 'xlsx', count($baris));
        self::kirimBerkas($isi,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            self::namaBerkas($d['judul'], 'xlsx'));
    }

    /**
     * Berkas cetak.
     *
     * Bukan PDF yang dibuat peladen: menanam mesin PDF beserta hurufnya di
     * dalam sistem ini berarti satu ketergantungan besar lagi, dan hasilnya
     * tetap kalah rapi dibanding cetakan peramban. Yang dikirim adalah halaman
     * yang sudah bergaya cetak — pengguna menekan Cetak, memilih "Simpan
     * sebagai PDF", dan hasilnya memakai huruf serta pemenggalan halaman yang
     * benar di semua sistem.
     */
    public static function cetak(Permintaan $p, array $par): never
    {
        [$u, $d, $baris] = self::ambil($p, $par['kode']);
        self::catat($u, $par['kode'], 'cetak', count($baris));

        $e = static fn (mixed $v): string => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');
        $pabrik = Db::nilai('SELECT nama FROM pabrik WHERE id = :i', [':i' => $u['pabrik_id']]);

        $h = '<!doctype html><html lang="id"><head><meta charset="utf-8">'
            . '<title>' . $e($d['judul']) . '</title><style>'
            . '@page{size:A4 landscape;margin:12mm 10mm}'
            . 'body{font:11px/1.45 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#15233c;margin:0}'
            . 'h1{font-size:17px;margin:0 0 2px}'
            . '.sub{color:#5b6b85;font-size:11px;margin:0 0 12px}'
            . 'table{border-collapse:collapse;width:100%}'
            . 'th{background:#17458f;color:#fff;text-align:left;font-weight:600;padding:6px 8px;font-size:10px;'
            . 'text-transform:uppercase;letter-spacing:.04em}'
            . 'td{padding:5px 8px;border-bottom:1px solid #dfe5ef;vertical-align:top}'
            . 'tr:nth-child(even) td{background:#f6f8fc}'
            // Baris kepala diulang di tiap halaman; tabel 200 baris tanpa itu
            // tidak terbaca mulai halaman dua.
            . 'thead{display:table-header-group}tr{break-inside:avoid}'
            . '.kaki{margin-top:10px;color:#5b6b85;font-size:10px}'
            . '@media print{.cetak{display:none}}'
            . '.cetak{position:fixed;top:12px;right:12px;padding:8px 14px;border:0;border-radius:8px;'
            . 'background:#17458f;color:#fff;font:600 12px sans-serif;cursor:pointer}'
            . '</style></head><body>'
            . '<button class="cetak" onclick="print()">Cetak / Simpan PDF</button>'
            . '<h1>' . $e($d['judul']) . '</h1>'
            . '<p class="sub">' . $e($pabrik) . ' · ' . count($baris) . ' catatan · dicetak '
            . date('d/m/Y H:i') . ' oleh ' . $e($u['nama']) . '</p><table><thead><tr>';

        foreach ($d['kolom'] as $judul) $h .= '<th>' . $e($judul) . '</th>';
        $h .= '</tr></thead><tbody>';
        foreach ($baris as $r) {
            $h .= '<tr>';
            foreach (array_keys($d['kolom']) as $k) $h .= '<td>' . $e($r[$k] ?? '') . '</td>';
            $h .= '</tr>';
        }
        $h .= '</tbody></table>'
            . '<p class="kaki">KG SafeGuard · isi mengikuti hak akses dan cakupan pabrik '
            . 'pengguna yang mencetaknya. Unduhan ini tercatat pada jejak audit.</p>'
            . '</body></html>';

        if (PHP_SAPI !== 'cli') {
            header('Content-Type: text/html; charset=UTF-8');
            header('Cache-Control: private, no-store');
            echo $h;
        }
        Jawab::selesaiMentah();
    }

    /**
     * @return array{0:array<string,mixed>,1:array<string,mixed>,2:array<int,array<string,mixed>>}
     */
    private static function ambil(Permintaan $p, string $kode): array
    {
        $u = Sesi::pengguna($p);
        $daftar = self::daftar();
        if (!isset($daftar[$kode])) throw Galat::takAda("Ekspor '$kode' tidak dikenal.");
        $d = $daftar[$kode];

        // Hak akses yang sama dengan layarnya. Ekspor yang melewatinya adalah
        // cara paling umum data pabrik lain keluar dari sistem.
        Wewenang::wajib($u, $d['modul'], 'baca');

        $alias = trim(substr($d['sql'], strpos($d['sql'], 'FROM') + 5));
        $alias = explode(' ', preg_replace('/\s+/', ' ', $alias))[1] ?? 't';
        [$saring, $par] = Wewenang::saringCakupan($u, $alias);

        $sql = str_replace('{saring}', $saring, $d['sql']) . ' ORDER BY ' . $d['urut'];
        return [$u, $d, Db::semua($sql, $par)];
    }

    /** @param array<string,mixed> $u */
    private static function catat(array $u, string $kode, string $bentuk, int $jumlah): void
    {
        Jejak::unduhan($u['id'], $kode, $bentuk, $jumlah);
    }

    private static function namaBerkas(string $judul, string $ekstensi): string
    {
        $bersih = preg_replace('/[^A-Za-z0-9]+/', '-', $judul) ?? 'ekspor';
        return 'KG-' . trim($bersih, '-') . '-' . date('Ymd') . '.' . $ekstensi;
    }

    private static function kirimBerkas(string $isi, string $tipe, string $nama): never
    {
        if (PHP_SAPI !== 'cli') {
            header('Content-Type: ' . $tipe);
            header('Content-Length: ' . strlen($isi));
            header('Content-Disposition: attachment; filename="' . $nama . '"');
            header('Cache-Control: private, no-store');
            echo $isi;
        }
        Jawab::selesaiMentah();
    }
}
