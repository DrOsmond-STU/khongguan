<?php
declare(strict_types=1);

namespace KG;

/**
 * Pembangkitan dan pengiriman pemberitahuan.
 *
 * AB-30 · hanya tiga sebab yang boleh menimbulkan pemberitahuan: lewat
 * tenggat, menunggu keputusan penerimanya, dan melewati ambang. Perubahan
 * status biasa tidak pernah dikirim. Sistem K3 yang memberi tahu setiap
 * perubahan akan diabaikan seluruhnya dalam dua minggu, termasuk yang penting.
 *
 * AB-31 · menandai terbaca tidak menghentikan apa pun. Pemberitahuan lewat
 * tenggat dikirim ulang setiap hari sampai ditutup di modulnya. Yang menutup
 * adalah penyelesaian catatannya, bukan pembacaan pesannya.
 *
 * AB-02 · kejadian berkeparahan Serius memberi tahu seketika, bukan menunggu
 * jadwal. Itu dipanggil dari modul Insiden, bukan dari sini.
 */
final class Pemberitahuan
{
    /**
     * Menyusun seluruh pemberitahuan yang seharusnya ada hari ini.
     *
     * Idempoten dalam satu hari: baris yang sudah ada untuk rujukan dan sebab
     * yang sama tidak digandakan. Dijalankan dua kali karena cron tumpang
     * tindih adalah keadaan biasa, bukan kekecualian.
     *
     * @return array{dibuat:int, ditutup:int}
     */
    public static function susun(): array
    {
        $dibuat = 0;

        // ── Lewat tenggat ────────────────────────────────────────────────
        foreach (Db::semua(
            "SELECT c.id, c.pabrik_id, c.nomor, c.judul, c.tenggat, c.pj_id,
                    (current_date - c.tenggat) AS telat, pj.nama AS pj
               FROM capa c JOIN pengguna pj ON pj.id = c.pj_id
              WHERE c.dihapus_pada IS NULL AND c.status <> 'Selesai' AND c.tenggat < current_date"
        ) as $c) {
            $dibuat += self::pastikan($c['pabrik_id'], 'critical', 'CAPA', 'LEWAT TEMPO',
                "{$c['nomor']} terlambat {$c['telat']} hari",
                "{$c['judul']}. Tenggat " . self::tanggal($c['tenggat'])
                    . ", penanggung jawab {$c['pj']}.",
                'lewat_tenggat', 'capa', 'capa', $c['id'], $c['pj_id']);
        }

        foreach (Db::semua(
            "SELECT t.id, a.pabrik_id, t.nomor, t.kategori, t.isi, t.tenggat, t.pj_id,
                    (current_date - t.tenggat) AS telat
               FROM temuan_audit t JOIN audit a ON a.id = t.audit_id
              WHERE a.dihapus_pada IS NULL AND t.status <> 'Selesai'
                AND t.tenggat IS NOT NULL AND t.tenggat < current_date
                AND t.kategori IN ('Major','Minor')"
        ) as $t) {
            $dibuat += self::pastikan($t['pabrik_id'],
                $t['kategori'] === 'Major' ? 'critical' : 'high', 'Audit',
                'TEMUAN ' . strtoupper($t['kategori']),
                "{$t['nomor']} lewat tenggat {$t['telat']} hari",
                mb_substr((string) $t['isi'], 0, 200), 'lewat_tenggat', 'audit',
                'temuan_audit', $t['id'], $t['pj_id']);
        }

        foreach (Db::semua(
            "SELECT id, pabrik_id, kode, judul, berlaku, (berlaku - current_date) AS sisa
               FROM dokumen_eksternal
              WHERE dihapus_pada IS NULL AND berlaku < current_date + 30"
        ) as $d) {
            $sisa = (int) $d['sisa'];
            $dibuat += self::pastikan($d['pabrik_id'], $sisa < 0 ? 'critical' : 'high',
                'Dokumen Eksternal', $sisa < 0 ? 'KEDALUWARSA' : 'SEGERA BERAKHIR',
                $sisa < 0
                    ? "{$d['judul']} sudah kedaluwarsa " . abs($sisa) . ' hari'
                    : "{$d['judul']} berakhir {$sisa} hari lagi",
                "Berlaku sampai " . self::tanggal($d['berlaku']) . " ({$d['kode']}).",
                $sisa < 0 ? 'lewat_tenggat' : 'melewati_ambang',
                'docext', 'dokumen_eksternal', $d['id'], null);
        }

        // ── Menunggu keputusan penerimanya ───────────────────────────────
        foreach (Db::semua(
            "SELECT id, pabrik_id, nomor, judul, status,
                    round(extract(epoch FROM now() - dibuat_pada) / 3600) AS jam
               FROM izin
              WHERE dihapus_pada IS NULL AND status IN ('Menunggu Supervisor','Menunggu QHSE')
                AND dibuat_pada < now() - interval '12 hours'"
        ) as $z) {
            $dibuat += self::pastikan($z['pabrik_id'], 'high', 'Work Permit', 'TERTAHAN',
                "{$z['nomor']} tertahan {$z['jam']} jam di {$z['status']}",
                (string) $z['judul'], 'menunggu_keputusan', 'permit', 'izin', $z['id'], null);
        }

        // ── Melewati ambang ──────────────────────────────────────────────
        foreach (Db::semua(
            "SELECT pl.pabrik_id, pl.judul, p.nama, p.nilai, p.satuan, p.ambang, pl.id
               FROM parameter_lingkungan p
               JOIN pemantauan_lingkungan pl ON pl.id = p.pemantauan_id
              WHERE NOT p.memenuhi"
        ) as $g) {
            $dibuat += self::pastikan($g['pabrik_id'], 'high', 'Environment', 'BAKU MUTU',
                "{$g['nama']} melewati baku mutu",
                "Terukur {$g['nilai']} {$g['satuan']} terhadap ambang {$g['ambang']} ({$g['judul']}).",
                'melewati_ambang', 'environment', 'pemantauan_lingkungan', $g['id'], null);
        }

        foreach (Db::semua(
            "SELECT up.pabrik_id, up.id, up.kode, up.nama, c.nomor
               FROM unit_periksa up
          LEFT JOIN checklist c ON c.id = up.dikunci_oleh_checklist
              WHERE up.status = 'Terkunci'"
        ) as $ut) {
            $dibuat += self::pastikan($ut['pabrik_id'], 'critical', 'Safety Checklist', 'TERKUNCI',
                "{$ut['nama']} dikeluarkan dari operasi",
                "Satu butir checklist dijawab Tidak Sesuai"
                    . ($ut['nomor'] ? " pada {$ut['nomor']}" : '')
                    . ". Unit tidak boleh dioperasikan sampai temuannya ditutup.",
                'melewati_ambang', 'checklist', 'unit_periksa', $ut['id'], null);
        }

        // AB-31 · yang induknya sudah selesai ditutup di sini, bukan saat
        // dibaca. Pembacaan tidak pernah menutup apa pun.
        $ditutup = self::tutupYangSelesai();

        return ['dibuat' => $dibuat, 'ditutup' => $ditutup];
    }

