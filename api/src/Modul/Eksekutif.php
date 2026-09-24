<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Kpi, Jawab, Permintaan, Sesi, Wewenang};

/**
 * Modul 00 · Dashboard Eksekutif.
 *
 * AB-28 · angka grup tidak menutupi pabrik. Kartu skor per pabrik selalu
 * dikembalikan berdampingan dengan angka grup, dan status tiap pabrik
 * ditentukan oleh indikator TERBURUKNYA, bukan rata-ratanya. Satu pabrik yang
 * belum nihil tidak boleh tertutup oleh tiga pabrik yang sudah nihil.
 */
final class Eksekutif
{
    public static function tampil(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'exec', 'baca');

        $periode = Kpi::periode($p->kueri['periode'] ?? null);
        $lalu    = Kpi::periodeSebelum($periode);
        $T       = Kpi::target();

        // Dashboard eksekutif memang melintasi pabrik; itu gunanya. Peran yang
        // tidak berhak melihatnya sudah ditolak oleh pemeriksaan di atas.
        $pabrik = Db::semua('SELECT id, kode, nama FROM pabrik WHERE aktif ORDER BY urutan');

        $kartu = [];
        $grup  = ['pekerja' => 0, 'jam_kerja' => 0, 'trc' => 0, 'lti' => 0,
                  'hari_hilang' => 0, 'insiden' => 0, 'bahaya' => 0];

        foreach ($pabrik as $pb) {
            $m = Kpi::mentah($pb['id'], $periode);
            foreach (array_keys($grup) as $k) $grup[$k] += $m[$k];

            $trir  = Kpi::trir($m['trc'], $m['jam_kerja']);
            $ltifr = Kpi::ltifr($m['lti'], $m['jam_kerja']);
            $capa  = self::persenCapa($pb['id'], $periode);
            $smk3  = self::persenSmk3($pb['id']);

            $sepi = self::tanpaCatatan($pb['id'], $periode);

            $kartu[] = [
                'kode' => $pb['kode'],
                'nama' => preg_replace('/^Pabrik /', '', $pb['nama']),
                'pekerja' => $m['pekerja'], 'jam_kerja' => $m['jam_kerja'],
                'trir' => $trir, 'ltifr' => $ltifr,
                'insiden' => $m['insiden'], 'bahaya' => $m['bahaya'],
                'capa' => $capa, 'smk3' => $smk3,
                'sumber' => $m['sumber'],
                'tanpa_data' => $sepi,
                // Status tetap salah satu dari tiga nilai yang dikenal
                // antarmuka; yang membedakan pabrik sepi adalah bendera
                // tanpa_data dan penentunya, bukan status keempat.
                'status'  => $sepi ? 'Perhatian' : self::status($trir, $ltifr, $capa, $smk3, $T),
                'penentu' => $sepi ? 'Tanpa catatan' : self::penentu($trir, $ltifr, $capa, $smk3, $T),
            ];
        }

        $kiniTrir  = Kpi::trir($grup['trc'], $grup['jam_kerja']);
        $kiniLtifr = Kpi::ltifr($grup['lti'], $grup['jam_kerja']);
        $dulu      = self::grupMentah($pabrik, $lalu);

