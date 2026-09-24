# 08 · Aplikasi lapangan

Bagian terpenting dari sistem ini bukan yang ada di kantor. Laporan bahaya yang
butuh lima menit dan sinyal yang stabil adalah laporan yang tidak pernah
ditulis.

## Keadaan pemakaian yang menjadi dasar rancangan

| Keadaan | Akibat pada rancangan |
|---|---|
| Satu tangan memegang telepon | Sasaran ketuk besar; tombol utama mudah dijangkau ibu jari |
| Sarung tangan belum dilepas | Tidak ada gerak geser presisi; semuanya ketukan |
| Sinyal hilang di gudang dan sekitar boiler | Seluruh isi rujukan tersimpan di perangkat |
| Layar terang di bawah matahari | Kontras teks memenuhi WCAG AA pada mode terang |
| Shift malam di ruang kendali | Mode gelap mengikuti pengaturan perangkat |
| Perangkat dipakai bergantian | Keluar membersihkan seluruh keadaan tampilan |

## Bentuk penyebaran

| Bentuk | Cara pasang | Kapan dipakai |
|---|---|---|
| PWA | Chrome → menu → Pasang aplikasi | Bawaan. Tidak perlu toko aplikasi, pembaruan langsung sampai |
| APK / AAB (TWA) | MDM perusahaan atau Google Play | Bila perusahaan mewajibkan penyebaran terkelola |

APK dibangun dengan Trusted Web Activity: aplikasi memuat alamat yang sama,
sehingga tidak ada cabang kode Android yang harus dijaga sejalan. Perbaikan yang
dipasang di peladen langsung sampai ke perangkat tanpa menunggu persetujuan toko
aplikasi.

Yang **tidak** diberikan TWA: notifikasi dorong latar belakang yang benar-benar
asli, integrasi pemindai kode batang perangkat keras, dan penyimpanan di luar
kuota peramban. Bila ketiganya diperlukan, jalur yang tepat adalah aplikasi
native — keputusan yang lebih besar daripada pembungkus, dan di luar lingkup ini.

## Struktur layar

| Tab | Isi |
|---|---|
| Beranda | Angka hari tanpa kecelakaan, tombol Lapor Bahaya, menu ikon seluruh fitur, tugas hari ini, laporan saya |
| Lapor | Lima formulir pelaporan dan antrean kirim |
| Tugas | Checklist shift dan CAPA milik pengguna |
| Panduan | Pencarian seluruh sistem + empat rujukan K3 |
| Saya | Profil, status sinkronisasi, tema, bahasa, tautan ke aplikasi meja |

### Menu ikon di Beranda

Dua belas petak, empat per baris, disaring menurut peran (AB-32). Di lapangan,
fitur yang tidak terlihat sama dengan fitur yang tidak ada — karena itu tidak
ada yang disembunyikan di balik tab yang harus dibuka lebih dulu.

Lebar petak minimum 76px pada layar 360px, supaya sasaran ketuk memenuhi anjuran
44px dan label tetap utuh dalam dua baris tanpa dipotong, baik dalam bahasa
Indonesia maupun Inggris.

## Lima formulir pelaporan

| Formulir | Isian wajib | Aturan yang ditegakkan |
|---|---|---|
| Lapor Bahaya | Area, satu kalimat | — |
| Lapor Insiden | Jenis, area, kronologi | AB-02 bila keparahan Serius |
| Observasi Perilaku | Area, perilaku aman, catatan | AB-06 |
| Observasi APD | Area, jumlah diamati, jumlah patuh, catatan | AB-06, AB-07 |
| Ajukan Izin Kerja | Jenis, area, uraian pekerjaan, pengawas | AB-12 |

Ketiga formulir pelaporan kejadian menerima foto dan titik lokasi sebagai isian
opsional. Foto diperkecil di perangkat sebelum disimpan. Akurasi GPS ditulis apa
adanya dalam meter — pembaca laporan berhak tahu seberapa tepat titik itu,
bukan diberi titik yang terlihat pasti padahal tidak.

