# 01 · Ikhtisar produk

## Masalah yang diselesaikan

Sistem manajemen QHSE jarang gagal karena kekurangan modul. Yang lebih sering
terjadi adalah empat hal berikut, dan sistem ini dirancang untuk masing-masing.

| # | Masalah | Akibatnya hari ini |
|---|---|---|
| M1 | Catatan tersebar di banyak berkas | Membuktikan satu temuan sudah ditutup berarti menyusun ulang dari beberapa sumber |
| M2 | Angka grup menutupi sebaran antarpabrik | Manajemen melihat angka yang lolos padahal risikonya terpusat di satu pabrik |
| M3 | Pelaporan bergantung pada kemauan menulis | Nyaris celaka paling jarang dilaporkan, padahal paling murah diperbaiki |
| M4 | Kepatuhan dibuktikan menjelang audit | Register peraturan berisi daftar pasal tanpa bukti penerapan |

## Sasaran produk

Sasaran ditulis sebagai hasil yang dapat diukur, bukan sebagai daftar fitur.

| Kode | Sasaran | Cara mengukur |
|---|---|---|
| S1 | Setiap catatan QHSE punya satu tempat dan satu nomor | Tidak ada modul yang menyimpan salinan catatan modul lain |
| S2 | Setiap temuan berakhir pada CAPA bertenggat | Jumlah temuan Major/Minor tanpa CAPA = 0 |
| S3 | Melapor dari lapangan selesai dalam 30 detik | Waktu dari buka aplikasi sampai terkirim, diukur saat uji coba |
| S4 | Aturan K3 ditolak sistem, bukan diingatkan | Daftar aturan pada [03](03-aturan-bisnis.md) seluruhnya berupa penolakan |
| S5 | Kepatuhan terbukti sewaktu-waktu | Setiap peraturan punya kolom penerapan dan bukti terisi |
| S6 | Kinerja terbaca per pabrik | Kartu skor pabrik selalu tampil berdampingan dengan angka grup |

## Pengguna dan kepentingannya

| Peran | Jumlah perkiraan | Yang dikerjakan sehari-hari | Yang paling dipedulikan |
|---|---|---|---|
| Operator Produksi | Terbanyak | Checklist shift, lapor bahaya, lapor nyaris celaka | Cepat selesai, tidak menyalahkan orang |
| QHSE Supervisor | Beberapa per pabrik | Verifikasi laporan, investigasi, izin kerja, CAPA, audit | Tidak ada yang lolos tanpa tindak lanjut |
| Petugas Lingkungan | 1–2 per pabrik | Pemantauan limbah, emisi, air; pelaporan wajib | Nilai terukur selalu punya baku mutu pembanding |
| Plant Manager | 1 per pabrik | Persetujuan, keputusan, tinjauan kinerja | Melihat pabriknya sendiri, bukan rata-rata grup |
| Administrator Sistem | 1–2 pusat | Pengguna, peran, data acuan | Jejak perubahan lengkap |

Peran auditor eksternal **tidak** diberi akun. Bukti disiapkan dengan ekspor
dari modul terkait; memberi akses tulis kepada pihak luar akan merusak nilai
jejak auditnya.

## Ruang lingkup

### Termasuk

- 25 modul aplikasi meja seperti dirinci pada [02](02-kebutuhan-fungsional.md).
- Aplikasi lapangan berbasis web yang dapat dipasang di Android, bekerja tanpa
  sinyal, dengan lima jenis laporan dan empat rujukan K3.
- Peladen, basis data, API, dan autentikasi terhadap direktori perusahaan.
- Pemberitahuan surel dan pesan; pemberitahuan dorong untuk kejadian Serius.
- Ekspor PDF dan Excel.
- Dua bahasa (Indonesia, Inggris) dan dua tema (terang, gelap).

### Tidak termasuk

Hal-hal berikut sengaja dikeluarkan dari lingkup. Menyatakannya di awal lebih
murah daripada menemukannya di tengah proyek.

- Pengadaan perangkat keras, telepon lapangan, dan perangkat jaringan.
- Penyambungan ke ERP, HRIS, SCADA, atau sistem produksi.
- Konsultansi sistem manajemen K3 dan pendampingan sertifikasi.
- Pemindahan data dari dokumen kertas atau PDF hasil pindaian.
- Aplikasi iOS. Aplikasi lapangan tetap dapat dibuka dari Safari, tetapi
  pemasangan dan perilaku luringnya tidak dijamin setara Android.
- Tanda tangan digital tersertifikasi. Persetujuan dicatat sebagai jejak
  pengguna, bukan sebagai tanda tangan elektronik berbadan hukum.

## Batasan yang diketahui pada purwarupa

Purwarupa yang berjalan sekarang bukan sistem produksi. Empat hal berikut belum
ada dan menjadi pekerjaan utama tahap 2–3.

| Hal | Keadaan purwarupa | Yang harus dibangun |
|---|---|---|
| Peladen | Tidak ada | API + basis data |
| Data | Berkas contoh di dalam peramban | Basis data dengan jejak audit |
| Autentikasi | Akun demo tertulis di kode | Direktori perusahaan (SSO/LDAP) |
| Aplikasi Android | Konfigurasi TWA belum dikompilasi | APK/AAB tertanda tangan |

## Asumsi

| Kode | Asumsi | Bila tidak terpenuhi |
|---|---|---|
| A1 | Tersedia satu penanggung jawab proyek yang berwenang memutuskan | Jadwal tahap 1 melar; keputusan menumpuk |
| A2 | Akses ke direktori perusahaan diberikan pada tahap 2 | Autentikasi sementara memakai basis data lokal, diganti kemudian |
| A3 | Prosedur K3 dan formulir yang berlaku dapat ditinjau | Struktur data memakai bawaan purwarupa, berisiko tidak cocok |
| A4 | Data historis tersedia dalam bentuk terbaca mesin | Sistem mulai dari data kosong |
| A5 | Pekerja lapangan memakai Android 8 ke atas dengan Chrome | Sebagian perangkat tidak dapat memasang aplikasi lapangan |

## Empat pabrik sebagai dasar perancangan

Purwarupa memakai empat pabrik sebagai contoh. Angkanya rekaan; strukturnya yang
dipakai sebagai dasar perancangan dan akan disesuaikan pada tahap 1.

| Pabrik | Pekerja (contoh) | Catatan |
|---|---|---|
| Cibitung | 412 | Dipakai sebagai pabrik utama purwarupa |
| Bekasi | 298 | |
| Semarang | 214 | |
| Medan | 147 | |

Dua belas area kerja per pabrik, dari Mixing sampai TPS Limbah B3. Daftar area
adalah data acuan yang dapat diubah administrator, bukan nilai tetap di kode.
