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
psql -d kg_safeguard -f api/migrasi/004_skema_lanjutan.sql
psql -d kg_safeguard -f api/migrasi/006_skema_kpi.sql
psql -d kg_safeguard -f api/migrasi/008_skema_oidc.sql
psql -d kg_safeguard -f api/migrasi/007_contoh.sql   # peragaan saja

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

`007_contoh.sql` mengisi basis data peragaan dengan isi yang sama persis
seperti purwarupa — dibangkitkan dari `assets/data.js`, bukan diketik ulang.
Ia menolak berjalan bila basis datanya sudah berisi catatan. Pada produksi,
jalankan 001, 002, 004, 006, dan 008 saja — data contoh dilewati.

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

### Uji asap antarmuka

```bash
node uji/layar.mjs                   # peladen harus sudah berjalan
```

Membuka 30 layar — seluruh rute aplikasi meja dan kelima tab aplikasi
lapangan — terhadap data sungguhan, dan gagal bila ada satu saja galat
JavaScript atau layar yang tergambar nyaris kosong.

Ia ada karena satu kejadian: kolom `observasi.kategori` dibuat boleh kosong,
keputusan yang benar karena observasi yang seluruh perilakunya aman memang
tidak punya kategori temuan. Tetapi `app.js` memanggil `toUpperCase()`
padanya, dan layar Observasi Perilaku berhenti tergambar. Ke-84 uji peladen
tetap lulus, dan perbandingan piksel tetap identik — keduanya menguji mode
peragaan. Hanya membuka layarnya dengan data sungguhan yang menemukannya.

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
src/Oidc.php           Masuk lewat direktori perusahaan (OpenID Connect)
src/Kpi.php            Perhitungan KPI, dipakai dua layar
src/Berkas.php         Penyimpanan foto dan berkas, tautan bertanda waktu
src/Pemberitahuan.php  Penyusunan pemberitahuan menurut AB-30 dan AB-31
src/Saluran.php        Antarmuka saluran kirim
src/SaluranSurel.php   SMTP langsung, tanpa pustaka
src/SaluranWhatsapp.php  Adaptor HTTP ke penyedia WhatsApp
src/Xlsx.php           Penulis .xlsx tanpa pustaka
tugas/                 Pekerjaan terjadwal (cron)
src/Wewenang.php       Penegakan peran dan cakupan pabrik
src/Jejak.php          Jejak audit
src/Nomor.php          Pembangkit nomor tampil
src/Aturan.php         Aturan bisnis yang tidak dapat ditegakkan basis data
src/Modul/             Satu berkas per modul

migrasi/               Skema, data acuan, dan data contoh
  001_skema.sql        Modul inti
  002_acuan.sql        Pabrik, area, peran, dan matriks hak akses
  004_skema_lanjutan.sql  Inspeksi, checklist, audit, risiko, lingkungan,
                       dokumen, regulasi, pelatihan, kegiatan, pemberitahuan
  006_skema_kpi.sql    Jam kerja, rekap awal, target KPI, program strategis
  007_contoh.sql       Data peragaan (dibangkitkan; bukan untuk produksi)
  008_skema_oidc.sql   Permintaan masuk dan simpanan kunci penerbit
  buat-contoh.mjs      Pembangkit 007 dari assets/data.js
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
| AB-08 Butir Tidak Sesuai mengunci unit | Pemicu `checklist_kunci_unit` | Balasan menyebut unit yang terkunci |
| AB-18 Temuan wajib punya CAPA | — | Penutupan audit menolak dan menyebut nomornya |
| AB-20 Dokumen Berlaku punya tinjau | `CHECK (status <> 'Berlaku' OR tinjau IS NOT NULL)` | Pesan dengan kode aturan |
| AB-21 Yang hampir habis lebih dulu | — | `ORDER BY berlaku` pada dokumen eksternal dan sertifikasi |
| AB-22 Regulasi butuh bukti | `CHECK (status <> 'Terpenuhi' OR bukti <> '')` | Pesan dengan kode aturan |
| AB-25 Jam pelatihan dari kegiatan | — | `sum(peserta × durasi_jam)`, tidak ada kolom untuk mengetiknya |
| AB-30 Tiga sebab pemberitahuan | `CHECK (sebab IN (…))` | Tidak ada nilai untuk "sekadar memberi tahu" |
| AB-31 Terbaca bukan selesai | Kolom `dibaca_pada` dan `selesai_pada` terpisah | Menandai terbaca tidak menutup |
| AB-19 Angka punya pembanding | `target_kpi.target` | Setiap kartu KPI membawa periode sebelumnya, target, atau akumulasi |
| AB-26 Lagging ≠ leading | `target_kpi.jenis` | Dua deret terpisah pada satu balasan; tidak pernah satu |
| AB-27 Rumus di tempatnya | `target_kpi.rumus` | Ikut pada setiap kartu, bukan di dokumen terpisah |
| AB-28 Grup tidak menutupi pabrik | — | Kartu pabrik dan angka grup dalam satu balasan; status = indikator terburuk |
| KNF-24 Jejak audit kekal | Pemicu + `REVOKE` | — |

