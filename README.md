# KG SafeGuard — Purwarupa Aplikasi QHSE Khong Guan Group

Purwarupa antarmuka untuk sistem QHSE (Quality, Health, Safety, Environment) Khong Guan Group: **25 modul aplikasi meja** dan satu **aplikasi lapangan** yang dapat dipasang di Android dan tetap bekerja tanpa sinyal. Arah visual mengikuti permintaan: **biru bergradasi dengan setiap kontrol tampak melayang dan berbayang**.

> Seluruh isi data dalam purwarupa ini adalah **data rekaan** untuk demonstrasi alur kerja, bukan catatan QHSE Khong Guan yang sebenarnya.

## Dokumentasi

Paket dokumen yang disiapkan **sebelum pengembangan sistem produksi dimulai** ada di **[`docs/`](docs/)** — ikhtisar produk, kebutuhan fungsional dan nonfungsional, aturan bisnis, matriks hak akses, model data, spesifikasi API, arsitektur, aplikasi lapangan, panduan antarmuka, rencana pengujian, rencana rilis, dan glosarium.

Purwarupa ini menunjukkan **bentuknya**; dokumen di `docs/` menetapkan **apa yang harus dibangun di belakangnya**.

## Menjalankan

Tanpa build step dan tanpa dependensi. Cukup layani folder ini lewat HTTP:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Membuka `index.html` langsung dari berkas (`file://`) juga bekerja, hanya saja huruf dari Google Fonts mungkin tidak termuat.

## Dua puluh lima modul

| # | Modul | Pola layar | Isi purwarupa |
|---|---|---|---|
| 1 | Incident, Nearmiss & Accident | Daftar + formulir | 6 kejadian, klasifikasi jenis × keparahan, investigasi akar masalah, tautan ke CAPA |
| 2 | Inspection | Daftar + checklist | 8 jenis inspeksi, rel kemajuan per butir, temuan "Tidak Sesuai" langsung menjadi CAPA |
| 3 | Work Permit & JSEA | Kartu izin + JSEA | 4 izin kerja, matriks risiko 5×5 risiko awal vs sisa, 6 langkah JSEA, jalur persetujuan berjenjang |
| 4 | Pelaporan & Penanganan Bahaya K3L | Papan 3 kolom | 7 laporan, kanal anonim, tren 12 bulan dengan catatan "naik itu baik" |
| 5 | Audit | Daftar + kisi | ISO 45001, ISO 14001, SMK3 PP 50/2012; 12 elemen SMK3, 166 kriteria |
| 6 | Environment | Papan 4 kartu | Waste Management, PPPA, PPPU, PLB3 — setiap nilai disandingkan dengan baku mutunya |
| 7 | Dashboard & Laporan | Papan | Ubin KPI, tren insiden, Aktivitas Terbaru, Perhatian Segera lintas modul |
| 8 | SHE KPI & Analytics | Papan | Lagging dan leading dipisah tegas, rumus di kaki tiap ubin, pembandingan antarpabrik |
| 9 | SHE Activity | Kisi kartu | 5 kegiatan bulan berjalan; jam-orang mengisi KPI modul 8; kartu kosong P2K3 tetap terlihat |
| 10 | Corrective & Preventive Action | Kanban + tabel | 10 CAPA dari lima jenis sumber, penuaan dihitung dari tanggal terbit |
| 11 | Manajemen Pelatihan | Daftar | 8 program dengan kolom rencana dan aktual berdampingan; 6 sertifikasi personel wajib dengan sisa masa berlaku |
| 12 | Manajemen Risiko | Stepper + register | Enam tahap ISO 31000; konteks internal/eksternal, kriteria, dan risk register 8 risiko dengan skor awal dan sisa |
| 13 | Manajemen Dokumen Internal | Hierarki + daftar induk | 14 dokumen dalam 4 tingkat: manual/kebijakan, prosedur, instruksi kerja, formulir |
| 14 | Manajemen Dokumen Eksternal | Daftar | 12 dokumen kepatuhan: sertifikat sistem, izin lingkungan, izin peralatan, pelaporan wajib |
| 15 | Safety Checklist | Daftar + checklist | Pemeriksaan tiap shift: P2H forklift, pra-nyala boiler, APD, 5R, ruang panel |
| 16 | Observasi Perilaku | Papan + catatan | Indeks perilaku aman, 6 kategori perilaku, 5 catatan observasi dengan percakapan tindak lanjut |
| 17 | Dashboard Eksekutif | Papan | Kartu skor 4 pabrik, arah TRIR grup, 5 program strategis, dan hal yang perlu keputusan manajemen |
| 18 | Notifikasi | Kotak masuk | 10 pemberitahuan lintas modul dengan tautan langsung, dan tabel aturan pengiriman |
| 19 | Pengaturan | Papan preferensi | Tema, bahasa, pabrik aktif, periode, dan kanal pemberitahuan |
| 20 | User Management | Daftar + matriks | 10 pengguna, 5 peran, dan matriks hak akses Baca / Isi / Verifikasi / Kelola |
| 21 | Asisten QHSE | Pencarian + ringkasan | Pencarian menyeluruh ke seluruh catatan sistem, disaring menurut peran |
| 22 | Analisis JSA | Pustaka + langkah | 4 JSA, 19 langkah kerja, kolom Awal → Sisa, sebaran hierarki pengendalian |
| 23 | HIRADC K3 | Kategori + register | 12 aktivitas rutin/non-rutin/darurat, 7 kategori sumber bahaya |
| 24 | Induksi K3 | Kartu + materi | 7 kartu induksi dengan masa berlaku per jenis peserta, 8 materi wajib |
| 25 | Regulasi K3 | Register | 12 peraturan dengan kolom penerapan dan bukti, status pemenuhan tiga tingkat |

