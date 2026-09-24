/* Membangkitkan 005_contoh.sql dari assets/data.js.
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
/* Purwarupa memakai "\u2014" untuk nilai yang memang belum ada; itu NULL. */
const q = v => v === null || v === undefined || v === '' || v === '\u2014'
  ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
/* Teks yang boleh kosong — "" adalah nilai sungguhan, bukan ketiadaan
   (parameter pH tidak punya satuan). */
const qs = v => `'${String(v ?? '').replace(/'/g, "''")}'`;
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

/* ── Modul 02 · Inspeksi ────────────────────────────────────────────── */
w(`\n-- Modul 02 · Inspeksi. Jumlah butir, butir selesai, dan temuan tidak
-- disimpan; ketiganya dihitung dari inspeksi_butir. Butir contoh dibangkitkan
-- sebanyak angka pada purwarupa, dengan jumlah "Tidak Sesuai" yang sama.`);
for (const i of K.inspeksi) {
  const jadwal = ['Harian','Mingguan','Bulanan','Triwulanan','Tahunan'].includes(i.jadwal)
    ? i.jadwal : 'Bulanan';
  w(`INSERT INTO inspeksi (nomor, pabrik_id, jenis, area, petugas_id, tanggal, jadwal, status)
  VALUES (${q(i.id)}, ${cbt}, ${q(i.jenis)}, ${q(i.area)}, ${orang(i.petugas)},
          ${q(tgl(i.tanggal))}, ${q(jadwal)}, ${q(i.status)});`);
  const nilai = [];
  for (let n = 1; n <= i.butir; n++) {
    const jawab = n > i.selesai ? 'NULL' : (n <= i.temuan ? `'Tidak Sesuai'` : `'Sesuai'`);
    nilai.push(`((SELECT id FROM inspeksi WHERE nomor = ${q(i.id)}), ${n}, ${q(i.jenis + ' — butir ' + n)}, ${jawab})`);
  }
  if (nilai.length) w(`INSERT INTO inspeksi_butir (inspeksi_id, urutan, butir, jawab) VALUES\n  ${nilai.join(',\n  ')};`);
}

/* ── Modul 05 · Checklist dan unit yang diperiksa ───────────────────── */
w(`\n-- Modul 05 · Safety Checklist. Unit yang diperiksa dibuat dari nama
-- checklist-nya; AB-08 mengunci unit begitu satu butir dijawab Tidak Sesuai,
-- dan penguncian itu dikerjakan pemicu basis data, bukan skrip ini.`);
const unitDari = nama => nama.replace(/^P2H\s+/, '').trim();
const unitKode = nama => 'UNIT-' + unitDari(nama).toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 20);
const unitDibuat = new Set();
for (const c of K.checklistHarian) {
  const kode = unitKode(c.nama);
  if (!unitDibuat.has(kode)) {
    unitDibuat.add(kode);
    w(`INSERT INTO unit_periksa (pabrik_id, kode, nama, jenis)
  VALUES (${cbt}, ${q(kode)}, ${q(unitDari(c.nama))}, ${q(c.nama.startsWith('P2H') ? 'Kendaraan & alat angkat' : 'Fasilitas')})
  ON CONFLICT (pabrik_id, kode) DO NOTHING;`);
  }
  const tanggalC = c.tanggal ? tgl(c.tanggal) : new Date().toISOString().slice(0, 10);
  w(`INSERT INTO checklist (nomor, pabrik_id, nama, frekuensi, area_id, lokasi, unit_id, shift, pj_id,
                        tanggal, waktu, status)
  VALUES (${q(c.id)}, ${cbt}, ${q(c.nama)}, ${q(c.frekuensi)},
          ${K.lokasi.includes(c.area) ? area(c.area) : 'NULL'}, ${q(c.area)},
          (SELECT id FROM unit_periksa WHERE kode = ${q(kode)} AND pabrik_id = ${cbt}),
          ${q(c.shift)}, ${orang(c.pj)}, ${q(tanggalC)}, ${q(c.waktu)}, ${q(c.status)});`);
  const nilai = [];
  for (let n = 1; n <= c.butir; n++) {
    const jawab = n > c.selesai ? 'NULL' : (n <= c.temuan ? `'Tidak Sesuai'` : `'Sesuai'`);
    nilai.push(`((SELECT id FROM checklist WHERE nomor = ${q(c.id)}), ${n}, ${q(c.nama + ' — butir ' + n)}, ${jawab})`);
  }
  if (nilai.length) w(`INSERT INTO checklist_butir (checklist_id, urutan, butir, jawab) VALUES\n  ${nilai.join(',\n  ')};`);
}

