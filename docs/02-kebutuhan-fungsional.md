# 02 · Kebutuhan fungsional

Setiap kebutuhan berkode `KF-<modul>-<urut>` dan ditulis sebagai kemampuan yang
dapat diuji. Kata **harus** berarti wajib; **sebaiknya** berarti dianjurkan dan
boleh ditunda ke rilis berikutnya dengan persetujuan tertulis.

Aturan yang ditegakkan sistem dirujuk sebagai `AB-xx` dan dirinci pada
[03 · Aturan bisnis](03-aturan-bisnis.md).

---

## Kelompok A · Kejadian dan bahaya

### Modul 01 · Incident & Nearmiss

Mencatat kejadian, mengklasifikasi, menginvestigasi sampai akar masalah, lalu
melahirkan CAPA.

| Kode | Kebutuhan |
|---|---|
| KF-01-01 | Sistem harus mencatat kejadian dengan jenis Nearmiss, Incident, atau Accident, dan tingkat keparahan Ringan, Sedang, atau Serius |
| KF-01-02 | Setiap kejadian harus menyimpan kronologi, dampak, lokasi, tanggal, waktu, dan pelapor |
| KF-01-03 | Sistem harus menyediakan isian akar masalah yang terpisah dari kronologi |
| KF-01-04 | Setiap kejadian harus dapat menghasilkan satu atau lebih CAPA; nomor CAPA ditampilkan pada rincian kejadian (AB-01) |
| KF-01-05 | Kejadian berkeparahan Serius harus memicu pemberitahuan seketika ke QHSE Supervisor dan Plant Manager pabrik terkait (AB-02) |
| KF-01-06 | Sistem harus mencatat hari kerja hilang untuk kejadian yang menyebabkannya, dan menjumlahkannya per periode |
| KF-01-07 | Kejadian tidak dapat ditutup sebelum seluruh CAPA turunannya berstatus Selesai dan terverifikasi (AB-03) |
| KF-01-08 | Nearmiss harus melalui alur pencatatan dan investigasi yang sama dengan Accident, tanpa jalur pintas |

### Modul 04 · Laporan Bahaya K3L

| Kode | Kebutuhan |
|---|---|
| KF-04-01 | Sistem harus menerima laporan bahaya dengan isian wajib: area, satu kalimat keterangan |
| KF-04-02 | Sistem harus menerima foto dan titik koordinat sebagai isian opsional |
| KF-04-03 | Sistem harus menerima laporan anonim, dan laporan anonim masuk antrean verifikasi dengan bobot yang sama (AB-04) |
| KF-04-04 | Sistem harus menampilkan tindak lanjut sebagai tiga kolom: Baru, Ditangani, Selesai |
| KF-04-05 | Laporan yang belum diverifikasi tidak boleh dihitung dalam KPI mana pun (AB-05) |
| KF-04-06 | Sistem harus menampilkan tren jumlah laporan 12 bulan terakhir berikut catatan bahwa kenaikan adalah tanda baik |

### Modul 16 · Observasi Perilaku

| Kode | Kebutuhan |
|---|---|
| KF-16-01 | Sistem harus mencatat jumlah perilaku aman dan perilaku berisiko yang teramati, dengan isian perilaku aman didahulukan |
| KF-16-02 | Sistem tidak boleh menyimpan identitas pekerja yang diamati pada observasi perilaku maupun observasi APD (AB-06) |
| KF-16-03 | Sistem harus mencatat catatan percakapan tindak lanjut di lokasi |
| KF-16-04 | Sistem harus mencatat observasi APD dengan jumlah pekerja diamati, jumlah patuh, dan rincian per jenis APD |
| KF-16-05 | Sistem harus menolak jumlah patuh yang melebihi jumlah pekerja diamati (AB-07) |
| KF-16-06 | Sistem harus menghitung kepatuhan APD per jenis per area dan mengalirkannya ke KPI leading |

---

## Kelompok B · Pengendalian

### Modul 02 · Inspection