## Keputusan desain yang berdampak pada alur kerja

Beberapa aturan sengaja dikeraskan dalam purwarupa karena inilah yang membedakan sistem QHSE yang dipakai dari yang diabaikan:

- **Jenis dan keparahan adalah dua sumbu berbeda.** Accident bisa berkeparahan Sedang; Nearmiss bisa berkeparahan Katastropik. Keduanya ditampilkan berdampingan, tidak digabung jadi satu label.
- **JSEA menampilkan dua skor, bukan satu.** Risiko awal dan risiko sisa muncul di matriks yang sama. Satu skor saja menyembunyikan apakah pengendalian benar-benar bekerja.
- **Risiko sisa zona Ekstrem menutup penerbitan izin**, bukan memberi peringatan lalu tetap mengizinkan.
- **Arah tren KPI mengikuti arti, bukan angka.** Laporan bahaya yang turun berwarna merah: berhenti melapor bukan berarti bahaya berhenti ada.
- **Nilai lingkungan selalu bersanding dengan ambangnya.** Angka tanpa baku mutu pembanding tidak berarti apa-apa bagi pembaca.
- **CAPA tidak pernah dibuat dari nol** — setiap entri membawa tautan balik ke modul sumbernya.
- **Lama menunggu adalah data.** Izin yang tertahan 18 jam menampilkan angka itu, bukan sekadar tanggal pengajuan.
- **Rencana dan aktual selalu berdampingan.** Modul pelatihan menampilkan kolom rencana dan aktual bersebelahan; selisihnya yang jadi informasi, bukan daftar pelatihan yang pernah diadakan.
- **Enam tahap manajemen risiko terlihat semuanya**, bukan hanya tabel register di ujungnya. Penetapan konteks dan kriteria evaluasi punya kartunya sendiri karena keduanya yang paling sering dilewati.
- **Safety Checklist ≠ Inspection.** Checklist dikerjakan tiap shift oleh pekerja lini sebelum alat dipakai; satu butir "Tidak Sesuai" mengunci unit dari operasi. Inspection terjadwal bulanan oleh petugas QHSE.
- **Observasi perilaku tidak menamai pekerja yang diamati**, mengisi kolom perilaku aman lebih dulu, dan mewajibkan catatan percakapan. Observasi tanpa tindak lanjut hanyalah angka.
- **Dokumen eksternal diurutkan menurut sisa masa berlaku**, bukan abjad — yang hampir habis harus terlihat lebih dulu.
- **Notifikasi hanya dikirim bila membawa tindakan.** Perubahan status biasa tidak dikirim; cukup terlihat di modulnya.
- **Panah tren hanya muncul untuk perbandingan antarperiode** (teks yang memuat "vs"). Angka pendamping yang bersifat keterangan tetap berwarna, tetapi tanpa panah, supaya panah tidak pernah berbohong soal arah.

