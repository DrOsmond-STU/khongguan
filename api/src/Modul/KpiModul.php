<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Kpi, Jawab, Permintaan, Sesi, Wewenang};

/**
 * Modul 21 · SHE KPI & Analytics.
 *
 * AB-26 · lagging dan leading dikembalikan sebagai dua deret terpisah, tidak
 * pernah satu. Mencampurnya membuat pembaca menyimpulkan bahwa angka yang
 * naik dan angka yang turun sama-sama kabar baik, atau sama-sama buruk.
 */
final class KpiModul
{
    public static function tampil(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'kpi', 'baca');

        $pabrik  = (string) ($p->kueri['pabrik_id'] ?? $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $periode = Kpi::periode($p->kueri['periode'] ?? null);
        $lalu    = Kpi::periodeSebelum($periode);

        $kini = Kpi::mentah($pabrik, $periode);
        $dulu = Kpi::mentah($pabrik, $lalu);
        $T    = Kpi::target();

        $namaBulanLalu = self::namaBulan($lalu);
        // Bulan berjalan dihitung dari catatan; bulan sebelum sistem berjalan
        // berasal dari rekap. Selisih antara keduanya bukan perbandingan yang
        // setara, dan API mengatakannya alih-alih membiarkan pembaca
        // menyimpulkan tren dari dua sumber berbeda.
        $setara = $kini['sumber'] === $dulu['sumber'];

        $lagging = [
            Kpi::angka($T['trir'],
                Kpi::trir($kini['trc'], $kini['jam_kerja']),
                Kpi::trir($dulu['trc'], $dulu['jam_kerja']), $namaBulanLalu,
                $kini['trc'] . ' TRC ÷ ' . number_format($kini['jam_kerja'], 0, ',', '.') . ' jam',
                $setara),
            Kpi::angka($T['ltifr'],
                Kpi::ltifr($kini['lti'], $kini['jam_kerja']),
                Kpi::ltifr($dulu['lti'], $dulu['jam_kerja']), $namaBulanLalu,
                $kini['lti'] . ' LTI pada periode', $setara),
            // AB-19 · LTISR tidak punya target, jadi pembandingnya adalah
            // akumulasi tahun berjalan. Tanpa itu ia tampil sebagai angka
            // telanjang, yang tidak memberi tahu pembaca apa pun.
            Kpi::angka($T['ltisr'],
                Kpi::ltisr($kini['hari_hilang'], $kini['jam_kerja']),
                Kpi::ltisr($dulu['hari_hilang'], $dulu['jam_kerja']), $namaBulanLalu,
                'Akumulasi tahun berjalan: ' . self::akumulasiHariHilang($pabrik) . ' hari hilang',
                $setara),
            Kpi::angka($T['manhours'], self::jamSejakLti($pabrik), null, '—',
                self::catatanSejakLti($pabrik)),
            Kpi::angka($T['hari_hilang'], $kini['hari_hilang'], $dulu['hari_hilang'], $namaBulanLalu,
                'Akumulasi tahun berjalan: ' . self::akumulasiHariHilang($pabrik) . ' hari', $setara),
            Kpi::angka($T['kerugian'], $kini['kerugian'], $dulu['kerugian'], $namaBulanLalu),
        ];

        $leading = [
            Kpi::angka($T['bahaya'], $kini['bahaya'], $dulu['bahaya'], $namaBulanLalu,
                $kini['pekerja'] > 0
                    ? 'Naik itu baik · ' . round($kini['bahaya'] / $kini['pekerja'], 2) . ' laporan per pekerja'
                    : 'Naik itu baik', $setara),
            self::persen($T['inspeksi'], $pabrik, $periode, $lalu, $namaBulanLalu),
            self::capaTepatWaktu($T['capa'], $pabrik, $periode, $lalu, $namaBulanLalu),
            self::jamPelatihan($T['pelatihan'], $pabrik, $periode, $lalu, $namaBulanLalu, $kini['pekerja']),
            self::patroli($T['patroli'], $pabrik, $periode, $lalu, $namaBulanLalu),
            self::kepatuhanApd($T['apd'], $pabrik, $periode, $lalu, $namaBulanLalu),
        ];

        Jawab::kirim([
            'periode'  => $periode,
            'sumber'   => $kini['sumber'],
            'sumber_sebelum' => $dulu['sumber'],
            'pekerja'  => $kini['pekerja'],
            'jam_kerja' => $kini['jam_kerja'],
            // AB-26 · dua deret, tidak pernah satu.
            'lagging'  => $lagging,
            'leading'  => $leading,
        ]);
    }

