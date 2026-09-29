/* Uji asap antarmuka.
 *
 * Membuka seluruh rute aplikasi meja dan aplikasi lapangan terhadap peladen
 * sungguhan, lalu gagal bila ada satu saja galat JavaScript.
 *
 * Alasannya satu kejadian nyata: kolom observasi.kategori dibuat boleh kosong —
 * keputusan yang benar, karena observasi yang seluruh perilakunya aman memang
 * tidak punya kategori temuan. Tetapi app.js memanggil toUpperCase() padanya,
 * dan layar Observasi Perilaku berhenti tergambar. Uji peladen tetap lulus
 * seluruhnya, dan perbandingan piksel tetap identik, karena keduanya menguji
 * mode peragaan. Hanya membuka layarnya dengan data sungguhan yang menemukan
 * itu.
 *
 * Ia juga menulis satu laporan bahaya lewat formulir yang sungguhan, lalu
 * memastikan nomor yang muncul berasal dari peladen — bukan pesan bernomor
 * tetap yang dipakai mode peragaan. Membaca saja tidak membuktikan aplikasi
 * dapat dipakai bekerja.
 *
 * Ia juga menjalankan alur akun dari ujung ke ujung — undangan, tautan,
 * menyetel sandi, masuk — dan memastikan isi laporan yang berisi kode tidak
 * dijalankan peramban orang yang membacanya.
 *
 * Persiapan basis data pengembangan (sekali):
 *   php api/tugas/migrasi.php --contoh
 *   php api/tugas/sandi-peragaan.php      akun contoh bersandi demo1234
 *
 * Jalankan:
 *   node uji/layar.mjs [alamat]          bawaan http://127.0.0.1:8150
 *
 * Playwright dicari lewat KG_PLAYWRIGHT bila tidak terpasang di proyek ini —
 * uji ini alat bantu pengembang, bukan ketergantungan yang harus dipasang
 * setiap orang yang hanya ingin menjalankan aplikasinya.
 */

const { chromium, devices } = await import(process.env.KG_PLAYWRIGHT || 'playwright');

const ALAMAT = process.argv[2] || 'http://127.0.0.1:8150';
const AKUN   = process.env.KG_UJI_AKUN || 'admin@khongguan.co.id';

const RUTE = [
  'exec', 'dashboard', 'ai', 'incident', 'hazard', 'bbs', 'inspection', 'checklist',
  'permit', 'jsa', 'hiradc', 'risk', 'capa', 'audit', 'environment', 'docint',
  'docext', 'regulasi', 'induksi', 'training', 'activity', 'kpi', 'notif',
  'settings', 'users',
];

/* Galat yang tidak berasal dari aplikasi ini: sertifikat proksi dan huruf dari
   luar. Menyaringnya di satu tempat lebih jujur daripada mengabaikan seluruh
   galat konsol. */
const ABAIKAN = /CERT_AUTHORITY|fonts\.g|net::ERR_CERT/;

const galat = [];
let rute = '(memuat)';

function catat(asal, pesan) {
  if (ABAIKAN.test(pesan)) return;
  galat.push(`${asal} · ${rute} · ${pesan}`);
}

const peramban = await chromium.launch();