## Masuk, tema, dan bahasa

**Login.** Aplikasi dibuka dengan layar masuk. Autentikasi berjalan sepenuhnya di peramban — tidak ada server, tidak ada kata sandi yang dikirim ke mana pun. Seluruh akun demo memakai kata sandi `demo1234` dan tercantum di layar masuk:

| Email | Peran | Yang terlihat |
|---|---|---|
| `fadli.saldi@khongguan.co.id` | QHSE Supervisor | 23 modul, tanpa User Management |
| `agus.prasetyo@khongguan.co.id` | Operator Produksi | 10 modul lapangan |
| `yuni.astuti@khongguan.co.id` | Petugas Lingkungan | 10 modul lingkungan dan kepatuhan |
| `plant.manager@khongguan.co.id` | Plant Manager | 15 modul, dibuka di Dashboard Eksekutif |
| `admin@khongguan.co.id` | Administrator Sistem | 25 modul, termasuk User Management |

Peran menentukan modul mana yang muncul di sidebar. Membuka alamat modul yang tidak diizinkan akan dialihkan ke modul pertama yang boleh dilihat, dan alamatnya ikut dibetulkan.

**Tema.** Terang, Gelap, atau Sistem. Tersimpan di `localStorage` dan dipasang sebelum halaman digambar, jadi tidak ada kedipan putih saat memuat dalam mode gelap.

**Bahasa.** Indonesia atau English. Tampilan ditulis dalam bahasa Indonesia, lalu `assets/i18n.js` menerjemahkan simpul teks yang cocok persis dengan kamus. Frasa yang belum ada di kamus dibiarkan apa adanya, sehingga terjemahan yang hilang tidak pernah merusak tata letak.

Isi rekaman — kronologi insiden, catatan observasi, nama orang dan lokasi — **sengaja tidak diterjemahkan**. Rekaman K3 ditulis pekerja dalam bahasa mereka sendiri; menerjemahkannya otomatis akan mengubah bukti.

## Navigasi

Dua puluh lima modul dikelompokkan menurut cara kerja QHSE sehari-hari, bukan menurut nomor:

- **Dashboard Eksekutif**, **Dashboard & Laporan**, dan **Asisten QHSE** di puncak.
- **Kejadian & Bahaya** — Incident & Nearmiss, Laporan Bahaya K3L, Observasi Perilaku.
- **Pengendalian** — Inspection, Safety Checklist, Work Permit & JSEA, Analisis JSA, HIRADC K3, Manajemen Risiko, CAPA.
- **Kepatuhan** — Audit, Environment, Dokumen Internal, Dokumen Eksternal, Regulasi K3.
- **Pengembangan** — Induksi K3, Manajemen Pelatihan, SHE Activity, SHE KPI & Analytics.
- **Administrasi** — Notifikasi, Pengaturan, User Management.

### Aplikasi lapangan

`/m/` adalah aplikasi terpisah untuk telepon: lima jenis laporan (bahaya, insiden, observasi perilaku, observasi APD, pengajuan izin kerja), tugas harian, dan empat rujukan K3 yang terbaca tanpa sinyal. Dapat dipasang dari Chrome tanpa toko aplikasi. Rinciannya pada [`docs/08-aplikasi-lapangan.md`](docs/08-aplikasi-lapangan.md).

## Susunan berkas