    /** Tren 12 bulan; setiap titik menyebut sumbernya. */
    public static function tren(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'kpi', 'baca');
        $pabrik = (string) ($p->kueri['pabrik_id'] ?? $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $akhir = Kpi::periode($p->kueri['periode'] ?? null);
        $titik = [];
        for ($i = 11; $i >= 0; $i--) {
            $per = date('Y-m-01', strtotime("$akhir -$i month"));
            $m   = Kpi::mentah($pabrik, $per);
            $titik[] = [
                'periode' => $per,
                'bln'     => self::namaBulanSingkat($per),
                'insiden' => $m['insiden'],
                'bahaya'  => $m['bahaya'],
                'trir'    => Kpi::trir($m['trc'], $m['jam_kerja']),
                'sumber'  => $m['sumber'],
            ];
        }
        Jawab::kirim($titik);
    }

    /* ── Pembantu ──────────────────────────────────────────────────── */

    private static function persen(array $t, string $pabrik, string $periode,
                                   string $lalu, string $banding): array
    {
        $hitung = function (string $per) use ($pabrik): array {
            $par = [':pb' => $pabrik, ':awal' => $per, ':akhir' => date('Y-m-t', strtotime($per))];
            $r = Db::baris(
                "SELECT count(*) AS total, count(*) FILTER (WHERE status = 'Selesai') AS selesai
                   FROM inspeksi WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                    AND tanggal BETWEEN :awal AND :akhir", $par
            );
            return [(int) $r['selesai'], (int) $r['total']];
        };
        [$s, $n] = $hitung($periode);
        [$s2, $n2] = $hitung($lalu);
        return Kpi::angka($t,
            $n > 0 ? round($s * 100 / $n) : null,
            $n2 > 0 ? round($s2 * 100 / $n2) : null, $banding,
            "Selesai $s dari $n");
    }

    private static function capaTepatWaktu(array $t, string $pabrik, string $periode,
                                           string $lalu, string $banding): array
    {
        $hitung = function (string $per) use ($pabrik): array {
            $par = [':pb' => $pabrik, ':awal' => $per, ':akhir' => date('Y-m-t', strtotime($per))];
            $r = Db::baris(
                "SELECT count(*) AS selesai,
                        count(*) FILTER (WHERE diverifikasi_pada::date <= tenggat) AS tepat
                   FROM capa WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                    AND status = 'Selesai' AND diverifikasi_pada::date BETWEEN :awal AND :akhir", $par
            );
            return [(int) $r['tepat'], (int) $r['selesai']];
        };
        [$a, $b]   = $hitung($periode);
        [$a2, $b2] = $hitung($lalu);
        return Kpi::angka($t,
            $b > 0 ? round($a * 100 / $b) : null,
            $b2 > 0 ? round($a2 * 100 / $b2) : null, $banding,
            "Selesai tepat waktu $a dari $b");
    }

