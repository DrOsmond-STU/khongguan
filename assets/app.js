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
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6"/><path d="M18 20c0-2.2-.9-4.2-2.3-5.6"/>'
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
    { group: null, items: [{ id: 'dashboard', label: 'Dashboard & Laporan', icon: 'dashboard', modul: 7 }] },
    { group: 'KEJADIAN & BAHAYA', items: [
      { id: 'incident', label: 'Incident & Nearmiss', icon: 'incident', modul: 1, count: 4 },
      { id: 'hazard', label: 'Laporan Bahaya K3L', icon: 'hazard', modul: 4, count: 2 }
    ] },
    { group: 'PENGENDALIAN', items: [
      { id: 'inspection', label: 'Inspection', icon: 'inspection', modul: 2 },
      { id: 'permit', label: 'Work Permit & JSEA', icon: 'permit', modul: 3 },
      { id: 'capa', label: 'CAPA', icon: 'capa', modul: 10, count: 2 }
    ] },
    { group: 'KEPATUHAN', items: [
      { id: 'audit', label: 'Audit', icon: 'audit', modul: 5 },
      { id: 'environment', label: 'Environment', icon: 'environment', modul: 6 },
      { id: 'kpi', label: 'SHE KPI & Analytics', icon: 'kpi', modul: 8 },
      { id: 'activity', label: 'SHE Activity', icon: 'activity', modul: 9 }
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
    const ticks = [0, .25, .5, .75, 1].map(f => Math.round(max * f));
    const peak = vals.indexOf(Math.max(...vals));
    const last = series.length - 1;
    const tY = o.target != null ? y(o.target) : null;
    return `<svg viewBox="0 0 ${o.w} ${o.h}" width="100%" role="img" aria-label="${o.aria || ''}">
      <g stroke="var(--border-100)" stroke-width="1">
        ${ticks.map(t => `<line x1="${o.pad}" y1="${y(t).toFixed(1)}" x2="${o.w - 16}" y2="${y(t).toFixed(1)}"/>`).join('')}
      </g>
      <g text-anchor="end" font-family="var(--font-mono)" font-size="10" fill="var(--ink-500)">
        ${ticks.map(t => `<text x="${o.pad - 8}" y="${(y(t) + 4).toFixed(1)}">${t}</text>`).join('')}
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
        font-family="var(--font-mono)" font-size="10" fill="var(--signal-critical)">${vals[peak]}</text>
      <text x="${(x(last) - 8).toFixed(1)}" y="${(y(vals[last]) - 8).toFixed(1)}" text-anchor="end"
        font-family="var(--font-mono)" font-size="10" fill="var(--brand-700)">${vals[last]}</text>
      <g text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="var(--ink-500)">
        ${series.map((p, i) => `<text x="${x(i).toFixed(1)}" y="180">${p.bln}</text>`).join('')}
      </g>
    </svg>`;
  }

  /* ───────── Potongan yang dipakai ulang ───────── */
  const tile = (t) => `
    <article class="card tile">
      <div class="tile-head">
        <span class="label-caps">${t.label}</span>
        <span class="tile-icon">${I(icon[t.icon || 'kpi'], 18)}</span>
      </div>
      <div class="tile-num${t.big ? ' big' : ''}">${t.value}${t.unit ? `<span class="tile-unit">${t.unit}</span>` : ''}</div>
      <span class="tile-trend ${t.arah || 'flat'}">${t.arah === 'good' ? I(icon.up, 12) : t.arah === 'bad' ? I(icon.down, 12) : ''}${t.delta}</span>
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
        note: 'September 2026 · 1 accident, 2 nearmiss' },
      { label: 'SAFE MANHOURS', value: '1.284.560', big: true, icon: 'clock', arah: 'good',
        delta: '238 hari tanpa LTI', note: 'Jam kerja sejak LTI terakhir · Lagging' },
      { label: 'TEMUAN TERBUKA', value: '14', icon: 'inspection', arah: 'bad', delta: '3 vs Agustus',
        note: 'Inspeksi 10 · audit 4 · lintas modul' },
      { label: 'CAPA JATUH TEMPO', value: '6', icon: 'capa', arah: 'bad', delta: '2 lewat tenggat',
        note: 'Selesai tepat waktu 82% · target ≥ 90%' }
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
              <div class="feed-item">
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
              <div class="feed-item">
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
                <tr data-detail="insiden:${r.id}" class="${r.terlambat ? 'is-overdue' : ''}">
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
                return `<tr data-detail="inspeksi:${r.id}">
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
            <div class="param" style="grid-template-columns:1fr auto">
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
          <article class="card" style="margin-bottom:var(--space-4);display:grid;grid-template-columns:auto 1fr auto;gap:var(--space-4);align-items:center" data-detail="izin:${p.id}">
            <span class="feed-icon chip--${kindClass[p.ikon]}" style="width:56px;height:56px;border-radius:var(--radius-md);flex-direction:column;gap:2px">
              ${I(icon.permit, 20)}<span style="font-size:9px;font-weight:700;letter-spacing:.06em">${kindLabel[p.ikon]}</span>
            </span>
            <div>
              <span class="mono mono--id" style="font-size:12px">${p.id}</span>
              <div style="font-size:15px;line-height:21px;font-weight:600;color:var(--ink-900);margin:2px 0 4px">${p.judul}</div>
              <div style="font-size:13px;line-height:19px;color:var(--ink-500)">${p.pelaksana}${p.vendor ? ' (vendor)' : ''} · ${p.pekerja} pekerja · Pengawas: ${p.pengawas}</div>
              <div class="mono" style="color:var(--ink-700);margin-top:2px">${p.mulai}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--space-2);align-items:flex-end">
              ${chip(p.status.toUpperCase(), T.status[p.status])}
              <span class="mono mono--muted" style="font-size:12px">risiko ${p.risikoAwal} → ${p.risikoSisa}</span>
            </div>
            <div style="grid-column:1/-1;border-top:1px solid var(--border-100);padding-top:var(--space-3);display:flex;flex-wrap:wrap;gap:var(--space-2)">
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
              <li class="${s.state}">
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
                return `<tr>
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

      <section class="section">
        <div class="section-head"><h2>Papan Tindak Lanjut</h2><span class="sub">Tiga kolom, kiri ke kanan</span></div>
        <div class="kanban" style="grid-template-columns:repeat(3,minmax(0,1fr))">
          ${kolom.map(k => {
            const items = D.bahaya.filter(b => b.status === k);
            return `<div class="kan-col">
              <h3><span>${k.toUpperCase()}</span><span class="mono">${items.length}</span></h3>
              ${items.map(b => `
                <div class="kan-card" data-detail="bahaya:${b.id}">
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
                <tr data-detail="audit:${a.id}">
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
                  <tr class="${t.kategori === 'Major' ? 'is-overdue' : ''}">
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
            return `<div style="margin-bottom:var(--space-3)">
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
          <div class="param">
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
    const k = (x) => tile({ label: x.nama.toUpperCase(), value: x.nilai, unit: x.satuan,
      icon: 'kpi', arah: x.arah, delta: x.delta, note: x.note });
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
        <div class="grid grid--3">${D.kpiLagging.map(k).join('')}</div>
      </section>
      <section class="section">
        <div class="section-head">
          <h2>Leading Indicator</h2>
          <span class="sub">Usaha yang sedang dilakukan · arah "baik" mengikuti arti, bukan arah angka</span>
        </div>
        <div class="grid grid--3">${D.kpiLeading.map(k).join('')}</div>
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
                  <tr>
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
            <article class="card act-card" data-detail="kegiatan:${k.id}">
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
                <div class="kan-card" data-detail="capa:${c.id}">
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
                <tr class="${c.terlambat ? 'is-overdue' : ''}" data-detail="capa:${c.id}">
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
    'unduh': { title: 'Siapkan Laporan', sub: 'Purwarupa — berkas tidak benar-benar dihasilkan',
      body: `<div class="tile-note" style="border:0;padding:0">Pada sistem sebenarnya, laporan dirakit dari data modul terkait, diberi kop dengan lambang korporat Khong Guan, lalu dikirim sebagai PDF ke daftar penerima.</div>`,
      ok: 'Mengerti', toast: 'Laporan sedang disiapkan.' }
  };

  /* ───────── Render ───────── */
  const VIEWS = { dashboard: viewDashboard, incident: viewIncident, inspection: viewInspection,
    permit: viewPermit, hazard: viewHazard, audit: viewAudit, environment: viewEnvironment,
    kpi: viewKpi, activity: viewActivity, capa: viewCapa };

  let current = 'dashboard';

  function renderNav() {
    return NAV.map(g => `
      ${g.group ? `<div class="nav-group">${g.group}</div>` : ''}
      ${g.items.map(it => `
        <a class="nav-item" href="#/${it.id}" ${current === it.id ? 'aria-current="page"' : ''}>
          ${I(icon[it.icon], 18)}<span>${it.label}</span>
          ${it.count ? `<span class="nav-count">${it.count}</span>` : ''}
        </a>`).join('')}`).join('');
  }

  function render() {
    document.getElementById('nav').innerHTML = renderNav();
    const main = document.getElementById('view');
    main.innerHTML = (VIEWS[current] || viewDashboard)();
    document.getElementById('mobile-title').textContent =
      (ALL.find(x => x.id === current) || {}).label || 'KG SafeGuard';
    main.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function route() {
    const id = (location.hash || '#/dashboard').replace('#/', '');
    current = VIEWS[id] ? id : 'dashboard';
    document.querySelector('.sidebar').classList.remove('is-open');
    render();
  }

  /* ───────── Modal ───────── */
  function openModal(o) {
    const host = document.getElementById('modal-host');
    host.innerHTML = `
      <div class="scrim" data-close>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-head">
            <div>
              <h2 id="modal-title">${o.title}</h2>
              <div class="sub">${o.sub}</div>
            </div>
            <button class="icon-btn" data-close aria-label="Tutup">${I(icon.close, 18)}</button>
          </div>
          <div class="modal-body">${o.body}</div>
          <div class="modal-foot">
            ${o.autosave ? `<span class="autosave">Draf tersimpan 08:42</span>` : ''}
            <button class="btn btn--ghost" data-close>${o.ok ? 'Batal' : 'Tutup'}</button>
            ${o.ok ? `<button class="btn btn--primary" data-submit="${o.toast || ''}">${o.ok}</button>` : ''}
          </div>
        </div>
      </div>`;
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
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  /* ───────── Peristiwa ───────── */
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn && (closeBtn.hasAttribute('data-close') && (e.target === closeBtn || closeBtn.tagName === 'BUTTON'))) {
      closeModal(); return;
    }
    const submit = e.target.closest('[data-submit]');
    if (submit) { closeModal(); if (submit.dataset.submit) toast(submit.dataset.submit); return; }

    const pick = e.target.closest('[data-pick]');
    if (pick) {
      pick.parentElement.querySelectorAll('[data-pick]').forEach(p => p.setAttribute('aria-pressed', 'false'));
      pick.setAttribute('aria-pressed', 'true'); return;
    }
    const act = e.target.closest('[data-act]');
    if (act) { const a = ACTIONS[act.dataset.act]; if (a) openModal(Object.assign({ autosave: true }, a)); return; }

    const row = e.target.closest('[data-detail]');
    if (row) {
      const [kind, id] = row.dataset.detail.split(':');
      const d = detail(kind, id);
      if (d) openModal(d);
      return;
    }
    const f = e.target.closest('[data-filter]');
    if (f) { incFilter = f.dataset.filter; render(); return; }

    if (e.target.closest('#menu-btn')) {
      document.querySelector('.sidebar').classList.toggle('is-open'); return;
    }
    if (e.target.closest('.pill') && !e.target.closest('[data-filter]')) {
      const p = e.target.closest('.pill');
      const on = p.getAttribute('aria-pressed') === 'true';
      p.parentElement.querySelectorAll('.pill').forEach(x => x.setAttribute('aria-pressed', 'false'));
      p.setAttribute('aria-pressed', on ? 'false' : 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('modal-host').hidden) closeModal();
  });

  window.addEventListener('hashchange', route);
  route();
})();