```
index.html          Layar masuk, kerangka aplikasi, sakelar tema & bahasa
assets/tokens.css   Token desain — warna, huruf, jarak, sudut, bayangan (tema terang & gelap)
assets/app.css      Komponen antarmuka; tidak ada warna harfiah, semuanya lewat token
assets/i18n.js      Kamus Indonesia–Inggris dan penerjemah simpul teks
assets/data.js      Data contoh seluruh modul, pengguna, peran, dan matriks hak akses
assets/app.js       Sesi, tema, bahasa, perutean hash, 25 tampilan modul, modal, grafik SVG
assets/ai.js        Indeks pencarian seluruh sistem dan Asisten QHSE
assets/lapangan.js  Antrean laporan lapangan; mengirim ke peladen bila dikonfigurasi
assets/konfigurasi.js  Alamat API; dikosongkan berarti mode peragaan
assets/sumber.js    Mengambil data dari peladen dan memetakannya ke bentuk yang dibaca app.js
assets/img/         Lambang aplikasi dan ikon modul
m/                  Aplikasi lapangan: PWA yang dapat dipasang dan bekerja tanpa sinyal
android/            Kerangka pembungkus Android (Trusted Web Activity), belum dikompilasi
api/                Peladen: PHP + PostgreSQL, skema, dan pengujiannya
docs/               Paket dokumen sebelum pengembangan
```

## Sistem desain

Token, komponen, dan panduan pemakaian dipelihara sebagai design system terpisah berjudul **Khong Guan QHSE**, berisi 12 komponen dengan pratinjau langsung, ikon modul, serta bagian *Modul* dan *Status, Keparahan, dan Risiko* yang menjadi acuan kosakata di aplikasi ini. Berkas `assets/tokens.css` di repo ini merupakan turunan dari `tokens.json` sistem tersebut.

## Dua mode

Aplikasi yang sama berjalan pada dua mode, dan yang menentukan hanya satu baris
di `assets/konfigurasi.js`:

| Mode | `KG_KONFIG.api` | Sumber data |
|---|---|---|
| **Peragaan** | kosong | `assets/data.js` — persis purwarupa yang selama ini diperagakan |
| **Tersambung** | alamat peladen | PostgreSQL lewat API pada `api/` |

Tampilannya sama persis pada kedua mode. `app.js`, `app.css`, dan `tokens.css`
tidak tahu-menahu soal peladen: `sumber.js` mengisi `window.KG` dengan bentuk
yang sama sebelum `app.js` dimuat. Kesamaan itu diuji dengan membandingkan 12
layar piksel demi piksel sebelum dan sesudah setiap perubahan.

Cara menyiapkan peladen ada di **[`api/README.md`](api/README.md)**.

## Yang belum ada

- **Lambang korporat Khong Guan.** Berkas resminya harus diminta ke tim Corporate Communication. Purwarupa memakai lambang aplikasi KG SafeGuard (perisai dengan centang) dan teks biasa; lambang korporat sengaja tidak digambar ulang atau didekati bentuknya.
- Unggahan berkas sungguhan, ekspor PDF/Excel, dan pengiriman notifikasi ke email/WhatsApp. Modul 18 menampilkan antrean dan aturan kirimnya; penerima pemberitahuan sudah ditentukan peladen (AB-02), tetapi pengirimannya belum.
- **Tahap 1 belum dijalankan.** Skema, kosakata, dan matriks peran bersandar pada asumsi yang tertulis di `docs/`, bukan pada analisis bersama Khong Guan Group. Pertentangan yang ditemukan di dalam purwarupa dicatat pada dokumennya masing-masing, bukan ditambal diam-diam.

### Pada mode peragaan

Login berjalan di peramban tanpa server: kata sandi dibandingkan di sisi klien
dan sesi disimpan di `localStorage`. Cukup untuk memperagakan alur dan hak
akses per peran, tetapi bukan pengamanan. **Jangan memakai kata sandi sungguhan
di layar ini.**

Pada mode tersambung, masuk memakai OpenID Connect ke direktori perusahaan;
sistem tidak pernah menerima, menyimpan, atau memeriksa kata sandi.
