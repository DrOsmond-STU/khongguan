<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Permintaan, Sesi, Wewenang};

/**
 * Modul 25 · Pemberitahuan.
 *
 * AB-30 · hanya tiga sebab yang boleh menimbulkan pemberitahuan: lewat
 * tenggat, menunggu keputusan penerimanya, atau melewati ambang. Perubahan
 * status biasa tidak dikirim — kolom `sebab` tidak punya nilai untuk itu.
 *
 * AB-31 · menandai terbaca tidak menutup apa pun. Yang menghentikan pengingat
 * adalah penutupan di modulnya, dan itu kolom yang berbeda.
 */
final class Notifikasi
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'notif', 'baca');

        $baris = Db::semua(
            "SELECT n.id, n.jenis, n.modul, n.judul, n.isi, n.sebab, n.aksi,
                    n.dibuat_pada, n.dibaca_pada, n.selesai_pada
               FROM notifikasi n
              WHERE n.pabrik_id = :pb
                AND (n.penerima_id IS NULL OR n.penerima_id = :me)
                AND n.selesai_pada IS NULL
              ORDER BY n.dibuat_pada DESC",
            [':pb' => $u['pabrik_id'], ':me' => $u['id']]
        );
        $baris = array_map(static function (array $r): array {
            $r['baca'] = $r['dibaca_pada'] !== null;
            return $r;
        }, $baris);
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /**
     * Menandai terbaca. Sengaja TIDAK menutup: item lewat tenggat dikirim
     * ulang setiap hari sampai ditutup di modulnya (AB-31). Kalau membaca
     * sudah cukup menghentikan pengingat, pengingatnya tidak ada gunanya.
     */
    public static function tandaiTerbaca(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'notif', 'baca');

        $n = Db::baris('SELECT id, pabrik_id, penerima_id, selesai_pada FROM notifikasi WHERE id = :i',
            [':i' => $par['id']]);
        if ($n === null) throw Galat::takAda('Pemberitahuan tidak ditemukan.');
        Wewenang::wajibCakupan($u, $n['pabrik_id']);
        if ($n['penerima_id'] !== null && $n['penerima_id'] !== $u['id']) {
            throw Galat::takBerwenang('Pemberitahuan ini ditujukan kepada orang lain.');
        }

        Db::jalankan('UPDATE notifikasi SET dibaca_pada = coalesce(dibaca_pada, now()) WHERE id = :i',
            [':i' => $n['id']]);

        Jawab::kirim([
            'id' => $n['id'], 'baca' => true,
            'selesai' => $n['selesai_pada'] !== null,
            'catatan' => 'Terbaca tidak menghentikan pengingat; item ditutup di modulnya (AB-31).',
        ]);
    }
}
