<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Permintaan, Sesi, Wewenang};

/**
 * Mengubah dan menghapus catatan K3 — bahaya, kejadian, CAPA, izin, JSA.
 *
 * Satu tempat untuk kelima modul, karena aturannya sama dan harus tetap sama:
 *
 * 1. Hanya kolom isian yang dapat diubah. Status, verifikator, nomor, dan
 *    pabrik tidak pernah lewat sini; masing-masing punya jalurnya sendiri
 *    yang menegakkan aturan bisnisnya (verifikasi, tutup, terbitkan, sahkan).
 *    Kolom di luar daftar DITOLAK, bukan diabaikan — formulir yang diam-diam
 *    membuang isian membuat orang mengira perubahannya tersimpan.
 *
 * 2. Catatan yang sudah diverifikasi, ditutup, diterbitkan, atau disahkan
 *    terkunci. Yang diverifikasi adalah isi pada saat itu; mengubahnya
 *    sesudahnya berarti tanda tangan verifikator menempel pada isi yang
 *    tidak pernah ia lihat.
 *
 * 3. Yang boleh mengubah: pemegang kewenangan verifikasi modulnya, atau
 *    pembuat catatannya sendiri selama ia masih berwenang mengisi modul itu.
 *    Yang boleh menghapus: hanya pemegang kewenangan verifikasi. Laporan
 *    yang dihapus pelapornya sendiri tidak pernah sampai ke siapa pun.
 *
 * 4. Hapus selalu lunak dan selalu beralasan. Barisnya tetap ada untuk
 *    auditor; jejak audit mencatat siapa, kapan, dan mengapa.
 */
final class Catatan
{
    /**
     * Jenis kolom isian:
     *   teks      wajib, tidak boleh kosong
     *   teks?     boleh dikosongkan (disimpan NULL)
     *   area      area aktif pada pabrik yang sama dengan catatannya
     *   tanggal   YYYY-MM-DD
     *   lampau    YYYY-MM-DD, tidak boleh setelah hari ini
     *   jam?      HH:MM, boleh dikosongkan
     *   waktu?    tanggal-dan-jam, boleh dikosongkan
     *   bulat0    bilangan bulat >= 0
     *   bulat1    bilangan bulat >= 1
     *   pengguna  akun Aktif
     *   [..]      salah satu pilihan
     */
    private const JENIS = [
        'bahaya' => [
            'modul' => 'hazard', 'nama' => 'Laporan bahaya',
            'ubah'  => ['Terbuka'],
            'hapus' => ['Terbuka'],
            'kolom' => [
                'area_id'  => 'area',
                'kategori' => 'teks',
                'isi'      => 'teks',
                'risiko'   => ['Rendah', 'Sedang', 'Tinggi'],
            ],
        ],
        'insiden' => [
            'modul' => 'incident', 'nama' => 'Kejadian',
            'ubah'  => ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'],
            'hapus' => ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'],
            'kolom' => [
                'area_id'           => 'area',
                'jenis'             => ['Nearmiss', 'Incident', 'Accident'],
                'keparahan'         => ['Ringan', 'Sedang', 'Serius'],
                'tanggal'           => 'lampau',
                'waktu'             => 'jam?',
                'ringkas'           => 'teks',
                'kronologi'         => 'teks?',
                'dampak'            => 'teks?',
                'akar'              => 'teks?',
                'cedera'            => 'teks?',
                'hari_kerja_hilang' => 'bulat0',
            ],
        ],
        'capa' => [
            'modul' => 'capa', 'nama' => 'CAPA',
            'ubah'  => ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'],
            'hapus' => ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'],
            'kolom' => [
                'judul'     => 'teks',
                'pj_id'     => 'pengguna',
                'tenggat'   => 'tanggal',
                'prioritas' => ['Rendah', 'Sedang', 'Tinggi'],
            ],
        ],
        'izin' => [
            'modul' => 'permit', 'nama' => 'Izin kerja',
            'ubah'  => ['Menunggu Supervisor', 'Menunggu QHSE'],
            // Izin yang ditolak boleh dibersihkan; yang pernah aktif adalah
            // catatan pekerjaan yang sungguh terjadi.
            'hapus' => ['Menunggu Supervisor', 'Menunggu QHSE', 'Ditolak'],
            'kolom' => [
                'judul'     => 'teks',
                'pelaksana' => 'teks',
                'pekerja'   => 'bulat1',
                'pengawas'  => 'teks',
                'mulai'     => 'waktu?',
                'durasi'    => 'teks?',
            ],
        ],
        'jsa' => [
            'modul' => 'jsa', 'nama' => 'JSA',
            'ubah'  => ['Draf', 'Menunggu Pengesahan'],
            'hapus' => ['Draf', 'Menunggu Pengesahan'],
            'kolom' => [
                'area_id'   => 'area',
                'pekerjaan' => 'teks',
                'jenis'     => ['Rutin', 'Non-rutin'],
            ],
        ],
    ];

