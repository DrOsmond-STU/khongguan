-- KG SafeGuard · pengiriman pemberitahuan dan lampiran.

BEGIN;

-- Kapan pemberitahuan ini terakhir dikirim. Terpisah dari dibaca_pada dan
-- selesai_pada karena ketiganya menjawab pertanyaan yang berbeda:
-- sudah dikirim? sudah dibaca? sudah selesai? (AB-31).
ALTER TABLE notifikasi ADD COLUMN dikirim_pada timestamptz;

CREATE INDEX notifikasi_antre_kirim ON notifikasi (dikirim_pada)
  WHERE selesai_pada IS NULL;

-- Satu pemberitahuan terbuka per rujukan dan sebab. Tanpa ini, cron yang
-- berjalan tumpang tindih menghasilkan dua puluh salinan dari satu tenggat
-- yang sama, dan kotak masuk berhenti dibaca.
CREATE UNIQUE INDEX notifikasi_satu_per_rujukan
  ON notifikasi (rujukan_tabel, rujukan_id, sebab, coalesce(penerima_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE selesai_pada IS NULL AND rujukan_id IS NOT NULL;

-- Nomor telepon untuk saluran WhatsApp. Boleh kosong: penerima tanpa nomor
-- dilewati saluran itu, bukan menjatuhkan pengiriman ke saluran lain.
ALTER TABLE pengguna ADD COLUMN telepon text;

-- Jejak unduhan, terpisah dari jejak_audit.
--
-- jejak_audit menjawab "apa yang berubah"; ini menjawab "siapa mengambil apa
-- keluar dari sistem". Mencampurnya melemahkan keduanya: jejak perubahan
-- menjadi penuh peristiwa yang tidak mengubah apa pun, dan peristiwa akses
-- kehilangan kolom yang khas baginya, seperti jumlah baris yang terbawa.
--
-- Catatan K3 memuat nama, cedera, dan nilai ujian. Unduhan yang tidak berjejak
-- tidak dapat dipertanggungjawabkan saat ada yang bocor.
CREATE TABLE jejak_unduhan (
  id          bigserial PRIMARY KEY,
  pengguna_id uuid REFERENCES pengguna(id),
  ekspor      text NOT NULL,
  bentuk      text NOT NULL CHECK (bentuk IN ('xlsx','cetak','csv')),
  baris       integer NOT NULL CHECK (baris >= 0),
  alamat_ip   inet,
  waktu       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX jejak_unduhan_waktu ON jejak_unduhan (waktu DESC);

-- Sama kekalnya dengan jejak_audit: jejak akses yang dapat disunting tidak
-- berguna sebagai bukti.
CREATE TRIGGER jejak_unduhan_kekal_trg BEFORE UPDATE OR DELETE OR TRUNCATE ON jejak_unduhan
  FOR EACH STATEMENT EXECUTE FUNCTION jejak_audit_kekal();
REVOKE UPDATE, DELETE, TRUNCATE ON jejak_unduhan FROM PUBLIC;

COMMIT;
