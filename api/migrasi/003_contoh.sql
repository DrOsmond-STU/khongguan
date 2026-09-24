-- KG SafeGuard · data contoh.
--
-- DIBANGKITKAN dari assets/data.js. Jangan disunting tangan: jalankan ulang
-- pembangkitnya supaya data contoh dan purwarupa tidak pernah menyimpang.
--
-- Berkas ini BUKAN bagian dari pemasangan produksi. Ia hanya mengisi basis
-- data peragaan supaya seluruh layar dapat dilihat dengan data sungguhan dari
-- PostgreSQL, bukan dari data.js. Pada produksi, jalankan 001 dan 002 saja.
--
-- Seluruh isinya rekaan untuk demonstrasi, bukan catatan QHSE Khong Guan yang
-- sebenarnya.

BEGIN;

-- Ditolak bila dijalankan pada basis data yang sudah berisi catatan: data
-- contoh yang tercampur dengan catatan sungguhan tidak dapat dipisahkan lagi.
DO $jaga$
BEGIN
  IF (SELECT count(*) FROM insiden) > 0 OR (SELECT count(*) FROM capa) > 0 THEN
    RAISE EXCEPTION 'Basis data sudah berisi catatan; data contoh tidak dimuat.';
  END IF;
END
$jaga$;

CREATE TEMP TABLE t_pabrik AS SELECT id FROM pabrik WHERE kode = 'CBT';


-- Pengguna. Pada produksi mereka datang dari direktori perusahaan lewat
-- OIDC (docs/09); di sini diisi supaya nama pelapor dan penanggung jawab
-- pada layar sama dengan purwarupa.
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'fadli.saldi@khongguan.co.id', 'Fadli Saldi', 'FS', 'qhse', p.id, 'Aktif', '2026-09-22 06:12'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'agus.prasetyo@khongguan.co.id', 'Agus Prasetyo', 'AP', 'operator', p.id, 'Aktif', '2026-09-22 05:48'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'yuni.astuti@khongguan.co.id', 'Yuni Astuti', 'YA', 'lingkungan', p.id, 'Aktif', '2026-09-21 16:30'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'plant.manager@khongguan.co.id', 'Hartono Wijaya', 'HW', 'manajemen', p.id, 'Aktif', '2026-09-21 14:05'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'admin@khongguan.co.id', 'Siti Nurhaliza', 'SN', 'admin', p.id, 'Aktif', '2026-09-22 07:01'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'rina.wulandari@khongguan.co.id', 'Rina Wulandari', 'RW', 'qhse', p.id, 'Aktif', '2026-09-20 16:05'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'bambang.s@khongguan.co.id', 'Bambang Sutrisno', 'BS', 'operator', p.id, 'Aktif', '2026-09-19 07:20'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'dewi.kartika@khongguan.co.id', 'Dewi Kartika', 'DK', 'operator', p.id, 'Aktif', '2026-09-20 15:12'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'hendra.g@khongguan.co.id', 'Hendra Gunawan', 'HG', 'operator', p.id, 'Nonaktif', '2026-08-02 09:40'::timestamptz
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT 'qhse.semarang@khongguan.co.id', 'Lilis Suryani', 'LS', 'qhse', p.id, 'Menunggu', NULL
    FROM pabrik p WHERE p.kode = 'SMG'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;

-- Disebut pada catatan tetapi belum ada pada daftar pengguna purwarupa.
INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status)
  SELECT 'rahmat.hidayat@khongguan.co.id', 'Rahmat Hidayat', 'RH', 'operator', p.id, 'Menunggu'
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO NOTHING;

-- Modul 01 · Insiden.
INSERT INTO insiden (nomor, pabrik_id, area_id, jenis, keparahan, tanggal, waktu, pelapor_id,
                      ringkas, kronologi, dampak, akar, status, dibuat_pada)
  VALUES ('INC-2026-0318', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 3 — Oven Biskuit'), 'Accident', 'Serius',
          '2026-09-18', '14:20', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          'Operator terkena uap panas saat membuka katup pembuangan oven tunnel.', 'Operator hendak membuang kondensat dari katup bawah oven tunnel. Katup dibuka tanpa menunggu tekanan turun, uap menyembur dan mengenai lengan kanan operator. Korban langsung dibawa ke klinik pabrik lalu dirujuk ke RS Mitra Keluarga.', 'Luka bakar derajat 2 pada lengan kanan. Dirawat 1 hari, 4 hari kerja hilang.', 'Prosedur pembuangan kondensat tidak mencantumkan waktu tunggu penurunan tekanan. Operator baru 3 minggu di posisi ini.', 'Dalam Proses',
          '2026-09-18 14:20'::timestamptz);