    /**
     * Modul lainnya. Kunci tambahan:
     *   tabel      nama tabel bila berbeda dari kuncinya
     *   nomor      kolom penanda yang dibaca orang (bawaan 'nomor')
     *   ubah/hapus null = tidak berstatus; selalu dapat
     *   ubahMin    kewenangan minimal untuk mengubah catatan siapa pun —
     *              untuk daftar bersama (regulasi, dokumen, …) yang tidak
     *              punya pemilik. Tanpa ini: verifikator, atau pembuatnya.
     *   hapusMin   kewenangan minimal untuk menghapus (bawaan verifikasi)
     *   tanpaUbah  tabel tidak punya kolom diubah_oleh/diubah_pada
     *   periksa    aturan lintas-kolom, dipanggil dengan nilai gabungan
     *   turunan    kolom yang DIHITUNG dari isian, tidak pernah dikirim
     */
    private const LAINNYA = [
        'observasi' => [
            'modul' => 'bbs', 'nama' => 'Observasi perilaku', 'ubah' => null, 'hapus' => null,
            'periksa' => 'periksaObservasi',
            'kolom' => ['area_id' => 'area', 'tanggal' => 'lampau', 'aman' => 'bulat0', 'berisiko' => 'bulat0',
                        'kategori' => 'teks?', 'catatan' => 'teks', 'tindakan' => 'teks?'],
        ],
        'observasi-apd' => [
            // Jumlah diamati dan patuh tidak diubah di sini: keduanya terikat
            // pada rincian per jenis APD (AB-07). Salah hitung → hapus, catat ulang.
            'tabel' => 'observasi_apd', 'modul' => 'bbs', 'nama' => 'Observasi APD', 'ubah' => null, 'hapus' => null,
            'kolom' => ['area_id' => 'area', 'tanggal' => 'lampau', 'catatan' => 'teks'],
        ],
        'inspeksi' => [
            'modul' => 'inspection', 'nama' => 'Inspeksi',
            'ubah' => ['Terbuka', 'Dalam Proses'], 'hapus' => ['Terbuka', 'Dalam Proses'],
            'kolom' => ['jenis' => 'teks', 'area' => 'teks', 'tanggal' => 'tanggal',
                        'jadwal' => ['Harian', 'Mingguan', 'Bulanan', 'Triwulanan', 'Tahunan']],
        ],
        'checklist' => [
            'modul' => 'checklist', 'nama' => 'Checklist',
            'ubah' => ['Terbuka', 'Dalam Proses'], 'hapus' => ['Terbuka', 'Dalam Proses'],
            'kolom' => ['nama' => 'teks', 'frekuensi' => 'teks', 'lokasi' => 'teks?', 'shift' => 'teks?',
                        'tanggal' => 'tanggal'],
        ],
        'hiradc' => [
            // Penilaian SISA tidak diubah di sini: ia hanya turun lewat
            // /hiradc/{id}/turunkan-sisa, yang menegakkan AB-15.
            'modul' => 'hiradc', 'nama' => 'Baris HIRADC', 'ubahMin' => 'isi',
            'ubah' => ['Terbuka', 'Dalam Proses'], 'hapus' => ['Terbuka', 'Dalam Proses'],
            'kolom' => ['proses' => 'teks', 'aktivitas' => 'teks', 'sifat' => ['Rutin', 'Non-rutin', 'Darurat'],
                        'kategori' => 'katbahaya', 'bahaya' => 'teks', 'risiko' => 'teks', 'korban' => 'teks',
                        'kemungkinan' => 'skala', 'keparahan' => 'skala', 'kendali_ada' => 'teks?',
                        'kendali_tambahan' => 'teks?',
                        'hierarki' => ['', 'Eliminasi', 'Substitusi', 'Rekayasa', 'Administratif', 'APD'],
                        'pj_id' => 'pengguna?', 'target' => 'tanggal?',
                        'status' => ['Terbuka', 'Dalam Proses', 'Selesai']],
        ],
        'risiko' => [
            'modul' => 'risk', 'nama' => 'Risiko', 'ubahMin' => 'isi',
            'ubah' => ['Terbuka', 'Dalam Proses'], 'hapus' => ['Terbuka', 'Dalam Proses'],
            'kolom' => ['proses' => 'teks', 'ancaman' => 'teks', 'penyebab' => 'teks', 'dampak' => 'teks',
                        'kemungkinan' => 'skala', 'keparahan' => 'skala',
                        'kemungkinan_sisa' => 'skala', 'keparahan_sisa' => 'skala',
                        'opsi' => ['Hindari', 'Kurangi', 'Transfer', 'Terima'], 'mitigasi' => 'teks',
                        'pj_id' => 'pengguna?', 'target' => 'tanggal?', 'reviu' => 'tanggal?',
                        'status' => ['Terbuka', 'Dalam Proses', 'Selesai']],
        ],
        'induksi' => [
            'modul' => 'induksi', 'nama' => 'Induksi', 'ubahMin' => 'isi', 'hapusMin' => 'isi',
            'ubah' => null, 'hapus' => null, 'turunan' => 'turunanInduksi',
            'kolom' => ['nama' => 'teks', 'jenis' => ['Pekerja Baru', 'Kontraktor', 'Tamu'], 'asal' => 'teks?',
                        'tanggal' => 'lampau', 'pemandu' => 'teks?', 'nilai' => 'nilai?'],
        ],
        'regulasi' => [
            'nomor' => 'kode', 'modul' => 'regulasi', 'nama' => 'Peraturan', 'ubahMin' => 'isi', 'hapusMin' => 'isi',
            'ubah' => null, 'hapus' => null, 'periksa' => 'periksaRegulasi',
            'kolom' => ['nomor' => 'teks', 'judul' => 'teks', 'penerbit' => 'teks', 'bidang' => 'teks',
                        'pasal' => 'teks', 'penerapan' => 'teks', 'bukti' => 'teks?', 'pj_id' => 'pengguna?',
                        'evaluasi' => 'tanggal?',
                        'status' => ['Terpenuhi', 'Terpenuhi Sebagian', 'Tidak Terpenuhi']],
        ],
        'kegiatan' => [
            'modul' => 'activity', 'nama' => 'Kegiatan', 'ubahMin' => 'isi', 'hapusMin' => 'isi',
            'ubah' => null, 'hapus' => null, 'tanpaUbah' => true,
            'kolom' => ['jenis' => 'teks', 'judul' => 'teks', 'tanggal' => 'lampau', 'lokasi' => 'teks?',
                        'peserta' => 'bulat0', 'durasi_jam' => 'desimal'],
        ],
        'pelatihan' => [
            'modul' => 'training', 'nama' => 'Program pelatihan', 'ubahMin' => 'isi', 'hapusMin' => 'isi',
            'ubah' => null, 'hapus' => null,
            'kolom' => ['nama' => 'teks', 'jenis' => ['Wajib Regulasi', 'Internal', 'Refreshment'],
                        'target' => 'bulat0', 'rencana_tanggal' => 'teks', 'rencana_peserta' => 'bulat0',
                        'aktual_tanggal' => 'teks?', 'aktual_peserta' => 'bulat0?', 'penyelenggara' => 'teks',
                        'biaya_juta' => 'desimal?', 'status' => ['Terjadwal', 'Tertunda', 'Selesai']],
        ],
        'dokumen/internal' => [
            // Tingkat dan jenis tidak diubah: keduanya terkandung dalam
            // kodenya (KGP-, KGI-, …).
            'tabel' => 'dokumen_internal', 'nomor' => 'kode', 'modul' => 'docint', 'nama' => 'Dokumen',
            'ubahMin' => 'isi', 'hapusMin' => 'isi', 'ubah' => null, 'hapus' => null, 'periksa' => 'periksaDokumen',
            'kolom' => ['judul' => 'teks', 'revisi' => 'bulat0', 'terbit' => 'tanggal', 'tinjau' => 'tanggal?',
                        'pemilik' => 'teks', 'status' => ['Berlaku', 'Dalam Revisi', 'Kedaluwarsa']],
        ],
        'dokumen/eksternal' => [
            'tabel' => 'dokumen_eksternal', 'nomor' => 'kode', 'modul' => 'docext', 'nama' => 'Dokumen kepatuhan',
            'ubahMin' => 'isi', 'hapusMin' => 'isi', 'ubah' => null, 'hapus' => null, 'periksa' => 'periksaDokEksternal',
            'kolom' => ['jenis' => ['Sertifikat Sistem', 'Izin Lingkungan', 'Izin Peralatan', 'Pelaporan Wajib'],
                        'judul' => 'teks', 'penerbit' => 'teks', 'nomor' => 'teks', 'terbit' => 'tanggal?',
                        'berlaku' => 'tanggal'],
        ],
        'audit' => [
            'modul' => 'audit', 'nama' => 'Audit', 'ubahMin' => 'isi', 'hapusMin' => 'isi',
            'ubah' => ['Terbuka', 'Dalam Proses'], 'hapus' => ['Terbuka', 'Dalam Proses'],
            'kolom' => ['standar' => 'teks', 'lingkup' => 'teks', 'auditor' => 'teks', 'mulai' => 'tanggal',
                        'selesai' => 'tanggal?'],
        ],
    ];

