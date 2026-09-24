<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 16 · Observasi APD.
 *
 * Tidak ada kolom identitas pekerja yang diamati, dan tidak pernah akan ada
 * (AB-06). Ketiadaan itu disengaja: observasi yang menamai orang berubah
 * menjadi penilaian kinerja, dan orang berhenti jujur.
 */
final class ObservasiApd
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'bbs', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'o');

        $baris = Db::semua(
            "SELECT o.id, o.nomor, o.nomor_asal, o.tanggal, o.diamati, o.patuh, o.catatan,
                    a.nama AS area, pg.nama AS pengamat,
                    round(o.patuh::numeric * 100 / o.diamati) AS kepatuhan
               FROM observasi_apd o
               JOIN area a ON a.id = o.area_id
               JOIN pengguna pg ON pg.id = o.pengamat_id
              WHERE o.dihapus_pada IS NULL AND $saring
              ORDER BY o.tanggal DESC", $par
        );

        // Rincian per jenis APD dibawa serta: tanpa itu layar hanya dapat
        // menampilkan kepatuhan keseluruhan, dan "86% patuh" tidak memberi
        // tahu siapa pun APD mana yang tidak dipakai.
        if ($baris !== []) {
            $tanda = [];
            $ids   = [];
            foreach ($baris as $i => $b) { $tanda[] = ":o$i"; $ids[":o$i"] = $b['id']; }
            $per = [];
            foreach (Db::semua(
                'SELECT r.observasi_apd_id, r.diamati, r.patuh, ja.nama
                   FROM observasi_apd_rincian r
                   JOIN jenis_apd ja ON ja.id = r.jenis_apd_id
                  WHERE r.observasi_apd_id IN (' . implode(',', $tanda) . ')
                  ORDER BY ja.urutan', $ids
            ) as $r) {
                $per[$r['observasi_apd_id']][] = [
                    'jenis' => $r['nama'], 'diamati' => (int) $r['diamati'], 'patuh' => (int) $r['patuh'],
                ];
            }
            foreach ($baris as &$b) { $b['rincian'] = $per[$b['id']] ?? []; }
        }

        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $areaId  = $p->wajibTeks('area_id');
        $diamati = $p->wajibBulat('diamati');
        $patuh   = $p->wajibBulat('patuh');
        $catatan = $p->wajibTeks('catatan');

        if ($diamati < 1) {
            throw Galat::isian('Jumlah pekerja yang diamati harus lebih dari nol.', ['kolom' => 'diamati']);
        }
        // AB-07 · kepatuhan di atas 100% merusak rata-rata KPI tanpa ada yang
        // menyadarinya. Diperiksa di sini agar pesannya jelas, dan sekali lagi
        // oleh basis data agar tidak ada jalur yang melewatinya.
        if ($patuh > $diamati) {
            throw Galat::takKonsisten('AB-07',
                "Jumlah patuh ($patuh) tidak boleh melebihi jumlah yang diamati ($diamati).",
                ['diamati' => $diamati, 'patuh' => $patuh]);
        }

        $area = Db::baris('SELECT id, pabrik_id FROM area WHERE id = :i AND aktif', [':i' => $areaId]);
        if ($area === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => 'area_id']);
        Wewenang::wajibCakupan($u, $area['pabrik_id']);

        $rincian = $p->isi('rincian', []);
        if (!is_array($rincian)) $rincian = [];

        $hasil = Db::transaksi(function () use ($p, $u, $area, $diamati, $patuh, $catatan, $rincian) {
            $nomor = Nomor::berikut('observasi_apd');
            $id = (string) Db::nilai(
                'INSERT INTO observasi_apd (nomor, nomor_asal, pabrik_id, area_id, pengamat_id, tanggal,
                                            diamati, patuh, catatan, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :na, :pb, :a, :pg, :tg, :d, :p, :c, :o, :o) RETURNING id',
                [':n' => $nomor, ':na' => $p->isi('nomor_asal'), ':pb' => $area['pabrik_id'], ':a' => $area['id'],
                 ':pg' => $u['id'], ':tg' => (string) $p->isi('tanggal', date('Y-m-d')),
                 ':d' => $diamati, ':p' => $patuh, ':c' => $catatan, ':o' => $u['id']]
            );

            foreach ($rincian as $r) {
                if (!is_array($r) || !isset($r['jenis_apd_id'])) continue;
                $rd = (int) ($r['diamati'] ?? $diamati);
                $rp = (int) ($r['patuh'] ?? 0);
                if ($rp > $rd) {
                    throw Galat::takKonsisten('AB-07',
                        "Rincian APD: jumlah patuh ($rp) melebihi jumlah yang diamati ($rd).",
                        ['jenis_apd_id' => $r['jenis_apd_id'], 'diamati' => $rd, 'patuh' => $rp]);
                }
                Db::jalankan(
                    'INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
                     VALUES (:o, :j, :d, :p)',
                    [':o' => $id, ':j' => $r['jenis_apd_id'], ':d' => $rd, ':p' => $rp]
                );
            }

            Jejak::catat('observasi_apd', $id, 'buat', null,
                ['nomor' => $nomor, 'diamati' => $diamati, 'patuh' => $patuh], $u['id']);
            return ['id' => $id, 'nomor' => $nomor,
                    'kepatuhan' => (int) round($patuh * 100 / $diamati)];
        });

        Jawab::kirim($hasil, 201);
    }
}