| Kode | Kebutuhan |
|---|---|
| KF-02-01 | Sistem harus menyediakan checklist inspeksi terjadwal dengan butir yang dapat dikelola administrator |
| KF-02-02 | Jawaban "Tidak Sesuai" harus membuka isian temuan wajib: uraian, tingkat risiko, penanggung jawab, tenggat |
| KF-02-03 | Temuan inspeksi harus otomatis membentuk CAPA dengan tautan balik ke inspeksinya (AB-01) |
| KF-02-04 | Inspeksi tidak dapat ditandai selesai bila masih ada butir belum dijawab |

### Modul 15 · Safety Checklist

| Kode | Kebutuhan |
|---|---|
| KF-15-01 | Sistem harus menyediakan checklist per shift per alat atau area, dengan frekuensi dan penanggung jawab |
| KF-15-02 | Satu butir dijawab "Tidak Sesuai" harus mengunci unit dari operasi sampai temuannya ditutup (AB-08) |
| KF-15-03 | Status kunci operasi harus terlihat pada daftar alat, bukan hanya di dalam checklist |
| KF-15-04 | Checklist harus dapat dikerjakan dari aplikasi lapangan tanpa sinyal |

### Modul 03 · Work Permit & JSEA

| Kode | Kebutuhan |
|---|---|
| KF-03-01 | Sistem harus menerbitkan izin kerja berjenis Panas, Ruang Terbatas, Ketinggian, Listrik, dan Penggalian |
| KF-03-02 | Izin tidak dapat berstatus Aktif sebelum JSEA-nya lengkap dan disahkan (AB-09) |
| KF-03-03 | Izin dengan risiko sisa di zona Ekstrem harus ditolak penerbitannya, bukan diberi peringatan (AB-10) |
| KF-03-04 | Setiap jenis izin harus membawa daftar prasyarat yang dicentang sebelum penerbitan |
| KF-03-05 | Pekerjaan vendor harus membawa verifikasi induksi K3 dan asuransi yang masih berlaku (AB-11) |
| KF-03-06 | Izin yang menunggu persetujuan lebih dari 24 jam harus naik ke Dashboard Eksekutif |
| KF-03-07 | Sistem harus menerima pengajuan izin dari aplikasi lapangan; pengajuan bukan penerbitan (AB-12) |

### Modul 22 · Analisis JSA

| Kode | Kebutuhan |
|---|---|
| KF-22-01 | Sistem harus menyimpan JSA per jenis pekerjaan sebagai pustaka yang dipakai ulang |
| KF-22-02 | Setiap JSA harus terdiri atas langkah kerja berurutan; tiap langkah membawa bahaya, pengendalian, skor awal, dan skor sisa |
| KF-22-03 | Setiap pengendalian harus ditandai tingkat hierarkinya: Eliminasi, Substitusi, Rekayasa, Administratif, atau APD |
| KF-22-04 | Kolom risiko pada daftar JSA harus memakai skor tertinggi di antara seluruh langkah, bukan rata-rata (AB-13) |
| KF-22-05 | JSA berstatus selain Disahkan tidak dapat dilampirkan pada izin kerja (AB-09) |
| KF-22-06 | Sistem harus menampilkan sebaran tingkat hierarki yang dipakai seluruh pustaka |
| KF-22-07 | JSA harus dapat dibaca dari aplikasi lapangan tanpa sinyal |

### Modul 23 · HIRADC K3

| Kode | Kebutuhan |
|---|---|
| KF-23-01 | Sistem harus menilai bahaya pada tingkat aktivitas dengan sifat Rutin, Non-rutin, atau Darurat |
| KF-23-02 | Setiap baris harus membawa kategori sumber bahaya dari daftar tetap: Fisik, Kimia, Mekanik, Listrik, Ergonomi, Biologi, Psikososial |
| KF-23-03 | Setiap baris harus menyimpan penilaian awal dan sisa sebagai kemungkinan × keparahan pada matriks 5×5 (AB-14) |
| KF-23-04 | Penilaian sisa hanya boleh diturunkan setelah pengendalian tambahan berstatus Selesai (AB-15) |
| KF-23-05 | Aktivitas dengan risiko sisa zona Ekstrem harus menghalangi penerbitan izin kerja untuk aktivitas itu (AB-10) |
| KF-23-06 | Sistem harus menampilkan jumlah aktivitas per kategori sumber bahaya |

