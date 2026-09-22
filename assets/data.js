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

  /* ─── 11. Manajemen Pelatihan ─── */
  const pelatihan = [
    { id: 'TRN-2026-021', nama: 'Petugas K3 Umum (AK3U)', jenis: 'Wajib Regulasi', target: 4,
      rencanaTgl: '14–19 Sep 2026', rencanaPeserta: 4, aktualTgl: '14–19 Sep 2026', aktualPeserta: 4,
      penyelenggara: 'PJK3 Sucofindo', status: 'Selesai', biaya: '28,0' },
    { id: 'TRN-2026-022', nama: 'Operator Forklift — Penyegaran SIO', jenis: 'Wajib Regulasi', target: 12,
      rencanaTgl: '11 Sep 2026', rencanaPeserta: 12, aktualTgl: '11 Sep 2026', aktualPeserta: 12,
      penyelenggara: 'Disnaker Bekasi', status: 'Selesai', biaya: '9,6' },
    { id: 'TRN-2026-023', nama: 'Tanggap Darurat & Pemadam Kebakaran', jenis: 'Internal', target: 40,
      rencanaTgl: '17 Sep 2026', rencanaPeserta: 40, aktualTgl: '17 Sep 2026', aktualPeserta: 34,
      penyelenggara: 'Tim QHSE internal', status: 'Selesai', biaya: '3,2' },
    { id: 'TRN-2026-024', nama: 'Bekerja di Ruang Terbatas (Confined Space)', jenis: 'Wajib Regulasi', target: 8,
      rencanaTgl: '25–26 Sep 2026', rencanaPeserta: 8, aktualTgl: '—', aktualPeserta: 0,
      penyelenggara: 'PJK3 Mutiara Mutu', status: 'Terjadwal', biaya: '14,0' },
    { id: 'TRN-2026-025', nama: 'Ahli K3 Pesawat Uap (Boiler)', jenis: 'Wajib Regulasi', target: 2,
      rencanaTgl: '05–09 Okt 2026', rencanaPeserta: 2, aktualTgl: '—', aktualPeserta: 0,
      penyelenggara: 'PJK3 Sucofindo', status: 'Terjadwal', biaya: '18,5' },
    { id: 'TRN-2026-026', nama: 'Induksi K3 Pekerja Baru — Batch IX', jenis: 'Internal', target: 22,
      rencanaTgl: '02 Sep 2026', rencanaPeserta: 22, aktualTgl: '02 Sep 2026', aktualPeserta: 22,
      penyelenggara: 'Tim QHSE internal', status: 'Selesai', biaya: '0,8' },
    { id: 'TRN-2026-027', nama: 'Higiene Industri & Keamanan Pangan', jenis: 'Internal', target: 60,
      rencanaTgl: '08 Agu 2026', rencanaPeserta: 60, aktualTgl: '—', aktualPeserta: 0,
      penyelenggara: 'QA & QHSE', status: 'Tertunda', biaya: '5,5' },
    { id: 'TRN-2026-028', nama: 'Penanganan Limbah B3 & Manifes', jenis: 'Refreshment', target: 6,
      rencanaTgl: '29 Sep 2026', rencanaPeserta: 6, aktualTgl: '—', aktualPeserta: 0,
      penyelenggara: 'Tim QHSE internal', status: 'Terjadwal', biaya: '1,2' }
  ];

  const sertifikasi = [
    { nama: 'Ahli K3 Umum', pemegang: 'Fadli Saldi', nomor: 'SER.5382/AK3U/2023', berlaku: '14 Mar 2027', sisa: 174 },
    { nama: 'Ahli K3 Pesawat Uap', pemegang: 'Bambang Sutrisno', nomor: 'SER.1120/PUBT/2023', berlaku: '30 Okt 2026', sisa: 39 },
    { nama: 'SIO Operator Forklift', pemegang: '12 operator', nomor: 'SIO kolektif Disnaker', berlaku: '11 Sep 2031', sisa: 1816 },
    { nama: 'Teknisi K3 Listrik', pemegang: 'Hendra Gunawan', nomor: 'SER.0741/LIS/2022', berlaku: '08 Okt 2026', sisa: 17 },
    { nama: 'Petugas P3K di Tempat Kerja', pemegang: '8 petugas', nomor: 'SER.2210/P3K/2024', berlaku: '22 Feb 2027', sisa: 154 },
    { nama: 'Regu Penanggulangan Kebakaran Kelas D', pemegang: '16 anggota', nomor: 'SER.3390/DAMKAR/2024', berlaku: '05 Jun 2027', sisa: 257 }
  ];

  /* ─── 12. Manajemen Risiko ─── */
  const risikoKonteks = {
    lingkup: 'Seluruh proses produksi biskuit dan wafer di Pabrik Cibitung, termasuk gudang bahan baku, gudang barang jadi, utilitas (boiler, kompresor, IPAL), dan pekerjaan kontraktor di dalam area pabrik.',
    internal: [
      'Empat lini produksi berjalan 2 shift, 412 pekerja tetap dan 38 pekerja kontrak harian',
      'Dua boiler pipa api berbahan bakar gas, salah satunya berumur 14 tahun',
      'TPS Limbah B3 berizin dengan kapasitas simpan 90 hari',
      'Perputaran pekerja kontrak harian relatif tinggi pada masa puncak produksi Ramadan'
    ],
    eksternal: [
      'Sertifikasi ISO 45001 dan ISO 14001 dengan surveillance tahunan',
      'Audit SMK3 PP 50/2012 dengan target tingkat penilaian lanjutan',
      'Pemeriksaan berkala Disnaker dan Dinas Lingkungan Hidup Kabupaten Bekasi',
      'Baku mutu air limbah Permen LHK 5/2014 dan emisi Permen LHK 11/2021'
    ],
    kriteria: 'Risiko dinilai dengan matriks 5×5 (Kemungkinan × Keparahan). Skor 15–25 tidak dapat diterima dan wajib diturunkan sebelum pekerjaan berjalan; 10–14 memerlukan persetujuan Manajer Area; 5–9 dikendalikan dengan tenggat 30 hari; 1–4 dipantau.'
  };

  const risikoRegister = [
    { id: 'RSK-2026-001', proses: 'Utilitas — Boiler', ancaman: 'Ledakan pesawat uap akibat katup pengaman gagal',
      penyebab: 'Dudukan katup pengaman aus, uji berkala terlewat', dampak: 'Korban jiwa, pabrik berhenti total',
      L: 2, S: 5, opsi: 'Kurangi', mitigasi: 'Uji katup pengaman tiap 3 bulan oleh PJK3, penggantian katup boiler 2, sertifikasi ulang kelayakan operasi',
      pj: 'Bambang Sutrisno', target: '30 Okt 2026', sisaL: 1, sisaS: 5, reviu: '01 Okt 2026', status: 'Dalam Proses' },
    { id: 'RSK-2026-002', proses: 'Logistik — Forklift', ancaman: 'Tabrakan forklift dengan pejalan kaki',
      penyebab: 'Jalur pejalan kaki tidak terpisah, titik buta di persimpangan', dampak: 'Cedera berat sampai fatal',
      L: 4, S: 4, opsi: 'Kurangi', mitigasi: 'Marka jalur pejalan kaki terpisah, cermin cembung di 6 persimpangan, pembatas kecepatan 8 km/jam, blue spot light',
      pj: 'Agus Prasetyo', target: '15 Nov 2026', sisaL: 2, sisaS: 4, reviu: '05 Okt 2026', status: 'Dalam Proses' },
    { id: 'RSK-2026-003', proses: 'Produksi — Oven', ancaman: 'Luka bakar uap dan permukaan panas',
      penyebab: 'Prosedur pembuangan kondensat tidak lengkap, pekerja baru', dampak: 'Cedera hilang waktu kerja',
      L: 3, S: 3, opsi: 'Kurangi', mitigasi: 'Revisi SOP dengan waktu tunggu penurunan tekanan, isolasi permukaan panas, APD lengan tahan panas',
      pj: 'Hendra Gunawan', target: '02 Okt 2026', sisaL: 2, sisaS: 2, reviu: '10 Okt 2026', status: 'Dalam Proses' },
    { id: 'RSK-2026-004', proses: 'Lingkungan — IPAL', ancaman: 'Air limbah melewati baku mutu terbuang ke badan air',
      penyebab: 'Beban minyak dan lemak dari pencucian tangki tidak terjadwal', dampak: 'Sanksi administratif, pencemaran, publikasi negatif',
      L: 3, S: 4, opsi: 'Kurangi', mitigasi: 'Grease trap tambahan di jalur pencucian, penjadwalan pencucian tangki, uji harian minyak dan lemak',
      pj: 'Yuni Astuti', target: '20 Okt 2026', sisaL: 2, sisaS: 3, reviu: '28 Sep 2026', status: 'Dalam Proses' },
    { id: 'RSK-2026-005', proses: 'Gudang — Penyimpanan', ancaman: 'Kebakaran gudang barang jadi',
      penyebab: 'Beban api tinggi dari karton, instalasi listrik lama', dampak: 'Kerugian material besar, henti produksi',
      L: 2, S: 5, opsi: 'Transfer', mitigasi: 'Sprinkler otomatis, thermografi panel tahunan, asuransi properti dan gangguan usaha',
      pj: 'Rahmat Hidayat', target: '31 Des 2026', sisaL: 1, sisaS: 4, reviu: '15 Okt 2026', status: 'Terbuka' },
    { id: 'RSK-2026-006', proses: 'Kontraktor — Pekerjaan berisiko tinggi', ancaman: 'Kecelakaan pekerja vendor di dalam area pabrik',
      penyebab: 'Induksi K3 tidak konsisten, pengawasan tidak melekat', dampak: 'Cedera, tuntutan hukum, henti pekerjaan',
      L: 3, S: 4, opsi: 'Kurangi', mitigasi: 'Induksi K3 wajib sebelum izin terbit, verifikasi asuransi tenaga kerja, pengawas melekat untuk pekerjaan panas dan ruang terbatas',
      pj: 'Fadli Saldi', target: '30 Sep 2026', sisaL: 2, sisaS: 3, reviu: '30 Sep 2026', status: 'Dalam Proses' },
    { id: 'RSK-2026-007', proses: 'Produksi — Higiene', ancaman: 'Kontaminasi benda asing pada produk',
      penyebab: 'Serpihan logam dari ayakan aus, kebijakan benda longgar belum ketat', dampak: 'Penarikan produk, kerugian reputasi',
      L: 2, S: 4, opsi: 'Kurangi', mitigasi: 'Metal detector di ujung lini, pemeriksaan ayakan mingguan, kebijakan benda longgar dan perhiasan',
      pj: 'Dewi Kartika', target: '10 Okt 2026', sisaL: 1, sisaS: 4, reviu: '12 Okt 2026', status: 'Dalam Proses' },
    { id: 'RSK-2026-008', proses: 'Ergonomi — Packing', ancaman: 'Gangguan otot rangka akibat gerakan berulang',
      penyebab: 'Postur berdiri statis 8 jam, tinggi meja tidak dapat disetel', dampak: 'Absensi meningkat, keluhan kronis',
      L: 4, S: 2, opsi: 'Kurangi', mitigasi: 'Meja dapat disetel, rotasi tugas tiap 2 jam, senam peregangan sebelum shift',
      pj: 'Siti Nurhaliza', target: '25 Nov 2026', sisaL: 2, sisaS: 2, reviu: '20 Okt 2026', status: 'Terbuka' }
  ];

  /* ─── 13. Dokumen Internal ─── */
  const dokInternal = [
    { id: 'KGM-01', level: 1, jenis: 'Manual', judul: 'Manual Sistem Manajemen QHSE Terpadu', rev: 4,
      terbit: '02 Feb 2026', tinjau: '02 Feb 2027', pemilik: 'Management Representative', status: 'Berlaku' },
    { id: 'KGK-01', level: 1, jenis: 'Kebijakan', judul: 'Kebijakan K3 dan Lingkungan', rev: 3,
      terbit: '14 Jan 2025', tinjau: '14 Jan 2026', pemilik: 'Plant Manager', status: 'Kedaluwarsa' },
    { id: 'KGK-02', level: 1, jenis: 'Kebijakan', judul: 'Kebijakan Hak Menghentikan Pekerjaan Tidak Aman', rev: 1,
      terbit: '10 Mar 2026', tinjau: '10 Mar 2027', pemilik: 'Plant Manager', status: 'Berlaku' },
    { id: 'KGP-04', level: 2, jenis: 'Prosedur', judul: 'Prosedur Identifikasi Bahaya, Penilaian & Pengendalian Risiko', rev: 5,
      terbit: '18 Mar 2026', tinjau: '18 Mar 2027', pemilik: 'QHSE Supervisor', status: 'Berlaku' },
    { id: 'KGP-07', level: 2, jenis: 'Prosedur', judul: 'Prosedur Pelaporan & Investigasi Insiden', rev: 6,
      terbit: '05 Sep 2026', tinjau: '05 Sep 2027', pemilik: 'QHSE Supervisor', status: 'Berlaku' },
    { id: 'KGP-09', level: 2, jenis: 'Prosedur', judul: 'Prosedur Izin Kerja Berisiko Tinggi', rev: 3,
      terbit: '22 Apr 2026', tinjau: '22 Apr 2027', pemilik: 'QHSE Supervisor', status: 'Berlaku' },
    { id: 'KGP-12', level: 2, jenis: 'Prosedur', judul: 'Prosedur Tanggap Darurat & Evakuasi', rev: 4,
      terbit: '30 Jun 2026', tinjau: '30 Jun 2027', pemilik: 'Koordinator Tanggap Darurat', status: 'Berlaku' },
    { id: 'KGP-15', level: 2, jenis: 'Prosedur', judul: 'Prosedur Pengelolaan Limbah B3', rev: 2,
      terbit: '11 Mei 2026', tinjau: '11 Mei 2027', pemilik: 'Petugas Lingkungan', status: 'Dalam Revisi' },
    { id: 'KGI-22', level: 3, jenis: 'Instruksi Kerja', judul: 'IK Pembuangan Kondensat Oven Tunnel', rev: 2,
      terbit: '20 Sep 2026', tinjau: '20 Sep 2027', pemilik: 'Supervisor Produksi', status: 'Dalam Revisi' },
    { id: 'KGI-28', level: 3, jenis: 'Instruksi Kerja', judul: 'IK Lockout–Tagout Panel Listrik', rev: 3,
      terbit: '08 Jul 2026', tinjau: '08 Jul 2027', pemilik: 'Supervisor Maintenance', status: 'Berlaku' },
    { id: 'KGI-31', level: 3, jenis: 'Instruksi Kerja', judul: 'IK Masuk Ruang Terbatas & Uji Gas', rev: 1,
      terbit: '15 Agu 2026', tinjau: '15 Agu 2027', pemilik: 'QHSE Supervisor', status: 'Berlaku' },
    { id: 'KGF-05', level: 4, jenis: 'Formulir', judul: 'Formulir JSEA & Izin Kerja', rev: 3,
      terbit: '22 Apr 2026', tinjau: '22 Apr 2027', pemilik: 'QHSE Supervisor', status: 'Berlaku' },
    { id: 'KGF-11', level: 4, jenis: 'Formulir', judul: 'Formulir Observasi Perilaku Aman', rev: 2,
      terbit: '03 Feb 2026', tinjau: '03 Feb 2027', pemilik: 'QHSE Supervisor', status: 'Berlaku' },
    { id: 'KGF-18', level: 4, jenis: 'Formulir', judul: 'Formulir P2H Forklift Harian', rev: 4,
      terbit: '19 Jan 2026', tinjau: '19 Jan 2027', pemilik: 'Supervisor Logistik', status: 'Berlaku' }
  ];

  /* ─── 14. Dokumen Eksternal (Compliance) ─── */
  const dokEksternal = [
    { id: 'CMP-001', jenis: 'Sertifikat Sistem', judul: 'Sertifikat ISO 45001:2018', penerbit: 'TÜV Rheinland',
      nomor: '01 121 2023 0045', terbit: '20 Okt 2023', berlaku: '19 Okt 2026', sisa: 28 },
    { id: 'CMP-002', jenis: 'Sertifikat Sistem', judul: 'Sertifikat ISO 14001:2015', penerbit: 'TÜV Rheinland',
      nomor: '01 104 2023 0046', terbit: '20 Okt 2023', berlaku: '19 Okt 2026', sisa: 28 },
    { id: 'CMP-003', jenis: 'Sertifikat Sistem', judul: 'Sertifikat SMK3 PP 50/2012 — Tingkat Lanjutan', penerbit: 'Kemnaker RI',
      nomor: 'SMK3/1284/2024', terbit: '08 Apr 2024', berlaku: '07 Apr 2027', sisa: 198 },
    { id: 'CMP-004', jenis: 'Izin Lingkungan', judul: 'Persetujuan Teknis Pembuangan Air Limbah', penerbit: 'DLH Kab. Bekasi',
      nomor: '660/312/DLH/2024', terbit: '15 Mei 2024', berlaku: '14 Mei 2029', sisa: 965 },
    { id: 'CMP-005', jenis: 'Izin Lingkungan', judul: 'Izin Penyimpanan Sementara Limbah B3', penerbit: 'DLH Kab. Bekasi',
      nomor: '660/118/TPS-B3/2022', terbit: '15 Mar 2022', berlaku: '14 Mar 2027', sisa: 174 },
    { id: 'CMP-006', jenis: 'Izin Peralatan', judul: 'Surat Keterangan Layak Operasi Boiler 1', penerbit: 'Disnaker Prov. Jabar',
      nomor: 'SKLO/PUBT/0891/2025', terbit: '12 Jul 2025', berlaku: '11 Jul 2027', sisa: 293 },
    { id: 'CMP-007', jenis: 'Izin Peralatan', judul: 'Surat Keterangan Layak Operasi Boiler 2', penerbit: 'Disnaker Prov. Jabar',
      nomor: 'SKLO/PUBT/0654/2024', terbit: '01 Jul 2024', berlaku: '30 Jun 2026', sisa: -83 },
    { id: 'CMP-008', jenis: 'Izin Peralatan', judul: 'Riksa Uji Instalasi Penyalur Petir', penerbit: 'PJK3 Sucofindo',
      nomor: 'RU/IPP/2024/0233', terbit: '18 Nov 2024', berlaku: '17 Nov 2026', sisa: 57 },
    { id: 'CMP-009', jenis: 'Izin Peralatan', judul: 'Riksa Uji Instalasi Listrik & Thermografi', penerbit: 'PJK3 Sucofindo',
      nomor: 'RU/LIS/2025/0117', terbit: '24 Feb 2025', berlaku: '23 Feb 2027', sisa: 155 },
    { id: 'CMP-010', jenis: 'Pelaporan Wajib', judul: 'Laporan P2K3 Triwulan II 2026', penerbit: 'Disnaker Kab. Bekasi',
      nomor: 'menunggu pengiriman', terbit: '—', berlaku: '10 Sep 2026', sisa: -11 },
    { id: 'CMP-011', jenis: 'Pelaporan Wajib', judul: 'Laporan Swapantau IPAL Triwulan III 2026', penerbit: 'DLH Kab. Bekasi',
      nomor: 'dalam penyusunan', terbit: '—', berlaku: '10 Okt 2026', sisa: 19 },
    { id: 'CMP-012', jenis: 'Pelaporan Wajib', judul: 'Neraca Limbah B3 Triwulan III 2026', penerbit: 'DLH Kab. Bekasi',
      nomor: 'dalam penyusunan', terbit: '—', berlaku: '10 Okt 2026', sisa: 19 }
  ];

  /* ─── 15. Safety Checklist ─── */
  const checklistHarian = [
    { id: 'CHK-2026-1841', nama: 'P2H Forklift', frekuensi: 'Setiap shift', area: 'Gudang & Logistik',
      shift: 'Shift 1', pj: 'Agus Prasetyo', butir: 18, selesai: 18, temuan: 1, status: 'Selesai', waktu: '06:40' },
    { id: 'CHK-2026-1842', nama: 'Pra-nyala Boiler', frekuensi: 'Harian', area: 'Ruang Boiler',
      shift: 'Shift 1', pj: 'Bambang Sutrisno', butir: 14, selesai: 14, temuan: 0, status: 'Selesai', waktu: '05:20' },
    { id: 'CHK-2026-1843', nama: 'Kepatuhan APD Lini Produksi', frekuensi: 'Harian', area: 'Line 1 – Line 4',
      shift: 'Shift 1', pj: 'Dewi Kartika', butir: 12, selesai: 12, temuan: 2, status: 'Selesai', waktu: '07:05' },
    { id: 'CHK-2026-1844', nama: 'Kebersihan & Kerapian Area (5R)', frekuensi: 'Harian', area: 'Seluruh area produksi',
      shift: 'Shift 1', pj: 'Siti Nurhaliza', butir: 20, selesai: 13, temuan: 3, status: 'Dalam Proses', waktu: '08:15' },
    { id: 'CHK-2026-1845', nama: 'Ruang Panel & Genset', frekuensi: 'Harian', area: 'Ruang Panel Utama',
      shift: 'Shift 1', pj: 'Hendra Gunawan', butir: 10, selesai: 0, temuan: 0, status: 'Terbuka', waktu: '—' },
    { id: 'CHK-2026-1846', nama: 'P2H Forklift', frekuensi: 'Setiap shift', area: 'Gudang & Logistik',
      shift: 'Shift 2', pj: 'Rahmat Hidayat', butir: 18, selesai: 0, temuan: 0, status: 'Terbuka', waktu: '—' }
  ];

  const checklistP2H = [
    { butir: 'Rem kaki dan rem tangan berfungsi', jawab: 'Sesuai' },
    { butir: 'Klakson dan alarm mundur berbunyi', jawab: 'Sesuai' },
    { butir: 'Lampu kerja dan blue spot light menyala', jawab: 'Sesuai' },
    { butir: 'Garpu tidak retak dan pengunci terpasang', jawab: 'Sesuai' },
    { butir: 'Rantai angkat dilumasi dan tidak aus', jawab: 'Tidak Sesuai',
      catatan: 'Rantai angkat FL-03 kering dan berkarat ringan. Unit dikeluarkan dari operasi sampai dilumasi.' },
    { butir: 'Kebocoran oli hidrolik tidak ditemukan', jawab: 'Sesuai' },
    { butir: 'Ban tidak gundul dan tekanan cukup', jawab: 'Sesuai' },
    { butir: 'Sabuk pengaman operator berfungsi', jawab: 'Sesuai' },
    { butir: 'APAR di unit terpasang dan bertekanan', jawab: 'Sesuai' },
    { butir: 'Kartu SIO operator masih berlaku', jawab: 'Sesuai' }
  ];

  /* ─── 16. Observasi Perilaku ─── */
  const obsKategori = [
    { nama: 'Alat Pelindung Diri', aman: 284, berisiko: 18 },
    { nama: 'Posisi & Postur Tubuh', aman: 231, berisiko: 34 },
    { nama: 'Alat & Peralatan Kerja', aman: 198, berisiko: 12 },
    { nama: 'Kepatuhan Prosedur', aman: 176, berisiko: 27 },
    { nama: 'Kerapian & Kebersihan', aman: 203, berisiko: 9 },
    { nama: 'Reaksi Terhadap Pengamat', aman: 241, berisiko: 6 }
  ];

  const observasi = [
    { id: 'OBS-2026-0612', observer: 'Fadli Saldi', area: 'Line 4 — Packing', tanggal: '20 Sep 2026',
      aman: 11, berisiko: 2, kategori: 'Posisi & Postur Tubuh',
      catatan: 'Dua pekerja mengangkat karton 15 kg dengan punggung membungkuk, bukan menekuk lutut.',
      tindakan: 'Peragaan teknik angkat di tempat, disepakati rotasi tugas tiap 2 jam.' },
    { id: 'OBS-2026-0611', observer: 'Dewi Kartika', area: 'Line 1 — Mixing', tanggal: '20 Sep 2026',
      aman: 9, berisiko: 1, kategori: 'Alat Pelindung Diri',
      catatan: 'Satu pekerja menurunkan masker saat menuang tepung dari sak.',
      tindakan: 'Diskusi singkat soal paparan debu tepung; masker cadangan disediakan di titik tuang.' },
    { id: 'OBS-2026-0610', observer: 'Agus Prasetyo', area: 'Gudang Bahan Baku', tanggal: '19 Sep 2026',
      aman: 14, berisiko: 0, kategori: '—',
      catatan: 'Seluruh perilaku teramati aman. Operator forklift berhenti penuh di setiap persimpangan.',
      tindakan: 'Apresiasi disampaikan di safety talk pagi berikutnya.' },
    { id: 'OBS-2026-0609', observer: 'Hendra Gunawan', area: 'Workshop Maintenance', tanggal: '19 Sep 2026',
      aman: 8, berisiko: 3, kategori: 'Kepatuhan Prosedur',
      catatan: 'Penggerindaan dilakukan tanpa memasang pelindung percikan dan tanpa memeriksa area sekitar.',
      tindakan: 'Pekerjaan dihentikan sementara, pelindung dipasang, IK penggerindaan dibahas ulang.' },
    { id: 'OBS-2026-0608', observer: 'Rina Wulandari', area: 'Ruang Boiler', tanggal: '18 Sep 2026',
      aman: 12, berisiko: 1, kategori: 'Alat & Peralatan Kerja',
      catatan: 'Kunci pas digunakan sebagai pengganti kunci momen pada sambungan pipa uap.',
      tindakan: 'Kunci momen disediakan di panel alat ruang boiler.' }
  ];

  /* ─── 17. Dashboard Eksekutif ─── */
  const pabrikKinerja = [
    { nama: 'Cibitung', pekerja: 412, trir: '0,44', ltifr: '1,84', manhours: '2.740.000',
      insiden: 6, bahaya: 87, capa: '82%', smk3: '91%', status: 'Perhatian' },
    { nama: 'Bekasi', pekerja: 298, trir: '0,30', ltifr: '1,01', manhours: '1.980.000',
      insiden: 3, bahaya: 71, capa: '94%', smk3: '95%', status: 'Baik' },
    { nama: 'Semarang', pekerja: 214, trir: '0,56', ltifr: '2,11', manhours: '1.420.000',
      insiden: 4, bahaya: 38, capa: '68%', smk3: '84%', status: 'Kritis' },
    { nama: 'Medan', pekerja: 147, trir: '0,41', ltifr: '2,04', manhours: '980.000',
      insiden: 2, bahaya: 44, capa: '88%', smk3: '89%', status: 'Baik' }
  ];

  const programStrategis = [
    { nama: 'Pemisahan jalur pejalan kaki & forklift', target: '4 pabrik', capai: 2, dari: 4, tenggat: 'Des 2026', status: 'Dalam Proses' },
    { nama: 'Sertifikasi ulang ISO 45001 & 14001', target: 'Surveillance Okt', capai: 0, dari: 1, tenggat: 'Okt 2026', status: 'Terjadwal' },
    { nama: 'Program Observasi Perilaku Aman', target: '400 observasi/bulan', capai: 302, dari: 400, tenggat: 'Berjalan', status: 'Dalam Proses' },
    { nama: 'Penggantian boiler tua Cibitung', target: 'Boiler 2', capai: 0, dari: 1, tenggat: 'Q2 2027', status: 'Terbuka' },
    { nama: 'Nihil kecelakaan hilang waktu kerja', target: '4 pabrik sepanjang 2026', capai: 3, dari: 4, tenggat: 'Des 2026', status: 'Dalam Proses' }
  ];

  const trenTrir = [
    { bln: 'Okt', v: 0.71 }, { bln: 'Nov', v: 0.68 }, { bln: 'Des', v: 0.74 }, { bln: 'Jan', v: 0.66 },
    { bln: 'Feb', v: 0.61 }, { bln: 'Mar', v: 0.58 }, { bln: 'Apr', v: 0.55 }, { bln: 'Mei', v: 0.52 },
    { bln: 'Jun', v: 0.49 }, { bln: 'Jul', v: 0.47 }, { bln: 'Ags', v: 0.45 }, { bln: 'Sep', v: 0.42 }
  ];

  /* ─── 18. Notifikasi ─── */
  const notifikasi = [
    { id: 'N-901', jenis: 'critical', modul: 'Dokumen Eksternal', judul: 'SKLO Boiler 2 sudah kedaluwarsa 83 hari',
      isi: 'Surat Keterangan Layak Operasi boiler 2 berakhir 30 Jun 2026. Pengoperasian boiler tanpa SKLO adalah pelanggaran regulasi.',
      waktu: '08:12 hari ini', baca: false, aksi: 'docext' },
    { id: 'N-900', jenis: 'critical', modul: 'CAPA', judul: 'CAPA-2026-0124 terlambat 11 hari',
      isi: 'Laporan P2K3 triwulan II belum dikirim ke Disnaker. Tenggat 10 Sep 2026, penanggung jawab Fadli Saldi.',
      waktu: '08:00 hari ini', baca: false, aksi: 'capa' },
    { id: 'N-899', jenis: 'high', modul: 'Work Permit', judul: 'WP-2026-0913 tertahan 18 jam di verifikasi QHSE',
      isi: 'Izin ruang terbatas menunggu hasil uji gas O₂/LEL/H₂S. Eskalasi otomatis ke Plant Manager pada jam ke-24.',
      waktu: '07:45 hari ini', baca: false, aksi: 'permit' },
    { id: 'N-898', jenis: 'high', modul: 'Pelatihan', judul: 'Sertifikat Teknisi K3 Listrik berakhir 17 hari lagi',
      isi: 'Sertifikat atas nama Hendra Gunawan berlaku sampai 08 Okt 2026. Pendaftaran penyegaran perlu dilakukan sekarang.',
      waktu: '06:30 hari ini', baca: true, aksi: 'training' },
    { id: 'N-897', jenis: 'high', modul: 'Environment', judul: 'Minyak & lemak IPAL melewati baku mutu',
      isi: 'Hasil uji 15 Sep menunjukkan 14 mg/L terhadap ambang 10 mg/L. Uji ulang wajib dalam 14 hari.',
      waktu: 'Kemarin 16:20', baca: true, aksi: 'environment' },
    { id: 'N-896', jenis: 'medium', modul: 'Insiden', judul: 'INC-2026-0318 menunggu investigasi akar masalah',
      isi: 'Accident berkeparahan Serius di Line 3. Investigasi 5-Why belum lengkap, status belum dapat naik ke Terverifikasi.',
      waktu: 'Kemarin 14:05', baca: true, aksi: 'incident' },
    { id: 'N-895', jenis: 'medium', modul: 'Dokumen Internal', judul: 'Kebijakan K3 dan Lingkungan lewat masa tinjau',
      isi: 'KGK-01 revisi 3 seharusnya ditinjau ulang 14 Jan 2026. Perubahan struktur organisasi Mei 2026 belum tercermin.',
      waktu: 'Kemarin 09:40', baca: true, aksi: 'docint' },
    { id: 'N-894', jenis: 'medium', modul: 'Safety Checklist', judul: 'P2H Forklift shift 2 belum dikerjakan',
      isi: 'CHK-2026-1846 belum dimulai. Forklift tidak boleh dioperasikan sebelum P2H selesai.',
      waktu: 'Kemarin 08:15', baca: true, aksi: 'checklist' },
    { id: 'N-893', jenis: 'low', modul: 'CAPA', judul: 'CAPA-2026-0138 ditutup dan diverifikasi',
      isi: 'Cermin cembung dan marka pejalan kaki persimpangan B2 terpasang, bukti foto terlampir.',
      waktu: '2 hari lalu', baca: true, aksi: 'capa' },
    { id: 'N-892', jenis: 'info', modul: 'SHE Activity', judul: 'Safety Talk bahaya uap panas — 24 peserta',
      isi: 'ACT-2026-0091 tersimpan dengan daftar hadir terpindai. Jam-orang otomatis masuk ke KPI Jam Pelatihan K3.',
      waktu: '2 hari lalu', baca: true, aksi: 'activity' }
  ];

  const aturanNotifikasi = [
    { peristiwa: 'Insiden Accident dilaporkan', kanal: 'Aplikasi + WhatsApp + Email', penerima: 'QHSE, Plant Manager, Supervisor Area', segera: 'Seketika' },
    { peristiwa: 'Izin kerja menunggu > 24 jam', kanal: 'Aplikasi + Email', penerima: 'Plant Manager', segera: 'Eskalasi otomatis' },
    { peristiwa: 'CAPA lewat tenggat', kanal: 'Aplikasi + Email', penerima: 'Penanggung jawab + atasan langsung', segera: 'Harian sampai ditutup' },
    { peristiwa: 'Dokumen compliance H-60', kanal: 'Aplikasi + Email', penerima: 'Pemilik dokumen, QHSE', segera: 'H-60, H-30, H-14, H-7' },
    { peristiwa: 'Sertifikat personel H-60', kanal: 'Aplikasi + Email', penerima: 'Pemegang, HRD, QHSE', segera: 'H-60, H-30, H-14' },
    { peristiwa: 'Nilai lingkungan melewati baku mutu', kanal: 'Aplikasi + WhatsApp', penerima: 'Petugas Lingkungan, Plant Manager', segera: 'Seketika' },
    { peristiwa: 'Checklist shift belum dikerjakan', kanal: 'Aplikasi', penerima: 'Penanggung jawab shift', segera: '2 jam setelah shift mulai' }
  ];

  /* ─── Pengguna & peran (purwarupa) ─── */
  const peran = {
    operator:  { nama: 'Operator Produksi',      modul: ['dashboard','ai','incident','hazard','checklist','bbs','activity'] },
    qhse:      { nama: 'QHSE Supervisor',        modul: ['dashboard','ai','incident','hazard','bbs','inspection','checklist','permit','risk','capa','audit','environment','docint','docext','training','activity','kpi','notif','settings'] },
    lingkungan:{ nama: 'Petugas Lingkungan',     modul: ['dashboard','ai','environment','docext','capa','notif','settings'] },
    manajemen: { nama: 'Plant Manager',          modul: ['exec','dashboard','ai','kpi','audit','environment','risk','capa','permit','notif','settings'] },
    admin:     { nama: 'Administrator Sistem',   modul: ['exec','dashboard','ai','incident','hazard','bbs','inspection','checklist','permit','risk','capa','audit','environment','docint','docext','training','activity','kpi','notif','settings','users'] }
  };

  const pengguna = [
    { email: 'fadli.saldi@khongguan.co.id',   nama: 'Fadli Saldi',      inisial: 'FS', peran: 'qhse',       lokasi: 'Cibitung', status: 'Aktif',    masuk: '22 Sep 2026, 06:12' },
    { email: 'agus.prasetyo@khongguan.co.id', nama: 'Agus Prasetyo',    inisial: 'AP', peran: 'operator',   lokasi: 'Cibitung', status: 'Aktif',    masuk: '22 Sep 2026, 05:48' },
    { email: 'yuni.astuti@khongguan.co.id',   nama: 'Yuni Astuti',      inisial: 'YA', peran: 'lingkungan', lokasi: 'Cibitung', status: 'Aktif',    masuk: '21 Sep 2026, 16:30' },
    { email: 'plant.manager@khongguan.co.id', nama: 'Hartono Wijaya',   inisial: 'HW', peran: 'manajemen',  lokasi: 'Cibitung', status: 'Aktif',    masuk: '21 Sep 2026, 14:05' },
    { email: 'admin@khongguan.co.id',         nama: 'Siti Nurhaliza',   inisial: 'SN', peran: 'admin',      lokasi: 'Kantor Pusat', status: 'Aktif', masuk: '22 Sep 2026, 07:01' },
    { email: 'rina.wulandari@khongguan.co.id',nama: 'Rina Wulandari',   inisial: 'RW', peran: 'qhse',       lokasi: 'Cibitung', status: 'Aktif',    masuk: '20 Sep 2026, 16:05' },
    { email: 'bambang.s@khongguan.co.id',     nama: 'Bambang Sutrisno', inisial: 'BS', peran: 'operator',   lokasi: 'Cibitung', status: 'Aktif',    masuk: '19 Sep 2026, 07:20' },
    { email: 'dewi.kartika@khongguan.co.id',  nama: 'Dewi Kartika',     inisial: 'DK', peran: 'operator',   lokasi: 'Cibitung', status: 'Aktif',    masuk: '20 Sep 2026, 15:12' },
    { email: 'hendra.g@khongguan.co.id',      nama: 'Hendra Gunawan',   inisial: 'HG', peran: 'operator',   lokasi: 'Cibitung', status: 'Nonaktif', masuk: '02 Agu 2026, 09:40' },
    { email: 'qhse.semarang@khongguan.co.id', nama: 'Lilis Suryani',    inisial: 'LS', peran: 'qhse',       lokasi: 'Semarang', status: 'Menunggu', masuk: '—' }
  ];

  const hakAkses = [
    { modul: 'Incident & Nearmiss',  operator: 'Isi',   qhse: 'Verifikasi', manajemen: 'Baca', admin: 'Kelola' },
    { modul: 'Laporan Bahaya K3L',   operator: 'Isi',   qhse: 'Verifikasi', manajemen: 'Baca', admin: 'Kelola' },
    { modul: 'Safety Checklist',     operator: 'Isi',   qhse: 'Verifikasi', manajemen: '—',    admin: 'Kelola' },
    { modul: 'Work Permit & JSEA',   operator: '—',     qhse: 'Verifikasi', manajemen: 'Verifikasi', admin: 'Kelola' },
    { modul: 'Manajemen Risiko',     operator: '—',     qhse: 'Isi',        manajemen: 'Verifikasi', admin: 'Kelola' },
    { modul: 'CAPA',                 operator: 'Baca',  qhse: 'Verifikasi', manajemen: 'Baca', admin: 'Kelola' },
    { modul: 'Audit',                operator: '—',     qhse: 'Isi',        manajemen: 'Baca', admin: 'Kelola' },
    { modul: 'Environment',          operator: '—',     qhse: 'Isi',        manajemen: 'Baca', admin: 'Kelola' },
    { modul: 'SHE KPI & Analytics',  operator: '—',     qhse: 'Baca',       manajemen: 'Baca', admin: 'Kelola' },
    { modul: 'User Management',      operator: '—',     qhse: '—',          manajemen: '—',    admin: 'Kelola' },
    { modul: 'Asisten QHSE',         operator: 'Baca',  qhse: 'Baca',       manajemen: 'Baca', admin: 'Kelola' }
  ];

  return {
    plant, periode, user, lokasi, orang,
    insiden, inspeksi, checklistAPAR, izin, jsea, bahaya,
    audit, temuanAudit, elemenSMK3, lingkungan,
    kpiLagging, kpiLeading, trenInsiden, trenBahaya,
    kegiatan, capa, aktivitas, perhatian,
    pelatihan, sertifikasi, risikoKonteks, risikoRegister,
    dokInternal, dokEksternal, checklistHarian, checklistP2H,
    obsKategori, observasi, pabrikKinerja, programStrategis, trenTrir,
    notifikasi, aturanNotifikasi,
    peran, pengguna, hakAkses
  };
})();
