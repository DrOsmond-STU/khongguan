# 03 · Aturan bisnis

Aturan di sini adalah **penolakan yang ditegakkan sistem**, bukan peringatan
yang dapat dilewati. Sistem K3 yang hanya mengingatkan akan dilewati; yang
menolak tidak bisa.

Setiap aturan menyebutkan pelanggarannya, tindakan sistem, dan alasannya.
Alasan ikut ditulis karena aturan tanpa alasan adalah aturan yang akan dicabut
oleh orang berikutnya yang merasa terganggu olehnya.

---

## Ketertelusuran

### AB-01 · CAPA selalu punya induk

**Aturan.** CAPA tidak dapat dibuat berdiri sendiri. Setiap CAPA berasal dari
kejadian, temuan inspeksi, temuan audit, pelampauan baku mutu lingkungan, atau
observasi, dan menyimpan tautan balik ke sumbernya.

**Tindakan sistem.** Tombol "CAPA baru" hanya ada di dalam modul sumber. API
menolak pembuatan CAPA tanpa `sumber_jenis` dan `sumber_id` yang sahih.

**Alasan.** CAPA yatim tidak dapat dibuktikan asal-usulnya kepada auditor, dan
tidak dapat dipakai menutup temuan apa pun.

### AB-03 · Kejadian ditutup setelah CAPA-nya selesai

**Aturan.** Kejadian tidak dapat berstatus Selesai selama masih ada CAPA
turunannya yang belum Selesai dan terverifikasi.

**Tindakan sistem.** Pilihan status Selesai tidak tersedia; API menolak dengan
menyebut nomor CAPA yang menahannya.

### AB-16 · Penuaan dihitung dari tanggal terbit

**Aturan.** Umur CAPA dihitung dari tanggal terbit, bukan tanggal tenggat.

**Alasan.** Bila dihitung dari tenggat, memperpanjang tenggat akan
"memudakan" CAPA yang sudah lama macet, dan modul kehilangan gunanya sebagai
alat pengawasan.

### AB-17 · Tidak ada verifikasi diri sendiri

**Aturan.** Verifikator CAPA tidak boleh orang yang sama dengan penanggung
jawabnya. Berlaku juga untuk verifikasi laporan bahaya, temuan inspeksi, dan
temuan audit.

**Tindakan sistem.** Nama pengguna yang sedang masuk tidak muncul pada daftar
pilihan verifikator bila ia penanggung jawabnya; API menolak dengan galat.

**Alasan.** Sistem K3 yang memperbolehkan penutupan sendiri kehilangan gunanya
sebagai bukti audit.

---

## Pekerjaan berisiko tinggi

### AB-09 · Izin butuh JSA yang disahkan

**Aturan.** Izin kerja tidak dapat berstatus Aktif sebelum JSA-nya lengkap dan
berstatus Disahkan. JSA berstatus Draf atau Menunggu Pengesahan tidak dapat
dilampirkan.

**Alasan.** Izin yang terbit dengan JSA draf adalah temuan audit.

### AB-10 · Zona Ekstrem menutup penerbitan

**Aturan.** Bila risiko sisa pada JSA atau baris HIRADC terkait berada di zona
Ekstrem (skor ≥ 15), izin kerja untuk pekerjaan itu **ditolak penerbitannya**.

**Tindakan sistem.** Penolakan, bukan peringatan. Pesan menyebutkan langkah
kerja mana yang menahannya.

**Pengecualian.** Tidak ada. Penurunan skor hanya sah lewat pengendalian
tambahan yang benar-benar terpasang (AB-15).

### AB-11 · Kartu induksi adalah gerbang

**Aturan.** Izin kerja tidak dapat diterbitkan bagi pelaksana yang kartu
induksinya kedaluwarsa atau berstatus Tidak Lulus. Untuk pekerjaan vendor,
asuransi yang masih berlaku juga wajib.

**Alasan.** Kontraktor dengan kartu kedaluwarsa yang tetap bekerja adalah
temuan audit sekaligus pelanggaran kewajiban pengendalian kontraktor.

### AB-12 · Pengajuan bukan penerbitan

**Aturan.** Pengajuan izin dari aplikasi lapangan hanya membuat permintaan.
Persetujuan dan penerbitan tetap di aplikasi meja pada peran yang berwenang.

**Catatan.** Formulir pengajuan **tidak** dibatasi peran, meski modul Work
Permit dibatasi. Yang meminta izin justru operator yang akan mengerjakan;
menutup jalur permintaannya berarti pekerjaan berisiko tinggi dimulai tanpa
izin sama sekali.

### AB-08 · Satu butir Tidak Sesuai mengunci unit