### Modul 12 · Manajemen Risiko

| Kode | Kebutuhan |
|---|---|
| KF-12-01 | Sistem harus menjalankan enam tahap ISO 31000 secara berurutan dan menampilkan seluruhnya |
| KF-12-02 | Setiap risiko harus membawa skor awal, opsi penanganan, skor sisa, penanggung jawab, dan tanggal reviu berikutnya |
| KF-12-03 | Matriks risiko harus sama persis dengan yang dipakai JSA dan HIRADC (AB-14) |
| KF-12-04 | Risiko yang melewati tanggal reviu harus muncul sebagai pemberitahuan |

### Modul 10 · CAPA

| Kode | Kebutuhan |
|---|---|
| KF-10-01 | CAPA tidak dapat dibuat berdiri sendiri; setiap CAPA harus berasal dari modul lain dan menyimpan tautan balik (AB-01) |
| KF-10-02 | Penuaan CAPA dihitung dari tanggal terbit, bukan tanggal tenggat (AB-16) |
| KF-10-03 | CAPA harus menyimpan bukti penyelesaian sebelum dapat diverifikasi |
| KF-10-04 | Verifikator CAPA tidak boleh orang yang sama dengan penanggung jawabnya (AB-17) |

---

## Kelompok C · Kepatuhan

### Modul 05 · Audit

| Kode | Kebutuhan |
|---|---|
| KF-05-01 | Sistem harus mengelola program audit untuk ISO 45001, ISO 14001, dan SMK3 PP 50/2012 dalam satu daftar |
| KF-05-02 | Setiap temuan harus berkategori Major, Minor, atau Observasi |
| KF-05-03 | Temuan Major dan Minor wajib punya CAPA bertenggat sebelum audit dapat ditutup (AB-18) |
| KF-05-04 | Temuan Major yang lewat tenggat harus naik ke Dashboard Eksekutif |
| KF-05-05 | Sistem harus menampilkan pemenuhan 12 elemen SMK3 beserta kriteria yang belum terpenuhi, bukan hanya persentasenya |

### Modul 06 · Environment

| Kode | Kebutuhan |
|---|---|
| KF-06-01 | Sistem harus mencatat parameter lingkungan pada empat bidang: Waste Management, PPPA, PPPU, dan PLB3 |
| KF-06-02 | Setiap nilai terukur harus disimpan berikut baku mutunya dan satuannya (AB-19) |
| KF-06-03 | Nilai yang melampaui baku mutu harus ditandai dan memicu CAPA |
| KF-06-04 | Sistem harus menyimpan jadwal pelaporan wajib beserta bukti pengirimannya |

### Modul 13 · Dokumen Internal

| Kode | Kebutuhan |
|---|---|
| KF-13-01 | Sistem harus mengelola dokumen dalam empat tingkat: manual/kebijakan, prosedur, instruksi kerja, formulir |
| KF-13-02 | Setiap dokumen harus membawa nomor, revisi, pemilik, tanggal terbit, dan tanggal tinjau ulang |
| KF-13-03 | Dokumen yang melewati tanggal tinjau ulang harus ditandai dan muncul sebagai pemberitahuan (AB-20) |
| KF-13-04 | Sistem harus menyimpan riwayat revisi; revisi lama tidak dihapus |

### Modul 14 · Dokumen Eksternal

| Kode | Kebutuhan |
|---|---|
| KF-14-01 | Sistem harus mengelola sertifikat, izin, dan pelaporan wajib terbitan pihak luar |
| KF-14-02 | Daftar harus diurutkan menurut sisa masa berlaku, bukan abjad (AB-21) |
| KF-14-03 | Dokumen dengan sisa masa berlaku 90, 30, dan 7 hari harus memicu pemberitahuan berjenjang |

