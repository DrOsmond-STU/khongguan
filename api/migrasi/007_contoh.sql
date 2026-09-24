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
          NULL, 14, 0, 'Seluruh perilaku teramati aman. Operator forklift berhenti penuh di setiap persimpangan.', 'Apresiasi disampaikan di safety talk pagi berikutnya.');
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

-- Modul 02 · Inspeksi. Jumlah butir, butir selesai, dan temuan tidak
-- disimpan; ketiganya dihitung dari inspeksi_butir. Butir contoh dibangkitkan
-- sebanyak angka pada purwarupa, dengan jumlah "Tidak Sesuai" yang sama.
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0912', (SELECT id FROM t_pabrik), 'APAR & Hydrant', 'Seluruh area produksi', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-19', 'Bulanan', 'Selesai');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 1, 'APAR & Hydrant — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 2, 'APAR & Hydrant — butir 2', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 3, 'APAR & Hydrant — butir 3', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 4, 'APAR & Hydrant — butir 4', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 5, 'APAR & Hydrant — butir 5', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 6, 'APAR & Hydrant — butir 6', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 7, 'APAR & Hydrant — butir 7', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 8, 'APAR & Hydrant — butir 8', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 9, 'APAR & Hydrant — butir 9', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 10, 'APAR & Hydrant — butir 10', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 11, 'APAR & Hydrant — butir 11', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 12, 'APAR & Hydrant — butir 12', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 13, 'APAR & Hydrant — butir 13', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 14, 'APAR & Hydrant — butir 14', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 15, 'APAR & Hydrant — butir 15', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 16, 'APAR & Hydrant — butir 16', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 17, 'APAR & Hydrant — butir 17', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 18, 'APAR & Hydrant — butir 18', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 19, 'APAR & Hydrant — butir 19', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 20, 'APAR & Hydrant — butir 20', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 21, 'APAR & Hydrant — butir 21', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 22, 'APAR & Hydrant — butir 22', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 23, 'APAR & Hydrant — butir 23', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 24, 'APAR & Hydrant — butir 24', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 25, 'APAR & Hydrant — butir 25', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 26, 'APAR & Hydrant — butir 26', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 27, 'APAR & Hydrant — butir 27', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 28, 'APAR & Hydrant — butir 28', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 29, 'APAR & Hydrant — butir 29', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 30, 'APAR & Hydrant — butir 30', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 31, 'APAR & Hydrant — butir 31', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 32, 'APAR & Hydrant — butir 32', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 33, 'APAR & Hydrant — butir 33', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 34, 'APAR & Hydrant — butir 34', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 35, 'APAR & Hydrant — butir 35', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 36, 'APAR & Hydrant — butir 36', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 37, 'APAR & Hydrant — butir 37', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 38, 'APAR & Hydrant — butir 38', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 39, 'APAR & Hydrant — butir 39', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 40, 'APAR & Hydrant — butir 40', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 41, 'APAR & Hydrant — butir 41', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 42, 'APAR & Hydrant — butir 42', 'Sesuai');
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0911', (SELECT id FROM t_pabrik), 'Forklift & Alat Angkat', 'Gudang & Logistik', (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'),
          '2026-09-18', 'Bulanan', 'Selesai');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 1, 'Forklift & Alat Angkat — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 2, 'Forklift & Alat Angkat — butir 2', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 3, 'Forklift & Alat Angkat — butir 3', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 4, 'Forklift & Alat Angkat — butir 4', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 5, 'Forklift & Alat Angkat — butir 5', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 6, 'Forklift & Alat Angkat — butir 6', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 7, 'Forklift & Alat Angkat — butir 7', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 8, 'Forklift & Alat Angkat — butir 8', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 9, 'Forklift & Alat Angkat — butir 9', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 10, 'Forklift & Alat Angkat — butir 10', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 11, 'Forklift & Alat Angkat — butir 11', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 12, 'Forklift & Alat Angkat — butir 12', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 13, 'Forklift & Alat Angkat — butir 13', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 14, 'Forklift & Alat Angkat — butir 14', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 15, 'Forklift & Alat Angkat — butir 15', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 16, 'Forklift & Alat Angkat — butir 16', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 17, 'Forklift & Alat Angkat — butir 17', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 18, 'Forklift & Alat Angkat — butir 18', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 19, 'Forklift & Alat Angkat — butir 19', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 20, 'Forklift & Alat Angkat — butir 20', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 21, 'Forklift & Alat Angkat — butir 21', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 22, 'Forklift & Alat Angkat — butir 22', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 23, 'Forklift & Alat Angkat — butir 23', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 24, 'Forklift & Alat Angkat — butir 24', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 25, 'Forklift & Alat Angkat — butir 25', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 26, 'Forklift & Alat Angkat — butir 26', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 27, 'Forklift & Alat Angkat — butir 27', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0911'), 28, 'Forklift & Alat Angkat — butir 28', 'Sesuai');
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0913', (SELECT id FROM t_pabrik), 'Panel Listrik', 'Line 1 – Line 4', (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'),
          '2026-09-20', 'Bulanan', 'Dalam Proses');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 1, 'Panel Listrik — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 2, 'Panel Listrik — butir 2', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 3, 'Panel Listrik — butir 3', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 4, 'Panel Listrik — butir 4', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 5, 'Panel Listrik — butir 5', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 6, 'Panel Listrik — butir 6', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 7, 'Panel Listrik — butir 7', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 8, 'Panel Listrik — butir 8', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 9, 'Panel Listrik — butir 9', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 10, 'Panel Listrik — butir 10', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 11, 'Panel Listrik — butir 11', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 12, 'Panel Listrik — butir 12', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 13, 'Panel Listrik — butir 13', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 14, 'Panel Listrik — butir 14', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 15, 'Panel Listrik — butir 15', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 16, 'Panel Listrik — butir 16', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 17, 'Panel Listrik — butir 17', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 18, 'Panel Listrik — butir 18', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 19, 'Panel Listrik — butir 19', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 20, 'Panel Listrik — butir 20', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 21, 'Panel Listrik — butir 21', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 22, 'Panel Listrik — butir 22', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 23, 'Panel Listrik — butir 23', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 24, 'Panel Listrik — butir 24', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 25, 'Panel Listrik — butir 25', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 26, 'Panel Listrik — butir 26', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 27, 'Panel Listrik — butir 27', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 28, 'Panel Listrik — butir 28', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 29, 'Panel Listrik — butir 29', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 30, 'Panel Listrik — butir 30', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 31, 'Panel Listrik — butir 31', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 32, 'Panel Listrik — butir 32', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 33, 'Panel Listrik — butir 33', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 34, 'Panel Listrik — butir 34', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 35, 'Panel Listrik — butir 35', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0913'), 36, 'Panel Listrik — butir 36', NULL);
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0914', (SELECT id FROM t_pabrik), 'Higiene & Sanitasi Produksi', 'Line 2 — Moulding', (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'),
          '2026-09-21', 'Mingguan', 'Terbuka');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 1, 'Higiene & Sanitasi Produksi — butir 1', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 2, 'Higiene & Sanitasi Produksi — butir 2', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 3, 'Higiene & Sanitasi Produksi — butir 3', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 4, 'Higiene & Sanitasi Produksi — butir 4', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 5, 'Higiene & Sanitasi Produksi — butir 5', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 6, 'Higiene & Sanitasi Produksi — butir 6', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 7, 'Higiene & Sanitasi Produksi — butir 7', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 8, 'Higiene & Sanitasi Produksi — butir 8', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 9, 'Higiene & Sanitasi Produksi — butir 9', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 10, 'Higiene & Sanitasi Produksi — butir 10', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 11, 'Higiene & Sanitasi Produksi — butir 11', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 12, 'Higiene & Sanitasi Produksi — butir 12', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 13, 'Higiene & Sanitasi Produksi — butir 13', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 14, 'Higiene & Sanitasi Produksi — butir 14', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 15, 'Higiene & Sanitasi Produksi — butir 15', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 16, 'Higiene & Sanitasi Produksi — butir 16', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 17, 'Higiene & Sanitasi Produksi — butir 17', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 18, 'Higiene & Sanitasi Produksi — butir 18', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 19, 'Higiene & Sanitasi Produksi — butir 19', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 20, 'Higiene & Sanitasi Produksi — butir 20', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 21, 'Higiene & Sanitasi Produksi — butir 21', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 22, 'Higiene & Sanitasi Produksi — butir 22', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 23, 'Higiene & Sanitasi Produksi — butir 23', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 24, 'Higiene & Sanitasi Produksi — butir 24', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 25, 'Higiene & Sanitasi Produksi — butir 25', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 26, 'Higiene & Sanitasi Produksi — butir 26', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 27, 'Higiene & Sanitasi Produksi — butir 27', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 28, 'Higiene & Sanitasi Produksi — butir 28', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 29, 'Higiene & Sanitasi Produksi — butir 29', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 30, 'Higiene & Sanitasi Produksi — butir 30', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 31, 'Higiene & Sanitasi Produksi — butir 31', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 32, 'Higiene & Sanitasi Produksi — butir 32', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 33, 'Higiene & Sanitasi Produksi — butir 33', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 34, 'Higiene & Sanitasi Produksi — butir 34', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 35, 'Higiene & Sanitasi Produksi — butir 35', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 36, 'Higiene & Sanitasi Produksi — butir 36', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 37, 'Higiene & Sanitasi Produksi — butir 37', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 38, 'Higiene & Sanitasi Produksi — butir 38', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 39, 'Higiene & Sanitasi Produksi — butir 39', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 40, 'Higiene & Sanitasi Produksi — butir 40', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 41, 'Higiene & Sanitasi Produksi — butir 41', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 42, 'Higiene & Sanitasi Produksi — butir 42', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 43, 'Higiene & Sanitasi Produksi — butir 43', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 44, 'Higiene & Sanitasi Produksi — butir 44', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 45, 'Higiene & Sanitasi Produksi — butir 45', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 46, 'Higiene & Sanitasi Produksi — butir 46', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 47, 'Higiene & Sanitasi Produksi — butir 47', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 48, 'Higiene & Sanitasi Produksi — butir 48', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 49, 'Higiene & Sanitasi Produksi — butir 49', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 50, 'Higiene & Sanitasi Produksi — butir 50', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 51, 'Higiene & Sanitasi Produksi — butir 51', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 52, 'Higiene & Sanitasi Produksi — butir 52', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 53, 'Higiene & Sanitasi Produksi — butir 53', NULL),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0914'), 54, 'Higiene & Sanitasi Produksi — butir 54', NULL);
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0910', (SELECT id FROM t_pabrik), 'Jalur Evakuasi', 'Seluruh pabrik', (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'),
          '2026-09-15', 'Bulanan', 'Selesai');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 1, 'Jalur Evakuasi — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 2, 'Jalur Evakuasi — butir 2', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 3, 'Jalur Evakuasi — butir 3', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 4, 'Jalur Evakuasi — butir 4', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 5, 'Jalur Evakuasi — butir 5', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 6, 'Jalur Evakuasi — butir 6', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 7, 'Jalur Evakuasi — butir 7', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 8, 'Jalur Evakuasi — butir 8', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 9, 'Jalur Evakuasi — butir 9', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 10, 'Jalur Evakuasi — butir 10', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 11, 'Jalur Evakuasi — butir 11', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 12, 'Jalur Evakuasi — butir 12', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 13, 'Jalur Evakuasi — butir 13', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 14, 'Jalur Evakuasi — butir 14', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 15, 'Jalur Evakuasi — butir 15', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 16, 'Jalur Evakuasi — butir 16', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 17, 'Jalur Evakuasi — butir 17', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 18, 'Jalur Evakuasi — butir 18', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 19, 'Jalur Evakuasi — butir 19', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 20, 'Jalur Evakuasi — butir 20', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 21, 'Jalur Evakuasi — butir 21', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 22, 'Jalur Evakuasi — butir 22', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 23, 'Jalur Evakuasi — butir 23', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0910'), 24, 'Jalur Evakuasi — butir 24', 'Sesuai');
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0909', (SELECT id FROM t_pabrik), 'Boiler', 'Ruang Boiler', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'),
          '2026-09-12', 'Mingguan', 'Selesai');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 1, 'Boiler — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 2, 'Boiler — butir 2', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 3, 'Boiler — butir 3', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 4, 'Boiler — butir 4', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 5, 'Boiler — butir 5', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 6, 'Boiler — butir 6', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 7, 'Boiler — butir 7', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 8, 'Boiler — butir 8', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 9, 'Boiler — butir 9', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 10, 'Boiler — butir 10', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 11, 'Boiler — butir 11', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 12, 'Boiler — butir 12', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 13, 'Boiler — butir 13', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 14, 'Boiler — butir 14', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 15, 'Boiler — butir 15', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 16, 'Boiler — butir 16', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 17, 'Boiler — butir 17', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 18, 'Boiler — butir 18', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 19, 'Boiler — butir 19', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 20, 'Boiler — butir 20', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 21, 'Boiler — butir 21', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 22, 'Boiler — butir 22', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 23, 'Boiler — butir 23', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 24, 'Boiler — butir 24', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 25, 'Boiler — butir 25', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 26, 'Boiler — butir 26', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 27, 'Boiler — butir 27', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 28, 'Boiler — butir 28', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 29, 'Boiler — butir 29', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 30, 'Boiler — butir 30', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0909'), 31, 'Boiler — butir 31', 'Sesuai');
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0908', (SELECT id FROM t_pabrik), 'IPAL', 'IPAL', (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'),
          '2026-09-10', 'Mingguan', 'Selesai');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 1, 'IPAL — butir 1', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 2, 'IPAL — butir 2', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 3, 'IPAL — butir 3', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 4, 'IPAL — butir 4', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 5, 'IPAL — butir 5', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 6, 'IPAL — butir 6', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 7, 'IPAL — butir 7', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 8, 'IPAL — butir 8', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 9, 'IPAL — butir 9', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 10, 'IPAL — butir 10', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 11, 'IPAL — butir 11', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 12, 'IPAL — butir 12', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 13, 'IPAL — butir 13', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 14, 'IPAL — butir 14', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 15, 'IPAL — butir 15', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 16, 'IPAL — butir 16', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 17, 'IPAL — butir 17', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 18, 'IPAL — butir 18', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0908'), 19, 'IPAL — butir 19', 'Sesuai');
INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES ('INS-2026-0907', (SELECT id FROM t_pabrik), 'P3K', 'Seluruh area', (SELECT id FROM pengguna WHERE nama = 'Siti Nurhaliza'),
          '2026-09-05', 'Bulanan', 'Selesai');
INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 1, 'P3K — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 2, 'P3K — butir 2', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 3, 'P3K — butir 3', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 4, 'P3K — butir 4', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 5, 'P3K — butir 5', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 6, 'P3K — butir 6', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 7, 'P3K — butir 7', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 8, 'P3K — butir 8', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 9, 'P3K — butir 9', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 10, 'P3K — butir 10', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 11, 'P3K — butir 11', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 12, 'P3K — butir 12', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 13, 'P3K — butir 13', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 14, 'P3K — butir 14', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 15, 'P3K — butir 15', 'Sesuai'),
  ((SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0907'), 16, 'P3K — butir 16', 'Sesuai');

-- Modul 05 · Safety Checklist. Unit yang diperiksa dibuat dari nama
-- checklist-nya; AB-08 mengunci unit begitu satu butir dijawab Tidak Sesuai,
-- dan penguncian itu dikerjakan pemicu basis data, bukan skrip ini.
INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
  VALUES ((SELECT id FROM t_pabrik), 'UNIT-FORKLIFT', 'Forklift', 'Kendaraan & alat angkat')
  ON CONFLICT (pabrik_id, kode) DO NOTHING;
INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift, pj_id,
                        tanggal, waktu, status)
  VALUES ('CHK-2026-1841', (SELECT id FROM t_pabrik), 'P2H Forklift', 'Setiap shift',
          NULL, 'Gudang & Logistik',
          (SELECT id FROM unit_periksa WHERE kode = 'UNIT-FORKLIFT' AND pabrik_id = (SELECT id FROM t_pabrik)),
          'Shift 1', (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'), '2026-09-24', '06:40', 'Selesai');
INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 1, 'P2H Forklift — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 2, 'P2H Forklift — butir 2', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 3, 'P2H Forklift — butir 3', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 4, 'P2H Forklift — butir 4', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 5, 'P2H Forklift — butir 5', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 6, 'P2H Forklift — butir 6', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 7, 'P2H Forklift — butir 7', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 8, 'P2H Forklift — butir 8', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 9, 'P2H Forklift — butir 9', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 10, 'P2H Forklift — butir 10', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 11, 'P2H Forklift — butir 11', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 12, 'P2H Forklift — butir 12', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 13, 'P2H Forklift — butir 13', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 14, 'P2H Forklift — butir 14', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 15, 'P2H Forklift — butir 15', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 16, 'P2H Forklift — butir 16', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 17, 'P2H Forklift — butir 17', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1841'), 18, 'P2H Forklift — butir 18', 'Sesuai');
INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
  VALUES ((SELECT id FROM t_pabrik), 'UNIT-PRA-NYALA-BOILER', 'Pra-nyala Boiler', 'Fasilitas')
  ON CONFLICT (pabrik_id, kode) DO NOTHING;
INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift, pj_id,
                        tanggal, waktu, status)
  VALUES ('CHK-2026-1842', (SELECT id FROM t_pabrik), 'Pra-nyala Boiler', 'Harian',
          (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Ruang Boiler'), 'Ruang Boiler',
          (SELECT id FROM unit_periksa WHERE kode = 'UNIT-PRA-NYALA-BOILER' AND pabrik_id = (SELECT id FROM t_pabrik)),
          'Shift 1', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), '2026-09-24', '05:20', 'Selesai');
INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 1, 'Pra-nyala Boiler — butir 1', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 2, 'Pra-nyala Boiler — butir 2', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 3, 'Pra-nyala Boiler — butir 3', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 4, 'Pra-nyala Boiler — butir 4', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 5, 'Pra-nyala Boiler — butir 5', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 6, 'Pra-nyala Boiler — butir 6', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 7, 'Pra-nyala Boiler — butir 7', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 8, 'Pra-nyala Boiler — butir 8', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 9, 'Pra-nyala Boiler — butir 9', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 10, 'Pra-nyala Boiler — butir 10', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 11, 'Pra-nyala Boiler — butir 11', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 12, 'Pra-nyala Boiler — butir 12', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 13, 'Pra-nyala Boiler — butir 13', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1842'), 14, 'Pra-nyala Boiler — butir 14', 'Sesuai');
INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
  VALUES ((SELECT id FROM t_pabrik), 'UNIT-KEPATUHAN-APD-LINI-P', 'Kepatuhan APD Lini Produksi', 'Fasilitas')
  ON CONFLICT (pabrik_id, kode) DO NOTHING;
INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift, pj_id,
                        tanggal, waktu, status)
  VALUES ('CHK-2026-1843', (SELECT id FROM t_pabrik), 'Kepatuhan APD Lini Produksi', 'Harian',
          NULL, 'Line 1 – Line 4',
          (SELECT id FROM unit_periksa WHERE kode = 'UNIT-KEPATUHAN-APD-LINI-P' AND pabrik_id = (SELECT id FROM t_pabrik)),
          'Shift 1', (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'), '2026-09-24', '07:05', 'Selesai');
INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 1, 'Kepatuhan APD Lini Produksi — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 2, 'Kepatuhan APD Lini Produksi — butir 2', 'Tidak Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 3, 'Kepatuhan APD Lini Produksi — butir 3', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 4, 'Kepatuhan APD Lini Produksi — butir 4', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 5, 'Kepatuhan APD Lini Produksi — butir 5', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 6, 'Kepatuhan APD Lini Produksi — butir 6', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 7, 'Kepatuhan APD Lini Produksi — butir 7', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 8, 'Kepatuhan APD Lini Produksi — butir 8', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 9, 'Kepatuhan APD Lini Produksi — butir 9', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 10, 'Kepatuhan APD Lini Produksi — butir 10', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 11, 'Kepatuhan APD Lini Produksi — butir 11', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1843'), 12, 'Kepatuhan APD Lini Produksi — butir 12', 'Sesuai');
INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
  VALUES ((SELECT id FROM t_pabrik), 'UNIT-KEBERSIHAN-KERAPIAN-', 'Kebersihan & Kerapian Area (5R)', 'Fasilitas')
  ON CONFLICT (pabrik_id, kode) DO NOTHING;
INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift, pj_id,
                        tanggal, waktu, status)
  VALUES ('CHK-2026-1844', (SELECT id FROM t_pabrik), 'Kebersihan & Kerapian Area (5R)', 'Harian',
          NULL, 'Seluruh area produksi',
          (SELECT id FROM unit_periksa WHERE kode = 'UNIT-KEBERSIHAN-KERAPIAN-' AND pabrik_id = (SELECT id FROM t_pabrik)),
          'Shift 1', (SELECT id FROM pengguna WHERE nama = 'Siti Nurhaliza'), '2026-09-24', '08:15', 'Dalam Proses');
INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 1, 'Kebersihan & Kerapian Area (5R) — butir 1', 'Tidak Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 2, 'Kebersihan & Kerapian Area (5R) — butir 2', 'Tidak Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 3, 'Kebersihan & Kerapian Area (5R) — butir 3', 'Tidak Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 4, 'Kebersihan & Kerapian Area (5R) — butir 4', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 5, 'Kebersihan & Kerapian Area (5R) — butir 5', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 6, 'Kebersihan & Kerapian Area (5R) — butir 6', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 7, 'Kebersihan & Kerapian Area (5R) — butir 7', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 8, 'Kebersihan & Kerapian Area (5R) — butir 8', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 9, 'Kebersihan & Kerapian Area (5R) — butir 9', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 10, 'Kebersihan & Kerapian Area (5R) — butir 10', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 11, 'Kebersihan & Kerapian Area (5R) — butir 11', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 12, 'Kebersihan & Kerapian Area (5R) — butir 12', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 13, 'Kebersihan & Kerapian Area (5R) — butir 13', 'Sesuai'),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 14, 'Kebersihan & Kerapian Area (5R) — butir 14', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 15, 'Kebersihan & Kerapian Area (5R) — butir 15', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 16, 'Kebersihan & Kerapian Area (5R) — butir 16', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 17, 'Kebersihan & Kerapian Area (5R) — butir 17', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 18, 'Kebersihan & Kerapian Area (5R) — butir 18', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 19, 'Kebersihan & Kerapian Area (5R) — butir 19', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1844'), 20, 'Kebersihan & Kerapian Area (5R) — butir 20', NULL);
INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
  VALUES ((SELECT id FROM t_pabrik), 'UNIT-RUANG-PANEL-GENSET', 'Ruang Panel & Genset', 'Fasilitas')
  ON CONFLICT (pabrik_id, kode) DO NOTHING;
INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift, pj_id,
                        tanggal, waktu, status)
  VALUES ('CHK-2026-1845', (SELECT id FROM t_pabrik), 'Ruang Panel & Genset', 'Harian',
          NULL, 'Ruang Panel Utama',
          (SELECT id FROM unit_periksa WHERE kode = 'UNIT-RUANG-PANEL-GENSET' AND pabrik_id = (SELECT id FROM t_pabrik)),
          'Shift 1', (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'), '2026-09-24', NULL, 'Terbuka');
INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 1, 'Ruang Panel & Genset — butir 1', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 2, 'Ruang Panel & Genset — butir 2', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 3, 'Ruang Panel & Genset — butir 3', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 4, 'Ruang Panel & Genset — butir 4', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 5, 'Ruang Panel & Genset — butir 5', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 6, 'Ruang Panel & Genset — butir 6', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 7, 'Ruang Panel & Genset — butir 7', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 8, 'Ruang Panel & Genset — butir 8', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 9, 'Ruang Panel & Genset — butir 9', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1845'), 10, 'Ruang Panel & Genset — butir 10', NULL);
INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift, pj_id,
                        tanggal, waktu, status)
  VALUES ('CHK-2026-1846', (SELECT id FROM t_pabrik), 'P2H Forklift', 'Setiap shift',
          NULL, 'Gudang & Logistik',
          (SELECT id FROM unit_periksa WHERE kode = 'UNIT-FORKLIFT' AND pabrik_id = (SELECT id FROM t_pabrik)),
          'Shift 2', (SELECT id FROM pengguna WHERE nama = 'Rahmat Hidayat'), '2026-09-24', NULL, 'Terbuka');
INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab) VALUES
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 1, 'P2H Forklift — butir 1', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 2, 'P2H Forklift — butir 2', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 3, 'P2H Forklift — butir 3', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 4, 'P2H Forklift — butir 4', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 5, 'P2H Forklift — butir 5', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 6, 'P2H Forklift — butir 6', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 7, 'P2H Forklift — butir 7', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 8, 'P2H Forklift — butir 8', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 9, 'P2H Forklift — butir 9', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 10, 'P2H Forklift — butir 10', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 11, 'P2H Forklift — butir 11', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 12, 'P2H Forklift — butir 12', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 13, 'P2H Forklift — butir 13', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 14, 'P2H Forklift — butir 14', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 15, 'P2H Forklift — butir 15', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 16, 'P2H Forklift — butir 16', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 17, 'P2H Forklift — butir 17', NULL),
  ((SELECT id FROM checklist WHERE nomor = 'CHK-2026-1846'), 18, 'P2H Forklift — butir 18', NULL);

-- Modul 09 · Audit dan temuannya. Kolom selesai adalah tanggal akhir
-- pelaksanaan, termasuk bagi audit yang baru terjadwal; yang menandai
-- penutupan adalah ditutup_pada, bukan tanggal itu.
INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai, selesai, status, ditutup_pada)
  VALUES ('AUD-2026-004', (SELECT id FROM t_pabrik), 'ISO 45001:2018', 'Surveillance tahun ke-2 — seluruh pabrik', 'TÜV (eksternal)',
          '2026-10-12', '2026-10-14', 'Terbuka',
          NULL);
INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai, selesai, status, ditutup_pada)
  VALUES ('AUD-2026-003', (SELECT id FROM t_pabrik), 'SMK3 PP 50/2012', 'Audit internal 12 elemen', 'Tim Internal QHSE',
          '2026-09-02', '2026-09-05', 'Dalam Proses',
          NULL);
INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai, selesai, status, ditutup_pada)
  VALUES ('AUD-2026-002', (SELECT id FROM t_pabrik), 'ISO 14001:2015', 'Audit internal — aspek & dampak lingkungan', 'Tim Internal QHSE',
          '2026-07-15', '2026-07-17', 'Selesai',
          '2026-07-17'::timestamptz);
INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai, selesai, status, ditutup_pada)
  VALUES ('AUD-2026-001', (SELECT id FROM t_pabrik), 'ISO 45001:2018', 'Audit internal — K3 produksi & gudang', 'Tim Internal QHSE',
          '2026-04-08', '2026-04-10', 'Selesai',
          '2026-04-10'::timestamptz);
INSERT INTO temuan_audit (nomor, audit_id, klausul, kategori, isi, pj_id, tenggat, status)
  VALUES ('AF-2026-018', (SELECT id FROM audit WHERE nomor = 'AUD-2026-003'), 'Elemen 6.5 — Pelayanan',
          'Major', 'Sertifikat kelayakan operasi boiler 2 telah melewati masa berlaku sejak 30 Jun 2026.', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), '2026-09-30', 'Dalam Proses');
INSERT INTO temuan_audit (nomor, audit_id, klausul, kategori, isi, pj_id, tenggat, status)
  VALUES ('AF-2026-019', (SELECT id FROM audit WHERE nomor = 'AUD-2026-003'), 'Elemen 9.1 — Pelaporan',
          'Minor', 'Laporan P2K3 triwulan II belum dikirimkan ke Disnaker setempat.', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), '2026-09-28', 'Dalam Proses');
INSERT INTO temuan_audit (nomor, audit_id, klausul, kategori, isi, pj_id, tenggat, status)
  VALUES ('AF-2026-020', (SELECT id FROM audit WHERE nomor = 'AUD-2026-003'), 'Elemen 4.1 — Kebijakan K3',
          'Minor', 'Kebijakan K3 belum ditinjau ulang setelah perubahan struktur organisasi Mei 2026.', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), '2026-10-15', 'Terbuka');
INSERT INTO temuan_audit (nomor, audit_id, klausul, kategori, isi, pj_id, tenggat, status)
  VALUES ('AF-2026-021', (SELECT id FROM audit WHERE nomor = 'AUD-2026-003'), 'Elemen 12.3 — Pelatihan',
          'Observasi', 'Matriks pelatihan K3 tidak mencantumkan pekerja kontrak harian.', (SELECT id FROM pengguna WHERE nama = 'Siti Nurhaliza'), '2026-10-31', 'Terbuka');

-- Modul 11 · Manajemen Risiko. Matriks yang sama dengan JSA dan HIRADC (AB-14).
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-001', (SELECT id FROM t_pabrik), 'Utilitas — Boiler', 'Ledakan pesawat uap akibat katup pengaman gagal', 'Dudukan katup pengaman aus, uji berkala terlewat', 'Korban jiwa, pabrik berhenti total',
          2, 5, 1, 5, 'Kurangi', 'Uji katup pengaman tiap 3 bulan oleh PJK3, penggantian katup boiler 2, sertifikasi ulang kelayakan operasi', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'),
          '2026-10-30', '2026-10-01', 'Dalam Proses');
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-002', (SELECT id FROM t_pabrik), 'Logistik — Forklift', 'Tabrakan forklift dengan pejalan kaki', 'Jalur pejalan kaki tidak terpisah, titik buta di persimpangan', 'Cedera berat sampai fatal',
          4, 4, 2, 4, 'Kurangi', 'Marka jalur pejalan kaki terpisah, cermin cembung di 6 persimpangan, pembatas kecepatan 8 km/jam, blue spot light', (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'),
          '2026-11-15', '2026-10-05', 'Dalam Proses');
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-003', (SELECT id FROM t_pabrik), 'Produksi — Oven', 'Luka bakar uap dan permukaan panas', 'Prosedur pembuangan kondensat tidak lengkap, pekerja baru', 'Cedera hilang waktu kerja',
          3, 3, 2, 2, 'Kurangi', 'Revisi SOP dengan waktu tunggu penurunan tekanan, isolasi permukaan panas, APD lengan tahan panas', (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'),
          '2026-10-02', '2026-10-10', 'Dalam Proses');
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-004', (SELECT id FROM t_pabrik), 'Lingkungan — IPAL', 'Air limbah melewati baku mutu terbuang ke badan air', 'Beban minyak dan lemak dari pencucian tangki tidak terjadwal', 'Sanksi administratif, pencemaran, publikasi negatif',
          3, 4, 2, 3, 'Kurangi', 'Grease trap tambahan di jalur pencucian, penjadwalan pencucian tangki, uji harian minyak dan lemak', (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'),
          '2026-10-20', '2026-09-28', 'Dalam Proses');
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-005', (SELECT id FROM t_pabrik), 'Gudang — Penyimpanan', 'Kebakaran gudang barang jadi', 'Beban api tinggi dari karton, instalasi listrik lama', 'Kerugian material besar, henti produksi',
          2, 5, 1, 4, 'Transfer', 'Sprinkler otomatis, thermografi panel tahunan, asuransi properti dan gangguan usaha', (SELECT id FROM pengguna WHERE nama = 'Rahmat Hidayat'),
          '2026-12-31', '2026-10-15', 'Terbuka');
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-006', (SELECT id FROM t_pabrik), 'Kontraktor — Pekerjaan berisiko tinggi', 'Kecelakaan pekerja vendor di dalam area pabrik', 'Induksi K3 tidak konsisten, pengawasan tidak melekat', 'Cedera, tuntutan hukum, henti pekerjaan',
          3, 4, 2, 3, 'Kurangi', 'Induksi K3 wajib sebelum izin terbit, verifikasi asuransi tenaga kerja, pengawas melekat untuk pekerjaan panas dan ruang terbatas', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-30', '2026-09-30', 'Dalam Proses');
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-007', (SELECT id FROM t_pabrik), 'Produksi — Higiene', 'Kontaminasi benda asing pada produk', 'Serpihan logam dari ayakan aus, kebijakan benda longgar belum ketat', 'Penarikan produk, kerugian reputasi',
          2, 4, 1, 4, 'Kurangi', 'Metal detector di ujung lini, pemeriksaan ayakan mingguan, kebijakan benda longgar dan perhiasan', (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'),
          '2026-10-10', '2026-10-12', 'Dalam Proses');
INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES ('RSK-2026-008', (SELECT id FROM t_pabrik), 'Ergonomi — Packing', 'Gangguan otot rangka akibat gerakan berulang', 'Postur berdiri statis 8 jam, tinggi meja tidak dapat disetel', 'Absensi meningkat, keluhan kronis',
          4, 2, 2, 2, 'Kurangi', 'Meja dapat disetel, rotasi tugas tiap 2 jam, senam peregangan sebelum shift', (SELECT id FROM pengguna WHERE nama = 'Siti Nurhaliza'),
          '2026-11-25', '2026-10-20', 'Terbuka');

-- Modul 12 · Lingkungan. Lulus atau tidak disimpan per parameter, bukan
-- dihitung dari teks ambangnya.
INSERT INTO pemantauan_lingkungan (pabrik_id, kode, judul, sub, acuan, periode)
  VALUES ((SELECT id FROM t_pabrik), 'pppa', 'PPPA — Pengendalian Pencemaran Air', 'Uji outlet IPAL · 15 Sep 2026 · Lab terakreditasi KAN', 'Permen LHK 5/2014 Lampiran — Industri Makanan', date_trunc('month', current_date)::date);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppa'
            AND periode = date_trunc('month', current_date)::date),
          1, 'pH', '7,2', '', '6,0 – 9,0', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppa'
            AND periode = date_trunc('month', current_date)::date),
          2, 'BOD', '38', 'mg/L', '≤ 50', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppa'
            AND periode = date_trunc('month', current_date)::date),
          3, 'COD', '92', 'mg/L', '≤ 100', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppa'
            AND periode = date_trunc('month', current_date)::date),
          4, 'TSS', '46', 'mg/L', '≤ 50', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppa'
            AND periode = date_trunc('month', current_date)::date),
          5, 'Minyak & Lemak', '14', 'mg/L', '≤ 10', false);
INSERT INTO pemantauan_lingkungan (pabrik_id, kode, judul, sub, acuan, periode)
  VALUES ((SELECT id FROM t_pabrik), 'pppu', 'PPPU — Pengendalian Pencemaran Udara', 'Emisi cerobong boiler 2 · 08 Sep 2026', 'Permen LHK 11/2021 — Ketel uap berbahan bakar gas', date_trunc('month', current_date)::date);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppu'
            AND periode = date_trunc('month', current_date)::date),
          1, 'Partikulat', '42', 'mg/Nm³', '≤ 120', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppu'
            AND periode = date_trunc('month', current_date)::date),
          2, 'SO₂', '128', 'mg/Nm³', '≤ 600', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppu'
            AND periode = date_trunc('month', current_date)::date),
          3, 'NO₂', '312', 'mg/Nm³', '≤ 400', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'pppu'
            AND periode = date_trunc('month', current_date)::date),
          4, 'Opasitas', '12', '%', '≤ 20', true);
