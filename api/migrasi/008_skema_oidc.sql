-- KG SafeGuard · masuk lewat direktori perusahaan.
--
-- Dua tabel kecil, keduanya berumur pendek.

BEGIN;

-- state, nonce, dan PKCE verifier disimpan di peladen, bukan di kuki
-- penjelajah. Kuki yang hilang karena penjelajah lapangan membuka tautan di
-- jendela baru membuat masuk selalu gagal — dan yang paling mungkin dilakukan
-- orang berikutnya adalah mematikan pemeriksaannya.
CREATE TABLE oidc_permintaan (
  state       text PRIMARY KEY,
  nonce       text NOT NULL,
  verifier    text NOT NULL,
  tujuan      text,
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  kedaluwarsa timestamptz NOT NULL
);

CREATE INDEX oidc_permintaan_kedaluwarsa ON oidc_permintaan (kedaluwarsa);

-- Simpanan dokumen penemuan dan kunci publik penerbit. Berumur, bukan abadi:
-- penerbit memutar kuncinya, dan simpanan yang tidak pernah kedaluwarsa akan
-- menolak token yang sah beberapa bulan kemudian.
CREATE TABLE simpanan (
  kunci       text PRIMARY KEY,
  isi         text NOT NULL,
  kedaluwarsa timestamptz NOT NULL
);

COMMIT;
