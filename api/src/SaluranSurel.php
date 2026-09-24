<?php
declare(strict_types=1);

namespace KG;

/**
 * Pengiriman lewat surel, langsung dengan SMTP.
 *
 * Tanpa pustaka: SMTP yang dibutuhkan di sini hanya EHLO, STARTTLS, AUTH
 * LOGIN, MAIL FROM, RCPT TO, DATA. Menambah ketergantungan yang versinya harus
 * dijaga selama masa dukungan untuk enam perintah bukan pertukaran yang baik.
 *
 * Fungsi mail() PHP sengaja tidak dipakai: pada hosting bersama ia mengirim
 * lewat alamat yang tidak punya SPF dan DKIM domain ini, dan surelnya berakhir
 * di folder sampah — yang berarti pemberitahuan tidak sampai, tanpa ada yang
 * tahu.
 */
final class SaluranSurel implements Saluran
{
    /**
     * @param array<int,array<string,mixed>> $penerima
     * @param array<string,mixed> $n
     */
    public function kirim(array $penerima, array $n): bool
    {
        $alamat = array_values(array_filter(array_column($penerima, 'email')));
        if ($alamat === []) return true;

        $judul = '[KG SafeGuard] ' . $n['label'] . ' · ' . $n['judul'];
        $badan = self::badan($n);

        try {
            self::smtp($alamat, $judul, $badan);
            return true;
        } catch (\Throwable $e) {
            // Gagal kirim dicatat, bukan dilempar: satu surel yang gagal tidak
            // boleh menghentikan sembilan pemberitahuan berikutnya.
            error_log('[KG] surel gagal terkirim (' . implode(', ', $alamat) . '): ' . $e->getMessage());
            return false;
        }
    }

    /** @param array<string,mixed> $n */
    private static function badan(array $n): string
    {
        $k = Konfigurasi::satu('alamat_aplikasi') ?: '';
        $tautan = $k === '' ? '' : rtrim((string) $k, '/') . '/#/' . $n['aksi'];

        // AB-30 · pemberitahuan harus membawa tindakan. Kalimat penutup
        // menyebut apa yang harus dilakukan, bukan sekadar memberi kabar.
        return "{$n['judul']}\n\n{$n['isi']}\n\n"
            . "Modul: {$n['modul']}\n"
            . ($tautan === '' ? '' : "Buka: $tautan\n")
            . "\n"
            . "Pemberitahuan ini dikirim karena " . self::sebab((string) $n['sebab']) . ".\n"
            . "Ia akan dikirim ulang sampai catatannya ditutup di modulnya; "
            . "menandainya terbaca tidak menghentikannya.\n";
    }

    private static function sebab(string $kode): string
    {
        return [
            'lewat_tenggat'      => 'tenggatnya sudah terlewat',
            'menunggu_keputusan' => 'ia menunggu keputusan Anda',
            'melewati_ambang'    => 'ada nilai yang melewati ambang',
        ][$kode] ?? $kode;
    }

    /** @param array<int,string> $kepada */
    private static function smtp(array $kepada, string $judul, string $badan): void
    {
        /** @var array<string,mixed> $c */
        $c = Konfigurasi::satu('smtp');
        $induk = (string) ($c['host'] ?? '');
        $porta = (int) ($c['porta'] ?? 587);
        $dari  = (string) ($c['dari'] ?? '');
        $namaDari = (string) ($c['nama_dari'] ?? 'KG SafeGuard');

        $konteks = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
        $awalan = ($c['tls_langsung'] ?? false) === true ? 'ssl://' : '';
        $sock = @stream_socket_client("$awalan$induk:$porta", $no, $pesan, 15,
            STREAM_CLIENT_CONNECT, $konteks);
        if ($sock === false) throw new \RuntimeException("SMTP tidak dapat dihubungi: $pesan");
        stream_set_timeout($sock, 15);

        $baca = static function () use ($sock): string {
            $hasil = '';
            while (($baris = fgets($sock, 1024)) !== false) {
                $hasil .= $baris;
                if (strlen($baris) < 4 || $baris[3] !== '-') break;
            }
            return $hasil;
        };
        $tulis = static function (string $perintah, string $harap) use ($sock, $baca): void {
            fwrite($sock, $perintah . "\r\n");
            $jawab = $baca();
            if (!str_starts_with($jawab, $harap)) {
                throw new \RuntimeException("SMTP menolak '" . strtok($perintah, ' ') . "': "
                    . trim($jawab));
            }
        };

        $baca();
        $tulis('EHLO ' . (parse_url((string) Konfigurasi::satu('alamat_aplikasi'), PHP_URL_HOST)
            ?: 'localhost'), '250');

        if ($awalan === '' && ($c['starttls'] ?? true) !== false) {
            $tulis('STARTTLS', '220');
            if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new \RuntimeException('STARTTLS gagal; surel tidak dikirim tanpa enkripsi.');
            }
            $tulis('EHLO ' . (parse_url((string) Konfigurasi::satu('alamat_aplikasi'), PHP_URL_HOST)
                ?: 'localhost'), '250');
        }

        if (!empty($c['pengguna'])) {
            $tulis('AUTH LOGIN', '334');
            $tulis(base64_encode((string) $c['pengguna']), '334');
            $tulis(base64_encode((string) ($c['sandi'] ?? '')), '235');
        }

        $tulis("MAIL FROM:<$dari>", '250');
        foreach ($kepada as $alamat) $tulis("RCPT TO:<$alamat>", '250');
        $tulis('DATA', '354');

        $kepala = "From: " . self::kodeKepala($namaDari) . " <$dari>\r\n"
            . 'To: ' . implode(', ', $kepada) . "\r\n"
            . 'Subject: ' . self::kodeKepala($judul) . "\r\n"
            . "MIME-Version: 1.0\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n"
            . "Content-Transfer-Encoding: 8bit\r\n"
            . 'Date: ' . date('r') . "\r\n\r\n";

        // Titik di awal baris diloloskan; tanpa itu sebuah baris berisi "."
        // mengakhiri pesan di tengah jalan.
        $isi = preg_replace('/^\./m', '..', str_replace("\n", "\r\n", $badan));
        fwrite($sock, $kepala . $isi . "\r\n.\r\n");
        $jawab = $baca();
        if (!str_starts_with($jawab, '250')) {
            throw new \RuntimeException('SMTP menolak isi pesan: ' . trim($jawab));
        }

        fwrite($sock, "QUIT\r\n");
        fclose($sock);
    }

    private static function kodeKepala(string $s): string
    {
        return preg_match('/[^\x20-\x7e]/', $s) === 1
            ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
    }
}
