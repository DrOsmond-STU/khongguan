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
  const trenSebelum = await p.evaluate(() => {
    const t = window.KG.trenBahaya || [];
    return t.length ? t[t.length - 1].v : null;
  });

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
  // Papan dan grafik harus bergerak bersama; pernah tidak, karena penyegaran
  // tidak memecah koleksi gabungan. Yang dibandingkan pertambahannya, bukan
  // jumlahnya: grafik menghitung bulan berjalan, daftar memuat semua bulan.
  if (tren !== null && trenSebelum !== null && tren !== trenSebelum + 1) {
    catat('tulis', `grafik tren tidak ikut bertambah (${trenSebelum} -> ${tren})`);
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

/* ── Ubah dan hapus catatan lewat antarmuka ─────────────────────────── */
{
  rute = 'tindakan/ubah+hapus';
  const hdr = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok };
  const api = async (jalur, isi) => (await fetch(`${ALAMAT}/api/v1${jalur}`,
    { method: 'POST', headers: hdr, body: JSON.stringify(isi) })).json();
  const acuan = await (await fetch(`${ALAMAT}/api/v1/acuan`, { headers: hdr })).json();
  const saya = await (await fetch(`${ALAMAT}/api/v1/saya`, { headers: hdr })).json();
  const area = acuan.data.area.find((a) => a.pabrik_id === saya.data.pabrik.id) || acuan.data.area[0];

  // Satu catatan yang masih dapat diubah untuk setiap modul.
  const bh = await api('/bahaya', { area_id: area.id, isi: 'Uji ubah: tutup saluran terbuka' });
  const ins = await api('/insiden', { area_id: area.id, jenis: 'Nearmiss', keparahan: 'Ringan',
    ringkas: 'Uji ubah: hampir terpeleset', waktu: '07:45', kronologi: 'Baris satu.\nBaris dua & "kutip".' });
  const ca = await api('/capa', { judul: 'Uji ubah: pasang rambu', sumber_jenis: 'Insiden',
    sumber_id: ins.data.id, pj_id: saya.data.id, tenggat: '2026-12-31' });
  const js = await api('/jsa', { area_id: area.id, pekerjaan: 'Uji ubah: bersihkan cerobong', jenis: 'Non-rutin',
    langkah: [{ kerja: 'Isolasi', bahaya: 'Panas', kemungkinan: 2, keparahan: 2, kemungkinan_sisa: 1, keparahan_sisa: 1 }] });
  const iz = await api('/izin', { area_id: area.id, jenis: 'panas', judul: 'Uji ubah: las pagar',
    pengawas: 'Pengawas Uji', mulai: '2026-11-02T01:30:00Z', durasi: '4 jam', jsa_id: js.data.id });

  const ctx = await peramban.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(([a, t]) => {
    window.KG_KONFIG = { api: a, versi: '4' };
    try { localStorage.setItem('kg-token', t); } catch (x) {}
  }, [ALAMAT, tok]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => catat('ubah', e.message));
  p.on('console', (m) => { if (m.type() === 'error') catat('ubah konsol', m.text()); });
  const pesan = () => p.evaluate(() => { const t = document.querySelector('.toast'); return t ? t.textContent : ''; });

  await p.goto(`${ALAMAT}/#/hazard`, { waitUntil: 'domcontentloaded' });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);

  // Formulir yang dibuka lalu disimpan tanpa disentuh tidak boleh mengubah
  // apa pun. Ini yang membuktikan setiap isian terisi dengan nilai yang
  // sebenarnya — termasuk jam, tanggal, teks berkutip, dan baris baru.
  for (const [jenis, d] of [['bahaya', bh], ['insiden', ins], ['capa', ca], ['izin', iz], ['jsa', js]]) {
    rute = `tindakan/ubah-tanpa-perubahan/${jenis}`;
    const kunci = await p.evaluate(([j, n]) => window.KGSUMBER.aksiRincian(j, n).map((a) => a.kunci), [jenis, d.data.nomor]);
    if (!kunci.includes('ubah') || !kunci.includes('hapus')) {
      catat('ubah', `${jenis} ${d.data.nomor} tidak menawarkan Ubah dan Hapus (ada: ${kunci.join(', ')})`);
      continue;
    }
    await p.evaluate(([j, n]) => window.KGSUMBER.jalankanAksi(j, n, 'ubah'), [jenis, d.data.nomor]);
    await p.waitForTimeout(300);
    await p.click('[data-submit]');
    await p.waitForTimeout(1500);
    const m = await pesan();
    if (!/Tidak ada yang berubah/.test(m)) catat('ubah', `${jenis}: menyimpan formulir yang tidak disentuh: "${m}"`);
  }

  // Penanggung jawab CAPA dipindahkan lewat pilihan di formulir.
  rute = 'tindakan/ubah/capa-pj';
  await p.evaluate((n) => window.KGSUMBER.jalankanAksi('capa', n, 'ubah'), ca.data.nomor);
  await p.waitForTimeout(300);
  const pjBaru = await p.evaluate((asal) => {
    const s = document.getElementById('e-pj_id');
    if (!s) return null;
    const o = Array.from(s.options).find((x) => x.value !== asal);
    if (o) s.value = o.value;
    return o ? o.value : null;
  }, saya.data.id);
  if (!pjBaru) {
    catat('ubah', 'formulir CAPA tidak menawarkan penanggung jawab lain');
    await p.click('[data-close]');
  } else {
    await p.click('[data-submit]');
    await p.waitForTimeout(1500);
    const pjSesudah = await p.evaluate((n) => ((window.KG.capa || []).find((x) => x.id === n) || {}).pjId, ca.data.nomor);
    if (pjSesudah !== pjBaru) catat('ubah', `penanggung jawab CAPA tidak berpindah (${pjSesudah} ≠ ${pjBaru})`);
  }

  // Jalur lengkap lewat modal rincian: ubah, lalu hapus.
  rute = 'tindakan/ubah+hapus/bahaya';
  await p.click(`[data-detail="bahaya:${bh.data.nomor}"]`);
  await p.waitForTimeout(400);
  await p.click('[data-jalankan="ubah"]');
  await p.waitForTimeout(300);
  await p.fill('#e-isi', 'Uji ubah: saluran terbuka di depan gudang');
  await p.selectOption('#e-risiko', 'Tinggi');
  await p.click('[data-submit]');
  await p.waitForTimeout(1800);
  if (!/Perubahan pada/.test(await pesan())) catat('ubah', `pesan ubah: "${await pesan()}"`);
  const b2 = await p.evaluate((n) => (window.KG.bahaya || []).find((x) => x.id === n), bh.data.nomor);
  if (!b2 || b2.isi !== 'Uji ubah: saluran terbuka di depan gudang' || b2.risiko !== 'Tinggi') {
    catat('ubah', `perubahan tidak tampil di daftar: ${JSON.stringify(b2 && { isi: b2.isi, risiko: b2.risiko })}`);
  }

  await p.click(`[data-detail="bahaya:${bh.data.nomor}"]`);
  await p.waitForTimeout(400);
  await p.click('[data-jalankan="hapus"]');
  await p.waitForTimeout(300);
  if (!(await p.$('[data-submit].btn--danger'))) catat('ubah', 'tombol konfirmasi hapus tidak bergaya bahaya');
  await p.fill('#e-alasan', 'Uji layar: catatan percobaan');
  await p.click('[data-submit]');
  await p.waitForTimeout(1800);
  if (!/dihapus/.test(await pesan())) catat('ubah', `pesan hapus: "${await pesan()}"`);
  if (await p.evaluate((n) => (window.KG.bahaya || []).some((x) => x.id === n), bh.data.nomor)) {
    catat('ubah', `${bh.data.nomor} masih di daftar setelah dihapus`);
  }
  await ctx.close();

  // Bersih-bersih: catatan percobaan lain tidak tertinggal di daftar.
  await api(`/izin/${iz.data.id}/hapus`, { alasan: 'Uji layar: catatan percobaan' });
  await api(`/jsa/${js.data.id}/hapus`, { alasan: 'Uji layar: catatan percobaan' });
  await api(`/capa/${ca.data.id}/hapus`, { alasan: 'Uji layar: catatan percobaan' });
  await api(`/insiden/${ins.data.id}/hapus`, { alasan: 'Uji layar: catatan percobaan' });
}