### Modul 25 · Regulasi K3

| Kode | Kebutuhan |
|---|---|
| KF-25-01 | Sistem harus menyimpan peraturan perundangan beserta nomor, penerbit, bidang, dan pasal yang relevan |
| KF-25-02 | Setiap peraturan wajib punya kolom penerapan dan kolom bukti (AB-22) |
| KF-25-03 | Peraturan tanpa kolom bukti terisi harus berstatus belum terpenuhi (AB-22) |
| KF-25-04 | Status pemenuhan terbatas pada tiga nilai: Terpenuhi, Terpenuhi Sebagian, Tidak Terpenuhi |
| KF-25-05 | Sistem harus menyimpan tanggal evaluasi penaatan dan memicu pemberitahuan setahun sekali |
| KF-25-06 | Peraturan harus dapat dibaca dari aplikasi lapangan tanpa sinyal |

---

## Kelompok D · Pengembangan

### Modul 24 · Induksi K3

| Kode | Kebutuhan |
|---|---|
| KF-24-01 | Sistem harus menerbitkan kartu induksi untuk Pekerja Baru, Kontraktor, dan Tamu |
| KF-24-02 | Masa berlaku diberikan otomatis menurut jenis peserta: 12, 6, dan 3 bulan (AB-23) |
| KF-24-03 | Nilai uji pemahaman di bawah ambang lulus harus menghasilkan status Tidak Lulus, bukan kartu berlaku (AB-24) |
| KF-24-04 | Kartu kedaluwarsa harus menghalangi penerbitan izin kerja bagi pemegangnya (AB-11) |
| KF-24-05 | Materi induksi harus tersimpan di sistem dan dapat dibaca ulang dari aplikasi lapangan tanpa sinyal |
| KF-24-06 | Sistem harus memberi tahu 30 hari sebelum kartu berakhir |

### Modul 11 · Manajemen Pelatihan

| Kode | Kebutuhan |
|---|---|
| KF-11-01 | Setiap program pelatihan harus menyimpan jadwal, rencana peserta, dan aktual peserta berdampingan |
| KF-11-02 | Sistem harus menghitung selisih rencana dan aktual serta menampilkannya sebagai angka, bukan hanya daftar |
| KF-11-03 | Sistem harus menyimpan sertifikasi personel wajib beserta masa berlakunya |
| KF-11-04 | Sertifikasi yang hampir berakhir harus memicu pemberitahuan berjenjang seperti KF-14-03 |

### Modul 09 · SHE Activity

| Kode | Kebutuhan |
|---|---|
| KF-09-01 | Sistem harus menyimpan kegiatan K3 beserta foto, jumlah peserta, dan durasinya |
| KF-09-02 | Jumlah peserta dikalikan durasi harus mengisi KPI Jam Pelatihan K3 (AB-25) |
| KF-09-03 | Kegiatan wajib berkala yang belum terlaksana harus tetap terlihat sebagai kartu kosong |

### Modul 08 · SHE KPI & Analytics

| Kode | Kebutuhan |
|---|---|
| KF-08-01 | Indikator lagging dan leading harus dipisah tegas dan tidak dicampur dalam satu baris (AB-26) |
| KF-08-02 | Setiap ubin KPI harus menampilkan rumus dan basis perhitungannya (AB-27) |
| KF-08-03 | LTIFR memakai basis 1.000.000 jam kerja; TRIR memakai 200.000 jam kerja; keduanya tidak boleh dibandingkan langsung (AB-27) |
| KF-08-04 | Sistem harus menampilkan perbandingan antarpabrik untuk setiap indikator |

---

## Kelompok E · Ringkasan, asisten, administrasi

### Modul 17 · Dashboard Eksekutif