        Jawab::kirim([
            'periode' => $periode,
            // Angka grup dan kartu pabrik dikembalikan bersama, selalu.
            // Memisahkannya ke dua permintaan membuat layar mudah menampilkan
            // yang satu tanpa yang lain — persis yang dilarang AB-28.
            'grup' => [
                'pekerja' => $grup['pekerja'], 'jam_kerja' => $grup['jam_kerja'],
                'insiden' => $grup['insiden'], 'bahaya' => $grup['bahaya'],
                'trir'  => Kpi::angka($T['trir'], $kiniTrir,
                    Kpi::trir($dulu['trc'], $dulu['jam_kerja']), 'bulan lalu'),
                'ltifr' => Kpi::angka($T['ltifr'], $kiniLtifr,
                    Kpi::ltifr($dulu['lti'], $dulu['jam_kerja']), 'bulan lalu'),
                // Status grup mengikuti pabrik terburuk, bukan rata-ratanya.
                'status' => self::terburuk(array_column($kartu, 'status')),
                'pabrik_terburuk' => self::pabrikTerburuk($kartu),
            ],
            'pabrik' => $kartu,
            'program' => Db::semua(
                'SELECT nama, target, capai, dari, tenggat, status
                   FROM program_strategis ORDER BY urutan, nama'
            ),
        ]);
    }

    /** @param array<int,array<string,mixed>> $pabrik @return array<string,int> */
    private static function grupMentah(array $pabrik, string $periode): array
    {
        $out = ['trc' => 0, 'lti' => 0, 'jam_kerja' => 0];
        foreach ($pabrik as $pb) {
            $m = Kpi::mentah($pb['id'], $periode);
            foreach (array_keys($out) as $k) $out[$k] += $m[$k];
        }
        return $out;
    }

    private static function persenCapa(string $pabrikId, string $periode): ?int
    {
        $r = Db::baris(
            "SELECT count(*) AS total, count(*) FILTER (WHERE status = 'Selesai') AS selesai
               FROM capa WHERE pabrik_id = :pb AND dihapus_pada IS NULL AND terbit <= :akhir",
            [':pb' => $pabrikId, ':akhir' => date('Y-m-t', strtotime($periode))]
        );
        return (int) $r['total'] > 0 ? (int) round((int) $r['selesai'] * 100 / (int) $r['total']) : null;
    }

    /**
     * Pemenuhan kriteria SMK3, bukan persentase temuan yang ditutup. Temuan
     * menghitung apa yang salah; pemenuhan kriteria menghitung apa yang sudah
     * ada. Dua hal berbeda yang mudah tertukar dan menghasilkan angka keliru.
     */
    private static function persenSmk3(string $pabrikId): ?int
    {
        $r = Db::baris(
            'SELECT coalesce(sum(kriteria), 0) AS kriteria, coalesce(sum(penuhi), 0) AS penuhi
               FROM elemen_smk3 WHERE pabrik_id = :pb', [':pb' => $pabrikId]
        );
        return (int) $r['kriteria'] > 0
            ? (int) round((int) $r['penuhi'] * 100 / (int) $r['kriteria']) : null;
    }

    /**
     * Pabrik yang tidak punya satu pun catatan pada periode ini. TRIR nol di
     * sini bukan kabar baik, melainkan tanda tidak ada yang mencatat — jebakan
     * "tidak ada kabar berarti aman" yang justru dilarang AB-19 dan AB-28.
     */
    private static function tanpaCatatan(string $pabrikId, string $periode): bool
    {
        $par = [':pb' => $pabrikId, ':awal' => $periode, ':akhir' => date('Y-m-t', strtotime($periode))];
        return (int) Db::nilai(
            "SELECT (SELECT count(*) FROM insiden WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                      AND tanggal BETWEEN :awal AND :akhir)
                  + (SELECT count(*) FROM bahaya WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                      AND dibuat_pada::date BETWEEN :awal AND :akhir)
                  + (SELECT count(*) FROM inspeksi WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                      AND tanggal BETWEEN :awal AND :akhir)
                  + (SELECT count(*) FROM observasi_apd WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                      AND tanggal BETWEEN :awal AND :akhir)", $par
        ) === 0;
    }

    private const PERINGKAT = ['Baik' => 0, 'Perhatian' => 1, 'Kritis' => 2];

    /**
     * Status satu pabrik = indikator terburuknya. Rata-rata akan
     * menenggelamkan satu angka merah di antara tiga angka hijau, dan itulah
     * satu angka yang perlu dilihat.
     *
     * @param array<string,array<string,mixed>> $T
     */
    private static function status(?float $trir, ?float $ltifr, ?int $capa, ?int $smk3, array $T): string
    {
        $paling = 'Baik';
        foreach (self::nilaiTerhadapTarget($trir, $ltifr, $capa, $smk3, $T) as [, $s]) {
            if (self::PERINGKAT[$s] > self::PERINGKAT[$paling]) $paling = $s;
        }
        return $paling;
    }

    /** Indikator mana yang menentukan statusnya — supaya angkanya dapat ditindaklanjuti. */
    private static function penentu(?float $trir, ?float $ltifr, ?int $capa, ?int $smk3, array $T): ?string
    {
        $paling = null;
        $skor   = -1;
        foreach (self::nilaiTerhadapTarget($trir, $ltifr, $capa, $smk3, $T) as [$nama, $s]) {
            if (self::PERINGKAT[$s] > $skor) { $skor = self::PERINGKAT[$s]; $paling = $nama; }
        }
        return $skor > 0 ? $paling : null;
    }

    /** @return array<int,array{0:string,1:string}> */
    private static function nilaiTerhadapTarget(?float $trir, ?float $ltifr, ?int $capa,
                                                ?int $smk3, array $T): array
    {
        $turun = static function (?float $n, ?float $target): string {
            if ($n === null || $target === null) return 'Baik';
            if ($n > $target * 1.2) return 'Kritis';
            return $n > $target ? 'Perhatian' : 'Baik';
        };
        $naik = static function (?int $n, ?float $target): string {
            if ($n === null || $target === null) return 'Baik';
            if ($n < $target * 0.8) return 'Kritis';
            return $n < $target ? 'Perhatian' : 'Baik';
        };
        return [
            ['TRIR',  $turun($trir,  $T['trir']['target']  === null ? null : (float) $T['trir']['target'])],
            ['LTIFR', $turun($ltifr, $T['ltifr']['target'] === null ? null : (float) $T['ltifr']['target'])],
            ['CAPA',  $naik($capa,   $T['capa']['target']  === null ? null : (float) $T['capa']['target'])],
            ['SMK3',  $naik($smk3,   90.0)],
        ];
    }

    /** @param array<int,string> $status */
    private static function terburuk(array $status): string
    {
        $paling = 'Baik';
        foreach ($status as $s) if (self::PERINGKAT[$s] > self::PERINGKAT[$paling]) $paling = $s;
        return $paling;
    }

    /** @param array<int,array<string,mixed>> $kartu */
    private static function pabrikTerburuk(array $kartu): ?string
    {
        $nama = null;
        $skor = 0;
        foreach ($kartu as $k) {
            if (self::PERINGKAT[$k['status']] > $skor) {
                $skor = self::PERINGKAT[$k['status']];
                $nama = $k['nama'];
            }
        }
        return $nama;
    }
}
