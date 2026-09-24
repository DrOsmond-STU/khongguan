-- Data acuan awal.
--
-- Isinya diambil dari purwarupa supaya sistem produksi berangkat dari
-- struktur yang sudah diperagakan. Nilai sebenarnya ditetapkan pada tahap 1
-- lewat antarmuka administrator, bukan lewat perubahan berkas ini (KNF-47).

BEGIN;

INSERT INTO pabrik (kode, nama, jumlah_pekerja, urutan) VALUES
  ('CBT', 'Cibitung', 412, 1),
  ('BKS', 'Bekasi',   298, 2),
  ('SMG', 'Semarang', 214, 3),
  ('MDN', 'Medan',    147, 4)
ON CONFLICT (kode) DO NOTHING;

INSERT INTO area (pabrik_id, nama, urutan)
SELECT p.id, a.nama, a.urutan
  FROM pabrik p
 CROSS JOIN (VALUES
   ('Line 1 — Mixing', 1), ('Line 2 — Moulding', 2), ('Line 3 — Oven Biskuit', 3),
   ('Line 4 — Packing', 4), ('Ruang Boiler', 5), ('Ruang Panel Utama', 6),
   ('Gudang Bahan Baku', 7), ('Gudang & Logistik', 8), ('Area Forklift B2', 9),
   ('Workshop Maintenance', 10), ('TPS Limbah B3', 11), ('Kantor & Kantin', 12)
 ) AS a(nama, urutan)
ON CONFLICT (pabrik_id, nama) DO NOTHING;

INSERT INTO peran (kode, nama, urutan) VALUES
  ('operator',   'Operator Produksi',    1),
  ('qhse',       'QHSE Supervisor',      2),
  ('lingkungan', 'Petugas Lingkungan',   3),
  ('manajemen',  'Plant Manager',        4),
  ('admin',      'Administrator Sistem', 5)
ON CONFLICT (kode) DO NOTHING;

-- Matriks hak akses — docs/04-peran-dan-hak-akses.md.
INSERT INTO peran_modul (peran_kode, modul, wewenang) VALUES
  ('operator','dashboard','baca'), ('operator','ai','baca'), ('operator','jsa','baca'),
  ('operator','induksi','baca'), ('operator','regulasi','baca'), ('operator','incident','isi'),
  ('operator','hazard','isi'), ('operator','checklist','isi'), ('operator','bbs','isi'),
  ('operator','activity','baca'),

  ('qhse','dashboard','baca'), ('qhse','ai','baca'), ('qhse','jsa','isi'), ('qhse','hiradc','isi'),
  ('qhse','induksi','isi'), ('qhse','regulasi','isi'), ('qhse','incident','verifikasi'),
  ('qhse','hazard','verifikasi'), ('qhse','bbs','verifikasi'), ('qhse','inspection','verifikasi'),
  ('qhse','checklist','verifikasi'), ('qhse','permit','verifikasi'), ('qhse','risk','isi'),
  ('qhse','capa','verifikasi'), ('qhse','audit','isi'), ('qhse','environment','isi'),
  ('qhse','docint','isi'), ('qhse','docext','isi'), ('qhse','training','isi'),
  ('qhse','activity','isi'), ('qhse','kpi','baca'), ('qhse','notif','baca'), ('qhse','settings','baca'),

  ('lingkungan','dashboard','baca'), ('lingkungan','ai','baca'), ('lingkungan','hiradc','isi'),
  ('lingkungan','induksi','baca'), ('lingkungan','regulasi','isi'), ('lingkungan','environment','isi'),
  ('lingkungan','docext','isi'), ('lingkungan','capa','isi'), ('lingkungan','notif','baca'),
  ('lingkungan','settings','baca'),

  ('manajemen','exec','baca'), ('manajemen','dashboard','baca'), ('manajemen','ai','baca'),
  ('manajemen','jsa','verifikasi'), ('manajemen','hiradc','verifikasi'), ('manajemen','induksi','baca'),
  ('manajemen','regulasi','baca'), ('manajemen','kpi','baca'), ('manajemen','audit','baca'),
  ('manajemen','environment','baca'), ('manajemen','risk','verifikasi'), ('manajemen','capa','baca'),
  ('manajemen','permit','verifikasi'), ('manajemen','notif','baca'), ('manajemen','settings','baca')
ON CONFLICT (peran_kode, modul) DO NOTHING;

-- Administrator membuka seluruh modul dengan kewenangan Kelola.
INSERT INTO peran_modul (peran_kode, modul, wewenang)
SELECT 'admin', m, 'kelola' FROM unnest(ARRAY[
  'exec','dashboard','ai','jsa','hiradc','induksi','regulasi','incident','hazard','bbs',
  'inspection','checklist','permit','risk','capa','audit','environment','docint','docext',
  'training','activity','kpi','notif','settings','users'
]) AS m
ON CONFLICT (peran_kode, modul) DO NOTHING;

INSERT INTO kategori_bahaya (kode, nama, urutan) VALUES
  ('Fisik','Fisik',1), ('Kimia','Kimia',2), ('Mekanik','Mekanik',3), ('Listrik','Listrik',4),
  ('Ergonomi','Ergonomi',5), ('Biologi','Biologi',6), ('Psikososial','Psikososial',7)
ON CONFLICT (kode) DO NOTHING;

INSERT INTO kategori_observasi (kode, nama, urutan) VALUES
  ('apd','Alat Pelindung Diri',1), ('posisi','Posisi & Postur Tubuh',2),
  ('alat','Alat & Peralatan Kerja',3), ('prosedur','Kepatuhan Prosedur',4),
  ('kerapian','Kerapian & Kebersihan',5), ('reaksi','Reaksi Terhadap Pengamat',6)
ON CONFLICT (kode) DO NOTHING;

INSERT INTO jenis_apd (nama, wajib_di, urutan) VALUES
  ('Helm pengaman','Seluruh area produksi',1),
  ('Sepatu safety','Seluruh area produksi',2),
  ('Masker / respirator','Mixing, Oven, TPS Limbah B3',3),
  ('Sarung tangan','Workshop, TPS Limbah B3',4),
  ('Kacamata pengaman','Workshop, Ruang Boiler',5),
  ('Pelindung telinga','Ruang Boiler, Line 4 — Packing',6),
  ('Rompi reflektif','Area Forklift, Gudang & Logistik',7)
ON CONFLICT (nama) DO NOTHING;

-- Nama jenis izin ditulis persis seperti purwarupa, termasuk
-- "Listrik / LOTO": antarmuka menampilkan nilai ini apa adanya.
INSERT INTO jenis_izin (kode, nama, prasyarat, urutan) VALUES
  ('panas','Panas', '["APAR di lokasi","Area dibarikade","Gas test"]', 1),
  ('ruang-terbatas','Ruang Terbatas', '["Gas test","Penjaga lubang","Ventilasi paksa"]', 2),
  ('ketinggian','Ketinggian', '["Body harness","Area dibarikade"]', 3),
  ('listrik','Listrik / LOTO', '["LOTO terpasang","Area dibarikade"]', 4),
  ('penggalian','Penggalian', '["Area dibarikade","Pemetaan utilitas"]', 5)
ON CONFLICT (kode) DO NOTHING;

-- Kategori laporan bahaya, mengikuti purwarupa.
INSERT INTO kategori_bahaya (kode, nama, urutan) VALUES
  ('Unsafe Condition','Unsafe Condition',10),
  ('Unsafe Action','Unsafe Action',11),
  ('Aspek Lingkungan','Aspek Lingkungan',12)
ON CONFLICT (kode) DO NOTHING;

COMMIT;
