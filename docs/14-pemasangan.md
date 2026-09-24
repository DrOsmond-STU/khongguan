# 14 · Pemasangan di peladen

Untuk cPanel dengan PHP 8.3 dan PostgreSQL 16 — lingkungan
`khongguan.semestateknologiutama.com` pada akun `semestat`.

## Yang sudah dikerjakan

| Hal | Keadaan |
|---|---|
| Basis data `semestat_kgsafe` | Dibuat |
| Pengguna `semestat_kgapp` | Dibuat, hak akses diberikan, sambungan diuji |
| PostgreSQL | 16.15 · `gen_random_uuid()` inti tersedia, `pgcrypto` tidak ada dan tidak diperlukan |
| PHP CLI (cron) | 8.3.33 · `pdo_pgsql`, `zip`, `fileinfo` tersedia |
| Klon repositori `/home/semestat/kgrepo` | Ada, menunjuk cabang pengembangan |
| Tabel `oidc_permintaan` dan `simpanan` | Sudah dibuat |
| Sisa skema, berkas aplikasi, cron | **Belum** — lihat di bawah |

## Langkah yang tersisa

### 1 · Konfigurasi

Buat `/home/semestat/khongguan.semestateknologiutama.com/api/config.php`
dengan izin `600`. Isinya mengikuti `api/config.contoh.php`; yang wajib diisi:

```php
'db_dsn'      => 'pgsql:host=127.0.0.1;port=5432;dbname=semestat_kgsafe',
'db_pengguna' => 'semestat_kgapp',
'db_sandi'    => '…',                       // sandi yang dipakai saat membuat pengguna
'izinkan_masuk_demo' => false,              // lihat catatan keamanan di bawah
'alamat_aplikasi' => 'https://khongguan.semestateknologiutama.com',
'jalur_berkas'    => '/home/semestat/kg-berkas',
'rahasia_tanda'   => '…',                   // php -r "echo bin2hex(random_bytes(32));"
```

`config.php` tidak pernah masuk repositori, dan `api/.htaccess` menolak
melayaninya sekalipun ada yang salah menaruhnya di tempat yang terbaca.

### 2 · Direktori berkas

```bash
mkdir -p /home/semestat/kg-berkas
chmod 700 /home/semestat/kg-berkas
```

**Di luar docroot.** Foto insiden memuat wajah, luka, dan lokasi kerja;
direktori yang dapat ditebak alamatnya membocorkan semuanya tanpa jejak.

### 3 · Salin berkas

```bash
cd /home/semestat/kgrepo
git fetch origin claude/affectionate-fermi-s38tfh
git reset --hard origin/claude/affectionate-fermi-s38tfh

APP=/home/semestat/khongguan.semestateknologiutama.com
rsync -a --delete --exclude 'config.php' kgrepo/api/    "$APP/api/"
rsync -a                                  kgrepo/assets/ "$APP/assets/"
rsync -a                                  kgrepo/m/      "$APP/m/"
cp kgrepo/index.html "$APP/index.html"

rm -rf "$APP/api/uji"      # pengujian membuat ulang skema; tidak boleh ada di produksi
chmod 600 "$APP/api/config.php"
```

### 4 · Migrasi

```bash
/opt/alt/php83/usr/bin/php "$APP/api/tugas/migrasi.php"
```

Mencatat berkas yang sudah dijalankan; aman diulang. Data contoh
(`007_contoh.sql`) **tidak** dimuat kecuali diminta dengan `--contoh` — basis
data produksi yang berisi data peragaan tidak dapat dibedakan dari yang berisi
catatan sungguhan.

### 5 · Cron pemberitahuan

Perintahnya ditaruh di dalam berkas skrip, bukan di baris crontab: tanda persen
pada crontab memotong perintahnya di tengah jalan.

`/home/semestat/kg-cron.sh`:

```bash
#!/bin/bash
/opt/alt/php83/usr/bin/php \
  /home/semestat/khongguan.semestateknologiutama.com/api/tugas/pemberitahuan.php \
  >> /home/semestat/kg-pemberitahuan.log 2>&1
```

Crontab: `0 6,13 * * *  /bin/bash /home/semestat/kg-cron.sh`

Dua kali sehari cukup. Pemberitahuan yang datang setiap jam berhenti dibaca,
dan yang benar-benar mendesak — kejadian berkeparahan Serius (AB-02) — dikirim
seketika oleh modulnya, bukan menunggu jadwal ini.

### 6 · Periksa

```bash
curl -s -H 'Host: khongguan.semestateknologiutama.com' \
     http://127.0.0.1/api/v1/saya
# diharapkan: {"galat":{"kode":"BELUM_MASUK",…}}  — artinya API hidup dan menjaga pintunya
```

## Catatan keamanan: mengapa `izinkan_masuk_demo` harus `false`

Jalur `POST /sesi/masuk-demo` menerima alamat surel **tanpa memeriksa kata
sandi**. Ia ada untuk pengembangan dan pengujian, dan pada alamat publik ia
berarti siapa pun yang menebak satu alamat surel dapat membaca dan mengubah
seluruh catatan QHSE — termasuk nama, cedera, dan nilai ujian induksi.

Karena itu urutannya:

1. Pasang peladen dengan `izinkan_masuk_demo => false`. API hidup, menjaga
   pintunya, dan belum dapat dimasuki siapa pun.
2. `assets/konfigurasi.js` tetap `api: ''`, jadi situsnya berjalan pada mode
   peragaan — purwarupa yang selama ini diperagakan ke klien tidak berubah
   sama sekali.
3. Begitu rincian OIDC Khong Guan Group tersedia, isi bagian `oidc` pada
   `config.php` dan ubah satu baris pada `konfigurasi.js`:

   ```js
   window.KG_KONFIG = { api: 'https://khongguan.semestateknologiutama.com', versi: '4' };
   ```

Bila STU membutuhkan alamat uji yang hidup **sebelum** OIDC siap, jangan
menyalakan jalur demo di alamat publik. Yang aman: lindungi seluruh situs
dengan sandi direktori cPanel lebih dulu, baru nyalakan jalur demo di
belakangnya.

## Yang tidak dapat dikerjakan dari sesi ini

**APK Android.** Membutuhkan JDK, Android SDK, dan kunci penanda tangan milik
STU. Kunci itu tidak boleh berada di lingkungan mana pun selain milik STU
sendiri — kunci yang bocor memungkinkan orang lain menerbitkan pembaruan palsu
atas nama aplikasi ini. `android/twa-manifest.json` sudah siap untuk
Bubblewrap; yang tersisa hanya `bubblewrap build` di mesin yang memegang
kuncinya.
