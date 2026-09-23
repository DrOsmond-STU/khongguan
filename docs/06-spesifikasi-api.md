# 06 · Spesifikasi API

API adalah satu-satunya jalan masuk ke data. Aturan bisnis ditegakkan di sini,
bukan di antarmuka — antarmuka yang menegakkan aturan hanya menyembunyikan
tombol, dan tombol yang tersembunyi masih dapat dipanggil.

## Ketentuan umum

| Hal | Ketentuan |
|---|---|
| Gaya | REST, JSON, `application/json; charset=utf-8` |
| Awalan | `/api/v1` |
| Versi | Perubahan yang merusak menaikkan versi jalur, bukan menambah parameter |
| Waktu | ISO 8601 UTC, contoh `2026-09-23T07:12:00Z` |
| Bahasa | Header `Accept-Language: id` atau `en`. Hanya memengaruhi pesan sistem, tidak pernah isi rekaman (AB-35) |
| Penomoran halaman | `?hal=1&per_hal=50`, maksimum 200 |
| Penyaringan | `?pabrik=<id>&status=<nilai>&dari=<tanggal>&sampai=<tanggal>` |
| Pengurutan | `?urut=-tanggal` (tanda minus berarti menurun) |

## Autentikasi

Sesi dibuka lewat penyedia identitas perusahaan (OIDC). Sistem tidak pernah
menerima atau menyimpan kata sandi.

```
POST /api/v1/sesi/mulai      → mengarahkan ke penyedia identitas
POST /api/v1/sesi/tukar      → menukar kode otorisasi dengan token
POST /api/v1/sesi/perbarui   → memperbarui token dengan refresh token
POST /api/v1/sesi/akhiri     → mengakhiri sesi
GET  /api/v1/saya            → profil, peran, modul yang terbuka, pabrik
```

`GET /api/v1/saya` adalah panggilan pertama setiap klien. Balasannya menentukan
menu yang digambar — klien tidak pernah menyusun daftar modulnya sendiri
(AB-32).

```json
{
  "id": "0f5c…", "nama": "Fadli Saldi", "inisial": "FS",
  "peran": { "kode": "qhse", "nama": "QHSE Supervisor" },
  "pabrik": { "id": "a71b…", "nama": "Cibitung" },
  "modul": ["dashboard", "ai", "jsa", "hiradc", "…"],
  "kewenangan": { "incident": "verifikasi", "jsa": "isi", "…": "…" }
}
```

## Bentuk balasan

Daftar:

```json
{ "data": [ … ], "hal": 1, "per_hal": 50, "total": 318 }
```

Satu catatan:

```json
{ "data": { … } }
```

Galat:

```json
{
  "galat": {
    "kode": "ATURAN_ZONA_EKSTREM",
    "pesan": "Izin tidak dapat diterbitkan: langkah 3 pada JSA-2026-012 berada di zona Ekstrem.",
    "aturan": "AB-10",
    "rincian": { "jsa": "JSA-2026-012", "langkah": 3, "skor_sisa": 16 }
  }
}
```

Setiap penolakan karena aturan bisnis **wajib** menyebutkan kode aturannya.
Tanpa itu, pengguna hanya tahu ditolak, tidak tahu apa yang harus diperbaiki —
dan pengembang tidak dapat menelusuri aturan mana yang bekerja.

## Kode status

| Kode | Dipakai untuk |
|---|---|
| `200` | Berhasil |
| `201` | Catatan dibuat |
| `400` | Isian tidak sahih |
| `401` | Sesi tidak ada atau kedaluwarsa |
| `403` | Peran tidak berwenang, atau data di luar cakupan pabrik |
| `409` | Ditolak aturan bisnis |
| `422` | Isian sahih tetapi tidak konsisten (misalnya patuh > diamati) |
| `429` | Terlalu banyak permintaan |

Data di luar cakupan pabrik dijawab `403`, **bukan** daftar kosong. Daftar
kosong tidak dapat dibedakan dari "memang tidak ada data".

## Endpoint per modul

Pola sama untuk seluruh modul transaksi; contoh memakai insiden.

```
GET    /api/v1/insiden               daftar
POST   /api/v1/insiden               buat
GET    /api/v1/insiden/{id}          rincian
PATCH  /api/v1/insiden/{id}          ubah
POST   /api/v1/insiden/{id}/verifikasi
POST   /api/v1/insiden/{id}/tutup    ditolak bila CAPA belum selesai (AB-03)
GET    /api/v1/insiden/{id}/capa     CAPA turunannya
POST   /api/v1/insiden/{id}/lampiran unggah foto
```

Jalur setara berlaku untuk: `bahaya`, `inspeksi`, `checklist`, `izin`, `jsa`,
`hiradc`, `risiko`, `capa`, `audit`, `lingkungan`, `dokumen-internal`,
`dokumen-eksternal`, `regulasi`, `induksi`, `pelatihan`, `kegiatan`,
`observasi`, `observasi-apd`, `pengguna`.

