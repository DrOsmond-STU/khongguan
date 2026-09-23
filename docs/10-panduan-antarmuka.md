# 10 · Panduan antarmuka

Panduan ini menetapkan apa yang sudah berlaku pada purwarupa, supaya sistem
produksi tidak berbeda tampilannya tanpa alasan. Nilai token lengkap ada pada
`assets/tokens.css`; yang di sini adalah aturan pemakaiannya.

## Arah visual

Biru bergradasi dengan setiap kontrol tampak melayang dan berbayang. Merah
korporat Khong Guan (`#C8102E`) **hanya** untuk lambang perusahaan, kop dokumen
resmi, dan cap terbitan — bukan warna aksi. Warna aksi adalah biru.

## Warna

| Kelompok | Token | Dipakai untuk |
|---|---|---|
| Merek | `brand-900` … `brand-050` | Bilah sisi, pita hero, tombol utama, tautan |
| Gradasi | `grad-hero-from/to`, `grad-action-from/to` | Pita hero dan tombol melayang |
| Korporat | `kg-red-600`, `kg-red-100` | Lambang dan kop resmi saja |
| Isyarat | `signal-critical/high/medium/low/info` + `-bg` | Keparahan, status, zona risiko |
| Permukaan | `surface-000` … `surface-300` | Kartu, latar halaman, kepala tabel |
| Tinta | `ink-900`, `ink-700`, `ink-500`, `ink-400` | Judul, isi, label, teks nonaktif |
| Tepi | `border-100`, `border-200` | Garis kartu, pemisah baris, tepi input |

Dua ketentuan mengikat:

- Warna isyarat tidak pernah dipakai sebagai warna dekoratif. Merah pada layar
  ini selalu berarti sesuatu.
- Status tidak pernah disampaikan lewat warna saja; selalu ada teks
  pendampingnya (KNF-35).

### Pemetaan isyarat

| Isyarat | Keparahan insiden | Zona risiko | Status |
|---|---|---|---|
| `critical` | Serius, Accident | Ekstrem (≥15) | Lewat tenggat, Tidak Terpenuhi, Kedaluwarsa |
| `high` | — | Tinggi (10–14) | Mendekati tenggat, Terpenuhi Sebagian, Segera Berakhir |
| `medium` | Sedang | Sedang (5–9) | Dalam proses, Menunggu |
| `low` | Ringan | Rendah (1–4) | Selesai, Terverifikasi, Terpenuhi, Berlaku |
| `info` | Nearmiss | — | Draf, Menunggu Verifikasi |

## Tipografi

| Peran | Huruf | Dipakai untuk |
|---|---|---|
| Display | Plus Jakarta Sans | Judul halaman, judul modal, angka sorot |
| Isi | IBM Plex Sans | Seluruh teks antarmuka |
| Data | IBM Plex Mono | Nomor laporan, tanggal, nilai terukur, satuan |

Nomor laporan, tanggal, dan nilai terukur **selalu** memakai huruf monospasi.
Angka yang berderet dalam kolom harus dapat dibandingkan sekilas; huruf
proporsional membuat digit bergeser dan perbandingan gagal.

Skala ukuran ada pada `tokens.css`. Yang mengikat: satu halaman punya satu judul
display, dan teks isi tidak pernah di bawah 13px pada aplikasi meja atau 12px
pada aplikasi lapangan.

## Jarak dan sudut

Kelipatan 4px. Isi kartu memakai `space-5`, jarak antarkartu `space-4`, jarak
antarbagian `space-7`.

| Sudut | Dipakai untuk |
|---|---|
| `radius-sm` | Chip status, sel matriks risiko |
| `radius-md` | Tombol, input, petak menu |
| `radius-lg` | Kartu, ubin KPI, panel tabel |
| `radius-xl` | Pita hero, modal, laci |
| `radius-pill` | Chip filter, lencana hitung |

## Bayangan