async function token() {
  const r = await fetch(`${ALAMAT}/api/v1/sesi/masuk-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: AKUN }),
  });
  const j = await r.json();
  if (!j.data || !j.data.token) {
    throw new Error(`Gagal membuka sesi sebagai ${AKUN}: ${JSON.stringify(j)}`);
  }
  return j.data.token;
}

const tok = await token();

/* ── Aplikasi meja ──────────────────────────────────────────────────── */
{
  const ctx = await peramban.newContext({ viewport: { width: 1440, height: 1000 } });
  // Sesi dipasang sebelum halaman pertama dimuat, bukan sesudahnya: memuat
  // sekali tanpa token menghasilkan 401 yang bukan cacat, dan galat palsu
  // membuat uji ini cepat diabaikan.
  await ctx.addInitScript(([a, e, t]) => {
    window.KG_KONFIG = { api: a, versi: '4' };
    try {
      localStorage.setItem('kg-session', e);
      localStorage.setItem('kg-token', t);
    } catch (x) {}
  }, [ALAMAT, AKUN, tok]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => catat('meja', e.message));
  p.on('console', (m) => { if (m.type() === 'error') catat('meja konsol', m.text()); });

  for (rute of RUTE) {
    await p.goto(`${ALAMAT}/#/${rute}`, { waitUntil: 'domcontentloaded' });
    await p.reload({ waitUntil: 'domcontentloaded' });
    // Menunggu layarnya terisi, bukan menunggu waktu tetap: aplikasi baru
    // menggambar setelah seluruh koleksi diambil, dan lamanya bergantung pada
    // isi basis data. Penantian tetap membuat uji ini gagal karena lambat,
    // bukan karena rusak — dan uji yang sering gagal palsu berhenti dipercaya.
    await p.waitForFunction(
      () => (document.querySelector('main') || document.body).innerText.trim().length >= 80,
      null, { timeout: 10000 }
    ).catch(() => {});

    // Layar yang kosong sama buruknya dengan layar yang melempar galat.
    const isi = await p.evaluate(() => (document.querySelector('main') || document.body).innerText.trim().length);
    if (isi < 80) catat('meja', `layar tergambar nyaris kosong (${isi} aksara)`);
  }
  await ctx.close();
}

/* ── Menulis lewat formulir aplikasi meja ───────────────────────────── */
{
  rute = 'tulis/lapor-bahaya';
  const ctx = await peramban.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(([a]) => { window.KG_KONFIG = { api: a, versi: '4' }; }, [ALAMAT]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => catat('tulis', e.message));

  await p.goto(`${ALAMAT}/`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(600);
  await p.fill('#login-email', AKUN);
  await p.fill('#login-pass', process.env.KG_UJI_SANDI || 'demo1234');
  await p.click('#login-form button[type=submit]');
  await p.waitForTimeout(2200);

  if (!(await p.evaluate(() => !!localStorage.getItem('kg-token')))) {
    catat('tulis', 'masuk tidak menghasilkan token peladen');
  }

  await p.goto(`${ALAMAT}/#/hazard`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1000);
  const sebelum = await p.evaluate(() => (window.KG.bahaya || []).length);

  await p.click('[data-act="lapor-bahaya"]');
  await p.waitForTimeout(500);
  await p.selectOption('#b-lokasi', { index: 1 });
  await p.fill('#b-isi', 'Uji asap: laporan ditulis dari formulir aplikasi meja.');
  await p.click('[data-submit]');
  await p.waitForTimeout(2500);

  const pesan = await p.evaluate(() => {
    const t = document.querySelector('.toast');
    return t ? t.textContent : '';
  });
  const sesudah = await p.evaluate(() => (window.KG.bahaya || []).length);
  const tren = await p.evaluate(() => {
    const t = window.KG.trenBahaya || [];
    return t.length ? t[t.length - 1].v : null;
  });

  if (!/Tersimpan\. Nomor HZ-/.test(pesan)) {
    catat('tulis', `pesan simpan tidak menyebut nomor peladen: "${pesan}"`);
  }
  if (sesudah !== sebelum + 1) {
    catat('tulis', `daftar tidak bertambah setelah menyimpan (${sebelum} -> ${sesudah})`);
  }
  // Papan dan grafik harus sepakat; pernah tidak, karena penyegaran tidak
  // memecah koleksi gabungan.
  if (tren !== null && tren !== sesudah) {
    catat('tulis', `grafik tren (${tren}) tidak sepakat dengan daftar (${sesudah})`);
  }
  await ctx.close();
}

/* ── Persetujuan dan ekspor lewat antarmuka ─────────────────────────── */
{
  rute = 'tindakan/verifikasi+ekspor';
  const ctx = await peramban.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  await ctx.addInitScript(([a, e, t]) => {
    window.KG_KONFIG = { api: a, versi: '4' };
    try {
      localStorage.setItem('kg-session', e);
      localStorage.setItem('kg-token', t);
    } catch (x) {}
  }, [ALAMAT, AKUN, tok]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => catat('tindakan', e.message));
  p.on('console', (m) => { if (m.type() === 'error') catat('tindakan konsol', m.text()); });

  await p.goto(`${ALAMAT}/#/hazard`, { waitUntil: 'domcontentloaded' });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);

  // Satu laporan yang memang masih menunggu verifikasi.
  const nomor = await p.evaluate(() => {
    const b = (window.KG.bahaya || []).filter((x) => x.status === 'Terbuka')[0];
    return b ? b.id : null;
  });

  if (!nomor) {
    catat('tindakan', 'tidak ada laporan bahaya berstatus Terbuka untuk diverifikasi');
  } else {
    const baris = await p.$(`[data-detail="bahaya:${nomor}"]`);
    if (!baris) {
      catat('tindakan', `baris rincian untuk ${nomor} tidak ditemukan`);
    } else {
      await baris.click();
      await p.waitForTimeout(400);
      const tombol = await p.$('[data-jalankan="verifikasi"]');
      if (!tombol) {
        catat('tindakan', `modal ${nomor} tidak menawarkan tombol verifikasi`);
      } else {
        await tombol.click();
        await p.waitForTimeout(2200);
        const status = await p.evaluate((n) => {
          const b = (window.KG.bahaya || []).filter((x) => x.id === n)[0];
          return b ? b.status : null;
        }, nomor);
        if (status !== 'Diverifikasi') {
          catat('tindakan', `${nomor} tidak berubah menjadi Diverifikasi (sekarang: ${status})`);
        }
      }
    }
  }

  // Ekspor: tombolnya ada, dan berkasnya benar-benar turun.
  const ekspor = await p.$('[data-ekspor]');
  if (!ekspor) {
    catat('tindakan', 'layar Laporan Bahaya tidak punya tombol ekspor saat tersambung');
  } else {
    await ekspor.click();
    await p.waitForTimeout(400);
    const [unduhan] = await Promise.all([
      p.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      p.click('[data-unduh][data-bentuk="xlsx"]'),
    ]);
    if (!unduhan) {
      catat('tindakan', 'menekan Berkas Excel tidak menghasilkan unduhan');
    } else if (!/\.xlsx$/.test(unduhan.suggestedFilename())) {
      catat('tindakan', `nama berkas unduhan tidak berakhiran .xlsx: ${unduhan.suggestedFilename()}`);
    }
  }
  await ctx.close();
}

