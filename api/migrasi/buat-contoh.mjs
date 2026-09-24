/* Membangkitkan 003_contoh.sql dari assets/data.js.
   Jalankan:  node api/migrasi/buat-contoh.mjs
   Dibangkitkan, bukan diketik ulang: data contoh yang menyimpang dari
   purwarupa membuat layar terlihat berbeda tanpa ada yang sengaja mengubahnya. */
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
global.window = {};
require(new URL('../../assets/data.js', import.meta.url).pathname);
const K = global.window.KG;

const BULAN = { Jan:1, Feb:2, Mar:3, Apr:4, Mei:5, Jun:6, Jul:7, Agu:8, Sep:9, Okt:10, Nov:11, Des:12 };
/* Purwarupa memakai "—" untuk tanggal yang memang belum ada; itu NULL, bukan
   tanggal nol. */
const tgl = t => {
  const [d, b, y] = String(t ?? '').trim().split(/\s+/);
  if (!BULAN[b] || !y) return null;
  return `${y}-${String(BULAN[b]).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};
const q = v => v === null || v === undefined || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
const n = v => v === null || v === undefined || v === '' ? 'NULL' : String(v);
const j = v => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

/* "3 jam lalu" / "2 hari lalu" → cap waktu relatif terhadap now(). Ditulis
   sebagai interval, bukan tanggal tetap: data contoh yang menua membuat kolom
   "3 jam lalu" berubah menjadi "8 bulan lalu" setelah basis data didiamkan. */
function lampau(t) {
  const m = String(t).match(/^(\d+)\s+(jam|hari|menit)\s+lalu$/);
  if (!m) return 'now()';
  const satuan = { menit: 'minutes', jam: 'hours', hari: 'days' }[m[2]];
  return `now() - interval '${m[1]} ${satuan}'`;
}

const L = [];
const w = s => L.push(s);

w(`-- KG SafeGuard · data contoh.
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
`);

/* ── Pengguna ───────────────────────────────────────────────────────── */
w(`\n-- Pengguna. Pada produksi mereka datang dari direktori perusahaan lewat\n-- OIDC (docs/09); di sini diisi supaya nama pelapor dan penanggung jawab\n-- pada layar sama dengan purwarupa.`);
for (const u of K.pengguna) {
  const pabrik = u.lokasi === 'Kantor Pusat' ? 'CBT' : u.lokasi === 'Semarang' ? 'SMG' : u.lokasi === 'Medan' ? 'MDN' : u.lokasi === 'Surabaya' ? 'SBY' : 'CBT';
  const masuk = u.masuk && u.masuk !== '—'
    ? `'${tgl(u.masuk.split(',')[0])} ${u.masuk.split(',')[1].trim()}'::timestamptz` : 'NULL';
  w(`INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status, masuk_terakhir)
  SELECT ${q(u.email)}, ${q(u.nama)}, ${q(u.inisial)}, ${q(u.peran)}, p.id, ${q(u.status)}, ${masuk}
    FROM pabrik p WHERE p.kode = '${pabrik}'
  ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama, inisial = EXCLUDED.inisial,
    peran_kode = EXCLUDED.peran_kode, status = EXCLUDED.status, masuk_terakhir = EXCLUDED.masuk_terakhir;`);
}

/* Purwarupa menyebut beberapa nama pada catatan tanpa memuatnya di daftar
   pengguna — Rahmat Hidayat misalnya menjadi penanggung jawab CAPA sementara
   akunnya belum ada. Mereka dibuat berstatus Menunggu, bukan diabaikan:
   catatan tanpa penanggung jawab tidak dapat ditagih kepada siapa pun. */
const disebut = new Set();
const catat = x => { if (x && x !== '\u2014' && x !== 'Anonim') disebut.add(x); };
K.capa.forEach(c => catat(c.pj));
K.hiradc.forEach(h => catat(h.pj));
K.insiden.forEach(i => catat(i.pelapor));
K.bahaya.forEach(b => catat(b.pelapor));
K.observasi.forEach(o => catat(o.observer));
K.observasiAPD.forEach(o => catat(o.pengamat));
K.jsa.forEach(s => { catat(s.penyusun); catat(s.peninjau); catat(s.pengesah); });
const punyaAkun = new Set(K.pengguna.map(u => u.nama));
const tambahan = [...disebut].filter(x => !punyaAkun.has(x)).sort();
if (tambahan.length) {
  w(`\n-- Disebut pada catatan tetapi belum ada pada daftar pengguna purwarupa.`);
  for (const nm of tambahan) {
    const email = nm.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).join('.') + '@khongguan.co.id';
    const ini = nm.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
    w(`INSERT INTO pengguna (email, nama, inisial, peran_kode, pabrik_id, status)
  SELECT ${q(email)}, ${q(nm)}, ${q(ini)}, 'operator', p.id, 'Menunggu'
    FROM pabrik p WHERE p.kode = 'CBT'
  ON CONFLICT (email) DO NOTHING;`);
  }
}

const orang = q2 => `(SELECT id FROM pengguna WHERE nama = ${q(q2)})`;
const area  = a  => `(SELECT a.id FROM area a JOIN pabrik p ON p.id = a.pabrik_id WHERE p.kode = 'CBT' AND a.nama = ${q(a)})`;
const cbt   = `(SELECT id FROM t_pabrik)`;

/* ── Insiden ────────────────────────────────────────────────────────── */
w(`\n-- Modul 01 · Insiden.`);
for (const i of K.insiden) {
  w(`INSERT INTO insiden (nomor, pabrik_id, area_id, jenis, keparahan, tanggal, waktu, pelapor_id,
                      ringkas, kronologi, dampak, akar, status, dibuat_pada)
  VALUES (${q(i.id)}, ${cbt}, ${area(i.lokasi)}, ${q(i.jenis)}, ${q(i.keparahan)},
          ${q(tgl(i.tanggal))}, ${q(i.waktu)}, ${orang(i.pelapor)},
          ${q(i.ringkas)}, ${q(i.kronologi)}, ${q(i.dampak)}, ${q(i.akar)}, ${q(i.status)},
          ${q(tgl(i.tanggal) + ' ' + i.waktu)}::timestamptz);`);
}

/* ── Bahaya ─────────────────────────────────────────────────────────── */
w(`\n-- Modul 04 · Laporan bahaya. "Anonim" pada purwarupa berarti tidak ada\n-- identitas pelapor sama sekali (AB-04), bukan nama yang disembunyikan.`);
for (const b of K.bahaya) {
  const anon = b.pelapor === 'Anonim';
  w(`INSERT INTO bahaya (nomor, pabrik_id, area_id, kategori, isi, risiko, pelapor_id, anonim,
                     status, dibuat_pada, diubah_pada)
  VALUES (${q(b.id)}, ${cbt}, ${area(b.lokasi)}, ${q(b.kategori)}, ${q(b.isi)}, ${q(b.risiko)},
          ${anon ? 'NULL' : orang(b.pelapor)}, ${anon}, ${q(b.status)}, ${lampau(b.waktu)}, ${lampau(b.waktu)});`);
}

/* ── JSA ────────────────────────────────────────────────────────────── */
w(`\n-- Modul 06 · Analisis JSA, beserta langkah dan pengendaliannya.`);
for (const s of K.jsa) {
  w(`INSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES (${q(s.id)}, ${cbt}, ${area(s.area)}, ${q(s.pekerjaan)}, ${q(s.jenis)}, ${j(s.apd)},
          ${orang(s.penyusun)}, ${orang(s.peninjau)},
          ${s.status === 'Disahkan' ? orang(s.pengesah) : 'NULL'},
          ${q(tgl(s.disusun))}, ${q(tgl(s.disahkan))}, ${q(tgl(s.tinjau))}, ${n(s.rev)}, ${q(s.status)});`);
  for (const l of s.langkah) {
    w(`INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                           kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = ${q(s.id)}), ${l.no}, ${q(l.kerja)}, ${q(l.bahaya)},
          ${l.k}, ${l.s}, ${l.sk}, ${l.ss});`);
    l.kendali.forEach(([h, t], u) => {
      w(`INSERT INTO jsa_kendali (jsa_langkah_id, hierarki, teks, urutan)
  VALUES ((SELECT l.id FROM jsa_langkah l JOIN jsa s ON s.id = l.jsa_id
            WHERE s.nomor = ${q(s.id)} AND l.nomor = ${l.no}), ${q(h)}, ${q(t)}, ${u});`);
    });
  }
}

/* ── JSA pelengkap untuk izin yang tidak punya padanan ──────────────── */
/* Purwarupa menampilkan angka risiko pada keempat kartu izin, tetapi pustaka
   JSA-nya hanya memuat dua pekerjaan yang cocok. Dua izin sisanya menampilkan
   angka yang tidak berasal dari JSA mana pun. Di sini angka itu dijadikan JSA
   sungguhan supaya kartunya tetap menampilkan angka yang sama — tanpa itu
   kolomnya berbunyi "risiko — → —", karena memang tidak ada yang menghitung. */
const faktor = skor => {
  for (let a = 5; a >= 1; a--) if (skor % a === 0 && skor / a <= 5) return [skor / a, a];
  return [Math.min(5, skor), 1];
};
const izinTanpaJsa = K.izin.filter(z => !K.jsa.some(s => z.judul.startsWith(s.pekerjaan)));
const jsaPelengkap = new Map();
izinTanpaJsa.forEach((z, i) => {
  const nomor = `JSA-2026-9${String(i + 1).padStart(2, '0')}`;
  jsaPelengkap.set(z.id, nomor);
  const lok = K.lokasi.filter(l => z.judul.includes(l)).sort((a, b) => b.length - a.length)[0]
    || 'Workshop Maintenance';
  const [k1, s1] = faktor(z.risikoAwal);
  const [k2, s2] = faktor(z.risikoSisa);
  w(`\nINSERT INTO jsa (nomor, pabrik_id, area_id, pekerjaan, jenis, apd_wajib, penyusun_id,
                  peninjau_id, pengesah_id, disusun, disahkan, tinjau, revisi, status)
  VALUES (${q(nomor)}, ${cbt}, ${area(lok)}, ${q(z.judul)}, 'Non-rutin', '[]'::jsonb,
          ${orang('Rina Wulandari')}, ${orang('Fadli Saldi')}, ${orang('Hartono Wijaya')},
          current_date - 14, current_date - 10, current_date + 355, 1, 'Disahkan');