INSERT INTO insiden (nomor, pabrik_id, area_id, jenis, keparahan, tanggal, waktu, pelapor_id,
                      ringkas, kronologi, dampak, akar, status, dibuat_pada)
  VALUES ('INC-2026-0317', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Gudang Bahan Baku'), 'Incident', 'Sedang',
          '2026-09-16', '09:05', (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'),
          'Palet tepung terjatuh dari rak level 3 saat penurunan dengan forklift.', 'Forklift menurunkan palet tepung 1 ton dari rak level 3. Garpu tidak masuk penuh, palet miring dan jatuh sekitar 2,5 meter. Tidak ada pekerja di bawah karena area sudah dikosongkan.', 'Kerugian material 18 sak tepung. Tidak ada cedera.', 'Penerangan di lorong rak C kurang dari 100 lux; operator tidak dapat memastikan posisi garpu.', 'Menunggu Verifikasi',
          '2026-09-16 09:05'::timestamptz);
INSERT INTO insiden (nomor, pabrik_id, area_id, jenis, keparahan, tanggal, waktu, pelapor_id,
                      ringkas, kronologi, dampak, akar, status, dibuat_pada)
  VALUES ('INC-2026-0316', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Area Forklift B2'), 'Nearmiss', 'Ringan',
          '2026-09-15', '11:40', (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'),
          'Pejalan kaki nyaris tertabrak forklift di persimpangan tanpa cermin.', 'Pekerja produksi menyeberang dari koridor B ke area packing. Forklift datang dari arah kanan yang terhalang tumpukan karton. Keduanya berhenti pada jarak sekitar 1,5 meter.', 'Tidak ada cedera dan tidak ada kerusakan.', 'Tidak ada cermin cembung di persimpangan dan jalur pejalan kaki tidak bermarka.', 'Selesai',
          '2026-09-15 11:40'::timestamptz);
INSERT INTO insiden (nomor, pabrik_id, area_id, jenis, keparahan, tanggal, waktu, pelapor_id,
                      ringkas, kronologi, dampak, akar, status, dibuat_pada)
  VALUES ('INC-2026-0315', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Ruang Boiler'), 'Nearmiss', 'Sedang',
          '2026-09-12', '07:15', (SELECT id FROM pengguna WHERE nama = 'Anonim'),
          'Katup pengaman boiler 2 mendesis terus-menerus selama pemanasan pagi.', 'Saat pemanasan pagi, katup pengaman boiler 2 mengeluarkan suara desis berkelanjutan selama sekitar 10 menit pada tekanan 6 bar, di bawah setelan seharusnya 8 bar.', 'Tidak ada cedera. Boiler dihentikan untuk pemeriksaan.', 'Dalam penyelidikan. Dugaan dudukan katup pengaman aus.', 'Terbuka',
          '2026-09-12 07:15'::timestamptz);
INSERT INTO insiden (nomor, pabrik_id, area_id, jenis, keparahan, tanggal, waktu, pelapor_id,
                      ringkas, kronologi, dampak, akar, status, dibuat_pada)
  VALUES ('INC-2026-0314', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 4 — Packing'), 'Incident', 'Ringan',
          '2026-09-08', '16:50', (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'),
          'Conveyor packing berhenti mendadak karena sensor terhalang serpihan karton.', 'Sensor optik jalur packing terhalang serpihan karton, conveyor berhenti darurat dan 40 karton menumpuk di ujung jalur.', 'Produksi tertahan 22 menit. Tidak ada cedera.', 'Jadwal pembersihan sensor belum masuk checklist harian jalur packing.', 'Selesai',
          '2026-09-08 16:50'::timestamptz);
INSERT INTO insiden (nomor, pabrik_id, area_id, jenis, keparahan, tanggal, waktu, pelapor_id,
                      ringkas, kronologi, dampak, akar, status, dibuat_pada)
  VALUES ('INC-2026-0313', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'TPS Limbah B3'), 'Nearmiss', 'Serius',
          '2026-09-04', '10:30', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'),
          'Drum oli bekas bocor di TPS B3, tumpahan tertahan di bak penampung.', 'Drum oli bekas 200 liter ditemukan bocor pada sambungan bawah. Sekitar 15 liter tumpah dan tertahan bak penampung sekunder. Tidak keluar area TPS.', 'Tumpahan 15 liter tertangani dengan absorben. Tidak ada cedera dan tidak ada pencemaran keluar area.', 'Drum berumur lebih dari 5 tahun dan tidak ada pemeriksaan kondisi kemasan sebelum penyimpanan.', 'Dalam Proses',
          '2026-09-04 10:30'::timestamptz);

-- Modul 04 · Laporan bahaya. "Anonim" pada purwarupa berarti tidak ada
-- identitas pelapor sama sekali (AB-04), bukan nama yang disembunyikan.
INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES ('HZ-2026-0451', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 3 — Oven Biskuit'), 'Unsafe Condition', 'Kabel panel kontrol oven terkelupas sepanjang 10 cm, terjangkau tangan operator.', 'Tinggi',
          (SELECT id FROM pengguna WHERE nama = 'Siti Nurhaliza'), false, 'Terbuka', now() - interval '3 hours', now() - interval '3 hours');
INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES ('HZ-2026-0450', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Gudang Barang Jadi'), 'Unsafe Action', 'Operator forklift mengangkut palet melebihi tinggi pandangan.', 'Tinggi',
          NULL, true, 'Terbuka', now() - interval '5 hours', now() - interval '5 hours');
INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES ('HZ-2026-0449', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'TPS Limbah B3'), 'Aspek Lingkungan', 'Ceceran oli di lantai TPS belum dibersihkan sejak kemarin sore.', 'Sedang',
          (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), false, 'Diverifikasi', now() - interval '8 hours', now() - interval '8 hours');
INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES ('HZ-2026-0448', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Kantin & Area Umum'), 'Unsafe Condition', 'Lantai kantin licin di dekat wastafel, belum ada rambu peringatan.', 'Sedang',
          (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'), false, 'Diverifikasi', now() - interval '1 days', now() - interval '1 days');
INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES ('HZ-2026-0447', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Area Forklift B2'), 'Unsafe Condition', 'Cermin cembung persimpangan B2 pecah dan belum diganti.', 'Tinggi',
          (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'), false, 'Ditangani', now() - interval '2 days', now() - interval '2 days');
INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES ('HZ-2026-0446', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 1 — Mixing'), 'Unsafe Action', 'Dua pekerja tidak memakai masker saat menuang tepung dari sak.', 'Sedang',
          (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'), false, 'Ditangani', now() - interval '2 days', now() - interval '2 days');
INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES ('HZ-2026-0445', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'IPAL'), 'Aspek Lingkungan', 'Bau menyengat dari bak aerasi sejak pagi, diduga blower mati semalam.', 'Sedang',
          (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'), false, 'Ditangani', now() - interval '3 days', now() - interval '3 days');

-- Modul 06 · Analisis JSA, beserta langkah dan pengendaliannya.
INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES ('JSA-2026-011', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 2 — Moulding'), 'Pembersihan tangki minyak goreng', 'Non-rutin', '["Full body harness","Sepatu anti-slip","Sarung tangan nitril","Kacamata goggle","Respirator"]'::jsonb,
          (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'), (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          (SELECT id FROM pengguna WHERE nama = 'Hartono Wijaya'),
          '2026-09-18', '2026-09-20', '2027-09-20', 2, 'Disahkan');
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-011'), 1, 'Pengosongan dan pembilasan tangki', 'Terpeleset lantai licin minyak',
          3, 2, 2, 1);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 1), 'Rekayasa', 'Selang pembuangan tertutup ke saluran khusus', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 1), 'APD', 'Sepatu anti-slip', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-011'), 2, 'Isolasi jalur masuk dan LOTO pompa transfer', 'Pompa hidup tak sengaja saat orang di dalam',
          3, 5, 1, 5);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 2), 'Administratif', 'LOTO dengan kunci dipegang pekerja di dalam', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 2), 'Administratif', 'Verifikasi oleh pengawas', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-011'), 3, 'Ventilasi paksa 15 menit', 'Atmosfer kekurangan oksigen',
          4, 4, 2, 4);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 3), 'Rekayasa', 'Blower 2.000 CFM, 15 menit', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 3), 'Administratif', 'Uji gas O₂/LEL/H₂S sebelum masuk', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-011'), 4, 'Membuka manhole dan masuk tangki', 'Terjatuh saat turun; terjebak di dalam',
          4, 4, 2, 4);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 4), 'Rekayasa', 'Tripod dan winch penyelamat', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 4), 'Administratif', 'Penjaga lubang tetap di luar', 1);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 4), 'APD', 'Full body harness', 2);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-011'), 5, 'Pembersihan dinding dengan deterjen food grade', 'Iritasi kulit dan mata',
          3, 2, 2, 1);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 5), 'Substitusi', 'Deterjen food grade pH netral', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 5), 'APD', 'Sarung tangan nitril, kacamata goggle', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-011'), 6, 'Keluar tangki dan pelepasan LOTO', 'LOTO dilepas saat orang masih di dalam',
          2, 5, 1, 5);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 6), 'Administratif', 'Hitung ulang personel masuk dan keluar', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-011' AND l.nomor = 6), 'Administratif', 'Pelepasan LOTO oleh pemasang', 1);
INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES ('JSA-2026-010', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Ruang Boiler'), 'Pengelasan pipa uap', 'Non-rutin', '["Helm las","Apron kulit","Sarung tangan las","Sepatu safety","Respirator asap las"]'::jsonb,
          (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          (SELECT id FROM pengguna WHERE nama = 'Hartono Wijaya'),
          '2026-09-02', '2026-09-05', '2027-09-05', 3, 'Disahkan');
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-010'), 1, 'Isolasi dan pendinginan jalur uap', 'Uap bertekanan tersembur',
          3, 5, 1, 5);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 1), 'Administratif', 'LOTO katup induk, tunggu tekanan nol', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 1), 'Administratif', 'Verifikasi manometer oleh dua orang', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-010'), 2, 'Pembersihan area dari bahan mudah terbakar', 'Kebakaran dari percikan las',
          4, 4, 2, 3);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 2), 'Eliminasi', 'Bahan mudah terbakar dipindah radius 11 m', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 2), 'Rekayasa', 'Tirai tahan api', 1);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 2), 'Administratif', 'Penjaga kebakaran bersiaga', 2);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-010'), 3, 'Pengelasan sambungan', 'Radiasi busur, asap logam, luka bakar',
          4, 3, 2, 2);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 3), 'Rekayasa', 'Ventilasi hisap lokal', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 3), 'APD', 'Helm las, apron kulit, sarung tangan', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-010'), 4, 'Pendinginan dan pemeriksaan hasil las', 'Kontak permukaan panas',
          3, 2, 1, 2);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 4), 'Administratif', 'Tunggu 30 menit, rambu permukaan panas', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 4), 'APD', 'Sarung tangan tahan panas', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-010'), 5, 'Pemantauan api 60 menit setelah selesai', 'Api tersembunyi menyala kembali',
          3, 4, 1, 4);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 5), 'Administratif', 'Penjaga kebakaran 60 menit setelah pekerjaan', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-010' AND l.nomor = 5), 'Rekayasa', 'APAR dan selang siap pakai', 1);
INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES ('JSA-2026-009', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 4 — Packing'), 'Penggantian belt conveyor packing', 'Rutin', '["Sarung tangan anti-potong","Sepatu safety","Kacamata pengaman"]'::jsonb,
          (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'), (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'),
          (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-08-14', '2026-08-16', '2027-08-16', 1, 'Disahkan');
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-009'), 1, 'LOTO panel penggerak conveyor', 'Conveyor bergerak saat tangan di dalam',
          3, 5, 1, 5);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 1), 'Administratif', 'LOTO panel, kunci dipegang teknisi', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 1), 'Administratif', 'Uji coba tombol start sebelum mulai', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-009'), 2, 'Pelepasan belt lama', 'Terjepit antara belt dan roller',
          3, 3, 2, 2);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 2), 'Rekayasa', 'Pengganjal roller', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 2), 'APD', 'Sarung tangan anti-potong', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-009'), 3, 'Pemasangan belt baru dan penyetelan', 'Postur membungkuk berkepanjangan',
          4, 2, 2, 2);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 3), 'Rekayasa', 'Meja kerja setinggi pinggang', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 3), 'Administratif', 'Rotasi dua orang tiap 20 menit', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-009'), 4, 'Uji jalan tanpa beban', 'Benda terlempar dari conveyor',
          2, 3, 1, 3);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 4), 'Administratif', 'Area dikosongkan 2 m', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-009' AND l.nomor = 4), 'APD', 'Kacamata pengaman', 1);
INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES ('JSA-2026-012', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 3 — Oven Biskuit'), 'Pembersihan ducting exhaust oven', 'Non-rutin', '["Full body harness","Respirator P3","Sarung tangan tahan panas"]'::jsonb,
          (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'), (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          NULL,
          '2026-09-21', NULL, NULL, 0, 'Menunggu Pengesahan');
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-012'), 1, 'Pendinginan oven dan isolasi pemanas', 'Permukaan bersuhu di atas 200 °C',
          4, 4, 2, 3);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 1), 'Administratif', 'Pendinginan minimal 8 jam, verifikasi termometer inframerah', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 1), 'APD', 'Sarung tangan tahan panas', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-012'), 2, 'Pemasangan perancah akses ducting', 'Jatuh dari ketinggian 3,5 m',
          3, 5, 1, 5);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 2), 'Rekayasa', 'Perancah bersertifikat dengan pagar', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 2), 'APD', 'Full body harness dua tali', 1);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-012'), 3, 'Pengerokan endapan lemak dalam ducting', 'Debu lemak terhirup; ruang sempit',
          4, 3, 2, 2);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 3), 'Rekayasa', 'Blower hisap portabel', 0);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 3), 'Administratif', 'Maksimal 30 menit per orang', 1);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 3), 'APD', 'Respirator P3', 2);
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-012'), 4, 'Pembersihan akhir dan pembuangan limbah lemak', 'Limbah lemak masuk saluran air',
          3, 3, 1, 3);
INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = 'JSA-2026-012' AND l.nomor = 4), 'Administratif', 'Limbah ditampung drum khusus, serah ke TPS B3', 0);

INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES ('JSA-2026-901', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Gudang Barang Jadi'), 'Penggantian lampu high bay Gudang Barang Jadi', 'Non-rutin', '[]'::jsonb,
          (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'), (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), (SELECT id FROM pengguna WHERE nama = 'Hartono Wijaya'),
          current_date - 14, current_date - 10, current_date + 355, 1, 'Disahkan');
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                         kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-901'), 1, 'Persiapan dan isolasi',
          'Bahaya pada tahap persiapan', 2, 2, 1, 2),
         ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-901'), 2, 'Penggantian lampu high bay Gudang Barang Jadi',
          'Bahaya utama pekerjaan', 3, 4, 2, 3);

INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES ('JSA-2026-902', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Workshop Maintenance'), 'Perbaikan panel MDP Line 2', 'Non-rutin', '[]'::jsonb,
          (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'), (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), (SELECT id FROM pengguna WHERE nama = 'Hartono Wijaya'),
          current_date - 14, current_date - 10, current_date + 355, 1, 'Disahkan');
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                         kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-902'), 1, 'Persiapan dan isolasi',
          'Bahaya pada tahap persiapan', 2, 2, 1, 2),
         ((SELECT id FROM jsa WHERE nomor = 'JSA-2026-902'), 2, 'Perbaikan panel MDP Line 2',
          'Bahaya utama pekerjaan', 4, 5, 1, 5);

-- Modul 03 · Izin kerja.
--
-- JSA dipasangkan dengan izin menurut kecocokan pekerjaannya, bukan menurut
-- kolom izinTerkait pada purwarupa: di sana JSA-2026-010 (pengelasan pipa uap)
-- menunjuk WP-2026-0914 (penggantian lampu high bay), sedangkan pekerjaan
-- pengelasan pipa uap adalah WP-2026-0912. Menyalin rujukan yang tersilang
-- berarti izin Aktif kehilangan JSA-nya dan ditolak AB-09 — yang memang
-- seharusnya terjadi.
--
-- Area tidak ada pada purwarupa; diambil dari nama lokasi yang tersebut pada
-- judul, lalu dari area JSA-nya.
INSERT INTO izin (nomor, pabrik_id, area_id, jenis, judul, jsa_id, pelaksana, vendor, pekerja,
                   pengawas, mulai, durasi, prasyarat, status, dibuat_pada)
  VALUES ('WP-2026-0912', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Ruang Boiler'), 'panas', 'Pengelasan pipa uap — Ruang Boiler 2',
          (SELECT id FROM jsa WHERE nomor = 'JSA-2026-010'),
          'CV Teknik Jaya', true, 3, 'Agus Prasetyo',
          '2026-09-21 08:00'::timestamptz, '08.00–16.00 WIB',
          '[{"t":"JSEA lengkap · risiko sisa 6","ok":true},{"t":"Gas test 07.45","ok":true},{"t":"Fire watcher ditunjuk","ok":true},{"t":"Induksi K3 vendor","ok":true},{"t":"Asuransi tenaga kerja vendor","ok":true},{"t":"APAR 2 unit di lokasi","ok":null}]'::jsonb, 'Aktif', '2026-09-21'::timestamptz);
