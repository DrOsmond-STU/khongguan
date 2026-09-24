<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 08 · Induksi K3.
 *
 * Kartu induksi bukan catatan administratif: izin kerja membacanya sebagai
 * gerbang (AB-11). Karena itu masa berlaku dan status dihitung peladen dari
 * jenis peserta dan nilai ujiannya, tidak pernah diisi tangan.
 */
final class Induksi
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'induksi', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'i');

        $baris = Db::semua(
            "SELECT i.id, i.nomor, i.nama, i.jenis, i.asal, i.tanggal, i.pemandu,
                    i.nilai, i.berlaku, i.status,
                    (i.berlaku - current_date) AS sisa
               FROM induksi i
              WHERE i.dihapus_pada IS NULL AND $saring
              ORDER BY i.tanggal DESC, i.nomor DESC", $par
        );

        // AB-21 · yang hampir habis terlihat lebih dulu. Status tersimpan bisa
        // tertinggal karena waktu berjalan sendiri tanpa ada yang menulis apa
        // pun; jadi status dihitung ulang saat dibaca.
        $baris = array_map(static function (array $r): array {
            $r['sisa']   = $r['sisa'] === null ? null : (int) $r['sisa'];
            $r['status'] = $r['status'] === 'Tidak Lulus'
                ? 'Tidak Lulus'
                : Aturan::statusInduksi(
                    $r['nilai'] === null ? null : (int) $r['nilai'], $r['berlaku']);
            return $r;
        }, $baris);

        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'induksi', 'isi');

        $nama    = $p->wajibTeks('nama');
        $jenis   = $p->wajibTeks('jenis');
        $tanggal = (string) $p->isi('tanggal', date('Y-m-d'));
        $nilai   = $p->isi('nilai');
        $nilai   = $nilai === null ? null : (int) $nilai;

        if (!in_array($jenis, ['Pekerja Baru', 'Kontraktor', 'Tamu'], true)) {
            throw Galat::isian('Jenis peserta induksi tidak dikenal.', ['kolom' => 'jenis']);
        }

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        // AB-23 masa berlaku menurut jenis peserta, AB-24 ambang kelulusan.
        // Keduanya dihitung, bukan dikirim klien: kartu yang masa berlakunya
        // dapat diisi tangan bukan gerbang, hanya formulir.
        $ambang  = (int) \KG\Konfigurasi::satu('ambang_lulus_induksi');
        $lulus   = $nilai === null || $nilai >= $ambang;
        $berlaku = $lulus ? Aturan::berlakuInduksi($jenis, $tanggal) : null;
        $status  = Aturan::statusInduksi($nilai, $berlaku);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $nama, $jenis, $tanggal,
                                                $nilai, $berlaku, $status) {
            $nomor = Nomor::berikut('induksi');
            $id = (string) Db::nilai(
                'INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal,
                                      pemandu, nilai, berlaku, status, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :nm, :pg, :j, :as, :tg, :pm, :nl, :bl, :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $pabrik, ':nm' => $nama, ':pg' => $p->isi('pengguna_id'),
                 ':j' => $jenis, ':as' => $p->isi('asal'), ':tg' => $tanggal,
                 ':pm' => (string) $p->isi('pemandu', $u['nama']),
                 ':nl' => $nilai, ':bl' => $berlaku, ':st' => $status, ':o' => $u['id']]
            );
            Jejak::catat('induksi', $id, 'buat', null,
                ['nomor' => $nomor, 'nama' => $nama, 'nilai' => $nilai, 'status' => $status], $u['id']);
            return ['id' => $id, 'nomor' => $nomor, 'berlaku' => $berlaku, 'status' => $status];
        });

        Jawab::kirim($hasil, 201);
    }
}
