<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 01 · Incident & Nearmiss. */
final class Insiden
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'incident', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'i');

        $baris = Db::semua(
            "SELECT i.id, i.nomor, i.jenis, i.keparahan, i.tanggal, i.waktu, i.ringkas, i.status,
                    i.hari_kerja_hilang, a.nama AS area,
                    CASE WHEN i.anonim THEN NULL ELSE pl.nama END AS pelapor,
                    (SELECT count(*) FROM capa c
                      WHERE c.sumber_jenis = 'Insiden' AND c.sumber_id = i.id
                        AND c.status <> 'Selesai' AND c.dihapus_pada IS NULL) AS capa_terbuka
               FROM insiden i
               JOIN area a ON a.id = i.area_id
          LEFT JOIN pengguna pl ON pl.id = i.pelapor_id
              WHERE i.dihapus_pada IS NULL AND $saring
              ORDER BY i.tanggal DESC, i.waktu DESC", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $areaId    = $p->wajibTeks('area_id');
        $jenis     = $p->wajibPilihan('jenis', ['Nearmiss', 'Incident', 'Accident']);
        $keparahan = $p->wajibPilihan('keparahan', ['Ringan', 'Sedang', 'Serius']);
        $ringkas   = $p->wajibTeks('ringkas');

        $area = Db::baris('SELECT id, pabrik_id FROM area WHERE id = :i AND aktif', [':i' => $areaId]);
        if ($area === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => 'area_id']);
        Wewenang::wajibCakupan($u, $area['pabrik_id']);

        $hasil = Db::transaksi(function () use ($p, $u, $area, $jenis, $keparahan, $ringkas) {
            $nomor = Nomor::berikut('insiden');
            $id = (string) Db::nilai(
                'INSERT INTO insiden (nomor, nomor_asal, pabrik_id, area_id, jenis, keparahan, tanggal, waktu,
                                      pelapor_id, ringkas, kronologi, dampak, cedera, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :na, :pb, :a, :j, :k, :tg, :w, :pl, :r, :kr, :d, :c, :o, :o) RETURNING id',
                [':n' => $nomor, ':na' => $p->isi('nomor_asal'), ':pb' => $area['pabrik_id'], ':a' => $area['id'],
                 ':j' => $jenis, ':k' => $keparahan,
                 ':tg' => (string) $p->isi('tanggal', date('Y-m-d')), ':w' => $p->isi('waktu'),
                 ':pl' => $u['id'], ':r' => $ringkas,
                 ':kr' => $p->isi('kronologi'), ':d' => $p->isi('dampak'), ':c' => $p->isi('cedera'),
                 ':o' => $u['id']]
            );
            Jejak::catat('insiden', $id, 'buat', null,
                ['nomor' => $nomor, 'jenis' => $jenis, 'keparahan' => $keparahan], $u['id']);

            // AB-02 · kejadian berkeparahan Serius memberi tahu seketika,
            // tanpa menunggu verifikasi.
            $penerima = $keparahan === 'Serius'
                ? Aturan::penerimaKejadianSerius($area['pabrik_id'])
                : [];

            return ['id' => $id, 'nomor' => $nomor, 'pemberitahuan_ke' => $penerima];
        });

        Jawab::kirim($hasil, 201);
    }

    /** AB-03 · Kejadian ditutup setelah seluruh CAPA turunannya selesai. */
    public static function tutup(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'incident', 'verifikasi');

        $i = Db::baris('SELECT id, nomor, pabrik_id, status FROM insiden WHERE id = :i AND dihapus_pada IS NULL',
            [':i' => $par['id']]);
        if ($i === null) throw Galat::takAda('Kejadian tidak ditemukan.');
        Wewenang::wajibCakupan($u, $i['pabrik_id']);

        Aturan::insidenBolehDitutup($i['id']);

        Db::transaksi(function () use ($i, $u) {
            Db::jalankan(
                "UPDATE insiden SET status = 'Selesai', diverifikasi_oleh = :u, diverifikasi_pada = now(),
                        diubah_oleh = :u, diubah_pada = now() WHERE id = :i",
                [':u' => $u['id'], ':i' => $i['id']]
            );
            Jejak::catat('insiden', $i['id'], 'tutup', ['status' => $i['status']], ['status' => 'Selesai'], $u['id']);
        });

        Jawab::kirim(['id' => $i['id'], 'nomor' => $i['nomor'], 'status' => 'Selesai']);
    }
}
