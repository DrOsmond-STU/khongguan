<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 11 · Manajemen Risiko. */
final class Risiko
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'risk', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'r');

        $baris = array_map(static function (array $r): array {
            $r['zona']      = Aturan::zona((int) $r['skor_awal']);
            $r['zona_sisa'] = Aturan::zona((int) $r['skor_sisa']);
            return $r;
        }, Db::semua(
            "SELECT r.id, r.nomor, r.proses, r.ancaman, r.penyebab, r.dampak,
                    r.kemungkinan, r.keparahan, r.kemungkinan_sisa, r.keparahan_sisa,
                    r.opsi, r.mitigasi, r.target, r.reviu, r.status, r.skor_awal, r.skor_sisa,
                    pj.nama AS pj
               FROM risiko r
          LEFT JOIN pengguna pj ON pj.id = r.pj_id
              WHERE r.dihapus_pada IS NULL AND $saring
              ORDER BY r.skor_awal DESC, r.nomor", $par
        ));
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'risk', 'isi');

        $km  = $p->wajibBulat('kemungkinan');
        $kp  = $p->wajibBulat('keparahan');
        $kms = (int) $p->isi('kemungkinan_sisa', $km);
        $kps = (int) $p->isi('keparahan_sisa', $kp);
        if ($kms * $kps > $km * $kp) {
            throw Galat::isian(
                'Skor sisa (' . ($kms * $kps) . ') tidak boleh melebihi skor awal (' . ($km * $kp) . ').',
                ['skor_awal' => $km * $kp, 'skor_sisa' => $kms * $kps]);
        }

        $pabrik = (string) $p->isi('pabrik_id', $u['pabrik_id']);
        Wewenang::wajibCakupan($u, $pabrik);

        $hasil = Db::transaksi(function () use ($p, $u, $pabrik, $km, $kp, $kms, $kps) {
            $nomor = Nomor::berikut('risiko');
            $id = (string) Db::nilai(
                'INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak,
                                     kemungkinan, keparahan, kemungkinan_sisa, keparahan_sisa,
                                     opsi, mitigasi, pj_id, target, reviu, status,
                                     dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :pr, :an, :py, :dp, :km, :kp, :kms, :kps, :op, :mt,
                         :pj, :tg, :rv, :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $pabrik,
                 ':pr' => $p->wajibTeks('proses'), ':an' => $p->wajibTeks('ancaman'),
                 ':py' => $p->wajibTeks('penyebab'), ':dp' => $p->wajibTeks('dampak'),
                 ':km' => $km, ':kp' => $kp, ':kms' => $kms, ':kps' => $kps,
                 ':op' => (string) $p->isi('opsi', 'Kurangi'), ':mt' => $p->wajibTeks('mitigasi'),
                 ':pj' => $p->isi('pj_id'), ':tg' => $p->isi('target'), ':rv' => $p->isi('reviu'),
                 ':st' => (string) $p->isi('status', 'Terbuka'), ':o' => $u['id']]
            );
            Jejak::catat('risiko', $id, 'buat', null, ['nomor' => $nomor], $u['id']);
            return ['id' => $id, 'nomor' => $nomor, 'zona' => Aturan::zona($km * $kp)];
        });

        Jawab::kirim($hasil, 201);
    }
}
