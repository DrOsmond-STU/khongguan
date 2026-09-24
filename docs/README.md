# Dokumentasi KG SafeGuard

Paket dokumen yang disiapkan **sebelum pengembangan sistem produksi dimulai**.
Purwarupa yang ada hari ini sudah menunjukkan bentuk antarmuka dan alur kerjanya;
dokumen-dokumen di sini menetapkan apa yang harus dibangun di belakangnya.

## Urutan membaca

Bagi yang baru masuk proyek, baca berurutan 01 → 04. Sisanya dibaca saat
dibutuhkan.

| # | Dokumen | Untuk siapa | Menjawab pertanyaan |
|---|---|---|---|
| [01](01-ikhtisar-produk.md) | Ikhtisar produk | Semua | Apa yang dibangun, untuk siapa, dan apa yang tidak dibangun |
| [02](02-kebutuhan-fungsional.md) | Kebutuhan fungsional | Analis, pengembang, penguji | Apa yang harus dilakukan sistem, per modul |
| [03](03-aturan-bisnis.md) | Aturan bisnis | Pengembang, QHSE | Aturan K3 mana yang ditegakkan sistem, bukan diingatkan |
| [04](04-peran-dan-hak-akses.md) | Peran dan hak akses | Pengembang, QHSE, TI | Siapa boleh melihat dan mengubah apa |
| [05](05-model-data.md) | Model data | Pengembang basis data | Entitas, atribut, relasi, penomoran |
| [06](06-spesifikasi-api.md) | Spesifikasi API | Pengembang | Bentuk endpoint, autentikasi, sinkronisasi luring |
| [07](07-arsitektur-teknis.md) | Arsitektur teknis | Pengembang, TI | Lapisan sistem, teknologi, penempatan |
| [08](08-aplikasi-lapangan.md) | Aplikasi lapangan | Pengembang | Perilaku luring, antrean, PWA, Android |
| [09](09-kebutuhan-nonfungsional.md) | Kebutuhan nonfungsional | Pengembang, TI | Kinerja, ketersediaan, keamanan, aksesibilitas |
| [10](10-panduan-antarmuka.md) | Panduan antarmuka | Perancang, pengembang | Token, komponen, pola, bahasa |
| [11](11-rencana-pengujian.md) | Rencana pengujian | Penguji, QHSE | Apa yang diuji dan bagaimana dinyatakan lulus |
| [12](12-rencana-rilis.md) | Rencana rilis | Manajer proyek | Tahapan, migrasi, pelatihan, kriteria terima |
| [13](13-glosarium.md) | Glosarium | Semua | Arti istilah dan singkatan QHSE |
| [14](14-pemasangan.md) | Pemasangan di peladen | Pengembang, STU | Langkah pemasangan cPanel, dan mengapa jalur masuk demo dimatikan pada produksi |

## Penomoran acuan

Setiap kebutuhan dan aturan punya kode tetap supaya dapat dirujuk dari kode
program, kasus uji, dan berita acara serah terima.

| Awalan | Arti | Contoh |
|---|---|---|
| `KF-` | Kebutuhan fungsional | `KF-01-03` — modul 01, kebutuhan ketiga |
| `AB-` | Aturan bisnis | `AB-07` |
| `KNF-` | Kebutuhan nonfungsional | `KNF-12` |
| `UJ-` | Kasus uji | `UJ-03-01` |

Kode tidak pernah dipakai ulang. Kebutuhan yang dibatalkan ditandai
`(dicabut)`, bukan dihapus, supaya riwayat keputusan tetap dapat ditelusuri.

## Status dokumen

| Hal | Keterangan |
|---|---|
| Versi | 1.0 |
| Tanggal | 23 September 2026 |
| Dasar | Purwarupa KG SafeGuard, 25 modul + aplikasi lapangan |
| Status | Rancangan untuk ditinjau bersama Khong Guan Group |

Dokumen ini belum disetujui pihak Khong Guan Group. Tahap 1 rencana
implementasi ([12](12-rencana-rilis.md)) adalah peninjauan bersama yang
menghasilkan versi 2.0 sebagai acuan pembangunan.
