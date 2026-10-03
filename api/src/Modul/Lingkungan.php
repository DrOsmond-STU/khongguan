<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Permintaan, Sesi, Wewenang};

/**
 * Modul 12 · Lingkungan.
 *
 * Empat pemantauan — air, udara, limbah, dan limbah B3 — masing-masing
 * dengan parameternya. Lulus atau tidak disimpan per parameter, bukan
 * dihitung: ambangnya berupa kalimat yang bentuknya berbeda-beda
 * ("6,0 – 9,0", "≤ 50", "daur ulang 96%"), dan menebak maksudnya dari teks
 * adalah cara paling rapi untuk salah tanpa ketahuan.
 */
final class Lingkungan
{
    public static function tampil(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'environment', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'pl');

        $pemantauan = Db::semua(
            "SELECT DISTINCT ON (pl.kode) pl.id, pl.kode, pl.judul, pl.sub, pl.acuan, pl.periode
               FROM pemantauan_lingkungan pl
              WHERE $saring
              ORDER BY pl.kode, pl.periode DESC", $par
        );
        if ($pemantauan === []) Jawab::kirim([]);

        $tanda = [];
        $ids   = [];
        foreach ($pemantauan as $i => $m) { $tanda[] = ":p$i"; $ids[":p$i"] = $m['id']; }

        $per = [];
        foreach (Db::semua(
            'SELECT id, pemantauan_id, nama, nilai, satuan, ambang, memenuhi
               FROM parameter_lingkungan
              WHERE pemantauan_id IN (' . implode(',', $tanda) . ')
              ORDER BY urutan', $ids
        ) as $r) {
            $per[$r['pemantauan_id']][] = [
                'id' => $r['id'], 'nama' => $r['nama'], 'nilai' => $r['nilai'], 'satuan' => $r['satuan'],
                'ambang' => $r['ambang'], 'memenuhi' => $r['memenuhi'] === true,
            ];
        }

