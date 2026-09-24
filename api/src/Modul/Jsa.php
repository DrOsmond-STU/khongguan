<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Aturan, Db, Galat, Jawab, Jejak, Nomor, Permintaan, Sesi, Wewenang};

/**
 * Modul 06 · Analisis Keselamatan Pekerjaan (JSA).
 *
 * Satu JSA adalah tiga tabel: kepalanya, langkah-langkahnya, dan pengendalian
 * pada tiap langkah. Ketiganya diambil sekaligus, karena JSA tanpa langkahnya
 * tidak berarti apa-apa — dan karena izin kerja membaca skor sisa per langkah
 * untuk memutuskan boleh terbit atau tidak (AB-10).
 */
final class Jsa
{
    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'jsa', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'j');

        $baris = Db::semua(
            "SELECT j.id, j.nomor, j.pekerjaan, j.jenis, j.apd_wajib, j.disusun, j.disahkan,
                    j.tinjau, j.revisi, j.status,
                    a.nama AS area,
                    ps.nama AS penyusun, pt.nama AS peninjau, pg.nama AS pengesah
               FROM jsa j
               JOIN area a ON a.id = j.area_id
          LEFT JOIN pengguna ps ON ps.id = j.penyusun_id
          LEFT JOIN pengguna pt ON pt.id = j.peninjau_id
          LEFT JOIN pengguna pg ON pg.id = j.pengesah_id
              WHERE j.dihapus_pada IS NULL AND $saring
              ORDER BY j.nomor DESC", $par
        );
        if ($baris === []) { Jawab::daftar([], 1, 0, 0); }

        $baris = self::sertakanLangkah($baris);
        $baris = self::sertakanIzin($baris);
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /**
     * Langkah dan pengendaliannya diambil dalam dua kueri untuk seluruh
     * daftar, bukan dua kueri per JSA. Dengan 200 JSA yang terakhir berarti
     * 400 perjalanan ke basis data untuk satu halaman.
     *
     * @param array<int,array<string,mixed>> $baris
     * @return array<int,array<string,mixed>>
     */
    private static function sertakanLangkah(array $baris): array
    {
        $ids = array_column($baris, 'id');
        [$tanda, $par] = self::dalam($ids);

        $langkah = Db::semua(
            "SELECT l.id, l.jsa_id, l.nomor, l.kerja, l.bahaya,
                    l.kemungkinan, l.keparahan, l.kemungkinan_sisa, l.keparahan_sisa,
                    l.skor_awal, l.skor_sisa
               FROM jsa_langkah l
              WHERE l.jsa_id IN ($tanda)
              ORDER BY l.jsa_id, l.nomor", $par
        );
        $kendali = [];
        if ($langkah !== []) {
            [$t2, $p2] = self::dalam(array_column($langkah, 'id'));
            foreach (Db::semua(
                "SELECT jsa_langkah_id, hierarki, teks FROM jsa_kendali
                  WHERE jsa_langkah_id IN ($t2) ORDER BY jsa_langkah_id, urutan", $p2
            ) as $k) {
                $kendali[$k['jsa_langkah_id']][] = ['hierarki' => $k['hierarki'], 'teks' => $k['teks']];
            }
        }

        $per = [];
        foreach ($langkah as $l) {
            $l['zona']      = Aturan::zona((int) $l['skor_awal']);
            $l['zona_sisa'] = Aturan::zona((int) $l['skor_sisa']);
            $l['kendali']   = $kendali[$l['id']] ?? [];
            $per[$l['jsa_id']][] = $l;
        }
        foreach ($baris as &$b) {
            // PDO mengembalikan jsonb sebagai teks; klien mengharap larik.
            $b['apd_wajib']  = json_decode((string) $b['apd_wajib'], true) ?: [];
            $b['langkah']    = $per[$b['id']] ?? [];
            $b['hanya_apd']  = self::hanyaApd($b['langkah']);
            // AB-13 · risiko daftar memakai skor tertinggi di antara seluruh
            // langkah, bukan rata-rata. Satu langkah berbahaya tidak boleh
            // tersamarkan oleh lima langkah aman.
            $b['skor']      = 0;
            $b['skor_sisa'] = 0;
            foreach ($b['langkah'] as $l) {
                $b['skor']      = max($b['skor'], (int) $l['skor_awal']);
                $b['skor_sisa'] = max($b['skor_sisa'], (int) $l['skor_sisa']);
            }
            $b['zona']      = Aturan::zona($b['skor']);
            $b['zona_sisa'] = Aturan::zona($b['skor_sisa']);
        }
        return $baris;
    }

    /**
     * AB-34 · JSA yang seluruh pengendaliannya berupa APD ditandai, tidak
     * ditolak. APD adalah lapisan terakhir: bila hanya itu yang ada, bahayanya
     * belum ditangani, hanya dipindahkan ke tubuh pekerja.
     *
     * @param array<int,array<string,mixed>> $langkah
     */
    private static function hanyaApd(array $langkah): bool
    {
        $ada = false;
        foreach ($langkah as $l) {
            foreach ($l['kendali'] as $k) {
                $ada = true;
                if ($k['hierarki'] !== 'APD') return false;
            }
        }
        return $ada;
    }

    /**
     * @param array<int,array<string,mixed>> $baris
     * @return array<int,array<string,mixed>>
     */
    private static function sertakanIzin(array $baris): array
    {
        [$tanda, $par] = self::dalam(array_column($baris, 'id'));
        $per = [];
        foreach (Db::semua(
            "SELECT jsa_id, nomor FROM izin WHERE jsa_id IN ($tanda) AND dihapus_pada IS NULL
              ORDER BY nomor", $par
        ) as $i) {
            $per[$i['jsa_id']][] = $i['nomor'];
        }
        foreach ($baris as &$b) { $b['izin_terkait'] = $per[$b['id']] ?? []; }
        return $baris;
    }

    /**
     * @param array<int,string> $ids
     * @return array{0:string,1:array<string,mixed>}
     */
    private static function dalam(array $ids): array
    {
        $tanda = [];
        $par   = [];
        foreach (array_values($ids) as $n => $id) { $tanda[] = ":d$n"; $par[":d$n"] = $id; }
        return [implode(',', $tanda), $par];
    }

    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'jsa', 'isi');

        $areaId    = $p->wajibTeks('area_id');
        $pekerjaan = $p->wajibTeks('pekerjaan');
        $jenis     = (string) $p->isi('jenis', 'Non-rutin');
        $langkah   = $p->isi('langkah', []);

        if (!is_array($langkah) || $langkah === []) {
            throw Galat::isian('JSA harus memuat sedikitnya satu langkah kerja.', ['kolom' => 'langkah']);
        }

        $area = Db::baris('SELECT id, pabrik_id FROM area WHERE id = :i AND aktif', [':i' => $areaId]);
        if ($area === null) throw Galat::isian('Area kerja tidak dikenal.', ['kolom' => 'area_id']);
        Wewenang::wajibCakupan($u, $area['pabrik_id']);

        $hasil = Db::transaksi(function () use ($p, $u, $area, $pekerjaan, $jenis, $langkah) {
            $nomor = Nomor::berikut('jsa');
            $apd   = $p->isi('apd_wajib', []);
            $id = (string) Db::nilai(
                'INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib,
                                  penyusun_id, disusun, dibuat_oleh, diubah_oleh)
                 VALUES (:n, :pb, :a, :k, :j, :apd, :ps, :ds, :o, :o) RETURNING id',
                [':n' => $nomor, ':pb' => $area['pabrik_id'], ':a' => $area['id'], ':k' => $pekerjaan,
                 ':j' => $jenis, ':apd' => json_encode(is_array($apd) ? array_values($apd) : []),
                 ':ps' => $u['id'], ':ds' => date('Y-m-d'), ':o' => $u['id']]
            );

            $no = 0;
            foreach ($langkah as $l) {
                if (!is_array($l)) continue;
                $no++;
                $lid = (string) Db::nilai(
                    'INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                                              kemungkinan_sisa, keparahan_sisa)
                     VALUES (:j, :n, :k, :b, :km, :kp, :kms, :kps) RETURNING id',
                    [':j' => $id, ':n' => (int) ($l['nomor'] ?? $no),
                     ':k' => (string) ($l['kerja'] ?? ''), ':b' => (string) ($l['bahaya'] ?? ''),
                     ':km' => (int) ($l['kemungkinan'] ?? 1), ':kp' => (int) ($l['keparahan'] ?? 1),
                     ':kms' => (int) ($l['kemungkinan_sisa'] ?? 1), ':kps' => (int) ($l['keparahan_sisa'] ?? 1)]
                );
                $urut = 0;
                foreach ((array) ($l['kendali'] ?? []) as $k) {
                    if (!is_array($k)) continue;
                    Db::jalankan(
                        'INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
                         VALUES (:l, :h, :t, :u)',
                        [':l' => $lid, ':h' => (string) ($k['hierarki'] ?? 'Administratif'),
                         ':t' => (string) ($k['teks'] ?? ''), ':u' => $urut++]
                    );
                }
            }

            Jejak::catat('jsa', $id, 'buat', null,
                ['nomor' => $nomor, 'pekerjaan' => $pekerjaan, 'langkah' => $no], $u['id']);
            return ['id' => $id, 'nomor' => $nomor, 'langkah' => $no];
        });

        Jawab::kirim($hasil, 201);
    }

    /** Pengesahan JSA. */
    public static function sahkan(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'jsa', 'verifikasi');

        $j = Db::baris(
            'SELECT id, nomor, pabrik_id, status, penyusun_id FROM jsa
              WHERE id = :i AND dihapus_pada IS NULL', [':i' => $par['id']]
        );
        if ($j === null) throw Galat::takAda('JSA tidak ditemukan.');
        Wewenang::wajibCakupan($u, $j['pabrik_id']);

        if ($j['status'] === 'Disahkan') {
            throw Galat::isian('JSA ' . $j['nomor'] . ' sudah disahkan sebelumnya.',
                ['nomor' => $j['nomor']]);
        }
        // AB-17 · pengesahan oleh penyusunnya sendiri bukan tinjauan, dan izin
        // kerja bersandar pada pengesahan ini (AB-09).
        if ($j['penyusun_id'] === $u['id']) {
            throw Galat::aturan('AB-17',
                'JSA ' . $j['nomor'] . ' disusun oleh Anda sendiri; pengesahan harus dilakukan orang lain.',
                ['nomor' => $j['nomor']]);
        }
        if ((int) Db::nilai('SELECT count(*) FROM jsa_langkah WHERE jsa_id = :i', [':i' => $j['id']]) === 0) {
            throw Galat::isian('JSA ' . $j['nomor'] . ' belum memuat satu pun langkah kerja.',
                ['nomor' => $j['nomor']]);
        }

        Db::transaksi(function () use ($j, $u) {
            Db::jalankan(
                "UPDATE jsa SET status = 'Disahkan', pengesah_id = :u, disahkan = current_date,
                        tinjau = current_date + interval '1 year', revisi = revisi + 1,
                        diubah_oleh = :u, diubah_pada = now() WHERE id = :i",
                [':u' => $u['id'], ':i' => $j['id']]
            );
            Jejak::catat('jsa', $j['id'], 'sahkan',
                ['status' => $j['status']], ['status' => 'Disahkan'], $u['id']);
        });

        Jawab::kirim(['id' => $j['id'], 'nomor' => $j['nomor'], 'status' => 'Disahkan']);
    }
}
