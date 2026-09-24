<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/** Modul 03 · Work Permit & JSEA. */
final class Izin
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'permit', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'z');

        $baris = Db::semua(
            "SELECT z.id, z.nomor, z.nomor_asal, z.jenis, z.judul, z.pelaksana, z.vendor, z.pekerja,
                    z.pengawas, z.mulai, z.durasi, z.prasyarat, z.status,
                    a.nama AS area, ji.nama AS jenis_nama,
                    j.nomor AS jsa_nomor, j.status AS jsa_status,
                    -- AB-13 · izin memakai skor tertinggi di antara langkah
                    -- JSA-nya, bukan rata-rata: satu langkah Ekstrem menutup
                    -- penerbitan walaupun sembilan langkah lain aman (AB-10).
                    (SELECT max(skor_awal) FROM jsa_langkah l WHERE l.jsa_id = z.jsa_id) AS risiko_awal,
                    (SELECT max(skor_sisa) FROM jsa_langkah l WHERE l.jsa_id = z.jsa_id) AS risiko_sisa
               FROM izin z
               JOIN area a ON a.id = z.area_id
               JOIN jenis_izin ji ON ji.kode = z.jenis
          LEFT JOIN jsa j  ON j.id = z.jsa_id
              WHERE z.dihapus_pada IS NULL AND $saring
              ORDER BY z.dibuat_pada DESC", $par
        );
        foreach ($baris as &$b) {
            $b['prasyarat'] = json_decode((string) $b['prasyarat'], true) ?: [];
            $b['zona'] = $b['risiko_sisa'] === null ? null : Aturan::zona((int) $b['risiko_sisa']);
        }
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /**
     * Pengajuan izin. AB-12 · pengajuan bukan penerbitan, jadi tidak
     * dibatasi peran: yang meminta izin justru operator yang akan
     * mengerjakan, dan menutup jalur permintaannya berarti pekerjaan
     * berisiko tinggi dimulai tanpa izin sama sekali.
     */
    public static function ajukan(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        $areaId  = $p->wajibTeks('area_id');
        $jenis   = $p->wajibTeks('jenis');
        $judul   = $p->wajibTeks('judul');
        $pengawas = $p->wajibTeks('pengawas');

        $area = Db::baris('SELECT id, pabrik_id FROM area WHERE id = :i AND aktif', [':i' => $areaId]);
        if ($area === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => 'area_id']);
        Wewenang::wajibCakupan($u, $area['pabrik_id']);

        if (Db::baris('SELECT kode FROM jenis_izin WHERE kode = :k', [':k' => $jenis]) === null) {
            throw Galat::isian('Jenis izin tidak dikenal.', ['kolom' => 'jenis']);
        }

        $hasil = Db::transaksi(function () use ($p, $u, $area, $jenis, $judul, $pengawas) {
            $nomor = Nomor::berikut('izin');
            $id = (string) Db::nilai(
                'INSERT INTO izin (nomor, nomor_asal, pabrik_id, area_id, jenis, judul, jsa_id,
                                   pelaksana, pelaksana_id, vendor, pekerja, pengawas, mulai, durasi,
                                   prasyarat, status, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :na, :pb, :a, :j, :ju, :js, :pl, :pli, :v, :pk, :pw, :m, :d, :pr,
                         :st, :o, :o) RETURNING id',
                [':n' => $nomor, ':na' => $p->isi('nomor_asal'), ':pb' => $area['pabrik_id'], ':a' => $area['id'],
                 ':j' => $jenis, ':ju' => $judul, ':js' => $p->isi('jsa_id'),
                 ':pl' => (string) $p->isi('pelaksana', $u['nama']), ':pli' => $p->isi('pelaksana_id', $u['id']),
                 ':v' => $p->isi('vendor', false) ? 'true' : 'false',
                 ':pk' => (int) $p->isi('pekerja', 1), ':pw' => $pengawas,
                 ':m' => $p->isi('mulai'), ':d' => $p->isi('durasi'),
                 ':pr' => json_encode($p->isi('prasyarat', []), JSON_UNESCAPED_UNICODE),
                 ':st' => 'Menunggu Supervisor', ':o' => $u['id']]
            );
            Jejak::catat('izin', $id, 'buat', null, ['nomor' => $nomor, 'status' => 'Diajukan'], $u['id']);
            return ['id' => $id, 'nomor' => $nomor, 'status' => 'Menunggu Supervisor'];
        });

        Jawab::kirim($hasil, 201);
    }

    /**
     * Penerbitan izin. Di sinilah tiga aturan bertemu:
     * AB-09 (JSA disahkan), AB-10 (zona Ekstrem), AB-11 (kartu induksi).
     */
    public static function terbitkan(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'permit', 'verifikasi');

        $z = Db::baris('SELECT id, nomor, pabrik_id, status, pelaksana, pelaksana_id
                          FROM izin WHERE id = :i AND dihapus_pada IS NULL', [':i' => $par['id']]);
        if ($z === null) throw Galat::takAda('Izin kerja tidak ditemukan.');
        Wewenang::wajibCakupan($u, $z['pabrik_id']);

        if ($z['status'] === 'Aktif') {
            throw Galat::aturan('AB-09', 'Izin ' . $z['nomor'] . ' sudah aktif.', ['nomor' => $z['nomor']]);
        }

        Aturan::izinBolehTerbit($z['id']);
        Aturan::pelaksanaBolehBekerja($z['pelaksana_id'], $z['pelaksana']);

        Db::transaksi(function () use ($z, $u) {
            Db::jalankan(
                "UPDATE izin SET status = 'Aktif', disetujui_oleh = :u, disetujui_pada = now(),
                        diubah_oleh = :u, diubah_pada = now() WHERE id = :i",
                [':u' => $u['id'], ':i' => $z['id']]
            );
            Jejak::catat('izin', $z['id'], 'terbitkan', ['status' => $z['status']], ['status' => 'Aktif'], $u['id']);
        });

        Jawab::kirim(['id' => $z['id'], 'nomor' => $z['nomor'], 'status' => 'Aktif']);
    }
}
