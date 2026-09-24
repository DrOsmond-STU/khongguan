<?php
declare(strict_types=1);

namespace KG;

/**
 * Pembangkit nomor tampil.
 *
 * Nomor dibangkitkan peladen, tidak pernah oleh klien. UPDATE .. RETURNING
 * mengunci baris pencacah sampai transaksi selesai, sehingga dua permintaan
 * bersamaan tidak pernah mendapat nomor yang sama.
 */
final class Nomor
{
    /** Awalan per entitas; lihat docs/05-model-data.md. */
    private const AWALAN = [
        'insiden'       => ['INC', true,  4],
        'bahaya'        => ['HZ',  true,  4],
        'inspeksi'      => ['INS', true,  4],
        'checklist'     => ['CHK', true,  4],
        'izin'          => ['WP',  true,  4],
        'jsa'           => ['JSA', true,  3],
        'hiradc'        => ['HRD', false, 3],
        'risiko'        => ['RSK', false, 3],
        'capa'          => ['CAPA', true, 4],
        'audit'         => ['AUD', true,  3],
        // Purwarupa memakai awalan AF untuk temuan audit, dan nomor itu
        // dirujuk CAPA sebagai sumbernya. Awalan yang berbeda memutus
        // rujukan yang sudah dipakai.
        'temuan_audit'  => ['AF',  true,  3],
        'induksi'       => ['IND', true,  4],
        'regulasi'      => ['REG', false, 3],
        'observasi_apd' => ['APD', true,  4],
        'observasi'     => ['OBS', true,  4],
        'pelatihan'     => ['TRN', true,  3],
        'kegiatan'      => ['ACT', true,  3],
    ];

    public static function berikut(string $entitas): string
    {
        if (!isset(self::AWALAN[$entitas])) {
            throw new \InvalidArgumentException("Entitas tanpa awalan nomor: $entitas");
        }
        [$awalan, $pakaiTahun, $lebar] = self::AWALAN[$entitas];
        $tahun = $pakaiTahun ? (int) date('Y') : 0;

        Db::jalankan(
            'INSERT INTO pencacah_nomor (awalan, tahun, nilai) VALUES (:a, :t, 0)
             ON CONFLICT (awalan, tahun) DO NOTHING',
            [':a' => $awalan, ':t' => $tahun]
        );
        $nilai = (int) Db::nilai(
            'UPDATE pencacah_nomor SET nilai = nilai + 1
              WHERE awalan = :a AND tahun = :t RETURNING nilai',
            [':a' => $awalan, ':t' => $tahun]
        );

        $urut = str_pad((string) $nilai, $lebar, '0', STR_PAD_LEFT);
        return $pakaiTahun ? "$awalan-$tahun-$urut" : "$awalan-$urut";
    }

    /** Awalan sementara untuk kiriman lapangan yang belum diverifikasi (AB-05). */
    public static function lapangan(string $jenis): string
    {
        $peta = ['bahaya' => 'HZ-L', 'insiden' => 'INC-L', 'observasi' => 'OBS-L',
                 'apd' => 'APD-L', 'izin' => 'WP-L'];
        if (!isset($peta[$jenis])) {
            throw new \InvalidArgumentException("Jenis kiriman lapangan tidak dikenal: $jenis");
        }
        $awalan = $peta[$jenis];
        Db::jalankan(
            'INSERT INTO pencacah_nomor (awalan, tahun, nilai) VALUES (:a, 0, 0)
             ON CONFLICT (awalan, tahun) DO NOTHING', [':a' => $awalan]
        );
        $nilai = (int) Db::nilai(
            'UPDATE pencacah_nomor SET nilai = nilai + 1 WHERE awalan = :a AND tahun = 0 RETURNING nilai',
            [':a' => $awalan]
        );
        return $awalan . '-' . str_pad((string) $nilai, 4, '0', STR_PAD_LEFT);
    }
}
