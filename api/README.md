# Peladen KG SafeGuard

API untuk sistem QHSE Khong Guan Group. PHP 8.2+ dan PostgreSQL, tanpa
kerangka dan tanpa tahap build — sama seperti antarmukanya, dan karena alasan
yang sama: satu berkas yang dapat dibaca apa adanya lebih mudah dirawat tiga
tahun lagi daripada rantai pasok yang versinya harus dijaga selama masa
dukungan.

## Menjalankan saat pengembangan

```bash
# 1 · basis data
createdb kg_safeguard
psql -d kg_safeguard -f api/migrasi/001_skema.sql
psql -d kg_safeguard -f api/migrasi/002_acuan.sql
psql -d kg_safeguard -f api/migrasi/003_contoh.sql   # peragaan saja

# 2 · konfigurasi
cp api/config.contoh.php api/config.php     # lalu sesuaikan isinya

# 3 · peladen
php -S 127.0.0.1:8150 -t . /path/ke/router.php
```

Antarmuka diarahkan ke peladen lewat `assets/konfigurasi.js`:

```js
window.KG_KONFIG = { api: 'http://127.0.0.1:8150', versi: '3' };
```

Dikosongkan berarti mode peragaan dengan data contoh — persis seperti
purwarupa.

`003_contoh.sql` mengisi basis data peragaan dengan isi yang sama persis
seperti purwarupa — dibangkitkan dari `assets/data.js`, bukan diketik ulang.
Ia menolak berjalan bila basis datanya sudah berisi catatan. Pada produksi,
jalankan 001 dan 002 saja.

## Menjalankan pengujian

```bash
createdb kg_safeguard_uji
php api/uji/jalankan.php
```

Basis data uji dibuat ulang setiap kali dijalankan. Uji memanggil lapisan yang
sama dengan yang dijalankan peladen, bukan tiruannya.

Nama basis datanya wajib berakhiran `_uji`, dan pelari uji memaksa
konfigurasinya sendiri alih-alih membaca `config.php`. Dua penjagaan itu ada
karena sebabnya pernah terjadi: `config.php` mengalahkan peubah lingkungan,
sehingga menjalankan uji menyiapkan ulang skema pada basis data pengembangan.

## Susunan

```
index.php              Satu pintu masuk; router dan penanganan galat
.htaccess              Pengarahan permintaan; menutup config.php
config.contoh.php      Contoh konfigurasi (config.php tidak masuk repositori)

src/muat.php           Pemuat kelas, daftar rute, terjemahan galat basis data
src/Konfigurasi.php    Konfigurasi dari berkas atau peubah lingkungan
src/Db.php             Sambungan PDO dan transaksi
src/Permintaan.php     Pembacaan permintaan dan pemeriksaan isian
src/Jawab.php          Bentuk balasan JSON baku
src/Galat.php          Galat, termasuk penolakan aturan dengan kode AB-xx
src/Rute.php           Router
src/Sesi.php           Sesi dan pengguna yang sedang masuk
src/Wewenang.php       Penegakan peran dan cakupan pabrik
src/Jejak.php          Jejak audit
src/Nomor.php          Pembangkit nomor tampil
src/Aturan.php         Aturan bisnis yang tidak dapat ditegakkan basis data
src/Modul/             Satu berkas per modul

migrasi/               Skema, data acuan, dan data contoh
uji/                   Pelari uji dan kasusnya
```

## Di mana aturan ditegakkan

Aturan bisnis ([docs/03](../docs/03-aturan-bisnis.md)) ditegakkan di **dua**
tempat, dan itu disengaja:

| Lapis | Tugasnya |
|---|---|
| Basis data | Jaring terakhir. Menutup jalur yang terlewat: skrip impor, perbaikan manual, modul yang ditulis kemudian |
| Aplikasi | Memberi pesan yang enak dibaca beserta kode aturannya, supaya pengguna tahu apa yang harus diperbaiki |

Aturan yang hanya dijaga aplikasi akan dilanggar oleh skrip impor pertama yang
menulis langsung ke tabel.

| Aturan | Basis data | Aplikasi |
|---|---|---|
| AB-01 CAPA punya induk | `sumber_id NOT NULL` | Memeriksa catatan sumber benar-benar ada |
| AB-04 Anonim tanpa identitas | `CHECK (NOT anonim OR pelapor_id IS NULL)` | Tidak mengisi pelapor |
| AB-07 Patuh ≤ diamati | `CHECK (patuh <= diamati)` | Pesan dengan angkanya |
| AB-17 Bukan verifikasi sendiri | `CHECK (verifikator_id <> pj_id)` | Pesan yang menjelaskan sebabnya |
| AB-24 Ambang induksi | `CHECK (nilai >= 80 OR status = 'Tidak Lulus')` | Menghitung status |
| AB-09/10/11 Penerbitan izin | `CHECK (status <> 'Aktif' OR jsa_id IS NOT NULL)` | Seluruh pemeriksaan |
| AB-11 Kartu induksi wajib bertanggal | `CHECK (status = 'Tidak Lulus' OR berlaku IS NOT NULL)` | Masa berlaku dihitung, tidak diisi tangan |
| AB-13 Risiko memakai nilai tertinggi | — | `max(skor)` antar langkah JSA |
| AB-15 Skor sisa HIRADC | — | Kendali tambahan wajib Selesai |
| AB-34 Hierarki pengendalian | — | Menandai JSA yang seluruh kendalinya APD |
| KNF-24 Jejak audit kekal | Pemicu + `REVOKE` | — |

Setiap penolakan membawa kode aturannya:

```json
{ "galat": { "kode": "ATURAN_DILANGGAR", "aturan": "AB-10",
  "pesan": "Izin tidak dapat diterbitkan: langkah 2 pada JSA-2026-002 berada di zona Ekstrem (skor sisa 16).",
  "rincian": { "langkah": 2, "skor_sisa": 16 } } }
```

## Kosakata mengikuti purwarupa

Nilai status, kategori, dan jenis ditulis **persis** seperti purwarupa —
`Terbuka` / `Diverifikasi` / `Ditangani` untuk laporan bahaya, `Listrik / LOTO`
untuk jenis izin, dan seterusnya. Kosakata yang berbeda membuat kolom papan
kosong dan chip kehilangan warnanya di antarmuka, dan itu perubahan tampilan.

Bila kosakata perlu berubah, yang diubah adalah purwarupa dan peladen
bersamaan, bukan salah satunya.

## Yang belum ada

| Hal | Rencana |
|---|---|
| Autentikasi direktori perusahaan (OIDC) | Tahap 2; jalur masuk demo sementara, dimatikan pada produksi |
| Modul selain sepuluh yang sudah tersambung | Tahap 3, urutan pada [docs/12](../docs/12-rencana-rilis.md) |
| Penyimpanan objek untuk foto | Tahap 2 |
| Pemberitahuan surel dan dorong | Tahap 3; penerima sudah ditentukan (AB-02), pengirimannya belum |
| Ekspor PDF dan Excel | Tahap 3 |