## Empat rujukan yang terbaca tanpa sinyal

| Rujukan | Isi | Peran yang membuka |
|---|---|---|
| Analisis JSA | Daftar JSA berlaku, langkah kerja, pengendalian, skor awal dan sisa | Sesuai matriks |
| HIRADC K3 | Aktivitas dinilai, kategori sumber bahaya, penilaian awal dan sisa | Sesuai matriks |
| Induksi K3 | Kartu induksi pengguna, delapan materi wajib | Sesuai matriks |
| Regulasi K3 | Peraturan berlaku, pasal, penerapan, bukti, status | Sesuai matriks |

Semuanya sudah tersimpan di perangkat, jadi terbaca justru ketika sinyal mati —
saat pekerja paling perlu membacanya.

## Perilaku luring

### Yang harus tetap bekerja tanpa sinyal

| Kemampuan | Wajib |
|---|---|
| Membuka aplikasi | Ya |
| Membaca empat rujukan | Ya |
| Mencari di seluruh isi tersimpan | Ya |
| Membuat kelima jenis laporan | Ya |
| Mengambil foto dan titik lokasi | Ya |
| Mengerjakan checklist | Ya |
| Melihat antrean sendiri | Ya |
| Melihat catatan pengguna lain | Tidak |
| Melihat KPI mutakhir | Tidak |

### Antrean dan pengiriman

1. Laporan disimpan di perangkat lebih dulu, selalu, baik ada sinyal maupun
   tidak. Menyimpan dulu baru mengirim membuat perilakunya sama pada kedua
   keadaan, dan perilaku yang sama lebih mudah dipercaya pekerja.
2. Antrean terkirim otomatis saat sinyal kembali, dan dapat dikirim manual.
3. Pengiriman idempoten: mengirim ulang antrean yang sama tidak menggandakan
   catatan (lihat [06](06-spesifikasi-api.md)).
4. Sebagian berhasil adalah hasil yang sah; hanya kiriman berstatus `diterima`
   yang dihapus dari antrean.
5. Kiriman yang ditolak tetap di perangkat beserta alasan dan kode aturannya.

### Penyimpanan perangkat

| Hal | Ketentuan |
|---|---|
| Rujukan luring | Diperbarui saat ada sinyal; memakai `?sejak=` supaya hanya perubahan yang diunduh |
| Foto tersimpan | 20 terbaru. Selebihnya dilepas, laporannya tetap utuh |
| Bila kuota penuh | Foto terlama dilepas lebih dulu, dan pengguna diberi tahu apa adanya |
| Keluar akun | Antrean yang belum terkirim tetap disimpan, keadaan tampilan dibersihkan |

Laporan lebih penting daripada fotonya. Melepas foto lalu memberi tahu lebih
baik daripada menolak menyimpan laporan.

## Pembaruan sampai ke perangkat

Pelajaran dari purwarupa, ditulis supaya tidak terulang:

| Masalah | Penyebab | Ketentuan |
|---|---|---|
| Fitur baru tidak muncul di perangkat yang sudah memasang aplikasi | Pekerja layanan menyajikan simpanan lebih dulu | Setiap berkas pendukung dipanggil dengan penanda `?v=` yang dinaikkan tiap rilis |
| Pekerja layanan lama bertahan berhari-hari | Peladen melayani `sw.js` dengan masa simpan panjang | Pendaftaran pekerja layanan ikut memakai penanda versi |
| Salinan ganda memenuhi penyimpanan | Penanda pada halaman dan pada daftar berkas inti tidak cocok | Penanda ditetapkan satu tempat dan dipakai keduanya |

Halaman induk diambil dari jaringan lebih dulu, sehingga penanda versi baru
cukup untuk membuat seluruh berkas ikut diambil ulang pada bukaan pertama —
bukan bukaan kedua. Pengguna tidak boleh dibebani menghapus data aplikasi.

