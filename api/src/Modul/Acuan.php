<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Jawab, Permintaan, Sesi};

/**
 * Seluruh data acuan dalam satu panggilan.
 *
 * Aplikasi lapangan memakainya untuk mengisi simpanan luringnya sekaligus,
 * bukan lewat belasan permintaan — di lapangan, jendela sinyal sering hanya
 * beberapa detik.
 */
final class Acuan
{
    public static function tampil(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);

        $pabrik = $u['peran_kode'] === 'admin'
            ? Db::semua('SELECT id, kode, nama, jumlah_pekerja FROM pabrik WHERE aktif ORDER BY urutan, nama')
            : Db::semua('SELECT id, kode, nama, jumlah_pekerja FROM pabrik WHERE aktif AND id = :p',
                [':p' => $u['pabrik_id']]);

        $idPabrik = array_column($pabrik, 'id');
        $tanda = implode(',', array_map(fn($i) => ':p' . $i, array_keys($idPabrik)));
        $par = [];
        foreach ($idPabrik as $i => $v) $par[':p' . $i] = $v;

        Jawab::kirim([
            'pabrik' => $pabrik,
            'area'   => $idPabrik === [] ? [] : Db::semua(
                "SELECT id, pabrik_id, nama FROM area WHERE aktif AND pabrik_id IN ($tanda) ORDER BY urutan, nama", $par),
            'jenis_apd'          => Db::semua('SELECT id, nama, wajib_di FROM jenis_apd ORDER BY urutan, nama'),
            'kategori_bahaya'    => Db::semua('SELECT kode, nama FROM kategori_bahaya ORDER BY urutan'),
            'kategori_observasi' => Db::semua('SELECT kode, nama FROM kategori_observasi ORDER BY urutan'),
            'jenis_izin'         => Db::semua('SELECT kode, nama, prasyarat FROM jenis_izin ORDER BY urutan'),
        ]);
    }
}
