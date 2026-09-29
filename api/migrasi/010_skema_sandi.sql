-- KG SafeGuard · masuk dengan kata sandi, undangan, dan pengaturan ulang.
--
-- Jalur masuk yang tidak bergantung pada direktori perusahaan. OIDC tetap
-- ada dan dapat dinyalakan kemudian; keduanya hidup berdampingan pada tabel
-- pengguna yang sama.

BEGIN;

-- Hanya hash yang disimpan, tidak pernah sandinya. Kosong berarti pengguna
-- belum pernah menyetel sandi: undangannya belum dipakai, atau ia hanya masuk
-- lewat OIDC.
ALTER TABLE pengguna
  ADD COLUMN sandi_hash   text,
  ADD COLUMN sandi_diubah timestamptz;

-- Tautan undangan dan pengaturan ulang.
--
-- Admin tidak pernah menentukan sandi karyawan. Ia membuat tautan; karyawan
-- yang membukanya menyetel sandinya sendiri. Dengan begitu tidak ada sandi
-- sementara yang beredar lewat WhatsApp atau tertempel di meja, dan tidak
-- ada orang lain yang pernah tahu sandi siapa pun.
--
-- Hanya hash tokennya yang disimpan, sama seperti sesi: basis data yang
-- bocor tidak memberi siapa pun tautan yang masih dapat dipakai.
CREATE TABLE tautan_sandi (
  token_hash   text PRIMARY KEY,
  pengguna_id  uuid NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  jenis        text NOT NULL CHECK (jenis IN ('undangan','atur-ulang')),
  dibuat_oleh  uuid REFERENCES pengguna(id),
  dibuat_pada  timestamptz NOT NULL DEFAULT now(),
  kedaluwarsa  timestamptz NOT NULL,
  dipakai_pada timestamptz
);

CREATE INDEX tautan_sandi_pengguna ON tautan_sandi (pengguna_id);

-- Setiap percobaan masuk, berhasil maupun gagal.
--
-- Dipakai untuk dua batas: per akun (menebak sandi satu orang) dan per alamat
-- IP (mencoba banyak akun dari satu tempat). Sekaligus menjadi catatan bila
-- ada yang bertanya "siapa yang masuk ke akun saya kemarin malam".
CREATE TABLE percobaan_masuk (
  id        bigserial PRIMARY KEY,
  waktu     timestamptz NOT NULL DEFAULT now(),
  email     text NOT NULL,
  alamat_ip text,
  berhasil  boolean NOT NULL
);

CREATE INDEX percobaan_masuk_email ON percobaan_masuk (email, waktu);
CREATE INDEX percobaan_masuk_ip    ON percobaan_masuk (alamat_ip, waktu);

-- Jejak audit mengenal tindakan atas akun. Daftar aksi sengaja tertutup:
-- aksi yang tidak dikenal ditolak basis data, supaya tidak ada jejak yang
-- tercatat dengan nama aksi karangan yang tidak dapat dicari auditor.
ALTER TABLE jejak_audit DROP CONSTRAINT jejak_audit_aksi_check;
ALTER TABLE jejak_audit ADD CONSTRAINT jejak_audit_aksi_check CHECK (aksi IN (
  'buat','ubah','hapus_lunak','verifikasi','sahkan','terbitkan','tutup',
  'aktifkan','nonaktifkan','kirim_tautan','setel_sandi','ganti_sandi'
));

COMMIT;