Setiap kontrol yang dapat ditekan tampak melayang. Bayangan naik satu tingkat
saat hover dan turun ke `shadow-press` saat ditekan; elemen tidak pernah bergeser
lebih dari 1px.

`shadow-brand-glow` hanya untuk satu tombol aksi utama per layar.

## Komponen

| Komponen | Aturan pemakaian |
|---|---|
| Ubin KPI | Selalu membawa rumus, basis, dan sumber data pada rinciannya (AB-27) |
| Kartu | Border, isian, sudut, dan bayangan dipakai menurut peran — tidak semuanya jadi kartu |
| Tabel | Kepala menempel saat digulir; kolom angka rata kanan dengan angka tabular |
| Chip status | Huruf kapital di sumbernya, bukan lewat transformasi CSS |
| Matriks risiko | 5×5, kosakata zona sama di seluruh modul (AB-14) |
| Modal rincian | Dibuka dari baris tabel, ubin, atau chip; ditutup dengan Esc |
| Formulir | Label di atas isian; isian wajib bertanda; galat muncul di bawah isiannya |

### Rincian sekali klik

Setiap angka, chip, dan baris tabel dapat dibuka dan menjelaskan dirinya:
rumusnya, sumber datanya, dan tautan ke modul asalnya. Ini bukan hiasan — ini
yang membedakan papan angka dari alat kerja.

## Pola aplikasi lapangan

| Pola | Aturan |
|---|---|
| Menu ikon | Empat kolom; lebar petak minimum 76px pada layar 360px |
| Tombol utama | Lapor Bahaya selalu paling besar dan paling mudah dijangkau |
| Keping pilihan | Satu ketukan; keping jamak ditandai `data-banyak` dan diberi keterangan |
| Lembar geser | Formulir dan rincian muncul sebagai lembar dari bawah, ditutup dengan Esc atau tombol silang |
| Pita keadaan | Tanpa sinyal dan antrean menunggu ditampilkan sebagai pita di bawah kepala layar |

## Bahasa antarmuka

| Ketentuan | Contoh |
|---|---|
| Sebut yang dikenali pengguna, bukan cara sistem dibangun | "Laporan bahaya", bukan "entri hazard" |
| Kalimat aktif | "Kirim laporan", bukan "Laporan akan dikirim" |
| Tombol menyebut apa yang terjadi | Tombol "Sahkan" → pesan "JSA disahkan" |
| Galat menjelaskan apa yang salah dan apa yang harus dilakukan | "Jumlah patuh tidak boleh melebihi jumlah yang diamati." |
| Tidak ada permintaan maaf pada pesan galat | — |
| Catatan kaki menjelaskan mengapa, bukan mengulang apa | — |

Istilah QHSE dipakai apa adanya dan tidak diterjemahkan menjadi istilah umum:
*nearmiss*, *manhours*, *lagging*, *leading*, *baku mutu*, *HIRADC*, *JSA*.
Daftar lengkap pada [13 · Glosarium](13-glosarium.md).

## Dua tema

Tema terang adalah bawaan. Tema gelap bukan hiasan: layar terang di ruang
kendali shift malam menyulitkan mata yang harus kembali melihat lantai produksi.

Ketentuan: setiap warna didefinisikan sebagai token pada kedua tema. Warna yang
hanya ada pada satu tema menghasilkan teks yang tidak terbaca di tema lainnya.

## Dua bahasa

Antarmuka ditulis dalam bahasa Indonesia, lalu diterjemahkan lewat kamus yang
mencocokkan teks secara penuh. Frasa yang belum ada di kamus dibiarkan apa
adanya, sehingga antarmuka tidak pernah rusak karena terjemahan yang hilang.

Kalimat yang dirakit dari angka ditangani dengan aturan berpola, bukan
penggabungan potongan kata (KNF-41).

Isi rekaman tidak diterjemahkan (AB-35).
