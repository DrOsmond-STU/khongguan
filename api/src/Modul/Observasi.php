<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 15 · Observasi perilaku (BBS).
 *
 * Sama seperti observasi APD: tidak ada kolom identitas pekerja yang diamati,
 * dan tidak pernah akan ada (AB-06). Observasi yang menamai orang berubah
 * menjadi penilaian kinerja, dan orang berhenti jujur.
 */
final class Observasi
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'bbs', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'o');

        $baris = Db::semua(
            "SELECT o.id, o.nomor, o.nomor_asal, o.tanggal, o.kategori, o.aman, o.berisiko,
                    o.catatan, o.tindakan,
                    a.nama AS area, pg.nama AS pengamat
               FROM observasi o
               JOIN area a ON a.id = o.area_id
               JOIN pengguna pg ON pg.id = o.pengamat_id
              WHERE o.dihapus_pada IS NULL AND $saring
              ORDER BY o.tanggal DESC, o.nomor DESC", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $areaId   = $p->wajibTeks('area_id');
        $catatan  = $p->wajibTeks('catatan');
        $aman     = $p->wajibBulat('aman');
        $berisiko = (int) $p->isi('berisiko', 0);
        $kategori = $p->isi('kategori');
        $kategori = is_string($kategori) && $kategori !== '' ? $kategori : null;

        if ($aman < 0 || $berisiko < 0) {
            throw Galat::isian('Jumlah pengamatan tidak boleh negatif.',
                ['aman' => $aman, 'berisiko' => $berisiko]);
        }
        if ($aman + $berisiko === 0) {
            throw Galat::isian('Observasi tanpa satu pun pengamatan tidak dapat disimpan.',
                ['kolom' => 'aman']);
        }
        // Kategori temuan hanya wajib bila ada yang ditemukan. Observasi yang
        // seluruh perilakunya aman tidak boleh dipaksa mengarang kategori.
        if ($berisiko > 0 && $kategori === null) {
            throw Galat::isian('Observasi dengan perilaku berisiko harus menyebutkan kategorinya.',
                ['kolom' => 'kategori']);
        }

        $area = Db::baris('SELECT id, pabrik_id FROM area WHERE id = :i AND aktif', [':i' => $areaId]);
        if ($area === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => 'area_id']);
        Wewenang::wajibCakupan($u, $area['pabrik_id']);

        $hasil = Db::transaksi(function () use ($p, $u, $area, $kategori, $catatan, $aman, $berisiko) {
            $nomor = Nomor::berikut('observasi');
            $id = (string) Db::nilai(
                'INSERT INTO observasi (nomor, nomor_asal, pabrik_id, area_id, pengamat_id, tanggal,
                                        kategori, aman, berisiko, catatan, tindakan,
                                        dibuat_oleh, diubah_oleh)
                 VALUES (:n, :na, :pb, :a, :pg, :tg, :kt, :am, :br, :c, :td, :o, :o) RETURNING id',
                [':n' => $nomor, ':na' => $p->isi('nomor_asal'), ':pb' => $area['pabrik_id'],
                 ':a' => $area['id'], ':pg' => $u['id'], ':tg' => (string) $p->isi('tanggal', date('Y-m-d')),
                 ':kt' => $kategori, ':am' => $aman, ':br' => $berisiko,
                 ':c' => $catatan, ':td' => $p->isi('tindakan'), ':o' => $u['id']]
            );
            Jejak::catat('observasi', $id, 'buat', null,
                ['nomor' => $nomor, 'aman' => $aman, 'berisiko' => $berisiko], $u['id']);
            return ['id' => $id, 'nomor' => $nomor];
        });

        Jawab::kirim($hasil, 201);
    }
}
