-- KG SafeGuard · skema KPI dan dashboard.
--
-- Hampir seluruh angka KPI diturunkan dari catatan yang sudah ada. Yang
-- disimpan di sini hanya dua hal:
--
--   1. Masukan yang memang tidak dapat diturunkan — jam kerja dan jumlah
--      pekerja. Tanpa keduanya TRIR dan LTIFR tidak dapat dihitung, dan
--      keduanya datang dari HRD, bukan dari modul QHSE mana pun.
--
--   2. Rekap bulan-bulan sebelum sistem berjalan. Grafik 12 bulan tidak
--      dapat menunggu setahun. Baris ini ditandai sumbernya supaya tidak
--      pernah tercampur diam-diam dengan angka yang dihitung sistem.

BEGIN;

CREATE TABLE jam_kerja_bulanan (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  periode   date NOT NULL,          -- selalu tanggal 1
  jam_kerja bigint NOT NULL CHECK (jam_kerja >= 0),
  pekerja   integer NOT NULL CHECK (pekerja >= 0),
  -- Kerugian properti tidak ada pada catatan insiden karena nilainya
  -- ditetapkan keuangan, bukan QHSE, dan sering baru diketahui berminggu
  -- kemudian.
  kerugian_properti_juta numeric(12,1) NOT NULL DEFAULT 0,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pabrik_id, periode),
  CONSTRAINT jam_kerja_periode_awal_bulan CHECK (date_trunc('month', periode) = periode)
);

-- Bulan sebelum sistem berjalan. Sistem tidak punya catatannya, dan mengarang
-- catatan mundur untuk mengisi grafik berarti membuat jejak audit yang
-- berbohong. Angkanya disimpan sebagai rekap, terpisah dan bertanda.
CREATE TABLE rekap_awal_bulanan (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  periode   date NOT NULL,
  insiden   integer NOT NULL DEFAULT 0 CHECK (insiden >= 0),
  trc       integer NOT NULL DEFAULT 0 CHECK (trc >= 0),
  lti       integer NOT NULL DEFAULT 0 CHECK (lti >= 0),
  hari_hilang integer NOT NULL DEFAULT 0 CHECK (hari_hilang >= 0),
  bahaya    integer NOT NULL DEFAULT 0 CHECK (bahaya >= 0),
  UNIQUE (pabrik_id, periode),
  CONSTRAINT rekap_trc_wajar CHECK (trc <= insiden AND lti <= trc),
  CONSTRAINT rekap_periode_awal_bulan CHECK (date_trunc('month', periode) = periode)
);

-- AB-27 · rumus ditulis di tempatnya. Kolom `rumus` bukan hiasan: ia yang
-- muncul di bawah angkanya pada layar, supaya pembaca tidak perlu menebak
-- pengali mana yang dipakai. AB-19 · setiap angka punya pembanding, jadi
-- target wajib ada.
CREATE TABLE target_kpi (
  kode     text PRIMARY KEY,
  nama     text NOT NULL,
  satuan   text NOT NULL DEFAULT '',
  -- AB-26 · lagging dan leading tidak dicampur. Dipisahkan di sini supaya
  -- tidak ada layar yang dapat menampilkannya dalam satu deret.
  jenis    text NOT NULL CHECK (jenis IN ('lagging','leading')),
  arah     text NOT NULL CHECK (arah IN ('turun_baik','naik_baik')),
  target   numeric(12,2),
  rumus    text NOT NULL,
  urutan   integer NOT NULL DEFAULT 0
);

-- Penilaian 12 elemen SMK3 (PP 50/2012). Persentase pemenuhan pada Dashboard
-- Eksekutif berasal dari sini, bukan dari temuan audit: temuan menghitung apa
-- yang salah, sedangkan pemenuhan kriteria menghitung apa yang sudah ada.
-- Dua hal berbeda yang mudah tertukar dan menghasilkan angka yang keliru.
CREATE TABLE elemen_smk3 (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  nomor     smallint NOT NULL CHECK (nomor BETWEEN 1 AND 12),
  nama      text NOT NULL,
  kriteria  integer NOT NULL CHECK (kriteria > 0),
  penuhi    integer NOT NULL DEFAULT 0 CHECK (penuhi >= 0),
  dinilai   date NOT NULL DEFAULT current_date,
  UNIQUE (pabrik_id, nomor),
  CONSTRAINT smk3_penuhi_wajar CHECK (penuhi <= kriteria)
);

CREATE TABLE program_strategis (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama      text NOT NULL,
  target    text NOT NULL,
  capai     integer NOT NULL DEFAULT 0 CHECK (capai >= 0),
  dari      integer NOT NULL CHECK (dari > 0),
  tenggat   text NOT NULL,
  status    text NOT NULL CHECK (status IN ('Terbuka','Terjadwal','Dalam Proses','Selesai')),
  urutan    integer NOT NULL DEFAULT 0,
  CONSTRAINT program_capai_wajar CHECK (capai <= dari)
);

-- Label chip pada kotak masuk dan panel "Perlu Perhatian" — "LEWAT TEMPO",
-- "BAKU MUTU", "MASA SIMPAN". Sebab (AB-30) menjelaskan mengapa
-- pemberitahuan boleh ada; label menjelaskan apa yang dilihat pembaca.
ALTER TABLE notifikasi ADD COLUMN label text;

INSERT INTO target_kpi (kode, nama, satuan, jenis, arah, target, rumus, urutan) VALUES
  ('trir',      'TRIR',               '',        'lagging', 'turun_baik', 0.50,
   '(TRC × 200.000) ÷ jam kerja', 1),
  ('ltifr',     'LTIFR',              '',        'lagging', 'turun_baik', 2.00,
   '(LTI × 1.000.000) ÷ jam kerja', 2),
  ('ltisr',     'LTISR',              '',        'lagging', 'turun_baik', NULL,
   '(hari hilang × 1.000.000) ÷ jam kerja', 3),
  ('manhours',  'Safe Manhours',      '',        'lagging', 'naik_baik',  NULL,
   'Jam kerja sejak LTI terakhir', 4),
  ('hari_hilang','Hari Kerja Hilang', 'hari',    'lagging', 'turun_baik', NULL,
   'Hari kerja hilang pada periode', 5),
  ('kerugian',  'Kerugian Properti',  'jt',      'lagging', 'turun_baik', NULL,
   'Rupiah, dicatat keuangan', 6),
  ('bahaya',    'Laporan Bahaya',     '/bln',    'leading', 'naik_baik',  NULL,
   'Jumlah laporan bahaya pada periode', 1),
  ('inspeksi',  'Inspeksi Terjadwal', '%',       'leading', 'naik_baik',  95,
   'Selesai ÷ terjadwal', 2),
  ('capa',      'CAPA Tepat Waktu',   '%',       'leading', 'naik_baik',  90,
   'Selesai sebelum tenggat ÷ selesai', 3),
  ('pelatihan', 'Jam Pelatihan K3',   'jam/org', 'leading', 'naik_baik',  NULL,
   '(peserta × durasi) ÷ pekerja', 4),
  ('patroli',   'Safety Patrol',      '/bln',    'leading', 'naik_baik',  16,
   'Kegiatan berjenis Safety Patrol', 5),
  ('apd',       'Kepatuhan APD',      '%',       'leading', 'naik_baik',  95,
   'Patuh ÷ diamati', 6);

COMMIT;
