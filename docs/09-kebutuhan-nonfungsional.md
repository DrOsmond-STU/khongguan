# 09 · Kebutuhan nonfungsional

Setiap kebutuhan punya angka dan cara mengukurnya. Kebutuhan tanpa angka tidak
dapat dinyatakan lulus atau gagal, dan pada akhirnya tidak dipenuhi.

## Kinerja

| Kode | Kebutuhan | Cara mengukur |
|---|---|---|
| KNF-01 | Daftar modul apa pun tampil dalam 1,5 detik pada jaringan kantor | Persentil 95, 50 baris per halaman |
| KNF-02 | Rincian satu catatan tampil dalam 1 detik | Persentil 95 |
| KNF-03 | Pencarian menyeluruh menjawab dalam 2 detik | Persentil 95, seluruh modul |
| KNF-04 | API menjawab dalam 500 ms tanpa waktu jaringan | Persentil 95 |
| KNF-05 | Aplikasi lapangan terbuka dalam 2 detik tanpa sinyal | Dari ikon layar utama sampai Beranda tergambar |
| KNF-06 | Melapor bahaya selesai dalam 30 detik | Dari buka aplikasi sampai laporan masuk antrean, diukur pada UAT |
| KNF-07 | Ekspor 12 bulan data satu modul selesai dalam 60 detik | Dijalankan sebagai pekerjaan latar |

## Kapasitas

| Kode | Kebutuhan |
|---|---|
| KNF-08 | Sistem menampung 4 pabrik dan 1.200 pengguna terdaftar |
| KNF-09 | Sistem menampung 200 pengguna aktif bersamaan pada jam pergantian shift |
| KNF-10 | Sistem menampung 50.000 catatan transaksi per tahun per pabrik |
| KNF-11 | Penyimpanan objek menampung 500 GB foto dan lampiran pada tahun pertama |
| KNF-12 | Pertumbuhan kapasitas dilayani dengan menambah salinan API, tanpa mengubah kode |

## Ketersediaan

| Kode | Kebutuhan |
|---|---|
| KNF-13 | Ketersediaan 99,5% pada jam kerja 06.00–22.00 WIB |
| KNF-14 | Pemeliharaan terjadwal di luar jam kerja, diumumkan 3 hari sebelumnya |
| KNF-15 | RPO 15 menit, RTO 4 jam pada jam kerja |
| KNF-16 | Aplikasi lapangan tetap dapat mencatat meski peladen tidak tersedia |

KNF-16 penting: gangguan peladen tidak boleh menghentikan pelaporan dari
lapangan. Antrean di perangkat adalah lapisan yang membuat itu mungkin.

## Keamanan

| Kode | Kebutuhan |
|---|---|
| KNF-17 | Seluruh lalu lintas memakai TLS 1.2 ke atas; HTTP dialihkan ke HTTPS |
| KNF-18 | Sistem tidak menyimpan kata sandi; autentikasi lewat direktori perusahaan |
| KNF-19 | Sesi aplikasi meja berakhir setelah 12 jam tidak aktif |
| KNF-20 | Sesi aplikasi lapangan berakhir setelah 30 hari |
| KNF-21 | Penonaktifan akun di direktori mencabut akses paling lambat 15 menit |
| KNF-22 | Cakupan pabrik ditegakkan di peladen, bukan di antarmuka |
| KNF-23 | Data di luar cakupan dijawab `403`, bukan daftar kosong |
| KNF-24 | Jejak audit tidak dapat diubah atau dihapus lewat antarmuka mana pun |
| KNF-25 | Foto dan lampiran hanya dapat diakses lewat tautan bertanda waktu yang berlaku 15 menit |
| KNF-26 | Basis data dan penyimpanan objek terenkripsi saat diam |
| KNF-27 | Uji penetrasi dilakukan sebelum rilis produksi; temuan Tinggi wajib ditutup |
| KNF-28 | Pustaka pihak ketiga dipindai kerentanannya setiap bulan selama masa dukungan |

### Bagaimana KNF-18 ditegakkan

Autentikasi memakai OpenID Connect, alur *authorization code* dengan PKCE.
Tidak ada kolom kata sandi pada basis data, dan tidak ada endpoint yang
menerimanya.

PKCE dipakai walaupun aplikasi ini punya *client secret*: kode otorisasi yang
bocor pada log peladen perantara tetap tidak dapat ditukar tanpa *verifier*
yang hanya diketahui peladen ini.

`id_token` diterima hanya bila seluruh pemeriksaan berikut lulus:

| Diperiksa | Bila dilewatkan |
|---|---|
| Tanda tangan terhadap JWKS penerbit | Siapa pun dapat membuat token sendiri |
| `alg` hanya RS256/384/512 | `none` dan HMAC memberi pengirim kuasa memilih cara memverifikasi dirinya |
| `iss` sama dengan penerbit yang dikonfigurasi | Token dari penerbit lain diterima |
| `aud` memuat `client_id` kita, dan `azp` bila audiensnya lebih dari satu | Token untuk aplikasi lain dapat dipakai di sini |
| `exp` dan `iat`, toleransi jam 60 detik | Token lama dapat diputar ulang |
| `nonce` sama dengan yang dikirim saat memulai | Token dapat disuntikkan dari sesi lain |
| `email_verified` bernilai benar | Siapa pun yang mendaftar dengan surel orang lain masuk sebagai orang itu |

