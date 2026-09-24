<?php
declare(strict_types=1);

namespace KG;

/**
 * Perhitungan KPI.
 *
 * Dipisahkan dari modulnya karena dipakai dua layar sekaligus — SHE KPI dan
 * Dashboard Eksekutif — dan dua salinan rumus yang sama adalah cara paling
 * umum dua layar menampilkan dua angka berbeda untuk hal yang sama.
 *
 * Tiga aturan yang mengikat perhitungan di sini:
 *
 *   AB-26 · lagging dan leading tidak pernah dikembalikan dalam satu deret.
 *   AB-27 · setiap angka membawa rumusnya, diambil dari tabel target_kpi.
 *   AB-19 · setiap angka membawa pembanding — periode sebelumnya, target,
 *           atau keduanya. Angka tanpa pembanding tidak memberi tahu apa pun.
 */
final class Kpi
{
    /** Awal bulan dari sebuah tanggal. */
    public static function periode(?string $tanggal = null): string
    {
        return date('Y-m-01', strtotime($tanggal ?? 'today'));
    }

    public static function periodeSebelum(string $periode): string
    {
        return date('Y-m-01', strtotime("$periode -1 month"));
    }

    /**
     * Angka mentah satu pabrik pada satu bulan.
     *
     * Bulan yang tidak punya catatan sistem diambil dari rekap awal, dan
     * hasilnya menyebutkan sumbernya. Grafik yang mencampur dua sumber tanpa
     * mengatakannya adalah grafik yang tidak dapat dipertanggungjawabkan.
     *
     * @return array<string,mixed>
     */
    public static function mentah(string $pabrikId, string $periode): array
    {
        $akhir = date('Y-m-t', strtotime($periode));
        $par = [':pb' => $pabrikId, ':awal' => $periode, ':akhir' => $akhir];

        $jam = Db::baris(
            'SELECT jam_kerja, pekerja, kerugian_properti_juta
               FROM jam_kerja_bulanan WHERE pabrik_id = :pb AND periode = :awal',
            [':pb' => $pabrikId, ':awal' => $periode]
        );

        $adaCatatan = (int) Db::nilai(
            'SELECT count(*) FROM insiden
              WHERE pabrik_id = :pb AND dihapus_pada IS NULL AND tanggal BETWEEN :awal AND :akhir', $par
        ) > 0 || (int) Db::nilai(
            'SELECT count(*) FROM bahaya
              WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                AND dibuat_pada::date BETWEEN :awal AND :akhir', $par
        ) > 0;

        if (!$adaCatatan) {
            $rekap = Db::baris(
                'SELECT insiden, trc, lti, hari_hilang, bahaya
                   FROM rekap_awal_bulanan WHERE pabrik_id = :pb AND periode = :awal',
                [':pb' => $pabrikId, ':awal' => $periode]
            );
            if ($rekap !== null) {
                return [
                    'periode' => $periode, 'sumber' => 'rekap_awal',
                    'insiden' => (int) $rekap['insiden'], 'trc' => (int) $rekap['trc'],
                    'lti' => (int) $rekap['lti'], 'hari_hilang' => (int) $rekap['hari_hilang'],
                    'bahaya' => (int) $rekap['bahaya'],
                    'jam_kerja' => $jam === null ? 0 : (int) $jam['jam_kerja'],
                    'pekerja' => $jam === null ? 0 : (int) $jam['pekerja'],
                    'kerugian' => $jam === null ? 0.0 : (float) $jam['kerugian_properti_juta'],
                ];
            }
        }

        $i = Db::baris(
            "SELECT count(*) AS insiden,
                    count(*) FILTER (WHERE jenis IN ('Incident','Accident')) AS trc,
                    count(*) FILTER (WHERE hari_kerja_hilang > 0) AS lti,
                    coalesce(sum(hari_kerja_hilang), 0) AS hari_hilang
               FROM insiden
              WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                AND tanggal BETWEEN :awal AND :akhir", $par
        );
        $bahaya = (int) Db::nilai(
            'SELECT count(*) FROM bahaya
              WHERE pabrik_id = :pb AND dihapus_pada IS NULL
                AND dibuat_pada::date BETWEEN :awal AND :akhir', $par
        );

        return [
            'periode' => $periode, 'sumber' => 'rekaman',
            'insiden' => (int) $i['insiden'], 'trc' => (int) $i['trc'], 'lti' => (int) $i['lti'],
            'hari_hilang' => (int) $i['hari_hilang'], 'bahaya' => $bahaya,
            'jam_kerja' => $jam === null ? 0 : (int) $jam['jam_kerja'],
            'pekerja' => $jam === null ? 0 : (int) $jam['pekerja'],
            'kerugian' => $jam === null ? 0.0 : (float) $jam['kerugian_properti_juta'],
        ];
    }

    /**
     * TRIR dan LTIFR. Dikembalikan null, bukan nol, bila jam kerjanya belum
     * dicatat: nol berarti "tidak ada kejadian", dan itu kebohongan yang
     * menyenangkan.
     */
    public static function trir(int $trc, int $jamKerja): ?float
    {
        return $jamKerja > 0 ? round($trc * 200000 / $jamKerja, 2) : null;
    }

    public static function ltifr(int $lti, int $jamKerja): ?float
    {
        return $jamKerja > 0 ? round($lti * 1000000 / $jamKerja, 2) : null;
    }

    public static function ltisr(int $hariHilang, int $jamKerja): ?float
    {
        return $jamKerja > 0 ? round($hariHilang * 1000000 / $jamKerja, 1) : null;
    }

    /** @return array<string,array<string,mixed>> */
    public static function target(): array
    {
        $out = [];
        foreach (Db::semua('SELECT * FROM target_kpi ORDER BY jenis, urutan') as $t) {
            $out[$t['kode']] = $t;
        }
        return $out;
    }

    /**
     * Membungkus satu angka beserta pembandingnya (AB-19) dan rumusnya
     * (AB-27).
     *
     * @return array<string,mixed>
     */
    public static function angka(array $target, float|int|null $nilai, float|int|null $sebelum,
                                 string $bandingkanDengan, ?string $catatan = null,
                                 bool $setara = true): array
    {
        $arah = 'flat';
        if ($nilai !== null && $sebelum !== null && (float) $nilai !== (float) $sebelum) {
            $naik = (float) $nilai > (float) $sebelum;
            $arah = ($naik === ($target['arah'] === 'naik_baik')) ? 'good' : 'bad';
        }
        return [
            'kode' => $target['kode'], 'nama' => $target['nama'], 'satuan' => $target['satuan'],
            'nilai' => $nilai, 'sebelum' => $sebelum,
            'selisih' => $nilai === null || $sebelum === null
                ? null : round((float) $nilai - (float) $sebelum, 2),
            'bandingkan_dengan' => $bandingkanDengan,
            // Selisih antara angka yang dihitung sistem dan angka rekap
            // sebelum sistem berjalan bukan perbandingan yang setara. Ia tetap
            // ditampilkan — menyembunyikannya membuat grafik berlubang — tetapi
            // ditandai, supaya tidak dibaca sebagai tren yang sebanding.
            'banding_setara' => $setara,
            'arah' => $setara ? $arah : 'flat',
            'target' => $target['target'] === null ? null : (float) $target['target'],
            'target_arah' => $target['arah'] === 'turun_baik' ? '≤' : '≥',
            'rumus' => $target['rumus'],
            'catatan' => $catatan,
        ];
    }
}