/* ── Akun: undangan → tautan → setel sandi → masuk ──────────────────── */
{
  rute = 'akun/undangan';
  const ctx = await peramban.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(([a, t]) => {
    window.KG_KONFIG = { api: a, versi: '4' };
    try { localStorage.setItem('kg-token', t); } catch (x) {}
  }, [ALAMAT, tok]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => catat('akun', e.message));

  await p.goto(`${ALAMAT}/#/users`, { waitUntil: 'domcontentloaded' });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  await p.click('[data-act="tambah-pengguna"]');
  await p.waitForTimeout(300);
  const email = `uji.layar.${Date.now()}@khongguan.co.id`;
  await p.fill('#u-nama', 'Uji Layar');
  await p.fill('#u-email', email);
  await p.selectOption('#u-peran', { label: 'Operator Produksi' });
  await p.selectOption('#u-lokasi', { label: 'Pabrik Cibitung' });
  await p.click('[data-submit]');
  await p.waitForTimeout(1800);
  const tautan = await p.evaluate(() => {
    const i = document.getElementById('tautan-sandi');
    return i ? i.value : null;
  });
  await ctx.close();

  if (!tautan || !/^https?:\/\/.+#\/sandi\/[0-9a-f]{64}$/.test(tautan)) {
    catat('akun', `tautan undangan tidak tampil sebagai alamat lengkap: ${tautan}`);
  } else {
    rute = 'akun/setel-sandi';
    const c2 = await peramban.newContext({ viewport: { width: 1440, height: 1000 } });
    await c2.addInitScript(([a]) => { window.KG_KONFIG = { api: a, versi: '4' }; }, [ALAMAT]);
    const q = await c2.newPage();
    q.on('pageerror', (e) => catat('akun', e.message));
    await q.goto(tautan, { waitUntil: 'domcontentloaded' });
    await q.waitForTimeout(1200);
    await q.fill('#setel-baru', 'Oven-Biskuit-Line3');
    await q.fill('#setel-ulang', 'Oven-Biskuit-Line3');
    await q.click('#login-form [type=submit]');
    await q.waitForTimeout(2500);
    const saya = await q.evaluate(() => window.KG_SAYA && window.KG_SAYA.email);
    if (saya !== email) catat('akun', `setelah menyetel sandi tidak masuk sebagai ${email} (sekarang: ${saya})`);
    if (/#\/sandi\//.test(q.url())) catat('akun', 'token tautan tertinggal di alamat setelah dipakai');

    await q.goto(tautan, { waitUntil: 'domcontentloaded' });
    await q.waitForTimeout(1200);
    const judul = await q.textContent('#login-form h1');
    if (!/tidak berlaku/i.test(judul || '')) catat('akun', `tautan bekas masih diterima: "${judul}"`);
    await c2.close();
  }
}

/* ── Isi catatan yang berisi kode tidak dijalankan ──────────────────── */
{
  rute = 'keamanan/xss';
  const hdr = { Authorization: 'Bearer ' + tok };
  const acuan = await (await fetch(`${ALAMAT}/api/v1/acuan`, { headers: hdr })).json();
  const saya = await (await fetch(`${ALAMAT}/api/v1/saya`, { headers: hdr })).json();
  // Di pabrik akun uji sendiri: grafik tren dihitung per pabrik, dan
  // pemeriksaan "papan sepakat dengan grafik" di atas hanya bermakna dalam
  // cakupan satu pabrik.
  const area = acuan.data.area.find((a) => a.pabrik_id === saya.data.pabrik.id) || acuan.data.area[0];
  await fetch(`${ALAMAT}/api/v1/bahaya`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...hdr },
    body: JSON.stringify({ area_id: area.id, isi: 'Uji <img src=x onerror="window.__xss=1"> Line 3' }),
  });
  const ctx = await peramban.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(([a, t]) => {
    window.KG_KONFIG = { api: a, versi: '4' };
    try { localStorage.setItem('kg-token', t); } catch (x) {}
  }, [ALAMAT, tok]);
  const p = await ctx.newPage();
  await p.goto(`${ALAMAT}/#/hazard`, { waitUntil: 'domcontentloaded' });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  if (await p.evaluate(() => window.__xss === 1)) {
    catat('xss', 'kode di dalam isi laporan bahaya DIJALANKAN peramban pembacanya');
  }
  if (!(await p.evaluate(() => document.body.innerText.includes('<img src=x')))) {
    catat('xss', 'isi laporan tidak tampil apa adanya');
  }
  await ctx.close();
}

