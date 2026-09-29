<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Db, Galat, Jawab, Jejak, Permintaan, Sandi, Sesi, Wewenang};

/**
 * Modul 24 · Pengguna dan peran.
 *
 * Administrator membuat akun, mengubah peran dan pabrik, menonaktifkan, dan
 * mengirim tautan penyetel sandi. Ia tidak pernah menentukan sandi siapa pun:
 * undangan berisi tautan, dan karyawan yang membukanya menyetel sandinya
 * sendiri.
 *
 * Akun tidak pernah dihapus, hanya dinonaktifkan. Menghapus akun memutus nama
 * pelapor dan verifikator dari catatan insiden dan CAPA yang sudah ada —
 * catatan yang justru dibaca auditor.
 */
final class Pengguna
{
    private const STATUS = ['Aktif', 'Nonaktif'];

    public static function daftar(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'users', 'baca');
        [$saring, $par] = Wewenang::saringCakupan($u, 'p');

        $baris = Db::semua(
            "SELECT p.id, p.email, p.nama, p.inisial, p.peran_kode, p.status, p.masuk_terakhir,
                    p.pabrik_id, pr.nama AS peran_nama, pb.nama AS pabrik,
                    (p.sandi_hash IS NOT NULL) AS ada_sandi,
                    (SELECT max(t.kedaluwarsa) FROM tautan_sandi t
                      WHERE t.pengguna_id = p.id AND t.dipakai_pada IS NULL
                        AND t.kedaluwarsa > now()) AS tautan_berlaku_sampai
               FROM pengguna p
               JOIN peran pr  ON pr.kode = p.peran_kode
               JOIN pabrik pb ON pb.id = p.pabrik_id
              WHERE $saring
              ORDER BY p.nama", $par
        );
        Jawab::daftar($baris, 1, count($baris), count($baris));
    }

    /**
     * POST /pengguna — akun baru berstatus Menunggu, beserta tautan undangan.
     *
     * Tautannya dikembalikan kepada administrator untuk diteruskan (surel,
     * WhatsApp). Selama surel sistem belum dinyalakan, itulah satu-satunya
     * jalan tautan sampai ke karyawan.
     */
    public static function buat(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'users', 'kelola');

        $email = mb_strtolower(trim($p->wajibTeks('email')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw Galat::isian('Alamat email tidak sah.', ['kolom' => 'email']);
        }
        $nama = self::namaLayak($p->wajibTeks('nama'));
        $peran = self::peranAda($p->wajibTeks('peran_kode'));
        $pabrik = self::pabrikAda($p->wajibTeks('pabrik_id'));

        if (Db::nilai('SELECT 1 FROM pengguna WHERE lower(email) = :e', [':e' => $email]) !== null) {
            throw new Galat(409, 'GANDA', "Alamat $email sudah terdaftar. Cari di daftar pengguna; "
                . 'bila akunnya nonaktif, aktifkan kembali alih-alih membuat akun baru.');
        }

        $hasil = Db::transaksi(function () use ($email, $nama, $peran, $pabrik, $u, $p) {
            $id = (string) Db::nilai(
                "INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status)
                 VALUES (:e, :n, :i, :r, :p, 'Menunggu') RETURNING id",
                [':e' => $email, ':n' => $nama, ':i' => self::inisial($nama), ':r' => $peran, ':p' => $pabrik]
            );
            Jejak::catat('pengguna', $id, 'buat', null,
                ['email' => $email, 'nama' => $nama, 'peran' => $peran, 'pabrik_id' => $pabrik, 'status' => 'Menunggu'],
                $u['id'], $p->ip ?: null);
            $t = Sandi::buatTautan($id, 'undangan', $u['id']);
            return ['id' => $id, 'email' => $email, 'nama' => $nama, 'status' => 'Menunggu',
                    'tautan' => $t['alamat'], 'kedaluwarsa' => $t['kedaluwarsa']];
        });

        Jawab::kirim($hasil, 201);
    }

    /** POST /pengguna/{id}/ubah — nama, peran, pabrik. Email tidak dapat diubah. */
    public static function ubah(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'users', 'kelola');
        $t = self::cari($par['id']);

        $baru = [
            'nama'       => $p->isi('nama') !== null ? self::namaLayak((string) $p->isi('nama')) : $t['nama'],
            'peran_kode' => $p->isi('peran_kode') !== null ? self::peranAda((string) $p->isi('peran_kode')) : $t['peran_kode'],
            'pabrik_id'  => $p->isi('pabrik_id') !== null ? self::pabrikAda((string) $p->isi('pabrik_id')) : $t['pabrik_id'],
        ];

        if ($t['id'] === $u['id'] && $baru['peran_kode'] !== $t['peran_kode']) {
            throw Galat::takBerwenang('Anda tidak dapat mengubah peran Anda sendiri. Minta administrator lain.');
        }
        if ($t['peran_kode'] === 'admin' && $baru['peran_kode'] !== 'admin') {
            self::wajibMasihAdaAdmin($t['id']);
        }

        Db::transaksi(function () use ($t, $baru, $u, $p) {
            Db::jalankan(
                'UPDATE pengguna SET nama = :n, inisial = :i, peran_kode = :r, pabrik_id = :p, diubah_pada = now()
                  WHERE id = :id',
                [':n' => $baru['nama'], ':i' => self::inisial($baru['nama']), ':r' => $baru['peran_kode'],
                 ':p' => $baru['pabrik_id'], ':id' => $t['id']]
            );
            Jejak::catat('pengguna', $t['id'], 'ubah',
                ['nama' => $t['nama'], 'peran_kode' => $t['peran_kode'], 'pabrik_id' => $t['pabrik_id']],
                $baru, $u['id'], $p->ip ?: null);
        });

        Jawab::kirim(['id' => $t['id'], 'email' => $t['email']] + $baru);
    }

    /**
     * POST /pengguna/{id}/status — Aktif atau Nonaktif.
     *
     * Penonaktifan langsung memutus seluruh sesi dan membatalkan tautan yang
     * belum dipakai. Orang yang keluar hari ini tidak boleh masih dapat
     * membuka catatan K3 besok pagi dari ponselnya.
     */
    public static function status(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'users', 'kelola');
        $t = self::cari($par['id']);
        $status = $p->wajibPilihan('status', self::STATUS);

        if ($status === $t['status']) {
            Jawab::kirim(['id' => $t['id'], 'email' => $t['email'], 'status' => $status]);
        }

        if ($status === 'Nonaktif') {
            if ($t['id'] === $u['id']) {
                throw Galat::takBerwenang('Anda tidak dapat menonaktifkan akun Anda sendiri.');
            }
            if ($t['peran_kode'] === 'admin') self::wajibMasihAdaAdmin($t['id']);
        } elseif ($t['sandi_hash'] === null) {
            // Mengaktifkan akun tanpa sandi menghasilkan akun yang berstatus
            // Aktif tetapi tidak dapat dipakai masuk siapa pun.
            throw Galat::isian('Akun ini belum pernah menyetel sandi. Kirim tautan undangan; '
                . 'akunnya aktif sendiri begitu tautan itu dipakai.');
        }

        Db::transaksi(function () use ($t, $status, $u, $p) {
            Db::jalankan('UPDATE pengguna SET status = :s, diubah_pada = now() WHERE id = :i',
                [':s' => $status, ':i' => $t['id']]);
            if ($status === 'Nonaktif') {
                Db::jalankan('DELETE FROM sesi WHERE pengguna_id = :i', [':i' => $t['id']]);
                Db::jalankan('UPDATE tautan_sandi SET kedaluwarsa = now()
                               WHERE pengguna_id = :i AND dipakai_pada IS NULL AND kedaluwarsa > now()',
                    [':i' => $t['id']]);
            }
            Jejak::catat('pengguna', $t['id'], $status === 'Nonaktif' ? 'nonaktifkan' : 'aktifkan',
                ['status' => $t['status']], ['status' => $status], $u['id'], $p->ip ?: null);
        });

        Jawab::kirim(['id' => $t['id'], 'email' => $t['email'], 'status' => $status]);
    }

    /**
     * POST /pengguna/{id}/tautan — tautan baru: undangan bila belum pernah
     * menyetel sandi, pengaturan ulang bila sudah.
     *
     * Sandi lama tetap berlaku sampai tautannya dipakai. Membuat tautan tidak
     * boleh menjadi cara mengunci orang keluar dari akunnya sendiri.
     */
    public static function tautan(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        Wewenang::wajib($u, 'users', 'kelola');
        $t = self::cari($par['id']);
        if ($t['status'] === 'Nonaktif') {
            throw Galat::isian('Akun ini nonaktif. Aktifkan kembali lebih dulu bila memang masih dipakai.');
        }

        $jenis = $t['sandi_hash'] === null ? 'undangan' : 'atur-ulang';
        $hasil = Db::transaksi(function () use ($t, $jenis, $u, $p) {
            $x = Sandi::buatTautan($t['id'], $jenis, $u['id']);
            Jejak::catat('pengguna', $t['id'], 'kirim_tautan', null,
                ['jenis' => $jenis, 'kedaluwarsa' => $x['kedaluwarsa']], $u['id'], $p->ip ?: null);
            return $x;
        });

        Jawab::kirim(['id' => $t['id'], 'email' => $t['email'], 'nama' => $t['nama'], 'jenis' => $jenis,
                      'tautan' => $hasil['alamat'], 'kedaluwarsa' => $hasil['kedaluwarsa']]);
    }

    /* ── Bantuan ───────────────────────────────────────────────────── */

    /** @return array<string,mixed> */
    private static function cari(string $id): array
    {
        if (!preg_match('/^[0-9a-f-]{36}$/i', $id)) throw Galat::takAda('Pengguna tidak ditemukan.');
        $t = Db::baris(
            'SELECT id, email, nama, peran_kode, pabrik_id, status, sandi_hash FROM pengguna WHERE id = :i',
            [':i' => $id]
        );
        if ($t === null) throw Galat::takAda('Pengguna tidak ditemukan.');
        return $t;
    }

    /**
     * Harus tetap ada setidaknya satu administrator aktif selain yang
     * sedang diubah. Sistem tanpa administrator tidak dapat menambah
     * pengguna, dan satu-satunya jalan keluarnya adalah mengubah basis data
     * dengan tangan.
     */
    private static function wajibMasihAdaAdmin(string $kecuali): void
    {
        $n = (int) Db::nilai(
            "SELECT count(*) FROM pengguna
              WHERE peran_kode = 'admin' AND status = 'Aktif' AND sandi_hash IS NOT NULL AND id <> :i",
            [':i' => $kecuali]
        );
        if ($n === 0) {
            throw Galat::isian('Ini administrator aktif terakhir. Jadikan orang lain administrator lebih dulu.');
        }
    }

    private static function namaLayak(string $nama): string
    {
        $nama = trim(preg_replace('/\s+/', ' ', $nama) ?? '');
        if (mb_strlen($nama) < 2) throw Galat::isian('Nama lengkap wajib diisi.', ['kolom' => 'nama']);
        if (mb_strlen($nama) > 120) throw Galat::isian('Nama terlalu panjang.', ['kolom' => 'nama']);
        return $nama;
    }

    private static function peranAda(string $kode): string
    {
        if (Db::nilai('SELECT 1 FROM peran WHERE kode = :k', [':k' => $kode]) === null) {
            throw Galat::isian("Peran '$kode' tidak dikenal.", ['kolom' => 'peran_kode']);
        }
        return $kode;
    }

    private static function pabrikAda(string $id): string
    {
        if (!preg_match('/^[0-9a-f-]{36}$/i', $id)
            || Db::nilai('SELECT 1 FROM pabrik WHERE id = :i AND aktif', [':i' => $id]) === null) {
            throw Galat::isian('Pabrik tidak dikenal.', ['kolom' => 'pabrik_id']);
        }
        return $id;
    }

    /** "Fadli Saldi" → "FS"; "Rina" → "RI". */
    private static function inisial(string $nama): string
    {
        $kata = array_values(array_filter(preg_split('/\s+/', $nama) ?: []));
        $i = count($kata) >= 2
            ? mb_substr($kata[0], 0, 1) . mb_substr($kata[count($kata) - 1], 0, 1)
            : mb_substr($kata[0] ?? '?', 0, 2);
        return mb_strtoupper($i);
    }
}
