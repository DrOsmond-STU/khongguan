<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 17 · Regulasi K3.
 *
 * AB-22 · baris tanpa bukti tidak dapat berstatus Terpenuhi, apa pun yang
 * diketik pada kolom penerapan. Yang diminta ISO 45001 klausul 6.1.3 bukan
 * daftar peraturan, melainkan bukti bahwa tiap peraturan sudah menjadi
 * sesuatu yang benar-benar dikerjakan.
 */
final class Regulasi
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'regulasi', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'r');

        $baris = Db::semua(
            "SELECT r.kode, r.nomor, r.judul, r.penerbit, r.bidang, r.pasal, r.penerapan,
                    r.bukti, r.evaluasi, r.status, pj.nama AS pj
               FROM regulasi r
          LEFT JOIN pengguna pj ON pj.id = r.pj_id
              WHERE r.dihapus_pada IS NULL AND $saring
              ORDER BY r.kode", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'regulasi', 'isi');

        $status = (string) $p->isi('status', 'Tidak Terpenuhi');
        $bukti  = $p->isi('bukti');
        Aturan::regulasiBolehTerpenuhi($status, $bukti === null ? null : (string) $bukti);

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $status, $bukti) {
            // Kode dibangkitkan peladen bila klien tidak menyebutnya. Kode
            // yang dibuat klien tidak dapat dijamin unik maupun berurutan,
            // dan daftar peraturan dibaca menurut kodenya.
            $kode = (string) $p->isi('kode', '');
            if ($kode === '') $kode = Nomor::berikut('regulasi');
            $id = (string) Db::nilai(
                'INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal,
                                       penerapan, bukti, pj_id, evaluasi, status,
                                       dibuat_oleh, diubah_oleh)
                 VALUES (:k, :pb, :n, :j, :pn, :bd, :ps, :pr, :bk, :pj, :ev, :st, :o, :o) RETURNING id',
                [':k' => $kode, ':pb' => $pabrik, ':n' => $p->wajibTeks('nomor'),
                 ':j' => $p->wajibTeks('judul'), ':pn' => $p->wajibTeks('penerbit'),
                 ':bd' => $p->wajibTeks('bidang'), ':ps' => $p->wajibTeks('pasal'),
                 ':pr' => $p->wajibTeks('penerapan'), ':bk' => $bukti,
                 ':pj' => $p->isi('pj_id'), ':ev' => $p->isi('evaluasi'), ':st' => $status,
                 ':o' => $u['id']]
            );
            Jejak::catat('regulasi', $id, 'buat', null, ['kode' => $kode, 'status' => $status], $u['id']);
            return ['id' => $id, 'kode' => $kode];
        });

        Jawab::kirim($hasil, 201);
    }
}
