<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Jawab, Permintaan, Sesi, Wewenang};

/**
 * Modul 12 · Lingkungan.
 *
 * Empat pemantauan — air, udara, limbah, dan limbah B3 — masing-masing
 * dengan parameternya. Lulus atau tidak disimpan per parameter, bukan
 * dihitung: ambangnya berupa kalimat yang bentuknya berbeda-beda
 * ("6,0 – 9,0", "≤ 50", "daur ulang 96%"), dan menebak maksudnya dari teks
 * adalah cara paling rapi untuk salah tanpa ketahuan.
 */
final class Lingkungan
{
    public static function tampil(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'environment', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'pl');

        $pemantauan = Db::semua(
            "SELECT DISTINCT ON (pl.kode) pl.id, pl.kode, pl.judul, pl.sub, pl.acuan, pl.periode
               FROM pemantauan_lingkungan pl
              WHERE $saring
              ORDER BY pl.kode, pl.periode DESC", $par
        );
        if ($pemantauan === []) Jawab::kirim([]);

        $tanda = [];
        $ids   = [];
        foreach ($pemantauan as $i => $m) { $tanda[] = ":p$i"; $ids[":p$i"] = $m['id']; }

        $per = [];
        foreach (Db::semua(
            'SELECT pemantauan_id, nama, nilai, satuan, ambang, memenuhi
               FROM parameter_lingkungan
              WHERE pemantauan_id IN (' . implode(',', $tanda) . ')
              ORDER BY urutan', $ids
        ) as $r) {
            $per[$r['pemantauan_id']][] = [
                'nama' => $r['nama'], 'nilai' => $r['nilai'], 'satuan' => $r['satuan'],
                'ambang' => $r['ambang'], 'memenuhi' => $r['memenuhi'] === true,
            ];
        }

        $out = [];
        foreach ($pemantauan as $m) {
            $m['param'] = $per[$m['id']] ?? [];
            $out[$m['kode']] = $m;
        }
        Jawab::kirim($out);
    }
}