/* ── Modul 09 · Audit ───────────────────────────────────────────────── */
w(`\n-- Modul 09 · Audit dan temuannya. Kolom selesai adalah tanggal akhir
-- pelaksanaan, termasuk bagi audit yang baru terjadwal; yang menandai
-- penutupan adalah ditutup_pada, bukan tanggal itu.`);
/* "12–14 Okt 2026" → dua tanggal. */
const rentang = (t, tahunCadangan) => {
  const m = String(t).match(/^(\d+)\s*[–-]\s*(\d+)\s+(\w+)\s+(\d{4})$/);
  if (m) return [tgl(`${m[1]} ${m[3]} ${m[4]}`), tgl(`${m[2]} ${m[3]} ${m[4]}`)];
  const satu = tgl(t);
  return [satu, satu];
};
for (const a of K.audit) {
  const [mulai, selesai] = rentang(a.tanggal);
  w(`INSERT INTO audit (nomor, pabrik_id, standar, lingkup, auditor, mulai, selesai, status, ditutup_pada)
  VALUES (${q(a.id)}, ${cbt}, ${q(a.standar)}, ${q(a.lingkup)}, ${q(a.auditor)},
          ${q(mulai)}, ${q(selesai)}, ${q(a.status)},
          ${a.status === 'Selesai' ? `${q(selesai)}::timestamptz` : 'NULL'});`);
}
for (const t of K.temuanAudit) {
  w(`INSERT INTO temuan_audit (nomor, audit_id, klausul, kategori, isi, pj_id, tenggat, status)
  VALUES (${q(t.id)}, (SELECT id FROM audit WHERE nomor = ${q(t.audit)}), ${q(t.klausul)},
          ${q(t.kategori)}, ${q(t.isi)}, ${orang(t.pj)}, ${q(tgl(t.tenggat))}, ${q(t.status)});`);
}

/* ── Modul 11 · Manajemen Risiko ────────────────────────────────────── */
w(`\n-- Modul 11 · Manajemen Risiko. Matriks yang sama dengan JSA dan HIRADC (AB-14).`);
for (const r of K.risikoRegister) {
  w(`INSERT INTO risiko (nomor, pabrik_id, proses, ancaman, penyebab, dampak, kemungkinan, keparahan,
                     kemungkinan_sisa, keparahan_sisa, opsi, mitigasi, pj_id, target, reviu, status)
  VALUES (${q(r.id)}, ${cbt}, ${q(r.proses)}, ${q(r.ancaman)}, ${q(r.penyebab)}, ${q(r.dampak)},
          ${r.L}, ${r.S}, ${r.sisaL}, ${r.sisaS}, ${q(r.opsi)}, ${q(r.mitigasi)}, ${orang(r.pj)},
          ${q(tgl(r.target))}, ${q(tgl(r.reviu))}, ${q(r.status)});`);
}

/* ── Modul 12 · Lingkungan ──────────────────────────────────────────── */
w(`\n-- Modul 12 · Lingkungan. Lulus atau tidak disimpan per parameter, bukan
-- dihitung dari teks ambangnya.`);
for (const [kode, m] of Object.entries(K.lingkungan)) {
  w(`INSERT INTO pemantauan_lingkungan (pabrik_id, kode, judul, sub, acuan, periode)
  VALUES (${cbt}, ${q(kode)}, ${q(m.judul)}, ${q(m.sub)}, ${q(m.acuan)}, date_trunc('month', current_date)::date);`);
  m.param.forEach((v, n) => {
    w(`INSERT INTO parameter_lingkungan (pemantauan_id, urutan, nama, nilai, satuan, ambang, memenuhi)
  VALUES ((SELECT id FROM pemantauan_lingkungan WHERE pabrik_id = ${cbt} AND kode = ${q(kode)}
            AND periode = date_trunc('month', current_date)::date),
          ${n + 1}, ${q(v.nama)}, ${q(v.nilai)}, ${qs(v.satuan)}, ${q(v.ambang)}, ${!!v.ok});`);
  });
}

/* ── Modul 13/14 · Dokumen ──────────────────────────────────────────── */
w(`\n-- Modul 13 · Dokumen internal. AB-20 menuntut tanggal tinjau bagi yang
-- berstatus Berlaku; dokumen tanpa tanggal tinjau tidak pernah ditinjau.`);
for (const d of K.dokInternal) {
  w(`INSERT INTO dokumen_internal (kode, pabrik_id, level, jenis, judul, revisi, terbit, tinjau,
                               pemilik, status)
  VALUES (${q(d.id)}, ${cbt}, ${d.level}, ${q(d.jenis)}, ${q(d.judul)}, ${d.rev},
          ${q(tgl(d.terbit))}, ${q(tgl(d.tinjau))}, ${q(d.pemilik)}, ${q(d.status)});`);
}
w(`\n-- Modul 14 · Dokumen eksternal. Diurutkan menurut sisa masa berlaku saat
-- dibaca (AB-21), bukan menurut abjad.`);
for (const d of K.dokEksternal) {
  w(`INSERT INTO dokumen_eksternal (kode, pabrik_id, jenis, judul, penerbit, nomor, terbit, berlaku)
  VALUES (${q(d.id)}, ${cbt}, ${q(d.jenis)}, ${q(d.judul)}, ${q(d.penerbit)}, ${q(d.nomor)},
          ${q(tgl(d.terbit))}, ${q(tgl(d.berlaku))});`);
}

