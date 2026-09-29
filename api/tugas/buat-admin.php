<?php
declare(strict_types=1);

/**
 * Membuat administrator pertama.
 *
 * Sistem yang baru dipasang belum punya satu pun pengguna, dan pengguna hanya
 * dapat dibuat oleh administrator. Skrip ini memutus lingkaran itu — sekali.
 *
 *   php api/tugas/buat-admin.php --email=nama@perusahaan.co.id \
 *       --nama="Nama Lengkap" --tautan-ke=/home/pengguna/kg-tautan-admin.txt \
 *       [--pabrik=CBT]
 *
 * Akunnya dibuat berstatus Menunggu, dan tautan undangan untuk menyetel sandi
 * ditulis ke berkas --tautan-ke dengan izin 600. Tautannya SENGAJA tidak
 * dicetak ke layar: skrip ini dapat dijalankan lewat cron atau oleh orang
 * lain, dan keluaran layar berakhir di log yang dibaca banyak orang. Yang
 * membuka berkas itu dan memakai tautannya menjadi administrator.
 *
 * Menolak berjalan bila sudah ada administrator aktif — administrator
 * berikutnya dibuat dari layar Pengguna, di mana jejaknya tercatat atas nama
 * orang yang membuatnya.
 */

require_once __DIR__ . '/../src/muat.php';

use KG\{Db, Jejak, Sandi};

$opsi = getopt('', ['email:', 'nama:', 'tautan-ke:', 'pabrik:']);
$email  = mb_strtolower(trim((string) ($opsi['email'] ?? '')));
$nama   = trim((string) ($opsi['nama'] ?? ''));
$tujuan = (string) ($opsi['tautan-ke'] ?? '');
$pabrikKode = strtoupper((string) ($opsi['pabrik'] ?? ''));

function berhenti(string $pesan): never
{
    fwrite(STDERR, "GAGAL: $pesan\n");
    exit(1);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) berhenti('--email wajib diisi dengan alamat yang sah.');
if (mb_strlen($nama) < 2) berhenti('--nama wajib diisi.');
if ($tujuan === '' || !str_starts_with($tujuan, '/')) berhenti('--tautan-ke wajib berupa jalur lengkap.');
if (!is_dir(dirname($tujuan)) || !is_writable(dirname($tujuan))) berhenti('Folder untuk --tautan-ke tidak dapat ditulis.');

$aktif = (int) Db::nilai(
    "SELECT count(*) FROM pengguna WHERE peran_kode = 'admin' AND status = 'Aktif' AND sandi_hash IS NOT NULL"
);
if ($aktif > 0) {
    berhenti("sudah ada $aktif administrator aktif. Administrator berikutnya dibuat dari layar Pengguna.");
}

$ada = Db::baris('SELECT id, peran_kode, status FROM pengguna WHERE lower(email) = :e', [':e' => $email]);
if ($ada !== null && $ada['peran_kode'] !== 'admin') {
    berhenti("$email sudah terdaftar dengan peran '{$ada['peran_kode']}'. Skrip ini tidak mengubah peran orang.");
}

$pabrik = $pabrikKode !== ''
    ? Db::nilai('SELECT id FROM pabrik WHERE kode = :k AND aktif', [':k' => $pabrikKode])
    : Db::nilai('SELECT id FROM pabrik WHERE aktif ORDER BY urutan, nama LIMIT 1');
if ($pabrik === null) berhenti('pabrik tidak ditemukan.');

$tautan = Db::transaksi(function () use ($ada, $email, $nama, $pabrik) {
    if ($ada === null) {
        $kata = array_values(array_filter(preg_split('/\s+/', $nama) ?: []));
        $inisial = mb_strtoupper(count($kata) >= 2
            ? mb_substr($kata[0], 0, 1) . mb_substr($kata[count($kata) - 1], 0, 1)
            : mb_substr($kata[0], 0, 2));
        $id = (string) Db::nilai(
            "INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status)
             VALUES (:e, :n, :i, 'admin', :p, 'Menunggu') RETURNING id",
            [':e' => $email, ':n' => $nama, ':i' => $inisial, ':p' => $pabrik]
        );
        Jejak::catat('pengguna', $id, 'buat', null,
            ['email' => $email, 'nama' => $nama, 'peran' => 'admin', 'status' => 'Menunggu', 'lewat' => 'buat-admin.php'],
            null);
    } else {
        $id = $ada['id'];
    }
    $t = Sandi::buatTautan($id, 'undangan', null);
    Jejak::catat('pengguna', $id, 'kirim_tautan', null,
        ['jenis' => 'undangan', 'kedaluwarsa' => $t['kedaluwarsa'], 'lewat' => 'buat-admin.php'], null);
    return $t;
});

$lama = umask(0077);
$tulis = file_put_contents($tujuan,
    "Tautan undangan administrator KG SafeGuard\n"
    . "Untuk: $nama <$email>\n"
    . "Berlaku sampai: {$tautan['kedaluwarsa']}\n"
    . "Hanya dapat dipakai sekali.\n\n"
    . $tautan['alamat'] . "\n");
umask($lama);
if ($tulis === false) berhenti('berkas tautan tidak dapat ditulis.');
chmod($tujuan, 0600);

echo ($ada === null ? "Administrator $email dibuat (Menunggu). " : "Administrator $email sudah ada; tautan baru dibuat. ")
    . "Tautan undangan ditulis ke $tujuan (izin 600, berlaku " . Sandi::UMUR_UNDANGAN_HARI . " hari). "
    . "Isinya sengaja tidak dicetak di sini.\n";