### Endpoint khusus

```
POST /api/v1/capa                     wajib sumber_jenis + sumber_id (AB-01)
POST /api/v1/izin                     wajib jsa_id; JSA harus Disahkan (AB-09)
POST /api/v1/izin/{id}/terbitkan      memeriksa AB-10, AB-11
POST /api/v1/jsa/{id}/sahkan          hanya peran dengan kewenangan Verifikasi
POST /api/v1/hiradc/{id}/nilai-sisa   ditolak bila kendali tambahan belum Selesai (AB-15)
GET  /api/v1/kpi                      ubin KPI beserta rumus dan basisnya (AB-27)
GET  /api/v1/kpi/pabrik               kartu skor per pabrik (AB-28)
GET  /api/v1/cari?q=…                 pencarian menyeluruh, disaring peran (AB-29)
GET  /api/v1/notifikasi               kotak masuk pengguna
POST /api/v1/notifikasi/{id}/baca     menandai terbaca, tidak menghentikan pengingat (AB-31)
GET  /api/v1/acuan                    seluruh data acuan dalam satu panggilan
GET  /api/v1/ekspor/{modul}?format=pdf|xlsx
```

`GET /api/v1/acuan` dipakai aplikasi lapangan untuk mengisi simpanan luringnya
dalam satu panggilan, bukan belasan.

## Sinkronisasi aplikasi lapangan

Bagian yang paling menentukan apakah aplikasi lapangan berguna. Rinciannya pada
[08 · Aplikasi lapangan](08-aplikasi-lapangan.md); bentuk API-nya di sini.

### Mengirim antrean

```
POST /api/v1/lapangan/kirim
```

Badan permintaan berisi seluruh antrean sekaligus:

```json
{
  "perangkat_id": "e3a9…",
  "kiriman": [
    {
      "id_lokal": "HZ-L-0007",
      "jenis": "bahaya",
      "dibuat_pada": "2026-09-23T02:14:00Z",
      "area_id": "…", "isi": "Selang APAR A-14 bocor di sambungan.",
      "kategori": "Kondisi Tidak Aman", "risiko": "Sedang",
      "koordinat": { "lat": -6.27030, "lon": 107.15410, "akurasi_m": 12 },
      "lampiran": ["<id unggahan>"]
    }
  ]
}
```

Balasan menyebutkan nasib tiap kiriman satu per satu:

```json
{
  "hasil": [
    { "id_lokal": "HZ-L-0007", "status": "diterima", "nomor": "HZ-2026-0451" },
    { "id_lokal": "APD-L-0003", "status": "ditolak", "aturan": "AB-07",
      "pesan": "Jumlah patuh melebihi jumlah yang diamati." }
  ]
}
```

Tiga ketentuan yang mengikat:

1. **Idempoten.** `id_lokal` + `perangkat_id` menjadi kunci. Mengirim ulang
   antrean yang sama tidak menggandakan catatan. Sinyal yang putus di tengah
   pengiriman adalah keadaan biasa, bukan kekecualian.
2. **Sebagian berhasil adalah hasil yang sah.** Satu kiriman ditolak tidak
   menggagalkan sisanya. Klien hanya menghapus dari antrean yang berstatus
   `diterima`.
3. **Penolakan menyebutkan aturannya.** Kiriman yang ditolak tetap ada di
   perangkat beserta alasannya, supaya pelapor dapat memperbaikinya.

### Mengambil rujukan luring

```
GET /api/v1/lapangan/rujukan?sejak=<ISO8601>
```

Mengembalikan JSA, HIRADC, materi induksi, regulasi, area, dan jenis APD yang
berubah sejak waktu itu — disaring menurut peran (AB-32). Klien menyimpannya
untuk dibaca tanpa sinyal.

### Unggah foto

```
POST /api/v1/lampiran        multipart, mengembalikan id unggahan
```

Foto diunggah terpisah dari kiriman supaya kegagalan unggah tidak menggagalkan
laporannya. Laporan tanpa foto tetap sah; foto tanpa laporan dibuang setelah
24 jam.

## Pembatasan laju

| Titik | Batas |
|---|---|
| Umum | 120 permintaan per menit per pengguna |
| `POST /lapangan/kirim` | 10 per menit per perangkat |
| `POST /lampiran` | 30 per menit per perangkat |
| `GET /cari` | 30 per menit per pengguna |

## Yang tidak disediakan API

- Penghapusan fisik catatan transaksi.
- Pengubahan atau penghapusan baris jejak audit.
- Meloloskan peserta induksi yang tidak lulus (AB-24).
- Menerbitkan izin pada zona Ekstrem (AB-10), termasuk oleh Administrator.
- Membaca identitas pekerja yang diamati pada observasi (AB-06) — data itu
  memang tidak pernah disimpan.