    /**
     * Membuat pemberitahuan bila belum ada yang terbuka untuk rujukan dan
     * sebab yang sama.
     */
    private static function pastikan(string $pabrikId, string $jenis, string $modul, string $label,
                                     string $judul, string $isi, string $sebab, string $aksi,
                                     string $tabel, string $rujukanId, ?string $penerimaId): int
    {
        $ada = Db::nilai(
            'SELECT id FROM notifikasi
              WHERE rujukan_tabel = :t AND rujukan_id = :r AND sebab = :s AND selesai_pada IS NULL',
            [':t' => $tabel, ':r' => $rujukanId, ':s' => $sebab]
        );
        if ($ada !== null) {
            // Judul diperbarui: "terlambat 11 hari" harus ikut bertambah, dan
            // pemberitahuan yang angkanya membeku berhenti dipercaya.
            Db::jalankan('UPDATE notifikasi SET judul = :j, isi = :i WHERE id = :x',
                [':j' => $judul, ':i' => $isi, ':x' => $ada]);
            return 0;
        }

        Db::jalankan(
            'INSERT INTO notifikasi (pabrik_id, penerima_id, jenis, modul, label, judul, isi,
                                     sebab, aksi, rujukan_tabel, rujukan_id)
             VALUES (:pb, :pe, :j, :m, :l, :ju, :i, :s, :a, :t, :r)',
            [':pb' => $pabrikId, ':pe' => $penerimaId, ':j' => $jenis, ':m' => $modul,
             ':l' => $label, ':ju' => $judul, ':i' => $isi, ':s' => $sebab, ':a' => $aksi,
             ':t' => $tabel, ':r' => $rujukanId]
        );
        return 1;
    }

    /** Menutup pemberitahuan yang catatan induknya sudah selesai. */
    private static function tutupYangSelesai(): int
    {
        $n = 0;
        $n += Db::jalankan(
            "UPDATE notifikasi n SET selesai_pada = now()
              WHERE n.selesai_pada IS NULL AND n.rujukan_tabel = 'capa'
                AND EXISTS (SELECT 1 FROM capa c WHERE c.id = n.rujukan_id
                             AND (c.status = 'Selesai' OR c.dihapus_pada IS NOT NULL))");
        $n += Db::jalankan(
            "UPDATE notifikasi n SET selesai_pada = now()
              WHERE n.selesai_pada IS NULL AND n.rujukan_tabel = 'temuan_audit'
                AND EXISTS (SELECT 1 FROM temuan_audit t WHERE t.id = n.rujukan_id
                             AND t.status = 'Selesai')");
        $n += Db::jalankan(
            "UPDATE notifikasi n SET selesai_pada = now()
              WHERE n.selesai_pada IS NULL AND n.rujukan_tabel = 'izin'
                AND EXISTS (SELECT 1 FROM izin z WHERE z.id = n.rujukan_id
                             AND z.status NOT IN ('Menunggu Supervisor','Menunggu QHSE'))");
        $n += Db::jalankan(
            "UPDATE notifikasi n SET selesai_pada = now()
              WHERE n.selesai_pada IS NULL AND n.rujukan_tabel = 'unit_periksa'
                AND EXISTS (SELECT 1 FROM unit_periksa u WHERE u.id = n.rujukan_id
                             AND u.status = 'Layak')");
        return $n;
    }

    /**
     * AB-02 · kejadian berkeparahan Serius memberi tahu seketika.
     *
     * @param array<string,mixed> $insiden
     */
    public static function kejadianSerius(array $insiden): void
    {
        if (($insiden['keparahan'] ?? '') !== 'Serius') return;
        foreach (Aturan::penerimaKejadianSerius((string) $insiden['pabrik_id']) as $penerima) {
            self::pastikan((string) $insiden['pabrik_id'], 'critical', 'Insiden', 'KEJADIAN SERIUS',
                "{$insiden['nomor']} berkeparahan Serius dilaporkan",
                (string) ($insiden['ringkas'] ?? ''), 'menunggu_keputusan', 'incident',
                'insiden', (string) $insiden['id'], (string) $penerima['id']);
        }
    }

    /* ── Pengiriman ─────────────────────────────────────────────────── */

    /**
     * Mengirim pemberitahuan yang belum pernah terkirim, dan mengirim ulang
     * yang lewat tenggat sekali sehari (AB-31).
     *
     * @return array{terkirim:int, gagal:int}
     */
    public static function kirim(): array
    {
        $saluran = DaftarSaluran::aktif();
        // Tanpa saluran aktif tidak ada yang ditandai terkirim. Menandainya
        // berarti pemberitahuan hari ini tidak akan pernah dikirim setelah
        // SMTP dipasang besok — hilang tanpa jejak, dan tepat pada baris yang
        // gunanya memberi tahu.
        if ($saluran === []) return ['terkirim' => 0, 'gagal' => 0];

        $terkirim = 0;
        $gagal = 0;

        $antre = Db::semua(
            "SELECT n.id, n.jenis, n.modul, n.label, n.judul, n.isi, n.aksi, n.sebab,
                    n.penerima_id, n.pabrik_id
               FROM notifikasi n
              WHERE n.selesai_pada IS NULL
                AND (n.dikirim_pada IS NULL
                     OR (n.sebab = 'lewat_tenggat' AND n.dikirim_pada < current_date))
              ORDER BY n.jenis, n.dibuat_pada"
        );

        foreach ($antre as $n) {
            $penerima = self::penerima($n);
            if ($penerima === []) {
                Db::jalankan('UPDATE notifikasi SET dikirim_pada = now() WHERE id = :i', [':i' => $n['id']]);
                continue;
            }
            $ok = true;
            foreach ($saluran as $s) {
                if (!$s->kirim($penerima, $n)) $ok = false;
            }
            Db::jalankan('UPDATE notifikasi SET dikirim_pada = now() WHERE id = :i', [':i' => $n['id']]);
            $ok ? $terkirim++ : $gagal++;
        }

        return ['terkirim' => $terkirim, 'gagal' => $gagal];
    }

    /**
     * Siapa yang menerima. Penerima yang disebut pada barisnya diutamakan;
     * bila kosong, seluruh pemegang peran yang modulnya terbuka di pabrik itu.
     *
     * @param array<string,mixed> $n
     * @return array<int,array<string,mixed>>
     */
    private static function penerima(array $n): array
    {
        if ($n['penerima_id'] !== null) {
            return Db::semua(
                "SELECT id, nama, email FROM pengguna WHERE id = :i AND status = 'Aktif'",
                [':i' => $n['penerima_id']]);
        }
        return Db::semua(
            "SELECT DISTINCT p.id, p.nama, p.email
               FROM pengguna p
               JOIN peran_modul pm ON pm.peran_kode = p.peran_kode
              WHERE p.status = 'Aktif' AND p.pabrik_id = :pb AND pm.modul = :m
                AND pm.wewenang IN ('verifikasi','kelola')",
            [':pb' => $n['pabrik_id'], ':m' => $n['aksi']]);
    }

    private static function tanggal(?string $iso): string
    {
        static $bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        if ($iso === null) return '—';
        $t = strtotime($iso);
        return date('d', $t) . ' ' . $bulan[(int) date('n', $t) - 1] . ' ' . date('Y', $t);
    }
}
