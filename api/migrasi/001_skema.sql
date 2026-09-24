-- KG SafeGuard — skema basis data.
--
-- Mengikuti docs/05-model-data.md. Tiga hal yang berlaku di seluruh tabel
-- transaksi dan tidak diulang komentarnya per tabel:
--
--   pabrik_id    menegakkan cakupan data; tidak pernah boleh NULL
--   jejak audit  dibuat_oleh/diubah_oleh + waktunya, diisi lapisan aplikasi
--   dihapus_pada penghapusan lunak; tidak ada DELETE pada tabel transaksi
--
-- Aturan bisnis yang dapat ditegakkan basis data ditegakkan di sini juga,
-- bukan hanya di aplikasi. Aturan yang hanya dijaga aplikasi akan dilanggar
-- oleh skrip impor pertama yang menulis langsung ke tabel.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════
-- Acuan
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE pabrik (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode          text NOT NULL UNIQUE,
  nama          text NOT NULL,
  alamat        text,
  jumlah_pekerja integer NOT NULL DEFAULT 0 CHECK (jumlah_pekerja >= 0),
  aktif         boolean NOT NULL DEFAULT true,
  urutan        integer NOT NULL DEFAULT 0
);

CREATE TABLE area (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  nama      text NOT NULL,
  urutan    integer NOT NULL DEFAULT 0,
  aktif     boolean NOT NULL DEFAULT true,
  UNIQUE (pabrik_id, nama)
);

CREATE TABLE peran (
  kode      text PRIMARY KEY,
  nama      text NOT NULL,
  urutan    integer NOT NULL DEFAULT 0
);

-- Matriks hak akses: satu baris per peran per modul.
-- Modul yang tidak punya baris berarti tidak terlihat sama sekali.
CREATE TABLE peran_modul (
  peran_kode text NOT NULL REFERENCES peran(kode) ON DELETE CASCADE,
  modul      text NOT NULL,
  wewenang   text NOT NULL CHECK (wewenang IN ('baca','isi','verifikasi','kelola')),
  PRIMARY KEY (peran_kode, modul)
);

