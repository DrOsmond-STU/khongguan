# KG SafeGuard Lapangan — pembungkus Android

Aplikasi lapangan sudah dapat dipasang di Android hari ini **tanpa berkas ini**:
buka `https://khongguan.semestateknologiutama.com/m/` di Chrome, lalu pilih
**Pasang aplikasi** dari menu. Hasilnya ikon di layar utama, berjalan layar penuh
tanpa bilah peramban, dan tetap terbuka tanpa sinyal.

Berkas di folder ini untuk kebutuhan yang berbeda: **APK/AAB yang dapat
ditandatangani, disebarkan lewat MDM perusahaan, atau diunggah ke Google Play.**

> **Belum pernah dikompilasi.** Android SDK tidak dapat diunduh dari lingkungan
> tempat berkas ini dibuat (`dl.google.com` diblokir), jadi konfigurasi di sini
> belum pernah menghasilkan APK. Yang sudah diperiksa hanya kesahihan JSON-nya.
> Perlakukan sebagai titik awal yang perlu Anda jalankan sekali di mesin ber-SDK,
> bukan sebagai hasil jadi.

---

## Cara yang dipakai: Trusted Web Activity

TWA membungkus situs yang sudah tayang menjadi aplikasi Android sungguhan.
Dipilih karena tiga alasan:

1. **Tidak ada kode yang digandakan.** Aplikasi memuat `/m/` yang sama dengan
   yang sudah diuji. Tidak ada cabang kode Android yang harus dijaga sejalan.
2. **Pembaruan tanpa rilis ulang.** Perbaikan yang Anda pasang di server langsung
   sampai ke perangkat lapangan. Untuk aplikasi K3 ini penting: perbaikan alur
   pelaporan tidak perlu menunggu persetujuan toko aplikasi.
3. **Kamera, GPS, dan penyimpanan luring bekerja apa adanya**, karena yang
   berjalan di dalamnya adalah Chrome, bukan WebView usang.

Yang **tidak** diberikan TWA: notifikasi dorong latar belakang yang benar-benar
asli, integrasi dengan pemindai kode batang perangkat keras, dan penyimpanan di
luar kuota peramban. Bila ketiganya diperlukan, jalur yang tepat adalah aplikasi
native atau Capacitor — dan itu keputusan yang lebih besar daripada pembungkus.

---

## Langkah membangun

Diperlukan: Node.js 18+, JDK 17, dan Android SDK (lewat Android Studio atau
`commandlinetools`).

```bash
npm install -g @bubblewrap/cli

# 1 · Siapkan proyek dari manifes yang sudah tayang
bubblewrap init --manifest https://khongguan.semestateknologiutama.com/m/manifest.webmanifest

#    Saat ditanya, pakai nilai pada twa-manifest.json di folder ini.
#    Yang paling sering salah: Application ID harus tetap
#    com.khongguan.safeguard.lapangan sepanjang umur aplikasi.

# 2 · Bangun
bubblewrap build

# Hasil: app-release-signed.apk dan app-release-bundle.aab
```

## Langkah yang tidak boleh dilewat: assetlinks.json

Tanpa berkas ini, aplikasi tetap terpasang tetapi **menampilkan bilah alamat
Chrome di atas layar** — tanda bahwa Android belum percaya aplikasi itu milik
domain yang sama.

1. Ambil sidik jari sertifikat penanda tangan Anda:

   ```bash
   keytool -list -v -keystore android.keystore -alias android | grep SHA256
   ```

2. Salin nilainya ke `assetlinks.json` di folder ini, menggantikan
   `GANTI_DENGAN_SIDIK_JARI_SHA256_ANDA`.

3. Unggah berkas itu ke server sehingga dapat dibuka di:

   ```
   https://khongguan.semestateknologiutama.com/.well-known/assetlinks.json
   ```

   Harus dilayani sebagai `application/json` dan **tanpa pengalihan**.

4. Pasang ulang aplikasi. Bilah alamat harus hilang.

---

## Sebelum disebarkan ke pekerja

Purwarupa ini belum siap dipakai di lapangan sungguhan, dan alasannya bukan
tampilan:

- **Tidak ada server.** Laporan tersimpan di perangkat masing-masing dan tidak
  pernah sampai ke mana pun. Titik sambungnya sudah ditandai: fungsi `kirim()`
  pada `assets/lapangan.js`.
- **Autentikasi masih contoh.** Kata sandi `demo1234` tertulis di dalam kode.
  Pada penyebaran sungguhan ini diganti dengan direktori perusahaan (SSO/LDAP).
- **Seluruh isi adalah data rekaan**, bukan catatan QHSE Khong Guan.

Urutan yang masuk akal: bangun API dan autentikasinya lebih dulu, ganti `kirim()`,
baru sebarkan APK-nya. Membalik urutan itu berarti mengumpulkan laporan bahaya
yang tidak pernah sampai ke siapa pun.
