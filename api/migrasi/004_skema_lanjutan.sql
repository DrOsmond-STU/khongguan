-- KG SafeGuard · skema lanjutan.
--
-- Modul yang tersisa setelah angkatan pertama: inspeksi, checklist, audit,
-- manajemen risiko, lingkungan, dokumen, regulasi, pelatihan, kegiatan, dan
-- pemberitahuan.
--
-- Sama seperti 001: aturan docs/03 ditegakkan di sini juga, bukan hanya di
-- aplikasi. Batasan pada basis data adalah jaring terakhir bagi jalur yang
-- terlewat — skrip impor, perbaikan manual, atau modul yang ditulis kemudian.

BEGIN;

-- ── Modul 02 · Inspeksi ──────────────────────────────────────────────────

CREATE TABLE inspeksi (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor      text NOT NULL UNIQUE,
  pabrik_id  uuid NOT NULL REFERENCES pabrik(id),
  jenis      text NOT NULL,
  area       text NOT NULL,        -- sebagian inspeksi melintasi area
  petugas_id uuid REFERENCES pengguna(id),
  tanggal    date NOT NULL,
  jadwal     text NOT NULL CHECK (jadwal IN ('Harian','Mingguan','Bulanan','Triwulanan','Tahunan')),
  status     text NOT NULL DEFAULT 'Terbuka' CHECK (status IN ('Terbuka','Dalam Proses','Selesai')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz
);

-- Jumlah butir, butir selesai, dan temuan TIDAK disimpan: ketiganya dihitung
-- dari tabel ini. Angka ringkasan yang disimpan selalu berakhir menyimpang
-- dari rinciannya, dan yang dipercaya orang justru angka ringkasannya.
CREATE TABLE inspeksi_butir (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspeksi_id uuid NOT NULL REFERENCES inspeksi(id) ON DELETE CASCADE,
  urutan      integer NOT NULL,
  butir       text NOT NULL,
  jawab       text CHECK (jawab IN ('Sesuai','Tidak Sesuai','Tidak Berlaku')),
  catatan     text,
  UNIQUE (inspeksi_id, urutan)
);

-- ── Modul 05 · Safety Checklist ──────────────────────────────────────────

CREATE TABLE unit_periksa (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  kode      text NOT NULL,
  nama      text NOT NULL,
  jenis     text NOT NULL,
  -- AB-08 · satu butir Tidak Sesuai mengunci unit dari operasi. Status ini
  -- tinggal pada unitnya, bukan di dalam checklist: gerbang operasi harus
  -- terlihat pada daftar alat, bukan hanya oleh yang membuka checklist-nya.
  status    text NOT NULL DEFAULT 'Layak' CHECK (status IN ('Layak','Terkunci')),
  dikunci_oleh_checklist uuid,
  dikunci_pada timestamptz,
  UNIQUE (pabrik_id, kode),
  CONSTRAINT unit_terkunci_punya_sebab
    CHECK (status <> 'Terkunci' OR dikunci_oleh_checklist IS NOT NULL)
);

CREATE TABLE checklist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor      text NOT NULL UNIQUE,
  pabrik_id  uuid NOT NULL REFERENCES pabrik(id),
  nama       text NOT NULL,
  frekuensi  text NOT NULL,
  area_id    uuid REFERENCES area(id),
  -- Sebagian checklist mencakup wilayah yang lebih luas daripada satu area
  -- terdaftar ("Gudang & Logistik"); teksnya disimpan apa adanya supaya
  -- tidak hilang dari layar hanya karena tidak ada padanannya di tabel area.
  lokasi     text,
  unit_id    uuid REFERENCES unit_periksa(id),
  shift      text,
  pj_id      uuid REFERENCES pengguna(id),
  tanggal    date NOT NULL DEFAULT current_date,
  waktu      time,
  status     text NOT NULL DEFAULT 'Terbuka' CHECK (status IN ('Terbuka','Dalam Proses','Selesai')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz
);

CREATE TABLE checklist_butir (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES checklist(id) ON DELETE CASCADE,
  urutan       integer NOT NULL,
  butir        text NOT NULL,
  jawab        text CHECK (jawab IN ('Sesuai','Tidak Sesuai','Tidak Berlaku')),
  catatan      text,
  UNIQUE (checklist_id, urutan)
);

ALTER TABLE unit_periksa
  ADD CONSTRAINT unit_dikunci_checklist_fk
  FOREIGN KEY (dikunci_oleh_checklist) REFERENCES checklist(id);

-- AB-08 ditegakkan basis data, bukan hanya aplikasi: satu jawaban Tidak
-- Sesuai mengunci unitnya seketika, dari jalur mana pun jawaban itu masuk.
CREATE FUNCTION checklist_kunci_unit() RETURNS trigger AS $kunci$
DECLARE
  unit uuid;
BEGIN
  IF NEW.jawab <> 'Tidak Sesuai' THEN RETURN NEW; END IF;
  SELECT c.unit_id INTO unit FROM checklist c WHERE c.id = NEW.checklist_id;
  IF unit IS NULL THEN RETURN NEW; END IF;
  UPDATE unit_periksa
     SET status = 'Terkunci',
         dikunci_oleh_checklist = NEW.checklist_id,
         dikunci_pada = now()
   WHERE id = unit AND status <> 'Terkunci';
  RETURN NEW;
END;
$kunci$ LANGUAGE plpgsql;

CREATE TRIGGER checklist_kunci_unit_trg
  AFTER INSERT OR UPDATE OF jawab ON checklist_butir
  FOR EACH ROW EXECUTE FUNCTION checklist_kunci_unit();

-- ── Modul 09 · Audit ─────────────────────────────────────────────────────

CREATE TABLE audit (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor      text NOT NULL UNIQUE,
  pabrik_id  uuid NOT NULL REFERENCES pabrik(id),
  standar    text NOT NULL,
  lingkup    text NOT NULL,
  auditor    text NOT NULL,
  mulai      date NOT NULL,
  selesai    date,
  status     text NOT NULL DEFAULT 'Terbuka' CHECK (status IN ('Terbuka','Dalam Proses','Selesai')),
  ditutup_oleh uuid REFERENCES pengguna(id),
  ditutup_pada timestamptz,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  CONSTRAINT audit_selesai_bertanggal
    CHECK (status <> 'Selesai' OR (selesai IS NOT NULL AND ditutup_pada IS NOT NULL))
);

CREATE TABLE temuan_audit (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor     text NOT NULL UNIQUE,
  audit_id  uuid NOT NULL REFERENCES audit(id) ON DELETE CASCADE,
  klausul   text NOT NULL,
  kategori  text NOT NULL CHECK (kategori IN ('Major','Minor','Observasi')),
  isi       text NOT NULL,
  pj_id     uuid REFERENCES pengguna(id),
  tenggat   date,
  status    text NOT NULL DEFAULT 'Terbuka'
            CHECK (status IN ('Terbuka','Dalam Proses','Selesai')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now()
);

-- ── Modul 11 · Manajemen Risiko ──────────────────────────────────────────

CREATE TABLE risiko (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor     text NOT NULL UNIQUE,
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  proses    text NOT NULL,
  ancaman   text NOT NULL,
  penyebab  text NOT NULL,
  dampak    text NOT NULL,
  -- Matriks yang sama dengan JSA dan HIRADC (AB-14). Tiga matriks berbeda
  -- dalam satu sistem menghasilkan tiga angka yang tidak dapat dibandingkan.
  kemungkinan      smallint NOT NULL CHECK (kemungkinan BETWEEN 1 AND 5),
  keparahan        smallint NOT NULL CHECK (keparahan BETWEEN 1 AND 5),
  kemungkinan_sisa smallint NOT NULL CHECK (kemungkinan_sisa BETWEEN 1 AND 5),
  keparahan_sisa   smallint NOT NULL CHECK (keparahan_sisa BETWEEN 1 AND 5),
  opsi      text NOT NULL CHECK (opsi IN ('Hindari','Kurangi','Transfer','Terima')),
  mitigasi  text NOT NULL,
  pj_id     uuid REFERENCES pengguna(id),
  target    date,
  reviu     date,
  status    text NOT NULL DEFAULT 'Terbuka' CHECK (status IN ('Terbuka','Dalam Proses','Selesai')),
  skor_awal smallint GENERATED ALWAYS AS (kemungkinan * keparahan) STORED,
  skor_sisa smallint GENERATED ALWAYS AS (kemungkinan_sisa * keparahan_sisa) STORED,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz
);

-- ── Modul 12 · Lingkungan ────────────────────────────────────────────────

CREATE TABLE pemantauan_lingkungan (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  kode      text NOT NULL CHECK (kode IN ('pppa','pppu','limbah','plb3')),
  judul     text NOT NULL,
  sub       text NOT NULL,
  acuan     text NOT NULL,
  periode   date NOT NULL,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pabrik_id, kode, periode)
);

CREATE TABLE parameter_lingkungan (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pemantauan_id uuid NOT NULL REFERENCES pemantauan_lingkungan(id) ON DELETE CASCADE,
  urutan        integer NOT NULL,
  nama          text NOT NULL,
  nilai         text NOT NULL,
  satuan        text NOT NULL DEFAULT '',
  ambang        text NOT NULL,
  -- Lulus atau tidak disimpan, bukan dihitung: ambangnya berupa kalimat
  -- ("6,0 – 9,0", "daur ulang 96%") yang bentuknya berbeda-beda per
  -- parameter, dan menebak maksudnya dari teks adalah cara paling rapi untuk
  -- salah tanpa ketahuan.
  memenuhi      boolean NOT NULL,
  UNIQUE (pemantauan_id, urutan)
);

-- ── Modul 13/14 · Dokumen internal dan eksternal ─────────────────────────

CREATE TABLE dokumen_internal (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode      text NOT NULL UNIQUE,
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  level     smallint NOT NULL CHECK (level BETWEEN 1 AND 4),
  jenis     text NOT NULL CHECK (jenis IN ('Manual','Kebijakan','Prosedur','Instruksi Kerja','Formulir')),
  judul     text NOT NULL,
  revisi    integer NOT NULL DEFAULT 0 CHECK (revisi >= 0),
  terbit    date NOT NULL,
  tinjau    date,
  pemilik   text NOT NULL,
  status    text NOT NULL CHECK (status IN ('Berlaku','Dalam Revisi','Kedaluwarsa')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  -- AB-20 · dokumen berstatus Berlaku wajib punya tanggal tinjau. Dokumen
  -- tanpa tanggal tinjau tidak pernah ditinjau.
  CONSTRAINT dokumen_berlaku_punya_tinjau
    CHECK (status <> 'Berlaku' OR tinjau IS NOT NULL)
);

CREATE TABLE dokumen_eksternal (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode      text NOT NULL UNIQUE,
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  jenis     text NOT NULL,
  judul     text NOT NULL,
  penerbit  text NOT NULL,
  nomor     text NOT NULL,
  -- Kosong bagi pelaporan wajib yang belum dikirim: laporan yang belum
  -- diserahkan memang belum punya tanggal terbit, dan mengisinya dengan
  -- tanggal apa pun berarti menyatakan sesuatu yang belum terjadi.
  terbit    date,
  -- Wajib: modul ini ada justru untuk mengawasi yang hampir habis (AB-21),
  -- dan baris tanpa tanggal berakhir tidak pernah muncul sebagai peringatan.
  -- Bagi pelaporan wajib, inilah batas penyerahannya.
  berlaku   date NOT NULL,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz
);

-- ── Modul 17 · Regulasi ──────────────────────────────────────────────────

CREATE TABLE regulasi (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode      text NOT NULL UNIQUE,
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  nomor     text NOT NULL,
  judul     text NOT NULL,
  penerbit  text NOT NULL,
  bidang    text NOT NULL,
  pasal     text NOT NULL,
  penerapan text NOT NULL,
  bukti     text,
  pj_id     uuid REFERENCES pengguna(id),
  evaluasi  date,
  status    text NOT NULL
            CHECK (status IN ('Terpenuhi','Terpenuhi Sebagian','Tidak Terpenuhi')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  -- AB-22 · baris tanpa bukti tidak dapat berstatus Terpenuhi, apa pun yang
  -- diketik pada kolom penerapan. Yang diminta ISO 45001 klausul 6.1.3 bukan
  -- daftar peraturan, melainkan bukti bahwa tiap peraturan sudah menjadi
  -- sesuatu yang benar-benar dikerjakan.
  CONSTRAINT regulasi_terpenuhi_butuh_bukti
    CHECK (status <> 'Terpenuhi' OR (bukti IS NOT NULL AND btrim(bukti) <> ''))
);

-- ── Modul 18/19 · Pelatihan, sertifikasi, dan kegiatan ───────────────────

CREATE TABLE pelatihan (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor     text NOT NULL UNIQUE,
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  nama      text NOT NULL,
  jenis     text NOT NULL CHECK (jenis IN ('Wajib Regulasi','Internal','Refreshment')),
  target    integer NOT NULL CHECK (target >= 0),
  rencana_tanggal text NOT NULL,
  rencana_peserta integer NOT NULL DEFAULT 0 CHECK (rencana_peserta >= 0),
  aktual_tanggal  text,
  aktual_peserta  integer CHECK (aktual_peserta IS NULL OR aktual_peserta >= 0),
  penyelenggara   text NOT NULL,
  biaya_juta      numeric(10,1),
  status    text NOT NULL CHECK (status IN ('Terjadwal','Tertunda','Selesai')),
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diubah_oleh uuid REFERENCES pengguna(id),
  diubah_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz,
  CONSTRAINT pelatihan_selesai_punya_aktual
    CHECK (status <> 'Selesai' OR (aktual_tanggal IS NOT NULL AND aktual_peserta IS NOT NULL))
);

CREATE TABLE sertifikasi (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id   uuid NOT NULL REFERENCES pabrik(id),
  nama        text NOT NULL,
  pemegang    text NOT NULL,
  pemegang_id uuid REFERENCES pengguna(id),
  nomor       text NOT NULL UNIQUE,
  berlaku     date NOT NULL,
  dibuat_pada timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE kegiatan (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor     text NOT NULL UNIQUE,
  pabrik_id uuid NOT NULL REFERENCES pabrik(id),
  jenis     text NOT NULL,
  judul     text NOT NULL,
  tanggal   date NOT NULL,
  area_id   uuid REFERENCES area(id),
  lokasi    text,
  -- AB-25 · KPI Jam Pelatihan K3 dihitung dari peserta × durasi pada tabel
  -- ini, tidak pernah diisi manual di modul KPI.
  peserta   integer NOT NULL CHECK (peserta >= 0),
  durasi_jam numeric(5,2) NOT NULL CHECK (durasi_jam >= 0),
  foto      text,
  dibuat_oleh uuid REFERENCES pengguna(id),
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  dihapus_pada timestamptz
);

-- ── Modul 25 · Pemberitahuan ─────────────────────────────────────────────

CREATE TABLE notifikasi (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pabrik_id   uuid NOT NULL REFERENCES pabrik(id),
  penerima_id uuid REFERENCES pengguna(id),   -- kosong berarti seluruh peran terkait
  jenis       text NOT NULL CHECK (jenis IN ('critical','high','medium','low','info')),
  modul       text NOT NULL,
  judul       text NOT NULL,
  isi         text NOT NULL,
  -- AB-30 · pemberitahuan hanya untuk tiga hal. Perubahan status biasa tidak
  -- pernah dikirim, dan kolom ini yang memaksanya: tidak ada nilai untuk
  -- "sekadar memberi tahu".
  sebab       text NOT NULL CHECK (sebab IN ('lewat_tenggat','menunggu_keputusan','melewati_ambang')),
  aksi        text NOT NULL,          -- modul tujuan saat diklik
  rujukan_tabel text,
  rujukan_id  uuid,
  dibaca_pada timestamptz,
  -- AB-31 · menandai terbaca tidak menghentikan pengingat; yang menghentikan
  -- adalah penutupan di modulnya. Kolom terpisah supaya keduanya tidak
  -- pernah tertukar.
  selesai_pada timestamptz,
  dibuat_pada timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifikasi_belum_selesai ON notifikasi (pabrik_id, dibuat_pada DESC)
  WHERE selesai_pada IS NULL;

CREATE INDEX inspeksi_pabrik_tanggal  ON inspeksi (pabrik_id, tanggal DESC);
CREATE INDEX checklist_pabrik_tanggal ON checklist (pabrik_id, tanggal DESC);
CREATE INDEX temuan_audit_audit       ON temuan_audit (audit_id);
CREATE INDEX dokumen_eksternal_berlaku ON dokumen_eksternal (berlaku);

COMMIT;