    /** Seluruh jenis yang ditangani: lima catatan K3 di atas dan modul lainnya. */
    public static function jenis(): array
    {
        return array_keys(self::JENIS + self::LAINNYA);
    }

    /** @return array<string,mixed> */
    private static function def(string $jenis): array
    {
        $d = self::JENIS[$jenis] ?? self::LAINNYA[$jenis];
        $d['tabel'] ??= $jenis;
        $d['nomor'] ??= 'nomor';
        return $d;
    }

    /** Jenis kolom → tipe basis data, untuk menormalkan nilai sebelum dibandingkan. */
    private const TIPE = [
        'area' => 'uuid', 'pengguna' => 'uuid', 'tanggal' => 'date', 'lampau' => 'date',
        'jam?' => 'time', 'waktu?' => 'timestamptz', 'bulat0' => 'integer', 'bulat1' => 'integer',
        'skala' => 'smallint', 'nilai?' => 'smallint', 'tanggal?' => 'date', 'pengguna?' => 'uuid',
        'desimal' => 'numeric', 'desimal?' => 'numeric', 'bulat0?' => 'integer',
    ];

    /** POST /{jenis}/{id}/ubah */
    public static function ubah(Permintaan $p, array $par, string $jenis): never
    {
        $def = self::def($jenis);
        $u = Sesi::pengguna($p);
        $badan = $p->badan();
        if ($badan === []) throw Galat::isian('Tidak ada isian yang dikirim untuk diubah.');

        foreach (array_keys($badan) as $k) {
            if (!isset($def['kolom'][$k])) {
                throw Galat::isian("Kolom '$k' tidak dapat diubah lewat formulir ini.", ['kolom' => $k]);
            }
        }

        $hasil = Db::transaksi(function () use ($def, $jenis, $u, $badan, $par) {
            $c = self::ambil($jenis, $par['id'], array_keys($def['kolom']), true);
            Wewenang::wajibCakupan($u, $c['pabrik_id']);
            if (isset($def['ubahMin'])) {
                Wewenang::wajib($u, $def['modul'], $def['ubahMin']);
            } elseif (!self::bolehUbah($u, $def, $c)) {
                throw Galat::takBerwenang($def['nama'] . ' ' . $c['nomor']
                    . ' hanya dapat diubah pembuatnya atau verifikator modul ini.');
            }
            if ($def['ubah'] !== null && !in_array($c['status'], $def['ubah'], true)) {
                throw self::terkunci($def['nama'], $c['nomor'], $c['status'], 'diubah');
            }

            // Nilai baru dinormalkan basis data ke bentuk yang sama dengan
            // nilai lamanya (::text), supaya "08:00" dan "08:00:00" tidak
            // tercatat sebagai perubahan.
            $baru = self::normalkan(self::periksa($def['kolom'], $badan, $c));
            $gabung = array_merge(array_intersect_key($c, $def['kolom']), $baru);
            if (isset($def['periksa'])) self::{$def['periksa']}($gabung);
            if (isset($def['turunan'])) $baru += self::{$def['turunan']}($gabung, $c);
            $sebelum = array_intersect_key($c, $baru);
            $berubah = array_keys(array_filter($baru, fn($v, $k) => $v !== $sebelum[$k], ARRAY_FILTER_USE_BOTH));

            $tambahan = [];
            if ($berubah !== []) {
                $set = implode(', ', array_map(fn($k) => "$k = :$k", $berubah));
                $isi = [':id' => $c['id'], ':u' => $u['id']];
                foreach ($berubah as $k) $isi[":$k"] = $baru[$k];
                if (!empty($def['tanpaUbah'])) {
                    unset($isi[':u']);
                    Db::jalankan("UPDATE {$def['tabel']} SET $set WHERE id = :id", $isi);
                } else {
                    Db::jalankan("UPDATE {$def['tabel']} SET $set, diubah_oleh = :u, diubah_pada = now() WHERE id = :id", $isi);
                }
                Jejak::catat($def['tabel'], $c['id'], 'ubah', $sebelum, $baru, $u['id']);

                // AB-02 berlaku juga pada perubahan: kejadian yang dinaikkan
                // menjadi Serius memberi tahu seketika, sama seperti bila
                // sejak awal dilaporkan Serius.
                if ($jenis === 'insiden' && in_array('keparahan', $berubah, true) && $baru['keparahan'] === 'Serius') {
                    $tambahan['pemberitahuan_ke'] = Aturan::penerimaKejadianSerius($c['pabrik_id']);
                }
            }
            return ['id' => $c['id'], 'nomor' => $c['nomor'], 'status' => $c['status'], 'berubah' => $berubah]
                + $tambahan;
        });

        Jawab::kirim($hasil);
    }

