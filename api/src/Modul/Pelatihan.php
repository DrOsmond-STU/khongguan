<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 18 · Pelatihan dan sertifikasi. */
final class Pelatihan
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'training', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 't');

        $baris = Db::semua(
            "SELECT t.nomor, t.nama, t.jenis, t.target, t.rencana_tanggal, t.rencana_peserta,
                    t.aktual_tanggal, t.aktual_peserta, t.penyelenggara, t.biaya_juta, t.status
               FROM pelatihan t
              WHERE t.dihapus_pada IS NULL AND $saring
              ORDER BY t.nomor DESC", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /** AB-21 · diurutkan menurut sisa masa berlaku, sama seperti dokumen eksternal. */
    public static function sertifikasi(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'training', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 's');

        Jawab::kirim(Db::semua(
            "SELECT s.nama, s.pemegang, s.nomor, s.berlaku, (s.berlaku - current_date) AS sisa
               FROM sertifikasi s
              WHERE $saring
              ORDER BY s.berlaku", $par
        ));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'training', 'isi');

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik) {
            $nomor = Nomor::berikut('pelatihan');
            $id = (string) Db::nilai(
                'INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal,
                                        rencana_peserta, aktual_tanggal, aktual_peserta,
                                        penyelenggara, biaya_juta, status, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :nm, :j, :tg, :rt, :rp, :at, :ap, :py, :b, :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $pabrik, ':nm' => $p->wajibTeks('nama'),
                 ':j' => (string) $p->isi('jenis', 'Internal'), ':tg' => (int) $p->isi('target', 0),
                 ':rt' => $p->wajibTeks('rencana_tanggal'), ':rp' => (int) $p->isi('rencana_peserta', 0),
                 ':at' => $p->isi('aktual_tanggal'), ':ap' => $p->isi('aktual_peserta'),
                 ':py' => $p->wajibTeks('penyelenggara'), ':b' => $p->isi('biaya_juta'),
                 ':st' => (string) $p->isi('status', 'Terjadwal'), ':o' => $u['id']]
            );
            Jejak::catat('pelatihan', $id, 'buat', null, ['nomor' => $nomor], $u['id']);
            return ['id' => $id, 'nomor' => $nomor];
        });

        Jawab::kirim($hasil, 201);
    }
}
