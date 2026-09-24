<?php
declare(strict_types=1);

namespace KG;

/**
 * Aturan bisnis yang tidak dapat ditegakkan basis data sendirian.
 *
 * Seluruhnya dikumpulkan di satu berkas, bukan disebar di tiap modul, karena
 * aturan yang tersebar akan diterapkan berbeda-beda oleh orang yang berbeda —
 * dan perbedaan itu baru ketahuan saat auditor menemukannya.
 *
 * Aturan yang SUDAH ditegakkan basis data (lihat migrasi/001_skema.sql) tidak
 * diulang di sini: AB-01 (capa.sumber_id NOT NULL), AB-07 (patuh <= diamati),
 * AB-17 (verifikator <> pj), AB-24 (ambang nilai induksi).
 */
final class Aturan
{
    /** Zona risiko; sama di JSA, HIRADC, dan Manajemen Risiko (AB-14). */
    public static function zona(int $skor): string
    {
        return match (true) {
            $skor >= 15 => 'Ekstrem',
            $skor >= 10 => 'Tinggi',
            $skor >= 5  => 'Sedang',
            default     => 'Rendah',
        };
    }

    /**
     * AB-09 · Izin butuh JSA yang disahkan.
     * AB-10 · Zona Ekstrem menutup penerbitan.
     */
    public static function izinBolehTerbit(string $izinId): void
    {
        $izin = Db::baris('SELECT id, nomor, jsa_id FROM izin WHERE id = :i', [':i' => $izinId]);
        if ($izin === null) throw Galat::takAda('Izin kerja tidak ditemukan.');

        if ($izin['jsa_id'] === null) {
            throw Galat::aturan('AB-09',
                'Izin tidak dapat diterbitkan tanpa JSA yang dilampirkan.',
                ['izin' => $izin['nomor']]);
        }

        $jsa = Db::baris('SELECT nomor, status FROM jsa WHERE id = :i', [':i' => $izin['jsa_id']]);
        if ($jsa === null || $jsa['status'] !== 'Disahkan') {
            throw Galat::aturan('AB-09',
                'Izin tidak dapat diterbitkan: JSA ' . ($jsa['nomor'] ?? '?') . ' berstatus '
                . ($jsa['status'] ?? 'tidak ditemukan') . ', bukan Disahkan.',
                ['izin' => $izin['nomor'], 'jsa' => $jsa['nomor'] ?? null, 'status_jsa' => $jsa['status'] ?? null]);
        }

        // Satu langkah di zona Ekstrem sudah cukup untuk menutup penerbitan.
        // Pesan menyebutkan langkah mana, supaya penyusun JSA tahu apa yang
        // harus diperbaiki, bukan sekadar tahu ditolak.
        $ekstrem = Db::baris(
            'SELECT nomor, kerja, skor_sisa FROM jsa_langkah
              WHERE jsa_id = :j AND skor_sisa >= 15 ORDER BY skor_sisa DESC, nomor LIMIT 1',
            [':j' => $izin['jsa_id']]
        );
        if ($ekstrem !== null) {
            throw Galat::aturan('AB-10',
                'Izin tidak dapat diterbitkan: langkah ' . $ekstrem['nomor'] . ' pada ' . $jsa['nomor']
                . ' berada di zona Ekstrem (skor sisa ' . $ekstrem['skor_sisa'] . ').',
                ['izin' => $izin['nomor'], 'jsa' => $jsa['nomor'],
                 'langkah' => (int) $ekstrem['nomor'], 'skor_sisa' => (int) $ekstrem['skor_sisa']]);
        }
    }