| Kode | Kebutuhan |
|---|---|
| KF-17-01 | Sistem harus menampilkan kartu skor per pabrik berdampingan dengan angka grup (AB-28) |
| KF-17-02 | Status pabrik ditentukan oleh indikator terburuknya, bukan rata-rata (AB-28) |
| KF-17-03 | Sistem harus menampilkan program strategis beserta kemajuannya terhadap target |

### Modul 07 · Dashboard & Laporan

| Kode | Kebutuhan |
|---|---|
| KF-07-01 | Sistem harus menampilkan hal yang lewat tenggat, menunggu keputusan, dan melewati ambang, lintas modul |
| KF-07-02 | Sistem harus membangkitkan laporan bulanan siap cetak |
| KF-07-03 | Laporan harus dapat diekspor ke PDF dan Excel |

### Modul 21 · Asisten QHSE

| Kode | Kebutuhan |
|---|---|
| KF-21-01 | Sistem harus menyediakan pencarian satu kata ke seluruh catatan sistem sekaligus |
| KF-21-02 | Hasil pencarian harus disaring menurut peran pengguna; catatan pada modul yang tidak terbuka tidak ditampilkan (AB-29) |
| KF-21-03 | Jumlah catatan yang tersaring karena peran harus disebutkan apa adanya |
| KF-21-04 | Sistem harus membantu menyusun kerangka dokumen ISO baru dan ringkasan untuk rapat manajemen |

### Modul 18 · Notifikasi

| Kode | Kebutuhan |
|---|---|
| KF-18-01 | Pemberitahuan hanya dikirim bila membawa tindakan: lewat tenggat, menunggu keputusan penerima, atau melewati ambang (AB-30) |
| KF-18-02 | Setiap pemberitahuan harus membawa tautan langsung ke tempat pekerjaannya |
| KF-18-03 | Menandai terbaca tidak menghentikan pengingat; item lewat tenggat dikirim ulang harian sampai ditutup di modulnya (AB-31) |
| KF-18-04 | Sistem harus mengirim lewat aplikasi, surel, dan pesan; kejadian Serius juga lewat pemberitahuan dorong |

### Modul 20 · User Management

| Kode | Kebutuhan |
|---|---|
| KF-20-01 | Sistem harus mengelola pengguna, peran, dan matriks hak akses per modul |
| KF-20-02 | Matriks hak akses harus berlaku sama di aplikasi meja dan aplikasi lapangan (AB-32) |
| KF-20-03 | Tingkat kewenangan per modul terbatas pada: tidak ada akses, Baca, Isi, Verifikasi, Kelola |
| KF-20-04 | Perubahan peran dan hak akses harus tercatat pada jejak audit |

### Modul 19 · Pengaturan

| Kode | Kebutuhan |
|---|---|
| KF-19-01 | Pengguna harus dapat memilih bahasa dan tema; pilihan berlaku di kedua aplikasi (AB-33) |
| KF-19-02 | Pengguna harus dapat memilih pabrik dan periode aktif sesuai hak aksesnya |

---

## Aplikasi lapangan

Kebutuhan rinci ada pada [08 · Aplikasi lapangan](08-aplikasi-lapangan.md).
Ringkasnya:

| Kode | Kebutuhan |
|---|---|
| KF-LP-01 | Aplikasi harus dapat dipasang di Android dari peramban tanpa toko aplikasi |
| KF-LP-02 | Aplikasi harus tetap terbuka dan tetap mencatat tanpa sinyal |
| KF-LP-03 | Laporan yang dibuat tanpa sinyal harus masuk antrean dan terkirim sendiri saat sinyal kembali |
| KF-LP-04 | Aplikasi harus menerima lima jenis laporan: bahaya, insiden, observasi perilaku, observasi APD, pengajuan izin kerja |
| KF-LP-05 | Aplikasi harus menyediakan empat rujukan yang terbaca tanpa sinyal: JSA, HIRADC, Induksi, Regulasi |
| KF-LP-06 | Kiriman lapangan harus bernomor dengan awalan berbeda dan belum dihitung dalam KPI sampai diverifikasi (AB-05) |
