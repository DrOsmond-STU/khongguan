<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 19 · SHE Activity.
 *
 * AB-25 · KPI Jam Pelatihan K3 dihitung dari peserta × durasi pada modul ini,
 * tidak pernah diisi manual di modul KPI. Angka yang dapat diketik langsung
 * pada laporan KPI adalah angka yang tidak dapat dibuktikan saat audit.
 */
final class Kegiatan
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'activity', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'k');

        $baris = Db::semua(
            "SELECT k.nomor, k.jenis, k.judul, k.tanggal, k.peserta, k.durasi_jam, k.foto,
                    coalesce(a.nama, k.lokasi) AS lokasi
               FROM kegiatan k
          LEFT JOIN area a ON a.id = k.area_id
              WHERE k.dihapus_pada IS NULL AND $saring
              ORDER BY k.tanggal DESC, k.nomor DESC", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /** Jam pelatihan menurut AB-25 — dihitung, bukan disimpan. */
    public static function jamPelatihan(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'kpi', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'k');

        $par[':dari']   = (string) ($p->kueri['dari']   ?? date('Y-01-01'));
        $par[':sampai'] = (string) ($p->kueri['sampai'] ?? date('Y-m-d'));

        $r = Db::baris(
            "SELECT coalesce(sum(k.peserta * k.durasi_jam), 0) AS jam,
                    count(*) AS kegiatan,
                    coalesce(sum(k.peserta), 0) AS peserta
               FROM kegiatan k
              WHERE k.dihapus_pada IS NULL AND $saring
                AND k.tanggal BETWEEN :dari AND :sampai", $par
        );
        Jawab::kirim([
            'dari' => $par[':dari'], 'sampai' => $par[':sampai'],
            'jam_pelatihan' => (float) $r['jam'],
            'kegiatan' => (int) $r['kegiatan'], 'peserta' => (int) $r['peserta'],
            'sumber' => 'kegiatan.peserta × kegiatan.durasi_jam (AB-25)',
        ]);
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'activity', 'isi');

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik) {
            $nomor = Nomor::berikut('kegiatan');
            $id = (string) Db::nilai(
                'INSERT INTO kegiatan (nomor, pabrik_id, jenis, judul, tanggal, area_id, lokasi,
                                       peserta, durasi_jam, foto, dibuat_oleh)
                 VALUES (:n, :pb, :j, :jd, :tg, :a, :lk, :ps, :d, :f, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $pabrik, ':j' => $p->wajibTeks('jenis'),
                 ':jd' => $p->wajibTeks('judul'), ':tg' => (string) $p->isi('tanggal', date('Y-m-d')),
                 ':a' => $p->isi('area_id'), ':lk' => $p->isi('lokasi'),
                 ':ps' => $p->wajibBulat('peserta'), ':d' => $p->isi('durasi_jam', 1),
                 ':f' => $p->isi('foto'), ':o' => $u['id']]
            );
            Jejak::catat('kegiatan', $id, 'buat', null, ['nomor' => $nomor], $u['id']);
            return ['id' => $id, 'nomor' => $nomor];
        });

        Jawab::kirim($hasil, 201);
    }
}
