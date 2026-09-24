<?php
declare(strict_types=1);

namespace KG\Modul;

use KG\{Berkas, Db, Galat, Jawab, Permintaan, Sesi, Wewenang};

/** Modul lampiran · unggah dan unduh foto serta berkas. */
final class Lampiran
{
    /** Masa berlaku tautan unduh (KNF-25). */
    private const UMUR_TAUTAN = 15 * 60;

    public static function unggah(Permintaan $p): never
    {
        $u = Sesi::pengguna($p);
        // Mengunggah tidak dibatasi peran, sama seperti melapor (AB-12):
        // foto adalah bagian laporan, dan menutup jalurnya berarti laporan
        // datang tanpa bukti.

        $berkas = $_FILES['berkas'] ?? null;
        if (is_array($berkas) && ($berkas['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $isi  = (string) file_get_contents($berkas['tmp_name']);
            $nama = is_string($berkas['name'] ?? null) ? basename($berkas['name']) : null;
        } else {
            // Aplikasi lapangan mengirim foto sebagai data URL, bukan
            // multipart: antrean luring disimpan sebagai JSON di perangkat.
            $data = $p->isi('data_url');
            if (!is_string($data) || $data === '') {
                throw Galat::isian("Tidak ada berkas yang diterima.", ['kolom' => 'berkas']);
            }
            $hasil = Berkas::simpanDataUrl($data, $u['id']);
            Jawab::kirim($hasil + ['tautan' => self::tautan($hasil['id'], $u['id'])], 201);
        }

        $hasil = Berkas::simpan($isi, $nama, $u['id']);
        Jawab::kirim($hasil + ['tautan' => self::tautan($hasil['id'], $u['id'])], 201);
    }

    /**
     * Mengirimkan isi berkas.
     *
     * Dua lapis pemeriksaan: tanda tautan yang berumur 15 menit, dan hak akses
     * pengguna atas catatan induknya. Tanda saja tidak cukup — tautan yang
     * diteruskan lewat pesan akan tetap terbuka bagi siapa pun yang menerimanya
     * selama masih berlaku.
     */
    public static function unduh(Permintaan $p, array $par): never
    {
        $u = Sesi::pengguna($p);
        $sampai = (int) ($p->kueri['sampai'] ?? 0);
        $tanda  = (string) ($p->kueri['tanda'] ?? '');
        Berkas::periksaTanda($par['id'], $u['id'], $sampai, $tanda);

        $l = Db::baris(
            'SELECT id, kunci_objek, nama_asli, tipe_media, ukuran, induk_tabel, induk_id
               FROM lampiran WHERE id = :i', [':i' => $par['id']]
        );
        if ($l === null) throw Galat::takAda('Lampiran tidak ditemukan.');

        self::wajibBolehMelihat($u, $l);

        $jalur = Berkas::jalur((string) $l['kunci_objek']);
        if (!is_readable($jalur)) throw Galat::takAda('Isi berkas tidak ditemukan di penyimpanan.');

        if (PHP_SAPI !== 'cli') {
            header('Content-Type: ' . $l['tipe_media']);
            header('Content-Length: ' . $l['ukuran']);
            header('Content-Disposition: inline; filename="'
                . preg_replace('/[^\w.\- ]/u', '_', (string) ($l['nama_asli'] ?? 'lampiran')) . '"');
            // Tautan berumur pendek tidak boleh ikut tersimpan di perantara.
            header('Cache-Control: private, no-store');
            readfile($jalur);
        }
        Jawab::selesaiMentah();
    }

    /**
     * Cakupan pabrik ikut berlaku pada berkas. Foto insiden pabrik lain sama
     * tertutupnya dengan catatannya (KNF-22, KNF-23).
     *
     * @param array<string,mixed> $u
     * @param array<string,mixed> $l
     */
    private static function wajibBolehMelihat(array $u, array $l): void
    {
        if ($l['induk_id'] === null) {
            // Lampiran yang belum terkait catatan hanya terbuka bagi pengunggahnya.
            $pemilik = Db::nilai('SELECT dibuat_oleh FROM lampiran WHERE id = :i', [':i' => $l['id']]);
            if ($pemilik !== $u['id'] && $u['peran_kode'] !== 'admin') {
                throw Galat::takBerwenang('Lampiran ini belum terkait catatan mana pun.');
            }
            return;
        }

        $tabel = (string) $l['induk_tabel'];
        // Daftar putih; nama tabel tidak pernah masuk SQL dari data.
        $modul = [
            'bahaya' => 'hazard', 'insiden' => 'incident', 'observasi' => 'bbs',
            'observasi_apd' => 'bbs', 'inspeksi' => 'inspection', 'checklist' => 'checklist',
            'izin' => 'permit', 'capa' => 'capa', 'temuan_audit' => 'audit',
            'kegiatan' => 'activity', 'dokumen_internal' => 'docint', 'dokumen_eksternal' => 'docext',
        ][$tabel] ?? null;
        if ($modul === null) throw Galat::takBerwenang('Induk lampiran tidak dikenal.');

        Wewenang::wajib($u, $modul, 'baca');

        if ($tabel === 'temuan_audit') {
            $pabrik = Db::nilai(
                'SELECT a.pabrik_id FROM temuan_audit t JOIN audit a ON a.id = t.audit_id
                  WHERE t.id = :i', [':i' => $l['induk_id']]);
        } else {
            $pabrik = Db::nilai("SELECT pabrik_id FROM $tabel WHERE id = :i", [':i' => $l['induk_id']]);
        }
        Wewenang::wajibCakupan($u, $pabrik === null ? null : (string) $pabrik);
    }

    public static function tautan(string $lampiranId, string $penggunaId): string
    {
        $sampai = time() + self::UMUR_TAUTAN;
        return '/api/v1/lampiran/' . $lampiranId
            . '?sampai=' . $sampai
            . '&tanda=' . Berkas::tanda($lampiranId, $penggunaId, $sampai);
    }
}
