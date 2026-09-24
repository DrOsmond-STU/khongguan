<?php
declare(strict_types=1);

/**
 * Pekerjaan terjadwal: menyusun dan mengirim pemberitahuan.
 *
 * Dijalankan cron, sekali sehari pada pagi hari sebelum shift pertama, dan
 * sekali lagi siang hari. Dua kali sehari cukup: pemberitahuan yang datang
 * setiap jam berhenti dibaca, dan yang benar-benar mendesak (kejadian Serius)
 * dikirim seketika oleh modulnya, bukan menunggu jadwal ini (AB-02).
 *
 * Aman dijalankan tumpang tindih: penyusunan idempoten, dan pengiriman ulang
 * dibatasi sekali sehari per pemberitahuan.
 *
 *   0 6,13 * * *  /usr/local/bin/php /jalur/ke/api/tugas/pemberitahuan.php
 *
 * Catatan cPanel: tanda persen pada baris crontab memotong perintahnya. Bila
 * perlu peubah waktu, taruh perintahnya di dalam berkas skrip, bukan di
 * crontab.
 */

require __DIR__ . '/../src/muat.php';

use KG\{Pemberitahuan, DaftarSaluran};

$mulai = microtime(true);

$susun  = Pemberitahuan::susun();
$kirim  = Pemberitahuan::kirim();
$durasi = round(microtime(true) - $mulai, 2);

$saluran = count(DaftarSaluran::aktif());
$pesan = sprintf(
    '[%s] pemberitahuan: %d dibuat, %d ditutup, %d terkirim, %d gagal, %d saluran, %.2fs',
    date('c'), $susun['dibuat'], $susun['ditutup'], $kirim['terkirim'], $kirim['gagal'],
    $saluran, $durasi
);

// Ditulis ke keluaran supaya cron mengirimkannya ke surel administrator, dan
// ke log peladen supaya tetap ada walau surel cron dimatikan.
echo $pesan, "\n";
error_log($pesan);

if ($saluran === 0) {
    echo "Tidak ada saluran aktif; pemberitahuan tersusun tetapi tidak terkirim ke mana pun.\n";
}

exit($kirim['gagal'] > 0 ? 1 : 0);
