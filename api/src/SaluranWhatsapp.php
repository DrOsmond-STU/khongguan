<?php
declare(strict_types=1);

namespace KG;

/**
 * Pengiriman lewat WhatsApp.
 *
 * WhatsApp tidak dapat dikirim langsung; ia selalu lewat penyedia. Kelas ini
 * karena itu berbentuk adaptor HTTP yang alamat, kepala, dan bentuk badannya
 * dikonfigurasi — bukan tertanam pada satu penyedia tertentu. Penyedia di
 * Indonesia berganti syarat dan harga lebih cepat daripada masa dukungan
 * sistem ini.
 *
 * Nomor diambil dari kolom pengguna.telepon; penerima tanpa nomor dilewati
 * tanpa menjatuhkan pengiriman ke saluran lain.
 */
final class SaluranWhatsapp implements Saluran
{
    /**
     * @param array<int,array<string,mixed>> $penerima
     * @param array<string,mixed> $n
     */
    public function kirim(array $penerima, array $n): bool
    {
        /** @var array<string,mixed> $c */
        $c = Konfigurasi::satu('whatsapp');
        $alamat = (string) ($c['alamat'] ?? '');
        if ($alamat === '') return false;

        $pesan = "*{$n['label']}* · {$n['modul']}\n{$n['judul']}\n\n{$n['isi']}";
        $semua = true;

        foreach ($penerima as $orang) {
            $nomor = self::nomor($orang['telepon'] ?? null);
            if ($nomor === null) continue;

            $badan = str_replace(
                ['{nomor}', '{pesan}'],
                [$nomor, $pesan],
                (string) ($c['badan'] ?? '{"to":"{nomor}","message":"{pesan}"}')
            );
            // Pesan disisipkan sebagai nilai JSON, jadi harus dilolosi dulu.
            $badan = str_replace('{pesan}', '', $badan);
            $badan = json_encode(array_merge(
                json_decode(str_replace('"{pesan}"', '""', $badan), true) ?: [],
                ['to' => $nomor, 'message' => $pesan]
            ), JSON_UNESCAPED_UNICODE);

            if (!self::kirimHttp($alamat, (array) ($c['kepala'] ?? []), (string) $badan)) {
                $semua = false;
            }
        }
        return $semua;
    }

    /** Menormalkan ke bentuk internasional tanpa tanda plus. */
    private static function nomor(mixed $mentah): ?string
    {
        if (!is_string($mentah) || $mentah === '') return null;
        $angka = preg_replace('/\D+/', '', $mentah) ?? '';
        if ($angka === '') return null;
        if (str_starts_with($angka, '0')) $angka = '62' . substr($angka, 1);
        return strlen($angka) >= 10 ? $angka : null;
    }

    /** @param array<int|string,mixed> $kepala */
    private static function kirimHttp(string $alamat, array $kepala, string $badan): bool
    {
        $baris = ['Content-Type: application/json'];
        foreach ($kepala as $k => $v) $baris[] = is_int($k) ? (string) $v : "$k: $v";

        $ch = curl_init($alamat);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $badan,
            CURLOPT_HTTPHEADER => $baris,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        $jawab = curl_exec($ch);
        $kode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $galat = curl_error($ch);
        curl_close($ch);

        if ($jawab === false || $kode >= 300) {
            error_log("[KG] WhatsApp gagal ($kode): " . ($galat !== '' ? $galat : (string) $jawab));
            return false;
        }
        return true;
    }
}