`state`, `nonce`, dan PKCE *verifier* disimpan di peladen (tabel
`oidc_permintaan`), bukan di kuki penjelajah, dan dipakai sekali —
`DELETE ... RETURNING` membuat dua permintaan bersamaan dengan `state` yang
sama tidak mungkin dua-duanya berhasil. Kuki dipilih tidak dipakai karena
penjelajah di lapangan sering membuka tautan di jendela baru; kuki yang hilang
membuat masuk selalu gagal, dan yang paling mungkin dilakukan orang berikutnya
adalah mematikan pemeriksaannya.

Akun **tidak** dibuat otomatis kecuali `oidc.buat_akun_otomatis` dinyalakan.
Akun yang dapat lahir dari dua tempat akan berbeda di dua tempat, dan hak
aksesnya perlu diputuskan orang, bukan diterka dari klaim direktori. Bila
dinyalakan, akun baru berstatus `Menunggu` dan belum dapat dipakai sampai
administrator menetapkan peran dan pabriknya.

Jalur masuk demo (`POST /sesi/masuk-demo`) hanya hidup bila
`izinkan_masuk_demo` bernilai benar, dan dimatikan pada produksi. Uji UJ-50
membuktikan jalur itu menjawab `403` ketika dimatikan.

## Kerahasiaan orang

| Kode | Kebutuhan |
|---|---|
| KNF-29 | Observasi perilaku dan observasi APD tidak menyimpan identitas pekerja yang diamati, termasuk pada jejak audit (AB-06) |
| KNF-30 | Laporan anonim tidak menyimpan identitas pengirim dalam bentuk apa pun, termasuk alamat IP |
| KNF-31 | Salinan data produksi ke lingkungan uji wajib disamarkan: nama pelapor, nomor telepon, dan foto wajah |

KNF-30 mengikat: menyimpan alamat IP pada laporan anonim membuat anonimitasnya
palsu, dan pekerja yang mengetahuinya berhenti memakai kanal itu.

## Aksesibilitas

| Kode | Kebutuhan |
|---|---|
| KNF-32 | Kontras teks memenuhi WCAG 2.1 AA pada mode terang dan gelap |
| KNF-33 | Seluruh fungsi dapat dijalankan dengan papan ketik; fokus selalu terlihat |
| KNF-34 | Sasaran ketuk pada aplikasi lapangan minimum 44×44 px |
| KNF-35 | Status tidak pernah disampaikan lewat warna saja; selalu ada teks atau lambang pendamping |
| KNF-36 | Gambar dan lambang bermakna punya teks alternatif |
| KNF-37 | Animasi dihentikan bila pengguna mengaktifkan `prefers-reduced-motion` |

## Dua bahasa

| Kode | Kebutuhan |
|---|---|
| KNF-38 | Seluruh antarmuka tersedia dalam bahasa Indonesia dan Inggris |
| KNF-39 | Isi rekaman tidak pernah diterjemahkan otomatis (AB-35) |
| KNF-40 | Pilihan bahasa tersimpan pada profil dan berlaku di kedua aplikasi (AB-33) |
| KNF-41 | Kalimat yang dirakit dari angka diterjemahkan dengan aturan, bukan penggabungan potongan kata |

KNF-41 mencegah kalimat seperti "3 hari terlambat" menjadi "3 days late" lewat
penyambungan yang salah pada bentuk jamak atau urutan kata.

## Perangkat dan peramban

| Kode | Kebutuhan |
|---|---|
| KNF-42 | Aplikasi meja berjalan pada Chrome, Edge, dan Firefox dua versi terakhir |
| KNF-43 | Aplikasi meja terbaca pada lebar 1280px ke atas; tabel bergulir mendatar di dalam wadahnya sendiri |
| KNF-44 | Aplikasi lapangan berjalan pada Android 8.0 ke atas dengan Chrome 90 ke atas |
| KNF-45 | Aplikasi lapangan terbaca pada lebar 360px tanpa gulir mendatar |

## Kemudahan dirawat

| Kode | Kebutuhan |
|---|---|
| KNF-46 | Kode sumber diserahkan berikut dokumentasi teknis dan panduan pemasangan |
| KNF-47 | Data acuan diubah lewat antarmuka administrator, bukan lewat perubahan kode |
| KNF-48 | Penambahan area kerja, jenis APD, dan butir checklist tidak memerlukan rilis baru |
| KNF-49 | Log aplikasi tidak memuat data pribadi maupun isi rekaman |
| KNF-50 | Galat yang ditolak aturan bisnis selalu menyebutkan kode aturannya (AB-xx) |

KNF-47 dan KNF-48 menentukan apakah sistem masih berguna tiga tahun kemudian
tanpa pemasok aslinya.

## Jejak dan bukti

| Kode | Kebutuhan |
|---|---|
| KNF-51 | Setiap perubahan pada catatan transaksi menyimpan siapa, kapan, dan nilai sebelumnya |
| KNF-52 | Jejak audit dapat diekspor per modul per periode untuk keperluan audit |
| KNF-53 | Waktu disimpan UTC dan ditampilkan WIB, tanpa kehilangan zona waktunya |