INSERT INTO pemantauan_lingkungan (pabrik_id, kode, judul, sub, acuan, periode)
  VALUES ((SELECT id FROM t_pabrik), 'limbah', 'Waste Management', 'Neraca limbah non-B3 · September 2026', 'Timbulan per ton produk: 4,2 kg', date_trunc('month', current_date)::date);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'limbah'
            AND periode = date_trunc('month', current_date)::date),
          1, 'Karton & kertas', '8.420', 'kg', 'daur ulang 96%', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'limbah'
            AND periode = date_trunc('month', current_date)::date),
          2, 'Plastik kemasan', '3.180', 'kg', 'daur ulang 88%', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'limbah'
            AND periode = date_trunc('month', current_date)::date),
          3, 'Sisa adonan & remah', '5.640', 'kg', 'pakan ternak 100%', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'limbah'
            AND periode = date_trunc('month', current_date)::date),
          4, 'Sampah umum ke TPA', '1.240', 'kg', 'target ≤ 1.500', true);
INSERT INTO pemantauan_lingkungan (pabrik_id, kode, judul, sub, acuan, periode)
  VALUES ((SELECT id FROM t_pabrik), 'plb3', 'PLB3 — Limbah Bahan Berbahaya & Beracun', 'TPS B3 · izin berlaku s.d. 14 Mar 2027', 'Masa simpan maksimal 90 hari sejak limbah masuk TPS', date_trunc('month', current_date)::date);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'plb3'
            AND periode = date_trunc('month', current_date)::date),
          1, 'Oli bekas (B105d)', '860', 'kg', 'sisa 12 hari', false);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'plb3'
            AND periode = date_trunc('month', current_date)::date),
          2, 'Majun terkontaminasi (B110d)', '145', 'kg', 'sisa 41 hari', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'plb3'
            AND periode = date_trunc('month', current_date)::date),
          3, 'Lampu TL bekas (B107d)', '38', 'kg', 'sisa 63 hari', true);
INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = (SELECT id FROM t_pabrik) AND kode = 'plb3'
            AND periode = date_trunc('month', current_date)::date),
          4, 'Kemasan bekas B3 (B104d)', '210', 'kg', 'sisa 28 hari', true);

-- Modul 13 · Dokumen internal. AB-20 menuntut tanggal tinjau bagi yang
-- berstatus Berlaku; dokumen tanpa tanggal tinjau tidak pernah ditinjau.
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGM-01', (SELECT id FROM t_pabrik), 1, 'Manual', 'Manual Sistem Manajemen QHSE Terpadu', 4,
          '2026-02-02', '2027-02-02', 'Management Representative', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGK-01', (SELECT id FROM t_pabrik), 1, 'Kebijakan', 'Kebijakan K3 dan Lingkungan', 3,
          '2025-01-14', '2026-01-14', 'Plant Manager', 'Kedaluwarsa');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGK-02', (SELECT id FROM t_pabrik), 1, 'Kebijakan', 'Kebijakan Hak Menghentikan Pekerjaan Tidak Aman', 1,
          '2026-03-10', '2027-03-10', 'Plant Manager', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGP-04', (SELECT id FROM t_pabrik), 2, 'Prosedur', 'Prosedur Identifikasi Bahaya, Penilaian & Pengendalian Risiko', 5,
          '2026-03-18', '2027-03-18', 'QHSE Supervisor', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGP-07', (SELECT id FROM t_pabrik), 2, 'Prosedur', 'Prosedur Pelaporan & Investigasi Insiden', 6,
          '2026-09-05', '2027-09-05', 'QHSE Supervisor', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGP-09', (SELECT id FROM t_pabrik), 2, 'Prosedur', 'Prosedur Izin Kerja Berisiko Tinggi', 3,
          '2026-04-22', '2027-04-22', 'QHSE Supervisor', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGP-12', (SELECT id FROM t_pabrik), 2, 'Prosedur', 'Prosedur Tanggap Darurat & Evakuasi', 4,
          '2026-06-30', '2027-06-30', 'Koordinator Tanggap Darurat', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGP-15', (SELECT id FROM t_pabrik), 2, 'Prosedur', 'Prosedur Pengelolaan Limbah B3', 2,
          '2026-05-11', '2027-05-11', 'Petugas Lingkungan', 'Dalam Revisi');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGI-22', (SELECT id FROM t_pabrik), 3, 'Instruksi Kerja', 'IK Pembuangan Kondensat Oven Tunnel', 2,
          '2026-09-20', '2027-09-20', 'Supervisor Produksi', 'Dalam Revisi');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGI-28', (SELECT id FROM t_pabrik), 3, 'Instruksi Kerja', 'IK Lockout–Tagout Panel Listrik', 3,
          '2026-07-08', '2027-07-08', 'Supervisor Maintenance', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGI-31', (SELECT id FROM t_pabrik), 3, 'Instruksi Kerja', 'IK Masuk Ruang Terbatas & Uji Gas', 1,
          '2026-08-15', '2027-08-15', 'QHSE Supervisor', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGF-05', (SELECT id FROM t_pabrik), 4, 'Formulir', 'Formulir JSEA & Izin Kerja', 3,
          '2026-04-22', '2027-04-22', 'QHSE Supervisor', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGF-11', (SELECT id FROM t_pabrik), 4, 'Formulir', 'Formulir Observasi Perilaku Aman', 2,
          '2026-02-03', '2027-02-03', 'QHSE Supervisor', 'Berlaku');
INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES ('KGF-18', (SELECT id FROM t_pabrik), 4, 'Formulir', 'Formulir P2H Forklift Harian', 4,
          '2026-01-19', '2027-01-19', 'Supervisor Logistik', 'Berlaku');

-- Modul 14 · Dokumen eksternal. Diurutkan menurut sisa masa berlaku saat
-- dibaca (AB-21), bukan menurut abjad.
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-001', (SELECT id FROM t_pabrik), 'Sertifikat Sistem', 'Sertifikat ISO 45001:2018', 'TÜV Rheinland', '01 121 2023 0045',
          '2023-10-20', '2026-10-19');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-002', (SELECT id FROM t_pabrik), 'Sertifikat Sistem', 'Sertifikat ISO 14001:2015', 'TÜV Rheinland', '01 104 2023 0046',
          '2023-10-20', '2026-10-19');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-003', (SELECT id FROM t_pabrik), 'Sertifikat Sistem', 'Sertifikat SMK3 PP 50/2012 — Tingkat Lanjutan', 'Kemnaker RI', 'SMK3/1284/2024',
          '2024-04-08', '2027-04-07');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-004', (SELECT id FROM t_pabrik), 'Izin Lingkungan', 'Persetujuan Teknis Pembuangan Air Limbah', 'DLH Kab. Bekasi', '660/312/DLH/2024',
          '2024-05-15', '2029-05-14');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-005', (SELECT id FROM t_pabrik), 'Izin Lingkungan', 'Izin Penyimpanan Sementara Limbah B3', 'DLH Kab. Bekasi', '660/118/TPS-B3/2022',
          '2022-03-15', '2027-03-14');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-006', (SELECT id FROM t_pabrik), 'Izin Peralatan', 'Surat Keterangan Layak Operasi Boiler 1', 'Disnaker Prov. Jabar', 'SKLO/PUBT/0891/2025',
          '2025-07-12', '2027-07-11');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-007', (SELECT id FROM t_pabrik), 'Izin Peralatan', 'Surat Keterangan Layak Operasi Boiler 2', 'Disnaker Prov. Jabar', 'SKLO/PUBT/0654/2024',
          '2024-07-01', '2026-06-30');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-008', (SELECT id FROM t_pabrik), 'Izin Peralatan', 'Riksa Uji Instalasi Penyalur Petir', 'PJK3 Sucofindo', 'RU/IPP/2024/0233',
          '2024-11-18', '2026-11-17');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-009', (SELECT id FROM t_pabrik), 'Izin Peralatan', 'Riksa Uji Instalasi Listrik & Thermografi', 'PJK3 Sucofindo', 'RU/LIS/2025/0117',
          '2025-02-24', '2027-02-23');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-010', (SELECT id FROM t_pabrik), 'Pelaporan Wajib', 'Laporan P2K3 Triwulan II 2026', 'Disnaker Kab. Bekasi', 'menunggu pengiriman',
          NULL, '2026-09-10');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-011', (SELECT id FROM t_pabrik), 'Pelaporan Wajib', 'Laporan Swapantau IPAL Triwulan III 2026', 'DLH Kab. Bekasi', 'dalam penyusunan',
          NULL, '2026-10-10');
INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES ('CMP-012', (SELECT id FROM t_pabrik), 'Pelaporan Wajib', 'Neraca Limbah B3 Triwulan III 2026', 'DLH Kab. Bekasi', 'dalam penyusunan',
          NULL, '2026-10-10');

-- Modul 17 · Regulasi K3. AB-22: baris tanpa bukti tidak dapat berstatus
-- Terpenuhi, apa pun yang tertulis pada kolom penerapan.
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-001', (SELECT id FROM t_pabrik), 'UU No. 1 Tahun 1970', 'Keselamatan Kerja', 'Pemerintah RI', 'K3 Umum',
          'Pasal 3, 9, 12, 14', 'Kewajiban syarat keselamatan kerja, induksi K3 wajib bagi setiap pekerja baru, hak pekerja menolak pekerjaan tidak aman.', 'Modul Induksi K3, KGK-02 Kebijakan Hak Menghentikan Pekerjaan', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-15', 'Terpenuhi');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-002', (SELECT id FROM t_pabrik), 'PP No. 50 Tahun 2012', 'Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja', 'Pemerintah RI', 'Sistem Manajemen',
          'Lampiran I dan II — 12 elemen, 166 kriteria', 'Penilaian SMK3 tingkat lanjutan, audit eksternal tiga tahunan, laporan P2K3 triwulanan.', 'Sertifikat SMK3 CMP-003, modul Audit elemen 1–12', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-15', 'Terpenuhi Sebagian');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-003', (SELECT id FROM t_pabrik), 'Permenaker No. 5 Tahun 2018', 'Keselamatan dan Kesehatan Kerja Lingkungan Kerja', 'Kemnaker RI', 'Lingkungan Kerja',
          'Pasal 5–8, 12, 22', 'Pengukuran iklim kerja, pencahayaan, kebisingan, dan getaran setiap tahun; nilai ambang batas per area.', 'Hasil uji lingkungan kerja 2026, temuan penerangan lorong rak C', (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'),
          '2026-09-10', 'Terpenuhi Sebagian');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-004', (SELECT id FROM t_pabrik), 'Permenaker No. 8 Tahun 2020', 'Keselamatan dan Kesehatan Kerja Pesawat Angkat dan Pesawat Angkut', 'Kemnaker RI', 'Pesawat Angkat Angkut',
          'Pasal 5, 140, 174', 'Riksa uji forklift berkala, operator berlisensi, pemeriksaan harian P2H sebelum operasi.', 'Sertifikat operator forklift, checklist P2H harian CHK-2026-1846', (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'),
          '2026-09-12', 'Terpenuhi');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-005', (SELECT id FROM t_pabrik), 'Permenaker No. 37 Tahun 2016', 'Keselamatan dan Kesehatan Kerja Bejana Tekanan dan Tangki Timbun', 'Kemnaker RI', 'Pesawat Uap & Bejana Tekan',
          'Pasal 4, 68, 73', 'Surat Keterangan Layak Operasi boiler, uji katup pengaman berkala, operator boiler bersertifikat.', 'SKLO Boiler 1 CMP-006; SKLO Boiler 2 kedaluwarsa sejak 30 Jun 2026', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'),
          '2026-09-20', 'Tidak Terpenuhi');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-006', (SELECT id FROM t_pabrik), 'Permenaker No. 12 Tahun 2015', 'Keselamatan dan Kesehatan Kerja Listrik di Tempat Kerja', 'Kemnaker RI', 'Listrik',
          'Pasal 6, 9, 10', 'Pemeriksaan instalasi listrik berkala, teknisi K3 listrik bersertifikat, penerapan LOTO.', 'Sertifikat Teknisi K3 Listrik (berakhir 08 Okt 2026), KGI-28 IK Lockout–Tagout', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-08', 'Terpenuhi Sebagian');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-007', (SELECT id FROM t_pabrik), 'Permenaker No. 9 Tahun 2016', 'Keselamatan dan Kesehatan Kerja dalam Pekerjaan pada Ketinggian', 'Kemnaker RI', 'Bekerja di Ketinggian',
          'Pasal 5, 9, 31', 'Izin kerja ketinggian, perancah bersertifikat, tenaga kerja bersertifikat TKPK.', 'Modul Work Permit jenis Ketinggian, JSA-2026-012', (SELECT id FROM pengguna WHERE nama = 'Rina Wulandari'),
          '2026-09-05', 'Terpenuhi');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-008', (SELECT id FROM t_pabrik), 'Permenaker No. 15 Tahun 2008', 'Pertolongan Pertama pada Kecelakaan di Tempat Kerja', 'Kemnaker RI', 'P3K',
          'Pasal 2, 3, 8, 9', 'Petugas P3K bersertifikat per shift, kotak P3K sesuai jumlah pekerja, pemeriksaan isi berkala.', 'Sertifikat petugas P3K, inspeksi kotak P3K bulanan', (SELECT id FROM pengguna WHERE nama = 'Siti Nurhaliza'),
          '2026-09-01', 'Terpenuhi');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-009', (SELECT id FROM t_pabrik), 'Permen LHK No. 5 Tahun 2014', 'Baku Mutu Air Limbah', 'KLHK RI', 'Lingkungan — Air',
          'Lampiran — Industri Makanan', 'Uji outlet IPAL bulanan oleh lab terakreditasi KAN, pelaporan triwulanan ke DLH.', 'Hasil uji 15 Sep 2026; minyak & lemak 14 mg/L melewati ambang 10 mg/L', (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'),
          '2026-09-15', 'Tidak Terpenuhi');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-010', (SELECT id FROM t_pabrik), 'PP No. 22 Tahun 2021', 'Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup', 'Pemerintah RI', 'Lingkungan — Umum',
          'Pasal 274, 285, 298', 'Persetujuan teknis pembuangan air limbah, izin TPS limbah B3, pelaporan kinerja lingkungan.', 'CMP-004 Persetujuan Teknis, CMP-005 Izin TPS B3', (SELECT id FROM pengguna WHERE nama = 'Yuni Astuti'),
          '2026-09-15', 'Terpenuhi');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-011', (SELECT id FROM t_pabrik), 'Permenaker No. 2 Tahun 1992', 'Tata Cara Penunjukan Kewajiban dan Wewenang Ahli K3', 'Kemnaker RI', 'Kelembagaan K3',
          'Pasal 2, 9', 'Ahli K3 Umum ditunjuk dan dilaporkan ke Disnaker, laporan kegiatan tiga bulanan.', 'SK Penunjukan Ahli K3 Umum; laporan P2K3 triwulan II terlambat 11 hari', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-10', 'Terpenuhi Sebagian');
INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES ('REG-012', (SELECT id FROM t_pabrik), 'Permenaker No. 4 Tahun 1987', 'Panitia Pembina Keselamatan dan Kesehatan Kerja (P2K3)', 'Kemnaker RI', 'Kelembagaan K3',
          'Pasal 2, 4, 12', 'P2K3 dibentuk dan disahkan Disnaker, rapat bulanan, laporan triwulanan.', 'SK P2K3, notulen rapat bulanan; rapat September belum diunggah', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'),
          '2026-09-10', 'Terpenuhi Sebagian');

-- Modul 18 · Pelatihan dan sertifikasi.
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-021', (SELECT id FROM t_pabrik), 'Petugas K3 Umum (AK3U)', 'Wajib Regulasi', 4, '14–19 Sep 2026',
          4, '14–19 Sep 2026',
          4, 'PJK3 Sucofindo',
          '28.0', 'Selesai');
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-022', (SELECT id FROM t_pabrik), 'Operator Forklift — Penyegaran SIO', 'Wajib Regulasi', 12, '11 Sep 2026',
          12, '11 Sep 2026',
          12, 'Disnaker Bekasi',
          '9.6', 'Selesai');
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-023', (SELECT id FROM t_pabrik), 'Tanggap Darurat & Pemadam Kebakaran', 'Internal', 40, '17 Sep 2026',
          40, '17 Sep 2026',
          34, 'Tim QHSE internal',
          '3.2', 'Selesai');
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-024', (SELECT id FROM t_pabrik), 'Bekerja di Ruang Terbatas (Confined Space)', 'Wajib Regulasi', 8, '25–26 Sep 2026',
          8, NULL,
          NULL, 'PJK3 Mutiara Mutu',
          '14.0', 'Terjadwal');
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-025', (SELECT id FROM t_pabrik), 'Ahli K3 Pesawat Uap (Boiler)', 'Wajib Regulasi', 2, '05–09 Okt 2026',
          2, NULL,
          NULL, 'PJK3 Sucofindo',
          '18.5', 'Terjadwal');
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-026', (SELECT id FROM t_pabrik), 'Induksi K3 Pekerja Baru — Batch IX', 'Internal', 22, '02 Sep 2026',
          22, '02 Sep 2026',
          22, 'Tim QHSE internal',
          '0.8', 'Selesai');
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-027', (SELECT id FROM t_pabrik), 'Higiene Industri & Keamanan Pangan', 'Internal', 60, '08 Agu 2026',
          60, NULL,
          NULL, 'QA & QHSE',
          '5.5', 'Tertunda');
INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES ('TRN-2026-028', (SELECT id FROM t_pabrik), 'Penanganan Limbah B3 & Manifes', 'Refreshment', 6, '29 Sep 2026',
          6, NULL,
          NULL, 'Tim QHSE internal',
          '1.2', 'Terjadwal');
INSERT INTO sertifikasi (pabrik_id, nama, pemegang, pemegang_id, nomor, berlaku)
  VALUES ((SELECT id FROM t_pabrik), 'Ahli K3 Umum', 'Fadli Saldi', (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), 'SER.5382/AK3U/2023', '2027-03-14');
INSERT INTO sertifikasi (pabrik_id, nama, pemegang, pemegang_id, nomor, berlaku)
  VALUES ((SELECT id FROM t_pabrik), 'Ahli K3 Pesawat Uap', 'Bambang Sutrisno', (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), 'SER.1120/PUBT/2023', '2026-10-30');
INSERT INTO sertifikasi (pabrik_id, nama, pemegang, pemegang_id, nomor, berlaku)
  VALUES ((SELECT id FROM t_pabrik), 'SIO Operator Forklift', '12 operator', (SELECT id FROM pengguna WHERE nama = '12 operator'), 'SIO kolektif Disnaker', '2031-09-11');
INSERT INTO sertifikasi (pabrik_id, nama, pemegang, pemegang_id, nomor, berlaku)
  VALUES ((SELECT id FROM t_pabrik), 'Teknisi K3 Listrik', 'Hendra Gunawan', (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'), 'SER.0741/LIS/2022', '2026-10-08');
INSERT INTO sertifikasi (pabrik_id, nama, pemegang, pemegang_id, nomor, berlaku)
  VALUES ((SELECT id FROM t_pabrik), 'Petugas P3K di Tempat Kerja', '8 petugas', (SELECT id FROM pengguna WHERE nama = '8 petugas'), 'SER.2210/P3K/2024', '2027-02-22');
INSERT INTO sertifikasi (pabrik_id, nama, pemegang, pemegang_id, nomor, berlaku)
  VALUES ((SELECT id FROM t_pabrik), 'Regu Penanggulangan Kebakaran Kelas D', '16 anggota', (SELECT id FROM pengguna WHERE nama = '16 anggota'), 'SER.3390/DAMKAR/2024', '2027-06-05');

-- Modul 19 · SHE Activity. Jam pelatihan K3 dihitung dari peserta ×
-- durasi di sini, tidak pernah diketik pada modul KPI (AB-25).
INSERT INTO kegiatan (nomor, pabrik_id, jenis, judul, tanggal, area_id, lokasi, peserta,
                       durasi_jam, foto)
  VALUES ('ACT-2026-091', (SELECT id FROM t_pabrik), 'Safety Talk', 'Bahaya uap panas & penanganan luka bakar', '2026-09-19',
          (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Line 3 — Oven Biskuit'), 'Line 3 — Oven Biskuit',
          24, 0.5, 'talk');
INSERT INTO kegiatan (nomor, pabrik_id, jenis, judul, tanggal, area_id, lokasi, peserta,
                       durasi_jam, foto)
  VALUES ('ACT-2026-090', (SELECT id FROM t_pabrik), 'Simulasi Tanggap Darurat', 'Simulasi kebakaran gudang & evakuasi', '2026-09-17',
          (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Gudang Barang Jadi'), 'Gudang Barang Jadi',
          138, 2, 'drill');
INSERT INTO kegiatan (nomor, pabrik_id, jenis, judul, tanggal, area_id, lokasi, peserta,
                       durasi_jam, foto)
  VALUES ('ACT-2026-089', (SELECT id FROM t_pabrik), 'Safety Patrol', 'Patroli gabungan manajemen — area produksi', '2026-09-15',
          NULL, 'Line 1 – Line 4',
          8, 1.5, 'patrol');
INSERT INTO kegiatan (nomor, pabrik_id, jenis, judul, tanggal, area_id, lokasi, peserta,
                       durasi_jam, foto)
  VALUES ('ACT-2026-088', (SELECT id FROM t_pabrik), 'Pelatihan', 'Pelatihan operator forklift — penyegaran tahunan', '2026-09-11',
          (SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = 'Workshop Maintenance'), 'Workshop Maintenance',
          12, 8, 'train');
INSERT INTO kegiatan (nomor, pabrik_id, jenis, judul, tanggal, area_id, lokasi, peserta,
                       durasi_jam, foto)
  VALUES ('ACT-2026-087', (SELECT id FROM t_pabrik), 'Kegiatan Lingkungan', 'Penanaman 200 pohon di sempadan sungai', '2026-09-06',
          NULL, 'Luar area pabrik',
          45, 4, 'env');

-- Modul 25 · Pemberitahuan. AB-30 membatasi sebabnya pada tiga hal;
-- purwarupa tidak menyimpan sebab, jadi diturunkan dari isinya.
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'critical', 'Dokumen Eksternal', 'LEWAT TEMPO', 'SKLO Boiler 2 sudah kedaluwarsa 83 hari', 'Surat Keterangan Layak Operasi boiler 2 berakhir 30 Jun 2026. Pengoperasian boiler tanpa SKLO adalah pelanggaran regulasi.',
          'lewat_tenggat', 'docext',
          date_trunc('day', now()) + interval '08 hours 12 minutes', NULL);
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'critical', 'CAPA', 'LEWAT TEMPO', 'CAPA-2026-0124 terlambat 11 hari', 'Laporan P2K3 triwulan II belum dikirim ke Disnaker. Tenggat 10 Sep 2026, penanggung jawab Fadli Saldi.',
          'lewat_tenggat', 'capa',
          date_trunc('day', now()) + interval '08 hours 00 minutes', NULL);
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'high', 'Work Permit', 'TERTAHAN', 'WP-2026-0913 tertahan 18 jam di verifikasi QHSE', 'Izin ruang terbatas menunggu hasil uji gas O₂/LEL/H₂S. Eskalasi otomatis ke Plant Manager pada jam ke-24.',
          'menunggu_keputusan', 'permit',
          date_trunc('day', now()) + interval '07 hours 45 minutes', NULL);
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'high', 'Pelatihan', 'LEWAT TEMPO', 'Sertifikat Teknisi K3 Listrik berakhir 17 hari lagi', 'Sertifikat atas nama Hendra Gunawan berlaku sampai 08 Okt 2026. Pendaftaran penyegaran perlu dilakukan sekarang.',
          'lewat_tenggat', 'training',
          date_trunc('day', now()) + interval '06 hours 30 minutes', now());
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'high', 'Environment', 'BAKU MUTU', 'Minyak & lemak IPAL melewati baku mutu', 'Hasil uji 15 Sep menunjukkan 14 mg/L terhadap ambang 10 mg/L. Uji ulang wajib dalam 14 hari.',
          'lewat_tenggat', 'environment',
          date_trunc('day', now()) - interval '1 day' + interval '16 hours 20 minutes', now());
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'medium', 'Insiden', 'TERTAHAN', 'INC-2026-0318 menunggu investigasi akar masalah', 'Accident berkeparahan Serius di Line 3. Investigasi 5-Why belum lengkap, status belum dapat naik ke Terverifikasi.',
          'menunggu_keputusan', 'incident',
          date_trunc('day', now()) - interval '1 day' + interval '14 hours 05 minutes', now());
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'medium', 'Dokumen Internal', 'LEWAT TEMPO', 'Kebijakan K3 dan Lingkungan lewat masa tinjau', 'KGK-01 revisi 3 seharusnya ditinjau ulang 14 Jan 2026. Perubahan struktur organisasi Mei 2026 belum tercermin.',
          'lewat_tenggat', 'docint',
          date_trunc('day', now()) - interval '1 day' + interval '09 hours 40 minutes', now());
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'medium', 'Safety Checklist', 'AMBANG', 'P2H Forklift shift 2 belum dikerjakan', 'CHK-2026-1846 belum dimulai. Forklift tidak boleh dioperasikan sebelum P2H selesai.',
          'melewati_ambang', 'checklist',
          date_trunc('day', now()) - interval '1 day' + interval '08 hours 15 minutes', now());
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'low', 'CAPA', 'AMBANG', 'CAPA-2026-0138 ditutup dan diverifikasi', 'Cermin cembung dan marka pejalan kaki persimpangan B2 terpasang, bukti foto terlampir.',
          'melewati_ambang', 'capa',
          now() - interval '2 days', now());
INSERT INTO notifikasi (pabrik_id, jenis, modul, label, judul, isi, sebab, aksi,
                         dibuat_pada, dibaca_pada)
  VALUES ((SELECT id FROM t_pabrik), 'info', 'SHE Activity', 'AMBANG', 'Safety Talk bahaya uap panas — 24 peserta', 'ACT-2026-0091 tersimpan dengan daftar hadir terpindai. Jam-orang otomatis masuk ke KPI Jam Pelatihan K3.',
          'melewati_ambang', 'activity',
          now() - interval '2 days', now());