**Aturan.** Satu butir checklist dijawab "Tidak Sesuai" mengunci unit dari
operasi sampai temuannya ditutup.

**Tindakan sistem.** Status unit berubah menjadi Terkunci dan terlihat pada
daftar alat, bukan hanya di dalam checklist.

**Alasan.** Ini gerbang operasi, bukan peringatan yang bisa dilewati.

---

## Penilaian risiko

### AB-14 · Satu matriks untuk seluruh sistem

**Aturan.** Matriks risiko 5×5 (kemungkinan × keparahan) dan kosakata zonanya
sama persis di JSA, HIRADC, dan Manajemen Risiko.

| Skor | Zona |
|---|---|
| 15–25 | Ekstrem |
| 10–14 | Tinggi |
| 5–9 | Sedang |
| 1–4 | Rendah |

**Alasan.** Tiga matriks berbeda dalam satu sistem menghasilkan tiga angka yang
tidak dapat dibandingkan.

### AB-15 · Skor sisa turun setelah pengendalian terpasang

**Aturan.** Penilaian sisa hanya boleh diturunkan setelah pengendalian
tambahannya berstatus Selesai dan terverifikasi.

**Tindakan sistem.** Isian skor sisa terkunci selama pengendalian tambahan
masih Terbuka.

**Alasan.** Menurunkan skor karena pengendalian sudah *direncanakan* adalah cara
paling umum HIRADC kehilangan artinya.

### AB-13 · Risiko daftar memakai nilai tertinggi

**Aturan.** Kolom risiko pada daftar JSA memakai skor tertinggi di antara
seluruh langkah, bukan rata-rata.

**Alasan.** Satu langkah berbahaya tidak boleh tersamarkan oleh lima langkah
aman.

### AB-34 · Hierarki pengendalian punya urutan wajib

**Aturan.** Pengendalian dinilai menurut urutan Eliminasi → Substitusi →
Rekayasa → Administratif → APD. Sistem menampilkan sebaran tingkat yang dipakai.

**Tindakan sistem.** Tidak menolak, tetapi menandai JSA yang seluruh
pengendaliannya berupa APD.

**Alasan.** APD adalah lapisan terakhir. JSA yang seluruh pengendaliannya berupa
APD berarti bahayanya belum ditangani, hanya dipindahkan ke tubuh pekerja.

---

## Pelaporan dan pengukuran

### AB-02 · Kejadian Serius memberi tahu seketika

**Aturan.** Kejadian berkeparahan Serius memicu pemberitahuan seketika ke QHSE
Supervisor dan Plant Manager pabrik terkait, lewat aplikasi dan pemberitahuan
dorong, tanpa menunggu verifikasi.

### AB-04 · Laporan anonim berbobot sama

**Aturan.** Laporan bahaya anonim masuk antrean verifikasi dengan bobot yang
sama dengan laporan bernama. Sistem tidak menyimpan identitas pengirimnya.

### AB-05 · Belum diverifikasi belum dihitung

**Aturan.** Catatan yang belum diverifikasi petugas QHSE tidak dihitung dalam
KPI mana pun. Kiriman dari aplikasi lapangan bernomor dengan awalan berbeda
(`HZ-L`, `INC-L`, `OBS-L`, `APD-L`, `WP-L`) supaya tidak tertukar.

### AB-06 · Observasi tidak menamai pekerja

**Aturan.** Observasi perilaku dan observasi APD tidak menyimpan identitas
pekerja yang diamati, dalam bentuk apa pun, termasuk pada jejak audit.

**Alasan.** Observasi yang menamai orang berubah menjadi penilaian kinerja, dan
orang berhenti jujur.

### AB-07 · Kepatuhan tidak melebihi 100%

**Aturan.** Jumlah pekerja patuh tidak boleh melebihi jumlah pekerja diamati.

**Alasan.** Kepatuhan di atas 100% merusak rata-rata KPI tanpa ada yang
menyadarinya.

### AB-19 · Angka selalu punya pembanding

**Aturan.** Setiap nilai terukur lingkungan disimpan berikut baku mutu dan
satuannya, dan selalu ditampilkan berdampingan.

**Alasan.** Angka tanpa ambang pembanding tidak berarti apa-apa bagi pembaca,
termasuk bagi pengawas lingkungan.

### AB-26 · Lagging dan leading tidak dicampur

**Aturan.** Indikator lagging dan leading dipisah tegas dan tidak pernah
ditampilkan dalam satu baris yang sama.

### AB-27 · Rumus ditulis di tempatnya

**Aturan.** Setiap ubin KPI menampilkan rumus dan basis perhitungannya. LTIFR
memakai basis 1.000.000 jam kerja; TRIR memakai 200.000 jam kerja.