Setiap penolakan membawa kode aturannya:

```json
{ "galat": { "kode": "ATURAN_DILANGGAR", "aturan": "AB-10",
  "pesan": "Izin tidak dapat diterbitkan: langkah 2 pada JSA-2026-002 berada di zona Ekstrem (skor sisa 16).",
  "rincian": { "langkah": 2, "skor_sisa": 16 } } }
```

## Angka yang dihitung dan angka yang dicatat

Hampir seluruh angka KPI diturunkan dari catatan yang sudah ada. Yang disimpan
hanya dua hal, dan keduanya punya alasan:

| Disimpan | Mengapa tidak dihitung |
|---|---|
| `jam_kerja_bulanan` | Jam kerja dan jumlah pekerja datang dari HRD; tidak ada modul QHSE yang mengetahuinya. Tanpa keduanya TRIR dan LTIFR tidak dapat dihitung |
| `rekap_awal_bulanan` | Bulan-bulan sebelum sistem berjalan. Grafik 12 bulan tidak dapat menunggu setahun, dan mengarang catatan insiden mundur berarti membuat jejak audit yang berbohong |
| `elemen_smk3` | Penilaian kriteria SMK3 adalah hasil audit manusia, bukan turunan dari catatan |

Setiap titik grafik dan setiap kartu KPI menyebutkan sumbernya (`rekaman` atau
`rekap_awal`). Bila dua periode yang dibandingkan berbeda sumbernya,
`banding_setara` bernilai `false` dan arah naik-turunnya tidak disimpulkan —
selisih antara angka yang dihitung sistem dan angka rekap bukan tren.

Satu hal yang sengaja **tidak** diperlakukan sebagai kabar baik: pabrik yang
tidak punya satu pun catatan pada periode berjalan. TRIR nol di sana berarti
tidak ada yang mencatat, bukan tidak ada kejadian, jadi kartunya berstatus
Perhatian dengan penentu "Tanpa catatan".

## Masuk

Dua jalur, dan hanya satu yang hidup pada produksi.

| Jalur | Kapan |
|---|---|
| `POST /sesi/oidc/mulai` lalu `/sesi/oidc/kembali` | Produksi. OpenID Connect, *authorization code* + PKCE |
| `POST /sesi/masuk-demo` | Pengembangan dan pengujian saja; hidup hanya bila `izinkan_masuk_demo` bernilai benar |

