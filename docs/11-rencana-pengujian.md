# 11 · Rencana pengujian

## Prinsip

Yang diuji bukan "apakah tombolnya bekerja", melainkan **apakah aturan yang
seharusnya menolak benar-benar menolak**. Sistem K3 yang lolos seluruh uji
antarmuka tetapi meloloskan izin pada zona Ekstrem adalah sistem yang gagal.

## Tingkatan pengujian

| Tingkat | Cakupan | Dijalankan |
|---|---|---|
| Unit | Perhitungan skor, penuaan, masa berlaku, rumus KPI | Setiap perubahan kode |
| Integrasi | Aturan bisnis di tingkat API | Setiap perubahan kode |
| Antarmuka | Alur layar, modal, formulir, penyaringan peran | Setiap hari |
| Luring | Antrean, sinkronisasi, pembaruan versi | Setiap rilis |
| Beban | Kapasitas dan waktu tanggap | Sebelum rilis produksi |
| Keamanan | Uji penetrasi, pemindaian pustaka | Sebelum rilis produksi, lalu berkala |
| UAT | Pemakaian sungguhan oleh pengguna | Tahap 4 |

## Kasus uji aturan bisnis

Setiap aturan pada [03](03-aturan-bisnis.md) wajib punya sedikitnya satu kasus
uji yang **membuktikan penolakannya**. Daftar di bawah adalah yang mengikat;
penambahan boleh, pengurangan perlu persetujuan tertulis.

| Kode | Aturan | Kasus uji | Hasil yang diharapkan |
|---|---|---|---|
| UJ-01 | AB-01 | Membuat CAPA lewat API tanpa `sumber_id` | `409`, kode `AB-01` |
| UJ-02 | AB-03 | Menutup insiden yang CAPA-nya masih Terbuka | `409`, menyebut nomor CAPA penahan |
| UJ-03 | AB-17 | Memverifikasi CAPA milik sendiri | `409`, kode `AB-17` |
| UJ-04 | AB-09 | Menerbitkan izin dengan JSA berstatus Draf | `409`, kode `AB-09` |
| UJ-05 | AB-10 | Menerbitkan izin dengan satu langkah JSA skor sisa 16 | `409`, menyebut nomor langkah |
| UJ-06 | AB-11 | Menerbitkan izin bagi pelaksana berkartu induksi kedaluwarsa | `409`, kode `AB-11` |
| UJ-07 | AB-08 | Menjawab satu butir checklist "Tidak Sesuai" | Unit berstatus Terkunci pada daftar alat |
| UJ-08 | AB-15 | Menurunkan skor sisa HIRADC saat kendali tambahan masih Terbuka | `409`, kode `AB-15` |
| UJ-09 | AB-07 | Mengirim observasi APD dengan patuh 20 dari diamati 14 | `422`, kode `AB-07` |
| UJ-10 | AB-06 | Memeriksa seluruh kolom dan jejak audit observasi | Tidak ada kolom identitas pekerja yang diamati |
| UJ-11 | AB-05 | Membaca KPI setelah kiriman lapangan masuk | Angka KPI tidak berubah sebelum verifikasi |
| UJ-12 | AB-22 | Menyimpan peraturan berstatus Terpenuhi tanpa kolom bukti | `409`, kode `AB-22` |
| UJ-13 | AB-24 | Menyimpan induksi bernilai di bawah ambang sebagai Berlaku | Tidak tersedia; status dipaksa Tidak Lulus |
| UJ-14 | AB-16 | Memperpanjang tenggat CAPA | Umur tidak berubah |
| UJ-15 | AB-18 | Menutup audit dengan temuan Major tanpa CAPA | `409`, kode `AB-18` |
| UJ-16 | AB-20 | Menyimpan dokumen internal berstatus Berlaku tanpa tanggal tinjau | `409`, kode `AB-20` |
| UJ-17 | AB-14 | Membandingkan zona pada JSA, HIRADC, dan Risiko untuk skor 12 | Ketiganya "Tinggi" |
| UJ-18 | AB-27 | Membuka ubin LTIFR dan TRIR | Basis 1.000.000 dan 200.000 tertulis; tidak ada perbandingan langsung |
| UJ-19 | AB-28 | Membuka Dashboard Eksekutif dengan satu pabrik berstatus Kritis | Status grup tidak menutupi pabrik itu |
| UJ-20 | AB-02 | Menyimpan insiden berkeparahan Serius | Pemberitahuan terkirim ke QHSE dan Plant Manager pabrik itu |

## Kasus uji hak akses

| Kode | Kasus uji | Hasil yang diharapkan |
|---|---|---|
| UJ-21 | Operator membuka `/api/v1/hiradc` | `403` |
| UJ-22 | Petugas Lingkungan membuka `/api/v1/jsa` | `403` |
| UJ-23 | QHSE Cibitung membaca insiden Semarang | `403`, bukan daftar kosong |
| UJ-24 | Pencarian "JSA" oleh Operator | Hasil modul JSA tampil; HIRADC tidak; jumlah tersaring disebutkan |
| UJ-25 | Menu aplikasi lapangan untuk lima peran | Jumlah petak sesuai matriks [04](04-peran-dan-hak-akses.md) |
| UJ-26 | Operator mengajukan izin kerja dari lapangan | Diterima sebagai pengajuan (AB-12), bukan `403` |
| UJ-27 | Akun dinonaktifkan di direktori | Akses tercabut dalam 15 menit |