INSERT INTO izin (nomor, pabrik_id, area_id, jenis, judul, jsa_id, pelaksana, vendor, pekerja,
                   pengawas, mulai, durasi, prasyarat, status, dibuat_pada)
  VALUES ('WP-2026-0913', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 2 — Moulding'), 'ruang-terbatas', 'Pembersihan tangki minyak goreng T-04',
          (SELECT id FROM jsa WHERE nomor = 'JSA-2026-011'),
          'Maintenance internal', false, 2, 'Rina Wulandari',
          '2026-09-22 06:00'::timestamptz, '06.00–12.00 WIB',
          '[{"t":"JSEA lengkap · risiko sisa 8","ok":true},{"t":"Uji gas O₂/LEL/H₂S belum ada","ok":false},{"t":"Penjaga lubang ditunjuk","ok":true},{"t":"Blower 15 menit sebelum masuk","ok":null}]'::jsonb, 'Menunggu QHSE', '2026-09-22'::timestamptz);
INSERT INTO izin (nomor, pabrik_id, area_id, jenis, judul, jsa_id, pelaksana, vendor, pekerja,
                   pengawas, mulai, durasi, prasyarat, status, dibuat_pada)
  VALUES ('WP-2026-0914', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Gudang Barang Jadi'), 'ketinggian', 'Penggantian lampu high bay Gudang Barang Jadi',
          (SELECT id FROM jsa WHERE nomor = 'JSA-2026-901'),
          'PT Cahaya Mandiri', true, 2, 'Rahmat Hidayat',
          '2026-09-23 09:00'::timestamptz, '09.00–15.00 WIB',
          '[{"t":"JSEA lengkap · risiko sisa 6","ok":true},{"t":"Full body harness double lanyard","ok":true},{"t":"Induksi K3 vendor","ok":false},{"t":"Barikade area bawah","ok":null}]'::jsonb, 'Menunggu Supervisor', '2026-09-23'::timestamptz);
INSERT INTO izin (nomor, pabrik_id, area_id, jenis, judul, jsa_id, pelaksana, vendor, pekerja,
                   pengawas, mulai, durasi, prasyarat, status, dibuat_pada)
  VALUES ('WP-2026-0911', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Workshop Maintenance'), 'listrik', 'Perbaikan panel MDP Line 2',
          (SELECT id FROM jsa WHERE nomor = 'JSA-2026-902'),
          'Maintenance internal', false, 2, 'Hendra Gunawan',
          '2026-09-20 22:00'::timestamptz, '22.00–02.00 WIB',
          '[{"t":"JSEA lengkap · risiko sisa 5","ok":true},{"t":"LOTO terpasang, kunci di pelaksana","ok":true},{"t":"Uji tegangan nol","ok":true},{"t":"Sarung tangan isolasi 1000V","ok":true}]'::jsonb, 'Selesai', '2026-09-20'::timestamptz);

-- Modul 16 · Observasi APD. Tidak ada kolom identitas pekerja yang
-- diamati, dan tidak pernah akan ada (AB-06).
INSERT INTO observasi_apd (nomor, pabrik_id, area_id, pengamat_id, tanggal, diamati, patuh, catatan)
  VALUES ('APD-2026-0142', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 4 — Packing'), (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'), '2026-09-22',
          14, 12, 'Dua pekerja menurunkan masker saat menuang tepung dari sak.');
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0142'),
          (SELECT id FROM jenis_apd WHERE nama = 'Helm pengaman'), 14, 14);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0142'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sepatu safety'), 14, 14);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0142'),
          (SELECT id FROM jenis_apd WHERE nama = 'Masker / respirator'), 14, 12);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0142'),
          (SELECT id FROM jenis_apd WHERE nama = 'Rompi reflektif'), 14, 13);
INSERT INTO observasi_apd (nomor, pabrik_id, area_id, pengamat_id, tanggal, diamati, patuh, catatan)
  VALUES ('APD-2026-0141', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Ruang Boiler'), (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), '2026-09-21',
          4, 3, 'Satu teknisi tidak memakai pelindung telinga saat blowdown.');
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0141'),
          (SELECT id FROM jenis_apd WHERE nama = 'Helm pengaman'), 4, 4);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0141'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sepatu safety'), 4, 4);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0141'),
          (SELECT id FROM jenis_apd WHERE nama = 'Pelindung telinga'), 4, 3);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0141'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sarung tangan'), 4, 4);
INSERT INTO observasi_apd (nomor, pabrik_id, area_id, pengamat_id, tanggal, diamati, patuh, catatan)
  VALUES ('APD-2026-0140', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Area Forklift B2'), (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'), '2026-09-21',
          9, 9, 'Seluruh pekerja memakai rompi reflektif; operator forklift berhenti penuh di persimpangan.');
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0140'),
          (SELECT id FROM jenis_apd WHERE nama = 'Helm pengaman'), 9, 9);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0140'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sepatu safety'), 9, 9);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0140'),
          (SELECT id FROM jenis_apd WHERE nama = 'Rompi reflektif'), 9, 9);