    /** POST /{jenis}/{id}/hapus — hapus lunak, wajib beralasan. */
    public static function hapus(Permintaan $p, array $par, string $jenis): never
    {
        $def = self::def($jenis);
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, $def['modul'], $def['hapusMin'] ?? 'verifikasi');

        $alasan = trim((string) $p->isi('alasan', ''));
        if (mb_strlen($alasan) < 5) {
            throw Galat::isian('Alasan penghapusan wajib diisi — auditor akan menanyakannya.', ['kolom' => 'alasan']);
        }

        $hasil = Db::transaksi(function () use ($def, $jenis, $u, $par, $alasan) {
            $c = self::ambil($jenis, $par['id'], [], true);
            Wewenang::wajibCakupan($u, $c['pabrik_id']);
            if ($def['hapus'] !== null && !in_array($c['status'], $def['hapus'], true)) {
                throw self::terkunci($def['nama'], $c['nomor'], $c['status'], 'dihapus');
            }
            self::wajibTanpaTurunan($jenis, $c);

            if (!empty($def['tanpaUbah'])) {
                Db::jalankan("UPDATE {$def['tabel']} SET dihapus_pada = now() WHERE id = :id", [':id' => $c['id']]);
            } else {
                Db::jalankan(
                    "UPDATE {$def['tabel']} SET dihapus_pada = now(), diubah_oleh = :u, diubah_pada = now() WHERE id = :id",
                    [':u' => $u['id'], ':id' => $c['id']]
                );
            }
            Jejak::catat($def['tabel'], $c['id'], 'hapus_lunak',
                ['nomor' => $c['nomor'], 'status' => $c['status']],
                ['dihapus' => true, 'alasan' => $alasan], $u['id']);
            return ['id' => $c['id'], 'nomor' => $c['nomor'], 'dihapus' => true];
        });