## Kasus uji luring dan sinkronisasi

| Kode | Kasus uji | Hasil yang diharapkan |
|---|---|---|
| UJ-28 | Membuka aplikasi lapangan tanpa sinyal setelah pemasangan | Terbuka; empat rujukan terbaca |
| UJ-29 | Membuat lima laporan tanpa sinyal | Seluruhnya masuk antrean dengan nomor sementara |
| UJ-30 | Sinyal kembali | Antrean terkirim sendiri; nomor tetap diberikan |
| UJ-31 | Mengirim ulang antrean yang sama | Tidak ada catatan ganda |
| UJ-32 | Satu dari lima kiriman ditolak aturan | Empat diterima; satu tetap di perangkat beserta alasannya |
| UJ-33 | Sinyal putus di tengah pengiriman | Pengiriman ulang tidak menggandakan |
| UJ-34 | Menaikkan versi rilis, lalu membuka aplikasi | Isi baru tampil pada bukaan **pertama** |
| UJ-35 | Penyimpanan perangkat penuh | Foto terlama dilepas; laporan tetap utuh; pengguna diberi tahu |
| UJ-36 | Keluar akun dengan antrean belum terkirim | Antrean tetap tersimpan; keadaan tampilan bersih |

UJ-34 adalah pelajaran dari purwarupa. Pembaruan yang baru tampil pada bukaan
kedua membebankan perbaikan kepada pengguna, dan pengguna lapangan tidak punya
cara mengetahuinya.

## Kasus uji antarmuka

| Kode | Cakupan | Hasil yang diharapkan |
|---|---|---|
| UJ-37 | Seluruh elemen yang dapat diklik pada 25 modul | Seluruhnya membuka sesuatu; tidak ada galat konsol |
| UJ-38 | Bahasa Inggris pada seluruh modul | Tidak ada label tetap yang tertinggal berbahasa Indonesia |
| UJ-39 | Mode gelap pada seluruh modul | Kontras memenuhi WCAG AA; tidak ada teks tak terbaca |
| UJ-40 | Lebar 360px pada aplikasi lapangan | Tidak ada gulir mendatar; label tidak terpotong |
| UJ-41 | Navigasi papan ketik | Seluruh fungsi terjangkau; fokus selalu terlihat |
| UJ-42 | Pembaca layar pada formulir pelaporan | Label dan galat terbaca |

Pengujian antarmuka dijalankan otomatis dengan peramban tanpa kepala. Pada
purwarupa, cara ini menjalankan 438 elemen pada 25 modul dalam satu kali jalan.

## Kasus uji beban

| Kode | Skenario | Hasil yang diharapkan |
|---|---|---|
| UJ-43 | 200 pengguna aktif bersamaan | Waktu tanggap API persentil 95 di bawah 500 ms |
| UJ-44 | 500 perangkat lapangan mengirim antrean bersamaan saat pergantian shift | Tidak ada kiriman hilang; tidak ada catatan ganda |
| UJ-45 | Ekspor 12 bulan data pada jam sibuk | Tidak menahan permintaan pengguna lain |

UJ-44 mewakili keadaan nyata: sinyal pulih bersamaan saat pekerja keluar dari
area produksi, dan seluruh perangkat mengirim pada menit yang sama.

## UAT

Dijalankan tahap 4 di satu pabrik dengan data sebenarnya, oleh pengguna
sungguhan, bukan oleh tim pengembang.

| Peran | Yang dikerjakan | Dinyatakan lulus bila |
|---|---|---|
| Operator | Checklist shift, lapor bahaya, lapor nyaris celaka | Melapor bahaya selesai di bawah 30 detik (KNF-06) |
| QHSE | Verifikasi, investigasi, terbitkan izin, kelola CAPA | Tidak ada langkah yang memerlukan bantuan pengembang |
| Lingkungan | Catat parameter, siapkan pelaporan wajib | Nilai selalu tampil dengan baku mutunya |
| Plant Manager | Tinjau kinerja, setujui izin | Keadaan pabriknya terbaca tanpa bertanya |
| Administrator | Kelola pengguna, peran, data acuan | Menambah area kerja tanpa bantuan pengembang (KNF-48) |

## Kriteria keluar

Rilis produksi hanya dilakukan bila seluruh berikut terpenuhi:

1. Seluruh kasus uji aturan bisnis (UJ-01 … UJ-20) lulus.
2. Seluruh kasus uji hak akses (UJ-21 … UJ-27) lulus.
3. Seluruh kasus uji luring (UJ-28 … UJ-36) lulus.
4. Tidak ada temuan uji penetrasi berkategori Tinggi yang masih terbuka.
5. UAT diterima tertulis oleh perwakilan kelima peran.
6. Uji pemulihan dari cadangan berhasil dijalankan sekali.

Butir 6 sering dilewati pada proyek sejenis. Cadangan yang tidak pernah diuji
pemulihannya bukan cadangan.