INSERT INTO observasi_apd (nomor, pabrik_id, area_id, pengamat_id, tanggal, diamati, patuh, catatan)
  VALUES ('APD-2026-0139', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Workshop Maintenance'), (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), '2026-09-20',
          6, 4, 'Dua teknisi menggerinda tanpa kacamata pengaman; pekerjaan dihentikan saat itu juga.');
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0139'),
          (SELECT id FROM jenis_apd WHERE nama = 'Helm pengaman'), 6, 6);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0139'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sepatu safety'), 6, 6);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0139'),
          (SELECT id FROM jenis_apd WHERE nama = 'Kacamata pengaman'), 6, 4);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0139'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sarung tangan'), 6, 5);
INSERT INTO observasi_apd (nomor, pabrik_id, area_id, pengamat_id, tanggal, diamati, patuh, catatan)
  VALUES ('APD-2026-0138', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'TPS Limbah B3'), (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'), '2026-09-19',
          3, 3, 'Lengkap. Sarung tangan nitril diganti setiap selesai penanganan.');
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0138'),
          (SELECT id FROM jenis_apd WHERE nama = 'Helm pengaman'), 3, 3);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0138'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sepatu safety'), 3, 3);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0138'),
          (SELECT id FROM jenis_apd WHERE nama = 'Masker / respirator'), 3, 3);
INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = 'APD-2026-0138'),
          (SELECT id FROM jenis_apd WHERE nama = 'Sarung tangan'), 3, 3);

-- Modul 15 · Observasi perilaku.
INSERT INTO observasi (nomor, pabrik_id, area_id, pengamat_id, tanggal, kategori,
                        aman, berisiko, catatan, tindakan)
  VALUES ('OBS-2026-0612', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 4 — Packing'), (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), '2026-09-20',
          'Posisi & Postur Tubuh', 11, 2, 'Dua pekerja mengangkat karton 15 kg dengan punggung membungkuk, bukan menekuk lutut.', 'Peragaan teknik angkat di tempat, disepakati rotasi tugas tiap 2 jam.');
INSERT INTO observasi (nomor, pabrik_id, area_id, pengamat_id, tanggal, kategori,
                        aman, berisiko, catatan, tindakan)
  VALUES ('OBS-2026-0611', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 1 — Mixing'), (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'), '2026-09-20',
          'Alat Pelindung Diri', 9, 1, 'Satu pekerja menurunkan masker saat menuang tepung dari sak.', 'Diskusi singkat soal paparan debu tepung; masker cadangan disediakan di titik tuang.');
INSERT INTO observasi (nomor, pabrik_id, area_id, pengamat_id, tanggal, kategori,
                        aman, berisiko, catatan, tindakan)
  VALUES ('OBS-2026-0610', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Gudang Bahan Baku'), (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'), '2026-09-19',
          '—', 14, 0, 'Seluruh perilaku teramati aman. Operator forklift berhenti penuh di setiap persimpangan.', 'Apresiasi disampaikan di safety talk pagi berikutnya.');
INSERT INTO observasi (nomor, pabrik_id, area_id, pengamat_id, tanggal, kategori,
                        aman, berisiko, catatan, tindakan)
  VALUES ('OBS-2026-0609', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Workshop Maintenance'), (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'), '2026-09-19',
          'Kepatuhan Prosedur', 8, 3, 'Penggerindaan dilakukan tanpa memasang pelindung percikan dan tanpa memeriksa area sekitar.', 'Pekerjaan dihentikan sementara, pelindung dipasang, IK penggerindaan dibahas ulang.');
INSERT INTO observasi (nomor, pabrik_id, area_id, pengamat_id, tanggal, kategori,
                        aman, berisiko, catatan, tindakan)
  VALUES ('OBS-2026-0608', (SELECT id FROM t_pabrik), (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Ruang Boiler'), (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'), '2026-09-18',
          'Alat & Peralatan Kerja', 12, 1, 'Kunci pas digunakan sebagai pengganti kunci momen pada sambungan pipa uap.', 'Kunci momen disediakan di panel alat ruang boiler.');