        Jawab::kirim($hasil);
    }

    /**
     * Catatan yang menjadi pijakan catatan lain tidak dihapus sendirian:
     * CAPA tanpa kejadian induknya melanggar AB-01, dan izin yang JSA-nya
     * hilang tidak lagi dapat dibuktikan aman (AB-09).
     *
     * @param array<string,mixed> $c
     */
    private static function wajibTanpaTurunan(string $jenis, array $c): void
    {
        if ($jenis === 'insiden') {
            $capa = array_column(Db::semua(
                "SELECT nomor FROM capa WHERE sumber_jenis = 'Insiden' AND sumber_id = :i
                    AND dihapus_pada IS NULL ORDER BY nomor", [':i' => $c['id']]), 'nomor');
            if ($capa !== []) {
                throw new Galat(409, 'MASIH_DIPAKAI',
                    'Kejadian ' . $c['nomor'] . ' masih menjadi sumber ' . implode(', ', $capa)
                    . '. Hapus CAPA tersebut lebih dulu, atau biarkan kejadian ini dan tutup lewat jalurnya.',
                    null, ['capa' => $capa]);
            }
        }
        if ($jenis === 'audit') {
            $temuan = array_column(Db::semua('SELECT nomor FROM temuan_audit WHERE audit_id = :i ORDER BY nomor',
                [':i' => $c['id']]), 'nomor');
            if ($temuan !== []) {
                throw new Galat(409, 'MASIH_DIPAKAI',
                    'Audit ' . $c['nomor'] . ' sudah memiliki temuan ' . implode(', ', $temuan)
                    . '. Audit bertemuan adalah catatan audit; tutup lewat jalurnya.', null, ['temuan' => $temuan]);
            }
        }
        if ($jenis === 'jsa') {
            $izin = array_column(Db::semua(
                'SELECT nomor FROM izin WHERE jsa_id = :i AND dihapus_pada IS NULL ORDER BY nomor',
                [':i' => $c['id']]), 'nomor');
            if ($izin !== []) {
                throw new Galat(409, 'MASIH_DIPAKAI',
                    'JSA ' . $c['nomor'] . ' masih dilampirkan pada ' . implode(', ', $izin) . '.',
                    null, ['izin' => $izin]);
            }
        }
    }

    /**
     * @param array<string,mixed> $u
     * @param array<string,mixed> $def
     * @param array<string,mixed> $c
     */
    private static function bolehUbah(array $u, array $def, array $c): bool
    {
        if (Wewenang::punya($u, $def['modul'], 'verifikasi')) return true;
        // Pelapor anonim tidak dapat mengubah laporannya: perubahan itu akan
        // tercatat atas namanya di jejak audit, dan anonimitasnya hilang (AB-04).
        if (($c['anonim'] ?? false) === true) return false;
        return $c['dibuat_oleh'] === $u['id'] && Wewenang::punya($u, $def['modul'], 'isi');
    }

    /**
     * Mengambil catatan beserta kolom yang akan diubah, dalam bentuk teks.
     * FOR UPDATE: dua orang yang menyimpan bersamaan diantrekan, bukan saling
     * menimpa tanpa jejak.
     *
     * @param array<int,string> $kolom
     * @return array<string,mixed>
     */
    private static function ambil(string $jenis, string $id, array $kolom, bool $kunci): array
    {
        $def = self::def($jenis);
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            throw Galat::takAda($def['nama'] . ' tidak ditemukan.');
        }
        // Kolom turunan ikut dibaca supaya perubahannya tercatat di jejak.
        if ($jenis === 'induksi') $kolom = array_merge($kolom, ['berlaku', 'status']);
        $kolom = array_unique($kolom);
        $pilih = implode('', array_map(fn($k) => ", t.$k::text AS $k", array_diff($kolom, ['status'])));
        $anonim = in_array($jenis, ['bahaya', 'insiden'], true) ? ', t.anonim' : '';
        // Status dibaca apa adanya bila tabelnya berstatus; tabel tanpa status
        // memberi NULL dan tidak pernah terkunci.
        $status = ($def['ubah'] !== null || isset($def['kolom']['status']) || $jenis === 'induksi') ? 't.status' : 'NULL::text';
        $c = Db::baris(
            "SELECT t.id, t.{$def['nomor']} AS nomor, t.pabrik_id, $status AS status, t.dibuat_oleh$anonim$pilih
               FROM {$def['tabel']} t
              WHERE t.id = :i AND t.dihapus_pada IS NULL" . ($kunci ? ' FOR UPDATE' : ''),
            [':i' => $id]
        );
        if ($c === null) throw Galat::takAda($def['nama'] . ' tidak ditemukan.');
        return $c;
    }

    private static function terkunci(string $nama, string $nomor, string $status, string $kata): Galat
    {
        return new Galat(409, 'TERKUNCI',
            "$nama $nomor berstatus $status dan tidak dapat $kata lagi. "
            . 'Isi yang sudah diverifikasi atau disahkan adalah isi yang dipertanggungjawabkan.',
            null, ['status' => $status]);
    }

    /**
     * Memeriksa setiap isian terhadap jenis kolomnya.
     *
     * @param array<string,mixed> $kolom
     * @param array<string,mixed> $badan
     * @param array<string,mixed> $c
     * @return array<string,array{0:?string,1:?string}> kolom → [nilai, tipe basis data]
     */
    private static function periksa(array $kolom, array $badan, array $c): array
    {
        $out = [];
        foreach ($badan as $k => $v) {
            $jenis = $kolom[$k];
            if ($v !== null && !is_scalar($v)) throw Galat::isian("Isian '$k' tidak sahih.", ['kolom' => $k]);
            $s = $v === null ? '' : trim((string) $v);
            if (is_bool($v)) $s = $v ? 'true' : 'false';
            $kosongBoleh = (is_string($jenis) && str_ends_with($jenis, '?')) || (is_array($jenis) && in_array('', $jenis, true));

            if ($s === '') {
                if (!$kosongBoleh) throw Galat::isian("Isian '$k' wajib diisi.", ['kolom' => $k]);
                $out[$k] = [null, is_array($jenis) ? 'text' : (self::TIPE[$jenis] ?? 'text')];
                continue;
            }

            if (is_array($jenis)) {
                if (!in_array($s, $jenis, true)) {
                    throw Galat::isian("Isian '$k' harus salah satu dari: " . implode(', ', $jenis) . '.',
                        ['kolom' => $k, 'pilihan' => $jenis]);
                }
                $out[$k] = [$s, 'text'];
                continue;
            }

            switch (is_string($jenis) ? rtrim($jenis, '?') : $jenis) {
                case 'skala':
                    if (!preg_match('/^[1-5]$/', $s)) throw Galat::isian("Isian '$k' harus 1 sampai 5.", ['kolom' => $k]);
                    break;
                case 'nilai':
                    if (!preg_match('/^\d{1,3}$/', $s) || (int) $s > 100) {
                        throw Galat::isian("Isian '$k' harus nilai 0 sampai 100.", ['kolom' => $k]);
                    }
                    break;
                case 'desimal':
                    $s = str_replace(',', '.', $s);
                    if (!is_numeric($s) || (float) $s < 0) throw Galat::isian("Isian '$k' harus angka nol atau lebih.", ['kolom' => $k]);
                    break;
                case 'katbahaya':
                    if (Db::nilai('SELECT 1 FROM kategori_bahaya WHERE kode = :k', [':k' => $s]) === null) {
                        throw Galat::isian('Sumber bahaya tidak dikenal.', ['kolom' => $k]);
                    }
                    break;
                case 'area':
                    $pb = Db::nilai('SELECT pabrik_id FROM area WHERE id::text = :i AND aktif', [':i' => $s]);
                    if ($pb === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => $k]);
                    // Pindah pabrik bukan perubahan isi: nomor, cakupan, dan
                    // KPI catatan ini terikat pada pabriknya.
                    if ($pb !== $c['pabrik_id']) {
                        throw Galat::isian('Area harus berada di pabrik yang sama dengan catatannya.', ['kolom' => $k]);
                    }
                    break;
                case 'pengguna':
                    $ada = Db::nilai("SELECT 1 FROM pengguna WHERE id::text = :i AND status = 'Aktif'", [':i' => $s]);
                    if ($ada === null) throw Galat::isian('Penanggung jawab harus akun yang aktif.', ['kolom' => $k]);
                    break;
                case 'tanggal':
                case 'lampau':
                    $d = \DateTimeImmutable::createFromFormat('!Y-m-d', $s);
                    if ($d === false || $d->format('Y-m-d') !== $s) {
                        throw Galat::isian("Isian '$k' harus tanggal YYYY-MM-DD.", ['kolom' => $k]);
                    }
                    if ($jenis === 'lampau' && $s > date('Y-m-d')) {
                        throw Galat::isian("Isian '$k' tidak boleh setelah hari ini.", ['kolom' => $k]);
                    }
                    break;
                case 'jam?':
                    if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', $s)) {
                        throw Galat::isian("Isian '$k' harus jam HH:MM.", ['kolom' => $k]);
                    }
                    break;
                case 'waktu?':
                    $t = strtotime($s);
                    if ($t === false) throw Galat::isian("Isian '$k' bukan tanggal dan jam yang sahih.", ['kolom' => $k]);
                    // Bentuk baku sebelum sampai ke basis data: strtotime
                    // menerima "besok", PostgreSQL tidak.
                    $s = date('Y-m-d H:i:sP', $t);
                    break;
                case 'bulat0':
                case 'bulat1':
                    if (!preg_match('/^\d{1,9}$/', $s) || ($jenis === 'bulat1' && (int) $s < 1)) {
                        throw Galat::isian("Isian '$k' harus bilangan bulat "
                            . ($jenis === 'bulat1' ? 'sedikitnya 1.' : 'nol atau lebih.'), ['kolom' => $k]);
                    }
                    break;
            }
            $out[$k] = [$s, self::TIPE[$jenis] ?? 'text'];
        }
        return $out;
    }

    /* ── Aturan lintas-kolom; dipanggil dengan nilai gabungan (lama + baru) ── */

    /** @param array<string,?string> $m */
    private static function periksaObservasi(array $m): void
    {
        if ((int) $m['aman'] + (int) $m['berisiko'] === 0) {
            throw Galat::isian('Observasi tanpa satu pun pengamatan tidak dapat disimpan.', ['kolom' => 'aman']);
        }
        if ((int) $m['berisiko'] > 0 && ($m['kategori'] ?? null) === null) {
            throw Galat::isian('Observasi dengan perilaku berisiko harus menyebutkan kategorinya.', ['kolom' => 'kategori']);
        }
    }

    /** @param array<string,?string> $m */
    private static function periksaRegulasi(array $m): void
    {
        Aturan::regulasiBolehTerpenuhi((string) $m['status'], $m['bukti'] ?? null);
    }

    /** @param array<string,?string> $m */
    private static function periksaDokumen(array $m): void
    {
        Aturan::dokumenBolehBerlaku((string) $m['status'], $m['tinjau'] ?? null);
    }

    /** @param array<string,?string> $m */
    private static function periksaDokEksternal(array $m): void
    {
        if ($m['terbit'] !== null && $m['terbit'] > $m['berlaku']) {
            throw Galat::isian('Tanggal terbit tidak boleh setelah tanggal berakhir.', ['kolom' => 'terbit']);
        }
    }

    /**
     * AB-23/24 · masa berlaku dan status kartu induksi DIHITUNG ulang dari
     * nilai, jenis, dan tanggal — sama seperti saat dibuat. Mengubah nilai
     * ujian tanpa menghitung ulang statusnya membuat kartu yang gagal tetap
     * berlaku.
     *
     * @param array<string,?string> $m
     * @param array<string,mixed> $c
     * @return array<string,?string>
     */
    private static function turunanInduksi(array $m, array $c): array
    {
        $nilai = $m['nilai'] === null ? null : (int) $m['nilai'];
        $ambang = (int) \KG\Konfigurasi::satu('ambang_lulus_induksi');
        $lulus = $nilai === null || $nilai >= $ambang;
        $berlaku = $lulus ? Aturan::berlakuInduksi((string) $m['jenis'], (string) $m['tanggal']) : null;
        return ['berlaku' => $berlaku, 'status' => Aturan::statusInduksi($nilai, $berlaku)];
    }

    /**
     * @param array<string,array{0:?string,1:string}> $nilai
     * @return array<string,?string>
     */
    private static function normalkan(array $nilai): array
    {
        $pilih = [];
        $par = [];
        $i = 0;
        foreach ($nilai as $k => [$v, $tipe]) {
            $pilih[] = "CAST(CAST(:v$i AS text) AS $tipe)::text AS $k";
            $par[":v$i"] = $v;
            $i++;
        }
        $baris = Db::baris('SELECT ' . implode(', ', $pilih), $par);
        return $baris ?? [];
    }
}
