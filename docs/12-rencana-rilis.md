# 12 · Rencana rilis

## Lima tahap

Urutan disusun supaya sistem sudah dipakai orang sebelum seluruh modul selesai —
bukan diserahkan sekaligus di akhir, ketika salah paham sudah terlanjur
terbangun di semua modul.

| Tahap | Isi | Perkiraan |
|---|---|---|
| 1 | Analisis dan penyesuaian | 2–3 minggu |
| 2 | Peladen, basis data, autentikasi | 4–6 minggu |
| 3 | Penyambungan modul dan aplikasi lapangan | 4–6 minggu |
| 4 | Uji coba di satu pabrik | 3–4 minggu |
| 5 | Penyebaran seluruh pabrik dan serah terima | 3–4 minggu |

**16 sampai 23 minggu** sejak penandatanganan sampai seluruh pabrik berjalan.
Tahap 2 dan 3 sebagian dapat berjalan berdampingan bila keputusan dan akses
direktori perusahaan tersedia tepat waktu — yang paling sering memperlambat
proyek seperti ini bukan pemrogramannya, melainkan menunggu keputusan.

---

## Tahap 1 · Analisis dan penyesuaian

| Kegiatan | Keluaran |
|---|---|
| Pemetaan struktur organisasi, pabrik, area, dan peran sebenarnya | Data acuan awal |
| Peninjauan prosedur K3 dan formulir yang berlaku | Daftar penyesuaian terhadap dokumen 02 dan 03 |
| Penyesuaian matriks risiko, kategori bahaya, daftar peraturan | Dokumen 03 dan 05 versi 2.0 |
| Penetapan masa simpan data bersama bagian hukum | Tabel retensi mengikat pada dokumen 05 |
| Keputusan tumpukan teknologi bila berbeda dari usulan | Dokumen 07 versi 2.0 |

**Kriteria selesai.** Seluruh dokumen 01–13 naik ke versi 2.0 dan ditandatangani
kedua pihak. Tanpa itu, tahap 2 tidak dimulai.

## Tahap 2 · Peladen, basis data, autentikasi

| Kegiatan | Keluaran |
|---|---|
| Rancangan basis data beserta jejak audit | Skema + migrasi |
| API untuk seluruh modul | API berjalan + dokumentasi |
| Penyambungan direktori perusahaan | Masuk dengan akun perusahaan |
| Penyimpanan objek untuk berkas dan foto | Unggah dan unduh berjalan |
| Uji aturan bisnis UJ-01 … UJ-20 | Seluruhnya lulus |

**Kriteria selesai.** Aturan bisnis ditegakkan di API, dibuktikan kasus uji,
sebelum satu pun layar disambungkan. Aturan yang ditambahkan belakangan selalu
menemukan data yang sudah terlanjur melanggarnya.

## Tahap 3 · Penyambungan modul dan aplikasi lapangan

| Kegiatan | Keluaran |
|---|---|
| Seluruh modul membaca dan menulis ke peladen | 25 modul berjalan dengan data sungguhan |
| Sinkronisasi antrean aplikasi lapangan | Uji UJ-28 … UJ-36 lulus |
| Pemberitahuan surel, pesan, dan dorong | Terkirim sesuai AB-30 |
| Ekspor PDF dan Excel | Berjalan sebagai pekerjaan latar |
| Kompilasi APK Android bila diminta | APK tertanda tangan |

**Urutan penyambungan modul.** Dari yang paling banyak dipakai ke yang paling
jarang, supaya cacat terbanyak ditemukan paling awal:

1. Laporan Bahaya, Insiden, Safety Checklist, CAPA
2. Inspeksi, Observasi, Izin Kerja, JSA, HIRADC
3. Audit, Environment, Risiko, Dokumen, Regulasi, Induksi
4. Pelatihan, Kegiatan, KPI, Dashboard, Eksekutif
5. Notifikasi, Pengguna, Pengaturan, Asisten

## Keadaan saat ini

Tahap 2 dan sebagian besar tahap 3 sudah dikerjakan, mendahului tahap 1 —
sebuah pilihan yang perlu disebutkan terus terang, bukan disembunyikan di
catatan kaki.

| Sudah | Belum |
|---|---|
| Skema, migrasi, dan jejak audit yang tidak dapat diubah | Tahap 1: analisis bersama Khong Guan Group |
| API seluruh modul rekaman, KPI, dan Dashboard Eksekutif | Penyimpanan objek untuk berkas dan foto |
| Masuk lewat direktori perusahaan (OIDC + PKCE) | Pengiriman pemberitahuan surel, pesan, dan dorong |
| Sinkronisasi antrean aplikasi lapangan | Ekspor PDF dan Excel |
| Asisten QHSE bekerja di atas catatan sungguhan | Kompilasi APK Android |
| 84 kasus uji, seluruhnya lulus | |

**Risiko yang ditanggung.** Skema, kosakata, dan matriks peran bersandar pada
asumsi yang tertulis di `docs/`, bukan pada keputusan Khong Guan Group. Yang
biasanya berubah setelah analisis adalah nama kolom dan nilai acuan, bukan
bentuk sistemnya — tetapi itu tetap risiko, dan menerimanya adalah keputusan
CV. Semesta Teknologi Utama, bukan kesimpulan yang boleh diambil diam-diam.

**Pertentangan di dalam purwarupa yang sudah ditemukan** dan menunggu keputusan
tahap 1:

| Hal | Tercatat di |
|---|---|
| Operator: matriks hak akses menyebut boleh membaca CAPA, daftar modulnya tidak | [docs/04](04-peran-dan-hak-akses.md) |
| Pengesah JSA: kartu layar menyebut QHSE Supervisor, matriksnya tidak | [docs/04](04-peran-dan-hak-akses.md) |
| Dua kosakata kategori bahaya dan jenis izin antara aplikasi meja dan lapangan | [docs/08](08-aplikasi-lapangan.md) |
| Angka ringkasan audit tidak cocok dengan daftar temuannya | [docs/05](05-model-data.md) |

## Tahap 4 · Uji coba di satu pabrik

Satu pabrik dipilih bersama; Cibitung menjadi calon utama karena dipakai sebagai
dasar purwarupa.

| Kegiatan | Keluaran |
|---|---|
| Pelatihan pengguna menurut peran | Lima sesi, satu per peran |
| Pemindahan data historis | Data masuk, terverifikasi jumlahnya |
| Pemakaian sungguhan satu bulan | Catatan cacat dan usulan perbaikan |
| UAT oleh kelima peran | Berita acara penerimaan |

**Kriteria selesai.** UAT diterima tertulis oleh perwakilan kelima peran, dan
kriteria keluar pada [11](11-rencana-pengujian.md) terpenuhi.

## Tahap 5 · Penyebaran dan serah terima

| Kegiatan | Keluaran |
|---|---|
| Penyebaran ke pabrik berikutnya, satu per satu | Seluruh pabrik berjalan |
| Penyerahan kode sumber dan dokumentasi | Repositori + panduan pemasangan |
| Panduan pengguna per peran | Lima dokumen singkat |
| Pendampingan masa tenang 4 minggu | Catatan penanganan |
| Uji pemulihan dari cadangan | Berita acara |

Penyebaran satu per satu, bukan serentak. Pabrik kedua memakai pelajaran dari
pabrik pertama; penyebaran serentak membuang pelajaran itu.

---

## Pelatihan

| Peran | Durasi | Isi |
|---|---|---|
| Operator Produksi | 1 jam | Aplikasi lapangan: melapor, checklist, membaca rujukan |
| QHSE Supervisor | 4 jam | Seluruh modul operasional, verifikasi, izin kerja, CAPA |
| Petugas Lingkungan | 2 jam | Environment, dokumen eksternal, pelaporan wajib |
| Plant Manager | 1 jam | Dashboard eksekutif, persetujuan, membaca KPI |
| Administrator Sistem | 3 jam | Pengguna, peran, data acuan, pemantauan |

Pelatihan Operator paling singkat dan paling penting. Bila aplikasi lapangan
memerlukan lebih dari satu jam untuk dijelaskan, rancangannya yang keliru.

## Migrasi data

| Sumber | Sasaran | Ketentuan |
|---|---|---|
| Berkas Excel catatan insiden | `insiden` | Wajib ada tanggal, area, jenis, keparahan |
| Register risiko | `risiko` | Skor dipetakan ke matriks 5×5 (AB-14) |
| Daftar dokumen internal | `dokumen_internal` | Dokumen tanpa tanggal tinjau masuk berstatus perlu ditinjau |
| Register peraturan | `regulasi` | Kolom bukti kosong berarti belum terpenuhi (AB-22) |
| Rekaman induksi | `induksi` | Kartu yang sudah lewat masuk berstatus Kedaluwarsa |

Tiga ketentuan yang mengikat:

1. Data yang tidak memenuhi aturan bisnis **tidak dipaksa masuk**. Ia masuk
   dengan status yang menunjukkan kekurangannya, supaya terlihat dan diperbaiki.
2. Migrasi dijalankan dua kali: sekali uji coba di lingkungan uji dengan
   laporan selisih, sekali sungguhan.
3. Data dari kertas atau PDF pindaian di luar lingkup ([01](01-ikhtisar-produk.md)).

## Kriteria penerimaan akhir

| # | Kriteria |
|---|---|
| 1 | Seluruh kebutuhan bertanda **harus** pada [02](02-kebutuhan-fungsional.md) terpenuhi |
| 2 | Seluruh aturan pada [03](03-aturan-bisnis.md) ditegakkan dan dibuktikan kasus uji |
| 3 | Seluruh kebutuhan nonfungsional pada [09](09-kebutuhan-nonfungsional.md) terpenuhi dan terukur |
| 4 | Kriteria keluar pengujian pada [11](11-rencana-pengujian.md) terpenuhi |
| 5 | Kode sumber dan dokumentasi teknis diserahkan |
| 6 | Kelima panduan pengguna diserahkan |
| 7 | Uji pemulihan dari cadangan berhasil |

## Risiko proyek

| Risiko | Dampak | Penanganan |
|---|---|---|
| Keputusan tahap 1 tertunda | Seluruh jadwal mundur | Satu penanggung jawab berwenang (A1); tenggat keputusan disepakati di awal |
| Akses direktori perusahaan terlambat | Autentikasi tertunda | Autentikasi sementara basis data lokal, diganti kemudian (A2) |
| Prosedur K3 berbeda jauh dari purwarupa | Penyesuaian besar pada modul | Tahap 1 diperpanjang, bukan tahap 3 dipersempit |
| Data historis tidak terbaca mesin | Sistem mulai dari kosong | Disepakati di awal; bukan penambahan lingkup di tengah |
| Perangkat lapangan tidak memenuhi minimum | Sebagian pekerja tidak dapat memasang | Pendataan perangkat pada tahap 1 |
| Pekerja enggan memakai aplikasi | Pelaporan tidak naik | Operator dilibatkan sejak tahap 4; angka pelaporan dipantau mingguan |

Risiko terakhir yang paling sering diremehkan. Sistem pelaporan yang tidak
dipakai pekerja adalah sistem yang gagal, betapa pun lengkap modulnya.