/* ── Modul 17 · Regulasi ────────────────────────────────────────────── */
w(`\n-- Modul 17 · Regulasi K3. AB-22: baris tanpa bukti tidak dapat berstatus
-- Terpenuhi, apa pun yang tertulis pada kolom penerapan.`);
for (const r of K.regulasi) {
  w(`INSERT INTO regulasi (kode, pabrik_id, nomor, judul, penerbit, bidang, pasal, penerapan,
                       bukti, pj_id, evaluasi, status)
  VALUES (${q(r.id)}, ${cbt}, ${q(r.nomor)}, ${q(r.judul)}, ${q(r.penerbit)}, ${q(r.bidang)},
          ${q(r.pasal)}, ${q(r.penerapan)}, ${q(r.bukti)}, ${orang(r.pj)},
          ${q(tgl(r.evaluasi))}, ${q(r.status)});`);
}

/* ── Modul 18/19 · Pelatihan, sertifikasi, kegiatan ─────────────────── */
w(`\n-- Modul 18 · Pelatihan dan sertifikasi.`);
for (const t of K.pelatihan) {
  const selesai = t.status === 'Selesai';
  w(`INSERT INTO pelatihan (nomor, pabrik_id, nama, jenis, target, rencana_tanggal, rencana_peserta,
                        aktual_tanggal, aktual_peserta, penyelenggara, biaya_juta, status)
  VALUES (${q(t.id)}, ${cbt}, ${q(t.nama)}, ${q(t.jenis)}, ${t.target}, ${q(t.rencanaTgl)},
          ${t.rencanaPeserta}, ${selesai ? q(t.aktualTgl) : 'NULL'},
          ${selesai ? n(t.aktualPeserta) : 'NULL'}, ${q(t.penyelenggara)},
          ${t.biaya ? q(String(t.biaya).replace(',', '.')) : 'NULL'}, ${q(t.status)});`);
}
for (const c of K.sertifikasi) {
  w(`INSERT INTO sertifikasi (pabrik_id, nama, pemegang, pemegang_id, nomor, berlaku)
  VALUES (${cbt}, ${q(c.nama)}, ${q(c.pemegang)}, ${orang(c.pemegang)}, ${q(c.nomor)}, ${q(tgl(c.berlaku))});`);
}
w(`\n-- Modul 19 · SHE Activity. Jam pelatihan K3 dihitung dari peserta ×
-- durasi di sini, tidak pernah diketik pada modul KPI (AB-25).`);
for (const g of K.kegiatan) {
  w(`INSERT INTO kegiatan (nomor, pabrik_id, jenis, judul, tanggal, area_id, lokasi, peserta,
                       durasi_jam, foto)
  VALUES (${q(g.id)}, ${cbt}, ${q(g.jenis)}, ${q(g.judul)}, ${q(tgl(g.tanggal))},
          ${K.lokasi.includes(g.lokasi) ? area(g.lokasi) : 'NULL'}, ${q(g.lokasi)},
          ${g.peserta}, ${g.durasi}, ${q(g.foto)});`);
}

/* ── Modul 25 · Pemberitahuan ───────────────────────────────────────── */
w(`\n-- Modul 25 · Pemberitahuan. AB-30 membatasi sebabnya pada tiga hal;
-- purwarupa tidak menyimpan sebab, jadi diturunkan dari isinya.`);
const sebabDari = t => /kedaluwarsa|lewat|terlambat|berakhir|habis/i.test(t) ? 'lewat_tenggat'
  : /menunggu|persetujuan|belum disetujui|tertahan/i.test(t) ? 'menunggu_keputusan'
  : 'melewati_ambang';
/* "08:12 hari ini", "Kemarin 16:20", "2 hari lalu" → cap waktu relatif
   terhadap now(), supaya data contoh tidak menua menjadi "8 bulan lalu". */