-- Modul 07 · HIRADC.
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-001', (SELECT id FROM t_pabrik), 'Penerimaan bahan baku', 'Bongkar sak tepung dari truk', 'Rutin', 'Ergonomi',
          'Pengangkatan manual sak 25 kg berulang', 'Cedera punggung bawah kumulatif', 'Operator gudang', 4, 3, 'Hand pallet, batas dua sak per angkatan',
          3, 2, 'Konveyor bongkar muat portabel, pelatihan teknik angkat', 'Rekayasa', (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'),
          '2026-11-30', 'Dalam Proses');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-002', (SELECT id FROM t_pabrik), 'Produksi — Mixing', 'Penuangan bahan tambahan pangan', 'Rutin', 'Kimia',
          'Paparan debu bahan tambahan pangan', 'Iritasi saluran napas', 'Operator mixing', 3, 3, 'Ventilasi hisap lokal, masker N95',
          2, 2, 'Sistem penakaran tertutup', 'Rekayasa', (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'),
          '2026-12-31', 'Terbuka');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-003', (SELECT id FROM t_pabrik), 'Produksi — Oven', 'Pembuangan kondensat oven tunnel', 'Rutin', 'Fisik',
          'Semburan uap bertekanan dari katup bawah', 'Luka bakar derajat 2 pada lengan', 'Operator oven', 3, 4, 'IK pembuangan kondensat, APD lengan tahan panas',
          2, 2, 'Waktu tunggu penurunan tekanan dalam IK, pelindung katup', 'Administratif', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-10-02', 'Dalam Proses');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-004', (SELECT id FROM t_pabrik), 'Utilitas — Boiler', 'Pengoperasian dan pemeliharaan boiler', 'Rutin', 'Fisik',
          'Ledakan pesawat uap akibat katup pengaman gagal', 'Korban jiwa, kerusakan bangunan', 'Operator boiler, pekerja sekitar', 5, 2, 'Uji katup pengaman berkala, operator bersertifikat',
          5, 1, 'Penggantian katup boiler 2, SKLO diperbarui', 'Rekayasa', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'),
          '2026-10-30', 'Dalam Proses');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-005', (SELECT id FROM t_pabrik), 'Logistik — Forklift', 'Pemindahan palet di area produksi', 'Rutin', 'Mekanik',
          'Tabrakan forklift dengan pejalan kaki', 'Cedera berat sampai fatal', 'Seluruh pekerja area', 4, 4, 'Batas kecepatan 8 km/jam, P2H harian, klakson persimpangan',
          4, 2, 'Marka jalur pejalan kaki terpisah, cermin cembung, blue spot light', 'Rekayasa', (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'),
          '2026-11-15', 'Dalam Proses');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-006', (SELECT id FROM t_pabrik), 'Maintenance', 'Pekerjaan panas pengelasan', 'Non-rutin', 'Fisik',
          'Percikan las mengenai bahan mudah terbakar', 'Kebakaran gudang', 'Seluruh penghuni pabrik', 5, 3, 'Izin kerja panas, penjaga kebakaran, APAR siaga',
          5, 1, 'Tirai tahan api permanen di bengkel', 'Rekayasa', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'),
          '2026-12-20', 'Terbuka');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-007', (SELECT id FROM t_pabrik), 'Maintenance — Panel listrik', 'Pemeriksaan dan perbaikan panel', 'Non-rutin', 'Listrik',
          'Sengatan listrik dan busur api', 'Luka bakar listrik, henti jantung', 'Teknisi listrik', 5, 2, 'LOTO, teknisi bersertifikat K3 listrik, APD arc flash',
          5, 1, 'Sertifikasi ulang teknisi sebelum 08 Okt 2026', 'Administratif', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-10-08', 'Dalam Proses');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-008', (SELECT id FROM t_pabrik), 'IPAL', 'Pengambilan sampel air limbah', 'Rutin', 'Biologi',
          'Kontak air limbah mengandung mikroorganisme', 'Infeksi kulit dan saluran cerna', 'Petugas lingkungan', 2, 3, 'Sarung tangan, cuci tangan setelah bekerja',
          2, 2, 'Alat ambil sampel bertangkai panjang', 'Rekayasa', (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'),
          '2026-11-30', 'Terbuka');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-009', (SELECT id FROM t_pabrik), 'TPS Limbah B3', 'Penyimpanan dan pemindahan limbah B3', 'Rutin', 'Kimia',
          'Kebocoran kemasan oli bekas', 'Pencemaran tanah, iritasi kulit', 'Petugas TPS, lingkungan', 3, 3, 'Bak penampung sekunder, simbol dan label B3',
          2, 2, 'Pemeriksaan kondisi kemasan sebelum disimpan', 'Administratif', (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'),
          '2026-09-25', 'Dalam Proses');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-010', (SELECT id FROM t_pabrik), 'Seluruh area', 'Keadaan darurat kebakaran', 'Darurat', 'Fisik',
          'Kebakaran meluas dan evakuasi terhambat', 'Korban jiwa massal', 'Seluruh penghuni pabrik', 5, 2, 'APAR dan hydrant, jalur evakuasi bermarka, tim tanggap darurat',
          5, 1, 'Simulasi evakuasi dua kali setahun, rambu jalur diperbarui', 'Administratif', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-11-15', 'Dalam Proses');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-011', (SELECT id FROM t_pabrik), 'Packing', 'Pengemasan produk berdiri 8 jam', 'Rutin', 'Ergonomi',
          'Postur berdiri statis sepanjang shift', 'Nyeri kaki dan punggung', 'Operator packing', 3, 4, 'Alas kaki anti-lelah',
          2, 3, 'Meja dapat disetel, rotasi tugas tiap 2 jam, senam peregangan', 'Rekayasa', (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'),
          '2026-11-30', 'Terbuka');
INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES ('HRD-012', (SELECT id FROM t_pabrik), 'Seluruh area', 'Kerja shift malam berkepanjangan', 'Rutin', 'Psikososial',
          'Kelelahan akibat pola shift', 'Penurunan kewaspadaan, kesalahan operasi', 'Seluruh pekerja shift', 3, 3, 'Rotasi shift maksimal 5 hari berturut-turut',
          2, 2, 'Ruang istirahat memadai, pemantauan jam lembur', 'Administratif', (SELECT id FROM pengguna WHERE nama = 'Siti Nurhaliza'),
          '2026-12-31', 'Terbuka');

-- Modul 08 · Induksi K3. Kartu ini adalah gerbang izin kerja (AB-11).
INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES ('IND-2026-0087', (SELECT id FROM t_pabrik), 'Rahmat Hidayat', (SELECT id FROM pengguna WHERE nama = 'Rahmat Hidayat'), 'Pekerja Baru', 'Produksi — Line 1',
          '2026-09-21', 'Fadli Saldi', 90, '2027-09-21', 'Berlaku');
INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES ('IND-2026-0086', (SELECT id FROM t_pabrik), 'Tim CV Teknik Jaya (6 orang)', (SELECT id FROM pengguna WHERE nama = 'Tim CV Teknik Jaya (6 orang)'), 'Kontraktor', 'Pengelasan pipa uap',
          '2026-09-20', 'Rina Wulandari', 85, '2027-03-20', 'Berlaku');
INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES ('IND-2026-0085', (SELECT id FROM t_pabrik), 'Auditor TÜV Rheinland (2 orang)', (SELECT id FROM pengguna WHERE nama = 'Auditor TÜV Rheinland (2 orang)'), 'Tamu', 'Surveillance ISO 45001',
          '2026-09-18', 'Fadli Saldi', 100, '2026-12-18', 'Berlaku');
INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES ('IND-2026-0084', (SELECT id FROM t_pabrik), 'Lilis Suryani', (SELECT id FROM pengguna WHERE nama = 'Lilis Suryani'), 'Pekerja Baru', 'QHSE — Semarang',
          '2026-09-15', 'Siti Nurhaliza', 95, '2027-09-15', 'Berlaku');
INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES ('IND-2026-0079', (SELECT id FROM t_pabrik), 'Tim PT Sinar Cleaning (4 orang)', (SELECT id FROM pengguna WHERE nama = 'Tim PT Sinar Cleaning (4 orang)'), 'Kontraktor', 'Pembersihan tangki',
          '2026-04-02', 'Rina Wulandari', 80, '2026-10-02', 'Segera Berakhir');
INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES ('IND-2026-0071', (SELECT id FROM t_pabrik), 'Tim CV Mitra Listrik (3 orang)', (SELECT id FROM pengguna WHERE nama = 'Tim CV Mitra Listrik (3 orang)'), 'Kontraktor', 'Pemeliharaan panel',
          '2026-03-10', 'Bambang Sutrisno', 85, '2026-09-10', 'Kedaluwarsa');
INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES ('IND-2026-0088', (SELECT id FROM t_pabrik), 'Hendra Gunawan', (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'), 'Pekerja Baru', 'Maintenance',
          '2026-09-22', 'Fadli Saldi', 70, NULL, 'Tidak Lulus');

-- Modul 10 · CAPA.
--
-- Hanya CAPA yang induknya benar-benar ada pada basis data yang dimuat.
-- 5 baris lain pada purwarupa bersumber dari inspeksi, audit, dan
-- lingkungan — modul yang tabelnya belum dibangun. Menunjuk induk yang tidak
-- ada berarti melanggar AB-01 lewat jalur impor, persis kebocoran yang
-- ditutup oleh penegakan dua lapis. Baris itu menyusul bersama modulnya:
-- CAPA-2026-0139 (AF-2026-018), CAPA-2026-0137 (INS-2026-0912), CAPA-2026-0136 (INS-2026-0912), CAPA-2026-0128 (ENV-2026-0033), CAPA-2026-0124 (AF-2026-019).
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0142', (SELECT id FROM t_pabrik), 'Revisi SOP pembuangan kondensat oven tunnel', 'Insiden',
          (SELECT id FROM insiden WHERE nomor = 'INC-2026-0318'), 'INC-2026-0318',
          (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'), '2026-09-18', '2026-10-02', 'Tinggi', 'Dalam Proses',
          NULL,
          NULL,
          NULL);
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0141', (SELECT id FROM t_pabrik), 'Program pemeriksaan kondisi kemasan limbah B3 sebelum disimpan', 'Insiden',
          (SELECT id FROM insiden WHERE nomor = 'INC-2026-0313'), 'INC-2026-0313',
          (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), '2026-09-04', '2026-09-25', 'Tinggi', 'Dalam Proses',
          NULL,
          NULL,
          NULL);
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0140', (SELECT id FROM t_pabrik), 'Penambahan penerangan lorong rak C gudang bahan baku', 'Insiden',
          (SELECT id FROM insiden WHERE nomor = 'INC-2026-0317'), 'INC-2026-0317',
          (SELECT id FROM pengguna WHERE nama = 'Rahmat Hidayat'), '2026-09-16', '2026-09-30', 'Sedang', 'Menunggu Verifikasi',
          NULL,
          NULL,
          NULL);
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0138', (SELECT id FROM t_pabrik), 'Pemasangan cermin cembung & marka pejalan kaki persimpangan B2', 'Insiden',
          (SELECT id FROM insiden WHERE nomor = 'INC-2026-0316'), 'INC-2026-0316',
          (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'), '2026-09-15', '2026-09-29', 'Tinggi', 'Selesai',
          'Foto pemasangan dan berita acara serah terima, 29 Sep 2026',
          (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-29'::timestamptz);
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0135', (SELECT id FROM t_pabrik), 'Menambahkan pembersihan sensor ke checklist harian packing', 'Insiden',
          (SELECT id FROM insiden WHERE nomor = 'INC-2026-0314'), 'INC-2026-0314',
          (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'), '2026-09-08', '2026-09-22', 'Rendah', 'Menunggu Verifikasi',
          NULL,
          NULL,
          NULL);

-- Pencacah disetel melewati nomor tertinggi yang terpakai; tanpa ini
-- catatan pertama yang dibuat lewat API akan menabrak nomor data contoh.
INSERT INTO pencacah_nomor (awalan, tahun, nilai)
SELECT awalan, tahun, nilai FROM (VALUES
  ('INC', 2026, 318),
  ('HZ',  2026, 451),
  ('WP',  2026, 914),
  ('JSA', 2026, 12),
  ('HRD', 0,    12),
  ('IND', 2026, 88),
  ('APD', 2026, 142),
  ('OBS', 2026, 612),
  ('CAPA',2026, 142)
) AS v(awalan, tahun, nilai)
ON CONFLICT (awalan, tahun) DO UPDATE SET nilai = greatest(pencacah_nomor.nilai, EXCLUDED.nilai);

COMMIT;
