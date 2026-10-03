<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 13/14 · Dokumen internal dan eksternal. */
final class Dokumen
{
    public static function internal(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'docint', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'd');

        $baris = Db::semua(
            "SELECT d.kode, d.level, d.jenis, d.judul, d.revisi, d.terbit, d.tinjau,
                    d.pemilik, d.status
               FROM dokumen_internal d
              WHERE d.dihapus_pada IS NULL AND $saring
              ORDER BY d.level, d.kode", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /**
     * AB-21 · diurutkan menurut sisa masa berlaku, bukan abjad. Urutan ini
     * adalah gunanya modul: daftar berabjad menyembunyikan izin yang habis
     * minggu depan di tengah halaman.
     */
    public static function eksternal(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'docext', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'd');

        $baris = Db::semua(
            "SELECT d.kode, d.jenis, d.judul, d.penerbit, d.nomor, d.terbit, d.berlaku,
                    (d.berlaku - current_date) AS sisa
               FROM dokumen_eksternal d
              WHERE d.dihapus_pada IS NULL AND $saring
              ORDER BY d.berlaku", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buatInternal(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'docint', 'isi');

        $status = (string) $p->isi('status', 'Dalam Revisi');
        $tinjau = $p->isi('tinjau');
        // AB-20 · dokumen berstatus Berlaku wajib punya tanggal tinjau;
        // dokumen tanpa tanggal tinjau tidak pernah ditinjau.
        Aturan::dokumenBolehBerlaku($status, $tinjau === null ? null : (string) $tinjau);

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $status, $tinjau) {
            $jenis = (string) $p->isi('jenis', 'Prosedur');
            $kode  = (string) $p->isi('kode', '');
            if ($kode === '') $kode = Nomor::dokumenInternal($jenis);
            $id = (string) Db::nilai(
                'INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi,
                                               terbit, tinjau, pemilik, status, dibuat_oleh, diubah_oleh)
                 VALUES (:k, :pb, :lv, :j, :jd, :rv, :tb, :tj, :pm, :st, :o, :o) RETURNING id',
                [':k' => $kode, ':pb' => $pabrik, ':lv' => (int) $p->isi('level', 3),
                 ':j' => $jenis, ':jd' => $p->wajibTeks('judul'),
                 ':rv' => (int) $p->isi('revisi', 0),
                 ':tb' => (string) $p->isi('terbit', date('Y-m-d')), ':tj' => $tinjau,
                 ':pm' => (string) $p->isi('pemilik', $u['nama']), ':st' => $status, ':o' => $u['id']]
            );
            Jejak::catat('dokumen_internal', $id, 'buat', null, ['kode' => $kode], $u['id']);
            return ['id' => $id, 'kode' => $kode];
        });

        Jawab::kirim($hasil, 201);
    }

    /**
     * POST /dokumen/eksternal — sertifikat, izin, dan pelaporan wajib yang
     * masa berlakunya dipantau (H-60, H-30, H-14, H-7).
     *
     * Masa berlaku wajib diisi dan tidak ditebak: dokumen yang terdaftar
     * tanpa tanggal berakhir tidak pernah memicu peringatan, dan izin yang
     * kedaluwarsa tanpa diketahui adalah temuan audit yang paling mudah.
     */
    public static function buatEksternal(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'docext', 'isi');

        $jenis   = $p->wajibPilihan('jenis', ['Sertifikat Sistem', 'Izin Lingkungan', 'Izin Peralatan', 'Pelaporan Wajib']);
        $judul   = $p->wajibTeks('judul');
        $berlaku = self::tanggal($p->wajibTeks('berlaku'), 'berlaku');
        $terbitT = trim((string) $p->isi('terbit', ''));
        $terbit  = $terbitT === '' ? null : self::tanggal($terbitT, 'terbit');
        if ($terbit !== null && $terbit > $berlaku) {
            throw Galat::isian('Tanggal terbit tidak boleh setelah tanggal berakhir.', ['kolom' => 'terbit']);
        }

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $jenis, $judul, $berlaku, $terbit) {
            // Pencacah CMP disusulkan ke kode tertinggi yang sudah ada, supaya
            // dokumen yang dimuat sebelum pencacah dipakai tidak ditabrak.
            Db::jalankan("INSERT INTO pencacah_nomor (awalan, tahun, nilai) VALUES ('CMP', 0, 0)
                          ON CONFLICT (awalan, tahun) DO NOTHING");
            $nilai = (int) Db::nilai(
                "UPDATE pencacah_nomor SET nilai = GREATEST(nilai,
                        coalesce((SELECT max(substring(kode FROM 5)::int) FROM dokumen_eksternal
                                   WHERE kode ~ '^CMP-[0-9]+$'), 0)) + 1
                  WHERE awalan = 'CMP' AND tahun = 0 RETURNING nilai");
            $kode = 'CMP-' . str_pad((string) $nilai, 3, '0', STR_PAD_LEFT);

            $id = (string) Db::nilai(
                'INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku,
                                                dibuat_oleh, diubah_oleh)
                 VALUES (:k, :pb, :j, :jd, :pn, :n, :tb, :bl, :o, :o) RETURNING id',
                [':k' => $kode, ':pb' => $pabrik, ':j' => $jenis, ':jd' => $judul,
                 ':pn' => $p->wajibTeks('penerbit'), ':n' => trim((string) $p->isi('nomor', '')) ?: '—',
                 ':tb' => $terbit, ':bl' => $berlaku, ':o' => $u['id']]
            );
            Jejak::catat('dokumen_eksternal', $id, 'buat', null, ['kode' => $kode, 'berlaku' => $berlaku], $u['id']);
            return ['id' => $id, 'kode' => $kode, 'berlaku' => $berlaku];
        });

        Jawab::kirim($hasil, 201);
    }

    private static function tanggal(string $s, string $kolom): string
    {
        $d = \DateTimeImmutable::createFromFormat('!Y-m-d', $s);
        if ($d === false || $d->format('Y-m-d') !== $s) {
            throw Galat::isian("Isian '$kolom' harus tanggal YYYY-MM-DD.", ['kolom' => $kolom]);
        }
        return $s;
    }
}