## Izin perangkat

| Izin | Kapan diminta | Bila ditolak |
|---|---|---|
| Kamera | Saat pengguna menekan kotak foto | Laporan tetap dapat dikirim tanpa foto |
| Lokasi | Saat pengguna menekan "Ambil" | Laporan tetap dapat dikirim tanpa titik lokasi |
| Pemberitahuan | Setelah laporan pertama berhasil terkirim | Pemberitahuan hanya tampil di dalam aplikasi |

Tidak ada izin yang diminta saat aplikasi pertama dibuka. Permintaan izin
sebelum pengguna tahu gunanya adalah cara tercepat mendapat penolakan permanen.

## Kebutuhan perangkat minimum

| Hal | Minimum |
|---|---|
| Sistem | Android 8.0 |
| Peramban | Chrome 90 ke atas |
| Layar | Lebar 360px |
| Penyimpanan bebas | 60 MB |
| Jaringan | Tidak wajib setelah pemasangan pertama |

Perangkat iOS dapat membuka aplikasi lewat Safari, tetapi pemasangan dan
perilaku luringnya tidak dijamin setara dan berada di luar lingkup
([01](01-ikhtisar-produk.md)).


## Pengiriman antrean ke peladen

Antrean di perangkat dikirim ke `POST /api/v1/lapangan/kirim` sebagai satu
permintaan berisi seluruh butir yang menunggu. Peladen menjawab per butir,
bukan satu jawaban untuk seluruh antrean.

| Jawaban | Yang terjadi di perangkat |
|---|---|
| `diterima` | Status menjadi Terkirim, dan nomor resmi dari peladen disimpan berdampingan dengan nomor sementara |
| `ditolak` | Status menjadi Ditolak, beserta kode aturan dan alasannya. Laporan **tidak** dihapus |
| Tidak ada jawaban | Antrean tetap utuh dan dicoba lagi nanti |

Laporan yang ditolak tetap tersimpan dan berwarna merah pada daftar. Laporan
yang hilang diam-diam lebih buruk daripada laporan yang ditolak dengan alasan:
petugas perlu tahu apa yang harus diperbaiki, dan kode aturannya menyebutkannya.

### Keidempotenan

Kunci di peladen adalah pasangan `(perangkat_id, id_lokal)`. `perangkat_id`
dibuat sekali pada perangkat dan **tidak pernah berubah**, termasuk saat
petugas keluar dari aplikasi — penanda baru membuat antrean lama terkirim ulang
sebagai catatan kedua. `id_lokal` adalah nomor sementara yang sudah tertera di
layar petugas, dan peladen menyimpannya sebagai `nomor_asal` supaya laporan
tetap dapat dilacak ke perangkat asalnya.

Antrean yang terkirim dua kali karena sinyal putus di tengah jalan menerima
jawaban yang sama persis, ditandai `diulang`.

### Dua kosakata, satu sistem

Layar lapangan menulis "Kondisi Tidak Aman"; basis data menyimpan "Unsafe
Condition". Layar lapangan menulis "Panas"; tabel jenis izin memakai kode
`panas`. Penerjemahan dilakukan di `assets/lapangan.js` saat mengirim, bukan
dengan mengubah salah satu layar.

Dua kategori lapangan — **Housekeeping** dan **Peralatan** — tidak punya
padanan di aplikasi meja. Keduanya dikirim apa adanya dan ditambahkan ke tabel
acuan `kategori_bahaya`, bukan dipaksa masuk ke kategori lain. Memaksakannya
berarti membuang keterangan yang sengaja dikumpulkan petugas.

> **Untuk tahap 1.** Dua kosakata untuk hal yang sama adalah pertentangan di
> dalam purwarupa, bukan keputusan rancangan. Yang benar adalah menyepakati
> satu kosakata bersama Khong Guan Group, lalu mengubah kedua layar sekaligus.
> Sampai itu terjadi, penerjemahan di atas menahan dampaknya.