    /** AB-25 · dari kegiatan, bukan diisi manual. */
    private static function jamPelatihan(array $t, string $pabrik, string $periode, string $lalu,
                                         string $banding, int $pekerja): array
    {
        $jam = function (string $per) use ($pabrik): float {
            return (float) Db::nilai(
                'SELECT coalesce(sum(peserta * durasi_jam), 0) FROM kegiatan
                  WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                    AND tanggal BETWEEN :awal AND :akhir',
                [':pb' => $pabrik, ':awal' => $per, ':akhir' => date('Y-m-t', strtotime($per))]
            );
        };
        return Kpi::angka($t,
            $pekerja > 0 ? round($jam($periode) / $pekerja, 1) : null,
            $pekerja > 0 ? round($jam($lalu) / $pekerja, 1) : null, $banding,
            'Dari ' . round($jam($periode), 1) . ' jam-orang kegiatan (AB-25)');
    }

    private static function patroli(array $t, string $pabrik, string $periode,
                                    string $lalu, string $banding): array
    {
        $n = fn (string $per): int => (int) Db::nilai(
            "SELECT count(*) FROM kegiatan WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                AND jenis = 'Safety Patrol' AND tanggal BETWEEN :awal AND :akhir",
            [':pb' => $pabrik, ':awal' => $per, ':akhir' => date('Y-m-t', strtotime($per))]
        );
        return Kpi::angka($t, $n($periode), $n($lalu), $banding);
    }

    private static function kepatuhanApd(array $t, string $pabrik, string $periode,
                                         string $lalu, string $banding): array
    {
        $hitung = function (string $per) use ($pabrik): array {
            $r = Db::baris(
                'SELECT coalesce(sum(diamati), 0) AS diamati, coalesce(sum(patuh), 0) AS patuh
                   FROM observasi_apd WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                    AND tanggal BETWEEN :awal AND :akhir',
                [':pb' => $pabrik, ':awal' => $per, ':akhir' => date('Y-m-t', strtotime($per))]
            );
            return [(int) $r['patuh'], (int) $r['diamati']];
        };
        [$p1, $d1] = $hitung($periode);
        [$p2, $d2] = $hitung($lalu);
        return Kpi::angka($t,
            $d1 > 0 ? round($p1 * 100 / $d1) : null,
            $d2 > 0 ? round($p2 * 100 / $d2) : null, $banding,
            "Dari $d1 pengamatan APD");
    }

    private static function jamSejakLti(string $pabrik): ?int
    {
        $sejak = Db::nilai(
            "SELECT max(tanggal) FROM insiden
              WHERE pabrik_id = :pb AND dihapus_pada IS NULL AND hari_kerja_hilang > 0",
            [':pb' => $pabrik]
        );
        $mulai = $sejak === null ? date('Y-01-01') : (string) $sejak;
        return (int) Db::nilai(
            'SELECT coalesce(sum(jam_kerja), 0) FROM jam_kerja_bulanan
              WHERE pabrik_id = :pb AND periode >= date_trunc(\'month\', :m::date)',
            [':pb' => $pabrik, ':m' => $mulai]
        );
    }

    private static function catatanSejakLti(string $pabrik): string
    {
        $sejak = Db::nilai(
            "SELECT max(tanggal) FROM insiden
              WHERE pabrik_id = :pb AND dihapus_pada IS NULL AND hari_kerja_hilang > 0",
            [':pb' => $pabrik]
        );
        if ($sejak === null) return 'Belum ada LTI tercatat';
        $hari = (int) floor((strtotime('today') - strtotime((string) $sejak)) / 86400);
        return "$hari hari tanpa LTI";
    }

    private static function akumulasiHariHilang(string $pabrik): int
    {
        return (int) Db::nilai(
            'SELECT coalesce(sum(hari_kerja_hilang), 0) FROM insiden
              WHERE pabrik_id = :pb AND dihapus_pada IS NULL AND tanggal >= :awal',
            [':pb' => $pabrik, ':awal' => date('Y-01-01')]
        );
    }

    private const BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
                           'Juli','Agustus','September','Oktober','November','Desember'];
    private const SINGKAT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    private static function namaBulan(string $periode): string
    {
        return self::BULAN[(int) date('n', strtotime($periode)) - 1];
    }

    private static function namaBulanSingkat(string $periode): string
    {
        return self::SINGKAT[(int) date('n', strtotime($periode)) - 1];
    }
}