        $out = [];
        foreach ($pemantauan as $m) {
            $m['param'] = $per[$m['id']] ?? [];
            $out[$m['kode']] = $m;
        }
        Jawab::kirim($out);
    }

    private const DOMAIN = [
        'pppa'   => 'PPPA — Pengendalian Pencemaran Air',
        'pppu'   => 'PPPU — Pengendalian Pencemaran Udara',
        'limbah' => 'Waste Management',
        'plb3'   => 'PLB3 — Limbah Bahan Berbahaya & Beracun',
    ];

    /**
     * POST /lingkungan — hasil uji satu domain untuk satu bulan.
     *
     * Memenuhi atau tidak DIHITUNG peladen dari nilai dan baku mutunya bila
     * keduanya angka ("≤ 50", "6,0 – 9,0"); centang "memenuhi" dari formulir
     * hanya dipakai untuk parameter yang ambangnya bukan angka. Hasil uji
     * yang dapat dinyatakan memenuhi oleh orang yang mengetiknya, padahal
     * angkanya di atas baku mutu, adalah laporan lingkungan yang tidak
     * dapat dipertanggungjawabkan.
     *
     * Satu domain satu hasil per bulan: kiriman kedua pada bulan yang sama
     * menggantikan yang pertama (uji ulang), dan jejaknya mencatat keduanya.
     */
    public static function simpan(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'environment', 'isi');

        $kode = $p->wajibPilihan('kode', array_keys(self::DOMAIN));
        $tgl  = $p->wajibTeks('tanggal');
        $d = \DateTimeImmutable::createFromFormat('!Y-m-d', $tgl);
        if ($d === false || $d->format('Y-m-d') !== $tgl) {
            throw Galat::isian("Isian 'tanggal' harus tanggal YYYY-MM-DD.", ['kolom' => 'tanggal']);
        }
        if ($tgl > date('Y-m-d')) throw Galat::isian('Tanggal pengujian tidak boleh setelah hari ini.', ['kolom' => 'tanggal']);
        $lab   = $p->wajibTeks('lab');
        $titik = trim((string) $p->isi('titik', '')) ?: 'Hasil uji';

        $param = $p->isi('parameter', []);
        if (!is_array($param) || $param === []) {
            throw Galat::isian('Hasil uji harus memuat sedikitnya satu parameter.', ['kolom' => 'parameter']);
        }
        $bersih = [];
        foreach (array_values($param) as $i => $r) {
            $nama = trim((string) ($r['nama'] ?? ''));
            $nilai = trim((string) ($r['nilai'] ?? ''));
            if ($nama === '' && $nilai === '') continue;
            if ($nama === '' || $nilai === '') {
                throw Galat::isian('Parameter ke-' . ($i + 1) . ': nama dan nilainya wajib diisi.', ['kolom' => 'parameter']);
            }
            $ambang = trim((string) ($r['ambang'] ?? ''));
            $hitung = self::memenuhi($nilai, $ambang);
            if ($hitung === null) {
                if (!isset($r['memenuhi']) || !is_bool($r['memenuhi'])) {
                    throw Galat::isian("Parameter '$nama': baku mutunya bukan angka, jadi memenuhi atau tidak harus dipilih.",
                        ['kolom' => 'parameter']);
                }
                $hitung = $r['memenuhi'];
            }
            $bersih[] = ['nama' => $nama, 'nilai' => $nilai, 'satuan' => trim((string) ($r['satuan'] ?? '')),
                         'ambang' => $ambang === '' ? '—' : $ambang, 'memenuhi' => $hitung];
        }
        if ($bersih === []) throw Galat::isian('Hasil uji harus memuat sedikitnya satu parameter.', ['kolom' => 'parameter']);

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);
        $periode = $d->format('Y-m-01');
        $bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $sub = $titik . ' · ' . $d->format('d') . ' ' . $bulan[(int) $d->format('n') - 1] . ' ' . $d->format('Y') . ' · ' . $lab;

        $hasil = Db::transaksi(function () use ($u, $pabrik, $kode, $periode, $sub, $bersih, $p) {
            $lama = Db::baris('SELECT id, acuan FROM pemantauan_lingkungan
                                WHERE pabrik_id = :pb AND kode = :k AND periode = :pr FOR UPDATE',
                [':pb' => $pabrik, ':k' => $kode, ':pr' => $periode]);
            $acuanLalu = Db::nilai('SELECT acuan FROM pemantauan_lingkungan WHERE pabrik_id = :pb AND kode = :k
                                     ORDER BY periode DESC LIMIT 1', [':pb' => $pabrik, ':k' => $kode]);
            $acuan = trim((string) $p->isi('acuan', '')) ?: (is_string($acuanLalu) ? $acuanLalu : 'Baku mutu yang berlaku');

            if ($lama === null) {
                $id = (string) Db::nilai(
                    'INSERT INTO pemantauan_lingkungan (pabrik_id, kode, judul, sub, acuan, periode, dibuat_oleh)
                     VALUES (:pb, :k, :j, :s, :a, :pr, :o) RETURNING id',
                    [':pb' => $pabrik, ':k' => $kode, ':j' => self::DOMAIN[$kode], ':s' => $sub,
                     ':a' => $acuan, ':pr' => $periode, ':o' => $u['id']]);
                $aksi = 'buat';
            } else {
                $id = $lama['id'];
                Db::jalankan('UPDATE pemantauan_lingkungan SET sub = :s, acuan = :a WHERE id = :i',
                    [':s' => $sub, ':a' => $acuan, ':i' => $id]);
                $aksi = 'ubah';
            }

            // Uji ulang memperbarui parameter yang sama (menurut namanya),
            // bukan menghapus lalu membuat baru: CAPA yang lahir dari
            // parameter yang melewati baku mutu menunjuk barisnya, dan
            // rujukan itu tidak boleh putus justru saat hasil perbaikannya
            // diuji. Parameter lama yang tidak diuji ulang dibuang hanya bila
            // tidak menjadi sumber CAPA.
            $ada = [];
            foreach (Db::semua('SELECT id, nama FROM parameter_lingkungan WHERE pemantauan_id = :i', [':i' => $id]) as $r) {
                $ada[mb_strtolower($r['nama'])] = $r['id'];
            }
            foreach ($bersih as $i => $r) {
                $isi = [':u' => $i + 1, ':n' => $r['nama'], ':v' => $r['nilai'], ':s' => $r['satuan'],
                        ':a' => $r['ambang'], ':m' => $r['memenuhi'] ? 'true' : 'false'];
                $kunci = mb_strtolower($r['nama']);
                if (isset($ada[$kunci])) {
                    Db::jalankan('UPDATE parameter_lingkungan SET urutan = :u, nama = :n, nilai = :v, satuan = :s,
                                         ambang = :a, memenuhi = :m WHERE id = :id', $isi + [':id' => $ada[$kunci]]);
                    unset($ada[$kunci]);
                } else {
                    Db::jalankan('INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
                                  VALUES (:p, :u, :n, :v, :s, :a, :m)', $isi + [':p' => $id]);
                }
            }
            foreach ($ada as $sisaId) {
                Db::jalankan("DELETE FROM parameter_lingkungan WHERE id = :i
                               AND NOT EXISTS (SELECT 1 FROM capa WHERE sumber_jenis = 'Lingkungan' AND sumber_id = :j)",
                    [':i' => $sisaId, ':j' => $sisaId]);
            }
            $lewat = array_values(array_map(fn($r) => $r['nama'], array_filter($bersih, fn($r) => !$r['memenuhi'])));
            Jejak::catat('pemantauan_lingkungan', $id, $aksi, null,
                ['kode' => $kode, 'periode' => $periode, 'parameter' => count($bersih), 'melewati' => $lewat], $u['id']);
            return ['id' => $id, 'kode' => $kode, 'periode' => $periode, 'parameter' => count($bersih),
                    'melewati' => $lewat, 'mengganti' => $aksi === 'ubah'];
        });

        Jawab::kirim($hasil, 201);
    }

    /**
     * true/false bila nilai dan ambang dapat dibandingkan sebagai angka,
     * null bila tidak. Koma desimal Indonesia diterima.
     */
    public static function memenuhi(string $nilai, string $ambang): ?bool
    {
        // "7,2" koma desimal; "1.250" titik ribuan; "7.2" (diketik dengan
        // titik) tetap tujuh koma dua — tidak menjadi tujuh puluh dua.
        $angka = static function (string $s): ?float {
            $s = trim($s);
            if (str_contains($s, ',')) $s = str_replace(['.', ','], ['', '.'], $s);
            elseif (preg_match('/^\d{1,3}(\.\d{3})+$/', $s)) $s = str_replace('.', '', $s);
            return is_numeric($s) ? (float) $s : null;
        };
        $v = $angka($nilai);
        if ($v === null) return null;
        $a = trim(str_replace(['<=', '>='], ['≤', '≥'], $ambang));
        if (preg_match('/^(≤|<|≥|>)\s*(.+)$/u', $a, $m)) {
            $b = $angka($m[2]);
            if ($b === null) return null;
            return match ($m[1]) { '≤' => $v <= $b, '<' => $v < $b, '≥' => $v >= $b, '>' => $v > $b };
        }
        if (preg_match('/^(.+?)\s*[–—-]\s*(.+)$/u', $a, $m)) {
            $lo = $angka($m[1]); $hi = $angka($m[2]);
            if ($lo === null || $hi === null) return null;
            return $v >= $lo && $v <= $hi;
        }
        return null;
    }
}