-- Modul 10 · CAPA.
--
-- 1 baris purwarupa menunggu modulnya: CAPA-2026-0128 (ENV-2026-0033).
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
  VALUES ('CAPA-2026-0139', (SELECT id FROM t_pabrik), 'Perpanjangan sertifikat kelayakan operasi boiler 2', 'Audit',
          (SELECT id FROM temuan_audit WHERE nomor = 'AF-2026-018'), 'AF-2026-018',
          (SELECT id FROM pengguna WHERE nama = 'Bambang Sutrisno'), '2026-09-05', '2026-09-30', 'Tinggi', 'Dalam Proses',
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
  VALUES ('CAPA-2026-0137', (SELECT id FROM t_pabrik), 'Penggantian selang APAR A-14 Line 3', 'Inspeksi',
          (SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 'INS-2026-0912',
          (SELECT id FROM pengguna WHERE nama = 'Hendra Gunawan'), '2026-09-19', '2026-09-26', 'Tinggi', 'Terbuka',
          NULL,
          NULL,
          NULL);
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0136', (SELECT id FROM t_pabrik), 'Pembebasan akses APAR B-07 dari tumpukan palet', 'Inspeksi',
          (SELECT id FROM inspeksi WHERE nomor = 'INS-2026-0912'), 'INS-2026-0912',
          (SELECT id FROM pengguna WHERE nama = 'Agus Prasetyo'), '2026-09-19', '2026-09-23', 'Sedang', 'Terbuka',
          NULL,
          NULL,
          NULL);
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0135', (SELECT id FROM t_pabrik), 'Menambahkan pembersihan sensor ke checklist harian packing', 'Insiden',
          (SELECT id FROM insiden WHERE nomor = 'INC-2026-0314'), 'INC-2026-0314',
          (SELECT id FROM pengguna WHERE nama = 'Dewi Kartika'), '2026-09-08', '2026-09-22', 'Rendah', 'Menunggu Verifikasi',
          NULL,
          NULL,
          NULL);
INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES ('CAPA-2026-0124', (SELECT id FROM t_pabrik), 'Pengiriman laporan P2K3 triwulan II ke Disnaker', 'Audit',
          (SELECT id FROM temuan_audit WHERE nomor = 'AF-2026-019'), 'AF-2026-019',
          (SELECT id FROM pengguna WHERE nama = 'Fadli Saldi'), '2026-08-05', '2026-09-10', 'Tinggi', 'Dalam Proses',
          NULL,
          NULL,
          NULL);

-- Jam kerja dan jumlah pekerja. Ini masukan, bukan turunan: keduanya
-- datang dari HRD, dan tanpa keduanya TRIR serta LTIFR tidak dapat dihitung.
-- Angka bulanan dibagi rata dari manhours tahunan pada purwarupa.
INSERT INTO jam_kerja_bulanan (pabrik_id, periode, jam_kerja, pekerja, kerugian_properti_juta)
  SELECT p.id, (date_trunc('month', current_date) - (g || ' months')::interval)::date,
         228333, 412, CASE WHEN g = 0 THEN 18.4 ELSE 12.0 END
    FROM pabrik p CROSS JOIN generate_series(0, 11) AS g
   WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO jam_kerja_bulanan (pabrik_id, periode, jam_kerja, pekerja, kerugian_properti_juta)
  SELECT p.id, (date_trunc('month', current_date) - (g || ' months')::interval)::date,
         165000, 298, CASE WHEN g = 0 THEN 18.4 ELSE 12.0 END
    FROM pabrik p CROSS JOIN generate_series(0, 11) AS g
   WHERE p.kode = 'BKS'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO jam_kerja_bulanan (pabrik_id, periode, jam_kerja, pekerja, kerugian_properti_juta)
  SELECT p.id, (date_trunc('month', current_date) - (g || ' months')::interval)::date,
         118333, 214, CASE WHEN g = 0 THEN 18.4 ELSE 12.0 END
    FROM pabrik p CROSS JOIN generate_series(0, 11) AS g
   WHERE p.kode = 'SMG'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO jam_kerja_bulanan (pabrik_id, periode, jam_kerja, pekerja, kerugian_properti_juta)
  SELECT p.id, (date_trunc('month', current_date) - (g || ' months')::interval)::date,
         81667, 147, CASE WHEN g = 0 THEN 18.4 ELSE 12.0 END
    FROM pabrik p CROSS JOIN generate_series(0, 11) AS g
   WHERE p.kode = 'MDN'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;

-- Rekap bulan-bulan sebelum sistem berjalan. Grafik 12 bulan tidak dapat
-- menunggu setahun, dan mengarang catatan insiden mundur berarti membuat
-- jejak audit yang berbohong. Baris ini bertanda sumbernya sendiri, dan API
-- menyebutkannya pada setiap titik grafik.
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '11 months')::date,
         4, 3, 1, 3, 52
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '10 months')::date,
         5, 4, 1, 3, 61
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '9 months')::date,
         7, 6, 2, 6, 48
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '8 months')::date,
         9, 8, 3, 9, 66
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '7 months')::date,
         8, 7, 2, 6, 74
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '6 months')::date,
         6, 5, 2, 6, 81
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '5 months')::date,
         7, 6, 2, 6, 77
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '4 months')::date,
         5, 4, 1, 3, 88
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '3 months')::date,
         6, 5, 2, 6, 95
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '2 months')::date,
         4, 3, 1, 3, 92
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;
INSERT INTO rekap_awal_bulanan (pabrik_id, periode, insiden, trc, lti, hari_hilang, bahaya)
  SELECT p.id, (date_trunc('month', current_date) - interval '1 months')::date,
         5, 4, 1, 3, 101
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, periode) DO NOTHING;

-- Penilaian 12 elemen SMK3 untuk Cibitung; pabrik lain belum dinilai.
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 1, 'Pembangunan & Pemeliharaan Komitmen', 26, 26
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 2, 'Strategi Pendokumentasian', 15, 14
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 3, 'Peninjauan Perancangan & Kontrak', 8, 8
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 4, 'Pengendalian Dokumen', 7, 7
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 5, 'Pembelian & Pengendalian Produk', 9, 8
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 6, 'Keamanan Bekerja Berdasarkan SMK3', 41, 37
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 7, 'Standar Pemantauan', 17, 15
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 8, 'Pelaporan & Perbaikan Kekurangan', 9, 8
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 9, 'Pengelolaan Material & Perpindahannya', 12, 12
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 10, 'Pengumpulan & Penggunaan Data', 6, 6
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 11, 'Pemeriksaan SMK3', 5, 4
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;
INSERT INTO elemen_smk3 (pabrik_id, nomor, nama, kriteria, penuhi)
  SELECT p.id, 12, 'Pengembangan Keterampilan & Kemampuan', 11, 10
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (pabrik_id, nomor) DO NOTHING;

-- Program strategis pada Dashboard Eksekutif.
INSERT INTO program_strategis (nama, target, capai, dari, tenggat, status, urutan)
  VALUES ('Pemisahan jalur pejalan kaki & forklift', '4 pabrik', 2, 4, 'Des 2026', 'Dalam Proses', 1);
INSERT INTO program_strategis (nama, target, capai, dari, tenggat, status, urutan)
  VALUES ('Sertifikasi ulang ISO 45001 & 14001', 'Surveillance Okt', 0, 1, 'Okt 2026', 'Terjadwal', 2);
INSERT INTO program_strategis (nama, target, capai, dari, tenggat, status, urutan)
  VALUES ('Program Observasi Perilaku Aman', '400 observasi/bulan', 302, 400, 'Berjalan', 'Dalam Proses', 3);
INSERT INTO program_strategis (nama, target, capai, dari, tenggat, status, urutan)
  VALUES ('Penggantian boiler tua Cibitung', 'Boiler 2', 0, 1, 'Q2 2027', 'Terbuka', 4);
INSERT INTO program_strategis (nama, target, capai, dari, tenggat, status, urutan)
  VALUES ('Nihil kecelakaan hilang waktu kerja', '4 pabrik sepanjang 2026', 3, 4, 'Des 2026', 'Dalam Proses', 5);

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
  ('CAPA',2026, 142),
  ('REG', 0,    12),
  ('KGM', 0,    1),
  ('KGK', 0,    2),
  ('KGP', 0,    15),
  ('KGI', 0,    31),
  ('KGF', 0,    18),
  ('INS', 2026, 914),
  ('CHK', 2026, 1846),
  ('AUD', 2026, 4),
  ('AF',  2026, 21),
  ('RSK', 2026, 8),
  ('TRN', 2026, 28),
  ('ACT', 2026, 91)
) AS v(awalan, tahun, nilai)
ON CONFLICT (awalan, tahun) DO UPDATE SET nilai = greatest(pencacah_nomor.nilai, EXCLUDED.nilai);

COMMIT;