const waktuNotif = t => {
  let m = String(t).match(/^(\d{2}):(\d{2}) hari ini$/);
  if (m) return `date_trunc('day', now()) + interval '${m[1]} hours ${m[2]} minutes'`;
  m = String(t).match(/^Kemarin (\d{2}):(\d{2})$/);
  if (m) return `date_trunc('day', now()) - interval '1 day' + interval '${m[1]} hours ${m[2]} minutes'`;
  m = String(t).match(/^(\d+) hari lalu$/);
  if (m) return `now() - interval '${m[1]} days'`;
  return 'now()';
};
for (const t of K.notifikasi) {
  w(`INSERT INTO notifikasi (pabrik_id, jenis, modul, judul, isi, sebab, aksi, dibuat_pada, dibaca_pada)
  VALUES (${cbt}, ${q(t.jenis)}, ${q(t.modul)}, ${q(t.judul)}, ${q(t.isi)},
          ${q(sebabDari(t.judul + ' ' + t.isi))}, ${q(t.aksi)},
          ${waktuNotif(t.waktu)}, ${t.baca ? 'now()' : 'NULL'});`);
}

/* ── CAPA ───────────────────────────────────────────────────────────── */
/* Induk CAPA kini boleh berupa insiden, temuan audit, atau inspeksi — semua
   tabelnya sudah ada. Yang bersumber dari modul lingkungan masih menunggu
   catatan bernomor; menunjuk induk yang tidak ada berarti melanggar AB-01
   lewat jalur impor, persis kebocoran yang ditutup penegakan dua lapis. */
const INDUK = {
  Insiden:  { tabel: 'insiden',      ada: id => K.insiden.some(x => x.id === id) },
  Audit:    { tabel: 'temuan_audit', ada: id => K.temuanAudit.some(x => x.id === id) },
  Inspeksi: { tabel: 'inspeksi',     ada: id => K.inspeksi.some(x => x.id === id) },
};
const adaInduk = c => INDUK[c.sumberJenis] !== undefined && INDUK[c.sumberJenis].ada(c.sumber);
const ditunda  = K.capa.filter(c => !adaInduk(c));
w(`\n-- Modul 10 · CAPA.` + (ditunda.length ? `
--
-- ${ditunda.length} baris purwarupa menunggu modulnya: ${ditunda.map(c => c.id + ' (' + c.sumber + ')').join(', ')}.` : ''));
for (const c of K.capa.filter(adaInduk)) {
  /* Purwarupa tidak memuat bukti maupun verifikator, sedangkan CAPA berstatus
     Selesai wajib punya keduanya (AB-17) — dan verifikatornya tidak boleh
     penanggung jawabnya sendiri. Keduanya diisi di sini; tanpa itu baris
     Selesai ditolak basis data, yang memang seharusnya terjadi. */
  const selesai = c.status === 'Selesai';
  const verif = c.pj === 'Fadli Saldi' ? 'Rina Wulandari' : 'Fadli Saldi';
  const tabel = INDUK[c.sumberJenis].tabel;
  w(`INSERT INTO capa (nomor, pabrik_id, judul, sumber_jenis, sumber_id, sumber_nomor, pj_id,
                   terbit, tenggat, prioritas, status, bukti, verifikator_id, diverifikasi_pada)
  VALUES (${q(c.id)}, ${cbt}, ${q(c.judul)}, ${q(c.sumberJenis)},
          (SELECT id FROM ${tabel} WHERE nomor = ${q(c.sumber)}), ${q(c.sumber)},
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
  ('CAPA',2026, ${Math.max(...K.capa.map(x => +x.id.slice(-4)))}),
  ('INS', 2026, ${Math.max(...K.inspeksi.map(x => +x.id.slice(-4)))}),
  ('CHK', 2026, ${Math.max(...K.checklistHarian.map(x => +x.id.slice(-4)))}),
  ('AUD', 2026, ${Math.max(...K.audit.map(x => +x.id.slice(-3)))}),
  ('AF',  2026, ${Math.max(...K.temuanAudit.map(x => +x.id.slice(-3)))}),
  ('RSK', 0,    ${Math.max(...K.risikoRegister.map(x => +x.id.slice(-3)))}),
  ('TRN', 2026, ${Math.max(...K.pelatihan.map(x => +x.id.slice(-3)))}),
  ('ACT', 2026, ${Math.max(...K.kegiatan.map(x => +x.id.slice(-3)))})
) AS v(awalan, tahun, nilai)
ON CONFLICT (awalan, tahun) DO UPDATE SET nilai = greatest(pencacah_nomor.nilai, EXCLUDED.nilai);

COMMIT;`);

fs.writeFileSync(new URL('./005_contoh.sql', import.meta.url).pathname, L.join('\n') + '\n');
console.log('005_contoh.sql: ' + L.length + ' pernyataan');
