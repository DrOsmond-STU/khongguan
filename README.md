# KG SafeGuard — Purwarupa Aplikasi QHSE Khong Guan Group

Purwarupa antarmuka untuk sistem QHSE (Quality, Health, Safety, Environment) Khong Guan Group, mencakup delapan belas modul operasional. Arah visual mengikuti permintaan: **biru bergradasi dengan setiap kontrol tampak melayang dan berbayang**.

> Seluruh isi data dalam purwarupa ini adalah **data rekaan** untuk demonstrasi alur kerja, bukan catatan QHSE Khong Guan yang sebenarnya.

## Menjalankan

Tanpa build step dan tanpa dependensi. Cukup layani folder ini lewat HTTP:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Membuka `index.html` langsung dari berkas (`file://`) juga bekerja, hanya saja huruf dari Google Fonts mungkin tidak termuat.

## Delapan belas modul

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

## Navigasi

Delapan belas modul dikelompokkan menurut cara kerja QHSE sehari-hari, bukan menurut nomor:

- **Dashboard Eksekutif** dan **Dashboard & Laporan** di puncak — dua pembaca berbeda, dua layar berbeda.
- **Kejadian & Bahaya** — Incident & Nearmiss, Laporan Bahaya K3L, Observasi Perilaku.
- **Pengendalian** — Inspection, Safety Checklist, Work Permit & JSEA, Manajemen Risiko, CAPA.
- **Kepatuhan** — Audit, Environment, Dokumen Internal, Dokumen Eksternal.
- **Pengembangan** — Manajemen Pelatihan, SHE Activity, SHE KPI & Analytics.
- **Notifikasi** di kaki, dengan lencana hitung.

## Susunan berkas

```
index.html          Kerangka: sidebar, top bar ponsel, FAB, wadah modal
assets/tokens.css   Token desain — warna, huruf, jarak, sudut, bayangan (tema terang & gelap)
assets/app.css      Komponen antarmuka; tidak ada warna harfiah, semuanya lewat token
assets/data.js      Data contoh seluruh modul
assets/app.js       Perutean hash, 18 tampilan modul, modal, grafik SVG
assets/img/         Lambang aplikasi dan ikon modul
```

## Tema

Antarmuka mengikuti tema sistem pengguna. Tema gelap bukan pembalikan mekanis — tangga biru dinaikkan terangnya agar tetap lolos kontras di atas permukaan gelap.

## Sistem desain

Token, komponen, dan panduan pemakaian dipelihara sebagai design system terpisah berjudul **Khong Guan QHSE**, berisi 12 komponen dengan pratinjau langsung, ikon modul, serta bagian *Modul* dan *Status, Keparahan, dan Risiko* yang menjadi acuan kosakata di aplikasi ini. Berkas `assets/tokens.css` di repo ini merupakan turunan dari `tokens.json` sistem tersebut.

## Yang belum ada

- **Lambang korporat Khong Guan.** Berkas resminya harus diminta ke tim Corporate Communication. Purwarupa memakai lambang aplikasi KG SafeGuard (perisai dengan centang) dan teks biasa; lambang korporat sengaja tidak digambar ulang atau didekati bentuknya.
- Backend, autentikasi, dan hak akses per peran. Purwarupa berjalan sebagai satu peran (QHSE Supervisor) dengan data statis.
- Unggahan berkas sungguhan, ekspor PDF/Excel, dan pengiriman notifikasi ke email/WhatsApp. Modul 18 menampilkan antrean dan aturan kirimnya, tetapi tidak benar-benar mengirim apa pun.
