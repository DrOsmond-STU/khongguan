<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 04 · Laporan Bahaya K3L. */
final class Bahaya
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'hazard', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'b');

        $sql = "SELECT b.id, b.nomor, b.nomor_asal, b.kategori, b.isi, b.risiko, b.status,
                       b.anonim, b.dibuat_pada, b.diverifikasi_pada,
                       a.nama AS area, pb.nama AS pabrik,
                       CASE WHEN b.anonim THEN NULL ELSE pl.nama END AS pelapor
                  FROM bahaya b
                  JOIN area a    ON a.id = b.area_id
                  JOIN pabrik pb ON pb.id = b.pabrik_id
             LEFT JOIN pengguna pl ON pl.id = b.pelapor_id
                 WHERE b.dihapus_pada IS NULL AND $saring";

        if (isset($p->kueri['status'])) { $sql .= ' AND b.status = :status'; $par[':status'] = $p->kueri['status']; }

        $total = (int) Db::nilai("SELECT count(*) FROM ($sql) x", $par);
        $sql .= ' ORDER BY b.dibuat_pada DESC LIMIT :batas OFFSET :lewati';
        $par[':batas']  = $p->perHal();
        $par[':lewati'] = ($p->hal() - 1) * $p->perHal();

        Jawab::daftar(Db::semua($sql, $par), $p->hal(), $p->perHal(), $total);
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        // Melapor tidak dibatasi peran: menutup jalur pelaporan berarti
        // bahaya tidak dilaporkan sama sekali (docs/04).
        $areaId  = $p->wajibTeks('area_id');
        $isi     = $p->wajibTeks('isi');
        $anonim  = (bool) $p->isi('anonim', false);

        $area = Db::baris('SELECT id, pabrik_id FROM area WHERE id = :i AND aktif', [':i' => $areaId]);
        if ($area === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => 'area_id']);
        Wewenang::wajibCakupan($u, $area['pabrik_id']);

        $rec = Db::transaksi(function () use ($p, $u, $area, $isi, $anonim) {
            $nomor = Nomor::berikut('bahaya');
            $k = $p->isi('koordinat');
            $id = (string) Db::nilai(
                'INSERT INTO bahaya (nomor, nomor_asal, pabrik_id, area_id, kategori, isi, risiko,
                                     pelapor_id, anonim, koordinat_lat, koordinat_lon, koordinat_akurasi_m,
                                     dibuat_oleh, diubah_oleh)
                 VALUES (:n, :na, :pb, :a, :k, :i, :r, :pl, :an, :lat, :lon, :ak, :o, :o) RETURNING id',
                [
                    ':n' => $nomor, ':na' => $p->isi('nomor_asal'), ':pb' => $area['pabrik_id'], ':a' => $area['id'],
                    ':k' => (string) $p->isi('kategori', 'Unsafe Condition'),
                    ':i' => $isi, ':r' => (string) $p->isi('risiko', 'Sedang'),
                    // AB-04: laporan anonim tidak menyimpan identitas pengirim
                    ':pl' => $anonim ? null : $u['id'], ':an' => $anonim ? 'true' : 'false',
                    ':lat' => is_array($k) ? ($k['lat'] ?? null) : null,
                    ':lon' => is_array($k) ? ($k['lon'] ?? null) : null,
                    ':ak'  => is_array($k) ? ($k['akurasi_m'] ?? null) : null,
                    ':o' => $u['id'],
                ]
            );
            Jejak::catat('bahaya', $id, 'buat', null, ['nomor' => $nomor, 'isi' => $isi], $u['id']);
            return ['id' => $id, 'nomor' => $nomor];
        });

        Jawab::kirim($rec, 201);
    }

    public static function verifikasi(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'hazard', 'verifikasi');

        $b = Db::baris('SELECT id, nomor, pabrik_id, status, diverifikasi_pada FROM bahaya WHERE id = :i AND dihapus_pada IS NULL',
            [':i' => $par['id']]);
        if ($b === null) throw Galat::takAda('Laporan bahaya tidak ditemukan.');
        Wewenang::wajibCakupan($u, $b['pabrik_id']);

        if ($b['diverifikasi_pada'] !== null) {
            throw Galat::aturan('AB-05', 'Laporan ' . $b['nomor'] . ' sudah diverifikasi sebelumnya.',
                ['nomor' => $b['nomor']]);
        }

        Db::transaksi(function () use ($b, $u) {
            Db::jalankan(
                "UPDATE bahaya SET status = 'Diverifikasi', diverifikasi_oleh = :u, diverifikasi_pada = now(),
                        diubah_oleh = :u, diubah_pada = now() WHERE id = :i",
                [':u' => $u['id'], ':i' => $b['id']]
            );
            Jejak::catat('bahaya', $b['id'], 'verifikasi',
                ['status' => $b['status']], ['status' => 'Diverifikasi'], $u['id']);
        });

        Jawab::kirim(['id' => $b['id'], 'nomor' => $b['nomor'], 'status' => 'Diverifikasi']);
    }
}
