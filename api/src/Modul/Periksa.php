<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Permintaan, Sesi, Wewenang};

/**
 * Mengisi hasil inspeksi dan checklist, butir demi butir.
 *
 * Keduanya dibuat dengan daftar butir yang belum dijawab ("Mulai
 * Inspeksi", "Kerjakan Checklist"); di sinilah jawabannya masuk.
 *
 * - "Tidak Sesuai" wajib bercatatan: temuan tanpa uraian tidak dapat
 *   ditindaklanjuti, apalagi dijadikan CAPA.
 * - Menyelesaikan menuntut SETIAP butir terjawab. Inspeksi yang "selesai"
 *   dengan butir kosong adalah inspeksi yang tidak dikerjakan.
 * - Checklist pada unit: jawaban Tidak Sesuai mengunci unitnya (pemicu
 *   checklist_kunci_unit, AB-08). Kuncinya dibuka hanya oleh checklist
 *   berikutnya pada unit yang sama yang SELESAI tanpa satu pun Tidak
 *   Sesuai — alat yang sudah diperbaiki dibuktikan lewat pemeriksaan ulang,
 *   bukan lewat tombol.
 */
final class Periksa
{
    private const JENIS = [
        'inspeksi'  => ['tabel' => 'inspeksi', 'butir' => 'inspeksi_butir', 'kunci' => 'inspeksi_id',
                        'modul' => 'inspection', 'nama' => 'Inspeksi'],
        'checklist' => ['tabel' => 'checklist', 'butir' => 'checklist_butir', 'kunci' => 'checklist_id',
                        'modul' => 'checklist', 'nama' => 'Checklist'],
    ];

    /** POST /{inspeksi|checklist}/{id}/jawab — { jawaban: [{id, jawab, catatan}], selesai: bool } */
    public static function jawab(Permintaan $p, array $par, string $jenis): never
    {
        $d = self::JENIS[$jenis];
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, $d['modul'], 'isi');

        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $par['id'])) throw Galat::takAda($d['nama'] . ' tidak ditemukan.');
        $jawaban = $p->isi('jawaban', []);
        if (!is_array($jawaban)) throw Galat::isian("Isian 'jawaban' harus daftar.", ['kolom' => 'jawaban']);
        $selesai = (bool) $p->isi('selesai', false);

        $hasil = Db::transaksi(function () use ($d, $jenis, $u, $par, $jawaban, $selesai) {
            $unitKolom = $jenis === 'checklist' ? ', unit_id' : '';
            $c = Db::baris("SELECT id, nomor, pabrik_id, status$unitKolom FROM {$d['tabel']}
                             WHERE id = :i AND dihapus_pada IS NULL FOR UPDATE", [':i' => $par['id']]);
            if ($c === null) throw Galat::takAda($d['nama'] . ' tidak ditemukan.');
            Wewenang::wajibCakupan($u, $c['pabrik_id']);
            if ($c['status'] === 'Selesai') {
                throw new Galat(409, 'TERKUNCI', $d['nama'] . ' ' . $c['nomor'] . ' sudah selesai; hasilnya tidak diubah lagi.');
            }

            $milik = array_column(Db::semua("SELECT id, butir FROM {$d['butir']} WHERE {$d['kunci']} = :i",
                [':i' => $c['id']]), 'butir', 'id');
            foreach ($jawaban as $j) {
                if (!is_array($j) || !isset($milik[$j['id'] ?? ''])) {
                    throw Galat::isian('Butir tidak dikenal pada ' . $c['nomor'] . '.', ['kolom' => 'jawaban']);
                }
                $nilai = $j['jawab'] ?? null;
                $nilai = $nilai === '' ? null : $nilai;
                if ($nilai !== null && !in_array($nilai, ['Sesuai', 'Tidak Sesuai', 'Tidak Berlaku'], true)) {
                    throw Galat::isian('Jawaban harus Sesuai, Tidak Sesuai, atau Tidak Berlaku.', ['kolom' => 'jawaban']);
                }
                $catatan = trim((string) ($j['catatan'] ?? ''));
                if ($nilai === 'Tidak Sesuai' && $catatan === '') {
                    throw Galat::isian('Butir "' . $milik[$j['id']] . '" dijawab Tidak Sesuai: uraikan temuannya.',
                        ['kolom' => 'catatan', 'butir' => $j['id']]);
                }
                Db::jalankan("UPDATE {$d['butir']} SET jawab = :j, catatan = :c WHERE id = :i",
                    [':j' => $nilai, ':c' => $catatan === '' ? null : $catatan, ':i' => $j['id']]);
            }

            $hitung = Db::baris(
                "SELECT count(*) AS semua, count(jawab) AS dijawab,
                        count(*) FILTER (WHERE jawab = 'Tidak Sesuai') AS tidak_sesuai
                   FROM {$d['butir']} WHERE {$d['kunci']} = :i", [':i' => $c['id']]);
            $semua = (int) $hitung['semua'];
            $dijawab = (int) $hitung['dijawab'];
            $tidak = (int) $hitung['tidak_sesuai'];

            if ($selesai && $dijawab < $semua) {
                throw Galat::isian(($semua - $dijawab) . ' butir belum dijawab. ' . $d['nama']
                    . ' hanya dapat diselesaikan bila setiap butir terjawab.', ['kolom' => 'jawaban']);
            }
            $status = $selesai ? 'Selesai' : ($dijawab > 0 ? 'Dalam Proses' : 'Terbuka');
            Db::jalankan("UPDATE {$d['tabel']} SET status = :s, diubah_oleh = :u, diubah_pada = now() WHERE id = :i",
                [':s' => $status, ':u' => $u['id'], ':i' => $c['id']]);

            $unit = null;
            if ($jenis === 'checklist' && $c['unit_id'] !== null) {
                if ($selesai && $tidak === 0) {
                    $dibuka = Db::jalankan("UPDATE unit_periksa SET status = 'Layak', dikunci_oleh_checklist = NULL,
                                                   dikunci_pada = NULL
                                             WHERE id = :u AND status = 'Terkunci'", [':u' => $c['unit_id']]);
                    if ($dibuka > 0) {
                        Jejak::catat('unit_periksa', $c['unit_id'], 'ubah', ['status' => 'Terkunci'],
                            ['status' => 'Layak', 'dibuka_oleh_checklist' => $c['nomor']], $u['id']);
                    }
                }
                $unit = Db::baris('SELECT kode, nama, status FROM unit_periksa WHERE id = :i', [':i' => $c['unit_id']]);
            }

            Jejak::catat($d['tabel'], $c['id'], 'ubah', ['status' => $c['status']],
                ['status' => $status, 'dijawab' => $dijawab, 'tidak_sesuai' => $tidak], $u['id']);

            return ['id' => $c['id'], 'nomor' => $c['nomor'], 'status' => $status, 'butir' => $semua,
                    'dijawab' => $dijawab, 'tidak_sesuai' => $tidak, 'unit' => $unit];
        });

        Jawab::kirim($hasil);
    }
}
