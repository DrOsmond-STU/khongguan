/* KG SafeGuard — purwarupa aplikasi QHSE Khong Guan Group.
   Vanilla JS, tanpa build step. Perutean lewat hash. */

(function () {
  'use strict';
  const D = window.KG;

  /* ───────── Ikon ───────── */
  const I = (p, size) => `<svg width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const icon = {
    dashboard: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    incident: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    hazard: '<path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10Z"/><circle cx="12" cy="11" r="2.5"/>',
    inspection: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/>',
    permit: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6"/><path d="m9 15 2 2 4-4"/>',
    capa: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    audit: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/><path d="m8.6 11 1.8 1.8 3.4-3.6"/>',
    environment: '<path d="M12 21c4.5-2 7-5.5 7-10V6l-7-3-7 3v5c0 4.5 2.5 8 7 10Z"/><path d="M12 8v8"/>',
    kpi: '<path d="M3 21h18"/><path d="M5.5 21V13"/><path d="M10.5 21V9"/><path d="M15.5 21v-6"/><path d="M20.5 21V5"/>',
    activity: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.8"/><path d="m4 18 5-4.2 3.6 2.8L17 11l3 3.2"/>',
    shield: '<path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8.6 7.5 10 4.4-1.4 7.5-5.4 7.5-10v-6L12 2.5Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    up: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    down: '<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>',
    flat: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    download: '<path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6"/><path d="M18 20c0-2.2-.9-4.2-2.3-5.6"/>',
    training: '<path d="M2.5 8.5 12 4.5l9.5 4-9.5 4-9.5-4Z"/><path d="M6.5 10.5v5c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-5"/><path d="M21 9v5.5"/>',
    risk: '<path d="M12 3.5 3 19h18L12 3.5Z"/><path d="M12 10v4.5"/><path d="M12 17.2h.01"/><path d="M8.5 15.5h7"/>',
    docint: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M8 13h8"/>',
    docext: '<circle cx="12" cy="9.5" r="5"/><path d="m8.6 13.8-1.4 6L12 17.6l4.8 2.2-1.4-6"/><path d="m10 9.5 1.5 1.5 2.7-2.8"/>',
    checklist: '<path d="M8 5h11M8 12h11M8 19h11"/><path d="m3 5 1.4 1.4L7 3.8"/><path d="m3 12 1.4 1.4L7 10.8"/><path d="m3 19 1.4 1.4L7 17.8"/>',
    bbs: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    exec: '<path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5"/><rect x="2.5" y="6.5" width="19" height="13" rx="2"/><path d="M2.5 12h19"/>',
    notif: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>',
    ai: '<path d="M12 3.2 13.5 8 18 9.5 13.5 11 12 15.8 10.5 11 6 9.5 10.5 8 12 3.2Z"/><path d="M18.5 15.2l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/><path d="M5.5 14.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L3.5 16.5l1.5-.5.5-1.5Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.7-4.7"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>'
  };

  /* ───────── Pemetaan warna ───────── */
  const T = {
    status: { 'Terbuka': 'info', 'Dalam Proses': 'medium', 'Menunggu Verifikasi': 'high',
              'Selesai': 'low', 'Ditolak': 'critical', 'Aktif': 'low', 'Menunggu QHSE': 'high',
              'Menunggu Supervisor': 'high', 'Diverifikasi': 'medium', 'Ditangani': 'low' },
    parah: { 'Katastropik': 'critical', 'Mayor': 'critical', 'Serius': 'high',
             'Sedang': 'medium', 'Ringan': 'low' },
    jenis: { 'Nearmiss': 'info', 'Incident': 'medium', 'Accident': 'critical' },
    risiko: { 'Tinggi': 'high', 'Sedang': 'medium', 'Rendah': 'low' },
    temuan: { 'Major': 'critical', 'Minor': 'high', 'Observasi': 'info', 'Peluang Perbaikan': 'low' }
  };
  const zone = (n) => n >= 15 ? 'critical' : n >= 10 ? 'high' : n >= 5 ? 'medium' : 'low';
  const chip = (txt, kind, dot) =>
    `<span class="chip chip--${kind || 'neutral'}">${dot ? '<span class="dot"></span>' : ''}${txt}</span>`;

  /* ───────── Navigasi ───────── */
  const NAV = [
    { group: null, items: [
      { id: 'exec', label: 'Dashboard Eksekutif', icon: 'exec', modul: 17 },
      { id: 'dashboard', label: 'Dashboard & Laporan', icon: 'dashboard', modul: 7 },
      { id: 'ai', label: 'Asisten QHSE', icon: 'ai', modul: 21 }
    ] },
    { group: 'KEJADIAN & BAHAYA', items: [
      { id: 'incident', label: 'Incident & Nearmiss', icon: 'incident', modul: 1, count: 4 },
      { id: 'hazard', label: 'Laporan Bahaya K3L', icon: 'hazard', modul: 4, count: 2 },
      { id: 'bbs', label: 'Observasi Perilaku', icon: 'bbs', modul: 16 }
    ] },
    { group: 'PENGENDALIAN', items: [
      { id: 'inspection', label: 'Inspection', icon: 'inspection', modul: 2 },
      { id: 'checklist', label: 'Safety Checklist', icon: 'checklist', modul: 15 },
      { id: 'permit', label: 'Work Permit & JSEA', icon: 'permit', modul: 3 },
      { id: 'risk', label: 'Manajemen Risiko', icon: 'risk', modul: 12 },
      { id: 'capa', label: 'CAPA', icon: 'capa', modul: 10, count: 2 }
    ] },
    { group: 'KEPATUHAN', items: [
      { id: 'audit', label: 'Audit', icon: 'audit', modul: 5 },
      { id: 'environment', label: 'Environment', icon: 'environment', modul: 6 },
      { id: 'docint', label: 'Dokumen Internal', icon: 'docint', modul: 13 },
      { id: 'docext', label: 'Dokumen Eksternal', icon: 'docext', modul: 14, count: 2 }
    ] },
    { group: 'PENGEMBANGAN', items: [
      { id: 'training', label: 'Manajemen Pelatihan', icon: 'training', modul: 11 },
      { id: 'activity', label: 'SHE Activity', icon: 'activity', modul: 9 },
      { id: 'kpi', label: 'SHE KPI & Analytics', icon: 'kpi', modul: 8 }
    ] },
    { group: 'ADMINISTRASI', items: [
      { id: 'notif', label: 'Notifikasi', icon: 'notif', modul: 18, count: 3 },
      { id: 'settings', label: 'Pengaturan', icon: 'settings', modul: 19 },
      { id: 'users', label: 'User Management', icon: 'people', modul: 20 }
    ] }
  ];
  const ALL = NAV.flatMap(g => g.items);

  /* ───────── Grafik garis ───────── */
  function lineChart(series, opts) {
    const o = Object.assign({ target: null, targetLabel: '', w: 680, h: 190, pad: 46 }, opts || {});
    const vals = series.map(p => p.v);
    const max = Math.max(...vals, o.target || 0) * 1.15;
    const x = i => o.pad + i * ((o.w - o.pad - 16) / (series.length - 1));
    const y = v => 160 - (v / max) * 144;
    const pts = series.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
    const fmt = v => max < 10 ? Number(v).toFixed(2).replace('.', ',') : String(Math.round(v));
    const ticks = [0, .25, .5, .75, 1].map(f => max * f);
    const peak = vals.indexOf(Math.max(...vals));
    const last = series.length - 1;
    const tY = o.target != null ? y(o.target) : null;
    return `<svg viewBox="0 0 ${o.w} ${o.h}" width="100%" role="img" aria-label="${o.aria || ''}">
      <g stroke="var(--border-100)" stroke-width="1">
        ${ticks.map(t => `<line x1="${o.pad}" y1="${y(t).toFixed(1)}" x2="${o.w - 16}" y2="${y(t).toFixed(1)}"/>`).join('')}
      </g>
      <g text-anchor="end" font-family="var(--font-mono)" font-size="10" fill="var(--ink-500)">
        ${ticks.map(t => `<text x="${o.pad - 8}" y="${(y(t) + 4).toFixed(1)}">${fmt(t)}</text>`).join('')}
      </g>
      ${tY != null ? `<line x1="${o.pad}" y1="${tY.toFixed(1)}" x2="${o.w - 16}" y2="${tY.toFixed(1)}"
        stroke="var(--signal-high)" stroke-width="1.5" stroke-dasharray="5 4"/>
        <text x="${o.pad + 6}" y="${(tY - 6).toFixed(1)}" text-anchor="start" font-family="var(--font-mono)"
          font-size="10" fill="var(--signal-high)">${o.targetLabel}</text>` : ''}
      <polygon points="${pts} ${x(last).toFixed(1)},160 ${o.pad},160" fill="var(--brand-500)" opacity="var(--opacity-chart-fill)"/>
      <polyline points="${pts}" fill="none" stroke="var(--brand-500)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(peak).toFixed(1)}" cy="${y(vals[peak]).toFixed(1)}" r="4" fill="var(--surface-000)" stroke="var(--signal-critical)" stroke-width="2.5"/>
      <circle cx="${x(last).toFixed(1)}" cy="${y(vals[last]).toFixed(1)}" r="5" fill="var(--brand-700)"/>
      <text x="${x(peak).toFixed(1)}" y="${(y(vals[peak]) - 10).toFixed(1)}" text-anchor="middle"
        font-family="var(--font-mono)" font-size="10" fill="var(--signal-critical)">${fmt(vals[peak])}</text>
      <text x="${(x(last) - 8).toFixed(1)}" y="${(y(vals[last]) - 8).toFixed(1)}" text-anchor="end"
        font-family="var(--font-mono)" font-size="10" fill="var(--brand-700)">${fmt(vals[last])}</text>
      <g text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="var(--ink-500)">
        ${series.map((p, i) => `<text x="${x(i).toFixed(1)}" y="180">${p.bln}</text>`).join('')}
      </g>
    </svg>`;
  }

  /* ───────── Rincian sekali klik ─────────
     Setiap baris tabel, kartu daftar, dan ubin ringkasan mendaftarkan isinya di sini
     saat dirender. Kunci dibangun ulang setiap render, jadi tidak pernah basi. */
  let INFO = Object.create(null);
  let infoSeq = 0;
  function resetInfo() { INFO = Object.create(null); infoSeq = 0; }
  function regInfo(o) { const k = 'i' + (++infoSeq); INFO[k] = o; return k; }
  /* Dipakai di dalam template: `<tr ${infoAttr({...})}>` */
  function infoAttr(o) {
    const label = String(o.title || 'data').replace(/<[^>]*>/g, '').replace(/"/g, '&quot;');
    return `data-info="${regInfo(o)}" tabindex="0" role="button" aria-label="Lihat rincian ${label}"`;
  }

  const kv = (rows) => `<dl class="kv">${rows.filter(Boolean)
    .map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl>`;
  const chipRow = (arr) => `<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5)">${
    arr.filter(Boolean).join('')}</div>`;
  const lead = (s) => `<h3 style="font-size:17px;color:var(--ink-900);margin:0 0 var(--space-4)">${s}</h3>`;
  const foot = (s) => `<div class="tile-note" style="margin-top:var(--space-5)">${s}</div>`;
  /* Rincian angka sebagai batang: [label, nilai, total, warna sinyal] */
  const bars = (rows) => `<div class="info-bars">${rows.map(([t, v, total, sig]) => `
    <div class="info-bar-row">
      <span class="t">${t}</span><span class="n">${v}</span>
      <span class="info-bar"><span style="width:${total ? Math.round(v / total * 100) : 0}%;background:var(--signal-${sig || 'info'})"></span></span>
    </div>`).join('')}</div>`;

  /* ───────── Kiriman dari aplikasi lapangan ─────────
     Laporan yang dikirim petugas lewat /m/ masuk ke antrean bersama di
     lapangan.js. Modul yang bersangkutan menampilkannya di paling atas, ditandai
     apa adanya: yang masih Antre belum pernah sampai ke server mana pun. */

  const LAPANGAN_MODUL = {
    bahaya: { judul: 'Laporan Bahaya dari Lapangan', ikon: 'hazard' },
    insiden: { judul: 'Laporan Insiden dari Lapangan', ikon: 'incident' },
    observasi: { judul: 'Observasi dari Lapangan', ikon: 'bbs' }
  };

  function lapanganSeksi(jenis) {
    if (!window.KGLAP) return '';
    const list = KGLAP.daftar(jenis);
    if (!list.length) return '';
    const m = LAPANGAN_MODUL[jenis];
    const antre = list.filter(function (r) { return r.status === 'Antre'; }).length;

    return `
      <section class="section">
        <div class="section-head">
          <h2>${m.judul}</h2>
          <span class="sub">${list.length} kiriman${antre ? ' · ' + antre + ' masih di antrean perangkat' : ''}</span>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Nomor</th><th>Keterangan</th><th>Area</th><th>Pelapor</th><th>Waktu</th><th>Status</th></tr></thead>
          <tbody>${list.map(function (r) {
            return `<tr data-detail="lapangan:${r.id}" tabindex="0" role="button">
              <td class="mono mono--id">${r.id}</td>
              <td>${KGAI.esc(r.isi)}${r.foto ? ' ' + chip('FOTO', 'info') : ''}</td>
              <td>${KGAI.esc(r.lokasi)}</td>
              <td>${KGAI.esc(r.pelapor)}</td>
              <td class="mono">${KGAI.esc(r.waktuTampil || '')}</td>
              <td>${chip(r.status.toUpperCase(), r.status === 'Antre' ? 'medium' : 'low', true)}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
        <div class="tile-note" style="margin-top:var(--space-4)">Kiriman ini datang dari aplikasi lapangan pada perangkat yang sama. Nomornya berawalan berbeda (${KGLAP.nomorBerikut(jenis).split('-').slice(0, 2).join('-')}) supaya tidak pernah tertukar dengan catatan yang sudah diverifikasi petugas QHSE.</div>
      </section>`;
  }

  /* ───────── Potongan yang dipakai ulang ───────── */
  const tile = (t) => `
    <article class="card tile is-clickable" ${infoAttr({
      title: t.label,
      sub: t.sub || `${D.plant} · ${D.periode}`,
      body: `
        <div class="info-num">${t.value}${t.unit ? `<span class="tile-unit">${t.unit}</span>` : ''}</div>
        <div class="tile-trend ${t.arah || 'flat'}" style="margin-bottom:var(--space-5)">${t.delta}</div>
        ${kv([
          ['Angka', `${t.value}${t.unit ? ' ' + t.unit : ''}`],
          ['Perubahan', t.delta],
          ['Cakupan', t.note],
          t.rumus && ['Rumus', t.rumus],
          t.sumber && ['Sumber data', t.sumber],
          ['Periode', t.periode || `${D.periode} · ${D.plant}`]
        ])}
        ${t.rincian ? `<div class="label-caps" style="margin:var(--space-5) 0 var(--space-2)">RINCIAN</div>${t.rincian}` : ''}
        ${t.catatan ? foot(t.catatan) : ''}`
    })}>
      <div class="tile-head">
        <span class="label-caps">${t.label}</span>
        <span class="tile-icon">${I(icon[t.icon || 'kpi'], 18)}</span>
      </div>
      <div class="tile-num${t.big ? ' big' : ''}">${t.value}${t.unit ? `<span class="tile-unit">${t.unit}</span>` : ''}</div>
      <span class="tile-trend ${t.arah || 'flat'}">${
        /\bvs\b/.test(t.delta) && t.arah === 'good' ? I(icon.up, 12)
        : /\bvs\b/.test(t.delta) && t.arah === 'bad' ? I(icon.down, 12) : ''}${t.delta}</span>
      <div class="tile-note">${t.note}</div>
    </article>`;

  const hero = (o) => `
    <header class="hero">
      <div class="hero-row">
        <div>
          <div class="hero-eyebrow">${o.eyebrow}</div>
          <h1>${o.title}</h1>
          <p>${o.desc}</p>
        </div>
        ${o.metric ? `<div class="hero-metric"><div class="num">${o.metric}</div>
          <div class="lbl">${o.metricLabel}</div></div>` : ''}
        ${o.action ? `<div><button class="btn btn--hero" data-act="${o.action.act}">${I(icon[o.action.icon], 18)}${o.action.label}</button></div>` : ''}
      </div>
    </header>`;

  const filters = (list, active) => list.map((f, i) =>
    `<button class="pill" data-filter="${f}" aria-pressed="${f === active}">${f}</button>`).join('');

  /* ───────── Modul 7 · Dashboard ───────── */
  function viewDashboard() {
    const t = [
      { label: 'TOTAL INSIDEN', value: '3', icon: 'incident', arah: 'good', delta: '2 vs Agustus',
        note: 'September 2026 · 1 accident, 2 nearmiss',
        sumber: 'Modul Incident, Nearmiss & Accident — hanya yang berstatus Terverifikasi',
        rumus: 'Jumlah kejadian tercatat pada bulan berjalan',
        rincian: bars([['Accident', 1, 3, 'critical'], ['Incident', 0, 3, 'medium'], ['Nearmiss', 2, 3, 'info']]),
        catatan: 'Angka turun bukan selalu kabar baik. Bacalah bersama jumlah laporan bahaya: insiden turun sementara laporan bahaya juga turun biasanya berarti pelaporan yang melemah, bukan pabrik yang membaik.' },
      { label: 'SAFE MANHOURS', value: '1.284.560', big: true, icon: 'clock', arah: 'good',
        delta: '238 hari tanpa LTI', note: 'Jam kerja sejak LTI terakhir · Lagging',
        sumber: 'Absensi produksi × jam kerja efektif, dihitung sejak LTI terakhir',
        rumus: 'Σ (jumlah pekerja × jam kerja) sejak kecelakaan hilang waktu kerja terakhir',
        catatan: 'Angka ini kembali ke nol pada kecelakaan hilang waktu kerja berikutnya. Karena itu ia tidak pernah dipakai sendirian sebagai ukuran keberhasilan program.' },
      { label: 'TEMUAN TERBUKA', value: '14', icon: 'inspection', arah: 'bad', delta: '3 vs Agustus',
        note: 'Inspeksi 10 · audit 4 · lintas modul',
        sumber: 'Modul Inspection dan Audit — temuan yang belum ditutup',
        rumus: 'Temuan inspeksi belum ditutup + temuan audit belum ditutup',
        rincian: bars([['Temuan inspeksi', 10, 14, 'medium'], ['Temuan audit', 4, 14, 'high']]),
        catatan: 'Setiap temuan Major dan Minor wajib punya CAPA dengan tenggat. Temuan tanpa CAPA adalah temuan audit berikutnya yang sedang menunggu.' },
      { label: 'CAPA JATUH TEMPO', value: '6', icon: 'capa', arah: 'bad', delta: '2 lewat tenggat',
        note: 'Selesai tepat waktu 82% · target ≥ 90%',
        sumber: 'Modul CAPA — status Terbuka dan Dalam Proses yang tenggatnya ≤ 7 hari',
        rumus: 'Jumlah CAPA belum selesai dengan tenggat dalam 7 hari ke depan',
        rincian: bars([['Lewat tenggat', 2, 6, 'critical'], ['Jatuh tempo ≤ 7 hari', 4, 6, 'high']]),
        catatan: 'Penuaan dihitung dari tanggal terbit, bukan tanggal tenggat. Modul CAPA adalah tempat sistem QHSE paling sering gagal dalam praktik, jadi item macet sengaja dibuat tidak bisa tidak terlihat.' }
    ];
    return hero({
      eyebrow: `${D.plant.toUpperCase()} · ${D.periode.toUpperCase()}`,
      title: 'Kondisi QHSE hari ini',
      desc: 'Ringkasan lintas sepuluh modul. Item yang menuntut tindakan hari ini muncul di kolom Perhatian Segera, tanpa perlu membuka laporan satu per satu.',
      metric: '238', metricLabel: 'HARI TANPA KECELAKAAN HILANG WAKTU KERJA'
    }) + `
    <div class="page">
      <div class="grid grid--4">${t.map(tile).join('')}</div>

      <section class="section">
        <div class="card">
          <h3>Tren Insiden 12 Bulan</h3>
          <div class="card-sub">${D.plant} · Okt 2025 – Sep 2026 · target internal ≤ 4 kejadian per bulan</div>
          ${lineChart(D.trenInsiden, { target: 4, targetLabel: 'target 4',
            aria: 'Grafik garis jumlah insiden per bulan, puncak 9 pada Januari, turun ke 3 pada September.' })}
        </div>
      </section>

      <section class="section grid grid--2">
        <div class="card">
          <h3>Aktivitas Terbaru</h3>
          <div class="card-sub">Lintas modul, 7 hari terakhir</div>
          <div class="feed">
            ${D.aktivitas.map(a => `
              <div class="feed-item is-clickable" ${infoAttr({
                title: a.judul,
                sub: `Aktivitas lintas modul · ${a.when}`,
                body: chipRow([chip(({ critical: 'KRITIS', high: 'TINGGI', medium: 'SEDANG', low: 'RINGAN', info: 'INFORMASI' })[a.jenis] || a.jenis.toUpperCase(), a.jenis)])
                  + lead(a.judul) + kv([
                    ['Rincian', a.meta],
                    ['Waktu', a.when],
                    ['Tingkat', ({ critical: 'Kritis', high: 'Tinggi', medium: 'Sedang', low: 'Ringan', info: 'Informasi' })[a.jenis] || a.jenis]
                  ]) + foot('Aktivitas Terbaru menampilkan tujuh hari terakhir dari seluruh modul, tanpa perlu membuka laporan satu per satu.')
              })}>
                <span class="feed-icon chip--${a.jenis}">${I(icon.incident, 16)}</span>
                <span>
                  <span class="feed-title">${a.judul}</span>
                  <span class="feed-meta">${a.meta}</span>
                </span>
                <span class="feed-when">${a.when}</span>
              </div>`).join('')}
          </div>
        </div>
        <div class="card">
          <h3>Perhatian Segera</h3>
          <div class="card-sub">Item kritis dan tinggi dari seluruh modul</div>
          <div class="feed">
            ${D.perhatian.map(p => `
              <div class="feed-item is-clickable" ${infoAttr({
                title: p.judul,
                sub: 'Perhatian Segera · lintas modul',
                body: chipRow([chip(p.label, p.chip)]) + lead(p.judul) + kv([
                  ['Rincian', p.meta],
                  ['Tingkat', p.chip === 'critical' ? 'Kritis — menuntut tindakan hari ini' : p.chip === 'high' ? 'Tinggi' : 'Sedang']
                ]) + foot('Kolom ini hanya memuat item kritis dan tinggi dari seluruh modul. Perubahan status biasa tidak muncul di sini.')
              })}>
                <span>
                  ${chip(p.label, p.chip)}
                  <span class="feed-title" style="margin-top:6px">${p.judul}</span>
                  <span class="feed-meta">${p.meta}</span>
                </span>
              </div>`).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Laporan siap cetak</h2>
          <span class="sub">Dibangun dari data yang sama, kop memakai lambang korporat Khong Guan</span>
        </div>
        <div class="grid grid--4">
          ${['Laporan Bulanan QHSE', 'Rekap Insiden Triwulan', 'Laporan Lingkungan Triwulan', 'Laporan SMK3 Tahunan']
            .map(n => `<button class="card" data-act="unduh" style="text-align:left;cursor:pointer;font-family:var(--font-body)">
              <span class="tile-icon" style="margin-bottom:10px">${I(icon.download, 18)}</span>
              <div style="font-size:15px;font-weight:600;color:var(--ink-900);line-height:21px">${n}</div>
              <div style="font-size:12px;color:var(--ink-500);margin-top:4px">PDF · ${D.periode}</div>
            </button>`).join('')}
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 1 · Insiden ───────── */
  let incFilter = 'Semua Jenis';
  function viewIncident() {
    const rows = D.insiden.filter(r =>
      incFilter === 'Semua Jenis' ? true :
      incFilter === 'Belum Selesai' ? r.status !== 'Selesai' : r.jenis === incFilter);
    return hero({
      eyebrow: 'MODUL 01 · INCIDENT, NEARMISS & ACCIDENT',
      title: 'Kejadian & Investigasi',
      desc: 'Setiap kejadian dicatat, diklasifikasi, diinvestigasi sampai akar masalahnya, lalu melahirkan satu CAPA. Nearmiss diperlakukan sama seriusnya dengan accident.',
      action: { act: 'lapor-insiden', icon: 'incident', label: 'Lapor Insiden' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'BULAN INI', value: '3', icon: 'incident', arah: 'good', delta: '2 vs Agustus', note: '1 accident · 2 nearmiss' })}
        ${tile({ label: 'BELUM SELESAI', value: '4', icon: 'clock', arah: 'bad', delta: '1 lewat tenggat', note: 'Tertua: INC-2026-0313, 17 hari' })}
        ${tile({ label: 'HARI KERJA HILANG', value: '9', unit: 'hari', icon: 'people', arah: 'bad', delta: '4 vs Agustus', note: 'Akumulasi 2026: 27 hari' })}
        ${tile({ label: 'RASIO NEARMISS', value: '3,2', unit: ':1', icon: 'kpi', arah: 'good', delta: '0,8 vs Agustus', note: 'Nearmiss per accident · makin tinggi makin baik' })}
      </div>
      ${lapanganSeksi('insiden')}

      <section class="section panel">
        <div class="panel-bar">
          <h2>Daftar Laporan Insiden</h2>
          ${filters(['Semua Jenis', 'Nearmiss', 'Incident', 'Accident', 'Belum Selesai'], incFilter)}
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>NO. LAPORAN</th><th>JENIS</th><th>KEPARAHAN</th><th>LOKASI</th>
              <th>TANGGAL</th><th>PELAPOR</th><th>STATUS</th><th>CAPA</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(r => `
                <tr data-detail="insiden:${r.id}" tabindex="0" role="button" class="${r.terlambat ? 'is-overdue' : ''}">
                  <td class="mono mono--id">${r.id}</td>
                  <td>${chip(r.jenis.toUpperCase(), T.jenis[r.jenis])}</td>
                  <td>${chip(r.keparahan.toUpperCase(), T.parah[r.keparahan])}</td>
                  <td>${r.lokasi}</td>
                  <td class="mono mono--muted">${r.tanggal}</td>
                  <td>${r.anonim ? chip('ANONIM', 'neutral') : r.pelapor}</td>
                  <td>${chip(r.status.toUpperCase(), T.status[r.status], true)}</td>
                  <td class="mono mono--muted">${r.capa}</td>
                </tr>`).join('')
                : '<tr><td colspan="8" class="empty">Tidak ada laporan yang cocok dengan filter ini.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 2 · Inspeksi ───────── */
  function viewInspection() {
    const c = D.checklistAPAR;
    const ts = c.filter(x => x.jawab === 'Tidak Sesuai');
    return hero({
      eyebrow: 'MODUL 02 · INSPECTION',
      title: 'Inspeksi K3 & Lingkungan',
      desc: 'Checklist digital menggantikan kertas. Jawaban "Tidak Sesuai" langsung membuka isian temuan lengkap dengan foto, tingkat risiko, penanggung jawab, dan tenggat — dan temuan itu menjadi CAPA.',
      action: { act: 'inspeksi-baru', icon: 'inspection', label: 'Mulai Inspeksi' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'TERJADWAL BULAN INI', value: '37', icon: 'inspection', arah: 'flat', delta: 'sama dengan Agustus', note: '8 jenis inspeksi · mingguan & bulanan' })}
        ${tile({ label: 'PENYELESAIAN', value: '92', unit: '%', icon: 'kpi', arah: 'good', delta: '5% vs Agustus', note: 'Selesai 34 dari 37 · target ≥ 95% · Leading' })}
        ${tile({ label: 'TEMUAN TERBUKA', value: '10', icon: 'incident', arah: 'bad', delta: '2 vs Agustus', note: 'Semua sudah menjadi CAPA bernomor' })}
        ${tile({ label: 'RATA-RATA PENUTUPAN', value: '6,4', unit: 'hari', icon: 'clock', arah: 'good', delta: '1,2 hari vs Agustus', note: 'Dari temuan terbit sampai diverifikasi' })}
      </div>

      <section class="section panel">
        <div class="panel-bar"><h2>Jadwal & Riwayat Inspeksi</h2>
          <button class="pill" aria-pressed="true">Semua</button>
          <button class="pill" aria-pressed="false">Belum Selesai</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>NO.</th><th>JENIS INSPEKSI</th><th>AREA</th><th>JADWAL</th>
              <th>KEMAJUAN</th><th>TEMUAN</th><th>PETUGAS</th><th>STATUS</th></tr></thead>
            <tbody>
              ${D.inspeksi.map(r => {
                const pct = Math.round(r.selesai / r.butir * 100);
                return `<tr data-detail="inspeksi:${r.id}" tabindex="0" role="button">
                  <td class="mono mono--id">${r.id}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${r.jenis}</td>
                  <td>${r.area}</td>
                  <td class="mono mono--muted">${r.jadwal}</td>
                  <td style="min-width:140px">
                    <div class="bar ${pct === 100 ? 'bar--low' : pct === 0 ? 'bar--critical' : 'bar--medium'}"><span style="width:${pct}%"></span></div>
                    <span class="mono mono--muted" style="font-size:11px">${r.selesai}/${r.butir} butir</span>
                  </td>
                  <td>${r.temuan ? chip(r.temuan + ' TEMUAN', r.temuan > 2 ? 'high' : 'medium') : chip('BERSIH', 'low')}</td>
                  <td>${r.petugas}</td>
                  <td>${chip(r.status.toUpperCase(), T.status[r.status], true)}</td>
                </tr>`; }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Checklist berjalan — INS-2026-0912 · APAR &amp; Hydrant</h2>
          <span class="sub">8 butir contoh dari 42 · ${ts.length} temuan menjadi CAPA</span></div>
        <div class="card">
          ${c.map((b, i) => `
            <div class="param is-clickable" style="grid-template-columns:1fr auto" ${infoAttr({
              title: `Butir ${i + 1}`,
              sub: 'INS-2026-0912 · APAR & Hydrant',
              body: chipRow([
                chip(b.jawab === 'Sesuai' ? 'SESUAI' : 'TIDAK SESUAI', b.jawab === 'Sesuai' ? 'low' : 'critical'),
                b.risiko ? chip('RISIKO ' + b.risiko, zone(b.risiko)) : ''
              ]) + lead(b.butir) + kv([
                ['Jawaban', b.jawab],
                b.temuan && ['Temuan', b.temuan],
                b.risiko && ['Tingkat risiko', `<span class="mono">${b.risiko}</span> — kemungkinan × keparahan pada matriks 5×5`],
                b.pj && ['Penanggung jawab', b.pj],
                b.tenggat && ['Tenggat', `<span class="mono">${b.tenggat}</span>`]
              ]) + foot(b.jawab === 'Sesuai'
                ? 'Butir yang sesuai tetap disimpan sebagai rekaman, karena inspeksi tanpa jejak butir yang lolos tidak dapat dibuktikan kepada auditor.'
                : 'Jawaban Tidak Sesuai langsung membuka isian temuan — foto, tingkat risiko, penanggung jawab, dan tenggat — dan temuan itu menjadi CAPA bernomor.')
            })}>
              <div>
                <div class="param-name">${i + 1}. ${b.butir}</div>
                ${b.temuan ? `<div style="font-size:13px;color:var(--ink-500);margin-top:4px">${b.temuan}</div>
                  <div style="display:flex;gap:var(--space-2);margin-top:8px;flex-wrap:wrap">
                    ${chip('RISIKO ' + b.risiko, zone(b.risiko))}
                    <span class="chip chip--neutral">PJ: ${b.pj}</span>
                    <span class="chip chip--neutral">TENGGAT ${b.tenggat.toUpperCase()}</span>
                  </div>` : ''}
              </div>
              <div>${b.jawab === 'Sesuai' ? chip('SESUAI', 'low') : chip('TIDAK SESUAI', 'critical')}</div>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 3 · Izin kerja & JSEA ───────── */
  function viewPermit() {
    const kindClass = { hot: 'high', conf: 'critical', height: 'high', elec: 'critical' };
    const kindLabel = { hot: 'PANAS', conf: 'RUANG', height: 'TINGGI', elec: 'LISTRIK' };
    return hero({
      eyebrow: 'MODUL 03 · WORK PERMIT & JSEA',
      title: 'Izin Kerja Berisiko Tinggi',
      desc: 'Izin tidak dapat aktif sebelum JSEA-nya lengkap. Risiko sisa di zona Ekstrem menutup penerbitan — bukan memberi peringatan, tetapi menolak.',
      action: { act: 'izin-baru', icon: 'permit', label: 'Ajukan Izin Kerja' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'IZIN AKTIF HARI INI', value: '1', icon: 'permit', arah: 'flat', delta: 'Panas · Ruang Boiler 2', note: 'Berakhir 16.00 WIB' })}
        ${tile({ label: 'MENUNGGU PERSETUJUAN', value: '2', icon: 'clock', arah: 'bad', delta: '1 tertahan 18 jam', note: 'Eskalasi otomatis setelah 24 jam' })}
        ${tile({ label: 'PEKERJAAN VENDOR', value: '3', icon: 'people', arah: 'flat', delta: 'dari 4 izin bulan ini', note: 'Induksi K3 & asuransi diverifikasi terpisah' })}
        ${tile({ label: 'DITOLAK ZONA EKSTREM', value: '2', icon: 'incident', arah: 'good', delta: 'tahun berjalan', note: 'Risiko sisa ≥ 15 menutup penerbitan' })}
      </div>

      <section class="section">
        <div class="section-head"><h2>Izin Kerja</h2><span class="sub">Kartu, bukan baris tabel — izin dibaca sekilas di lapangan</span></div>
        ${D.izin.map(p => `
          <article class="card permit-card" data-detail="izin:${p.id}" tabindex="0" role="button">
            <span class="feed-icon chip--${kindClass[p.ikon]}" style="width:56px;height:56px;border-radius:var(--radius-md);flex-direction:column;gap:2px">
              ${I(icon.permit, 20)}<span style="font-size:9px;font-weight:700;letter-spacing:.06em">${kindLabel[p.ikon]}</span>
            </span>
            <div>
              <span class="mono mono--id" style="font-size:12px">${p.id}</span>
              <div style="font-size:15px;line-height:21px;font-weight:600;color:var(--ink-900);margin:2px 0 4px">${p.judul}</div>
              <div style="font-size:13px;line-height:19px;color:var(--ink-500)">${p.pelaksana}${p.vendor ? ' (vendor)' : ''} · ${p.pekerja} pekerja · Pengawas: ${p.pengawas}</div>
              <div class="mono" style="color:var(--ink-700);margin-top:2px">${p.mulai}</div>
            </div>
            <div class="permit-status">
              ${chip(p.status.toUpperCase(), T.status[p.status])}
              <span class="mono mono--muted" style="font-size:12px">risiko ${p.risikoAwal} → ${p.risikoSisa}</span>
            </div>
            <div class="permit-reqs">
              ${p.prasyarat.map(r => {
                const cls = r.ok === true ? 'chip--low' : r.ok === false ? 'chip--critical' : 'chip--neutral';
                const m = r.ok === true ? '✓ ' : r.ok === false ? '✗ ' : '';
                return `<span class="chip ${cls}" style="font-weight:600;letter-spacing:0;text-transform:none;font-size:12px">${m}${r.t}</span>`;
              }).join('')}
            </div>
          </article>`).join('')}
      </section>

      ${jseaSection()}
    </div>`;
  }

  function jseaSection() {
    const j = D.jsea;
    const worst = j.langkah.reduce((a, s) => Math.max(a, s.awal.k * s.awal.s), 0);
    const worstSisa = j.langkah.reduce((a, s) => Math.max(a, s.sisa.k * s.sisa.s), 0);
    const cells = [];
    for (let k = 5; k >= 1; k--) {
      cells.push(`<div class="ax">${k}</div>`);
      for (let s = 1; s <= 5; s++) {
        const v = k * s;
        const isAwal = j.langkah.some(x => x.awal.k === k && x.awal.s === s && x.awal.k * x.awal.s === worst);
        const isSisa = j.langkah.some(x => x.sisa.k === k && x.sisa.s === s && x.sisa.k * x.sisa.s === worstSisa);
        cells.push(`<div class="cell zone-${zone(v)}">${v}
          ${isAwal ? '<span class="mark">AWAL</span>' : isSisa ? '<span class="mark mark--after">SISA</span>' : ''}</div>`);
      }
    }
    cells.push('<div class="ax"></div>');
    for (let s = 1; s <= 5; s++) cells.push(`<div class="axb">${s}</div>`);

    return `
    <section class="section">
      <div class="section-head"><h2>JSEA — ${j.judul}</h2>
        <span class="sub">${j.permit} · ${j.langkah.length} langkah · risiko tertinggi ${worst} → ${worstSisa}</span></div>
      <div class="grid grid--2">
        <div class="card">
          <h3>Matriks Risiko 5×5</h3>
          <div class="card-sub">Kemungkinan × Keparahan · kotak penuh = risiko awal, kotak putus-putus = risiko sisa</div>
          <div class="matrix">${cells.join('')}</div>
          <div class="axb" style="margin-top:8px;font-family:var(--font-mono);font-size:11px;color:var(--ink-500)">Keparahan → &nbsp;&nbsp;&nbsp; ↑ Kemungkinan</div>
          <div style="margin-top:var(--space-4);font-size:13px;color:var(--signal-low);font-weight:600">
            Risiko turun ${worst} → ${worstSisa}. Di bawah zona Ekstrem, izin dapat diterbitkan setelah uji gas dilampirkan.
          </div>
        </div>
        <div class="card">
          <h3>Persetujuan ${j.permit}</h3>
          <div class="card-sub">Tertahan pada langkah ketiga</div>
          <ol class="timeline">
            ${j.persetujuan.map((s, i) => `
              <li class="${s.state} is-clickable" ${infoAttr({
                title: s.peran,
                sub: `Persetujuan ${j.permit} · langkah ${i + 1} dari ${j.persetujuan.length}`,
                body: chipRow([
                  chip(s.state === 'done' ? 'SUDAH DISETUJUI' : s.state === 'now' ? 'MENUNGGU LANGKAH INI' : 'BELUM GILIRANNYA',
                    s.state === 'done' ? 'low' : s.state === 'now' ? 'high' : 'neutral', true)
                ]) + lead(s.nama) + kv([
                  ['Langkah', `${i + 1} dari ${j.persetujuan.length}`],
                  ['Peran', s.peran],
                  ['Nama', s.nama],
                  ['Catatan', s.catatan],
                  [s.tunggu ? 'Lama menunggu' : 'Waktu', `<span class="mono">${s.tunggu || s.waktu}</span>`]
                ]) + foot('Persetujuan berjenjang tidak dapat dilompati. Izin kerja tidak berstatus Aktif sebelum seluruh langkah selesai dan JSEA-nya lengkap.')
              })}>
                <span class="node">${s.state === 'done' ? '✓' : s.state === 'now' ? '!' : i + 1}</span>
                <span>
                  <span class="label-caps">${s.peran}</span>
                  <div class="who">${s.nama}</div>
                  <div class="note">${s.catatan}</div>
                </span>
                <span class="${s.tunggu ? 'wait' : 'when'}">${s.tunggu || s.waktu}</span>
              </li>`).join('')}
          </ol>
        </div>
      </div>

      <div class="panel" style="margin-top:var(--space-4)">
        <div class="panel-bar"><h2>Langkah Pekerjaan &amp; Pengendalian</h2>
          <span class="sub" style="font-size:12px;color:var(--ink-500)">Pengendalian diurutkan menurut hierarki: Eliminasi → Substitusi → Rekayasa → Administratif → APD</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>NO</th><th>LANGKAH PEKERJAAN</th><th>BAHAYA</th><th>AWAL</th><th>PENGENDALIAN</th><th>SISA</th></tr></thead>
            <tbody>
              ${j.langkah.map(s => {
                const a = s.awal.k * s.awal.s, b = s.sisa.k * s.sisa.s;
                return `<tr ${infoAttr({
                  title: `Langkah ${s.no} · ${s.kerja}`,
                  sub: `JSEA ${j.permit} · ${j.judul}`,
                  body: chipRow([
                    chip('RISIKO AWAL ' + a, zone(a)),
                    chip('RISIKO SISA ' + b, zone(b)),
                    chip('TURUN ' + (a - b) + ' TINGKAT', a - b > 0 ? 'low' : 'neutral')
                  ]) + lead(s.bahaya) + kv([
                    ['Langkah pekerjaan', s.kerja],
                    ['Bahaya', s.bahaya],
                    ['Risiko awal', `${a} — kemungkinan ${s.awal.k} × keparahan ${s.awal.s}`],
                    ['Risiko sisa', `${b} — kemungkinan ${s.sisa.k} × keparahan ${s.sisa.s}`]
                  ]) + `<div class="label-caps" style="margin:var(--space-5) 0 var(--space-2)">PENGENDALIAN · HIERARKI</div>
                    ${s.kendali.map(([tipe, isi]) => `<div style="font-size:13px;line-height:19px;margin-bottom:6px"><b style="color:var(--brand-700)">${tipe}</b> — ${isi}</div>`).join('')}`
                    + foot('Risiko sisa di zona merah menutup penerbitan izin, bukan sekadar memberi peringatan.')
                })}>
                  <td class="mono mono--muted">${s.no}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${s.kerja}</td>
                  <td>${s.bahaya}</td>
                  <td>${chip(String(a), zone(a))}</td>
                  <td>${s.kendali.map(([tipe, isi]) => `<div style="font-size:13px;line-height:19px"><b style="color:var(--brand-700)">${tipe}</b> — ${isi}</div>`).join('')}</td>
                  <td>${chip(String(b), zone(b))}</td>
                </tr>`; }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
  }

  /* ───────── Modul 4 · Laporan bahaya ───────── */
  function viewHazard() {
    const kolom = ['Terbuka', 'Diverifikasi', 'Ditangani'];
    return hero({
      eyebrow: 'MODUL 04 · PELAPORAN & PENANGANAN BAHAYA K3L',
      title: 'Laporan Bahaya',
      desc: 'Foto, lokasi, satu kalimat, kirim — target 30 detik. Kanal ini menerima laporan anonim, dan laporan anonim masuk antrean verifikasi dengan bobot yang sama.',
      action: { act: 'lapor-bahaya', icon: 'hazard', label: 'Lapor Bahaya' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'LAPORAN BULAN INI', value: '87', unit: '/bln', icon: 'hazard', arah: 'bad', delta: '14 vs Agustus — partisipasi turun', note: 'Naik itu baik · Leading indicator utama' })}
        ${tile({ label: 'PER PEKERJA', value: '0,21', icon: 'people', arah: 'bad', delta: '0,03 vs Agustus', note: '412 pekerja · target ≥ 0,25' })}
        ${tile({ label: 'BELUM DIVERIFIKASI', value: '2', icon: 'clock', arah: 'bad', delta: 'tertua 5 jam', note: 'Target verifikasi dalam 8 jam kerja' })}
        ${tile({ label: 'LAPORAN ANONIM', value: '18', unit: '%', icon: 'shield', arah: 'flat', delta: '16 dari 87 laporan', note: 'Kanal anonim dipertahankan apa pun angkanya' })}
      </div>

      <section class="section">
        <div class="card">
          <h3>Tren Laporan Bahaya 12 Bulan</h3>
          <div class="card-sub">Naik itu baik. Penurunan September perlu ditindaklanjuti sebagai masalah partisipasi, bukan dirayakan sebagai perbaikan.</div>
          ${lineChart(D.trenBahaya, { target: 80, targetLabel: 'target 80',
            aria: 'Grafik garis jumlah laporan bahaya per bulan, naik dari 52 pada Oktober ke puncak 101 pada Agustus, turun ke 87 pada September.' })}
        </div>
      </section>

      ${lapanganSeksi('bahaya')}

      <section class="section">
        <div class="section-head"><h2>Papan Tindak Lanjut</h2><span class="sub">Tiga kolom, kiri ke kanan</span></div>
        <div class="kanban kanban--3">
          ${kolom.map(k => {
            const items = D.bahaya.filter(b => b.status === k);
            return `<div class="kan-col">
              <h3><span>${k.toUpperCase()}</span><span class="mono">${items.length}</span></h3>
              ${items.map(b => `
                <div class="kan-card" data-detail="bahaya:${b.id}" tabindex="0" role="button">
                  ${chip(b.kategori.toUpperCase(), b.kategori === 'Aspek Lingkungan' ? 'low' : b.kategori === 'Unsafe Action' ? 'medium' : 'high')}
                  <div class="t">${b.isi}</div>
                  <div class="m">
                    <span class="mono mono--muted">${b.id}</span>
                    <span>·</span><span>${b.lokasi}</span>
                  </div>
                  <div class="m" style="margin-top:4px">
                    ${b.anonim ? chip('ANONIM', 'neutral') : `<span>${b.pelapor}</span>`}
                    <span class="mono mono--muted" style="margin-left:auto">${b.waktu}</span>
                  </div>
                </div>`).join('')}
            </div>`; }).join('')}
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 5 · Audit ───────── */
  function viewAudit() {
    const totalK = D.elemenSMK3.reduce((a, e) => a + e.kriteria, 0);
    const totalP = D.elemenSMK3.reduce((a, e) => a + e.penuhi, 0);
    const pct = Math.round(totalP / totalK * 100);
    return hero({
      eyebrow: 'MODUL 05 · AUDIT',
      title: 'Audit SHE',
      desc: 'ISO 45001, ISO 14001, dan SMK3 PP 50/2012 dalam satu program. Setiap temuan Major dan Minor wajib punya CAPA bertenggat; temuan Major yang lewat tenggat naik ke Dashboard.',
      metric: pct + '%', metricLabel: 'PEMENUHAN KRITERIA SMK3'
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'AUDIT TAHUN INI', value: '4', icon: 'audit', arah: 'flat', delta: '2 selesai · 1 berjalan · 1 terjadwal', note: 'Surveillance TÜV 12–14 Okt 2026' })}
        ${tile({ label: 'TEMUAN MAJOR', value: '1', icon: 'incident', arah: 'bad', delta: 'sertifikat boiler 2', note: 'Tenggat CAPA 30 Sep · belum selesai' })}
        ${tile({ label: 'TEMUAN MINOR', value: '6', icon: 'inspection', arah: 'bad', delta: '1 vs audit sebelumnya', note: '4 masih terbuka · 2 menunggu verifikasi' })}
        ${tile({ label: 'KRITERIA SMK3', value: totalP + '/' + totalK, icon: 'kpi', arah: 'good', delta: pct + '% terpenuhi', note: 'Tingkat penilaian lanjutan · 166 kriteria' })}
      </div>

      <section class="section panel">
        <div class="panel-bar"><h2>Program Audit</h2></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>NO.</th><th>STANDAR</th><th>LINGKUP</th><th>AUDITOR</th><th>JADWAL</th><th>TEMUAN</th><th>STATUS</th></tr></thead>
            <tbody>
              ${D.audit.map(a => `
                <tr data-detail="audit:${a.id}" tabindex="0" role="button">
                  <td class="mono mono--id">${a.id}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${a.standar}</td>
                  <td>${a.lingkup}</td>
                  <td>${a.auditor}</td>
                  <td class="mono mono--muted">${a.tanggal}</td>
                  <td style="display:flex;gap:6px;flex-wrap:wrap">
                    ${a.temuan.major ? chip(a.temuan.major + ' MAJOR', 'critical') : ''}
                    ${a.temuan.minor ? chip(a.temuan.minor + ' MINOR', 'high') : ''}
                    ${a.temuan.obs ? chip(a.temuan.obs + ' OBS', 'info') : ''}
                    ${!a.temuan.major && !a.temuan.minor && !a.temuan.obs ? chip('BELUM MULAI', 'neutral') : ''}
                  </td>
                  <td>${chip(a.status.toUpperCase(), T.status[a.status], true)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section grid grid--2">
        <div class="panel">
          <div class="panel-bar"><h2>Temuan Terbuka</h2></div>
          <div class="table-wrap">
            <table style="min-width:0">
              <thead><tr><th>NO.</th><th>KLAUSUL / ELEMEN</th><th>KATEGORI</th><th>PJ</th><th>TENGGAT</th></tr></thead>
              <tbody>
                ${D.temuanAudit.map(t => `
                  <tr class="${t.kategori === 'Major' ? 'is-overdue' : ''}" ${infoAttr({
                    title: t.id,
                    sub: `Temuan ${t.kategori} · ${t.klausul}`,
                    body: chipRow([
                      chip(t.kategori.toUpperCase(), T.temuan[t.kategori]),
                      chip('TENGGAT ' + t.tenggat, 'neutral')
                    ]) + lead(t.isi) + kv([
                      ['Klausul / elemen', t.klausul],
                      ['Kategori temuan', t.kategori],
                      ['Penanggung jawab', t.pj],
                      ['Tenggat', `<span class="mono">${t.tenggat}</span>`]
                    ]) + foot(t.kategori === 'Major'
                      ? 'Temuan Major wajib punya CAPA dengan tenggat. Yang lewat tenggat naik ke merah di seluruh papan.'
                      : 'Temuan Minor wajib punya CAPA. Observasi dan Peluang Perbaikan tidak wajib, tetapi tetap dicatat.')
                  })}>
                    <td class="mono mono--id">${t.id}</td>
                    <td><div style="font-weight:600;color:var(--ink-900)">${t.klausul}</div>
                      <div style="font-size:13px;color:var(--ink-500)">${t.isi}</div></td>
                    <td>${chip(t.kategori.toUpperCase(), T.temuan[t.kategori])}</td>
                    <td>${t.pj}</td>
                    <td class="mono mono--muted">${t.tenggat}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <h3>Pemenuhan 12 Elemen SMK3</h3>
          <div class="card-sub">PP 50/2012 · ${totalK} kriteria · audit internal Sep 2026</div>
          ${D.elemenSMK3.map(e => {
            const p = Math.round(e.penuhi / e.kriteria * 100);
            return `<div class="is-clickable" style="margin-bottom:var(--space-3)" ${infoAttr({
              title: `Elemen ${e.no} · ${e.nama}`,
              sub: `SMK3 PP 50/2012 · audit internal ${D.periode}`,
              body: `<div class="info-num">${p}<span class="tile-unit">% terpenuhi</span></div>`
                + chipRow([chip(p === 100 ? 'LENGKAP' : p >= 80 ? 'HAMPIR LENGKAP' : 'PERLU PERBAIKAN',
                  p === 100 ? 'low' : p >= 80 ? 'medium' : 'critical')])
                + kv([
                  ['Elemen', `${e.no} — ${e.nama}`],
                  ['Kriteria terpenuhi', `<span class="mono">${e.penuhi}</span> dari <span class="mono">${e.kriteria}</span>`],
                  ['Belum terpenuhi', `<span class="mono">${e.kriteria - e.penuhi}</span> kriteria`],
                  ['Pemenuhan', `<span class="mono">${p}%</span>`]
                ]) + foot('Pemenuhan ditampilkan per elemen, bukan sebagai satu angka gabungan. Satu elemen yang lemah tidak boleh tertutup oleh sebelas elemen yang baik.')
            })}>
              <div style="display:flex;justify-content:space-between;gap:var(--space-3);font-size:13px;margin-bottom:5px">
                <span style="color:var(--ink-900)"><b class="mono" style="color:var(--ink-500)">${e.no}</b> ${e.nama}</span>
                <span class="mono mono--muted">${e.penuhi}/${e.kriteria}</span>
              </div>
              <div class="bar ${p === 100 ? 'bar--low' : p >= 90 ? '' : 'bar--medium'}"><span style="width:${p}%"></span></div>
            </div>`; }).join('')}
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 6 · Lingkungan ───────── */
  function viewEnvironment() {
    const blok = (b) => `
      <div class="card">
        <h3>${b.judul}</h3>
        <div class="card-sub">${b.sub}</div>
        ${b.param.map(p => `
          <div class="param is-clickable" ${infoAttr({
            title: p.nama,
            sub: `${b.judul} · ${b.sub}`,
            body: `<div class="info-num" style="color:var(--signal-${p.ok ? 'low' : 'critical'})">${p.nilai}${p.satuan ? `<span class="tile-unit">${p.satuan}</span>` : ''}</div>`
              + chipRow([chip(p.ok ? 'MEMENUHI BAKU MUTU' : 'MELEWATI AMBANG', p.ok ? 'low' : 'critical')])
              + kv([
                ['Parameter', p.nama],
                ['Hasil uji', `<span class="mono">${p.nilai}${p.satuan ? ' ' + p.satuan : ''}</span>`],
                ['Baku mutu', p.ambang],
                ['Kesimpulan', p.ok ? 'Di dalam ambang' : 'Melewati ambang — uji ulang dan tindakan perbaikan wajib'],
                ['Acuan regulasi', b.acuan]
              ]) + foot(p.ok
                ? 'Setiap nilai terukur selalu disandingkan dengan baku mutunya. Angka tanpa ambang pembanding tidak berarti apa-apa bagi pembaca.'
                : 'Nilai yang melewati ambang melahirkan satu entri CAPA dan muncul di kolom Perhatian Segera pada Dashboard.')
          })}>
            <div>
              <div class="param-name">${p.nama}</div>
              <div class="param-limit">${p.ambang}</div>
            </div>
            <div style="text-align:right">
              <div class="param-val" style="color:var(--signal-${p.ok ? 'low' : 'critical'})">${p.nilai}${p.satuan ? ' ' + p.satuan : ''}</div>
              ${p.ok ? '' : chip('MELEWATI AMBANG', 'critical')}
            </div>
          </div>`).join('')}
        <div class="tile-note" style="margin-top:var(--space-4)">Acuan: ${b.acuan}</div>
      </div>`;
    return hero({
      eyebrow: 'MODUL 06 · ENVIRONMENT',
      title: 'Aspek Lingkungan',
      desc: 'Waste Management, PPPA, PPPU, dan PLB3. Setiap nilai terukur selalu disandingkan dengan baku mutunya — angka tanpa ambang pembanding tidak berarti apa-apa bagi pembaca.',
      action: { act: 'input-uji', icon: 'environment', label: 'Input Hasil Uji' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'PARAMETER DIPANTAU', value: '17', icon: 'environment', arah: 'flat', delta: '4 domain lingkungan', note: 'PPPA 5 · PPPU 4 · Limbah 4 · PLB3 4' })}
        ${tile({ label: 'MELEWATI AMBANG', value: '1', icon: 'incident', arah: 'bad', delta: 'minyak & lemak IPAL', note: '14 mg/L terhadap ambang 10 mg/L · uji ulang wajib' })}
        ${tile({ label: 'MASA SIMPAN TERPENDEK', value: '12', unit: 'hari', icon: 'clock', arah: 'bad', delta: 'oli bekas 860 kg di TPS', note: 'Batas 90 hari · manifes belum dijadwalkan' })}
        ${tile({ label: 'LIMBAH DIDAUR ULANG', value: '93', unit: '%', icon: 'kpi', arah: 'good', delta: '4% vs Agustus', note: 'Dari 18,5 ton timbulan non-B3 bulan ini' })}
      </div>
      <section class="section grid grid--2">
        ${blok(D.lingkungan.pppa)}
        ${blok(D.lingkungan.pppu)}
        ${blok(D.lingkungan.limbah)}
        ${blok(D.lingkungan.plb3)}
      </section>
    </div>`;
  }

  /* ───────── Modul 8 · KPI ───────── */
  function viewKpi() {
    const k = (x, jenis) => tile({ label: x.nama.toUpperCase(), value: x.nilai, unit: x.satuan,
      icon: 'kpi', arah: x.arah, delta: x.delta, note: x.note,
      sub: `${jenis} indicator · tahun berjalan s.d. ${D.periode}`,
      rumus: x.note.indexOf('÷') !== -1 ? x.note.split(' · ')[0] : '—',
      sumber: jenis === 'Lagging'
        ? 'Insiden, jam kerja, dan hari hilang dari modul Incident'
        : 'Laporan bahaya, inspeksi, pelatihan, patroli, dan CAPA dari modulnya masing-masing',
      periode: `Tahun berjalan s.d. ${D.periode} · ${D.plant}`,
      catatan: jenis === 'Lagging'
        ? 'Lagging mengukur hasil yang sudah terjadi. TRIR memakai basis 200.000 jam dan LTIFR 1.000.000 jam — membandingkan keduanya secara langsung adalah kekeliruan basis.'
        : 'Leading mengukur usaha yang sedang dilakukan. Arah "baik" mengikuti arti indikatornya, bukan arah angkanya: jumlah laporan bahaya yang naik adalah kabar baik.' });
    return hero({
      eyebrow: 'MODUL 08 · SHE KPI & ANALYTICS',
      title: 'Indikator Kinerja QHSE',
      desc: 'Lagging dan leading dipisah tegas dan tidak pernah dicampur dalam satu baris. Rumus dan basis perhitungan ditulis di kaki setiap ubin — kesalahan basis adalah kekeliruan paling sering dalam pelaporan K3.',
      metric: '0,42', metricLabel: 'TRIR TAHUN BERJALAN · TARGET ≤ 0,50'
    }) + `
    <div class="page">
      <section class="section">
        <div class="section-head">
          <h2>Lagging Indicator</h2>
          <span class="sub">Hasil yang sudah terjadi · periode tahun berjalan s.d. ${D.periode}</span>
        </div>
        <div class="grid grid--3">${D.kpiLagging.map(x => k(x, 'Lagging')).join('')}</div>
      </section>
      <section class="section">
        <div class="section-head">
          <h2>Leading Indicator</h2>
          <span class="sub">Usaha yang sedang dilakukan · arah "baik" mengikuti arti, bukan arah angka</span>
        </div>
        <div class="grid grid--3">${D.kpiLeading.map(x => k(x, 'Leading')).join('')}</div>
      </section>
      <section class="section grid grid--2">
        <div class="card">
          <h3>Insiden vs Target</h3>
          <div class="card-sub">Lagging · makin rendah makin baik</div>
          ${lineChart(D.trenInsiden, { target: 4, targetLabel: 'target 4',
            aria: 'Grafik insiden per bulan, puncak 9 pada Januari, turun ke 3 pada September.' })}
        </div>
        <div class="card">
          <h3>Laporan Bahaya vs Target</h3>
          <div class="card-sub">Leading · makin tinggi makin baik</div>
          ${lineChart(D.trenBahaya, { target: 80, targetLabel: 'target 80',
            aria: 'Grafik laporan bahaya per bulan, puncak 101 pada Agustus, turun ke 87 pada September.' })}
        </div>
      </section>
      <section class="section">
        <div class="card">
          <h3>Pembandingan antarpabrik</h3>
          <div class="card-sub">TRIR tahun berjalan · basis 200.000 jam kerja</div>
          <div class="table-wrap">
            <table style="min-width:0">
              <thead><tr><th>PABRIK</th><th>JAM KERJA</th><th>TRC</th><th>TRIR</th><th>LTIFR</th><th>TERHADAP TARGET</th></tr></thead>
              <tbody>
                ${[['Cibitung', '2.740.000', 6, '0,44', '1,84', true],
                   ['Bekasi', '1.980.000', 3, '0,30', '1,01', true],
                   ['Semarang', '1.420.000', 4, '0,56', '2,11', false],
                   ['Medan', '980.000', 2, '0,41', '2,04', true]].map(r => `
                  <tr ${infoAttr({
                    title: `Pabrik ${r[0]}`,
                    sub: `Pembandingan TRIR tahun berjalan · basis 200.000 jam kerja`,
                    body: `<div class="info-num">${r[3]}<span class="tile-unit">TRIR</span></div>` + chipRow([
                      chip(r[5] ? 'DI BAWAH TARGET' : 'DI ATAS TARGET', r[5] ? 'low' : 'critical')
                    ]) + kv([
                      ['Jam kerja', `<span class="mono">${r[1]}</span>`],
                      ['TRC — total recordable cases', `<span class="mono">${r[2]}</span>`],
                      ['TRIR', `<span class="mono">${r[3]}</span> — (${r[2]} × 200.000) ÷ ${r[1]} jam`],
                      ['LTIFR', `<span class="mono">${r[4]}</span> — basis 1.000.000 jam`],
                      ['Terhadap target', r[5] ? 'Di bawah target tahun berjalan' : 'Di atas target tahun berjalan']
                    ]) + foot('TRIR dan LTIFR memakai basis berbeda (200.000 jam versus 1.000.000 jam). Membandingkan keduanya secara langsung adalah kekeliruan paling sering dalam pelaporan K3.')
                  })}>
                    <td style="font-weight:600;color:var(--ink-900)">${r[0]}</td>
                    <td class="mono mono--muted">${r[1]}</td>
                    <td class="mono">${r[2]}</td>
                    <td class="mono" style="font-size:15px;font-weight:600;color:var(--ink-900)">${r[3]}</td>
                    <td class="mono">${r[4]}</td>
                    <td>${r[5] ? chip('DI BAWAH TARGET', 'low') : chip('DI ATAS TARGET', 'critical')}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 9 · Kegiatan SHE ───────── */
  function viewActivity() {
    const jam = D.kegiatan.reduce((a, k) => a + k.peserta * k.durasi, 0);
    return hero({
      eyebrow: 'MODUL 09 · SHE ACTIVITY',
      title: 'Dokumentasi Kegiatan',
      desc: 'Kisi kartu bergambar, bukan tabel — modul ini tentang bukti visual. Jumlah peserta dikalikan durasi langsung mengisi KPI Jam Pelatihan K3 di modul 8.',
      action: { act: 'unggah-kegiatan', icon: 'activity', label: 'Unggah Kegiatan' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'KEGIATAN BULAN INI', value: '5', icon: 'activity', arah: 'flat', delta: '1 vs Agustus', note: 'Safety talk, drill, patrol, pelatihan, lingkungan' })}
        ${tile({ label: 'TOTAL JAM ORANG', value: jam.toLocaleString('id-ID'), icon: 'clock', arah: 'good', delta: 'mengisi KPI modul 8', note: 'Peserta × durasi · otomatis ke Jam Pelatihan K3' })}
        ${tile({ label: 'PESERTA UNIK', value: '186', icon: 'people', arah: 'good', delta: '45% dari 412 pekerja', note: 'Target partisipasi bulanan ≥ 40%' })}
        ${tile({ label: 'RAPAT P2K3', value: '0', icon: 'audit', arah: 'bad', delta: 'wajib bulanan · belum terisi', note: 'Regulasi mewajibkan rapat P2K3 setiap bulan' })}
      </div>
      <section class="section">
        <div class="section-head"><h2>${D.periode}</h2><span class="sub">Setiap entri membawa foto, daftar hadir terpindai, dan lokasi</span></div>
        <div class="grid grid--3">
          ${D.kegiatan.map(k => `
            <article class="card act-card" data-detail="kegiatan:${k.id}" tabindex="0" role="button">
              <div class="act-thumb">${I(icon.activity, 40)}</div>
              <div class="act-body">
                ${chip(k.jenis.toUpperCase(), 'info')}
                <h3 style="margin-top:8px">${k.judul}</h3>
                <div style="font-size:13px;color:var(--ink-500)">${k.lokasi}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-3);
                            border-top:1px solid var(--border-100);padding-top:var(--space-3)">
                  <span class="mono mono--muted" style="font-size:12px">${k.tanggal}</span>
                  <span class="mono" style="font-size:13px;color:var(--ink-900);font-weight:600">${k.peserta} peserta · ${k.durasi} jam</span>
                </div>
              </div>
            </article>`).join('')}
          <article class="card act-empty">
            ${I(icon.plus, 28)}
            <div style="font-size:14px;font-weight:600;color:var(--ink-700)">Rapat P2K3 September belum diunggah</div>
            <div style="font-size:13px">Rapat P2K3 wajib bulanan. Kartu ini tidak disembunyikan sampai buktinya masuk.</div>
            <button class="btn btn--secondary btn--sm" data-act="unggah-kegiatan">Unggah sekarang</button>
          </article>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 10 · CAPA ───────── */
  function viewCapa() {
    const kolom = ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi', 'Selesai'];
    const srcChip = { 'Insiden': 'critical', 'Inspeksi': 'medium', 'Audit': 'high', 'Lingkungan': 'low', 'Bahaya': 'info' };
    return hero({
      eyebrow: 'MODUL 10 · CORRECTIVE & PREVENTIVE ACTION',
      title: 'Tindakan Perbaikan',
      desc: 'CAPA tidak pernah dibuat dari nol — setiap entri berasal dari modul lain dan membawa tautan balik ke sumbernya. Penuaan dihitung dari tanggal terbit, bukan tanggal tenggat.',
      metric: '82%', metricLabel: 'PENYELESAIAN TEPAT WAKTU · TARGET ≥ 90%'
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'CAPA AKTIF', value: '8', icon: 'capa', arah: 'flat', delta: '2 dari audit · 5 dari insiden', note: 'Tidak termasuk yang sudah Selesai' })}
        ${tile({ label: 'LEWAT TENGGAT', value: '2', icon: 'incident', arah: 'bad', delta: 'tertua 47 hari', note: 'Naik otomatis ke Dashboard sebagai kritis' })}
        ${tile({ label: 'RATA-RATA UMUR', value: '14', unit: 'hari', icon: 'clock', arah: 'bad', delta: '3 hari vs Agustus', note: 'Dihitung dari tanggal terbit' })}
        ${tile({ label: 'TEPAT WAKTU', value: '82', unit: '%', icon: 'kpi', arah: 'bad', delta: '3% vs Agustus', note: '41 dari 50 CAPA jatuh tempo · Leading' })}
      </div>

      <section class="section">
        <div class="section-head"><h2>Papan CAPA</h2>
          <span class="sub">Hanya QHSE yang dapat memindahkan ke Selesai, dan hanya dengan bukti terlampir</span></div>
        <div class="kanban">
          ${kolom.map(k => {
            const items = D.capa.filter(c => c.status === k);
            return `<div class="kan-col">
              <h3><span>${k.toUpperCase()}</span><span class="mono">${items.length}</span></h3>
              ${items.map(c => `
                <div class="kan-card" data-detail="capa:${c.id}" tabindex="0" role="button">
                  <div class="m">
                    ${chip(c.sumberJenis.toUpperCase(), srcChip[c.sumberJenis])}
                    ${c.terlambat ? chip('LEWAT TEMPO', 'critical') : ''}
                  </div>
                  <div class="t">${c.judul}</div>
                  <div class="m">
                    <span class="mono mono--muted">${c.sumber}</span>
                    <span class="mono mono--muted" style="margin-left:auto">umur ${c.umur} hari</span>
                  </div>
                  <div class="m" style="margin-top:4px">
                    <span>${c.pj}</span>
                    <span class="mono ${c.terlambat ? '' : 'mono--muted'}"
                      style="margin-left:auto;${c.terlambat ? 'color:var(--signal-critical);font-weight:600' : ''}">${c.tenggat}</span>
                  </div>
                </div>`).join('')}
            </div>`; }).join('')}
        </div>
      </section>

      <section class="section panel">
        <div class="panel-bar"><h2>Seluruh CAPA</h2></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>NO.</th><th>TINDAKAN</th><th>SUMBER</th><th>PJ</th><th>TERBIT</th>
              <th>TENGGAT</th><th>UMUR</th><th>STATUS</th></tr></thead>
            <tbody>
              ${D.capa.map(c => `
                <tr class="${c.terlambat ? 'is-overdue' : ''}" data-detail="capa:${c.id}" tabindex="0" role="button">
                  <td class="mono mono--id">${c.id}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${c.judul}</td>
                  <td>${chip(c.sumberJenis.toUpperCase(), srcChip[c.sumberJenis])}
                    <div class="mono mono--muted" style="font-size:11px;margin-top:3px">${c.sumber}</div></td>
                  <td>${c.pj}</td>
                  <td class="mono mono--muted">${c.terbit}</td>
                  <td class="mono" style="${c.terlambat ? 'color:var(--signal-critical);font-weight:600' : 'color:var(--ink-500)'}">${c.tenggat}</td>
                  <td class="mono">${c.umur} hari</td>
                  <td>${chip(c.status.toUpperCase(), T.status[c.status], true)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Rincian (modal) ───────── */
  function detail(kind, id) {
    if (kind === 'lapangan') {
      const r = (window.KGLAP ? KGLAP.daftar() : []).filter(function (x) { return x.id === id; })[0];
      if (!r) return null;
      const modul = { bahaya: 'Laporan Bahaya K3L', insiden: 'Incident & Nearmiss', observasi: 'Observasi Perilaku' }[r.jenis];
      return { title: r.id, sub: `Kiriman lapangan · ${modul} · ${r.waktuTampil || ''}`, body:
        chipRow([
          chip('DARI LAPANGAN', 'info'),
          chip(r.status.toUpperCase(), r.status === 'Antre' ? 'medium' : 'low', true),
          r.kategori ? chip(String(r.kategori).toUpperCase(), 'neutral') : '',
          r.foto ? chip('BERFOTO', 'low') : ''
        ]) +
        (r.foto ? `<img src="${r.foto}" alt="Foto kiriman lapangan ${r.id}" style="width:100%;max-height:340px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--space-5)">` : '') +
        lead(KGAI.esc(r.isi)) +
        kv([
          ['Area', KGAI.esc(r.lokasi)],
          r.kategori && ['Kategori', KGAI.esc(String(r.kategori))],
          r.risiko && ['Risiko menurut pelapor', r.risiko],
          r.keparahan && ['Keparahan', r.keparahan],
          r.cedera && ['Cedera', r.cedera],
          (r.aman != null) && ['Perilaku aman / berisiko', r.aman + ' / ' + r.berisiko],
          r.koordinat && ['Titik lokasi', `<span class="mono">${r.koordinat.lat.toFixed(5)}, ${r.koordinat.lon.toFixed(5)}</span> · ±${r.koordinat.akurasi} m`],
          r.fotoDilepas && ['Foto', 'Dilepas karena penyimpanan perangkat penuh; laporannya tetap utuh'],
          ['Pelapor', KGAI.esc(r.pelapor) + ' · ' + KGAI.esc(r.peran)],
          ['Status', r.status]
        ]) +
        foot('Kiriman lapangan belum melewati verifikasi QHSE, jadi belum dihitung dalam angka KPI mana pun. Yang berstatus Antre bahkan belum pernah meninggalkan perangkat pelapor — pada sistem sebenarnya, di titik itulah panggilan ke API berada.') };
    }
    if (kind === 'insiden') {
      const r = D.insiden.find(x => x.id === id); if (!r) return null;
      return { title: r.id, sub: `${r.jenis} · ${r.lokasi} · ${r.tanggal} pukul ${r.waktu} WIB`, body: `
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5)">
          ${chip(r.jenis.toUpperCase(), T.jenis[r.jenis])}
          ${chip(r.keparahan.toUpperCase(), T.parah[r.keparahan])}
          ${chip(r.status.toUpperCase(), T.status[r.status], true)}
          ${r.anonim ? chip('ANONIM', 'neutral') : ''}
        </div>
        <h3 style="font-size:17px;color:var(--ink-900);margin:0 0 var(--space-4)">${r.ringkas}</h3>
        <dl class="kv">
          <dt>Kronologi</dt><dd>${r.kronologi}</dd>
          <dt>Dampak</dt><dd>${r.dampak}</dd>
          <dt>Akar masalah</dt><dd>${r.akar}</dd>
          <dt>Pelapor</dt><dd>${r.anonim ? 'Anonim (kanal tanpa nama)' : r.pelapor}</dd>
          <dt>CAPA</dt><dd class="mono mono--id">${r.capa}</dd>
        </dl>` };
    }
    if (kind === 'capa') {
      const c = D.capa.find(x => x.id === id); if (!c) return null;
      return { title: c.id, sub: `${c.sumberJenis} ${c.sumber} · ${c.pj}`, body: `
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5)">
          ${chip(c.status.toUpperCase(), T.status[c.status], true)}
          ${chip('PRIORITAS ' + c.prioritas.toUpperCase(), T.risiko[c.prioritas])}
          ${c.terlambat ? chip('LEWAT TEMPO', 'critical') : ''}
        </div>
        <h3 style="font-size:17px;color:var(--ink-900);margin:0 0 var(--space-4)">${c.judul}</h3>
        <dl class="kv">
          <dt>Sumber</dt><dd>${c.sumberJenis} · <span class="mono mono--id">${c.sumber}</span></dd>
          <dt>Penanggung jawab</dt><dd>${c.pj}</dd>
          <dt>Terbit</dt><dd class="mono">${c.terbit}</dd>
          <dt>Tenggat</dt><dd class="mono" style="${c.terlambat ? 'color:var(--signal-critical);font-weight:600' : ''}">${c.tenggat}</dd>
          <dt>Umur</dt><dd class="mono">${c.umur} hari sejak terbit</dd>
        </dl>
        <div class="tile-note" style="margin-top:var(--space-5)">Pemindahan ke Selesai hanya oleh petugas QHSE, dengan bukti terlampir.</div>` };
    }
    if (kind === 'izin') {
      const p = D.izin.find(x => x.id === id); if (!p) return null;
      return { title: p.id, sub: `Izin ${p.jenis} · ${p.mulai}`, body: `
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5)">
          ${chip(p.status.toUpperCase(), T.status[p.status], true)}
          ${chip('RISIKO ' + p.risikoAwal + ' → ' + p.risikoSisa, zone(p.risikoSisa))}
          ${p.vendor ? chip('VENDOR', 'neutral') : chip('INTERNAL', 'neutral')}
        </div>
        <h3 style="font-size:17px;color:var(--ink-900);margin:0 0 var(--space-4)">${p.judul}</h3>
        <dl class="kv">
          <dt>Pelaksana</dt><dd>${p.pelaksana} · ${p.pekerja} pekerja</dd>
          <dt>Pengawas</dt><dd>${p.pengawas}</dd>
          <dt>Jendela waktu</dt><dd class="mono">${p.mulai}</dd>
        </dl>
        <div class="label-caps" style="margin:var(--space-5) 0 var(--space-2)">PRASYARAT</div>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
          ${p.prasyarat.map(r => {
            const cls = r.ok === true ? 'chip--low' : r.ok === false ? 'chip--critical' : 'chip--neutral';
            const m = r.ok === true ? '✓ ' : r.ok === false ? '✗ ' : '';
            return `<span class="chip ${cls}" style="font-weight:600;letter-spacing:0;font-size:12px">${m}${r.t}</span>`;
          }).join('')}
        </div>` };
    }
    if (kind === 'bahaya') {
      const b = D.bahaya.find(x => x.id === id); if (!b) return null;
      return { title: b.id, sub: `${b.kategori} · ${b.lokasi} · ${b.waktu}`, body: `
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5)">
          ${chip(b.status.toUpperCase(), T.status[b.status], true)}
          ${chip('RISIKO ' + b.risiko.toUpperCase(), T.risiko[b.risiko])}
          ${b.anonim ? chip('ANONIM', 'neutral') : ''}
        </div>
        <h3 style="font-size:17px;color:var(--ink-900);margin:0 0 var(--space-4)">${b.isi}</h3>
        <dl class="kv">
          <dt>Kategori</dt><dd>${b.kategori}</dd>
          <dt>Lokasi</dt><dd>${b.lokasi}</dd>
          <dt>Pelapor</dt><dd>${b.anonim ? 'Anonim (kanal tanpa nama)' : b.pelapor}</dd>
          <dt>Dilaporkan</dt><dd>${b.waktu}</dd>
        </dl>` };
    }
    if (kind === 'inspeksi') {
      const r = D.inspeksi.find(x => x.id === id); if (!r) return null;
      return { title: r.id, sub: `${r.jenis} · ${r.area}`, body: `
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5)">
          ${chip(r.status.toUpperCase(), T.status[r.status], true)}
          ${chip(r.jadwal.toUpperCase(), 'neutral')}
        </div>
        <dl class="kv">
          <dt>Petugas</dt><dd>${r.petugas}</dd>
          <dt>Tanggal</dt><dd class="mono">${r.tanggal}</dd>
          <dt>Kemajuan</dt><dd class="mono">${r.selesai} dari ${r.butir} butir</dd>
          <dt>Temuan</dt><dd>${r.temuan ? r.temuan + ' temuan, seluruhnya sudah menjadi CAPA' : 'Tidak ada temuan'}</dd>
        </dl>` };
    }
    if (kind === 'audit') {
      const a = D.audit.find(x => x.id === id); if (!a) return null;
      return { title: a.id, sub: `${a.standar} · ${a.tanggal}`, body: `
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5)">
          ${chip(a.status.toUpperCase(), T.status[a.status], true)}
        </div>
        <dl class="kv">
          <dt>Lingkup</dt><dd>${a.lingkup}</dd>
          <dt>Auditor</dt><dd>${a.auditor}</dd>
          <dt>Temuan</dt><dd>${a.temuan.major} major · ${a.temuan.minor} minor · ${a.temuan.obs} observasi</dd>
        </dl>` };
    }
    if (kind === 'kegiatan') {
      const k = D.kegiatan.find(x => x.id === id); if (!k) return null;
      return { title: k.id, sub: `${k.jenis} · ${k.tanggal}`, body: `
        <h3 style="font-size:17px;color:var(--ink-900);margin:0 0 var(--space-4)">${k.judul}</h3>
        <dl class="kv">
          <dt>Lokasi</dt><dd>${k.lokasi}</dd>
          <dt>Peserta</dt><dd class="mono">${k.peserta} orang</dd>
          <dt>Durasi</dt><dd class="mono">${k.durasi} jam</dd>
          <dt>Jam orang</dt><dd class="mono">${(k.peserta * k.durasi).toLocaleString('id-ID')} jam · mengisi KPI Jam Pelatihan K3</dd>
        </dl>
        <div class="tile-note" style="margin-top:var(--space-5)">Foto kegiatan dan daftar hadir terpindai dilampirkan pada entri ini.</div>` };
    }
    return null;
  }

  /* ───────── Formulir lapor ───────── */
  const formInsiden = `
    <div class="field">
      <label>Jenis kejadian <span class="req">*</span></label>
      <div class="picks">
        <button type="button" class="pick" data-pick="jenis" aria-pressed="false">
          <span class="pt">Nearmiss</span><span class="pd">Nyaris, tanpa cedera</span></button>
        <button type="button" class="pick" data-pick="jenis" aria-pressed="true">
          <span class="pt">Incident</span><span class="pd">Kerusakan, tanpa cedera</span></button>
        <button type="button" class="pick" data-pick="jenis" aria-pressed="false">
          <span class="pt">Accident</span><span class="pd">Ada cedera manusia</span></button>
      </div>
    </div>
    <div class="row2">
      <div class="field">
        <label for="f-lokasi">Lokasi kejadian <span class="req">*</span></label>
        <select id="f-lokasi">${D.lokasi.map(l => `<option>${l}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label for="f-waktu">Waktu kejadian <span class="req">*</span></label>
        <input id="f-waktu" type="text" value="21 Sep 2026, 08:40 WIB">
      </div>
    </div>
    <div class="field has-error">
      <label for="f-foto">Foto lokasi <span class="req">*</span></label>
      <input id="f-foto" type="text" placeholder="Belum ada lampiran" readonly>
      <span class="msg">${I('<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>', 13)}
        Minimal satu foto lokasi diperlukan sebelum laporan dapat dikirim.</span>
    </div>
    <div class="field">
      <label for="f-kronologi">Kronologi singkat <span class="req">*</span></label>
      <textarea id="f-kronologi" rows="3" placeholder="Apa yang terjadi, dalam urutan waktu. Tanpa menyebut siapa yang salah."></textarea>
      <span class="hint">Analisis akar masalah dilakukan terpisah di tahap investigasi.</span>
    </div>
    <div class="drop"><b>Ambil foto</b> atau lepaskan berkas di sini · JPG/PNG maksimal 10 MB</div>`;

  const formBahaya = `
    <div class="field">
      <label>Kategori <span class="req">*</span></label>
      <div class="picks">
        <button type="button" class="pick" data-pick="kat" aria-pressed="true">
          <span class="pt">Unsafe Condition</span><span class="pd">Kondisi tidak aman</span></button>
        <button type="button" class="pick" data-pick="kat" aria-pressed="false">
          <span class="pt">Unsafe Action</span><span class="pd">Perilaku tidak aman</span></button>
        <button type="button" class="pick" data-pick="kat" aria-pressed="false">
          <span class="pt">Aspek Lingkungan</span><span class="pd">Dampak lingkungan</span></button>
      </div>
    </div>
    <div class="field">
      <label for="b-lokasi">Lokasi <span class="req">*</span></label>
      <select id="b-lokasi">${D.lokasi.map(l => `<option>${l}</option>`).join('')}</select>
    </div>
    <div class="field">
      <label for="b-isi">Apa yang Anda lihat? <span class="req">*</span></label>
      <textarea id="b-isi" rows="2" placeholder="Satu kalimat sudah cukup."></textarea>
    </div>
    <div class="drop"><b>Ambil foto</b> · satu foto membuat laporan jauh lebih cepat ditindaklanjuti</div>
    <label style="display:flex;gap:var(--space-2);align-items:center;margin-top:var(--space-4);font-size:13px">
      <input type="checkbox" id="b-anon" style="width:18px;height:18px;min-height:0;box-shadow:none">
      Kirim sebagai laporan anonim
    </label>`;

  const ACTIONS = {
    'lapor-insiden': { title: 'Lapor Insiden', sub: 'Empat langkah · draf tersimpan otomatis', body: formInsiden,
      ok: 'Kirim Laporan', toast: 'Laporan terkirim. Nomor INC-2026-0319.' },
    'lapor-bahaya': { title: 'Lapor Bahaya', sub: 'Target 30 detik · foto, lokasi, satu kalimat', body: formBahaya,
      ok: 'Kirim Laporan', toast: 'Laporan terkirim. Nomor HZ-2026-0452.' },
    'inspeksi-baru': { title: 'Mulai Inspeksi', sub: 'Pilih jenis checklist yang akan dikerjakan',
      body: `<div class="field"><label for="i-jenis">Jenis inspeksi <span class="req">*</span></label>
        <select id="i-jenis">${['APAR & Hydrant', 'Jalur Evakuasi', 'P3K', 'Forklift & Alat Angkat', 'Panel Listrik', 'Higiene & Sanitasi Produksi', 'Boiler', 'IPAL'].map(x => `<option>${x}</option>`).join('')}</select></div>
        <div class="field"><label for="i-area">Area <span class="req">*</span></label>
        <select id="i-area">${D.lokasi.map(l => `<option>${l}</option>`).join('')}</select></div>
        <div class="tile-note">Checklist dapat disimpan sebagai draf dan dilanjutkan di perangkat lain. Jawaban "Tidak Sesuai" akan membuka isian temuan.</div>`,
      ok: 'Mulai', toast: 'Inspeksi INS-2026-0915 dimulai.' },
    'izin-baru': { title: 'Ajukan Izin Kerja', sub: 'JSEA wajib lengkap sebelum izin dapat diterbitkan',
      body: `<div class="field"><label for="p-jenis">Jenis izin <span class="req">*</span></label>
        <select id="p-jenis">${['Panas', 'Ruang Terbatas', 'Ketinggian', 'Listrik / LOTO', 'Penggalian', 'Kimia', 'Pengangkatan'].map(x => `<option>${x}</option>`).join('')}</select></div>
        <div class="field"><label for="p-judul">Uraian pekerjaan <span class="req">*</span></label>
        <input id="p-judul" type="text" placeholder="Contoh: Pengelasan pipa uap — Ruang Boiler 2"></div>
        <div class="row2">
          <div class="field"><label for="p-mulai">Mulai <span class="req">*</span></label><input id="p-mulai" type="text" value="22 Sep 2026, 08.00 WIB"></div>
          <div class="field"><label for="p-selesai">Selesai <span class="req">*</span></label><input id="p-selesai" type="text" value="22 Sep 2026, 16.00 WIB"></div>
        </div>
        <div class="tile-note">Langkah berikutnya adalah menyusun JSEA. Izin tidak dapat diterbitkan selama risiko sisa berada di zona Ekstrem (15–25).</div>`,
      ok: 'Lanjut ke JSEA', toast: 'Draf izin WP-2026-0915 dibuat. Lanjutkan ke JSEA.' },
    'input-uji': { title: 'Input Hasil Uji Lingkungan', sub: 'Nilai dibandingkan otomatis dengan baku mutu',
      body: `<div class="field"><label for="e-dom">Domain <span class="req">*</span></label>
        <select id="e-dom"><option>PPPA — Pengendalian Pencemaran Air</option><option>PPPU — Pengendalian Pencemaran Udara</option><option>PLB3 — Limbah B3</option><option>Waste Management</option></select></div>
        <div class="field"><label for="e-tgl">Tanggal pengujian <span class="req">*</span></label><input id="e-tgl" type="text" value="21 Sep 2026"></div>
        <div class="field"><label for="e-lab">Laboratorium <span class="req">*</span></label><input id="e-lab" type="text" placeholder="Nama lab terakreditasi KAN"></div>
        <div class="drop"><b>Unggah sertifikat hasil uji</b> · PDF maksimal 10 MB</div>`,
      ok: 'Simpan Hasil', toast: 'Hasil uji tersimpan. Parameter di luar baku mutu akan membuat CAPA otomatis.' },
    'unggah-kegiatan': { title: 'Unggah Kegiatan SHE', sub: 'Peserta × durasi mengisi KPI Jam Pelatihan K3',
      body: `<div class="field"><label for="a-jenis">Jenis kegiatan <span class="req">*</span></label>
        <select id="a-jenis">${['Safety Talk', 'Safety Patrol', 'Simulasi Tanggap Darurat', 'Pelatihan', 'Rapat P2K3', 'Kampanye K3', 'Audit Internal', 'Kegiatan Lingkungan'].map(x => `<option>${x}</option>`).join('')}</select></div>
        <div class="field"><label for="a-judul">Judul kegiatan <span class="req">*</span></label><input id="a-judul" type="text" placeholder="Contoh: Rapat P2K3 bulan September"></div>
        <div class="row2">
          <div class="field"><label for="a-peserta">Jumlah peserta <span class="req">*</span></label><input id="a-peserta" type="text" value="18"></div>
          <div class="field"><label for="a-durasi">Durasi (jam) <span class="req">*</span></label><input id="a-durasi" type="text" value="2"></div>
        </div>
        <div class="drop"><b>Unggah foto &amp; daftar hadir</b> · JPG/PNG/PDF maksimal 10 MB per berkas</div>`,
      ok: 'Simpan Kegiatan', toast: 'Kegiatan ACT-2026-0092 tersimpan.' },
    'pelatihan-baru': { title: 'Jadwalkan Pelatihan', sub: 'Rencana dulu; aktual diisi setelah pelaksanaan',
      body: `<div class="field"><label for="t-nama">Program pelatihan <span class="req">*</span></label>
        <input id="t-nama" type="text" placeholder="Contoh: Bekerja di Ruang Terbatas"></div>
        <div class="field"><label for="t-jenis">Jenis <span class="req">*</span></label>
        <select id="t-jenis"><option>Wajib Regulasi</option><option>Internal</option><option>Refreshment</option></select></div>
        <div class="row2">
          <div class="field"><label for="t-tgl">Jadwal rencana <span class="req">*</span></label><input id="t-tgl" type="text" value="25–26 Sep 2026"></div>
          <div class="field"><label for="t-peserta">Rencana peserta <span class="req">*</span></label><input id="t-peserta" type="text" value="8"></div>
        </div>
        <div class="field"><label for="t-pjk3">Penyelenggara</label><input id="t-pjk3" type="text" placeholder="PJK3 atau tim internal"></div>
        <div class="tile-note">Kolom aktual pelaksanaan dibuka setelah tanggal rencana lewat, sehingga selisih rencana dan aktual selalu terekam.</div>`,
      ok: 'Simpan Jadwal', toast: 'Pelatihan TRN-2026-029 dijadwalkan.' },
    'risiko-baru': { title: 'Tambah Risiko', sub: 'Tahap 2 dan 3 — identifikasi lalu analisis',
      body: `<div class="field"><label for="r-proses">Proses / area <span class="req">*</span></label>
        <input id="r-proses" type="text" placeholder="Contoh: Utilitas — Kompresor"></div>
        <div class="field"><label for="r-ancaman">Ancaman <span class="req">*</span></label>
        <input id="r-ancaman" type="text" placeholder="Apa yang dapat terjadi"></div>
        <div class="field"><label for="r-sebab">Penyebab <span class="req">*</span></label>
        <textarea id="r-sebab" rows="2" placeholder="Mengapa hal itu mungkin terjadi"></textarea></div>
        <div class="row2">
          <div class="field"><label for="r-l">Kemungkinan (1–5) <span class="req">*</span></label>
          <select id="r-l"><option>1 — Jarang Sekali</option><option>2 — Jarang</option><option selected>3 — Mungkin</option><option>4 — Sering</option><option>5 — Hampir Pasti</option></select></div>
          <div class="field"><label for="r-s">Keparahan (1–5) <span class="req">*</span></label>
          <select id="r-s"><option>1 — Ringan</option><option>2 — Sedang</option><option selected>3 — Serius</option><option>4 — Mayor</option><option>5 — Katastropik</option></select></div>
        </div>
        <div class="tile-note">Tahap berikutnya adalah evaluasi dan penanganan. Opsi penanganan ditawarkan dalam urutan Hindari → Kurangi → Transfer → Terima.</div>`,
      ok: 'Simpan & Lanjut Evaluasi', toast: 'Risiko RSK-2026-009 tersimpan. Lanjutkan ke evaluasi.' },
    'ai-cara': { title: 'Cara Kerja Asisten QHSE', sub: 'Apa yang dikerjakannya, dan apa yang tidak',
      body: `
        <p style="font-size:14px;line-height:22px;color:var(--ink-700);margin:0 0 var(--space-5)">Asisten berjalan sepenuhnya di dalam peramban. Tidak ada server, tidak ada kunci API, dan tidak ada model bahasa di belakangnya. Empat kemampuannya nyata dan dapat diperiksa satu per satu.</p>
        <dl class="kv">
          <dt>Referensi dokumen baru</dt>
          <dd>Membaca daftar dokumen terkendali, mengambil nomor bebas berikutnya pada serinya, memetakan klausul ISO 45001, ISO 14001, ISO 9001, dan SMK3 PP 50/2012 dari tabel pemetaan kata kunci, lalu menyusun kerangka isi sesuai tingkat dokumennya. Catatan yang membenarkan penerbitannya diambil dari insiden, temuan audit, CAPA, dan register risiko yang benar-benar ada.</dd>
          <dt>Pencarian dokumen ISO</dt>
          <dd>Menelusuri dokumen internal empat tingkat, sertifikat dan izin eksternal, serta dua belas elemen SMK3.</dd>
          <dt>Pencarian seluruh data</dt>
          <dd>Satu indeks atas insiden, laporan bahaya, observasi perilaku, inspeksi, checklist, izin kerja dan JSEA, register risiko, CAPA, audit dan temuannya, parameter lingkungan, dokumen, pelatihan dan sertifikasi personel, kegiatan, KPI, notifikasi, kinerja antarpabrik, serta pengguna dan hak aksesnya. Seluruh kata yang diketik harus muncul pada catatan yang sama.</dd>
          <dt>Ringkasan eksekutif</dt>
          <dd>Mengenali topik dari kalimat permintaan, lalu menghitung ulang setiap angkanya dari data modul dan menyusun bagian mana yang perlu keputusan manajemen.</dd>
        </dl>
        <div class="tile-note" style="margin-top:var(--space-5)">Yang tidak dikerjakannya: mengarang jawaban. Bila sesuatu tidak ada di dalam data, asisten mengatakan tidak ada — bukan menebak. Untuk sistem QHSE sifat ini lebih berharga daripada kemampuan menjawab bebas, karena ringkasan yang dibawa ke rapat manajemen harus dapat dipertanggungjawabkan sampai ke baris datanya.</div>` },
    'dokumen-baru': { title: 'Terbitkan Dokumen Internal', sub: 'Nomor, revisi, pemilik, dan tanggal tinjau wajib',
      body: `<div class="field"><label for="d-level">Tingkat dokumen <span class="req">*</span></label>
        <select id="d-level"><option>L1 — Manual &amp; Kebijakan</option><option>L2 — Prosedur</option><option selected>L3 — Instruksi Kerja</option><option>L4 — Formulir &amp; Rekaman</option></select></div>
        <div class="field"><label for="d-judul">Judul dokumen <span class="req">*</span></label><input id="d-judul" type="text" placeholder="Contoh: IK Penggerindaan Tangan"></div>
        <div class="row2">
          <div class="field"><label for="d-pemilik">Pemilik dokumen <span class="req">*</span></label><input id="d-pemilik" type="text" value="QHSE Supervisor"></div>
          <div class="field"><label for="d-tinjau">Tinjau ulang <span class="req">*</span></label><input id="d-tinjau" type="text" value="21 Sep 2027"></div>
        </div>
        <div class="drop"><b>Unggah berkas dokumen</b> · PDF atau DOCX maksimal 20 MB</div>
        <div class="tile-note" style="margin-top:var(--space-4)">Saat revisi baru disahkan, versi sebelumnya otomatis ditarik dari peredaran dan ditandai kedaluwarsa.</div>`,
      ok: 'Terbitkan', toast: 'Dokumen KGI-33 revisi 1 diterbitkan.' },
    'compliance-baru': { title: 'Daftarkan Dokumen Kepatuhan', sub: 'Peringatan otomatis H-60, H-30, H-14, H-7',
      body: `<div class="field"><label for="c-jenis">Jenis <span class="req">*</span></label>
        <select id="c-jenis"><option>Sertifikat Sistem</option><option>Izin Lingkungan</option><option selected>Izin Peralatan</option><option>Pelaporan Wajib</option></select></div>
        <div class="field"><label for="c-judul">Nama dokumen <span class="req">*</span></label><input id="c-judul" type="text" placeholder="Contoh: SKLO Bejana Tekan Kompresor"></div>
        <div class="row2">
          <div class="field"><label for="c-penerbit">Penerbit <span class="req">*</span></label><input id="c-penerbit" type="text" placeholder="Disnaker / DLH / lembaga sertifikasi"></div>
          <div class="field"><label for="c-berlaku">Berlaku sampai <span class="req">*</span></label><input id="c-berlaku" type="text" value="21 Sep 2028"></div>
        </div>
        <div class="drop"><b>Unggah pindaian dokumen</b> · PDF maksimal 20 MB</div>`,
      ok: 'Daftarkan', toast: 'Dokumen CMP-013 terdaftar dan mulai dipantau.' },
    'checklist-mulai': { title: 'Kerjakan Checklist', sub: 'Alat tidak boleh beroperasi sebelum checklist selesai',
      body: `<div class="field"><label for="k-jenis">Jenis checklist <span class="req">*</span></label>
        <select id="k-jenis"><option>P2H Forklift</option><option>Pra-nyala Boiler</option><option>Kepatuhan APD Lini Produksi</option><option>Kebersihan &amp; Kerapian Area (5R)</option><option>Ruang Panel &amp; Genset</option></select></div>
        <div class="row2">
          <div class="field"><label for="k-unit">Unit / area <span class="req">*</span></label><input id="k-unit" type="text" placeholder="Contoh: FL-05"></div>
          <div class="field"><label for="k-shift">Shift <span class="req">*</span></label><select id="k-shift"><option>Shift 1</option><option>Shift 2</option></select></div>
        </div>
        <div class="tile-note">Satu butir dijawab "Tidak Sesuai" akan mengunci unit dari operasi dan membuka isian temuan.</div>`,
      ok: 'Mulai Checklist', toast: 'Checklist CHK-2026-1847 dimulai.' },
    'observasi-baru': { title: 'Catat Observasi Perilaku', sub: 'Tanpa nama pekerja yang diamati',
      body: `<div class="field"><label for="o-area">Area pengamatan <span class="req">*</span></label>
        <select id="o-area">${D.lokasi.map(l => `<option>${l}</option>`).join('')}</select></div>
        <div class="row2">
          <div class="field"><label for="o-aman">Perilaku aman teramati <span class="req">*</span></label><input id="o-aman" type="text" value="10"></div>
          <div class="field"><label for="o-risk">Perilaku berisiko <span class="req">*</span></label><input id="o-risk" type="text" value="1"></div>
        </div>
        <div class="field"><label for="o-kat">Kategori perilaku berisiko</label>
        <select id="o-kat"><option>Alat Pelindung Diri</option><option>Posisi &amp; Postur Tubuh</option><option>Alat &amp; Peralatan Kerja</option><option>Kepatuhan Prosedur</option><option>Kerapian &amp; Kebersihan</option><option>Reaksi Terhadap Pengamat</option></select></div>
        <div class="field"><label for="o-tindak">Percakapan di tempat <span class="req">*</span></label>
        <textarea id="o-tindak" rows="2" placeholder="Apa yang dibicarakan dan apa yang disepakati"></textarea>
        <span class="hint">Wajib diisi. Observasi tanpa percakapan hanyalah angka.</span></div>`,
      ok: 'Simpan Observasi', toast: 'Observasi OBS-2026-0613 tersimpan.' },
    'tandai-baca': { title: 'Tandai Semua Terbaca', sub: 'Pemberitahuan tetap tersimpan di riwayat',
      body: `<div class="tile-note" style="border:0;padding:0">Tiga pemberitahuan belum dibaca akan ditandai terbaca. Item yang lewat tenggat tetap dikirim ulang setiap hari sampai ditutup di modulnya, jadi menandai terbaca tidak menghentikan pengingat.</div>`,
      ok: 'Tandai Terbaca', toast: 'Semua pemberitahuan ditandai terbaca.' },
    'lupa-sandi': { title: 'Lupa Kata Sandi', sub: 'Purwarupa — tidak ada email yang benar-benar dikirim',
      body: `<div class="tile-note" style="border:0;padding:0">Pada sistem sebenarnya, tautan pengaturan ulang dikirim ke alamat email korporat Anda dan berlaku 60 menit. Di purwarupa ini seluruh akun demo memakai kata sandi <code>demo1234</code>.</div>`,
      ok: 'Mengerti', toast: 'Tautan pengaturan ulang akan dikirim ke email korporat Anda.' },
    'tambah-pengguna': { title: 'Tambah Pengguna', sub: 'Undangan dikirim ke email korporat dan berlaku 14 hari',
      body: `<div class="field"><label for="u-nama">Nama lengkap <span class="req">*</span></label>
        <input id="u-nama" type="text" placeholder="Nama sesuai data kepegawaian"></div>
        <div class="field"><label for="u-email">Alamat email <span class="req">*</span></label>
        <input id="u-email" type="email" placeholder="nama@khongguan.co.id"></div>
        <div class="row2">
          <div class="field"><label for="u-peran">Peran <span class="req">*</span></label>
          <select id="u-peran"><option>Operator Produksi</option><option selected>QHSE Supervisor</option><option>Petugas Lingkungan</option><option>Plant Manager</option><option>Administrator Sistem</option></select></div>
          <div class="field"><label for="u-lokasi">Pabrik <span class="req">*</span></label>
          <select id="u-lokasi"><option>Pabrik Cibitung</option><option>Pabrik Bekasi</option><option>Pabrik Semarang</option><option>Pabrik Medan</option><option>Kantor Pusat</option></select></div>
        </div>
        <div class="tile-note">Hak akses mengikuti peran, bukan per orang. Peran dapat diubah kapan saja tanpa membuat akun baru.</div>`,
      ok: 'Kirim Undangan', toast: 'Undangan terkirim. Akun aktif setelah pengguna menyetel kata sandi.' },
    'simpan-preferensi': { title: 'Simpan Preferensi', sub: 'Tersimpan di peramban ini',
      body: `<div class="tile-note" style="border:0;padding:0">Tema dan bahasa langsung tersimpan begitu Anda mengubahnya, jadi tombol ini hanya menyimpan pilihan pabrik, periode, dan kanal pemberitahuan. Pada sistem sebenarnya ketiganya tersimpan di profil pengguna, bukan di peramban.</div>`,
      ok: 'Simpan', toast: 'Preferensi tersimpan.' },
    'unduh': { title: 'Siapkan Laporan', sub: 'Purwarupa — berkas tidak benar-benar dihasilkan',
      body: `<div class="tile-note" style="border:0;padding:0">Pada sistem sebenarnya, laporan dirakit dari data modul terkait, diberi kop dengan lambang korporat Khong Guan, lalu dikirim sebagai PDF ke daftar penerima.</div>`,
      ok: 'Mengerti', toast: 'Laporan sedang disiapkan.' }
  };

  /* ───────── Modul 17 · Dashboard Eksekutif ───────── */
  function viewExec() {
    const statusChip = { 'Baik': 'low', 'Perhatian': 'medium', 'Kritis': 'critical' };
    const mh = D.pabrikKinerja.reduce((a, p) => a + Number(p.manhours.replace(/\./g, '')), 0);
    return hero({
      eyebrow: 'DASHBOARD EKSEKUTIF · KHONG GUAN GROUP',
      title: 'Kinerja QHSE Empat Pabrik',
      desc: 'Satu layar untuk manajemen grup: pembandingan antarpabrik, arah indikator utama, dan kemajuan program strategis. Tidak ada daftar pekerjaan di sini — halaman ini dibaca, bukan dikerjakan.',
      metric: '0,43', metricLabel: 'TRIR GRUP TAHUN BERJALAN · TARGET ≤ 0,50'
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'TRIR GRUP', value: '0,43', icon: 'kpi', arah: 'good', delta: '0,29 vs 2025', note: '(TRC × 200.000) ÷ jam kerja · target ≤ 0,50', sub: 'Tingkat grup · 4 pabrik · tahun berjalan', periode: 'Tahun berjalan 2026 · seluruh grup', rumus: '(TRC × 200.000) ÷ total jam kerja grup', sumber: 'Agregasi modul Incident seluruh pabrik', rincian: bars([['Cibitung', 0.44, 0.6, 'high'], ['Bekasi', 0.30, 0.6, 'low'], ['Semarang', 0.56, 0.6, 'critical'], ['Medan', 0.41, 0.6, 'medium']]), catatan: 'Angka grup menyembunyikan sebaran antarpabrik. Semarang di 0,56 berada di atas target meskipun angka grup lolos — karena itu kartu skor pabrik dibaca berdampingan dengan ubin ini.' })}
        ${tile({ label: 'LTIFR GRUP', value: '1,71', icon: 'kpi', arah: 'good', delta: '0,54 vs 2025', note: '(LTI × 1.000.000) ÷ jam kerja · target ≤ 2,00', sub: 'Tingkat grup · 4 pabrik · tahun berjalan', periode: 'Tahun berjalan 2026 · seluruh grup', rumus: '(LTI × 1.000.000) ÷ total jam kerja grup', sumber: 'Agregasi modul Incident seluruh pabrik', catatan: 'LTIFR memakai basis 1.000.000 jam, TRIR memakai 200.000 jam. Dua angka ini tidak boleh dibandingkan langsung satu sama lain.' })}
        ${tile({ label: 'TOTAL SAFE MANHOURS', value: mh.toLocaleString('id-ID'), big: true, icon: 'clock', arah: 'good', delta: '4 pabrik · tahun berjalan', note: 'Akumulasi jam kerja aman seluruh grup', sub: 'Tingkat grup · 4 pabrik · tahun berjalan', periode: 'Tahun berjalan 2026 · seluruh grup', rumus: 'Σ jam kerja seluruh pabrik sejak LTI masing-masing', sumber: 'Absensi produksi tiap pabrik', rincian: bars(D.pabrikKinerja.map(function (x) { return [x.nama, Number(x.manhours.replace(/\./g, '')), mh, 'info']; })), catatan: 'Angka akumulatif ini kembali ke nol per pabrik pada kecelakaan hilang waktu kerja berikutnya, jadi ia tidak pernah dipakai sendirian sebagai ukuran keberhasilan program.' })}
        ${tile({ label: 'PABRIK NIHIL LTI', value: '3', unit: '/4', icon: 'shield', arah: 'good', delta: 'Semarang belum nihil', note: 'Sepanjang 2026 · target 4 dari 4', sub: 'Tingkat grup · 4 pabrik · tahun berjalan', periode: 'Tahun berjalan 2026 · seluruh grup', rumus: 'Jumlah pabrik tanpa kecelakaan hilang waktu kerja sepanjang tahun berjalan', sumber: 'Modul Incident tiap pabrik', catatan: 'Status pabrik ditentukan oleh indikator terburuk, bukan rata-rata. Satu pabrik yang belum nihil tidak boleh tertutup oleh tiga pabrik yang sudah nihil.' })}
      </div>

      <section class="section panel">
        <div class="panel-bar"><h2>Kartu Skor Pabrik</h2>
          <span class="sub" style="font-size:12px;color:var(--ink-500)">Status ditentukan oleh indikator terburuk, bukan rata-rata</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>PABRIK</th><th>PEKERJA</th><th>JAM KERJA</th><th>TRIR</th><th>LTIFR</th>
              <th>INSIDEN</th><th>LAPORAN BAHAYA</th><th>CAPA TEPAT WAKTU</th><th>SMK3</th><th>STATUS</th></tr></thead>
            <tbody>
              ${D.pabrikKinerja.map(p => `
                <tr class="${p.status === 'Kritis' ? 'is-overdue' : ''}" ${infoAttr({
                  title: `Pabrik ${p.nama}`,
                  sub: `Kartu skor pabrik · ${D.periode}`,
                  body: chipRow([
                    chip(p.status.toUpperCase(), p.status === 'Kritis' ? 'critical' : p.status === 'Perhatian' ? 'high' : 'low')
                  ]) + kv([
                    ['Pekerja', `<span class="mono">${p.pekerja}</span> orang`],
                    ['Jam kerja', `<span class="mono">${p.manhours}</span>`],
                    ['TRIR', `<span class="mono">${p.trir}</span> · basis 200.000 jam`],
                    ['LTIFR', `<span class="mono">${p.ltifr}</span> · basis 1.000.000 jam`],
                    ['Insiden tercatat', `<span class="mono">${p.insiden}</span>`],
                    ['Laporan bahaya', `<span class="mono">${p.bahaya}</span> — leading indicator, makin tinggi makin baik`],
                    ['CAPA tepat waktu', `<span class="mono">${p.capa}</span>`],
                    ['Pemenuhan SMK3', `<span class="mono">${p.smk3}</span>`]
                  ]) + foot('Status pabrik ditentukan oleh indikator terburuk, bukan rata-rata. Merata-ratakan akan menyembunyikan satu angka yang bermasalah di balik angka lain yang baik.')
                })}>
                  <td style="font-weight:600;color:var(--ink-900)">${p.nama}</td>
                  <td class="mono mono--muted">${p.pekerja}</td>
                  <td class="mono mono--muted">${p.manhours}</td>
                  <td class="mono" style="font-size:15px;font-weight:600;color:var(--ink-900)">${p.trir}</td>
                  <td class="mono">${p.ltifr}</td>
                  <td class="mono">${p.insiden}</td>
                  <td class="mono">${p.bahaya}</td>
                  <td class="mono">${p.capa}</td>
                  <td class="mono">${p.smk3}</td>
                  <td>${chip(p.status.toUpperCase(), statusChip[p.status], true)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section grid grid--2">
        <div class="card">
          <h3>Arah TRIR Grup 12 Bulan</h3>
          <div class="card-sub">Lagging · makin rendah makin baik · target ≤ 0,50</div>
          ${lineChart(D.trenTrir, { target: 0.5, targetLabel: 'target 0,50',
            aria: 'Grafik TRIR grup per bulan, turun dari 0,71 pada Oktober ke 0,42 pada September.' })}
        </div>
        <div class="card">
          <h3>Program Strategis QHSE</h3>
          <div class="card-sub">Komitmen tahun berjalan dan kemajuannya</div>
          ${D.programStrategis.map(p => {
            const pct = Math.round(p.capai / p.dari * 100);
            return `<div class="is-clickable" style="margin-bottom:var(--space-4)" ${infoAttr({
              title: p.nama,
              sub: `Program strategis · tenggat ${p.tenggat}`,
              body: `<div class="info-num">${pct}<span class="tile-unit">% tercapai</span></div>`
                + chipRow([
                  chip(p.status.toUpperCase(), p.status === 'Terjadwal' ? 'info' : pct === 100 ? 'low' : 'medium', true)
                ]) + kv([
                  ['Target', p.target],
                  ['Kemajuan', `<span class="mono">${p.capai}</span> dari <span class="mono">${p.dari}</span> (${pct}%)`],
                  ['Tenggat', `<span class="mono">${p.tenggat}</span>`],
                  ['Status', p.status]
                ]) + foot('Program strategis dipantau di tingkat grup. Yang tidak dapat diselesaikan di tingkat pabrik naik ke bagian Perlu keputusan manajemen.')
            })}>
              <div style="display:flex;justify-content:space-between;gap:var(--space-3);margin-bottom:5px">
                <span style="font-size:14px;font-weight:600;color:var(--ink-900)">${p.nama}</span>
                <span class="mono mono--muted" style="white-space:nowrap">${p.capai}/${p.dari}</span>
              </div>
              <div class="bar ${pct === 100 ? 'bar--low' : pct >= 50 ? '' : 'bar--medium'}"><span style="width:${Math.max(pct, 2)}%"></span></div>
              <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:12px;color:var(--ink-500)">
                <span>${p.target}</span><span class="mono">tenggat ${p.tenggat}</span>
              </div>
            </div>`; }).join('')}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Perlu keputusan manajemen</h2>
          <span class="sub">Hal yang tidak dapat diselesaikan di tingkat pabrik</span></div>
        <div class="grid grid--3">
          ${[['critical', 'SKLO Boiler 2 Cibitung kedaluwarsa', 'Boiler beroperasi tanpa Surat Keterangan Layak Operasi sejak 30 Jun 2026. Pilihan: hentikan boiler 2 sampai riksa uji selesai, atau percepat penjadwalan PJK3 dengan biaya ekspres.'],
             ['critical', 'Semarang di atas target TRIR', 'TRIR 0,56 dan penyelesaian CAPA 68%. Perlu penugasan petugas K3 tambahan atau pendampingan dari tim Cibitung selama satu triwulan.'],
             ['high', 'Penggantian boiler tua Cibitung', 'Boiler 2 berumur 14 tahun dan menjadi risiko RSK-2026-001. Anggaran belanja modal Q2 2027 perlu diputuskan pada rapat anggaran Oktober.']]
            .map(([k, t, d]) => `<div class="card is-clickable" ${infoAttr({
              title: t,
              sub: 'Perlu keputusan manajemen · tingkat grup',
              body: chipRow([chip(k === 'critical' ? 'KEPUTUSAN SEGERA' : 'KEPUTUSAN ANGGARAN', k)])
                + `<p style="font-size:14px;line-height:21px;color:var(--ink-700);margin:0 0 var(--space-5)">${d}</p>`
                + kv([
                  ['Tingkat', k === 'critical' ? 'Keputusan segera' : 'Keputusan anggaran'],
                  ['Diputuskan oleh', k === 'critical' ? 'Plant Manager dan manajemen grup' : 'Rapat anggaran grup']
                ]) + foot('Papan eksekutif tanpa bagian ini hanya memindahkan angka, tidak memindahkan keputusan. Isinya adalah hal yang tidak dapat diselesaikan di tingkat pabrik: belanja modal, penugasan orang, dan penjadwalan lembaga sertifikasi.')
            })}>
              ${chip(k === 'critical' ? 'KEPUTUSAN SEGERA' : 'KEPUTUSAN ANGGARAN', k)}
              <h3 style="margin-top:10px">${t}</h3>
              <p style="font-size:13px;line-height:20px;color:var(--ink-500);margin:0">${d}</p>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 11 · Manajemen Pelatihan ───────── */
  function viewTraining() {
    const selesai = D.pelatihan.filter(p => p.status === 'Selesai');
    const realisasi = Math.round(selesai.reduce((a, p) => a + p.aktualPeserta, 0) /
      D.pelatihan.reduce((a, p) => a + p.rencanaPeserta, 0) * 100);
    return hero({
      eyebrow: 'MODUL 11 · MANAJEMEN PELATIHAN',
      title: 'Pelatihan & Sertifikasi K3',
      desc: 'Tiga kolom yang selalu berdampingan: jadwal, rencana pelaksanaan, dan aktual pelaksanaan. Selisih antara rencana dan aktual adalah informasinya — itulah yang ditanya auditor, bukan daftar pelatihan yang pernah diadakan.',
      action: { act: 'pelatihan-baru', icon: 'training', label: 'Jadwalkan Pelatihan' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'PROGRAM TAHUN INI', value: String(D.pelatihan.length), icon: 'training', arah: 'flat', delta: '5 wajib regulasi · 3 internal', note: 'Rencana pelatihan tahunan 2026' })}
        ${tile({ label: 'REALISASI PESERTA', value: String(realisasi), unit: '%', icon: 'kpi', arah: 'bad', delta: '1 program tertunda', note: 'Aktual peserta ÷ rencana peserta · target ≥ 90%' })}
        ${tile({ label: 'JAM PELATIHAN', value: '18,2', unit: 'jam/org', icon: 'clock', arah: 'good', delta: '2,4 jam vs Agustus', note: 'Akumulasi tahun berjalan · Leading' })}
        ${tile({ label: 'SERTIFIKAT H-60', value: '2', icon: 'incident', arah: 'bad', delta: 'terdekat 17 hari lagi', note: 'Teknisi K3 Listrik · Ahli K3 Pesawat Uap' })}
      </div>

      <section class="section panel">
        <div class="panel-bar"><h2>Jadwal, Rencana, dan Aktual Pelaksanaan</h2>
          <button class="pill" aria-pressed="true">Semua</button>
          <button class="pill" aria-pressed="false">Wajib Regulasi</button>
          <button class="pill" aria-pressed="false">Belum Terlaksana</button>
        </div>
        <div class="table-wrap">
          <table style="min-width:1180px">
            <thead>
              <tr>
                <th rowspan="2">NO.</th><th rowspan="2">PROGRAM PELATIHAN</th><th rowspan="2">JENIS</th>
                <th colspan="2" style="text-align:center;border-left:2px solid var(--border-200)">RENCANA</th>
                <th colspan="2" style="text-align:center;border-left:2px solid var(--border-200)">AKTUAL</th>
                <th rowspan="2">SELISIH</th><th rowspan="2">STATUS</th>
              </tr>
              <tr>
                <th style="border-left:2px solid var(--border-200)">JADWAL</th><th>PESERTA</th>
                <th style="border-left:2px solid var(--border-200)">PELAKSANAAN</th><th>PESERTA</th>
              </tr>
            </thead>
            <tbody>
              ${D.pelatihan.map(p => {
                const d = p.aktualPeserta - p.rencanaPeserta;
                return `<tr class="${p.status === 'Tertunda' ? 'is-overdue' : ''}" ${infoAttr({
                  title: p.id,
                  sub: `${p.nama} · ${p.penyelenggara}`,
                  body: chipRow([
                    chip(p.jenis.toUpperCase(), p.jenis === 'Wajib Regulasi' ? 'critical' : p.jenis === 'Refreshment' ? 'medium' : 'info'),
                    chip(p.status.toUpperCase(), p.status === 'Tertunda' ? 'critical' : T.status[p.status] || 'info', true),
                    p.status === 'Selesai' && d !== 0 ? chip((d > 0 ? '+' : '') + d + ' PESERTA', 'high') : ''
                  ]) + lead(p.nama) + kv([
                    ['Jenis', p.jenis],
                    ['Penyelenggara', p.penyelenggara],
                    ['Target peserta', `<span class="mono">${p.target}</span> orang`],
                    ['Rencana', `<span class="mono">${p.rencanaTgl}</span> · ${p.rencanaPeserta} peserta`],
                    ['Aktual', `<span class="mono">${p.aktualTgl}</span> · ${p.aktualPeserta} peserta`],
                    ['Selisih peserta', p.status === 'Selesai'
                      ? (d === 0 ? 'Sesuai rencana' : `<span class="mono">${d > 0 ? '+' : ''}${d}</span> terhadap rencana`)
                      : 'Belum dapat dihitung — pelaksanaan belum selesai'],
                    ['Biaya', `Rp ${p.biaya} juta`]
                  ]) + foot(p.status === 'Tertunda'
                    ? 'Yang ditanya auditor bukan daftar pelatihan yang pernah diadakan, melainkan mengapa yang direncanakan belum terlaksana.'
                    : 'Jam-orang pelatihan ini mengalir ke KPI Jam Pelatihan K3 di modul SHE KPI & Analytics.')
                })}>
                  <td class="mono mono--id">${p.id}</td>
                  <td><div style="font-weight:600;color:var(--ink-900)">${p.nama}</div>
                    <div style="font-size:12px;color:var(--ink-500)">${p.penyelenggara} · Rp ${p.biaya} jt</div></td>
                  <td>${chip(p.jenis.toUpperCase(), p.jenis === 'Wajib Regulasi' ? 'critical' : p.jenis === 'Refreshment' ? 'medium' : 'info')}</td>
                  <td class="mono mono--muted" style="border-left:2px solid var(--border-200)">${p.rencanaTgl}</td>
                  <td class="mono">${p.rencanaPeserta}</td>
                  <td class="mono ${p.aktualTgl === '—' ? 'mono--muted' : ''}" style="border-left:2px solid var(--border-200)">${p.aktualTgl}</td>
                  <td class="mono">${p.aktualPeserta}</td>
                  <td>${p.status === 'Selesai'
                      ? (d === 0 ? chip('SESUAI RENCANA', 'low') : chip((d > 0 ? '+' : '') + d + ' PESERTA', 'high'))
                      : chip('BELUM', 'neutral')}</td>
                  <td>${chip(p.status.toUpperCase(), p.status === 'Tertunda' ? 'critical' : T.status[p.status] || 'info', true)}</td>
                </tr>`; }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section panel">
        <div class="panel-bar"><h2>Sertifikasi Personel Wajib</h2>
          <span class="sub" style="font-size:12px;color:var(--ink-500)">Peringatan otomatis pada H-60, H-30, dan H-14</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>SERTIFIKASI</th><th>PEMEGANG</th><th>NOMOR</th><th>BERLAKU SAMPAI</th><th>SISA</th><th>STATUS</th></tr></thead>
            <tbody>
              ${D.sertifikasi.map(s => `
                <tr class="${s.sisa <= 30 ? 'is-overdue' : ''}" ${infoAttr({
                  title: s.nama,
                  sub: `${s.pemegang} · berlaku sampai ${s.berlaku}`,
                  body: `<div class="info-num">${s.sisa}<span class="tile-unit">hari tersisa</span></div>`
                    + chipRow([
                      chip(s.sisa <= 30 ? 'SEGERA HABIS' : s.sisa <= 60 ? 'PERHATIAN' : 'AMAN',
                        s.sisa <= 30 ? 'critical' : s.sisa <= 60 ? 'high' : 'low')
                    ]) + kv([
                      ['Sertifikasi', s.nama],
                      ['Pemegang', s.pemegang],
                      ['Nomor', `<span class="mono">${s.nomor}</span>`],
                      ['Berlaku sampai', `<span class="mono">${s.berlaku}</span>`],
                      ['Sisa masa berlaku', `<span class="mono">${s.sisa}</span> hari`]
                    ]) + foot('Ambang tetap: sisa ≤ 30 hari merah, ≤ 60 hari jingga. Perpanjangan sertifikasi wajib dimulai sebelum masuk ambang merah, karena penjadwalan lembaga sertifikasi memerlukan waktu.')
                })}>
                  <td style="font-weight:600;color:var(--ink-900)">${s.nama}</td>
                  <td>${s.pemegang}</td>
                  <td class="mono mono--muted">${s.nomor}</td>
                  <td class="mono">${s.berlaku}</td>
                  <td class="mono" style="${s.sisa <= 30 ? 'color:var(--signal-critical);font-weight:600' : ''}">${s.sisa} hari</td>
                  <td>${s.sisa <= 30 ? chip('SEGERA PERPANJANG', 'critical') : s.sisa <= 60 ? chip('SIAPKAN', 'high') : chip('BERLAKU', 'low')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 12 · Manajemen Risiko ───────── */
  function viewRisk() {
    const K = D.risikoKonteks, R = D.risikoRegister;
    const tahap = [
      ['Penetapan Konteks', 'Ruang lingkup, lingkungan internal dan eksternal, serta kriteria penerimaan risiko.'],
      ['Identifikasi Risiko', 'Mendaftarkan ancaman, penyebab, dan dampaknya pada tiap proses.'],
      ['Analisis Risiko', 'Menghitung kemungkinan × keparahan dengan matriks 5×5.'],
      ['Evaluasi Risiko', 'Membandingkan skor dengan kriteria untuk menetapkan prioritas.'],
      ['Penanganan Risiko', 'Menghindari, mengurangi, mentransfer, atau menerima — dengan penanggung jawab dan tenggat.'],
      ['Pemantauan & Reviu', 'Memeriksa apakah pengendalian bekerja, pada tanggal reviu yang ditetapkan.']
    ];
    const ekstrem = R.filter(r => r.L * r.S >= 15).length;
    const turun = R.filter(r => r.sisaL * r.sisaS < r.L * r.S).length;
    return hero({
      eyebrow: 'MODUL 12 · MANAJEMEN RISIKO',
      title: 'Risk Register Pabrik',
      desc: 'Enam tahap ISO 31000 dijalankan berurutan dan terlihat semuanya. Setiap risiko membawa skor awal, opsi penanganan, skor sisa, penanggung jawab, dan tanggal reviu berikutnya.',
      action: { act: 'risiko-baru', icon: 'risk', label: 'Tambah Risiko' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'RISIKO TERDAFTAR', value: String(R.length), icon: 'risk', arah: 'flat', delta: '8 proses · 4 area', note: 'Ditinjau ulang minimal setahun sekali' })}
        ${tile({ label: 'ZONA EKSTREM AWAL', value: String(ekstrem), icon: 'incident', arah: 'bad', delta: 'boiler & kebakaran gudang', note: 'Skor awal 15–25 sebelum pengendalian' })}
        ${tile({ label: 'TURUN SETELAH KENDALI', value: turun + '/' + R.length, icon: 'capa', arah: 'good', delta: 'seluruh risiko menurun', note: 'Skor sisa lebih rendah dari skor awal' })}
        ${tile({ label: 'REVIU BULAN INI', value: '2', icon: 'clock', arah: 'bad', delta: 'terdekat 28 Sep', note: 'IPAL dan pekerjaan kontraktor' })}
      </div>

      <section class="section">
        <div class="section-head"><h2>Enam Tahap</h2><span class="sub">ISO 31000 · berurutan, tidak boleh dilompati</span></div>
        <div class="stepper">
          ${tahap.map((t, i) => `
            <div class="step">
              <span class="step-no">${i + 1}</span>
              <div>
                <div class="step-title">${t[0]}</div>
                <div class="step-desc">${t[1]}</div>
              </div>
            </div>`).join('')}
        </div>
      </section>

      <section class="section grid grid--2">
        <div class="card">
          <h3>1 · Penetapan Konteks</h3>
          <div class="card-sub">Ditinjau ulang setiap tahun atau saat ada perubahan besar</div>
          <div class="label-caps" style="margin-bottom:6px">RUANG LINGKUP</div>
          <p style="font-size:14px;line-height:22px;color:var(--ink-700);margin:0 0 var(--space-4)">${K.lingkup}</p>
          <div class="label-caps" style="margin-bottom:6px">LINGKUNGAN INTERNAL</div>
          <ul style="margin:0 0 var(--space-4);padding-left:20px;font-size:13px;line-height:21px;color:var(--ink-700)">
            ${K.internal.map(x => `<li>${x}</li>`).join('')}</ul>
          <div class="label-caps" style="margin-bottom:6px">LINGKUNGAN EKSTERNAL</div>
          <ul style="margin:0;padding-left:20px;font-size:13px;line-height:21px;color:var(--ink-700)">
            ${K.eksternal.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div class="card">
          <h3>4 · Kriteria Evaluasi Risiko</h3>
          <div class="card-sub">Ambang yang memutuskan apa yang boleh diterima</div>
          <p style="font-size:14px;line-height:22px;color:var(--ink-700);margin:0 0 var(--space-5)">${K.kriteria}</p>
          <div class="label-caps" style="margin-bottom:var(--space-3)">SEBARAN RISIKO SISA</div>
          ${['critical', 'high', 'medium', 'low'].map(z => {
            const label = { critical: 'Ekstrem 15–25', high: 'Tinggi 10–14', medium: 'Sedang 5–9', low: 'Rendah 1–4' }[z];
            const n = R.filter(r => zone(r.sisaL * r.sisaS) === z).length;
            const isi = R.filter(r => zone(r.sisaL * r.sisaS) === z);
            return `<div class="is-clickable" style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)" ${infoAttr({
              title: `Zona ${label}`,
              sub: 'Sebaran risiko sisa · risk register',
              body: `<div class="info-num">${n}<span class="tile-unit">dari ${R.length} risiko</span></div>`
                + chipRow([chip(label.toUpperCase(), z)])
                + kv([
                  ['Zona', label],
                  ['Jumlah risiko sisa', `<span class="mono">${n}</span> dari <span class="mono">${R.length}</span>`],
                  ['Kriteria penerimaan', z === 'critical' ? 'Tidak boleh diterima — pekerjaan terkait dihentikan sampai skor turun'
                    : z === 'high' ? 'Perlu persetujuan manajemen dan pemantauan ketat'
                    : z === 'medium' ? 'Dapat diterima dengan pengendalian dan reviu berkala'
                    : 'Dapat diterima · reviu tahunan']
                ]) + (isi.length ? `<div class="label-caps" style="margin:var(--space-5) 0 var(--space-2)">RISIKO DI ZONA INI</div>
                  ${isi.map(r => `<div style="font-size:13px;line-height:20px;margin-bottom:4px"><span class="mono mono--id">${r.id}</span> — ${r.ancaman}</div>`).join('')}` : '')
                + foot('Tidak ada risiko sisa yang boleh berada di zona Ekstrem. Bila ada, pekerjaan terkait tidak boleh berjalan sampai skornya turun.')
            })}>
              <span class="chip chip--${z}" style="min-width:132px">${label.toUpperCase()}</span>
              <div class="bar bar--${z === 'critical' ? 'critical' : z === 'low' ? 'low' : 'medium'}" style="flex:1"><span style="width:${n / R.length * 100}%"></span></div>
              <span class="mono" style="width:24px;text-align:right">${n}</span>
            </div>`; }).join('')}
          <div class="tile-note" style="margin-top:var(--space-5)">Tidak ada risiko sisa di zona Ekstrem. Bila ada, pekerjaan terkait tidak boleh berjalan sampai skornya turun.</div>
        </div>
      </section>

      <section class="section panel">
        <div class="panel-bar"><h2>2–6 · Risk Register</h2>
          <span class="sub" style="font-size:12px;color:var(--ink-500)">Identifikasi, analisis, evaluasi, penanganan, dan pemantauan dalam satu baris</span></div>
        <div class="table-wrap">
          <table style="min-width:1100px">
            <thead><tr><th>NO.</th><th>PROSES</th><th>ANCAMAN &amp; PENYEBAB</th><th>DAMPAK</th>
              <th>AWAL<br>K×D</th><th>OPSI</th><th>PENANGANAN</th><th>SISA<br>K×D</th><th>PJ / TENGGAT</th><th>REVIU</th></tr></thead>
            <tbody>
              ${R.map(r => {
                const a = r.L * r.S, b = r.sisaL * r.sisaS;
                const opsiChip = { 'Kurangi': 'medium', 'Hindari': 'low', 'Transfer': 'info', 'Terima': 'neutral' };
                return `<tr class="${a >= 15 ? 'is-overdue' : ''}" ${infoAttr({
                  title: r.id,
                  sub: `${r.proses} · reviu berikutnya ${r.reviu}`,
                  body: chipRow([
                    chip('RISIKO AWAL ' + a, zone(a)),
                    chip('RISIKO SISA ' + b, zone(b)),
                    chip('OPSI ' + r.opsi.toUpperCase(), opsiChip[r.opsi])
                  ]) + lead(r.ancaman) + kv([
                    ['Proses', r.proses],
                    ['Ancaman', r.ancaman],
                    ['Penyebab', r.penyebab],
                    ['Dampak', r.dampak],
                    ['Analisis awal', `kemungkinan ${r.L} × dampak ${r.S} = ${a}`],
                    ['Opsi penanganan', r.opsi],
                    ['Tindakan mitigasi', r.mitigasi],
                    ['Risiko sisa', `kemungkinan ${r.sisaL} × dampak ${r.sisaS} = ${b}`],
                    ['Penanggung jawab', `${r.pj} · tenggat <span class="mono">${r.target}</span>`],
                    ['Reviu berikutnya', `<span class="mono">${r.reviu}</span>`]
                  ]) + foot('Matriks 5×5 dan kosakata zonanya sama persis dengan yang dipakai JSEA pada modul Work Permit. Dua matriks berbeda dalam satu aplikasi menghasilkan dua angka yang tidak dapat dibandingkan.')
                })}>
                  <td class="mono mono--id">${r.id}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${r.proses}</td>
                  <td><div style="font-weight:600;color:var(--ink-900)">${r.ancaman}</div>
                    <div style="font-size:12px;color:var(--ink-500)">${r.penyebab}</div></td>
                  <td style="font-size:13px">${r.dampak}</td>
                  <td>${chip(r.L + '×' + r.S + ' = ' + a, zone(a))}</td>
                  <td>${chip(r.opsi.toUpperCase(), opsiChip[r.opsi])}</td>
                  <td style="font-size:13px;line-height:19px">${r.mitigasi}</td>
                  <td>${chip(r.sisaL + '×' + r.sisaS + ' = ' + b, zone(b))}</td>
                  <td><div>${r.pj}</div><div class="mono mono--muted" style="font-size:11px">${r.target}</div></td>
                  <td class="mono mono--muted">${r.reviu}</td>
                </tr>`; }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 13 · Dokumen Internal ───────── */
  function viewDocInt() {
    const L = D.dokInternal;
    const lv = [
      { n: 1, nama: 'Manual & Kebijakan', desc: 'Menyatakan komitmen dan kerangka sistem' },
      { n: 2, nama: 'Prosedur', desc: 'Menjawab siapa mengerjakan apa, kapan' },
      { n: 3, nama: 'Instruksi Kerja', desc: 'Menjawab bagaimana satu pekerjaan dilakukan' },
      { n: 4, nama: 'Formulir & Rekaman', desc: 'Bukti bahwa sistem benar-benar dijalankan' }
    ];
    const tinjau = L.filter(d => d.status === 'Kedaluwarsa').length;
    return hero({
      eyebrow: 'MODUL 13 · MANAJEMEN DOKUMEN INTERNAL',
      title: 'Dokumen Sistem Manajemen',
      desc: 'Empat tingkat dokumen dalam satu daftar terkendali. Nomor, revisi, pemilik, dan tanggal tinjau ulang selalu terlihat — dokumen tanpa tanggal tinjau adalah temuan audit yang menunggu terjadi.',
      action: { act: 'dokumen-baru', icon: 'docint', label: 'Terbitkan Dokumen' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'DOKUMEN TERKENDALI', value: String(L.length), icon: 'docint', arah: 'flat', delta: '4 tingkat dokumen', note: 'Seluruhnya bernomor dan berpemilik' })}
        ${tile({ label: 'BERLAKU', value: String(L.filter(d => d.status === 'Berlaku').length), icon: 'capa', arah: 'good', delta: 'revisi terkini terdistribusi', note: 'Versi lama ditarik otomatis saat revisi terbit' })}
        ${tile({ label: 'DALAM REVISI', value: String(L.filter(d => d.status === 'Dalam Revisi').length), icon: 'inspection', arah: 'flat', delta: 'IK oven & prosedur limbah B3', note: 'Versi berlaku tetap dipakai sampai revisi disahkan' })}
        ${tile({ label: 'LEWAT MASA TINJAU', value: String(tinjau), icon: 'incident', arah: 'bad', delta: 'Kebijakan K3 & Lingkungan', note: 'Sudah menjadi temuan audit AF-2026-020' })}
      </div>

      <section class="section">
        <div class="section-head"><h2>Hierarki Dokumen</h2><span class="sub">Tingkat 1 mengikat tingkat di bawahnya</span></div>
        <div class="grid grid--4">
          ${lv.map(l => {
            const n = L.filter(d => d.level === l.n).length;
            const isi = L.filter(d => d.level === l.n);
            return `<div class="card is-clickable" ${infoAttr({
              title: `Tingkat L${l.n} · ${l.nama}`,
              sub: l.desc,
              body: `<div class="info-num">${n}<span class="tile-unit">dokumen</span></div>`
                + kv([
                  ['Tingkat', `L${l.n} — ${l.nama}`],
                  ['Pertanyaan yang dijawab', l.desc],
                  ['Jumlah dokumen', `<span class="mono">${n}</span>`],
                  ['Berlaku', `<span class="mono">${isi.filter(d => d.status === 'Berlaku').length}</span>`],
                  ['Dalam revisi', `<span class="mono">${isi.filter(d => d.status === 'Dalam Revisi').length}</span>`],
                  ['Kedaluwarsa', `<span class="mono">${isi.filter(d => d.status === 'Kedaluwarsa').length}</span>`]
                ]) + `<div class="label-caps" style="margin:var(--space-5) 0 var(--space-2)">DOKUMEN PADA TINGKAT INI</div>
                  ${isi.map(d => `<div style="font-size:13px;line-height:20px;margin-bottom:4px"><span class="mono mono--id">${d.id}</span> — ${d.judul}</div>`).join('')}`
                + foot('Tingkat 1 mengikat tingkat di bawahnya. Instruksi kerja yang bertentangan dengan prosedur di atasnya adalah ketidaksesuaian, bukan penyesuaian lapangan.')
            })}>
              <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
                <span class="tile-icon" style="width:36px;height:36px;font-family:var(--font-mono);font-weight:600">L${l.n}</span>
                <span class="mono" style="font-size:22px;font-weight:600;color:var(--ink-900);margin-left:auto">${n}</span>
              </div>
              <div style="font-size:15px;font-weight:600;color:var(--ink-900)">${l.nama}</div>
              <div style="font-size:13px;color:var(--ink-500);line-height:19px;margin-top:2px">${l.desc}</div>
            </div>`; }).join('')}
        </div>
      </section>

      <section class="section panel">
        <div class="panel-bar"><h2>Daftar Induk Dokumen</h2>
          <button class="pill" aria-pressed="true">Semua Tingkat</button>
          <button class="pill" aria-pressed="false">Perlu Tinjau Ulang</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>NO. DOKUMEN</th><th>TINGKAT</th><th>JUDUL</th><th>REV</th>
              <th>TERBIT</th><th>TINJAU ULANG</th><th>PEMILIK</th><th>STATUS</th></tr></thead>
            <tbody>
              ${L.map(d => `
                <tr class="${d.status === 'Kedaluwarsa' ? 'is-overdue' : ''}" ${infoAttr({
                  title: d.id,
                  sub: `${d.jenis} · tingkat L${d.level} · revisi ${d.rev}`,
                  body: chipRow([
                    chip('L' + d.level + ' · ' + d.jenis.toUpperCase(), d.level === 1 ? 'info' : d.level === 2 ? 'medium' : d.level === 3 ? 'high' : 'neutral'),
                    chip(d.status.toUpperCase(), d.status === 'Berlaku' ? 'low' : d.status === 'Dalam Revisi' ? 'medium' : 'critical', true)
                  ]) + lead(d.judul) + kv([
                    ['Nomor dokumen', `<span class="mono">${d.id}</span>`],
                    ['Tingkat', `L${d.level} — ${d.jenis}`],
                    ['Revisi', `<span class="mono">${d.rev}</span>`],
                    ['Tanggal terbit', `<span class="mono">${d.terbit}</span>`],
                    ['Tanggal tinjau ulang', `<span class="mono">${d.tinjau}</span>`],
                    ['Pemilik dokumen', d.pemilik],
                    ['Status', d.status]
                  ]) + foot(d.status === 'Kedaluwarsa'
                    ? 'Dokumen yang lewat masa tinjau tertaut ke temuan audit yang bersangkutan. Tanggal tinjau ulang tidak pernah boleh kosong.'
                    : 'Saat revisi baru disahkan, versi sebelumnya ditarik dari peredaran dan ditandai kedaluwarsa.')
                })}>
                  <td class="mono mono--id">${d.id}</td>
                  <td>${chip('L' + d.level + ' · ' + d.jenis.toUpperCase(), d.level === 1 ? 'info' : d.level === 2 ? 'medium' : d.level === 3 ? 'high' : 'neutral')}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${d.judul}</td>
                  <td class="mono">${d.rev}</td>
                  <td class="mono mono--muted">${d.terbit}</td>
                  <td class="mono" style="${d.status === 'Kedaluwarsa' ? 'color:var(--signal-critical);font-weight:600' : 'color:var(--ink-500)'}">${d.tinjau}</td>
                  <td>${d.pemilik}</td>
                  <td>${chip(d.status.toUpperCase(), d.status === 'Berlaku' ? 'low' : d.status === 'Dalam Revisi' ? 'medium' : 'critical', true)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 14 · Dokumen Eksternal ───────── */
  function viewDocExt() {
    const L = D.dokEksternal;
    const lewat = L.filter(d => d.sisa < 0);
    const dekat = L.filter(d => d.sisa >= 0 && d.sisa <= 60);
    const jenisChip = { 'Sertifikat Sistem': 'info', 'Izin Lingkungan': 'low', 'Izin Peralatan': 'medium', 'Pelaporan Wajib': 'high' };
    return hero({
      eyebrow: 'MODUL 14 · MANAJEMEN DOKUMEN EKSTERNAL',
      title: 'Dokumen Kepatuhan',
      desc: 'Sertifikat, izin, dan pelaporan wajib yang diterbitkan pihak luar. Modul ini diurutkan menurut sisa masa berlaku, bukan menurut abjad — yang hampir habis harus terlihat lebih dulu.',
      action: { act: 'compliance-baru', icon: 'docext', label: 'Daftarkan Dokumen' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'DOKUMEN DIPANTAU', value: String(L.length), icon: 'docext', arah: 'flat', delta: '4 jenis kepatuhan', note: 'Sertifikat, izin lingkungan, izin peralatan, pelaporan' })}
        ${tile({ label: 'KEDALUWARSA', value: String(lewat.length), icon: 'incident', arah: 'bad', delta: 'SKLO boiler 2 · laporan P2K3', note: 'Beroperasi tanpa dokumen ini melanggar regulasi' })}
        ${tile({ label: 'BERAKHIR ≤ 60 HARI', value: String(dekat.length), icon: 'clock', arah: 'bad', delta: 'terdekat 19 hari lagi', note: 'Peringatan H-60, H-30, H-14, H-7' })}
        ${tile({ label: 'AMAN', value: String(L.length - lewat.length - dekat.length), icon: 'capa', arah: 'good', delta: 'masa berlaku > 60 hari', note: 'Tetap dipantau otomatis tiap hari' })}
      </div>

      <section class="section panel">
        <div class="panel-bar"><h2>Daftar Dokumen Kepatuhan</h2>
          <span class="sub" style="font-size:12px;color:var(--ink-500)">Diurutkan menurut sisa masa berlaku</span></div>
        <div class="table-wrap">
          <table style="min-width:980px">
            <thead><tr><th>NO.</th><th>JENIS</th><th>DOKUMEN</th><th>PENERBIT</th><th>NOMOR</th>
              <th>BERLAKU SAMPAI</th><th>SISA</th><th>STATUS</th></tr></thead>
            <tbody>
              ${L.slice().sort((a, b) => a.sisa - b.sisa).map(d => `
                <tr class="${d.sisa < 0 ? 'is-overdue' : ''}" ${infoAttr({
                  title: d.judul,
                  sub: `${d.jenis} · diterbitkan ${d.penerbit}`,
                  body: `<div class="info-num">${d.sisa < 0 ? '−' + Math.abs(d.sisa) : d.sisa}<span class="tile-unit">${d.sisa < 0 ? 'hari lewat' : 'hari tersisa'}</span></div>`
                    + chipRow([
                      chip(d.jenis.toUpperCase(), jenisChip[d.jenis]),
                      d.sisa < 0 ? chip('KEDALUWARSA', 'critical', true)
                        : d.sisa <= 30 ? chip('PERPANJANG SEKARANG', 'critical')
                        : d.sisa <= 60 ? chip('SIAPKAN PERPANJANGAN', 'high')
                        : chip('BERLAKU', 'low', true)
                    ]) + kv([
                      ['Nomor dokumen', `<span class="mono">${d.nomor}</span>`],
                      ['Jenis', d.jenis],
                      ['Penerbit', d.penerbit],
                      ['Berlaku sampai', `<span class="mono">${d.berlaku}</span>`],
                      ['Sisa masa berlaku', d.sisa < 0
                        ? `<span class="mono">lewat ${Math.abs(d.sisa)} hari</span>`
                        : `<span class="mono">${d.sisa}</span> hari`]
                    ]) + foot('Peringatan otomatis dikirim pada H-60, H-30, H-14, dan H-7. Pelaporan wajib diperlakukan sama seperti izin, karena keterlambatan keduanya sama-sama berakibat hukum.')
                })}>
                  <td class="mono mono--id">${d.id}</td>
                  <td>${chip(d.jenis.toUpperCase(), jenisChip[d.jenis])}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${d.judul}</td>
                  <td>${d.penerbit}</td>
                  <td class="mono mono--muted">${d.nomor}</td>
                  <td class="mono">${d.berlaku}</td>
                  <td class="mono" style="${d.sisa < 0 ? 'color:var(--signal-critical);font-weight:600' : d.sisa <= 60 ? 'color:var(--signal-high);font-weight:600' : 'color:var(--ink-500)'}">
                    ${d.sisa < 0 ? 'lewat ' + Math.abs(d.sisa) + ' hari' : d.sisa + ' hari'}</td>
                  <td>${d.sisa < 0 ? chip('KEDALUWARSA', 'critical', true)
                      : d.sisa <= 30 ? chip('PERPANJANG SEKARANG', 'critical')
                      : d.sisa <= 60 ? chip('SIAPKAN PERPANJANGAN', 'high')
                      : chip('BERLAKU', 'low', true)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="card">
          <h3>Mengapa dokumen kedaluwarsa berwarna merah pekat</h3>
          <p style="font-size:14px;line-height:22px;color:var(--ink-700);margin:0">
            Dua dokumen dalam daftar ini sudah lewat masa berlaku. SKLO boiler 2 berarti pesawat uap beroperasi tanpa
            surat keterangan layak — bukan kelalaian administratif, melainkan pelanggaran yang dapat menghentikan
            produksi bila ditemukan pemeriksa. Laporan P2K3 triwulan II yang belum dikirim sudah menjadi temuan audit
            AF-2026-019 dan CAPA-2026-0124. Modul ini menautkan keduanya sehingga satu keterlambatan tidak dicatat
            di tiga tempat dengan tiga nasib berbeda.
          </p>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 15 · Safety Checklist ───────── */
  function viewChecklist() {
    const L = D.checklistHarian;
    const selesai = L.filter(c => c.status === 'Selesai').length;
    const temuan = L.reduce((a, c) => a + c.temuan, 0);
    return hero({
      eyebrow: 'MODUL 15 · SAFETY CHECKLIST',
      title: 'Pemeriksaan Rutin Harian',
      desc: 'Berbeda dari Inspection yang terjadwal bulanan: checklist ini dikerjakan tiap shift oleh pekerja lini sebelum alat dipakai. Alat tidak boleh beroperasi sebelum checklist-nya selesai.',
      action: { act: 'checklist-mulai', icon: 'checklist', label: 'Kerjakan Checklist' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'CHECKLIST HARI INI', value: String(L.length), icon: 'checklist', arah: 'flat', delta: '2 shift · 5 jenis', note: '21 Sep 2026 · Pabrik Cibitung' })}
        ${tile({ label: 'SELESAI', value: selesai + '/' + L.length, icon: 'capa', arah: 'bad', delta: '2 belum dimulai', note: 'Target 100% sebelum shift berjalan 2 jam' })}
        ${tile({ label: 'TEMUAN HARI INI', value: String(temuan), icon: 'incident', arah: 'bad', delta: '1 alat dikeluarkan dari operasi', note: 'Temuan checklist masuk antrean CAPA yang sama' })}
        ${tile({ label: 'KEPATUHAN 30 HARI', value: '96', unit: '%', icon: 'kpi', arah: 'good', delta: '3% vs bulan lalu', note: 'Checklist selesai ÷ checklist terjadwal · Leading' })}
      </div>

      <section class="section panel">
        <div class="panel-bar"><h2>Checklist Hari Ini</h2>
          <button class="pill" aria-pressed="true">Semua Shift</button>
          <button class="pill" aria-pressed="false">Shift 1</button>
          <button class="pill" aria-pressed="false">Shift 2</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>NO.</th><th>CHECKLIST</th><th>FREKUENSI</th><th>AREA</th><th>SHIFT</th>
              <th>KEMAJUAN</th><th>TEMUAN</th><th>PJ</th><th>SELESAI</th><th>STATUS</th></tr></thead>
            <tbody>
              ${L.map(c => {
                const pct = Math.round(c.selesai / c.butir * 100);
                return `<tr class="${c.status === 'Terbuka' ? 'is-overdue' : ''}" ${infoAttr({
                  title: c.id,
                  sub: `${c.nama} · ${c.area} · ${c.shift}`,
                  body: chipRow([
                    chip(c.status.toUpperCase(), T.status[c.status], true),
                    chip(c.shift.toUpperCase(), 'neutral'),
                    c.temuan ? chip(c.temuan + ' TEMUAN', 'high') : chip('BERSIH', 'low')
                  ]) + lead(c.nama) + `
                    <div class="bar ${pct === 100 ? 'bar--low' : pct === 0 ? 'bar--critical' : 'bar--medium'}" style="margin-bottom:var(--space-2)"><span style="width:${pct}%"></span></div>
                    <div class="mono mono--muted" style="font-size:12px;margin-bottom:var(--space-5)">${c.selesai} dari ${c.butir} butir · ${pct}%</div>`
                    + kv([
                      ['Frekuensi', c.frekuensi],
                      ['Area', c.area],
                      ['Shift', c.shift],
                      ['Kemajuan', `<span class="mono">${c.selesai}/${c.butir}</span> butir (${pct}%)`],
                      ['Temuan', c.temuan ? `<span class="mono">${c.temuan}</span> butir Tidak Sesuai` : 'Tidak ada butir Tidak Sesuai'],
                      ['Petugas', c.pj],
                      ['Waktu', `<span class="mono">${c.waktu}</span>`]
                    ]) + foot(c.temuan
                      ? 'Satu butir Tidak Sesuai mengunci unit dari operasi sampai temuannya ditutup. Ini gerbang operasi, bukan peringatan.'
                      : 'Checklist dikerjakan tiap shift oleh operator dan bersifat gerbang operasi — berbeda dari Inspection yang bulanan dan bersifat penilaian.')
                })}>
                  <td class="mono mono--id">${c.id}</td>
                  <td style="font-weight:600;color:var(--ink-900)">${c.nama}</td>
                  <td class="mono mono--muted">${c.frekuensi}</td>
                  <td>${c.area}</td>
                  <td>${chip(c.shift.toUpperCase(), 'neutral')}</td>
                  <td style="min-width:130px">
                    <div class="bar ${pct === 100 ? 'bar--low' : pct === 0 ? 'bar--critical' : 'bar--medium'}"><span style="width:${pct}%"></span></div>
                    <span class="mono mono--muted" style="font-size:11px">${c.selesai}/${c.butir}</span>
                  </td>
                  <td>${c.temuan ? chip(c.temuan + ' TEMUAN', 'high') : chip('BERSIH', 'low')}</td>
                  <td>${c.pj}</td>
                  <td class="mono mono--muted">${c.waktu}</td>
                  <td>${chip(c.status.toUpperCase(), T.status[c.status], true)}</td>
                </tr>`; }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>CHK-2026-1841 · P2H Forklift FL-03</h2>
          <span class="sub">Pemeriksaan sebelum operasi · Shift 1 · Agus Prasetyo · 06:40</span></div>
        <div class="card">
          ${D.checklistP2H.map((b, i) => `
            <div class="param is-clickable" style="grid-template-columns:1fr auto" ${infoAttr({
              title: `Butir ${i + 1}`,
              sub: 'CHK-2026-1841 · P2H Forklift FL-03 · Shift 1',
              body: chipRow([chip(b.jawab === 'Sesuai' ? 'SESUAI' : 'TIDAK SESUAI', b.jawab === 'Sesuai' ? 'low' : 'critical')])
                + lead(b.butir) + kv([
                  ['Jawaban', b.jawab],
                  b.catatan && ['Catatan pemeriksa', b.catatan],
                  ['Pemeriksa', 'Agus Prasetyo · Shift 1 · 06:40'],
                  ['Unit', 'FL-03 — forklift Gudang Bahan Baku']
                ]) + foot(b.jawab === 'Sesuai'
                  ? 'Butir yang sesuai tetap disimpan sebagai rekaman. Checklist yang hanya mencatat pelanggaran tidak dapat membuktikan bahwa pemeriksaan benar-benar dilakukan.'
                  : 'Satu butir Tidak Sesuai membuat unit FL-03 otomatis berstatus tidak boleh dioperasikan sampai temuan ditutup. Ini gerbang, bukan peringatan yang bisa dilewati.')
            })}>
              <div>
                <div class="param-name">${i + 1}. ${b.butir}</div>
                ${b.catatan ? `<div style="font-size:13px;color:var(--signal-critical);margin-top:4px">${b.catatan}</div>` : ''}
              </div>
              <div>${b.jawab === 'Sesuai' ? chip('SESUAI', 'low') : chip('TIDAK SESUAI', 'critical')}</div>
            </div>`).join('')}
          <div class="tile-note" style="margin-top:var(--space-4)">
            Satu butir tidak sesuai membuat unit FL-03 otomatis berstatus tidak boleh dioperasikan sampai temuan ditutup.
            Purwarupa menampilkan aturan ini sebagai gerbang, bukan sebagai peringatan yang bisa dilewati.
          </div>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 16 · Observasi Perilaku ───────── */
  function viewBbs() {
    const K = D.obsKategori;
    const aman = K.reduce((a, k) => a + k.aman, 0);
    const risk = K.reduce((a, k) => a + k.berisiko, 0);
    const idx = (aman / (aman + risk) * 100).toFixed(1).replace('.', ',');
    return hero({
      eyebrow: 'MODUL 16 · OBSERVASI PERILAKU',
      title: 'Observasi Perilaku Aman',
      desc: 'Mengamati perilaku, bukan mencari kesalahan orang. Setiap observasi mencatat perilaku aman lebih dulu, lalu perilaku berisiko beserta percakapan yang mengikutinya — tanpa nama pekerja yang diamati.',
      action: { act: 'observasi-baru', icon: 'bbs', label: 'Catat Observasi' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'OBSERVASI BULAN INI', value: '302', icon: 'bbs', arah: 'bad', delta: 'target 400 per bulan', note: 'Naik itu baik · Leading indicator' })}
        ${tile({ label: 'INDEKS PERILAKU AMAN', value: idx, unit: '%', icon: 'kpi', arah: 'good', delta: '1,4% vs Agustus', note: 'Perilaku aman ÷ total perilaku teramati' })}
        ${tile({ label: 'PERILAKU BERISIKO', value: String(risk), icon: 'incident', arah: 'good', delta: '12 vs Agustus', note: 'Terbanyak: posisi & postur tubuh' })}
        ${tile({ label: 'PENGAMAT AKTIF', value: '14', icon: 'people', arah: 'good', delta: '3 pengamat baru dilatih', note: 'Supervisor dan operator terlatih' })}
      </div>

      ${lapanganSeksi('observasi')}

      <section class="section grid grid--2">
        <div class="card">
          <h3>Perilaku per Kategori</h3>
          <div class="card-sub">${(aman + risk).toLocaleString('id-ID')} perilaku teramati · September 2026</div>
          ${K.map(k => {
            const t = k.aman + k.berisiko, p = k.berisiko / t * 100;
            return `<div class="is-clickable" style="margin-bottom:var(--space-4)" ${infoAttr({
              title: k.nama,
              sub: `Observasi perilaku · ${D.periode}`,
              body: `<div class="info-num">${(100 - p).toFixed(1).replace('.', ',')}<span class="tile-unit">% aman</span></div>`
                + chipRow([
                  chip(k.aman + ' AMAN', 'low'),
                  chip(k.berisiko + ' BERISIKO', k.berisiko === 0 ? 'neutral' : 'critical')
                ]) + bars([['Perilaku aman', k.aman, t, 'low'], ['Perilaku berisiko', k.berisiko, t, 'critical']])
                + kv([
                  ['Kategori', k.nama],
                  ['Total teramati', `<span class="mono">${t}</span> perilaku`],
                  ['Aman', `<span class="mono">${k.aman}</span> (${(100 - p).toFixed(1).replace('.', ',')}%)`],
                  ['Berisiko', `<span class="mono">${k.berisiko}</span> (${p.toFixed(1).replace('.', ',')}%)`]
                ]) + foot('Kolom perilaku aman diisi lebih dulu dan selalu lebih besar. Kategori dengan pita merah terpanjang menjadi tema safety talk bulan berikutnya.')
            })}>
              <div style="display:flex;justify-content:space-between;gap:var(--space-3);margin-bottom:5px;font-size:13px">
                <span style="font-weight:600;color:var(--ink-900)">${k.nama}</span>
                <span class="mono mono--muted">${k.berisiko} berisiko / ${t}</span>
              </div>
              <div class="bar bar--low" style="position:relative">
                <span style="width:100%"></span>
                <span style="position:absolute;right:0;top:0;height:100%;width:${p}%;background:var(--signal-critical);border-radius:var(--radius-pill)"></span>
              </div>
            </div>`; }).join('')}
          <div class="tile-note">Bagian hijau adalah perilaku aman. Kategori dengan pita merah terpanjang menjadi tema safety talk bulan berikutnya.</div>
        </div>
        <div class="card">
          <h3>Aturan Modul Ini</h3>
          <div class="card-sub">Alasan rancangannya seperti ini</div>
          <dl class="kv">
            <dt>Tanpa nama</dt><dd>Pekerja yang diamati tidak pernah dicatat namanya. Observasi yang menamai orang berubah menjadi penilaian kinerja, dan pekerja berhenti berperilaku wajar saat diamati.</dd>
            <dt>Aman dulu</dt><dd>Kolom perilaku aman diisi lebih dulu dan selalu lebih besar. Program yang hanya mencatat pelanggaran ditinggalkan dalam tiga bulan.</dd>
            <dt>Percakapan wajib</dt><dd>Setiap perilaku berisiko harus disertai catatan percakapan di tempat. Observasi tanpa tindak lanjut hanyalah angka.</dd>
            <dt>Bukan CAPA</dt><dd>Temuan perilaku tidak otomatis menjadi CAPA. Yang menjadi CAPA adalah pola yang berulang, bukan satu kejadian.</dd>
          </dl>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Observasi Terbaru</h2><span class="sub">Lima catatan terakhir dari 302 bulan ini</span></div>
        ${D.observasi.map(o => `
          <article class="card obs-card is-clickable" ${infoAttr({
            title: o.id,
            sub: `${o.area} · pengamat ${o.observer} · ${o.tanggal}`,
            body: chipRow([
              chip(o.aman + ' PERILAKU AMAN', 'low'),
              o.berisiko ? chip(o.berisiko + ' BERISIKO', 'critical') : '',
              o.kategori !== '—' ? chip(o.kategori.toUpperCase(), 'neutral') : ''
            ]) + lead(o.catatan) + kv([
              ['Kategori perilaku', o.kategori === '—' ? 'Tidak ada perilaku berisiko yang dicatat' : o.kategori],
              ['Perilaku aman', `<span class="mono">${o.aman}</span>`],
              ['Perilaku berisiko', `<span class="mono">${o.berisiko}</span>`],
              ['Tindak lanjut', o.tindakan],
              ['Pengamat', o.observer],
              ['Area', o.area],
              ['Tanggal', `<span class="mono">${o.tanggal}</span>`]
            ]) + foot('Pekerja yang diamati tidak pernah dicatat namanya. Satu temuan perilaku juga tidak otomatis menjadi CAPA — yang menjadi CAPA adalah pola yang berulang.')
          })}>
            <span class="feed-icon chip--${o.berisiko === 0 ? 'low' : 'medium'}" style="width:44px;height:44px;border-radius:var(--radius-md)">
              ${I(icon.bbs, 20)}</span>
            <div>
              <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center;margin-bottom:6px">
                <span class="mono mono--id" style="font-size:12px">${o.id}</span>
                ${chip(o.aman + ' AMAN', 'low')}
                ${o.berisiko ? chip(o.berisiko + ' BERISIKO', 'critical') : ''}
                ${o.kategori !== '—' ? chip(o.kategori.toUpperCase(), 'neutral') : ''}
                <span class="mono mono--muted" style="margin-left:auto;font-size:12px">${o.tanggal}</span>
              </div>
              <div style="font-size:14px;line-height:21px;color:var(--ink-900)">${o.catatan}</div>
              <div style="font-size:13px;line-height:20px;color:var(--ink-500);margin-top:4px">
                <b style="color:var(--brand-700)">Tindak lanjut</b> — ${o.tindakan}</div>
              <div style="font-size:12px;color:var(--ink-500);margin-top:6px">Pengamat: ${o.observer} · ${o.area}</div>
            </div>
          </article>`).join('')}
      </section>
    </div>`;
  }

  /* ───────── Modul 18 · Notifikasi ───────── */
  function viewNotif() {
    const N = D.notifikasi;
    const belum = N.filter(n => !n.baca).length;
    const jenisLabel = { critical: 'KRITIS', high: 'TINGGI', medium: 'SEDANG', low: 'SELESAI', info: 'INFO' };
    return hero({
      eyebrow: 'MODUL 18 · NOTIFIKASI',
      title: 'Pemberitahuan',
      desc: 'Satu antrean untuk seluruh modul, diurutkan menurut tingkat tuntutan tindakan. Setiap pemberitahuan membawa tautan langsung ke tempat pekerjaannya — pemberitahuan yang tidak dapat ditindaklanjuti tidak dikirim.',
      metric: String(belum), metricLabel: 'BELUM DIBACA'
    }) + `
    <div class="page">
      <section class="section panel">
        <div class="panel-bar">
          <h2>Kotak Masuk</h2>
          <button class="pill" aria-pressed="true">Semua</button>
          <button class="pill" aria-pressed="false">Belum Dibaca</button>
          <button class="btn btn--secondary btn--sm" data-act="tandai-baca">Tandai semua terbaca</button>
        </div>
        <div style="padding:0 var(--space-5)">
          ${N.map(n => `
            <div class="notif is-clickable" ${infoAttr({
              title: n.judul,
              sub: `${n.modul} · ${n.waktu}`,
              goto: n.aksi,
              gotoLabel: 'Buka ' + n.modul,
              body: chipRow([
                chip(jenisLabel[n.jenis], n.jenis),
                chip(n.modul.toUpperCase(), 'neutral'),
                !n.baca ? chip('BARU', 'info') : ''
              ]) + lead(n.judul) + `<p style="font-size:14px;line-height:21px;color:var(--ink-700);margin:0 0 var(--space-5)">${n.isi}</p>`
                + kv([
                  ['Nomor', `<span class="mono mono--id">${n.id}</span>`],
                  ['Modul asal', n.modul],
                  ['Tingkat', jenisLabel[n.jenis]],
                  ['Waktu', `<span class="mono">${n.waktu}</span>`],
                  ['Status baca', n.baca ? 'Sudah dibaca' : 'Belum dibaca']
                ]) + foot('Menandai terbaca tidak menghentikan pengingat: item yang lewat tenggat tetap dikirim ulang setiap hari sampai ditutup di modulnya.')
            })}>
              <span class="notif-dot chip--${n.jenis}" ${n.baca ? 'style="opacity:.35"' : ''}></span>
              <div style="min-width:0">
                <div style="display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap;margin-bottom:4px">
                  ${chip(jenisLabel[n.jenis], n.jenis)}
                  <span class="label-caps">${n.modul.toUpperCase()}</span>
                  ${!n.baca ? '<span class="chip chip--info" style="border-left:0;padding:2px 7px">BARU</span>' : ''}
                </div>
                <div style="font-size:14px;line-height:20px;font-weight:${n.baca ? '500' : '600'};color:var(--ink-900)">${n.judul}</div>
                <div style="font-size:13px;line-height:19px;color:var(--ink-500);margin-top:2px">${n.isi}</div>
              </div>
              <span class="mono mono--muted" style="white-space:nowrap;font-size:12px">${n.waktu}</span>
            </div>`).join('')}
        </div>
      </section>

      <section class="section panel">
        <div class="panel-bar"><h2>Aturan Pengiriman</h2>
          <span class="sub" style="font-size:12px;color:var(--ink-500)">Siapa menerima apa, lewat kanal mana, dan seberapa sering</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>PERISTIWA</th><th>KANAL</th><th>PENERIMA</th><th>WAKTU KIRIM</th></tr></thead>
            <tbody>
              ${D.aturanNotifikasi.map(a => `
                <tr ${infoAttr({
                  title: a.peristiwa,
                  sub: 'Aturan pengiriman pemberitahuan',
                  body: chipRow([chip(a.segera.toUpperCase(), /Seketika|Eskalasi/.test(a.segera) ? 'critical' : 'info')])
                    + kv([
                      ['Peristiwa pemicu', a.peristiwa],
                      ['Kanal', a.kanal],
                      ['Penerima', a.penerima],
                      ['Waktu kirim', a.segera]
                    ]) + foot('Pemberitahuan hanya dikirim bila membawa tindakan: sesuatu yang lewat tenggat, menunggu keputusan penerimanya, atau melewati ambang. Perubahan status biasa tidak dikirim — cukup terlihat di modulnya.')
                })}>
                  <td style="font-weight:600;color:var(--ink-900)">${a.peristiwa}</td>
                  <td>${a.kanal}</td>
                  <td>${a.penerima}</td>
                  <td class="mono mono--muted">${a.segera}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="card">
          <h3>Mengapa antreannya pendek</h3>
          <p style="font-size:14px;line-height:22px;color:var(--ink-700);margin:0">
            Sistem QHSE paling sering gagal bukan karena kurang memberi tahu, melainkan karena terlalu banyak
            memberi tahu sampai tidak ada yang dibaca. Purwarupa ini hanya mengirim pemberitahuan yang membawa
            tindakan: sesuatu yang lewat tenggat, sesuatu yang menunggu keputusan penerimanya, atau sesuatu yang
            melewati ambang. Perubahan status biasa tidak dikirim — cukup terlihat di modulnya.
          </p>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Pengaturan ───────── */
  function viewSettings() {
    const sw = (group, opts) => `<div class="switch" role="group" aria-label="${group}">${
      opts.map(o => `<button type="button" ${o.attr}>${o.label}</button>`).join('')}</div>`;
    const toggle = (id, on) => `<button type="button" class="toggle" data-toggle="${id}" aria-pressed="${on}" aria-label="Aktifkan"></button>`;
    const lap = window.KGLAP ? KGLAP.ringkas() : { total: 0, antre: 0 };
    return hero({
      eyebrow: 'PENGATURAN',
      title: 'Preferensi Aplikasi',
      desc: 'Tema, bahasa, lokasi kerja, dan kanal pemberitahuan. Preferensi tampilan tersimpan di peramban ini saja, bukan di server — jadi setiap perangkat punya pilihannya sendiri.'
    }) + `
    <div class="page">
      <section class="section">
        <div class="card">
          <h3>Aplikasi Lapangan Android</h3>
          <div class="card-sub">Untuk petugas yang bekerja di lantai produksi, gudang, dan area utilitas</div>
          <p style="font-size:14px;line-height:22px;color:var(--ink-700);margin:var(--space-4) 0">
            Versi lapangan berjalan di ponsel Android: laporan bahaya dalam tiga puluh detik dengan kamera dan
            titik GPS, checklist shift, dan pencarian seluruh catatan — seluruhnya tetap jalan tanpa sinyal.
            Buka alamatnya di Chrome pada ponsel, lalu pilih <b>Pasang aplikasi</b>; hasilnya ikon di layar utama
            yang berjalan layar penuh tanpa bilah peramban.
          </p>
          ${kv([
            ['Alamat', '<span class="mono">' + location.host + '/m/</span>'],
            ['Akun', 'Sama dengan aplikasi ini — masuk sekali, berlaku di keduanya'],
            ['Kiriman dari lapangan', lap.total
              ? KGAI.L(`${lap.total} laporan` + (lap.antre ? `, ${lap.antre} masih di antrean perangkat` : ', seluruhnya terkirim'),
                       `${lap.total} reports` + (lap.antre ? `, ${lap.antre} still queued on the device` : ', all sent'))
              : 'Belum ada']
          ])}
          <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-top:var(--space-5)">
            <a class="btn btn--primary" href="m/" target="_blank" rel="noopener">${I(icon.people, 17)}Buka Aplikasi Lapangan</a>
          </div>
          ${foot('Laporan yang dikirim dari aplikasi lapangan muncul di modul Laporan Bahaya, Incident, dan Observasi Perilaku, ditandai sebagai kiriman lapangan. Yang berstatus Antre belum melewati verifikasi QHSE, jadi belum dihitung dalam angka KPI mana pun.')}
        </div>
      </section>

      <section class="section grid grid--2">
        <div class="card">
          <h3>Tampilan</h3>
          <div class="card-sub">Tema dan bahasa tersimpan di peramban ini saja</div>
          <div class="pref-row">
            <div>
              <div class="pref-label">Mode tampilan</div>
              <div class="pref-help">Sistem mengikuti pengaturan perangkat Anda</div>
            </div>
            ${sw('Tema', [
              { attr: 'data-theme-set="light"', label: 'Terang' },
              { attr: 'data-theme-set="dark"', label: 'Gelap' },
              { attr: 'data-theme-set="system"', label: 'Sistem' }
            ])}
          </div>
          <div class="pref-row">
            <div>
              <div class="pref-label">Bahasa antarmuka</div>
              <div class="pref-help">Isi rekaman tetap dalam bahasa aslinya</div>
            </div>
            ${sw('Bahasa', [
              { attr: 'data-lang="id"', label: 'Indonesia' },
              { attr: 'data-lang="en"', label: 'English' }
            ])}
          </div>
        </div>

        <div class="card">
          <h3>Lokasi Kerja</h3>
          <div class="card-sub">Angka KPI berbeda per pabrik</div>
          <div class="field">
            <label for="s-plant">Pabrik aktif</label>
            <select id="s-plant">${D.pabrikKinerja.map(p => `<option${p.nama === 'Cibitung' ? ' selected' : ''}>Pabrik ${p.nama}</option>`).join('')}</select>
          </div>
          <div class="field" style="margin-bottom:0">
            <label for="s-period">Periode laporan</label>
            <select id="s-period"><option>September 2026</option><option>Agustus 2026</option><option>Triwulan III 2026</option><option>Tahun berjalan 2026</option></select>
          </div>
          <div class="tile-note" style="margin-top:var(--space-4)">Mengubah pabrik akan memuat ulang seluruh ubin KPI dan daftar modul. Pada purwarupa ini data hanya tersedia untuk Pabrik Cibitung.</div>
        </div>
      </section>

      <section class="section grid grid--2">
        <div class="card">
          <h3>Kanal Pemberitahuan</h3>
          <div class="card-sub">Pilih cara Anda menerima pemberitahuan</div>
          <div class="pref-row">
            <div><div class="pref-label">Pemberitahuan dalam aplikasi</div>
              <div class="pref-help">Selalu aktif untuk item yang lewat tenggat</div></div>
            ${toggle('n-app', true)}
          </div>
          <div class="pref-row">
            <div><div class="pref-label">Ringkasan harian lewat email</div>
              <div class="pref-help">Dikirim setiap hari kerja pukul 07.00 WIB</div></div>
            ${toggle('n-mail', true)}
          </div>
          <div class="pref-row">
            <div><div class="pref-label">Insiden Accident lewat WhatsApp</div>
              <div class="pref-help">Seketika, tanpa menunggu ringkasan</div></div>
            ${toggle('n-wa', true)}
          </div>
          <div class="pref-row">
            <div><div class="pref-label">Pengingat dokumen kedaluwarsa</div>
              <div class="pref-help">H-60, H-30, H-14, dan H-7</div></div>
            ${toggle('n-doc', false)}
          </div>
        </div>

        <div class="card">
          <h3>Tentang Purwarupa</h3>
          <div class="card-sub">Batas yang perlu diketahui sebelum dipakai menilai</div>
          <dl class="kv">
            <dt>Versi</dt><dd>Purwarupa antarmuka 0.3 · 20 modul</dd>
            <dt>Data</dt><dd>Seluruh isi adalah data rekaan untuk demonstrasi alur kerja, bukan catatan QHSE Khong Guan yang sebenarnya.</dd>
            <dt>Autentikasi</dt><dd>Login berjalan di peramban tanpa server. Jangan memakai kata sandi sungguhan di layar ini.</dd>
            <dt>Lambang korporat</dt><dd>Belum disertakan. Berkas resminya perlu diminta ke tim Corporate Communication.</dd>
          </dl>
          <div style="display:flex;gap:var(--space-3);margin-top:var(--space-5);flex-wrap:wrap">
            <button class="btn btn--primary btn--sm" data-act="simpan-preferensi">Simpan Preferensi</button>
          </div>
        </div>
      </section>
    </div>`;
  }

  /* ───────── User Management ───────── */
  function viewUsers() {
    const U = D.pengguna;
    const aktif = U.filter(u => u.status === 'Aktif').length;
    const tunggu = U.filter(u => u.status === 'Menunggu').length;
    const perans = new Set(U.map(u => u.peran));
    const statusChip = { 'Aktif': 'low', 'Nonaktif': 'neutral', 'Menunggu': 'high' };
    const cell = (v) => v === '—' ? '<span class="mono mono--muted">—</span>'
      : chip(v.toUpperCase(), v === 'Kelola' ? 'critical' : v === 'Verifikasi' ? 'high' : v === 'Isi' ? 'medium' : 'low');
    const arti = (v) => ({
      'Kelola': 'Kelola — ditambah pengaturan induk modul: jenis, ambang, dan penerima pemberitahuan',
      'Verifikasi': 'Verifikasi — memeriksa, menyetujui, menolak, dan menutup catatan orang lain',
      'Isi': 'Isi — membuat dan mengubah catatan miliknya sendiri',
      'Baca': 'Baca — melihat dan mengunduh, tidak mengubah apa pun',
      '—': 'Tidak ada akses — modul ini tidak muncul di navigasinya'
    })[v] || v;
    return hero({
      eyebrow: 'ADMINISTRASI · USER MANAGEMENT',
      title: 'Pengguna & Hak Akses',
      desc: 'Peran menentukan modul mana yang muncul di sidebar dan tindakan apa yang boleh dilakukan. Operator tidak melihat Audit dan KPI; hanya Administrator yang melihat halaman ini.',
      action: { act: 'tambah-pengguna', icon: 'people', label: 'Tambah Pengguna' }
    }) + `
    <div class="page">
      <div class="grid grid--4">
        ${tile({ label: 'TOTAL PENGGUNA', value: String(U.length), icon: 'people', arah: 'flat', delta: '3 pabrik', note: 'Termasuk akun nonaktif dan menunggu aktivasi' })}
        ${tile({ label: 'AKTIF 30 HARI', value: String(aktif), icon: 'capa', arah: 'good', delta: '1 vs Agustus', note: 'Pernah masuk dalam 30 hari terakhir' })}
        ${tile({ label: 'MENUNGGU AKTIVASI', value: String(tunggu), icon: 'clock', arah: 'bad', delta: 'undangan belum diterima', note: 'Undangan kedaluwarsa setelah 14 hari' })}
        ${tile({ label: 'PERAN BERBEDA', value: String(perans.size), icon: 'shield', arah: 'flat', delta: 'operator sampai administrator', note: 'Hak akses diatur per peran, bukan per orang' })}
      </div>

      <section class="section panel">
        <div class="panel-bar"><h2>Daftar Pengguna</h2>
          <button class="pill" aria-pressed="true">Semua</button>
          <button class="pill" aria-pressed="false">Aktif</button>
          <button class="pill" aria-pressed="false">Menunggu</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>PENGGUNA</th><th>EMAIL</th><th>PERAN</th><th>PABRIK</th><th>TERAKHIR MASUK</th><th>STATUS</th></tr></thead>
            <tbody>
              ${U.map(u => `
                <tr class="${u.status === 'Menunggu' ? 'is-overdue' : ''}" ${infoAttr({
                  title: u.nama,
                  sub: `${D.peran[u.peran].nama} · ${u.lokasi}`,
                  body: chipRow([
                    `<span class="role-chip role-${u.peran}">${D.peran[u.peran].nama.toUpperCase()}</span>`,
                    chip(u.status.toUpperCase(), statusChip[u.status], true)
                  ]) + kv([
                    ['Surel', `<span class="mono">${u.email}</span>`],
                    ['Peran', D.peran[u.peran].nama],
                    ['Pabrik', u.lokasi],
                    ['Terakhir masuk', `<span class="mono">${u.masuk}</span>`],
                    ['Status akun', u.status],
                    ['Modul yang terlihat', `${D.peran[u.peran].modul.length} dari ${Object.keys(VIEWS).length} modul`]
                  ]) + `<div class="label-caps" style="margin:var(--space-5) 0 var(--space-2)">MODUL YANG DAPAT DIBUKA</div>
                    <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">${
                      D.peran[u.peran].modul.map(id => {
                        const m = ALL.filter(x => x.id === id)[0];
                        return `<span class="chip chip--neutral" style="font-weight:600;letter-spacing:0;font-size:12px">${m ? m.label : id}</span>`;
                      }).join('')}</div>`
                    + foot(u.status === 'Nonaktif'
                      ? 'Akun tidak pernah dihapus, hanya dinonaktifkan. Menghapus akun akan memutus nama pelapor dari catatan insiden yang sudah ada.'
                      : 'Hak akses dihitung ulang dari peran pada setiap pemuatan halaman, tidak pernah dititipkan di dalam sesi.')
                })}>
                  <td>
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                      <span class="avatar" style="width:30px;height:30px;font-size:11px;background:var(--brand-100);color:var(--brand-700)">${u.inisial}</span>
                      <span style="font-weight:600;color:var(--ink-900)">${u.nama}</span>
                    </div>
                  </td>
                  <td class="mono mono--muted">${u.email}</td>
                  <td><span class="role-chip role-${u.peran}">${D.peran[u.peran].nama.toUpperCase()}</span></td>
                  <td>${u.lokasi}</td>
                  <td class="mono mono--muted">${u.masuk}</td>
                  <td>${chip(u.status.toUpperCase(), statusChip[u.status], true)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section panel">
        <div class="panel-bar"><h2>Matriks Hak Akses</h2>
          <span class="sub" style="font-size:12px;color:var(--ink-500)">Baca &lt; Isi &lt; Verifikasi &lt; Kelola</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>MODUL</th><th>OPERATOR</th><th>QHSE SUPERVISOR</th><th>PLANT MANAGER</th><th>ADMINISTRATOR SISTEM</th></tr></thead>
            <tbody>
              ${D.hakAkses.map(r => `
                <tr ${infoAttr({
                  title: r.modul,
                  sub: 'Hak akses per peran',
                  body: kv([
                    ['Operator Produksi', arti(r.operator)],
                    ['QHSE Supervisor', arti(r.qhse)],
                    ['Plant Manager', arti(r.manajemen)],
                    ['Administrator Sistem', arti(r.admin)]
                  ]) + foot('Tidak ada peran yang boleh memverifikasi catatannya sendiri. Sistem K3 yang memperbolehkan penutupan sendiri kehilangan gunanya sebagai bukti audit.')
                })}>
                  <td style="font-weight:600;color:var(--ink-900)">${r.modul}</td>
                  <td>${cell(r.operator)}</td>
                  <td>${cell(r.qhse)}</td>
                  <td>${cell(r.manajemen)}</td>
                  <td>${cell(r.admin)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="card">
          <h3>Mengapa hak akses diatur per peran</h3>
          <p style="font-size:14px;line-height:22px;color:var(--ink-700);margin:0">
            Memberi hak per orang terasa fleksibel di awal dan berubah menjadi kekacauan dalam setahun: tidak ada
            yang tahu lagi siapa boleh menutup CAPA. Peran membuat pertanyaan itu selalu terjawab oleh satu tabel,
            dan perpindahan orang antarbagian cukup diselesaikan dengan mengganti perannya. Pengecualian per orang
            sengaja tidak disediakan di purwarupa ini.
          </p>
        </div>
      </section>
    </div>`;
  }

  /* ───────── Modul 21 · Asisten QHSE ─────────
     Mesinnya ada di ai.js; di sini hanya tampilannya. Empat mode dipisah tegas
     supaya jelas apa yang sedang dikerjakan asisten, bukan satu kotak serba bisa
     yang menyembunyikan asal jawabannya. */

  const AI_MODE = [
    { id: 'referensi', label: 'Referensi Dokumen Baru', icon: 'docint' },
    { id: 'dokumen', label: 'Cari di Dokumen ISO', icon: 'search' },
    { id: 'semua', label: 'Cari Seluruh Data', icon: 'search' },
    { id: 'ringkas', label: 'Ringkasan Eksekutif', icon: 'exec' }
  ];

  let aiMode = 'semua';
  let aiQ = '';
  let aiJenis = 'Prosedur';

  const aiEsc = (s) => KGAI.esc(s);
  /* Kalimat yang dirakit dari angka tidak dapat lewat kamus i18n; ditulis dwibahasa di tempatnya. */
  const aiL = (id, en) => KGAI.L(id, en);

  /* Asisten tidak boleh menjadi pintu belakang: catatan dari modul yang tidak
     diizinkan bagi peran yang sedang masuk disaring keluar sebelum ditampilkan,
     persis seperti modulnya sendiri disembunyikan dari sidebar. */
  const aiBoleh = (rute) => allowed(rute);

  function aiChips(list) {
    return `<div class="ai-chips">${list.map(c =>
      `<button type="button" class="ai-chip" data-aiq="${aiEsc(c)}">${aiEsc(c)}</button>`).join('')}</div>`;
  }

  /* ── Hasil: pencarian ── */
  function aiHasilCari(lingkup) {
    const r = KGAI.cari(aiQ, lingkup);
    const apa = lingkup === 'iso'
      ? aiL('dokumen sistem & kepatuhan', 'system & compliance documents')
      : aiL('seluruh catatan sistem', 'every record in the system');

    if (!r.terms.length) return `<div class="ai-empty">${I(icon.search, 22)}
      <b>Ketik kata yang dicari</b>
      <p>${aiL(`Pencarian menelusuri ${apa}. Kata sambung diabaikan, dan potongan kata pun ikut ditemukan — “kondens” sudah cukup untuk menemukan “kondensat”.`,
               `The search covers ${apa}. Connecting words are ignored, and partial words are found too — “kondens” is already enough to find “kondensat”.`)}</p></div>`;

    const grup = r.grup.filter(g => aiBoleh(g.rute));
    const total = grup.reduce((a, g) => a + g.hits.length, 0);
    const disaring = r.total - total;

    if (!total) return `<div class="ai-empty">${I(icon.search, 22)}
      <b>${aiL(`Tidak ada yang cocok dengan “${aiEsc(aiQ)}”`, `Nothing matches “${aiEsc(aiQ)}”`)}</b>
      <p>${disaring
        ? aiL(`${disaring} catatan cocok tetapi berada di modul yang tidak terbuka untuk peran Anda.`,
              `${disaring} records match but sit in modules your role cannot open.`)
        : aiL('Seluruh kata yang Anda ketik harus muncul pada catatan yang sama. Coba kurangi kata, atau cari nomor catatannya langsung.',
              'Every word you type must appear in the same record. Try fewer words, or search the record number directly.')}</p></div>`;

    return `
      <div class="ai-count">${aiL(`${total} catatan cocok di ${grup.length} modul`, `${total} records match across ${grup.length} modules`)}
        <span class="ai-terms">${r.terms.map(t => `<span class="ai-term">${aiEsc(t)}</span>`).join('')}</span></div>
      ${disaring ? `<div class="tile-note" style="margin-bottom:var(--space-5)">${aiL(
        `${disaring} catatan lain juga cocok, tetapi berada di modul yang tidak terbuka untuk peran Anda dan sengaja tidak ditampilkan.`,
        `${disaring} further records also match, but sit in modules your role cannot open and are deliberately not shown.`)}</div>` : ''}
      ${grup.map(g => `
        <section class="ai-group">
          <div class="ai-group-head">
            <h3>${g.modul}</h3>
            <span class="sub">${aiL(`${g.hits.length} catatan`, `${g.hits.length} records`)}</span>
            <button class="btn btn--ghost btn--sm" data-goto="${g.rute}">Buka modul</button>
          </div>
          ${g.hits.map(h => aiKartuHit(h)).join('')}
        </section>`).join('')}`;
  }

  function aiKartuHit(h) {
    const r = h.rec;
    /* Catatan yang sudah punya halaman rincian dibuka lewat jalur yang sama dengan
       modulnya, supaya isinya persis sama dari mana pun dibuka. */
    const buka = r.detail
      ? `data-detail="${r.detail}" tabindex="0" role="button"`
      : infoAttr({
          title: r.judul,
          sub: `${r.modul}${r.id ? ' · ' + r.id : ''}`,
          body: kv(r.meta.map(m => [m[0], String(m[1])])) +
                foot(aiL(`Catatan ini ditemukan lewat Asisten QHSE. Seluruh isinya berasal dari modul ${r.modul} tanpa perubahan.`,
                         `This record was found through the QHSE Assistant. Its contents come from the ${r.modul} module unchanged.`)),
          goto: r.rute, gotoLabel: aiL('Buka ' + r.modul, 'Open ' + r.modul)
        });
    return `
      <article class="ai-hit is-clickable" ${buka}>
        <div class="ai-hit-top">
          ${r.id ? `<span class="mono mono--id">${aiEsc(r.id)}</span>` : ''}
          ${r.badge ? chip(aiEsc(r.badge), r.nada) : ''}
        </div>
        <div class="ai-hit-title">${aiEsc(r.judul)}</div>
        <div class="ai-hit-snip">${h.cuplik}</div>
      </article>`;
  }

  /* ── Hasil: referensi dokumen baru ── */
  function aiHasilReferensi() {
    if (!aiQ.trim()) return `<div class="ai-empty">${I(icon.docint, 22)}
      <b>Sebutkan topik dokumennya</b>
      <p>Contoh: “Tanggap Darurat Kebakaran Gudang”, “Pengelolaan Limbah B3”, atau “Pembuangan Kondensat Oven”. Asisten menyusun nomor, klausul acuan, dan kerangka isinya dari daftar dokumen yang sudah ada.</p></div>`;

    const r = KGAI.referensi(aiJenis, aiQ);
    const pemicu = r.pemicu.filter(p => aiBoleh(p.rute));
    const std = {};
    r.klausul.forEach(k => { (std[k.standar] = std[k.standar] || []).push(k); });

    return `
      <div class="ai-doc-head">
        <div>
          <div class="label-caps">USULAN DOKUMEN BARU</div>
          <h3>${aiEsc(r.judulUsulan)}</h3>
        </div>
        <div class="ai-doc-no"><span class="mono">${r.nomor}</span><span class="lbl">Revisi ${r.rev}</span></div>
      </div>

      ${kv([
        ['Tingkat dokumen', `L${r.level} — ${r.jenis}`],
        ['Nomor terusulkan', `<span class="mono mono--id">${r.nomor}</span> ${aiL(
          `— nomor bebas berikutnya pada seri ${r.nomor.split('-')[0]}`,
          `— the next free number in the ${r.nomor.split('-')[0]} series`)}`],
        ['Pemilik dokumen', r.pemilik],
        ['Pengesah', r.pengesah],
        ['Tanggal berlaku', `<span class="mono">${r.terbit}</span>`],
        ['Tinjau ulang', `<span class="mono">${r.tinjau}</span> ${aiL('— satu tahun, tidak boleh dikosongkan', '— one year, must never be left empty')}`],
        ['Distribusi', r.distribusi],
        ['Retensi rekaman', r.retensi]
      ])}

      <section class="section">
        <div class="section-head"><h2>Klausul yang dijawab</h2><span class="sub">${aiL(`${r.klausul.length} klausul dari ${Object.keys(std).length} standar`,
          `${r.klausul.length} clauses from ${Object.keys(std).length} standards`)}</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Standar</th><th>Klausul</th><th>Judul klausul</th></tr></thead>
          <tbody>${r.klausul.map(k => `<tr ${infoAttr({
            title: `${k.standar} — ${k.klausul}`,
            sub: k.judul,
            body: kv([
              ['Standar', k.standar], ['Klausul', k.klausul], ['Judul', k.judul],
              ['Dokumen yang menjawab', `<span class="mono mono--id">${r.nomor}</span> ${aiEsc(r.judulUsulan)}`]
            ]) + foot('Klausul diambil dari tabel pemetaan kata kunci di dalam asisten, bukan disimpulkan sendiri. Bila topik dokumen menyentuh bidang lain, tambahkan klausulnya secara manual saat penyusunan.')
          })}>
            <td>${k.standar}</td><td class="mono">${k.klausul}</td><td>${k.judul}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Kerangka isi</h2><span class="sub">${aiL(`${r.kerangka.length} bagian wajib`, `${r.kerangka.length} required sections`)}</span></div>
        <ol class="ai-outline">${r.kerangka.map(s => `<li>
          <b>${aiEsc(s[0])}</b>
          <span>${aiEsc(s[1])}</span>
        </li>`).join('')}</ol>
      </section>

      ${pemicu.length ? `
      <section class="section">
        <div class="section-head"><h2>Catatan yang membenarkan penerbitannya</h2>
          <span class="sub">${aiL(`${pemicu.length} catatan dari sistem`, `${pemicu.length} records from the system`)}</span></div>
        <div class="ai-refs">${pemicu.map(p => {
          const buka = p.detail ? `data-detail="${p.detail}" tabindex="0" role="button"` : `data-goto="${p.rute}"`;
          return `<div class="ai-ref is-clickable" ${buka}>
            <span class="mono mono--id">${aiEsc(p.id)}</span>
            <span class="ai-ref-t">${aiEsc(p.judul)}</span>
            <span class="ai-ref-m">${p.modul}</span>
          </div>`;
        }).join('')}</div>
        <div class="tile-note" style="margin-top:var(--space-4)">Dokumen sistem yang tidak dapat menunjuk satu pun catatan sebagai alasan terbitnya biasanya tidak akan dipakai di lapangan.</div>
      </section>` : ''}

      <div class="grid grid--2">
        <div class="card">
          <div class="label-caps">ACUAN INTERNAL TERKAIT</div>
          ${r.acuanInternal.length
            ? `<div class="ai-refs">${r.acuanInternal.map(d => `<div class="ai-ref is-clickable" data-goto="docint">
                <span class="mono mono--id">${d.id}</span><span class="ai-ref-t">${aiEsc(d.judul)}</span>
                <span class="ai-ref-m">L${d.level} · <span>${d.status}</span></span></div>`).join('')}</div>`
            : '<p class="ai-none">Tidak ada dokumen internal yang beririsan. Periksa sekali lagi sebelum menerbitkan — dokumen yang benar-benar berdiri sendiri jarang ada.</p>'}
        </div>
        <div class="card">
          <div class="label-caps">ACUAN EKSTERNAL TERKAIT</div>
          ${r.acuanEksternal.length
            ? `<div class="ai-refs">${r.acuanEksternal.map(d => `<div class="ai-ref is-clickable" data-goto="docext">
                <span class="mono mono--id">${d.id}</span><span class="ai-ref-t">${aiEsc(d.judul)}</span>
                <span class="ai-ref-m">${d.penerbit}</span></div>`).join('')}</div>`
            : '<p class="ai-none">Tidak ada sertifikat atau izin yang langsung terkait topik ini.</p>'}
        </div>
      </div>

      <div class="tile-note" style="margin-top:var(--space-5)">Yang disusun asisten adalah kerangka dan acuannya, bukan isinya. Kalimat prosedur tetap ditulis oleh pemilik proses, karena hanya dia yang tahu bagaimana pekerjaan itu benar-benar dijalankan.</div>`;
  }

  /* ── Hasil: ringkasan eksekutif ── */
  function aiHasilRingkas() {
    if (!aiQ.trim()) return `<div class="ai-empty">${I(icon.exec, 22)}
      <b>Sebutkan ringkasan yang Anda butuhkan</b>
      <p>Tulis dengan kalimat biasa. Asisten mengenali topiknya, lalu menghitung ulang angkanya dari data modul — bukan menyalin ringkasan yang sudah jadi.</p></div>`;

    const s0 = KGAI.ringkas(aiQ);
    const bagian = s0.bagian.filter(b => aiBoleh(b.rute));

    if (!bagian.length) return `<div class="ai-empty">${I(icon.exec, 22)}
      <b>Tidak ada bidang yang terbuka untuk peran Anda</b>
      <p>Permintaan ini menyentuh modul yang tidak diizinkan bagi peran yang sedang masuk. Mintakan ringkasannya kepada QHSE atau Plant Manager.</p></div>`;

    /* Angka utama dan judul disusun ulang dari bagian yang lolos saringan peran,
       supaya tidak ada ubin yang menampilkan angka dari modul yang tidak terbuka. */
    const angka = [];
    bagian.forEach(b => b.angka.forEach(a => { if (angka.length < 6) angka.push(a); }));
    const s = {
      permintaan: s0.permintaan, lingkup: s0.lingkup, angka: angka, bagian: bagian,
      judul: bagian.length === s0.bagian.length && s0.bagian.length > 3
        ? 'Kinerja QHSE Menyeluruh' : bagian.map(b => b.judul).join(', '),
      keputusan: s0.keputusan.filter(k => aiBoleh(k.rute)),
      rekomendasi: s0.rekomendasi.filter(a => aiBoleh(a.rute))
    };

    return `
      <div class="ai-sum-head">
        <div class="label-caps">RINGKASAN EKSEKUTIF</div>
        <h3>${aiEsc(s.judul)}</h3>
        <p>${s.lingkup} · ${aiL(`disusun dari ${s.bagian.length} bidang atas permintaan “${aiEsc(s.permintaan)}”`,
          `built from ${s.bagian.length} areas in answer to “${aiEsc(s.permintaan)}”`)}</p>
      </div>

      <div class="grid grid--3">
        ${s.angka.map(a => `<article class="card tile is-clickable" ${infoAttr({
          title: a.label, sub: `${D.plant} · ${D.periode}`,
          body: `<div class="info-num">${a.nilai}${a.satuan ? `<span class="tile-unit">${a.satuan}</span>` : ''}</div>`
            + kv([['Angka', `${a.nilai}${a.satuan || ''}`], ['Cakupan', a.note],
                  ['Periode', `${D.periode} · ${D.plant}`]])
            + foot('Angka dihitung ulang dari data modul setiap kali ringkasan disusun, jadi selalu sama dengan yang terlihat di modulnya.')
        })}>
          <div class="tile-head"><span class="label-caps">${a.label}</span></div>
          <div class="tile-num">${a.nilai}${a.satuan ? `<span class="tile-unit">${a.satuan}</span>` : ''}</div>
          <div class="tile-note">${a.note}</div>
        </article>`).join('')}
      </div>

      ${s.bagian.map(b => `
        <section class="section">
          <div class="section-head"><h2>${b.judul}</h2>
            <button class="btn btn--ghost btn--sm" data-goto="${b.rute}">Buka modul</button></div>
          <ul class="ai-points">${b.poin.map(p => `<li>${p}</li>`).join('')}</ul>
          ${b.tabel && b.tabel.rows.length ? `<div class="table-wrap"><table>
            <thead><tr>${b.tabel.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${b.tabel.rows.map(row => `<tr ${infoAttr({
              title: String(row[1] || row[0]),
              sub: b.judul,
              body: kv(b.tabel.head.map((h, i) => [h, String(row[i] == null ? '—' : row[i])]))
                + foot(aiL('Baris ini berasal dari bagian ' + b.judul.toLowerCase() + '. Buka modulnya untuk melihat catatan lengkapnya.',
                           'This row comes from the ' + b.judul.toLowerCase() + ' section. Open the module to see the full record.')),
              goto: b.rute, gotoLabel: 'Buka modul'
            })}>${row.map((c, i) => `<td${i === 0 ? ' class="mono mono--id"' : ''}>${aiEsc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table></div>` : ''}
        </section>`).join('')}

      ${s.keputusan.length ? `
      <section class="section">
        <div class="section-head"><h2>Perlu keputusan manajemen</h2>
          <span class="sub">${aiL(`${s.keputusan.length} hal yang tidak dapat diselesaikan di tingkat pabrik`,
            `${s.keputusan.length} items the plant cannot settle on its own`)}</span></div>
        <div class="grid grid--2">${s.keputusan.map(k => `<div class="card ai-decision is-clickable" ${infoAttr({
          title: k.judul, sub: 'Perlu keputusan manajemen',
          body: kv([['Mengapa naik ke manajemen', k.alasan], ['Pilihan yang tersedia', k.opsi]])
            + foot('Papan eksekutif tanpa bagian ini hanya memindahkan angka, tidak memindahkan keputusan.'),
          goto: k.rute, gotoLabel: 'Buka modul'
        })}>
          <div class="ai-dec-title">${aiEsc(k.judul)}</div>
          <p>${aiEsc(k.alasan)}</p>
          <div class="ai-dec-opt"><b>Pilihan</b> ${aiEsc(k.opsi)}</div>
        </div>`).join('')}</div>
      </section>` : ''}

      <section class="section">
        <div class="section-head"><h2>Tindakan yang disarankan</h2>
          <span class="sub">berurutan menurut akibat bila ditunda</span></div>
        <ol class="ai-actions">${s.rekomendasi.map(a => `<li>
          <span>${aiEsc(a.teks)}</span>
          <button class="btn btn--ghost btn--sm" data-goto="${a.rute}">${a.sumber}</button>
        </li>`).join('')}</ol>
      </section>

      <div class="tile-note" style="margin-top:var(--space-5)">Seluruh angka pada ringkasan ini dihitung dari modulnya masing-masing saat ringkasan disusun. Tidak ada angka yang diketik tangan, dan tidak ada kalimat yang dikarang di luar data — itulah sebabnya ringkasan ini dapat dibawa ke rapat dan ditelusuri sampai ke barisnya.</div>`;
  }

  function aiHasil() {
    if (aiMode === 'referensi') return aiHasilReferensi();
    if (aiMode === 'ringkas') return aiHasilRingkas();
    return aiHasilCari(aiMode === 'dokumen' ? 'iso' : 'semua');
  }

  function viewAi() {
    const m = AI_MODE.filter(x => x.id === aiMode)[0] || AI_MODE[0];
    const placeholder = {
      referensi: 'Topik dokumen — misalnya: Tanggap Darurat Kebakaran Gudang',
      dokumen: 'Kata yang dicari di dokumen ISO — misalnya: limbah B3',
      semua: 'Kata, nama, lokasi, atau nomor catatan — misalnya: boiler',
      ringkas: 'Ringkasan apa yang Anda butuhkan? — misalnya: status CAPA dan temuan audit'
    }[aiMode];
    const contoh = {
      referensi: ['Tanggap Darurat Kebakaran Gudang', 'Pengelolaan Limbah B3', 'Pembuangan Kondensat Oven', 'Izin Kerja Ruang Terbatas'],
      dokumen: KGAI.contoh.iso,
      semua: KGAI.contoh.semua,
      ringkas: KGAI.contoh.ringkas
    }[aiMode];

    return hero({
      eyebrow: 'MODUL 21 · ASISTEN QHSE',
      title: 'Asisten QHSE',
      desc: 'Satu tempat untuk menyusun referensi dokumen ISO baru, menelusuri kata di seluruh catatan sistem, dan mengubah data menjadi ringkasan yang siap dibawa ke rapat manajemen.',
      metric: KGAI.jumlahIndeks(),
      metricLabel: 'catatan terindeks',
      action: { act: 'ai-cara', icon: 'ai', label: 'Cara Kerja Asisten' }
    }) + `
    <div class="page">
      <div class="ai-modes" role="group" aria-label="Mode asisten">
        ${AI_MODE.map(x => `<button type="button" class="ai-mode" data-aimode="${x.id}"
          aria-pressed="${x.id === aiMode}">${I(icon[x.icon], 16)}<span>${x.label}</span></button>`).join('')}
      </div>

      <form class="ai-ask" id="ai-form" autocomplete="off">
        ${aiMode === 'referensi' ? `
          <div class="field ai-jenis">
            <label for="ai-jenis">Jenis dokumen</label>
            <!-- value sengaja ditulis eksplisit: tr() menerjemahkan teks pilihan,
                 dan tanpa value kunci jenis dokumen ikut berubah saat bahasa Inggris dipilih. -->
            <select id="ai-jenis">${KGAI.jenisDokumen.map(j =>
              `<option value="${j}"${j === aiJenis ? ' selected' : ''}>${j}</option>`).join('')}</select>
          </div>` : ''}
        <div class="field ai-field">
          <label for="ai-q">${m.label}</label>
          <input id="ai-q" type="text" value="${aiEsc(aiQ)}" placeholder="${aiEsc(placeholder)}">
        </div>
        <button type="submit" class="btn btn--primary ai-go">
          ${I(icon[aiMode === 'referensi' ? 'docint' : aiMode === 'ringkas' ? 'exec' : 'search'], 17)}
          ${aiMode === 'referensi' ? 'Susun Referensi' : aiMode === 'ringkas' ? 'Susun Ringkasan' : 'Cari'}
        </button>
      </form>

      ${aiChips(contoh)}

      <div id="ai-result" class="ai-result">${aiHasil()}</div>

      <div class="card ai-honest">
        <div class="label-caps">BATAS YANG PERLU DIKETAHUI</div>
        <p>${aiL(
          `Asisten ini berjalan sepenuhnya di dalam peramban, tanpa server dan tanpa model bahasa. Yang dikerjakannya nyata — indeks pencarian ${KGAI.jumlahIndeks()} catatan, penomoran dokumen, pemetaan klausul, dan perhitungan ringkasan — tetapi semuanya berasal dari aturan tertulis yang dijalankan atas data purwarupa. Akibatnya disengaja: asisten tidak pernah mengarang, dan setiap angka yang ditampilkan dapat ditelusuri kembali ke catatan asalnya. Pada sistem sebenarnya lapisan ini tetap dipakai sebagai penyedia fakta; model bahasa hanya merangkai kalimat dari fakta yang sudah terkunci di sini.`,
          `This assistant runs entirely inside the browser, with no server and no language model. What it does is real — a search index over ${KGAI.jumlahIndeks()} records, document numbering, clause mapping and summary arithmetic — but all of it comes from rules written into the code and run over the prototype data. The consequence is deliberate: the assistant never invents anything, and every figure it shows can be traced back to the record it came from. In a live system this layer still serves the facts; a language model would only phrase sentences from facts already locked down here.`)}</p>
      </div>
    </div>`;
  }

  /* ───────── Render ───────── */
  const VIEWS = { exec: viewExec, dashboard: viewDashboard, incident: viewIncident,
    hazard: viewHazard, bbs: viewBbs, inspection: viewInspection, checklist: viewChecklist,
    permit: viewPermit, risk: viewRisk, capa: viewCapa, audit: viewAudit,
    environment: viewEnvironment, docint: viewDocInt, docext: viewDocExt,
    training: viewTraining, activity: viewActivity, kpi: viewKpi, notif: viewNotif,
    settings: viewSettings, users: viewUsers, ai: viewAi };

  let current = 'dashboard';
  let session = null;

  /* ───────── Preferensi: tema & bahasa ───────── */

  const store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  let theme = store.get('kg-theme') || 'system';
  let lang = store.get('kg-lang') || 'id';

  function applyTheme(t) {
    theme = (t === 'dark' || t === 'light') ? t : 'system';
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    store.set('kg-theme', theme);
    syncSwitches();
  }

  function applyLang(l) {
    lang = (l === 'en') ? 'en' : 'id';
    KGI18N.setLang(lang);
    document.documentElement.lang = lang;
    store.set('kg-lang', lang);
    translateDom(document.getElementById('login'));
    translateDom(document.querySelector('.brand'));
    if (session) { setUserCard(); render(); }
    syncSwitches();
  }

  function syncSwitches() {
    const b1 = document.querySelectorAll('[data-theme-set]');
    for (let i = 0; i < b1.length; i++) b1[i].setAttribute('aria-pressed', String(b1[i].dataset.themeSet === theme));
    const b2 = document.querySelectorAll('[data-lang]');
    for (let i = 0; i < b2.length; i++) b2[i].setAttribute('aria-pressed', String(b2[i].dataset.lang === lang));
  }

  /* Menerjemahkan markup statis (layar masuk, kartu pengguna) di tempat.
     Teks asli disimpan pada simpulnya supaya perpindahan bahasa bisa bolak-balik. */
  function translateDom(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      const raw = n.nodeValue;
      if (!raw || !raw.trim()) return;
      if (n.__kg === undefined) n.__kg = raw.trim();
      const v = KGI18N.t(n.__kg);
      if (v !== n.__kg || raw.trim() !== n.__kg) n.nodeValue = raw.replace(raw.trim(), v);
    });
    ['placeholder', 'aria-label', 'title'].forEach(function (a) {
      const els = root.querySelectorAll('[' + a + ']');
      for (let i = 0; i < els.length; i++) {
        const el = els[i], key = '__kg_' + a;
        if (el[key] === undefined) el[key] = el.getAttribute(a);
        el.setAttribute(a, KGI18N.t(el[key]));
      }
    });
  }

  /* ───────── Sesi ───────── */

  const PASSWORD = 'demo1234';

  function loadSession() {
    let email = null;
    try { email = sessionStorage.getItem('kg-session') || localStorage.getItem('kg-session'); } catch (e) {}
    if (!email) return null;
    return D.pengguna.filter(function (u) { return u.email === email && u.status === 'Aktif'; })[0] || null;
  }
  function saveSession(email, remember) {
    try {
      if (remember) { localStorage.setItem('kg-session', email); sessionStorage.removeItem('kg-session'); }
      else { sessionStorage.setItem('kg-session', email); localStorage.removeItem('kg-session'); }
    } catch (e) {}
  }
  function clearSession() {
    try { sessionStorage.removeItem('kg-session'); localStorage.removeItem('kg-session'); } catch (e) {}
  }

  function allowed(id) {
    if (!session) return false;
    const r = D.peran[session.peran];
    return !!r && r.modul.indexOf(id) !== -1;
  }
  function firstAllowed() {
    const f = ALL.filter(function (x) { return allowed(x.id); })[0];
    return f ? f.id : 'dashboard';
  }

  function setUserCard() {
    document.getElementById('user-initials').textContent = session.inisial;
    document.getElementById('user-name').textContent = session.nama;
    document.getElementById('user-role').textContent =
      KGI18N.t(D.peran[session.peran].nama) + ' · ' + session.lokasi;
  }

  function showApp() {
    document.getElementById('login').hidden = true;
    document.getElementById('app').hidden = false;
    document.querySelector('.fab').hidden = false;
    setUserCard();
  }

  function showLogin() {
    document.getElementById('app').hidden = true;
    document.querySelector('.fab').hidden = true;
    const el = document.getElementById('login');
    el.hidden = false;
    renderLoginAccounts();
    translateDom(el);
    syncSwitches();
  }

  function renderLoginAccounts() {
    const host = document.getElementById('login-accounts');
    if (!host) return;
    host.innerHTML = KGI18N.tr(D.pengguna.filter(function (u) { return u.status === 'Aktif'; })
      .slice(0, 5).map(function (u) {
        return '<button type="button" class="demo-acct" data-acct="' + u.email + '">' +
          '<span class="av">' + u.inisial + '</span>' +
          '<span><span class="nm">' + u.nama + '</span><br>' +
          '<span class="rl">' + D.peran[u.peran].nama + ' · ' + u.lokasi + '</span></span></button>';
      }).join(''));
  }

  function loginError(msg) {
    const box = document.getElementById('login-error');
    if (!msg) { box.hidden = true; box.textContent = ''; return; }
    box.hidden = false;
    box.textContent = KGI18N.t(msg);
  }

  function attemptLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const remember = document.getElementById('login-remember').checked;
    if (!email) return loginError('Alamat email belum diisi.');
    if (!pass) return loginError('Kata sandi belum diisi.');
    const u = D.pengguna.filter(function (x) {
      return x.email.toLowerCase() === email.toLowerCase() && x.status === 'Aktif';
    })[0];
    if (!u || pass !== PASSWORD) {
      return loginError('Email atau kata sandi salah. Periksa kembali, atau pakai salah satu akun demo di bawah.');
    }
    loginError(null);
    session = u;
    saveSession(u.email, remember);
    showApp();
    const start = firstAllowed();
    if (location.hash === '#/' + start) route(); else location.hash = '#/' + start;
    toast('Selamat datang, ' + u.nama.split(' ')[0] + '.');
  }

  function logout() {
    session = null;
    clearSession();
    closeModal();
    location.hash = '';
    showLogin();
  }

  /* ───────── Render ───────── */

  function renderNav() {
    return NAV.map(function (g) {
      const items = g.items.filter(function (it) { return allowed(it.id); });
      if (!items.length) return '';
      return (g.group ? '<div class="nav-group">' + g.group + '</div>' : '') +
        items.map(function (it) {
          return '<a class="nav-item" href="#/' + it.id + '"' +
            (current === it.id ? ' aria-current="page"' : '') + '>' +
            I(icon[it.icon], 18) + '<span>' + it.label + '</span>' +
            (it.count ? '<span class="nav-count">' + it.count + '</span>' : '') + '</a>';
        }).join('');
    }).join('');
  }

  function render() {
    document.getElementById('nav').innerHTML = KGI18N.tr(renderNav());
    const main = document.getElementById('view');
    resetInfo();
    main.innerHTML = KGI18N.tr((VIEWS[current] || viewDashboard)());
    const item = ALL.filter(function (x) { return x.id === current; })[0];
    document.getElementById('mobile-title').textContent = KGI18N.t(item ? item.label : 'KG SafeGuard');
    syncSwitches();
    window.scrollTo(0, 0);
  }

  function route() {
    if (!session) { showLogin(); return; }
    const id = (location.hash || '#/').replace('#/', '');
    const target = (VIEWS[id] && allowed(id)) ? id : firstAllowed();
    /* Alamat tidak boleh berbohong: kalau modul tidak diizinkan, hash ikut dibetulkan. */
    if (target !== id) { try { history.replaceState(null, '', '#/' + target); } catch (e) {} }
    current = target;
    document.querySelector('.sidebar').classList.remove('is-open');
    render();
  }

  /* ───────── Modal ───────── */

  function openModal(o) {
    const host = document.getElementById('modal-host');
    host.innerHTML = KGI18N.tr([
      '<div class="scrim" data-close>',
      '  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">',
      '    <div class="modal-head">',
      '      <div>',
      '        <h2 id="modal-title">' + o.title + '</h2>',
      '        <div class="sub">' + o.sub + '</div>',
      '      </div>',
      '      <button class="icon-btn" data-close aria-label="Tutup">' + I(icon.close, 18) + '</button>',
      '    </div>',
      '    <div class="modal-body">' + o.body + '</div>',
      '    <div class="modal-foot">',
      (o.autosave ? '<span class="autosave">Draf tersimpan 08:42</span>' : ''),
      '      <button class="btn btn--ghost" data-close>' + (o.ok ? 'Batal' : 'Tutup') + '</button>',
      (o.goto ? '<button class="btn btn--primary" data-goto="' + o.goto + '">' + (o.gotoLabel || 'Buka modul') + '</button>' : ''),
      (o.ok ? '<button class="btn btn--primary" data-submit="' + (o.toast || '') + '">' + o.ok + '</button>' : ''),
      '    </div>',
      '  </div>',
      '</div>'
    ].join(''));
    host.hidden = false;
    const first = host.querySelector('button, select, input, textarea');
    if (first) first.focus();
  }

  function closeModal() {
    const host = document.getElementById('modal-host');
    host.hidden = true; host.innerHTML = '';
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status');
    t.textContent = KGI18N.t(msg);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }

  /* ───────── Peristiwa ───────── */

  /* Asisten memperbarui panel hasilnya saja, bukan seluruh halaman, supaya
     kotak isian tidak kehilangan isi dan fokusnya saat hasil berganti. */
  function aiJalankan() {
    const q = document.getElementById('ai-q');
    const j = document.getElementById('ai-jenis');
    if (q) aiQ = q.value;
    if (j) aiJenis = j.value;
    const host = document.getElementById('ai-result');
    if (host) host.innerHTML = KGI18N.tr(aiHasil());
  }

  document.addEventListener('submit', function (e) {
    if (!e.target) return;
    if (e.target.id === 'login-form') { e.preventDefault(); attemptLogin(); return; }
    if (e.target.id === 'ai-form') { e.preventDefault(); aiJalankan(); }
  });

  document.addEventListener('click', function (e) {
    const aiM = e.target.closest('[data-aimode]');
    if (aiM) {
      if (aiM.dataset.aimode !== aiMode) { aiMode = aiM.dataset.aimode; aiQ = ''; render(); }
      const box = document.getElementById('ai-q'); if (box) box.focus();
      return;
    }

    const aiC = e.target.closest('[data-aiq]');
    if (aiC) {
      const box = document.getElementById('ai-q');
      if (box) { box.value = aiC.dataset.aiq; box.focus(); }
      aiJalankan();
      return;
    }

    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) { applyLang(langBtn.dataset.lang); return; }

    const themeBtn = e.target.closest('[data-theme-set]');
    if (themeBtn) { applyTheme(themeBtn.dataset.themeSet); return; }

    const acct = e.target.closest('[data-acct]');
    if (acct) {
      document.getElementById('login-email').value = acct.dataset.acct;
      document.getElementById('login-pass').value = PASSWORD;
      loginError(null);
      return;
    }

    if (e.target.closest('#pass-toggle')) {
      const f = document.getElementById('login-pass');
      f.type = f.type === 'password' ? 'text' : 'password';
      return;
    }

    if (e.target.closest('#logout-btn')) { logout(); return; }

    const tg = e.target.closest('[data-toggle]');
    if (tg) { tg.setAttribute('aria-pressed', tg.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }

    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn && (e.target === closeBtn || closeBtn.tagName === 'BUTTON')) { closeModal(); return; }

    const submit = e.target.closest('[data-submit]');
    if (submit) { closeModal(); if (submit.dataset.submit) toast(submit.dataset.submit); return; }

    const pick = e.target.closest('[data-pick]');
    if (pick) {
      const sibs = pick.parentElement.querySelectorAll('[data-pick]');
      for (let i = 0; i < sibs.length; i++) sibs[i].setAttribute('aria-pressed', 'false');
      pick.setAttribute('aria-pressed', 'true');
      return;
    }

    const act = e.target.closest('[data-act]');
    if (act) { const a = ACTIONS[act.dataset.act]; if (a) openModal(Object.assign({ autosave: true }, a)); return; }

    const goto = e.target.closest('[data-goto]');
    if (goto && VIEWS[goto.dataset.goto]) {
      closeModal();
      location.hash = '#/' + goto.dataset.goto;
      return;
    }

    const row = e.target.closest('[data-detail]');
    if (row) {
      const parts = row.dataset.detail.split(':');
      const d = detail(parts[0], parts[1]);
      if (d) openModal(d);
      return;
    }

    const box = e.target.closest('[data-info]');
    if (box) { const d = INFO[box.dataset.info]; if (d) openModal(d); return; }

    const f = e.target.closest('[data-filter]');
    if (f) { incFilter = f.dataset.filter; render(); return; }

    if (e.target.closest('#menu-btn')) {
      document.querySelector('.sidebar').classList.toggle('is-open'); return;
    }

    const pill = e.target.closest('.pill');
    if (pill && !e.target.closest('[data-filter]')) {
      const on = pill.getAttribute('aria-pressed') === 'true';
      const sibs = pill.parentElement.querySelectorAll('.pill');
      for (let i = 0; i < sibs.length; i++) sibs[i].setAttribute('aria-pressed', 'false');
      pill.setAttribute('aria-pressed', on ? 'false' : 'true');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !document.getElementById('modal-host').hidden) { closeModal(); return; }
    /* Baris dan ubin dapat dibuka dengan papan ketik, bukan hanya tetikus. */
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.matches('input, textarea, select, button, a')) return;
    const box = t.closest('[data-info], [data-detail]');
    if (!box) return;
    e.preventDefault();
    if (box.dataset.info) { const d = INFO[box.dataset.info]; if (d) openModal(d); return; }
    const parts = box.dataset.detail.split(':');
    const d = detail(parts[0], parts[1]);
    if (d) openModal(d);
  });

  window.addEventListener('hashchange', route);

  /* Laporan yang masuk dari aplikasi lapangan pada tab lain langsung terlihat
     di modul yang sedang dibuka, tanpa perlu memuat ulang halaman. */
  if (window.KGLAP) {
    KGLAP.dengar(function () {
      if (session && ['hazard', 'incident', 'bbs'].indexOf(current) !== -1) render();
    });
  }

  /* ───────── Boot ───────── */

  KGI18N.setLang(lang);
  document.documentElement.lang = lang;
  applyTheme(theme);
  translateDom(document.querySelector('.brand'));

  session = loadSession();
  if (session) { showApp(); route(); } else { showLogin(); }
})();
