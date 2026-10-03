/* Uji layar terhadap basis data KOSONG.
 *
 * Basis data produksi dimulai tanpa satu catatan pun, sedangkan uji/layar.mjs
 * berjalan pada basis data pengembangan yang penuh data contoh. Layar yang
 * baik-baik saja dengan data dapat berhenti tergambar tanpa data: pembagian
 * 0 ÷ 0 tampil "NaN%", Math.max dari daftar kosong tampil "-Infinity", dan
 * hasil uji lingkungan yang belum ada membuat layar Lingkungan tidak
 * tergambar sama sekali. Ketiganya sempat terjadi, dan ketiganya akan
 * menjadi hal pertama yang dilihat administrator pertama.
 *
 * Persiapan (sekali):
 *   createdb kg_kosong
 *   salinan repositori dengan api/config.php menunjuk dbname=kg_kosong dan
 *   'izinkan_masuk_demo' => true, lalu:
 *   php api/tugas/migrasi.php            (TANPA --contoh)
 *   dua akun: admin dan qhse (lihat KG_UJI_AKUN di bawah)
 *   php -S 127.0.0.1:8160 -t <salinan>
 *
 * Jalankan:
 *   node uji/kosong.mjs [alamat]          bawaan http://127.0.0.1:8160
 */

const { chromium } = await import(process.env.KG_PLAYWRIGHT || 'playwright');

const A = process.argv[2] || 'http://127.0.0.1:8160';
const AKUN = (process.env.KG_UJI_AKUN || 'admin@kosong.test,qhse@kosong.test').split(',');
const RUTE = ['exec', 'dashboard', 'ai', 'incident', 'hazard', 'bbs', 'inspection', 'checklist', 'permit', 'jsa',
  'hiradc', 'risk', 'capa', 'audit', 'environment', 'docint', 'docext', 'regulasi', 'induksi', 'training',
  'activity', 'kpi', 'notif', 'settings', 'users'];

const galat = [];
const b = await chromium.launch();
for (const email of AKUN) {
  const j = await (await fetch(A + '/api/v1/sesi/masuk-demo', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
  })).json();
  if (!j.data) { galat.push(`${email}: tidak dapat masuk — ${JSON.stringify(j)}`); continue; }
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(([a, t]) => { window.KG_KONFIG = { api: a }; localStorage.setItem('kg-token', t); }, [A, j.data.token]);
  const p = await ctx.newPage();
  let rute = '';
  p.on('pageerror', (e) => galat.push(`${email} · ${rute} · ${e.message}`));
  for (rute of RUTE) {
    await p.goto(`${A}/#/${rute}`);
    await p.reload();
    await p.waitForFunction(() => (document.querySelector('main') || document.body).innerText.trim().length >= 80,
      null, { timeout: 8000 }).catch(() => {});
    const t = await p.evaluate(() => (document.querySelector('main') || document.body).innerText);
    if (t.trim().length < 80) galat.push(`${email} · ${rute} · layar nyaris kosong (${t.trim().length} aksara)`);
    for (const k of ['NaN', 'Infinity', 'undefined', '[object']) {
      if (t.includes(k)) galat.push(`${email} · ${rute} · tampil "${k}"`);
    }
  }
  await ctx.close();
}
await b.close();

if (galat.length) {
  console.error(`\u001b[31m${galat.length} galat pada basis data kosong:\u001b[0m`);
  galat.forEach((g) => console.error('  · ' + g));
  process.exit(1);
}
console.log(`\u001b[32m${RUTE.length} layar × ${AKUN.length} peran tergambar pada basis data kosong, tanpa NaN, Infinity, atau galat.\u001b[0m`);