INSERT INTO jsa_langkah (jsa_id, nomor, kerja, bahaya, kemungkinan, keparahan,
                         kemungkinan_sisa, keparahan_sisa)
  VALUES ((SELECT id FROM jsa WHERE nomor = ${q(nomor)}), 1, 'Persiapan dan isolasi',
          'Bahaya pada tahap persiapan', 2, 2, 1, 2),
         ((SELECT id FROM jsa WHERE nomor = ${q(nomor)}), 2, ${q(z.judul)},
          'Bahaya utama pekerjaan', ${k1}, ${s1}, ${k2}, ${s2});`);
});

/* ── Izin ───────────────────────────────────────────────────────────── */
w(`\n-- Modul 03 · Izin kerja.
--
-- JSA dipasangkan dengan izin menurut kecocokan pekerjaannya, bukan menurut
-- kolom izinTerkait pada purwarupa: di sana JSA-2026-010 (pengelasan pipa uap)
-- menunjuk WP-2026-0914 (penggantian lampu high bay), sedangkan pekerjaan
-- pengelasan pipa uap adalah WP-2026-0912. Menyalin rujukan yang tersilang
-- berarti izin Aktif kehilangan JSA-nya dan ditolak AB-09 — yang memang
-- seharusnya terjadi.
--
-- Area tidak ada pada purwarupa; diambil dari nama lokasi yang tersebut pada
-- judul, lalu dari area JSA-nya.`);
const JENIS = { 'Panas': 'panas', 'Ruang Terbatas': 'ruang-terbatas', 'Ketinggian': 'ketinggian', 'Listrik / LOTO': 'listrik', 'Penggalian': 'penggalian' };
for (const z of K.izin) {
  const [tglS, jam] = z.mulai.split('\u00b7').map(x => x.trim());
  const [m1] = jam.replace(' WIB', '').split('\u2013');
  const cocok = K.jsa.find(s => z.judul.startsWith(s.pekerjaan));
  const jsaTerkait = cocok ? { id: cocok.id, area: cocok.area } : { id: jsaPelengkap.get(z.id), area: null };
  const lok = K.lokasi.filter(l => z.judul.includes(l)).sort((a, b) => b.length - a.length)[0]
    || jsaTerkait.area || 'Workshop Maintenance';
  w(`INSERT INTO izin (nomor, pabrik_id, area_id, jenis, judul, jsa_id, pelaksana, vendor, pekerja,
                   pengawas, mulai, durasi, prasyarat, status, dibuat_pada)
  VALUES (${q(z.id)}, ${cbt}, ${area(lok)}, ${q(JENIS[z.jenis])}, ${q(z.judul)},
          (SELECT id FROM jsa WHERE nomor = ${q(jsaTerkait.id)}),
          ${q(z.pelaksana)}, ${!!z.vendor}, ${z.pekerja}, ${q(z.pengawas)},
          ${q(tgl(tglS) + ' ' + m1.replace('.', ':'))}::timestamptz, ${q(jam)},
          ${j(z.prasyarat)}, ${q(z.status)}, ${q(tgl(tglS))}::timestamptz);`);
}

/* ── Observasi APD ──────────────────────────────────────────────────── */
w(`\n-- Modul 16 · Observasi APD. Tidak ada kolom identitas pekerja yang\n-- diamati, dan tidak pernah akan ada (AB-06).`);
for (const o of K.observasiAPD) {
  w(`INSERT INTO observasi_apd (nomor, pabrik_id, area_id, pengamat_id, tanggal, diamati, patuh, catatan)
  VALUES (${q(o.id)}, ${cbt}, ${area(o.area)}, ${orang(o.pengamat)}, ${q(tgl(o.tanggal))},
          ${o.diamati}, ${o.patuh}, ${q(o.catatan)});`);
  for (const [nama, d, p] of (o.rincian || [])) {
    w(`INSERT INTO observasi_apd_rincian (observasi_apd_id, jenis_apd_id, diamati, patuh)
  VALUES ((SELECT id FROM observasi_apd WHERE nomor = ${q(o.id)}),
          (SELECT id FROM jenis_apd WHERE nama = ${q(nama)}), ${d}, ${p});`);
  }
}

/* ── Observasi perilaku ─────────────────────────────────────────────── */
w(`\n-- Modul 15 · Observasi perilaku.`);
for (const o of K.observasi) {
  w(`INSERT INTO observasi (nomor, pabrik_id, area_id, pengamat_id, tanggal, kategori,
                        aman, berisiko, catatan, tindakan)
  VALUES (${q(o.id)}, ${cbt}, ${area(o.area)}, ${orang(o.observer)}, ${q(tgl(o.tanggal))},
          ${q(o.kategori)}, ${o.aman}, ${o.berisiko}, ${q(o.catatan)}, ${q(o.tindakan)});`);
}

/* ── HIRADC ─────────────────────────────────────────────────────────── */
w(`\n-- Modul 07 · HIRADC.`);
for (const h of K.hiradc) {
  w(`INSERT INTO hiradc (nomor, pabrik_id, proses, aktivitas, sifat, kategori, bahaya, risiko, korban,
                     kemungkinan, keparahan, kendali_ada, kemungkinan_sisa, keparahan_sisa,
                     kendali_tambahan, hierarki, pj_id, target, status)
  VALUES (${q(h.id)}, ${cbt}, ${q(h.proses)}, ${q(h.aktivitas)}, ${q(h.rutin)}, ${q(h.kategori)},
          ${q(h.bahaya)}, ${q(h.risiko)}, ${q(h.korban)}, ${h.k}, ${h.p}, ${q(h.kendaliAda)},
          ${h.sk}, ${h.sp}, ${q(h.kendaliTambah)}, ${q(h.hierarki)}, ${orang(h.pj)},
          ${q(tgl(h.target))}, ${q(h.status)});`);
}

/* ── Induksi ────────────────────────────────────────────────────────── */
w(`\n-- Modul 08 · Induksi K3. Kartu ini adalah gerbang izin kerja (AB-11).`);
for (const i of K.induksi) {
  w(`INSERT INTO induksi (nomor, pabrik_id, nama, pengguna_id, jenis, asal, tanggal, pemandu,
                      nilai, berlaku, status)
  VALUES (${q(i.id)}, ${cbt}, ${q(i.nama)}, ${orang(i.nama)}, ${q(i.jenis)}, ${q(i.asal)},
          ${q(tgl(i.tanggal))}, ${q(i.pemandu)}, ${n(i.nilai)}, ${q(tgl(i.berlaku))}, ${q(i.status)});`);
}

/* ── CAPA ───────────────────────────────────────────────────────────── */
const adaInduk = c => c.sumberJenis === 'Insiden' && K.insiden.some(i => i.id === c.sumber);
const ditunda  = K.capa.filter(c => !adaInduk(c));
w(`\n-- Modul 10 · CAPA.
--
-- Hanya CAPA yang induknya benar-benar ada pada basis data yang dimuat.
-- ${ditunda.length} baris lain pada purwarupa bersumber dari inspeksi, audit, dan
-- lingkungan — modul yang tabelnya belum dibangun. Menunjuk induk yang tidak
-- ada berarti melanggar AB-01 lewat jalur impor, persis kebocoran yang
-- ditutup oleh penegakan dua lapis. Baris itu menyusul bersama modulnya:
-- ${ditunda.map(c => c.id + ' (' + c.sumber + ')').join(', ')}.`);
for (const c of K.capa.filter(adaInduk)) {
  /* Purwarupa tidak memuat bukti maupun verifikator, sedangkan CAPA berstatus
     Selesai wajib punya keduanya (AB-17) — dan verifikatornya tidak boleh
     penanggung jawabnya sendiri. Keduanya diisi di sini; tanpa itu baris
     Selesai ditolak basis data, yang memang seharusnya terjadi. */
  const selesai = c.status === 'Selesai';
  const verif = c.pj === 'Fadli Saldi' ? 'Rina Wulandari' : 'Fadli Saldi';
  w(`INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES (${q(c.id)}, ${cbt}, ${q(c.judul)}, ${q(c.sumberJenis)},
          (SELECT id FROM insiden WHERE nomor = ${q(c.sumber)}), ${q(c.sumber)},
          ${orang(c.pj)}, ${q(tgl(c.terbit))}, ${q(tgl(c.tenggat))}, ${q(c.prioritas)}, ${q(c.status)},
          ${selesai ? q('Foto pemasangan dan berita acara serah terima, ' + c.tenggat) : 'NULL'},
          ${selesai ? orang(verif) : 'NULL'},
          ${selesai ? `${q(tgl(c.tenggat))}::timestamptz` : 'NULL'});`);
}

/* Pencacah nomor disetel melewati nomor tertinggi yang dipakai, supaya catatan
   berikutnya tidak menabrak nomor data contoh. */
w(`\n-- Pencacah disetel melewati nomor tertinggi yang terpakai; tanpa ini
-- catatan pertama yang dibuat lewat API akan menabrak nomor data contoh.
INSERT INTO pencacah_nomor (awalan, tahun, nilai)
SELECT awalan, tahun, nilai FROM (VALUES
  ('INC', 2026, ${Math.max(...K.insiden.map(x => +x.id.slice(-4)))}),
  ('HZ',  2026, ${Math.max(...K.bahaya.map(x => +x.id.slice(-4)))}),
  ('WP',  2026, ${Math.max(...K.izin.map(x => +x.id.slice(-4)))}),
  ('JSA', 2026, ${Math.max(...K.jsa.map(x => +x.id.slice(-3)))}),
  ('HRD', 0,    ${Math.max(...K.hiradc.map(x => +x.id.slice(-3)))}),
  ('IND', 2026, ${Math.max(...K.induksi.map(x => +x.id.slice(-4)))}),
  ('APD', 2026, ${Math.max(...K.observasiAPD.map(x => +x.id.slice(-4)))}),
  ('OBS', 2026, ${Math.max(...K.observasi.map(x => +x.id.slice(-4)))}),
  ('CAPA',2026, ${Math.max(...K.capa.map(x => +x.id.slice(-4)))})
) AS v(awalan, tahun, nilai)
ON CONFLICT (awalan, tahun) DO UPDATE SET nilai = greatest(pencacah_nomor.nilai, EXCLUDED.nilai);

COMMIT;`);

fs.writeFileSync(new URL('./003_contoh.sql', import.meta.url).pathname, L.join('\n') + '\n');
console.log('003_contoh.sql: ' + L.length + ' pernyataan');
