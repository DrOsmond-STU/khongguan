<?php
declare(strict_types=1);

namespace KG;

/**
 * Sesi dan pengguna yang sedang masuk.
 *
 * Pada produksi identitas datang dari direktori perusahaan (OIDC); sistem
 * tidak pernah menerima atau menyimpan kata sandi. Jalur masuk demo hanya
 * hidup bila konfigurasi 'izinkan_masuk_demo' dinyalakan, dan dipakai untuk
 * pengembangan serta pengujian.
 */
final class Sesi
{
    private static ?array $pengguna = null;

    /** Membuat sesi baru dan mengembalikan tokennya (hanya sekali terlihat). */
    public static function buka(string $penggunaId, string $jenisKlien = 'meja'): string
    {
        $token = bin2hex(random_bytes(32));
        $umur  = $jenisKlien === 'lapangan'
            ? (int) Konfigurasi::satu('umur_sesi_lapangan')
            : (int) Konfigurasi::satu('umur_sesi_meja');

        Db::jalankan(
            'INSERT INTO sesi (token_hash, pengguna_id, jenis_klien, kedaluwarsa)
             VALUES (:h, :p, :j, now() + make_interval(secs => :u))',
            [':h' => hash('sha256', $token), ':p' => $penggunaId, ':j' => $jenisKlien, ':u' => $umur]
        );
        Db::jalankan('UPDATE pengguna SET masuk_terakhir = now() WHERE id = :p', [':p' => $penggunaId]);
        return $token;
    }

    public static function tutup(string $token): void
    {
        Db::jalankan('DELETE FROM sesi WHERE token_hash = :h', [':h' => hash('sha256', $token)]);
    }

    /**
     * Pengguna yang sedang masuk, berikut peran dan modul yang terbuka.
     * Melempar 401 bila tidak ada sesi yang sahih.
     *
     * @return array<string,mixed>
     */
    public static function pengguna(Permintaan $p): array
    {
        if (self::$pengguna !== null) return self::$pengguna;

        $kepala = $p->kepala('authorization') ?? '';
        if (!preg_match('/^Bearer\s+([0-9a-f]{64})$/i', $kepala, $c)) {
            throw Galat::belumMasuk();
        }

        $baris = Db::baris(
            'SELECT u.id, u.email, u.nama, u.inisial, u.status,
                    u.peran_kode, r.nama AS peran_nama,
                    u.pabrik_id, pb.nama AS pabrik_nama, pb.kode AS pabrik_kode,
                    s.jenis_klien
               FROM sesi s
               JOIN pengguna u ON u.id = s.pengguna_id
               JOIN peran r    ON r.kode = u.peran_kode
               JOIN pabrik pb  ON pb.id = u.pabrik_id
              WHERE s.token_hash = :h AND s.kedaluwarsa > now()',
            [':h' => hash('sha256', $c[1])]
        );

        if ($baris === null) throw Galat::belumMasuk();

        // Penonaktifan akun di direktori mencabut akses pada pemakaian
        // berikutnya, tanpa menunggu sesinya berakhir (KNF-21).
        if ($baris['status'] !== 'Aktif') {
            throw Galat::takBerwenang('Akun Anda tidak aktif.');
        }

        Db::jalankan('UPDATE sesi SET dipakai_pada = now() WHERE token_hash = :h',
            [':h' => hash('sha256', $c[1])]);

        $baris['modul']      = Wewenang::modul($baris['peran_kode']);
        $baris['kewenangan'] = Wewenang::kewenangan($baris['peran_kode']);

        return self::$pengguna = $baris;
    }

    /** Dipakai pengujian untuk mengosongkan keadaan antar-permintaan. */
    public static function lupakan(): void
    {
        self::$pengguna = null;
    }
}