Tidak ada kolom kata sandi pada basis data, dan tidak ada endpoint yang
menerimanya. Seluruh pemeriksaan `id_token` dan alasannya ada pada
[docs/09](../docs/09-kebutuhan-nonfungsional.md#bagaimana-knf-18-ditegakkan);
uji UJ-40 sampai UJ-50 membuktikannya terhadap penerbit tiruan yang kuncinya
dibuat saat uji berjalan.

## Berkas dan foto

Berkas disimpan **di luar docroot** dan tidak pernah dilayani peladen web
langsung. Satu-satunya jalan mengambilnya adalah `GET /lampiran/{id}` dengan
tautan bertanda waktu yang berlaku 15 menit (KNF-25), dan endpoint itu
memeriksa dua hal: tanda tautannya, lalu hak akses pengguna atas catatan
induknya.

Tanda saja tidak cukup — tautan yang diteruskan lewat pesan akan tetap terbuka
bagi siapa pun yang menerimanya selama masih berlaku. Karena itu tanda
diikatkan pada pengguna yang memintanya.

Jenis berkas ditentukan dari **isinya**, bukan dari nama atau header yang
dikirim klien; keduanya dapat ditulis apa saja oleh pengirim. Nama berkas di
disk dibangkitkan peladen dan tidak pernah berasal dari pengguna.

## Pemberitahuan

```bash
php api/tugas/pemberitahuan.php     # dijalankan cron, 2× sehari
```

Menyusun pemberitahuan dari catatan yang ada, lalu mengirimkannya. Idempoten:
aman dijalankan tumpang tindih, dan indeks unik pada basis data menutup
kemungkinan dua salinan untuk satu tenggat yang sama.

| Aturan | Bagaimana ditegakkan |
|---|---|
| AB-30 · tiga sebab saja | Kolom `sebab` tidak punya nilai untuk "sekadar memberi tahu" |
| AB-31 · terbaca ≠ selesai | Dikirim ulang sekali sehari selama `selesai_pada` masih kosong; yang menutup adalah penyelesaian catatannya |
| AB-02 · kejadian Serius seketika | Dipanggil modul Insiden, bukan menunggu cron |

Tanpa saluran aktif, **tidak ada** yang ditandai terkirim. Menandainya berarti
pemberitahuan hari ini tidak akan pernah dikirim setelah SMTP dipasang besok.

Surel dikirim lewat SMTP langsung, bukan `mail()`: pada hosting bersama
`mail()` mengirim lewat alamat yang tidak punya SPF dan DKIM domain ini, dan
surelnya berakhir di folder sampah — yang berarti pemberitahuan tidak sampai,
tanpa ada yang tahu.

## Ekspor

| Alamat | Hasil |
|---|---|
| `GET /ekspor` | Daftar yang boleh diekspor peran ini |
| `GET /ekspor/{kode}/xlsx` | Berkas Excel, kepala dibekukan dan bersaring |
| `GET /ekspor/{kode}/cetak` | Halaman bergaya cetak; peramban menyimpannya sebagai PDF |

PDF tidak dibuat peladen. Menanam mesin PDF beserta hurufnya berarti satu
ketergantungan besar lagi, dan hasilnya tetap kalah rapi dibanding cetakan
peramban — yang sudah punya huruf, pemenggalan halaman, dan "Simpan sebagai
PDF" di semua sistem.

Setiap ekspor melewati pemeriksaan modul dan cakupan pabrik yang sama dengan
layarnya, dan tercatat pada `jejak_unduhan` — tabel terpisah dari `jejak_audit`
karena keduanya menjawab pertanyaan yang berbeda: apa yang berubah, dan siapa
mengambil apa keluar dari sistem.

> **Belum ada tombolnya.** Purwarupa tidak punya tombol ekspor pada layar mana
> pun. Menambahkannya mengubah tampilan, jadi ia menunggu keputusan. Alamat di
> atas sudah berjalan hari ini.

## Formulir benar-benar menulis

Purwarupa menampilkan pesan bernomor tetap saat formulir dikirim — tidak ada
yang tersimpan, karena tidak ada peladen di belakangnya. Lima belas formulir
kini menulis sungguhan dan menampilkan nomor dari peladen:

| Formulir | Endpoint | Formulir | Endpoint |
|---|---|---|---|
| Lapor Bahaya | `POST /bahaya` | Susun JSA | `POST /jsa` |
| Lapor Insiden | `POST /insiden` | Jadwalkan Induksi | `POST /induksi` |
| Observasi APD | `POST /observasi-apd` | Tambah Regulasi | `POST /regulasi` |
| Observasi Perilaku | `POST /observasi` | Mulai Inspeksi | `POST /inspeksi` |
| Aktivitas HIRADC | `POST /hiradc` | Mulai Checklist | `POST /checklist` |
| Risiko Baru | `POST /risiko` | Ajukan Izin Kerja | `POST /izin` |
| Unggah Kegiatan | `POST /kegiatan` | Jadwal Pelatihan | `POST /pelatihan` |
| Terbitkan Dokumen | `POST /dokumen/internal` | | |

Pembacaan formulir ada di `assets/sumber.js`, bukan di `app.js`: itulah lapisan
yang tahu bentuk yang diminta peladen, dan `app.js` tetap tidak tahu-menahu
soal peladen. Pada mode peragaan jalurnya mengembalikan null dan perilakunya
persis seperti purwarupa.

Setelah menyimpan, koleksi yang berubah dimuat ulang beserta tren, KPI, dan
dashboard eksekutif — papan yang menunjukkan sembilan sementara grafiknya masih
delapan membuat orang ragu simpanannya berhasil.

Penolakan aturan sampai ke pengisi lengkap dengan kode aturannya, bukan sekadar
"gagal menyimpan".

### Ketika peladen tidak menjawab

Aplikasi **tidak** diam-diam menampilkan data contoh sebagai catatan sungguhan.
Pada sistem K3 itu kegagalan terburuk yang mungkin: orang mengambil keputusan
dari angka yang tidak pernah ada.

| Keadaan | Yang terjadi |
|---|---|
| Belum masuk | Senyap. Layar masuk yang tampil berikutnya adalah jawabannya |
| Sesi berakhir di tengah jalan | Token dihapus, pesan "Sesi berakhir", kembali ke layar masuk |
| Sebagian modul gagal diambil | Modul itu memakai data contoh, dan namanya disebutkan: "2 modul memakai data contoh karena peladen tidak menjawab: hiradc, regulasi." |

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
| Tombol ekspor pada layar | Purwarupa tidak punya tombolnya; menambahkannya mengubah tampilan, jadi menunggu keputusan |
| APK Android | Perlu JDK, Android SDK, dan kunci penanda tangan milik STU |
| Modul selain yang sudah tersambung | Tahap 3, urutan pada [docs/12](../docs/12-rencana-rilis.md) |
| Penyimpanan objek untuk foto | Tahap 2 |
| Pemberitahuan surel dan dorong | Tahap 3; penerima sudah ditentukan (AB-02), pengirimannya belum |
| Ekspor PDF dan Excel | Tahap 3 |