**Tindakan sistem.** Sistem tidak menyediakan perbandingan langsung antara LTIFR
dan TRIR.

**Alasan.** Kesalahan basis adalah kekeliruan paling sering dalam pelaporan K3.

### AB-25 · Jam pelatihan berasal dari kegiatan

**Aturan.** KPI Jam Pelatihan K3 dihitung dari jumlah peserta dikalikan durasi
kegiatan pada modul SHE Activity, bukan diisi manual.

### AB-28 · Angka grup tidak menutupi pabrik

**Aturan.** Kartu skor per pabrik selalu ditampilkan berdampingan dengan angka
grup. Status pabrik ditentukan oleh indikator terburuknya, bukan rata-ratanya.

**Alasan.** Satu pabrik yang belum nihil tidak boleh tertutup oleh tiga pabrik
yang sudah nihil.

---

## Kepatuhan dan dokumen

### AB-18 · Temuan wajib punya CAPA

**Aturan.** Audit tidak dapat ditutup selama masih ada temuan Major atau Minor
tanpa CAPA bertenggat.

**Alasan.** Temuan tanpa CAPA adalah temuan audit berikutnya yang sedang
menunggu.

### AB-20 · Dokumen wajib punya tanggal tinjau

**Aturan.** Dokumen internal tanpa tanggal tinjau ulang tidak dapat disimpan
berstatus Berlaku.

**Alasan.** Dokumen tanpa tanggal tinjau adalah temuan audit yang menunggu
terjadi.

### AB-21 · Yang hampir habis terlihat lebih dulu

**Aturan.** Daftar dokumen eksternal diurutkan menurut sisa masa berlaku, bukan
abjad.

### AB-22 · Peraturan butuh penerapan dan bukti

**Aturan.** Setiap peraturan wajib punya kolom penerapan dan kolom bukti. Baris
tanpa bukti terisi berstatus belum terpenuhi, apa pun yang diketik di kolom
penerapan.

**Alasan.** Klausul 6.1.3 ISO 45001 tidak meminta daftar peraturan; yang diminta
adalah bukti bahwa tiap peraturan sudah diterjemahkan menjadi sesuatu yang
benar-benar dikerjakan.

### AB-23 · Masa berlaku induksi menurut jenis peserta

| Jenis peserta | Masa berlaku |
|---|---|
| Pekerja Baru | 12 bulan |
| Kontraktor | 6 bulan |
| Tamu | 3 bulan |

**Alasan.** Kontraktor diberi masa lebih pendek karena perputarannya tinggi.

### AB-24 · Di bawah ambang berarti mengulang

**Aturan.** Nilai uji pemahaman induksi di bawah ambang lulus menghasilkan
status Tidak Lulus. Sistem tidak menyediakan cara meloloskan peserta secara
manual.

**Alasan.** Meloloskan peserta yang tidak lulus membuat seluruh rekaman induksi
kehilangan artinya sebagai bukti.

---

## Akses, pemberitahuan, dan tampilan

### AB-29 · Pencarian mengikuti hak akses

**Aturan.** Hasil pencarian disaring menurut peran. Catatan pada modul yang
tidak terbuka untuk peran itu tidak ditampilkan; jumlahnya disebutkan apa
adanya.

### AB-32 · Satu matriks peran untuk dua aplikasi

**Aturan.** Daftar modul yang terbuka di aplikasi lapangan mengikuti matriks
hak akses yang sama dengan aplikasi meja.

**Alasan.** Dua daftar berbeda untuk orang yang sama adalah cara tercepat
membuat matriks hak akses berhenti dipercaya.

### AB-30 · Pemberitahuan harus membawa tindakan

**Aturan.** Pemberitahuan hanya dikirim untuk tiga hal: lewat tenggat, menunggu
keputusan penerimanya, atau melewati ambang. Perubahan status biasa tidak
dikirim.

### AB-31 · Terbaca bukan berarti selesai

**Aturan.** Menandai terbaca tidak menghentikan pengingat. Item lewat tenggat
dikirim ulang setiap hari sampai ditutup di modulnya.

### AB-33 · Preferensi mengikuti orang, bukan perangkat

**Aturan.** Pilihan bahasa dan tema tersimpan pada profil pengguna dan berlaku
di aplikasi meja maupun aplikasi lapangan.

### AB-35 · Isi rekaman tidak diterjemahkan

**Aturan.** Antarmuka tersedia dua bahasa, tetapi isi rekaman — kronologi
insiden, catatan observasi, nama orang, judul peraturan — tidak pernah
diterjemahkan otomatis.

**Alasan.** Rekaman K3 ditulis pekerja dalam bahasa mereka; menerjemahkannya
otomatis mengubah bukti.
