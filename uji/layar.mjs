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
    await p.waitForTimeout(700);

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
  await p.click('#form-masuk button[type=submit]');
  await p.waitForTimeout(1200);

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
console.log(`\u001b[32m${RUTE.length + 5} layar dibuka dengan data sungguhan, dan satu laporan`
  + ` ditulis lewat formulir — tanpa galat.\u001b[0m`);