CREATE TABLE pengguna (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  nama       text NOT NULL,
  inisial    text NOT NULL,
  peran_kode text NOT NULL REFERENCES peran(kode),
  pabrik_id  uuid NOT NULL REFERENCES pabrik(id),
  status     text NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif','Menunggu','Nonaktif')),
  masuk_terakhir timestamptz,
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_pada timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE jenis_apd (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama   text NOT NULL UNIQUE,
  wajib_di text,
  urutan integer NOT NULL DEFAULT 0
);

CREATE TABLE kategori_bahaya (
  kode   text PRIMARY KEY,
  nama   text NOT NULL,
  urutan integer NOT NULL DEFAULT 0
);

CREATE TABLE kategori_observasi (
  kode   text PRIMARY KEY,
  nama   text NOT NULL,
  urutan integer NOT NULL DEFAULT 0
);

CREATE TABLE jenis_izin (
  kode      text PRIMARY KEY,
  nama      text NOT NULL,
  prasyarat jsonb NOT NULL DEFAULT '[]'::jsonb,
  urutan    integer NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════════
-- Penomoran
--
-- Nomor tampil dibangkitkan peladen, tidak pernah oleh klien. Tabel ini
-- memegang pencacah per awalan per tahun; pengambilan nomor memakai
-- UPDATE .. RETURNING sehingga dua permintaan bersamaan tidak pernah
-- mendapat nomor yang sama.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE pencacah_nomor (
  awalan text    NOT NULL,
  tahun  integer NOT NULL,
  nilai  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (awalan, tahun)
);

-- ═══════════════════════════════════════════════════════════════════
-- Jejak audit
--
-- Hak UPDATE dan DELETE dicabut pada tabel ini di akhir berkas, termasuk
-- bagi akun aplikasi (KNF-24). Satu-satunya cara menulis adalah INSERT.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE jejak_audit (
  id            bigserial PRIMARY KEY,
  tabel         text NOT NULL,
  baris_id      uuid NOT NULL,
  aksi          text NOT NULL CHECK (aksi IN ('buat','ubah','hapus_lunak','verifikasi','sahkan','terbitkan','tutup')),
  nilai_sebelum jsonb,
  nilai_sesudah jsonb,
  pengguna_id   uuid REFERENCES pengguna(id),
  alamat_ip     inet,
  waktu         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX jejak_audit_sasaran ON jejak_audit (tabel, baris_id, waktu DESC);

-- Dua lapis penjagaan, karena satu saja tidak cukup:
--
--   REVOKE  menutup jalur bagi akun aplikasi, yang pada produksi bukan
--           pemilik tabel dan bukan superuser.
--   Pemicu  menutup jalur bagi siapa pun yang tersisa — pemilik tabel,
--           skrip pemeliharaan, dan superuser sekalipun.
--
-- Jejak audit yang dapat disunting bukan jejak audit; ia hanya catatan yang
-- kebetulan sulit diubah.
CREATE FUNCTION jejak_audit_kekal() RETURNS trigger AS $kekal$
BEGIN
  RAISE EXCEPTION 'jejak_audit hanya menerima INSERT; % ditolak', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$kekal$ LANGUAGE plpgsql;

CREATE TRIGGER jejak_audit_kekal_trg
  BEFORE UPDATE OR DELETE OR TRUNCATE ON jejak_audit
  FOR EACH STATEMENT EXECUTE FUNCTION jejak_audit_kekal();

-- ═══════════════════════════════════════════════════════════════════
-- Lampiran
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE lampiran (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kunci_objek text NOT NULL,           -- rujukan ke penyimpanan objek
  nama_asli   text,
  tipe_media  text NOT NULL,
  ukuran      integer NOT NULL CHECK (ukuran > 0),
  induk_tabel text,                    -- diisi saat dikaitkan ke catatan
  induk_id    uuid,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now()
);

-- Lampiran tanpa induk dibuang setelah 24 jam; indeks ini yang dipakai
-- pekerjaan latar pembersihnya.
CREATE INDEX lampiran_yatim ON lampiran (dibuat_pada) WHERE induk_id IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- Kejadian dan bahaya
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE insiden (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor         text NOT NULL UNIQUE,
  nomor_asal    text,                  -- nomor sementara bila dari lapangan
  pabrik_id     uuid NOT NULL REFERENCES pabrik(id),
  area_id       uuid NOT NULL REFERENCES area(id),
  jenis         text NOT NULL CHECK (jenis IN ('Nearmiss','Incident','Accident')),
  keparahan     text NOT NULL CHECK (keparahan IN ('Ringan','Sedang','Serius')),
  tanggal       date NOT NULL,
  waktu         time,
  pelapor_id    uuid REFERENCES pengguna(id),
  anonim        boolean NOT NULL DEFAULT false,
  ringkas       text NOT NULL,
  kronologi     text,
  dampak        text,
  akar          text,
  cedera        text,
  hari_kerja_hilang integer NOT NULL DEFAULT 0 CHECK (hari_kerja_hilang >= 0),
  koordinat_lat numeric(9,6),
  koordinat_lon numeric(9,6),
  koordinat_akurasi_m integer,
  -- Kosakata status mengikuti purwarupa apa adanya. Nilai yang berbeda
  -- membuat kolom papan kosong dan chip kehilangan warnanya di antarmuka,
  -- dan itu perubahan tampilan.
  status        text NOT NULL DEFAULT 'Terbuka'
                CHECK (status IN ('Terbuka','Dalam Proses','Menunggu Verifikasi','Selesai')),
  diverifikasi_oleh uuid REFERENCES pengguna(id),
  diverifikasi_pada timestamptz,
  dibuat_oleh   uuid REFERENCES pengguna(id),
  dibuat_pada   timestamptz NOT NULL DEFAULT now(),
  diubah_oleh   uuid REFERENCES pengguna(id),
  diubah_pada   timestamptz NOT NULL DEFAULT now(),
  dihapus_pada  timestamptz,
  -- AB-04: laporan anonim tidak menyimpan identitas pengirim
  CONSTRAINT insiden_anonim_tanpa_pelapor CHECK (NOT anonim OR pelapor_id IS NULL)
);

CREATE INDEX insiden_cakupan ON insiden (pabrik_id, tanggal DESC) WHERE dihapus_pada IS NULL;

CREATE TABLE bahaya (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor         text NOT NULL UNIQUE,
  nomor_asal    text,
  pabrik_id     uuid NOT NULL REFERENCES pabrik(id),
  area_id       uuid NOT NULL REFERENCES area(id),
  kategori      text NOT NULL,
  isi           text NOT NULL,
  risiko        text NOT NULL DEFAULT 'Sedang' CHECK (risiko IN ('Rendah','Sedang','Tinggi')),
  pelapor_id    uuid REFERENCES pengguna(id),
  anonim        boolean NOT NULL DEFAULT false,
  koordinat_lat numeric(9,6),
  koordinat_lon numeric(9,6),
  koordinat_akurasi_m integer,
  status        text NOT NULL DEFAULT 'Terbuka'
                CHECK (status IN ('Terbuka','Diverifikasi','Ditangani')),
  diverifikasi_oleh uuid REFERENCES pengguna(id),
  diverifikasi_pada timestamptz,
  dibuat_oleh   uuid REFERENCES pengguna(id),
  dibuat_pada   timestamptz NOT NULL DEFAULT now(),
  diubah_oleh   uuid REFERENCES pengguna(id),
  diubah_pada   timestamptz NOT NULL DEFAULT now(),
  dihapus_pada  timestamptz,
  CONSTRAINT bahaya_anonim_tanpa_pelapor CHECK (NOT anonim OR pelapor_id IS NULL)
);

CREATE INDEX bahaya_cakupan ON bahaya (pabrik_id, dibuat_pada DESC) WHERE dihapus_pada IS NULL;

-- AB-06: tidak ada kolom identitas pekerja yang diamati, pada kedua tabel
-- observasi. Ketiadaan kolom itu disengaja dan diuji (UJ-10).
CREATE TABLE observasi (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor       text NOT NULL UNIQUE,
  nomor_asal  text,
  pabrik_id   uuid NOT NULL REFERENCES pabrik(id),
  area_id     uuid NOT NULL REFERENCES area(id),
  pengamat_id uuid NOT NULL REFERENCES pengguna(id),
  tanggal     date NOT NULL,
  kategori    text NOT NULL,
  aman        integer NOT NULL CHECK (aman >= 0),
  berisiko    integer NOT NULL DEFAULT 0 CHECK (berisiko >= 0),
  catatan     text NOT NULL,
  tindakan    text,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz
);

CREATE TABLE observasi_apd (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor       text NOT NULL UNIQUE,
  nomor_asal  text,
  pabrik_id   uuid NOT NULL REFERENCES pabrik(id),
  area_id     uuid NOT NULL REFERENCES area(id),
  pengamat_id uuid NOT NULL REFERENCES pengguna(id),
  tanggal     date NOT NULL,
  diamati     integer NOT NULL CHECK (diamati > 0),
  patuh       integer NOT NULL CHECK (patuh >= 0),
  catatan     text NOT NULL,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  -- AB-07: kepatuhan di atas 100% merusak rata-rata KPI tanpa terlihat
  CONSTRAINT observasi_apd_patuh_wajar CHECK (patuh <= diamati)
);

CREATE TABLE observasi_apd_rincian (
  observasi_apd_id uuid NOT NULL REFERENCES observasi_apd(id) ON DELETE CASCADE,
  jenis_apd_id     uuid NOT NULL REFERENCES jenis_apd(id),
  diamati          integer NOT NULL CHECK (diamati > 0),
  patuh            integer NOT NULL CHECK (patuh >= 0),
  PRIMARY KEY (observasi_apd_id, jenis_apd_id),
  CONSTRAINT rincian_patuh_wajar CHECK (patuh <= diamati)
);

-- ═══════════════════════════════════════════════════════════════════
-- JSA dan HIRADC
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE jsa (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor      text NOT NULL UNIQUE,
  pabrik_id  uuid NOT NULL REFERENCES pabrik(id),
  area_id    uuid NOT NULL REFERENCES area(id),
  pekerjaan  text NOT NULL,
  jenis      text NOT NULL CHECK (jenis IN ('Rutin','Non-rutin')),
  apd_wajib  jsonb NOT NULL DEFAULT '[]'::jsonb,
  penyusun_id uuid REFERENCES pengguna(id),
  peninjau_id uuid REFERENCES pengguna(id),
  pengesah_id uuid REFERENCES pengguna(id),
  disusun    date,
  disahkan   date,
  tinjau     date,
  revisi     integer NOT NULL DEFAULT 0 CHECK (revisi >= 0),
  status     text NOT NULL DEFAULT 'Draf'
             CHECK (status IN ('Draf','Menunggu Pengesahan','Disahkan')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  -- Disahkan menuntut pengesah dan tanggalnya; tanpa itu pengesahan tidak
  -- dapat dibuktikan kepada auditor.
  CONSTRAINT jsa_disahkan_lengkap
    CHECK (status <> 'Disahkan' OR (pengesah_id IS NOT NULL AND disahkan IS NOT NULL))
);

CREATE TABLE jsa_langkah (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jsa_id  uuid NOT NULL REFERENCES jsa(id) ON DELETE CASCADE,
  nomor   integer NOT NULL CHECK (nomor > 0),
  kerja   text NOT NULL,
  bahaya  text NOT NULL,
  kemungkinan      smallint NOT NULL CHECK (kemungkinan BETWEEN 1 AND 5),
  keparahan        smallint NOT NULL CHECK (keparahan BETWEEN 1 AND 5),
  kemungkinan_sisa smallint NOT NULL CHECK (kemungkinan_sisa BETWEEN 1 AND 5),
  keparahan_sisa   smallint NOT NULL CHECK (keparahan_sisa BETWEEN 1 AND 5),
  -- Skor tidak disimpan; dihitung supaya tidak pernah menyimpang dari
  -- faktornya (AB-14).
  skor_awal smallint GENERATED ALWAYS AS (kemungkinan * keparahan) STORED,
  skor_sisa smallint GENERATED ALWAYS AS (kemungkinan_sisa * keparahan_sisa) STORED,
  UNIQUE (jsa_id, nomor)
);

CREATE TABLE jsa_kendali (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jsa_langkah_id uuid NOT NULL REFERENCES jsa_langkah(id) ON DELETE CASCADE,
  hierarki       text NOT NULL CHECK (hierarki IN ('Eliminasi','Substitusi','Rekayasa','Administratif','APD')),
  teks           text NOT NULL,
  urutan         integer NOT NULL DEFAULT 0
);

CREATE TABLE hiradc (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor      text NOT NULL UNIQUE,
  pabrik_id  uuid NOT NULL REFERENCES pabrik(id),
  proses     text NOT NULL,
  aktivitas  text NOT NULL,
  sifat      text NOT NULL CHECK (sifat IN ('Rutin','Non-rutin','Darurat')),
  kategori   text NOT NULL REFERENCES kategori_bahaya(kode),
  bahaya     text NOT NULL,
  risiko     text NOT NULL,
  korban     text NOT NULL,
  kemungkinan      smallint NOT NULL CHECK (kemungkinan BETWEEN 1 AND 5),
  keparahan        smallint NOT NULL CHECK (keparahan BETWEEN 1 AND 5),
  kendali_ada      text,
  kemungkinan_sisa smallint NOT NULL CHECK (kemungkinan_sisa BETWEEN 1 AND 5),
  keparahan_sisa   smallint NOT NULL CHECK (keparahan_sisa BETWEEN 1 AND 5),
  kendali_tambahan text,
  hierarki   text CHECK (hierarki IN ('Eliminasi','Substitusi','Rekayasa','Administratif','APD')),
  pj_id      uuid REFERENCES pengguna(id),
  target     date,
  status     text NOT NULL DEFAULT 'Terbuka' CHECK (status IN ('Terbuka','Dalam Proses','Selesai')),
  skor_awal  smallint GENERATED ALWAYS AS (kemungkinan * keparahan) STORED,
  skor_sisa  smallint GENERATED ALWAYS AS (kemungkinan_sisa * keparahan_sisa) STORED,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz
);

-- ═══════════════════════════════════════════════════════════════════
-- Izin kerja
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE izin (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor      text NOT NULL UNIQUE,
  nomor_asal text,
  pabrik_id  uuid NOT NULL REFERENCES pabrik(id),
  area_id    uuid NOT NULL REFERENCES area(id),
  jenis      text NOT NULL REFERENCES jenis_izin(kode),
  judul      text NOT NULL,
  -- AB-09: izin selalu melampirkan JSA. Kolom wajib, bukan opsional, supaya
  -- tidak ada izin tanpa JSA yang bisa lolos lewat impor langsung.
  jsa_id     uuid REFERENCES jsa(id),
  pelaksana  text NOT NULL,
  pelaksana_id uuid REFERENCES pengguna(id),
  vendor     boolean NOT NULL DEFAULT false,
  pekerja    integer NOT NULL DEFAULT 1 CHECK (pekerja > 0),
  pengawas   text NOT NULL,
  mulai      timestamptz,
  selesai    timestamptz,
  durasi     text,
  prasyarat  jsonb NOT NULL DEFAULT '[]'::jsonb,
  status     text NOT NULL DEFAULT 'Menunggu Supervisor'
             CHECK (status IN ('Menunggu Supervisor','Menunggu QHSE','Aktif','Selesai','Ditolak')),
  disetujui_oleh uuid REFERENCES pengguna(id),
  disetujui_pada timestamptz,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  -- AB-09 di tingkat basis data: status Aktif menuntut JSA terlampir.
  -- Bahwa JSA-nya berstatus Disahkan diperiksa lapisan aplikasi, karena
  -- status JSA dapat berubah setelah izin terbit.
  CONSTRAINT izin_aktif_butuh_jsa CHECK (status <> 'Aktif' OR jsa_id IS NOT NULL)
);

-- ═══════════════════════════════════════════════════════════════════
-- Induksi
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE induksi (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor     text NOT NULL UNIQUE,
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  nama      text NOT NULL,
  pengguna_id uuid REFERENCES pengguna(id),
  jenis     text NOT NULL CHECK (jenis IN ('Pekerja Baru','Kontraktor','Tamu')),
  asal      text,
  tanggal   date NOT NULL,
  pemandu   text,
  nilai     smallint CHECK (nilai BETWEEN 0 AND 100),
  -- Peserta yang tidak lulus tidak punya masa berlaku sama sekali; itu NULL,
  -- bukan tanggal yang kebetulan sudah lewat. Tanggal yang sudah lewat masih
  -- berupa kartu, dan kartu yang pernah ada dapat diperpanjang.
  berlaku   date,
  status    text NOT NULL CHECK (status IN ('Berlaku','Segera Berakhir','Kedaluwarsa','Tidak Lulus')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  -- AB-24: nilai di bawah ambang tidak dapat berstatus selain Tidak Lulus.
  -- Ambang 80 ditulis di sini supaya tidak ada jalur mana pun yang dapat
  -- meloloskan peserta yang tidak lulus.
  CONSTRAINT induksi_ambang_lulus
    CHECK (nilai IS NULL OR nilai >= 80 OR status = 'Tidak Lulus'),
  -- Selain Tidak Lulus, kartu wajib punya masa berlaku: izin kerja membacanya
  -- sebagai gerbang (AB-11), dan gerbang tanpa tanggal selalu terbuka.
  CONSTRAINT induksi_berlaku_wajib
    CHECK (status = 'Tidak Lulus' OR berlaku IS NOT NULL)
);

-- ═══════════════════════════════════════════════════════════════════
-- CAPA
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE capa (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor       text NOT NULL UNIQUE,
  pabrik_id   uuid NOT NULL REFERENCES pabrik(id),
  judul       text NOT NULL,
  -- AB-01: CAPA selalu punya induk. Keduanya NOT NULL, bukan sekadar
  -- diperiksa aplikasi.
  sumber_jenis text NOT NULL
               CHECK (sumber_jenis IN ('Insiden','Inspeksi','Audit','Lingkungan','Observasi','HIRADC')),
  sumber_id   uuid NOT NULL,
  sumber_nomor text NOT NULL,
  pj_id       uuid NOT NULL REFERENCES pengguna(id),
  terbit      date NOT NULL,
  tenggat     date NOT NULL,
  prioritas   text NOT NULL DEFAULT 'Sedang' CHECK (prioritas IN ('Rendah','Sedang','Tinggi')),
  bukti       text,
  status      text NOT NULL DEFAULT 'Terbuka'
              CHECK (status IN ('Terbuka','Dalam Proses','Menunggu Verifikasi','Selesai')),
  verifikator_id uuid REFERENCES pengguna(id),
  diverifikasi_pada timestamptz,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  -- AB-17: tidak ada verifikasi diri sendiri.
  CONSTRAINT capa_bukan_verifikasi_sendiri
    CHECK (verifikator_id IS NULL OR verifikator_id <> pj_id),
  -- Selesai menuntut bukti dan verifikator; tanpa keduanya status Selesai
  -- tidak berarti apa pun bagi auditor.
  CONSTRAINT capa_selesai_lengkap
    CHECK (status <> 'Selesai' OR (bukti IS NOT NULL AND verifikator_id IS NOT NULL))
);

CREATE INDEX capa_sumber ON capa (sumber_jenis, sumber_id);
CREATE INDEX capa_cakupan ON capa (pabrik_id, status) WHERE dihapus_pada IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- Antrean lapangan
--
-- Menyimpan kunci idempoten pengiriman. Perangkat yang mengirim ulang
-- antrean yang sama tidak pernah menggandakan catatan; sinyal yang putus
-- di tengah pengiriman adalah keadaan biasa, bukan kekecualian.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE kiriman_lapangan (
  perangkat_id text NOT NULL,
  id_lokal     text NOT NULL,
  jenis        text NOT NULL,
  hasil        text NOT NULL CHECK (hasil IN ('diterima','ditolak')),
  nomor        text,
  aturan       text,
  pesan        text,
  catatan_id   uuid,
  pengguna_id  uuid REFERENCES pengguna(id),
  waktu        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (perangkat_id, id_lokal)
);

-- ═══════════════════════════════════════════════════════════════════
-- Sesi
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE sesi (
  token_hash  text PRIMARY KEY,
  pengguna_id uuid NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  jenis_klien text NOT NULL DEFAULT 'meja' CHECK (jenis_klien IN ('meja','lapangan')),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  kedaluwarsa timestamptz NOT NULL,
  dipakai_pada timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sesi_pengguna ON sesi (pengguna_id);

-- Dicabut juga di tingkat hak akses. Tidak menggigit pada pemilik tabel
-- maupun superuser — itulah tugas pemicu di atas.
REVOKE UPDATE, DELETE, TRUNCATE ON jejak_audit FROM PUBLIC;

COMMIT;