    /** AB-11 · Kartu induksi adalah gerbang. */
    public static function pelaksanaBolehBekerja(?string $penggunaId, string $namaPelaksana): void
    {
        if ($penggunaId === null) return;   // pelaksana luar tanpa akun diperiksa manual

        $kartu = Db::baris(
            'SELECT nomor, status, berlaku FROM induksi
              WHERE pengguna_id = :p AND dihapus_pada IS NULL
              ORDER BY berlaku DESC LIMIT 1',
            [':p' => $penggunaId]
        );

        if ($kartu === null) {
            throw Galat::aturan('AB-11',
                "Izin tidak dapat diterbitkan: $namaPelaksana belum memiliki kartu induksi K3.",
                ['pelaksana' => $namaPelaksana]);
        }
        if ($kartu['status'] === 'Tidak Lulus' || $kartu['status'] === 'Kedaluwarsa') {
            throw Galat::aturan('AB-11',
                "Izin tidak dapat diterbitkan: kartu induksi $namaPelaksana berstatus {$kartu['status']}.",
                ['pelaksana' => $namaPelaksana, 'kartu' => $kartu['nomor'], 'status' => $kartu['status']]);
        }
        if (strtotime((string) $kartu['berlaku']) < strtotime(date('Y-m-d'))) {
            throw Galat::aturan('AB-11',
                "Izin tidak dapat diterbitkan: kartu induksi $namaPelaksana berakhir {$kartu['berlaku']}.",
                ['pelaksana' => $namaPelaksana, 'kartu' => $kartu['nomor'], 'berlaku' => $kartu['berlaku']]);
        }
    }

    /** AB-03 · Kejadian ditutup setelah CAPA-nya selesai. */
    public static function insidenBolehDitutup(string $insidenId): void
    {
        $tertunda = Db::semua(
            "SELECT nomor, status FROM capa
              WHERE sumber_jenis = 'Insiden' AND sumber_id = :i
                AND status <> 'Selesai' AND dihapus_pada IS NULL
              ORDER BY nomor",
            [':i' => $insidenId]
        );
        if ($tertunda !== []) {
            $nomor = array_column($tertunda, 'nomor');
            throw Galat::aturan('AB-03',
                'Kejadian belum dapat ditutup: ' . count($nomor) . ' CAPA belum selesai ('
                . implode(', ', $nomor) . ').',
                ['capa_tertunda' => $nomor]);
        }
    }

    /** AB-18 · Audit ditutup setelah setiap temuan Major/Minor punya CAPA. */
    public static function auditBolehDitutup(string $auditId): void
    {
        $tanpaCapa = Db::semua(
            "SELECT t.nomor FROM temuan_audit t
              WHERE t.audit_id = :a AND t.kategori IN ('Major','Minor')
                AND NOT EXISTS (SELECT 1 FROM capa c
                                 WHERE c.sumber_jenis = 'Audit' AND c.sumber_id = t.id
                                   AND c.dihapus_pada IS NULL)",
            [':a' => $auditId]
        );
        if ($tanpaCapa !== []) {
            $nomor = array_column($tanpaCapa, 'nomor');
            throw Galat::aturan('AB-18',
                'Audit belum dapat ditutup: ' . count($nomor) . ' temuan Major/Minor belum punya CAPA ('
                . implode(', ', $nomor) . ').',
                ['temuan_tanpa_capa' => $nomor]);
        }
    }

    /**
     * AB-15 · Skor sisa HIRADC turun setelah pengendalian terpasang.
     *
     * Menurunkan skor karena pengendalian sudah direncanakan adalah cara
     * paling umum HIRADC kehilangan artinya.
     */
    public static function sisaHiradcBolehTurun(string $hiradcId, int $kemungkinanBaru, int $keparahanBaru): void
    {
        $h = Db::baris(
            'SELECT nomor, status, kemungkinan_sisa, keparahan_sisa, skor_sisa, kendali_tambahan
               FROM hiradc WHERE id = :i', [':i' => $hiradcId]
        );
        if ($h === null) throw Galat::takAda('Baris HIRADC tidak ditemukan.');

        $skorBaru = $kemungkinanBaru * $keparahanBaru;
        if ($skorBaru >= (int) $h['skor_sisa']) return;          // menaikkan atau tetap: selalu boleh

        if ($h['status'] !== 'Selesai') {
            throw Galat::aturan('AB-15',
                'Skor sisa ' . $h['nomor'] . ' belum dapat diturunkan: pengendalian tambahan masih berstatus '
                . $h['status'] . '. Skor sisa hanya boleh turun setelah pengendalian benar-benar terpasang.',
                ['hiradc' => $h['nomor'], 'status' => $h['status'],
                 'skor_sekarang' => (int) $h['skor_sisa'], 'skor_diminta' => $skorBaru]);
        }
    }