/* ── Aplikasi lapangan ──────────────────────────────────────────────── */
{
  rute = '/m/';
  const ctx = await peramban.newContext({ ...devices['Pixel 7'] });
  await ctx.addInitScript(([a]) => { window.KG_KONFIG = { api: a, versi: '4' }; }, [ALAMAT]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => catat('lapangan', e.message));
  p.on('console', (m) => { if (m.type() === 'error') catat('lapangan konsol', m.text()); });

  await p.goto(`${ALAMAT}/m/`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  await p.fill('#m-email', 'agus.prasetyo@khongguan.co.id');
  await p.fill('#m-sandi', process.env.KG_UJI_SANDI || 'demo1234');
  await p.click('#form-masuk button[type=submit]');
  await p.waitForTimeout(1500);
  if (await p.evaluate(() => document.getElementById('app').hidden)) {
    catat('lapangan', 'tidak dapat masuk dengan akun peragaan');
  }

  for (const tab of ['beranda', 'lapor', 'tugas', 'panduan', 'saya']) {
    rute = `/m/#${tab}`;
    const t = await p.$(`.tab[data-tab=${tab}]`);
    if (!t) { catat('lapangan', `tab ${tab} tidak ada`); continue; }
    await t.click();
    await p.waitForTimeout(500);
  }
  await ctx.close();
}

await peramban.close();

if (galat.length) {
  console.error(`\n\u001b[31m${galat.length} galat antarmuka:\u001b[0m`);
  galat.forEach((g) => console.error('  · ' + g));
  process.exit(1);
}
console.log(`\u001b[32m${RUTE.length + 6} layar dibuka dengan data sungguhan; satu laporan ditulis`
  + ` lewat formulir, satu diverifikasi, satu berkas ekspor diunduh, satu akun diundang lalu`
  + ` menyetel sandinya, dan kode di dalam laporan tidak dijalankan — tanpa galat.\u001b[0m`);
