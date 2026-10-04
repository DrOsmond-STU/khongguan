# 14 · Pemasangan di peladen

Untuk cPanel dengan PHP 8.3 dan PostgreSQL 16 — lingkungan
`khongguan.semestateknologiutama.com` pada akun `semestat`.

## Keadaan · 3 Oktober 2026 — tersambung, menunggu administrator pertama

| Hal | Keadaan |
|---|---|
| Berkas aplikasi | Terpasang dari komit `4947780`: `api/`, `assets/`, `m/`, `index.html`. `api/uji/` sengaja tidak ikut |
| Pengguna `semestat_kgapp` | Dibuat dari sandi yang disediakan manusia; hak ALL pada `semestat_kgsafe` |
| `api/config.php` | Terpasang, izin 600, **tanpa rahasia** — lihat "Rahasia dari berkas" |
| Migrasi | 001, 002, 004, 006, 008, 009, 010 tercatat; 007 (data contoh) tidak dimuat |
| Skema | 54 tabel, 2 fungsi/pemicu — sama dengan basis data pengembangan |
| Masuk dengan sandi (komit `85cd1a7`) | Terpasang. Diperiksa dari dalam peladen: `/sesi/masuk` hidup, `masuk-demo` mati, `config.php` dijawab 403 |
| Pengguna | Satu: administrator pertama `osmondconsulting@gmail.com`, berstatus **Menunggu** sampai tautannya dipakai. Tautan di `/home/semestat/kg-tautan-admin.txt` (izin 600, berlaku sampai 17 Oktober 2026), tidak pernah dicetak ke log |
| Acuan | 4 pabrik, 5 peran, 48 area, 5 jenis izin, 12 kategori bahaya |
| Catatan | Kosong, sebagaimana mestinya untuk basis data produksi baru |
| `/home/semestat/kg-berkas` | Ada, izin 700, di luar docroot |
| Cron pemberitahuan | `0 6,13 * * *  /bin/bash /home/semestat/kg-cron.sh` |
| Peragaan untuk klien | `https://khongguan-demo.semestateknologiutama.com` (SSL Let's Encrypt), antarmuka saja, data contoh, diperbarui bersama situs utama |
| `assets/konfigurasi.js` | **Mode tersambung**, dari `/home/semestat/kg-konfigurasi.js` — lihat "Menyalakan mode tersambung" |
| Log galat domain | Bersih untuk `api/` |

Situs **belum** disambungkan ke API (`api: ''`). Itu disengaja: masuk-demo
dimatikan dan OIDC belum dikonfigurasi, sehingga tidak ada satu pun cara masuk
yang sah. Menyambungkannya sekarang hanya akan menampilkan layar masuk yang
tidak bisa dilewati siapa pun. Lihat "Menyalakan mode tersambung" di bawah.

## Rahasia dari berkas

`config.php` tidak memuat sandi. Ia membaca dua berkas satu-baris di luar
docroot, keduanya berizin 600:

| Berkas | Isi |
|---|---|
| `/home/semestat/kg-sandi.txt` | sandi pengguna PostgreSQL `semestat_kgapp` |
| `/home/semestat/kg-rahasia.txt` | kunci acak ≥ 32 aksara untuk tautan unduh |

Dua alasan. Pertama, orang yang memasang tidak perlu menyunting PHP: satu
berkas, satu baris, tidak ada tanda petik yang bisa salah. Kedua — dan ini
yang menentukan — sesi AI yang mengerjakan pemasangan ini **tidak diizinkan
membuat atau memegang sandi produksi**, dan itu batas yang benar. Sandi harus
lahir dari tangan manusia di STU; dengan pola ini ia lahir di cPanel File
Manager dan tidak pernah lewat mana pun selain itu.

Mengganti sandi: sunting berkasnya, lalu ganti sandi pengguna di cPanel →
PostgreSQL Databases. `config.php` tidak perlu disentuh.

### Insiden saat pemasangan

Kedua berkas rahasia pertama kali dibuat di **docroot**, bukan di
`/home/semestat/`, dengan izin 644 — artinya selama ±3 menit keduanya dapat
diunduh siapa pun lewat `https://khongguan.semestateknologiutama.com/kg-sandi.txt`.
Dipindahkan dan ditutup begitu ketahuan.

**Apakah sempat diakses, tidak diketahui.** Log akses yang hidup tidak
terjangkau dari sesi pemasangan (hanya alat berkas cPanel; tautan
`access-logs` menunjuk jalur yang tidak ada), log arsip terakhir bertanggal
sehari sebelumnya, dan statistik pengunjung kosong. Yang meringankan: domain
belum diumumkan, nama berkasnya tidak tercantum di mana pun, dan basis data
saat itu masih kosong. Yang memberatkan: sandinya tetap berlaku sampai
sekarang, jadi bila memang ada yang mengambilnya, ia masih memegangnya.

Untuk memastikan, salah satu dari dua: baca domlog lewat SSH
(`grep kg-sandi /var/log/apache2/domlogs/semestat/khongguan.*` atau jalur
setara di peladen ini) untuk jendela 29 Sep 16:12–16:15 WIB — atau, lebih
sederhana dan pasti, ganti sandinya: isi baru di `kg-sandi.txt`, lalu
sandi yang sama di cPanel → PostgreSQL Databases → Change Password untuk
`semestat_kgapp`. Dua menit, dan pertanyaannya selesai.

Pelajaran untuk runbook: **sebutkan folder tujuan dengan jalur penuh, dan
minta orangnya membacakan jalur yang tampil di File Manager sebelum menyimpan.**

## Skrip pembantu di peladen

Semua di `/home/semestat/`. Tidak satu pun memuat rahasia; yang menyentuh
sandi membacanya dari berkas dan menyaringnya dari log.

| Skrip | Guna |
|---|---|
| `kg-salin.sh` | Klon ulang cabang dan salin `api/`, `assets/`, `m/`, `index.html` ke docroot. **Jalankan lagi untuk memperbarui aplikasi.** Log: `kg-salin.log` |
| `kg-selesaikan.sh` | Pengguna basis data → uji sambungan → pendamaian perancah → migrasi → periksa. Aman diulang. Log: `kg-selesaikan.log` |
| `kg-perancah.php` | Mencatat `008` sebagai sudah dijalankan **hanya bila** dua tabel yang pernah dibuat manual identik dengan yang akan dibuat `008`. Tidak menghapus apa pun. Sudah bekerja; tidak akan berbuat apa-apa lagi |
| `kg-periksa.php` | Cetak migrasi tercatat, jumlah tabel, isi acuan dan catatan |
| `kg-cron.sh` | Pemberitahuan dua kali sehari; diam bila `config.php` belum ada |
| `kg-konfigurasi.js` | Konfigurasi mode tersambung peladen ini; `kg-salin.sh` menimpakannya ke `assets/konfigurasi.js` |
| `kg-admin-pertama.sh` | Sekali jalan: `buat-admin.php` untuk administrator pertama. Sudah berjalan 3 Oktober 2026. Log: `kg-admin-pertama.log` (tanpa tautan) |
| `kg-perbarui.sh` | `kg-salin.sh`, `kg-selesaikan.sh`, lalu `kg-admin-pertama.sh`; sekali jalan per penanda. Untuk pembaruan berikutnya, ganti `PENANDA` di dalamnya lalu jalankan. Log: `kg-perbarui.log` |
| `kg-periksa-api.sh` | Memeriksa API dari dalam peladen (lewat HTTP lokal; HTTPS tidak terikat ke 127.0.0.1 di hosting ini). Log: `kg-periksa-api.log` |

Skrip dijalankan lewat cron sekali-jalan (`* * * * *`, lalu dihapus) karena
sesi pemasangan tidak punya shell ke peladen — hanya alat berkas dan cron
cPanel. Pola itu bekerja dan tidak perlu diubah; hanya perlu diingat untuk
**menghapus cron-nya** setelah log menunjukkan `SELESAI`.

## Memperbarui aplikasi

```bash
/bin/bash /home/semestat/kg-salin.sh
/opt/alt/php83/usr/bin/php /home/semestat/khongguan.semestateknologiutama.com/api/tugas/migrasi.php
```

`kg-salin.sh` mengecualikan `config.php`, jadi konfigurasi tidak tertimpa.
Migrasi hanya menjalankan berkas yang belum tercatat.

## Administrator pertama

Sistem yang baru terpasang belum punya pengguna, dan pengguna hanya dapat
dibuat administrator. `api/tugas/buat-admin.php` memutus lingkaran itu,
sekali:

```bash
/opt/alt/php83/usr/bin/php $APP/api/tugas/buat-admin.php \
  --email=nama@perusahaan.co.id --nama="Nama Lengkap" \
  --tautan-ke=/home/semestat/kg-tautan-admin.txt
```

Akunnya dibuat berstatus **Menunggu**, dan tautan undangannya ditulis ke
berkas `--tautan-ke` dengan izin 600 — **tidak dicetak ke layar maupun log**.
Orang yang akan menjadi administrator membuka berkas itu di File Manager,
menyalin tautannya ke peramban, dan menyetel sandinya sendiri. Setelah
tautannya dipakai, berkas itu tidak berguna lagi dan boleh dihapus.

Skrip menolak berjalan bila sudah ada administrator aktif: administrator
berikutnya dibuat dari layar Pengguna, di mana jejaknya tercatat atas nama
orang yang membuatnya.

## Menyalakan mode tersambung

**Urutannya: mode tersambung lebih dulu, baru tautan administrator dipakai.**
Halaman penyetel sandi (`#/sandi/…`) adalah bagian dari aplikasi tersambung;
pada mode peragaan tautan itu tidak membuka apa pun.

`assets/konfigurasi.js` di repositori tetap `api: ''`, karena uji layar dan
perbandingan piksel bersandar padanya. Salinan untuk peladen ini disimpan di
luar docroot, `/home/semestat/kg-konfigurasi.js`:

```js
window.KG_KONFIG = Object.assign({
  api: 'https://khongguan.semestateknologiutama.com',
  versi: '10'
}, window.KG_KONFIG || {});
```

`kg-salin.sh` menimpakannya ke `assets/konfigurasi.js` setiap kali selesai
menyalin, sehingga pembaruan berikutnya tidak diam-diam mengembalikan situs ke
mode peragaan. Kembali ke peragaan: hapus berkas itu lalu jalankan
`kg-salin.sh`. Bila `versi` dinaikkan di repositori, naikkan juga di sini.

Sejak saat itu situs menampilkan layar masuk sungguhan — akun demo dan
`demo1234` tidak lagi tampil maupun berlaku — dan seluruh layar membaca serta
menulis ke basis data. **Mode peragaan untuk klien pindah ke
`https://khongguan-demo.semestateknologiutama.com`** — salinan antarmuka saja
(`assets/`, `m/`, `index.html`, tanpa `api/`), dengan `konfigurasi.js` dari
repositori (`api: ''`). `kg-salin.sh` memperbaruinya bersama situs utama, jadi
peragaan selalu sama dengan versi yang terpasang. Sengaja subdomain terpisah,
bukan `/demo/` pada domain yang sama: antrean luring aplikasi lapangan
disimpan per domain, dan kiriman peragaan akan ikut terkirim ke peladen
sungguhan.

Karyawan diundang dari layar **Pengguna → Tambah Pengguna**. Selama surel
sistem belum dinyalakan, tautan undangan tampil di layar untuk diteruskan
administrator sendiri (surel kantor atau pesan pribadi, bukan grup).

## Menyalakan OIDC

Prasyarat: rincian OIDC Khong Guan Group (penerbit, client_id,
client_secret). Masuk dengan sandi tetap berlaku berdampingan. Lalu:

1. Isi bagian `oidc` pada `api/config.php` — tambahkan blok `'oidc' => [ … ]`
   mengikuti `config.contoh.php`, dengan `'aktif' => true`.
2. Tombol "Masuk dengan akun kantor" di layar masuk **belum dibangun**; sisi
   peladennya sudah jadi dan teruji (UJ-40 sampai UJ-50). Itu pekerjaan
   antarmuka yang tersisa sebelum OIDC dapat dipakai.

Sebelum OIDC siap, **jangan** menyalakan `izinkan_masuk_demo` di alamat
publik — lihat catatan keamanan di bawah.

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