/* ── Formulir tambah tersambung: yang disimpan adalah yang diketik ──── */
{
  rute = 'tambah/lengkap';
  const hdr = { Authorization: 'Bearer ' + tok };
  const ctx = await peramban.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(([a, t]) => {
    window.KG_KONFIG = { api: a, versi: '4' };
    try { localStorage.setItem('kg-token', t); } catch (x) {}
  }, [ALAMAT, tok]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => catat('tambah', e.message));
  p.on('console', (m) => { if (m.type() === 'error') catat('tambah konsol', m.text()); });
  const pesan = () => p.evaluate(() => { const t = document.querySelector('.toast'); return t ? t.textContent : ''; });
  const tanda = 'Uji-' + Date.now().toString(36);

  const kasus = [
    ['bbs', 'observasi-apd', async () => {
      await p.fill('#e-diamati', '10'); await p.fill('#e-patuh', '7');
      await p.fill('[data-apd] >> nth=0', '9');
      await p.fill('#e-catatan', tanda + ' APD');
    }, async () => {
      const r = (await (await fetch(`${ALAMAT}/api/v1/observasi-apd`, { headers: hdr })).json()).data
        .find((x) => x.catatan === tanda + ' APD');
      return r && Number(r.patuh) === 7 && Number(r.diamati) === 10 && r.rincian.length === 1
        ? '' : 'observasi APD tidak tersimpan dengan patuh 7 dari 10: ' + JSON.stringify(r);
    }],
    ['permit', 'izin-baru', async () => {
      await p.fill('#e-judul', tanda + ' izin');
      await p.selectOption('#e-area_id', { index: 2 });
      await p.fill('#e-pengawas', 'Pengawas Uji Layar');
    }, async () => {
      const r = (await (await fetch(`${ALAMAT}/api/v1/izin`, { headers: hdr })).json()).data.find((x) => x.judul === tanda + ' izin');
      const area = await p.evaluate(() => null);
      return r && r.pengawas === 'Pengawas Uji Layar' && r.mulai ? '' : 'izin tidak membawa pengawas/mulai: ' + JSON.stringify(r);
    }],
    ['hiradc', 'hiradc-baru', async () => {
      await p.fill('#e-proses', tanda + ' hiradc'); await p.fill('#e-aktivitas', 'Pembersihan');
      await p.fill('#e-bahaya', 'Terjepit'); await p.fill('#e-risiko', 'Luka tangan'); await p.fill('#e-korban', 'Operator');
      await p.selectOption('#e-kemungkinan', '4'); await p.selectOption('#e-keparahan', '2');
    }, async () => {
      const r = (await (await fetch(`${ALAMAT}/api/v1/hiradc`, { headers: hdr })).json()).data.find((x) => x.proses === tanda + ' hiradc');
      return r && Number(r.skor_awal) === 8 && r.korban === 'Operator' ? '' : 'HIRADC tidak berskor 4×2: ' + JSON.stringify(r);
    }],
    ['risk', 'risiko-baru', async () => {
      await p.fill('#e-proses', tanda + ' risiko'); await p.fill('#e-ancaman', 'Kebocoran');
      await p.fill('#e-penyebab', 'Seal aus'); await p.fill('#e-dampak', 'Produksi berhenti');
      await p.fill('#e-mitigasi', 'Ganti seal berkala');
    }, async () => {
      const r = (await (await fetch(`${ALAMAT}/api/v1/risiko`, { headers: hdr })).json()).data.find((x) => x.proses === tanda + ' risiko');
      return r && r.dampak === 'Produksi berhenti' && r.mitigasi === 'Ganti seal berkala' ? '' : 'risiko tidak membawa dampak/mitigasi: ' + JSON.stringify(r);
    }],
    ['regulasi', 'regulasi-baru', async () => {
      await p.fill('#e-nomor', tanda + ' reg'); await p.fill('#e-judul', 'Judul uji');
      await p.fill('#e-penerbit', 'Kemnaker'); await p.fill('#e-pasal', 'Pasal 1'); await p.fill('#e-penerapan', 'Diterapkan');
    }, async () => {
      const r = (await (await fetch(`${ALAMAT}/api/v1/regulasi`, { headers: hdr })).json()).data.find((x) => x.nomor === tanda + ' reg');
      return r && r.penerbit === 'Kemnaker' ? '' : 'regulasi tidak membawa penerbit: ' + JSON.stringify(r);
    }],
    ['jsa', 'jsa-baru', async () => {
      await p.fill('#e-pekerjaan', tanda + ' jsa');
      await p.fill('[data-langkah] >> nth=0 >> [data-l="kerja"]', 'Isolasi energi');
      await p.fill('[data-langkah] >> nth=0 >> [data-l="bahaya"]', 'Tersengat listrik');
      await p.selectOption('[data-langkah] >> nth=0 >> [data-l="kemungkinan"]', '3');
      await p.selectOption('[data-langkah] >> nth=0 >> [data-l="keparahan"]', '4');
      await p.click('[data-tambah-langkah]');
      await p.fill('[data-langkah] >> nth=1 >> [data-l="kerja"]', 'Ganti sabuk');
      await p.fill('[data-langkah] >> nth=1 >> [data-l="bahaya"]', 'Terjepit');
    }, async () => {
      const r = (await (await fetch(`${ALAMAT}/api/v1/jsa`, { headers: hdr })).json()).data.find((x) => x.pekerjaan === tanda + ' jsa');
      return r && r.langkah.length === 2 && Number(r.langkah[0].kemungkinan) === 3 && r.langkah[0].kerja === 'Isolasi energi'
        ? '' : 'JSA tidak membawa dua langkah yang diketik: ' + JSON.stringify(r && r.langkah);
    }],
  ];

  for (const [layar, aksi, isi, periksa] of kasus) {
    rute = `tambah/${aksi}`;
    await p.goto(`${ALAMAT}/#/${layar}`, { waitUntil: 'domcontentloaded' });
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1500);
    await p.click(`[data-act="${aksi}"]`);
    await p.waitForTimeout(300);
    try { await isi(); } catch (e) { catat('tambah', `${aksi}: formulir tidak dapat diisi — ${e.message.split('\n')[0]}`); continue; }
    await p.click('[data-submit]');
    await p.waitForTimeout(1800);
    const m = await pesan();
    if (!/Tersimpan\. Nomor/.test(m)) { catat('tambah', `${aksi}: "${m}"`); continue; }
    const salah = await periksa();
    if (salah) catat('tambah', `${aksi}: ${salah}`);
  }

  // Formulir yang belum punya jalur simpan tidak boleh berkata "tersimpan".
  rute = 'tambah/tanpa-jalur';
  await p.goto(`${ALAMAT}/#/docext`, { waitUntil: 'domcontentloaded' });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const tombolTanpaJalur = await p.$('[data-act="compliance-baru"]');
  if (tombolTanpaJalur) {
    await tombolTanpaJalur.click(); await p.waitForTimeout(300);
    await p.click('[data-submit]'); await p.waitForTimeout(800);
    const m = await pesan();
    if (/terdaftar dan mulai dipantau|CMP-013/.test(m)) catat('tambah', `formulir tanpa jalur berpura-pura tersimpan: "${m}"`);
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
  + ` lewat formulir, satu diverifikasi, lima formulir ubah terisi utuh, satu catatan diubah lalu`
  + ` dihapus, satu berkas ekspor diunduh, satu akun diundang lalu`
  + ` menyetel sandinya, dan kode di dalam laporan tidak dijalankan — tanpa galat.\u001b[0m`);
