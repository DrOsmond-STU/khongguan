/* KG SafeGuard — data contoh purwarupa.
   Semua isi di bawah ini adalah data rekaan untuk demonstrasi, bukan catatan QHSE Khong Guan yang sebenarnya. */

window.KG = (function () {
  const plant = 'Pabrik Cibitung';
  const periode = 'September 2026';

  const user = { nama: 'Fadli Saldi', inisial: 'FS', peran: 'QHSE Supervisor', lokasi: 'Cibitung' };

  const lokasi = [
    'Line 1 — Mixing', 'Line 2 — Moulding', 'Line 3 — Oven Biskuit', 'Line 4 — Packing',
    'Gudang Bahan Baku', 'Gudang Barang Jadi', 'Ruang Boiler', 'Area Forklift B2',
    'IPAL', 'TPS Limbah B3', 'Workshop Maintenance', 'Kantin & Area Umum'
  ];

  const orang = [
    'Fadli Saldi', 'Rina Wulandari', 'Agus Prasetyo', 'Dewi Kartika', 'Bambang Sutrisno',
    'Siti Nurhaliza', 'Hendra Gunawan', 'Yuni Astuti', 'Rahmat Hidayat', 'Lilis Suryani'
  ];

  /* ─── 1. Insiden ─── */
  const insiden = [
    { id: 'INC-2026-0318', jenis: 'Accident', keparahan: 'Serius', lokasi: 'Line 3 — Oven Biskuit',
      tanggal: '18 Sep 2026', waktu: '14:20', pelapor: 'Fadli Saldi', status: 'Dalam Proses', terlambat: true,
      ringkas: 'Operator terkena uap panas saat membuka katup pembuangan oven tunnel.',
      kronologi: 'Operator hendak membuang kondensat dari katup bawah oven tunnel. Katup dibuka tanpa menunggu tekanan turun, uap menyembur dan mengenai lengan kanan operator. Korban langsung dibawa ke klinik pabrik lalu dirujuk ke RS Mitra Keluarga.',
      dampak: 'Luka bakar derajat 2 pada lengan kanan. Dirawat 1 hari, 4 hari kerja hilang.',
      akar: 'Prosedur pembuangan kondensat tidak mencantumkan waktu tunggu penurunan tekanan. Operator baru 3 minggu di posisi ini.',
      capa: 'CAPA-2026-0142' },
    { id: 'INC-2026-0317', jenis: 'Incident', keparahan: 'Sedang', lokasi: 'Gudang Bahan Baku',
      tanggal: '16 Sep 2026', waktu: '09:05', pelapor: 'Rina Wulandari', status: 'Menunggu Verifikasi',
      ringkas: 'Palet tepung terjatuh dari rak level 3 saat penurunan dengan forklift.',
      kronologi: 'Forklift menurunkan palet tepung 1 ton dari rak level 3. Garpu tidak masuk penuh, palet miring dan jatuh sekitar 2,5 meter. Tidak ada pekerja di bawah karena area sudah dikosongkan.',
      dampak: 'Kerugian material 18 sak tepung. Tidak ada cedera.',
      akar: 'Penerangan di lorong rak C kurang dari 100 lux; operator tidak dapat memastikan posisi garpu.',
      capa: 'CAPA-2026-0140' },
    { id: 'INC-2026-0316', jenis: 'Nearmiss', keparahan: 'Ringan', lokasi: 'Area Forklift B2',
      tanggal: '15 Sep 2026', waktu: '11:40', pelapor: 'Agus Prasetyo', status: 'Selesai',
      ringkas: 'Pejalan kaki nyaris tertabrak forklift di persimpangan tanpa cermin.',
      kronologi: 'Pekerja produksi menyeberang dari koridor B ke area packing. Forklift datang dari arah kanan yang terhalang tumpukan karton. Keduanya berhenti pada jarak sekitar 1,5 meter.',
      dampak: 'Tidak ada cedera dan tidak ada kerusakan.',
      akar: 'Tidak ada cermin cembung di persimpangan dan jalur pejalan kaki tidak bermarka.',
      capa: 'CAPA-2026-0138' },
    { id: 'INC-2026-0315', jenis: 'Nearmiss', keparahan: 'Sedang', lokasi: 'Ruang Boiler',
      tanggal: '12 Sep 2026', waktu: '07:15', pelapor: 'Anonim', status: 'Terbuka', anonim: true,
      ringkas: 'Katup pengaman boiler 2 mendesis terus-menerus selama pemanasan pagi.',
      kronologi: 'Saat pemanasan pagi, katup pengaman boiler 2 mengeluarkan suara desis berkelanjutan selama sekitar 10 menit pada tekanan 6 bar, di bawah setelan seharusnya 8 bar.',
      dampak: 'Tidak ada cedera. Boiler dihentikan untuk pemeriksaan.',
      akar: 'Dalam penyelidikan. Dugaan dudukan katup pengaman aus.',
      capa: '—' },
    { id: 'INC-2026-0314', jenis: 'Incident', keparahan: 'Ringan', lokasi: 'Line 4 — Packing',
      tanggal: '08 Sep 2026', waktu: '16:50', pelapor: 'Dewi Kartika', status: 'Selesai',
      ringkas: 'Conveyor packing berhenti mendadak karena sensor terhalang serpihan karton.',
      kronologi: 'Sensor optik jalur packing terhalang serpihan karton, conveyor berhenti darurat dan 40 karton menumpuk di ujung jalur.',
      dampak: 'Produksi tertahan 22 menit. Tidak ada cedera.',
      akar: 'Jadwal pembersihan sensor belum masuk checklist harian jalur packing.',
      capa: 'CAPA-2026-0135' },
    { id: 'INC-2026-0313', jenis: 'Nearmiss', keparahan: 'Serius', lokasi: 'TPS Limbah B3',
      tanggal: '04 Sep 2026', waktu: '10:30', pelapor: 'Bambang Sutrisno', status: 'Dalam Proses',
      ringkas: 'Drum oli bekas bocor di TPS B3, tumpahan tertahan di bak penampung.',
      kronologi: 'Drum oli bekas 200 liter ditemukan bocor pada sambungan bawah. Sekitar 15 liter tumpah dan tertahan bak penampung sekunder. Tidak keluar area TPS.',
      dampak: 'Tumpahan 15 liter tertangani dengan absorben. Tidak ada cedera dan tidak ada pencemaran keluar area.',
      akar: 'Drum berumur lebih dari 5 tahun dan tidak ada pemeriksaan kondisi kemasan sebelum penyimpanan.',
      capa: 'CAPA-2026-0141' }
  ];

  /* ─── 2. Inspeksi ─── */
  const inspeksi = [
    { id: 'INS-2026-0912', jenis: 'APAR & Hydrant', area: 'Seluruh area produksi', petugas: 'Fadli Saldi',
      tanggal: '19 Sep 2026', butir: 42, selesai: 42, temuan: 3, status: 'Selesai', jadwal: 'Bulanan' },
    { id: 'INS-2026-0911', jenis: 'Forklift & Alat Angkat', area: 'Gudang & Logistik', petugas: 'Agus Prasetyo',
      tanggal: '18 Sep 2026', butir: 28, selesai: 28, temuan: 2, status: 'Selesai', jadwal: 'Bulanan' },
    { id: 'INS-2026-0913', jenis: 'Panel Listrik', area: 'Line 1 – Line 4', petugas: 'Hendra Gunawan',
      tanggal: '20 Sep 2026', butir: 36, selesai: 21, temuan: 4, status: 'Dalam Proses', jadwal: 'Bulanan' },
    { id: 'INS-2026-0914', jenis: 'Higiene & Sanitasi Produksi', area: 'Line 2 — Moulding', petugas: 'Dewi Kartika',
      tanggal: '21 Sep 2026', butir: 54, selesai: 0, temuan: 0, status: 'Terbuka', jadwal: 'Mingguan' },
    { id: 'INS-2026-0910', jenis: 'Jalur Evakuasi', area: 'Seluruh pabrik', petugas: 'Rina Wulandari',
      tanggal: '15 Sep 2026', butir: 24, selesai: 24, temuan: 1, status: 'Selesai', jadwal: 'Bulanan' },
    { id: 'INS-2026-0909', jenis: 'Boiler', area: 'Ruang Boiler', petugas: 'Bambang Sutrisno',
      tanggal: '12 Sep 2026', butir: 31, selesai: 31, temuan: 2, status: 'Selesai', jadwal: 'Mingguan' },
    { id: 'INS-2026-0908', jenis: 'IPAL', area: 'IPAL', petugas: 'Yuni Astuti',
      tanggal: '10 Sep 2026', butir: 19, selesai: 19, temuan: 0, status: 'Selesai', jadwal: 'Mingguan' },
    { id: 'INS-2026-0907', jenis: 'P3K', area: 'Seluruh area', petugas: 'Siti Nurhaliza',
      tanggal: '05 Sep 2026', butir: 16, selesai: 16, temuan: 1, status: 'Selesai', jadwal: 'Bulanan' }
  ];

  const checklistAPAR = [
    { butir: 'Tekanan jarum manometer berada di zona hijau', jawab: 'Sesuai' },
    { butir: 'Segel dan pin pengaman utuh', jawab: 'Sesuai' },
    { butir: 'Selang tidak retak dan nozzle tidak tersumbat', jawab: 'Tidak Sesuai',
      temuan: 'APAR A-14 di Line 3: selang retak sepanjang 4 cm dekat sambungan.', risiko: 12, pj: 'Hendra Gunawan', tenggat: '26 Sep 2026' },
    { butir: 'Akses ke APAR bebas hambatan minimal 1 meter', jawab: 'Tidak Sesuai',
      temuan: 'APAR B-07 tertutup tumpukan palet kosong di Gudang Bahan Baku.', risiko: 8, pj: 'Agus Prasetyo', tenggat: '23 Sep 2026' },
    { butir: 'Kartu pemeriksaan terisi dan terbaca', jawab: 'Sesuai' },
    { butir: 'Tanda arah dan rambu APAR terlihat dari 10 meter', jawab: 'Tidak Sesuai',
      temuan: 'Rambu APAR C-02 pudar dan tidak terbaca dari jarak 10 m.', risiko: 4, pj: 'Rahmat Hidayat', tenggat: '30 Sep 2026' },
    { butir: 'Hydrant pillar tidak bocor dan valve dapat diputar', jawab: 'Sesuai' },
    { butir: 'Tekanan hydrant minimal 4,5 bar', jawab: 'Sesuai' }
  ];

  /* ─── 3. Izin kerja & JSEA ─── */
  const izin = [
    { id: 'WP-2026-0912', jenis: 'Panas', ikon: 'hot', judul: 'Pengelasan pipa uap — Ruang Boiler 2',
      pelaksana: 'CV Teknik Jaya', vendor: true, pekerja: 3, pengawas: 'Agus Prasetyo',
      mulai: '21 Sep 2026 · 08.00–16.00 WIB', status: 'Aktif', zona: 'low', risikoAwal: 15, risikoSisa: 6,
      prasyarat: [
        { t: 'JSEA lengkap · risiko sisa 6', ok: true },
        { t: 'Gas test 07.45', ok: true },
        { t: 'Fire watcher ditunjuk', ok: true },
        { t: 'Induksi K3 vendor', ok: true },
        { t: 'Asuransi tenaga kerja vendor', ok: true },
        { t: 'APAR 2 unit di lokasi', ok: null }
      ] },
    { id: 'WP-2026-0913', jenis: 'Ruang Terbatas', ikon: 'conf', judul: 'Pembersihan tangki minyak goreng T-04',
      pelaksana: 'Maintenance internal', vendor: false, pekerja: 2, pengawas: 'Rina Wulandari',
      mulai: '22 Sep 2026 · 06.00–12.00 WIB', status: 'Menunggu QHSE', zona: 'high', risikoAwal: 16, risikoSisa: 8,
      prasyarat: [
        { t: 'JSEA lengkap · risiko sisa 8', ok: true },
        { t: 'Uji gas O₂/LEL/H₂S belum ada', ok: false },
        { t: 'Penjaga lubang ditunjuk', ok: true },
        { t: 'Blower 15 menit sebelum masuk', ok: null }
      ] },
    { id: 'WP-2026-0914', jenis: 'Ketinggian', ikon: 'height', judul: 'Penggantian lampu high bay Gudang Barang Jadi',
      pelaksana: 'PT Cahaya Mandiri', vendor: true, pekerja: 2, pengawas: 'Rahmat Hidayat',
      mulai: '23 Sep 2026 · 09.00–15.00 WIB', status: 'Menunggu Supervisor', zona: 'medium', risikoAwal: 12, risikoSisa: 6,
      prasyarat: [
        { t: 'JSEA lengkap · risiko sisa 6', ok: true },
        { t: 'Full body harness double lanyard', ok: true },
        { t: 'Induksi K3 vendor', ok: false },
        { t: 'Barikade area bawah', ok: null }
      ] },
    { id: 'WP-2026-0911', jenis: 'Listrik / LOTO', ikon: 'elec', judul: 'Perbaikan panel MDP Line 2',
      pelaksana: 'Maintenance internal', vendor: false, pekerja: 2, pengawas: 'Hendra Gunawan',
      mulai: '20 Sep 2026 · 22.00–02.00 WIB', status: 'Selesai', zona: 'low', risikoAwal: 20, risikoSisa: 5,
      prasyarat: [
        { t: 'JSEA lengkap · risiko sisa 5', ok: true },
        { t: 'LOTO terpasang, kunci di pelaksana', ok: true },
        { t: 'Uji tegangan nol', ok: true },
        { t: 'Sarung tangan isolasi 1000V', ok: true }
      ] }
  ];

  const jsea = {
    permit: 'WP-2026-0913',
    judul: 'Pembersihan tangki minyak goreng T-04',
    langkah: [
      { no: 1, kerja: 'Pengosongan dan pembilasan tangki', bahaya: 'Terpeleset lantai licin minyak',
        awal: { k: 3, s: 2 }, kendali: [['Rekayasa', 'Selang pembuangan tertutup ke saluran khusus'], ['APD', 'Sepatu anti-slip']], sisa: { k: 2, s: 1 } },
      { no: 2, kerja: 'Isolasi jalur masuk dan LOTO pompa transfer', bahaya: 'Pompa hidup tak sengaja saat orang di dalam',
        awal: { k: 3, s: 5 }, kendali: [['Administratif', 'LOTO dengan kunci dipegang pekerja di dalam'], ['Administratif', 'Verifikasi oleh pengawas']], sisa: { k: 1, s: 5 } },
      { no: 3, kerja: 'Ventilasi paksa 15 menit', bahaya: 'Atmosfer kekurangan oksigen',
        awal: { k: 4, s: 4 }, kendali: [['Rekayasa', 'Blower 2.000 CFM, 15 menit'], ['Administratif', 'Uji gas O₂/LEL/H₂S sebelum masuk']], sisa: { k: 2, s: 4 } },
      { no: 4, kerja: 'Membuka manhole dan masuk tangki', bahaya: 'Terjatuh saat turun; terjebak di dalam',
        awal: { k: 4, s: 4 }, kendali: [['Rekayasa', 'Tripod dan winch penyelamat'], ['Administratif', 'Penjaga lubang tetap di luar, komunikasi radio'], ['APD', 'Full body harness']], sisa: { k: 2, s: 4 } },
      { no: 5, kerja: 'Pembersihan dinding dengan deterjen food grade', bahaya: 'Iritasi kulit dan mata',
        awal: { k: 3, s: 2 }, kendali: [['Substitusi', 'Deterjen food grade pH netral'], ['APD', 'Sarung tangan nitril, kacamata goggle']], sisa: { k: 2, s: 1 } },
      { no: 6, kerja: 'Keluar tangki dan pelepasan LOTO', bahaya: 'LOTO dilepas saat orang masih di dalam',
        awal: { k: 2, s: 5 }, kendali: [['Administratif', 'Hitung ulang personel masuk dan keluar'], ['Administratif', 'Pelepasan LOTO oleh pemasang']], sisa: { k: 1, s: 5 } }
    ],
    persetujuan: [
      { peran: 'PEMOHON', nama: 'Rina Wulandari — Maintenance', catatan: 'JSEA 6 langkah dilampirkan, risiko sisa tertinggi 8.', waktu: '20 Sep · 14.20', state: 'done' },
      { peran: 'SUPERVISOR AREA', nama: 'Agus Prasetyo — Produksi', catatan: 'Jadwal produksi Line 2 disesuaikan, tangki dikosongkan sejak 19 Sep.', waktu: '20 Sep · 16.05', state: 'done' },
      { peran: 'PETUGAS QHSE', nama: 'Fadli Saldi', catatan: 'Menunggu hasil uji gas O₂/LEL/H₂S sebelum verifikasi.', tunggu: 'menunggu 18 jam', state: 'now' },
      { peran: 'PENERBIT IZIN', nama: 'Plant Manager', catatan: 'Terbuka setelah verifikasi QHSE.', waktu: '—', state: 'next' }
    ]
  };

  /* ─── 4. Laporan bahaya ─── */
  const bahaya = [
    { id: 'HZ-2026-0451', kategori: 'Unsafe Condition', lokasi: 'Line 3 — Oven Biskuit',
      isi: 'Kabel panel kontrol oven terkelupas sepanjang 10 cm, terjangkau tangan operator.',
      pelapor: 'Siti Nurhaliza', waktu: '3 jam lalu', status: 'Terbuka', risiko: 'Tinggi' },
    { id: 'HZ-2026-0450', kategori: 'Unsafe Action', lokasi: 'Gudang Barang Jadi',
      isi: 'Operator forklift mengangkut palet melebihi tinggi pandangan.',
      pelapor: 'Anonim', anonim: true, waktu: '5 jam lalu', status: 'Terbuka', risiko: 'Tinggi' },
    { id: 'HZ-2026-0449', kategori: 'Aspek Lingkungan', lokasi: 'TPS Limbah B3',
      isi: 'Ceceran oli di lantai TPS belum dibersihkan sejak kemarin sore.',
      pelapor: 'Bambang Sutrisno', waktu: '8 jam lalu', status: 'Diverifikasi', risiko: 'Sedang' },
    { id: 'HZ-2026-0448', kategori: 'Unsafe Condition', lokasi: 'Kantin & Area Umum',
      isi: 'Lantai kantin licin di dekat wastafel, belum ada rambu peringatan.',
      pelapor: 'Yuni Astuti', waktu: '1 hari lalu', status: 'Diverifikasi', risiko: 'Sedang' },
    { id: 'HZ-2026-0447', kategori: 'Unsafe Condition', lokasi: 'Area Forklift B2',
      isi: 'Cermin cembung persimpangan B2 pecah dan belum diganti.',
      pelapor: 'Agus Prasetyo', waktu: '2 hari lalu', status: 'Ditangani', risiko: 'Tinggi' },
    { id: 'HZ-2026-0446', kategori: 'Unsafe Action', lokasi: 'Line 1 — Mixing',
      isi: 'Dua pekerja tidak memakai masker saat menuang tepung dari sak.',
      pelapor: 'Dewi Kartika', waktu: '2 hari lalu', status: 'Ditangani', risiko: 'Sedang' },
    { id: 'HZ-2026-0445', kategori: 'Aspek Lingkungan', lokasi: 'IPAL',
      isi: 'Bau menyengat dari bak aerasi sejak pagi, diduga blower mati semalam.',
      pelapor: 'Yuni Astuti', waktu: '3 hari lalu', status: 'Ditangani', risiko: 'Sedang' }
  ];

  /* ─── 5. Audit ─── */
  const audit = [
    { id: 'AUD-2026-004', standar: 'ISO 45001:2018', lingkup: 'Surveillance tahun ke-2 — seluruh pabrik',
      auditor: 'TÜV (eksternal)', tanggal: '12–14 Okt 2026', status: 'Terbuka',
      temuan: { major: 0, minor: 0, obs: 0 } },
    { id: 'AUD-2026-003', standar: 'SMK3 PP 50/2012', lingkup: 'Audit internal 12 elemen',
      auditor: 'Tim Internal QHSE', tanggal: '02–05 Sep 2026', status: 'Dalam Proses',
      temuan: { major: 1, minor: 6, obs: 9 } },
    { id: 'AUD-2026-002', standar: 'ISO 14001:2015', lingkup: 'Audit internal — aspek & dampak lingkungan',
      auditor: 'Tim Internal QHSE', tanggal: '15–17 Jul 2026', status: 'Selesai',
      temuan: { major: 0, minor: 3, obs: 7 } },
    { id: 'AUD-2026-001', standar: 'ISO 45001:2018', lingkup: 'Audit internal — K3 produksi & gudang',
      auditor: 'Tim Internal QHSE', tanggal: '08–10 Apr 2026', status: 'Selesai',
      temuan: { major: 1, minor: 5, obs: 11 } }
  ];

  const temuanAudit = [
    { id: 'AF-2026-018', audit: 'AUD-2026-003', klausul: 'Elemen 6.5 — Pelayanan', kategori: 'Major',
      isi: 'Sertifikat kelayakan operasi boiler 2 telah melewati masa berlaku sejak 30 Jun 2026.',
      pj: 'Bambang Sutrisno', tenggat: '30 Sep 2026', status: 'Dalam Proses' },
    { id: 'AF-2026-019', audit: 'AUD-2026-003', klausul: 'Elemen 9.1 — Pelaporan', kategori: 'Minor',
      isi: 'Laporan P2K3 triwulan II belum dikirimkan ke Disnaker setempat.',
      pj: 'Fadli Saldi', tenggat: '28 Sep 2026', status: 'Dalam Proses' },
    { id: 'AF-2026-020', audit: 'AUD-2026-003', klausul: 'Elemen 4.1 — Kebijakan K3', kategori: 'Minor',
      isi: 'Kebijakan K3 belum ditinjau ulang setelah perubahan struktur organisasi Mei 2026.',
      pj: 'Fadli Saldi', tenggat: '15 Okt 2026', status: 'Terbuka' },
    { id: 'AF-2026-021', audit: 'AUD-2026-003', klausul: 'Elemen 12.3 — Pelatihan', kategori: 'Observasi',
      isi: 'Matriks pelatihan K3 tidak mencantumkan pekerja kontrak harian.',
      pj: 'Siti Nurhaliza', tenggat: '31 Okt 2026', status: 'Terbuka' }
  ];

  const elemenSMK3 = [
    { no: 1, nama: 'Pembangunan & Pemeliharaan Komitmen', kriteria: 26, penuhi: 26 },
    { no: 2, nama: 'Strategi Pendokumentasian', kriteria: 15, penuhi: 14 },
    { no: 3, nama: 'Peninjauan Perancangan & Kontrak', kriteria: 8, penuhi: 8 },
    { no: 4, nama: 'Pengendalian Dokumen', kriteria: 7, penuhi: 7 },
    { no: 5, nama: 'Pembelian & Pengendalian Produk', kriteria: 9, penuhi: 8 },
    { no: 6, nama: 'Keamanan Bekerja Berdasarkan SMK3', kriteria: 41, penuhi: 37 },
    { no: 7, nama: 'Standar Pemantauan', kriteria: 17, penuhi: 15 },
    { no: 8, nama: 'Pelaporan & Perbaikan Kekurangan', kriteria: 9, penuhi: 8 },
    { no: 9, nama: 'Pengelolaan Material & Perpindahannya', kriteria: 12, penuhi: 12 },
    { no: 10, nama: 'Pengumpulan & Penggunaan Data', kriteria: 6, penuhi: 6 },
    { no: 11, nama: 'Pemeriksaan SMK3', kriteria: 5, penuhi: 4 },
    { no: 12, nama: 'Pengembangan Keterampilan & Kemampuan', kriteria: 11, penuhi: 10 }
  ];

  /* ─── 6. Lingkungan ─── */
  const lingkungan = {
    pppa: { judul: 'PPPA — Pengendalian Pencemaran Air', sub: 'Uji outlet IPAL · 15 Sep 2026 · Lab terakreditasi KAN',
      acuan: 'Permen LHK 5/2014 Lampiran — Industri Makanan',
      param: [
        { nama: 'pH', nilai: '7,2', satuan: '', ambang: '6,0 – 9,0', ok: true },
        { nama: 'BOD', nilai: '38', satuan: 'mg/L', ambang: '≤ 50', ok: true },
        { nama: 'COD', nilai: '92', satuan: 'mg/L', ambang: '≤ 100', ok: true },
        { nama: 'TSS', nilai: '46', satuan: 'mg/L', ambang: '≤ 50', ok: true },
        { nama: 'Minyak & Lemak', nilai: '14', satuan: 'mg/L', ambang: '≤ 10', ok: false }
      ] },
    pppu: { judul: 'PPPU — Pengendalian Pencemaran Udara', sub: 'Emisi cerobong boiler 2 · 08 Sep 2026',
      acuan: 'Permen LHK 11/2021 — Ketel uap berbahan bakar gas',
      param: [
        { nama: 'Partikulat', nilai: '42', satuan: 'mg/Nm³', ambang: '≤ 120', ok: true },
        { nama: 'SO₂', nilai: '128', satuan: 'mg/Nm³', ambang: '≤ 600', ok: true },
        { nama: 'NO₂', nilai: '312', satuan: 'mg/Nm³', ambang: '≤ 400', ok: true },
        { nama: 'Opasitas', nilai: '12', satuan: '%', ambang: '≤ 20', ok: true }
      ] },
    limbah: { judul: 'Waste Management', sub: 'Neraca limbah non-B3 · September 2026',
      acuan: 'Timbulan per ton produk: 4,2 kg',
      param: [
        { nama: 'Karton & kertas', nilai: '8.420', satuan: 'kg', ambang: 'daur ulang 96%', ok: true },
        { nama: 'Plastik kemasan', nilai: '3.180', satuan: 'kg', ambang: 'daur ulang 88%', ok: true },
        { nama: 'Sisa adonan & remah', nilai: '5.640', satuan: 'kg', ambang: 'pakan ternak 100%', ok: true },
        { nama: 'Sampah umum ke TPA', nilai: '1.240', satuan: 'kg', ambang: 'target ≤ 1.500', ok: true }
      ] },
    plb3: { judul: 'PLB3 — Limbah Bahan Berbahaya & Beracun', sub: 'TPS B3 · izin berlaku s.d. 14 Mar 2027',
      acuan: 'Masa simpan maksimal 90 hari sejak limbah masuk TPS',
      param: [
        { nama: 'Oli bekas (B105d)', nilai: '860', satuan: 'kg', ambang: 'sisa 12 hari', ok: false },
        { nama: 'Majun terkontaminasi (B110d)', nilai: '145', satuan: 'kg', ambang: 'sisa 41 hari', ok: true },
        { nama: 'Lampu TL bekas (B107d)', nilai: '38', satuan: 'kg', ambang: 'sisa 63 hari', ok: true },
        { nama: 'Kemasan bekas B3 (B104d)', nilai: '210', satuan: 'kg', ambang: 'sisa 28 hari', ok: true }
      ] }
  };

  /* ─── 7 & 8. KPI ─── */
  const kpiLagging = [
    { nama: 'TRIR', nilai: '0,42', satuan: '', delta: '0,18 vs 2025', arah: 'good',
      note: '(TRC × 200.000) ÷ jam kerja · target ≤ 0,50' },
    { nama: 'LTIFR', nilai: '1,84', satuan: '', delta: '0,62 vs 2025', arah: 'good',
      note: '(LTI × 1.000.000) ÷ jam kerja · target ≤ 2,00' },
    { nama: 'LTISR', nilai: '14,7', satuan: '', delta: '3,1 vs 2025', arah: 'bad',
      note: '(hari hilang × 1.000.000) ÷ jam kerja' },
    { nama: 'Safe Manhours', nilai: '1.284.560', satuan: '', delta: '238 hari tanpa LTI', arah: 'good',
      note: 'Jam kerja sejak LTI terakhir' },
    { nama: 'Hari Kerja Hilang', nilai: '9', satuan: 'hari', delta: '4 vs Agustus', arah: 'bad',
      note: 'Akumulasi tahun berjalan: 27 hari' },
    { nama: 'Kerugian Properti', nilai: '18,4', satuan: 'jt', delta: '6,2 jt vs Agustus', arah: 'good',
      note: 'Rupiah, akumulasi tahun berjalan: 142 jt' }
  ];

  const kpiLeading = [
    { nama: 'Laporan Bahaya', nilai: '87', satuan: '/bln', delta: '14 vs Agustus', arah: 'bad',
      note: 'Naik itu baik · 0,21 laporan per pekerja' },
    { nama: 'Inspeksi Terjadwal', nilai: '92', satuan: '%', delta: '5% vs Agustus', arah: 'good',
      note: 'Selesai 34 dari 37 · target ≥ 95%' },
    { nama: 'CAPA Tepat Waktu', nilai: '82', satuan: '%', delta: '3% vs Agustus', arah: 'bad',
      note: 'Selesai tepat waktu 41 dari 50 · target ≥ 90%' },
    { nama: 'Jam Pelatihan K3', nilai: '2,4', satuan: 'jam/org', delta: '0,6 vs Agustus', arah: 'good',
      note: 'Akumulasi tahun berjalan: 18,2 jam/orang' },
    { nama: 'Safety Patrol', nilai: '18', satuan: '/bln', delta: 'sama dengan Agustus', arah: 'flat',
      note: 'Target 16 patroli per bulan' },
    { nama: 'Kepatuhan APD', nilai: '94', satuan: '%', delta: '2% vs Agustus', arah: 'good',
      note: 'Dari 312 pengamatan perilaku · target ≥ 95%' }
  ];

  const trenInsiden = [
    { bln: 'Okt', v: 4 }, { bln: 'Nov', v: 5 }, { bln: 'Des', v: 7 }, { bln: 'Jan', v: 9 },
    { bln: 'Feb', v: 8 }, { bln: 'Mar', v: 6 }, { bln: 'Apr', v: 7 }, { bln: 'Mei', v: 5 },
    { bln: 'Jun', v: 6 }, { bln: 'Jul', v: 4 }, { bln: 'Ags', v: 5 }, { bln: 'Sep', v: 3 }
  ];

  const trenBahaya = [
    { bln: 'Okt', v: 52 }, { bln: 'Nov', v: 61 }, { bln: 'Des', v: 48 }, { bln: 'Jan', v: 66 },
    { bln: 'Feb', v: 74 }, { bln: 'Mar', v: 81 }, { bln: 'Apr', v: 77 }, { bln: 'Mei', v: 88 },
    { bln: 'Jun', v: 95 }, { bln: 'Jul', v: 92 }, { bln: 'Ags', v: 101 }, { bln: 'Sep', v: 87 }
  ];

  /* ─── 9. Kegiatan SHE ─── */
  const kegiatan = [
    { id: 'ACT-2026-091', jenis: 'Safety Talk', judul: 'Bahaya uap panas & penanganan luka bakar',
      tanggal: '19 Sep 2026', lokasi: 'Line 3 — Oven Biskuit', peserta: 24, durasi: 0.5, foto: 'talk' },
    { id: 'ACT-2026-090', jenis: 'Simulasi Tanggap Darurat', judul: 'Simulasi kebakaran gudang & evakuasi',
      tanggal: '17 Sep 2026', lokasi: 'Gudang Barang Jadi', peserta: 138, durasi: 2, foto: 'drill' },
    { id: 'ACT-2026-089', jenis: 'Safety Patrol', judul: 'Patroli gabungan manajemen — area produksi',
      tanggal: '15 Sep 2026', lokasi: 'Line 1 – Line 4', peserta: 8, durasi: 1.5, foto: 'patrol' },
    { id: 'ACT-2026-088', jenis: 'Pelatihan', judul: 'Pelatihan operator forklift — penyegaran tahunan',
      tanggal: '11 Sep 2026', lokasi: 'Workshop Maintenance', peserta: 12, durasi: 8, foto: 'train' },
    { id: 'ACT-2026-087', jenis: 'Kegiatan Lingkungan', judul: 'Penanaman 200 pohon di sempadan sungai',
      tanggal: '06 Sep 2026', lokasi: 'Luar area pabrik', peserta: 45, durasi: 4, foto: 'env' }
  ];

  /* ─── 10. CAPA ─── */
  const capa = [
    { id: 'CAPA-2026-0142', judul: 'Revisi SOP pembuangan kondensat oven tunnel',
      sumber: 'INC-2026-0318', sumberJenis: 'Insiden', pj: 'Hendra Gunawan',
      terbit: '18 Sep 2026', tenggat: '02 Okt 2026', umur: 3, status: 'Dalam Proses', prioritas: 'Tinggi' },
    { id: 'CAPA-2026-0141', judul: 'Program pemeriksaan kondisi kemasan limbah B3 sebelum disimpan',
      sumber: 'INC-2026-0313', sumberJenis: 'Insiden', pj: 'Bambang Sutrisno',
      terbit: '04 Sep 2026', tenggat: '25 Sep 2026', umur: 17, status: 'Dalam Proses', prioritas: 'Tinggi' },
    { id: 'CAPA-2026-0140', judul: 'Penambahan penerangan lorong rak C gudang bahan baku',
      sumber: 'INC-2026-0317', sumberJenis: 'Insiden', pj: 'Rahmat Hidayat',
      terbit: '16 Sep 2026', tenggat: '30 Sep 2026', umur: 5, status: 'Menunggu Verifikasi', prioritas: 'Sedang' },
    { id: 'CAPA-2026-0139', judul: 'Perpanjangan sertifikat kelayakan operasi boiler 2',
      sumber: 'AF-2026-018', sumberJenis: 'Audit', pj: 'Bambang Sutrisno',
      terbit: '05 Sep 2026', tenggat: '30 Sep 2026', umur: 16, status: 'Dalam Proses', prioritas: 'Tinggi' },
    { id: 'CAPA-2026-0138', judul: 'Pemasangan cermin cembung & marka pejalan kaki persimpangan B2',
      sumber: 'INC-2026-0316', sumberJenis: 'Insiden', pj: 'Agus Prasetyo',
      terbit: '15 Sep 2026', tenggat: '29 Sep 2026', umur: 6, status: 'Selesai', prioritas: 'Tinggi' },
    { id: 'CAPA-2026-0137', judul: 'Penggantian selang APAR A-14 Line 3',
      sumber: 'INS-2026-0912', sumberJenis: 'Inspeksi', pj: 'Hendra Gunawan',
      terbit: '19 Sep 2026', tenggat: '26 Sep 2026', umur: 2, status: 'Terbuka', prioritas: 'Tinggi' },
    { id: 'CAPA-2026-0136', judul: 'Pembebasan akses APAR B-07 dari tumpukan palet',
      sumber: 'INS-2026-0912', sumberJenis: 'Inspeksi', pj: 'Agus Prasetyo',
      terbit: '19 Sep 2026', tenggat: '23 Sep 2026', umur: 2, status: 'Terbuka', prioritas: 'Sedang' },
    { id: 'CAPA-2026-0135', judul: 'Menambahkan pembersihan sensor ke checklist harian packing',
      sumber: 'INC-2026-0314', sumberJenis: 'Insiden', pj: 'Dewi Kartika',
      terbit: '08 Sep 2026', tenggat: '22 Sep 2026', umur: 13, status: 'Menunggu Verifikasi', prioritas: 'Rendah' },
    { id: 'CAPA-2026-0128', judul: 'Perbaikan tren minyak & lemak outlet IPAL di atas baku mutu',
      sumber: 'ENV-2026-0033', sumberJenis: 'Lingkungan', pj: 'Yuni Astuti',
      terbit: '18 Agu 2026', tenggat: '15 Sep 2026', umur: 34, status: 'Dalam Proses', prioritas: 'Tinggi', terlambat: true },
    { id: 'CAPA-2026-0124', judul: 'Pengiriman laporan P2K3 triwulan II ke Disnaker',
      sumber: 'AF-2026-019', sumberJenis: 'Audit', pj: 'Fadli Saldi',
      terbit: '05 Agu 2026', tenggat: '10 Sep 2026', umur: 47, status: 'Dalam Proses', prioritas: 'Tinggi', terlambat: true }
  ];

  /* ─── Aktivitas terbaru untuk dashboard ─── */
  const aktivitas = [
    { jenis: 'critical', judul: 'Insiden baru dilaporkan — INC-2026-0318',
      meta: 'Accident · Serius · Line 3 — Oven Biskuit · Fadli Saldi', when: '3 jam lalu' },
    { jenis: 'high', judul: 'Izin kerja menunggu verifikasi QHSE — WP-2026-0913',
      meta: 'Ruang Terbatas · tertahan 18 jam · Rina Wulandari', when: '5 jam lalu' },
    { jenis: 'medium', judul: 'Inspeksi Panel Listrik berjalan 21 dari 36 butir',
      meta: 'INS-2026-0913 · 4 temuan · Hendra Gunawan', when: '7 jam lalu' },
    { jenis: 'low', judul: 'CAPA-2026-0138 ditutup dan diverifikasi',
      meta: 'Cermin cembung & marka persimpangan B2 terpasang', when: '1 hari lalu' },
    { jenis: 'info', judul: 'Safety Talk bahaya uap panas — 24 peserta',
      meta: 'ACT-2026-0091 · Line 3 · daftar hadir terlampir', when: '2 hari lalu' }
  ];

  const perhatian = [
    { chip: 'critical', label: 'LEWAT TEMPO', judul: 'CAPA-2026-0124 · Laporan P2K3 triwulan II',
      meta: 'Jatuh tempo 10 Sep · terlambat 11 hari · Fadli Saldi' },
    { chip: 'critical', label: 'LEWAT TEMPO', judul: 'CAPA-2026-0128 · Minyak & lemak outlet IPAL',
      meta: 'Jatuh tempo 15 Sep · terlambat 6 hari · Yuni Astuti' },
    { chip: 'critical', label: 'BAKU MUTU', judul: 'Minyak & lemak IPAL 14 mg/L melewati ambang 10 mg/L',
      meta: 'Uji 15 Sep · wajib uji ulang dalam 14 hari' },
    { chip: 'high', label: 'MASA SIMPAN', judul: 'Oli bekas di TPS B3 tersisa 12 hari dari batas 90 hari',
      meta: '860 kg · manifes pengangkutan belum dijadwalkan' },
    { chip: 'high', label: 'TERTAHAN', judul: 'WP-2026-0913 menunggu verifikasi QHSE 18 jam',
      meta: 'Uji gas O₂/LEL/H₂S belum dilampirkan' },
    { chip: 'high', label: 'TEMUAN MAJOR', judul: 'AF-2026-018 · Sertifikat boiler 2 kedaluwarsa',
      meta: 'Sejak 30 Jun 2026 · tenggat CAPA 30 Sep' }
  ];

  return {
    plant, periode, user, lokasi, orang,
    insiden, inspeksi, checklistAPAR, izin, jsea, bahaya,
    audit, temuanAudit, elemenSMK3, lingkungan,
    kpiLagging, kpiLeading, trenInsiden, trenBahaya,
    kegiatan, capa, aktivitas, perhatian
  };
})();
