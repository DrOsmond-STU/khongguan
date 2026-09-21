# KG SafeGuard — Purwarupa Aplikasi QHSE Khong Guan Group

Purwarupa antarmuka untuk sistem QHSE (Quality, Health, Safety, Environment) Khong Guan Group, mencakup sepuluh modul operasional. Arah visual mengikuti permintaan: **biru bergradasi dengan setiap kontrol tampak melayang dan berbayang**.

> Seluruh isi data dalam purwarupa ini adalah **data rekaan** untuk demonstrasi alur kerja, bukan catatan QHSE Khong Guan yang sebenarnya.

## Menjalankan

Tanpa build step dan tanpa dependensi. Cukup layani folder ini lewat HTTP:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Membuka `index.html` langsung dari berkas (`file://`) juga bekerja, hanya saja huruf dari Google Fonts mungkin tidak termuat.

## Sepuluh modul

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

## Keputusan desain yang berdampak pada alur kerja

Beberapa aturan sengaja dikeraskan dalam purwarupa karena inilah yang membedakan sistem QHSE yang dipakai dari yang diabaikan:

- **Jenis dan keparahan adalah dua sumbu berbeda.** Accident bisa berkeparahan Sedang; Nearmiss bisa berkeparahan Katastropik. Keduanya ditampilkan berdampingan, tidak digabung jadi satu label.
- **JSEA menampilkan dua skor, bukan satu.** Risiko awal dan risiko sisa muncul di matriks yang sama. Satu skor saja menyembunyikan apakah pengendalian benar-benar bekerja.
- **Risiko sisa zona Ekstrem menutup penerbitan izin**, bukan memberi peringatan lalu tetap mengizinkan.
- **Arah tren KPI mengikuti arti, bukan angka.** Laporan bahaya yang turun berwarna merah: berhenti melapor bukan berarti bahaya berhenti ada.
- **Nilai lingkungan selalu bersanding dengan ambangnya.** Angka tanpa baku mutu pembanding tidak berarti apa-apa bagi pembaca.
- **CAPA tidak pernah dibuat dari nol** — setiap entri membawa tautan balik ke modul sumbernya.
- **Lama menunggu adalah data.** Izin yang tertahan 18 jam menampilkan angka itu, bukan sekadar tanggal pengajuan.

## Susunan berkas

```
index.html          Kerangka: sidebar, top bar ponsel, FAB, wadah modal
assets/tokens.css   Token desain — warna, huruf, jarak, sudut, bayangan (tema terang & gelap)
assets/app.css      Komponen antarmuka; tidak ada warna harfiah, semuanya lewat token
assets/data.js      Data contoh seluruh modul
assets/app.js       Perutean hash, sepuluh tampilan modul, modal, grafik SVG
assets/img/         Lambang aplikasi dan ikon sepuluh modul
```

## Tema

Antarmuka mengikuti tema sistem pengguna. Tema gelap bukan pembalikan mekanis — tangga biru dinaikkan terangnya agar tetap lolos kontras di atas permukaan gelap.

## Sistem desain

Token, komponen, dan panduan pemakaian dipelihara sebagai design system terpisah berjudul **Khong Guan QHSE**, berisi 12 komponen dengan pratinjau langsung, ikon sepuluh modul, serta bagian *Sepuluh Modul* dan *Status, Keparahan, dan Risiko* yang menjadi acuan kosakata di aplikasi ini. Berkas `assets/tokens.css` di repo ini merupakan turunan dari `tokens.json` sistem tersebut.

## Yang belum ada

- **Lambang korporat Khong Guan.** Berkas resminya harus diminta ke tim Corporate Communication. Purwarupa memakai lambang aplikasi KG SafeGuard (perisai dengan centang) dan teks biasa; lambang korporat sengaja tidak digambar ulang atau didekati bentuknya.
- Backend, autentikasi, dan hak akses per peran. Purwarupa berjalan sebagai satu peran (QHSE Supervisor) dengan data statis.
- Unggahan berkas sungguhan, ekspor PDF/Excel, dan notifikasi.
