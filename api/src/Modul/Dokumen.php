<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Permintaan, Sesi, Wewenang};

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
            $kode = $p->wajibTeks('kode');
            $id = (string) Db::nilai(
                'INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi,
                                               terbit, tinjau, pemilik, status, dibuat_oleh, diubah_oleh)
                 VALUES (:k, :pb, :lv, :j, :jd, :rv, :tb, :tj, :pm, :st, :o, :o) RETURNING id',
                [':k' => $kode, ':pb' => $pabrik, ':lv' => (int) $p->isi('level', 3),
                 ':j' => (string) $p->isi('jenis', 'Prosedur'), ':jd' => $p->wajibTeks('judul'),
                 ':rv' => (int) $p->isi('revisi', 0),
                 ':tb' => (string) $p->isi('terbit', date('Y-m-d')), ':tj' => $tinjau,
                 ':pm' => (string) $p->isi('pemilik', $u['nama']), ':st' => $status, ':o' => $u['id']]
            );
            Jejak::catat('dokumen_internal', $id, 'buat', null, ['kode' => $kode], $u['id']);
            return ['id' => $id, 'kode' => $kode];
        });

        Jawab::kirim($hasil, 201);
    }
}