    /** AB-22 · Peraturan berstatus Terpenuhi wajib punya bukti. */
    public static function regulasiBolehTerpenuhi(string $status, ?string $bukti): void
    {
        if ($status === 'Terpenuhi' && ($bukti === null || trim($bukti) === '')) {
            throw Galat::aturan('AB-22',
                'Peraturan tidak dapat berstatus Terpenuhi tanpa kolom bukti terisi. '
                . 'Klausul 6.1.3 ISO 45001 meminta bukti penerapan, bukan daftar peraturan.',
                ['status' => $status]);
        }
    }

    /** AB-20 · Dokumen internal berstatus Berlaku wajib punya tanggal tinjau. */
    public static function dokumenBolehBerlaku(string $status, ?string $tinjau): void
    {
        if ($status === 'Berlaku' && ($tinjau === null || trim($tinjau) === '')) {
            throw Galat::aturan('AB-20',
                'Dokumen tidak dapat berstatus Berlaku tanpa tanggal tinjau ulang.',
                ['status' => $status]);
        }
    }

    /**
     * AB-23 · Masa berlaku induksi menurut jenis peserta.
     *
     * Dipanggil hanya untuk peserta yang lulus; yang tidak lulus tidak punya
     * masa berlaku (lihat kolom induksi.berlaku).
     */
    public static function berlakuInduksi(string $jenis, string $tanggal): string
    {
        $bulan = match ($jenis) {
            'Pekerja Baru' => 12,
            'Kontraktor'   => 6,
            'Tamu'         => 3,
            default        => throw Galat::isian("Jenis peserta induksi tidak dikenal: $jenis."),
        };
        return date('Y-m-d', strtotime("$tanggal +$bulan months"));
    }

    /**
     * AB-24 · Nilai di bawah ambang berarti mengulang, bukan diloloskan.
     *
     * $berlaku null hanya sah bagi peserta yang tidak lulus — mereka memang
     * tidak punya kartu.
     */
    public static function statusInduksi(?int $nilai, ?string $berlaku): string
    {
        $ambang = (int) Konfigurasi::satu('ambang_lulus_induksi');
        if ($nilai !== null && $nilai < $ambang) return 'Tidak Lulus';
        if ($berlaku === null) return 'Tidak Lulus';

        $sisa = (int) floor((strtotime($berlaku) - strtotime(date('Y-m-d'))) / 86400);
        return match (true) {
            $sisa < 0   => 'Kedaluwarsa',
            $sisa <= 30 => 'Segera Berakhir',
            default     => 'Berlaku',
        };
    }

    /** AB-16 · Penuaan CAPA dihitung dari tanggal terbit, bukan tenggat. */
    public static function umurCapa(string $terbit): int
    {
        return (int) floor((strtotime(date('Y-m-d')) - strtotime($terbit)) / 86400);
    }

    /**
     * AB-02 · Kejadian berkeparahan Serius memberi tahu seketika.
     *
     * Mengembalikan daftar id penerima. Pengiriman sebenarnya dikerjakan
     * pekerja latar; yang ditegakkan di sini adalah siapa yang wajib tahu.
     *
     * @return array<int,string>
     */
    public static function penerimaKejadianSerius(string $pabrikId): array
    {
        return array_column(Db::semua(
            "SELECT id FROM pengguna
              WHERE pabrik_id = :p AND status = 'Aktif' AND peran_kode IN ('qhse','manajemen')",
            [':p' => $pabrikId]
        ), 'id');
    }
}
