# 04 · Peran dan hak akses

Matriks di dokumen ini adalah **satu-satunya acuan**. Aplikasi meja dan aplikasi
lapangan membacanya dari sumber yang sama (AB-32). Dua daftar berbeda untuk
orang yang sama adalah cara tercepat membuat matriks hak akses berhenti
dipercaya.

## Lima peran

| Peran | Kode | Cakupan | Jumlah modul |
|---|---|---|---|
| Operator Produksi | `operator` | Satu pabrik, area kerjanya | 10 |
| QHSE Supervisor | `qhse` | Satu pabrik, seluruh area | 23 |
| Petugas Lingkungan | `lingkungan` | Satu pabrik, bidang lingkungan | 10 |
| Plant Manager | `manajemen` | Satu pabrik, ringkasan + persetujuan | 15 |
| Administrator Sistem | `admin` | Seluruh pabrik | 25 |

Satu pengguna memegang tepat satu peran. Bila seseorang menjalankan dua fungsi,
dibuatkan dua akun terpisah, supaya jejak audit tetap dapat dibaca.

## Tingkat kewenangan

| Tingkat | Boleh | Tidak boleh |
|---|---|---|
| — | Modul tidak terlihat sama sekali | |
| **Baca** | Melihat daftar dan rincian | Membuat, mengubah, menutup |
| **Isi** | Baca + membuat dan mengubah catatan miliknya | Memverifikasi, menutup catatan orang lain |
| **Verifikasi** | Isi + memverifikasi dan menutup catatan orang lain | Mengubah data acuan modul |
| **Kelola** | Verifikasi + mengubah data acuan, butir checklist, ambang | |

Kewenangan Verifikasi selalu tunduk pada AB-17: tidak ada peran yang boleh
memverifikasi catatan yang ia sendiri menjadi penanggung jawabnya.

## Matriks hak akses

| Modul | Operator | QHSE | Manajemen | Admin |
|---|---|---|---|---|
| Incident & Nearmiss | Isi | Verifikasi | Baca | Kelola |
| Laporan Bahaya K3L | Isi | Verifikasi | Baca | Kelola |
| Safety Checklist | Isi | Verifikasi | — | Kelola |
| Work Permit & JSEA | — | Verifikasi | Verifikasi | Kelola |
| Manajemen Risiko | — | Isi | Verifikasi | Kelola |
| CAPA | Baca | Verifikasi | Baca | Kelola |
| Audit | — | Isi | Baca | Kelola |
| Environment | — | Isi | Baca | Kelola |
| SHE KPI & Analytics | — | Baca | Baca | Kelola |
| User Management | — | — | — | Kelola |
| Asisten QHSE | Baca | Baca | Baca | Kelola |
| Analisis JSA | Baca | Isi | Verifikasi | Kelola |
| HIRADC K3 | — | Isi | Verifikasi | Kelola |
| Induksi K3 | Baca | Isi | Baca | Kelola |
| Regulasi K3 | Baca | Isi | Baca | Kelola |

Petugas Lingkungan tidak tercantum sebagai kolom karena kewenangannya sama
dengan QHSE Supervisor pada modul Environment, Dokumen Eksternal, CAPA, HIRADC,
Induksi, dan Regulasi, serta tidak punya akses pada sisanya. Tahap 1 menetapkan
apakah peran ini dipertahankan atau digabung.

## Daftar modul per peran

Dipakai langsung oleh menu aplikasi meja dan petak menu aplikasi lapangan.

| Peran | Modul yang terbuka |
|---|---|
| `operator` | dashboard, ai, jsa, induksi, regulasi, incident, hazard, checklist, bbs, activity |
| `qhse` | dashboard, ai, jsa, hiradc, induksi, regulasi, incident, hazard, bbs, inspection, checklist, permit, risk, capa, audit, environment, docint, docext, training, activity, kpi, notif, settings |
| `lingkungan` | dashboard, ai, hiradc, induksi, regulasi, environment, docext, capa, notif, settings |
| `manajemen` | exec, dashboard, ai, jsa, hiradc, induksi, regulasi, kpi, audit, environment, risk, capa, permit, notif, settings |
| `admin` | seluruh 25 modul |

Dua hal yang tampak ganjil tetapi disengaja:

- **Operator melihat JSA, tidak melihat HIRADC.** JSA dibaca sebelum pekerjaan
  dimulai; HIRADC adalah dokumen penilaian tingkat QHSE.
- **Petugas Lingkungan melihat HIRADC, tidak melihat JSA.** Aspek lingkungan
  menjadi masukan HIRADC; JSA bukan alat kerjanya.

## Pengecualian: melapor tidak dibatasi peran

Lima formulir pelaporan di aplikasi lapangan terbuka untuk seluruh peran, tanpa
memandang matriks di atas:

| Formulir | Alasan terbuka untuk semua |
|---|---|
| Lapor Bahaya | Menutup jalur pelaporan berarti bahaya tidak dilaporkan sama sekali |
| Lapor Insiden | Sama |
| Observasi Perilaku | Sama |
| Observasi APD | Sama |
| Ajukan Izin Kerja | Yang meminta izin justru operator yang akan mengerjakan (AB-12) |

Yang dibatasi peran adalah **membaca register dan menyetujuinya**, bukan
mengajukannya. Kiriman dari peran yang tidak punya akses baca ke modul tujuan
tetap masuk sebagai kiriman lapangan yang menunggu verifikasi (AB-05).

## Cakupan data

Selain modul, hak akses juga dibatasi cakupan data.

| Peran | Pabrik | Area |
|---|---|---|
| `operator` | Pabrik penempatannya | Seluruh area pabrik itu |
| `qhse` | Pabrik penempatannya | Seluruh area pabrik itu |
| `lingkungan` | Pabrik penempatannya | Seluruh area pabrik itu |
| `manajemen` | Pabrik penempatannya | Seluruh area pabrik itu |
| `admin` | Seluruh pabrik | Seluruh area |

Pembatasan cakupan diterapkan di peladen, bukan di antarmuka. Permintaan API
untuk pabrik di luar cakupan pengguna dijawab `403`, bukan daftar kosong —
daftar kosong tidak dapat dibedakan dari "memang tidak ada data".

## Autentikasi

| Hal | Ketentuan |
|---|---|
| Sumber identitas | Direktori perusahaan (SSO/LDAP). Sistem tidak menyimpan kata sandi |
| Pemetaan peran | Grup direktori dipetakan ke peran oleh Administrator Sistem |
| Sesi | Berakhir setelah 12 jam tidak aktif pada aplikasi meja |
| Sesi lapangan | Berakhir setelah 30 hari, supaya pekerja tidak perlu masuk ulang di tengah shift |
| Pencabutan | Penonaktifan akun di direktori mencabut akses pada sinkronisasi berikutnya, paling lambat 15 menit |

Pada purwarupa, akun dan kata sandi tertulis di dalam kode. Ini **harus**
diganti sebelum sistem dipakai dengan data sungguhan.

## Jejak audit hak akses

Perubahan berikut wajib tercatat dengan siapa, kapan, dan nilai sebelumnya:

- Pembuatan, penonaktifan, dan penghapusan pengguna
- Perubahan peran pengguna
- Perubahan matriks hak akses
- Perubahan pemetaan grup direktori ke peran

Catatan jejak audit tidak dapat dihapus atau diubah lewat antarmuka mana pun,
termasuk oleh Administrator Sistem.
