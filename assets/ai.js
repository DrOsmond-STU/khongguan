/* KG SafeGuard — Asisten QHSE.

   Yang perlu diketahui sebelum membaca kode ini: asisten berjalan sepenuhnya di
   dalam peramban. Tidak ada server, tidak ada kunci API, dan tidak ada model
   bahasa di belakangnya. Yang dikerjakannya nyata — indeks pencarian penuh,
   penomoran dokumen, pemetaan klausul standar, dan perhitungan ringkasan — tetapi
   semuanya berasal dari aturan yang tertulis di berkas ini, dijalankan atas data
   pada data.js.

   Konsekuensinya disengaja: asisten tidak pernah mengarang. Setiap angka yang
   ditampilkan dapat ditelusuri kembali ke catatan asalnya, dan setiap klausul yang
   disebut berasal dari tabel pemetaan di bawah. Untuk sistem QHSE sifat ini lebih
   berharga daripada kemampuan menjawab bebas: ringkasan yang dipakai rapat
   manajemen harus dapat dipertanggungjawabkan sampai ke baris datanya.

   Bila kelak disambungkan ke model bahasa sungguhan, lapisan ini tetap dipakai
   sebagai penyedia fakta (retrieval) — model hanya merangkai kalimat dari fakta
   yang sudah terkunci di sini. */

window.KGAI = (function () {
  'use strict';

  const D = window.KG;

  /* Purwarupa ini berjalan pada tanggal tetap supaya seluruh perhitungan
     umur dan sisa masa berlaku selalu konsisten dengan data contohnya. */
  const HARI_INI = { d: 22, m: 8, y: 2026 };
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function tanggalId(o) { return String(o.d).padStart(2, '0') + ' ' + BULAN[o.m] + ' ' + o.y; }
  function tambahTahun(o, n) { return { d: o.d, m: o.m, y: o.y + n }; }

  /* Angka pada data ditulis dengan gaya Indonesia ('1.284.560', '0,42'). */
  function num(v) {
    if (typeof v === 'number') return v;
    const s = String(v == null ? '' : v).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Kalimat yang dirakit dari angka tidak dapat diterjemahkan oleh kamus i18n,
     karena bentuk akhirnya baru ada saat dihitung. Kalimat seperti itu ditulis
     dwibahasa di tempatnya. Label dan judul yang tetap tidak memakai ini —
     cukup lewat kamus, sama seperti modul lain. */
  function L(id, en) {
    return (window.KGI18N && window.KGI18N.lang === 'en') ? en : id;
  }

  /* ══════════════════════ 1 · Indeks pencarian ══════════════════════
     Seluruh isi sistem diratakan menjadi satu larik catatan. Dibangun sekali
     lalu disimpan, karena data purwarupa tidak berubah saat aplikasi berjalan. */

  let IDX = null;

  function rekam(o) {
    const teks = [o.judul].concat(o.teks || []).filter(Boolean).join(' · ');
    return {
      id: o.id || '',
      judul: o.judul,
      modul: o.modul,
      rute: o.rute,
      badge: o.badge || '',
      nada: o.nada || 'neutral',
      iso: !!o.iso,
      detail: o.detail || null,
      meta: (o.meta || []).filter(function (r) { return r && r[1] != null && r[1] !== ''; }),
      teks: teks,
      idLc: String(o.id || '').toLowerCase(),
      judulLc: o.judul.toLowerCase(),
      teksLc: teks.toLowerCase()
    };
  }

  function bangunIndeks() {
    const X = [];
    const L = D.lingkungan;

    D.insiden.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.ringkas, modul: 'Incident & Nearmiss', rute: 'incident',
        badge: r.jenis, nada: r.jenis === 'Accident' ? 'critical' : r.jenis === 'Incident' ? 'medium' : 'info',
        detail: 'insiden:' + r.id,
        teks: [r.kronologi, r.dampak, r.akar, r.lokasi, r.pelapor, r.status, r.keparahan, r.capa],
        meta: [['Lokasi', r.lokasi], ['Tanggal', r.tanggal + ' ' + r.waktu], ['Keparahan', r.keparahan],
               ['Status', r.status], ['CAPA', r.capa]]
      }));
    });

    D.bahaya.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.isi, modul: 'Laporan Bahaya K3L', rute: 'hazard',
        badge: r.kategori, nada: r.risiko === 'Tinggi' ? 'high' : r.risiko === 'Sedang' ? 'medium' : 'low',
        detail: 'bahaya:' + r.id,
        teks: [r.kategori, r.lokasi, r.pelapor, r.status, r.risiko],
        meta: [['Kategori', r.kategori], ['Lokasi', r.lokasi], ['Risiko', r.risiko], ['Status', r.status]]
      }));
    });

    D.observasi.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.catatan, modul: 'Observasi Perilaku', rute: 'bbs', badge: r.kategori,
        teks: [r.tindakan, r.area, r.observer, r.kategori],
        meta: [['Area', r.area], ['Pengamat', r.observer], ['Tanggal', r.tanggal],
               ['Aman / berisiko', r.aman + ' / ' + r.berisiko], ['Tindakan', r.tindakan]]
      }));
    });

    D.inspeksi.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.jenis, modul: 'Inspection', rute: 'inspection', badge: r.status,
        detail: 'inspeksi:' + r.id,
        teks: [r.area, r.petugas, r.status, r.jadwal],
        meta: [['Area', r.area], ['Petugas', r.petugas], ['Tanggal', r.tanggal],
               ['Butir', r.selesai + '/' + r.butir], ['Temuan', r.temuan], ['Jadwal', r.jadwal]]
      }));
    });

    D.checklistHarian.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.nama, modul: 'Safety Checklist', rute: 'checklist', badge: r.status,
        teks: [r.area, r.pj, r.frekuensi, r.shift, r.status],
        meta: [['Area', r.area], ['Frekuensi', r.frekuensi], ['Shift', r.shift],
               ['Penanggung jawab', r.pj], ['Butir', r.selesai + '/' + r.butir], ['Temuan', r.temuan]]
      }));
    });

    D.checklistP2H.forEach(function (r, i) {
      X.push(rekam({
        id: 'P2H-' + String(i + 1).padStart(2, '0'), judul: r.butir,
        modul: 'Safety Checklist', rute: 'checklist', badge: 'Butir P2H',
        nada: r.jawab === 'Tidak Sesuai' ? 'critical' : 'low',
        teks: ['P2H Forklift', r.jawab],
        meta: [['Butir', r.butir], ['Jawaban', r.jawab], ['Checklist', 'P2H Forklift harian']]
      }));
    });

    D.checklistAPAR.forEach(function (r, i) {
      X.push(rekam({
        id: 'APAR-' + String(i + 1).padStart(2, '0'), judul: r.butir,
        modul: 'Inspection', rute: 'inspection', badge: 'Butir APAR',
        nada: r.jawab === 'Tidak Sesuai' ? 'critical' : 'low',
        teks: ['Inspeksi APAR & Hydrant', r.jawab],
        meta: [['Butir', r.butir], ['Jawaban', r.jawab], ['Checklist', 'APAR & Hydrant']]
      }));
    });

    D.izin.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.judul, modul: 'Work Permit & JSEA', rute: 'permit', badge: 'Izin ' + r.jenis,
        nada: r.zona === 'Ekstrem' ? 'critical' : r.zona === 'Tinggi' ? 'high' : 'medium',
        detail: 'izin:' + r.id,
        teks: [r.jenis, r.pelaksana, r.vendor, r.pengawas, r.status, r.zona].concat(r.prasyarat || []),
        meta: [['Jenis', r.jenis], ['Pelaksana', r.pelaksana], ['Pengawas', r.pengawas],
               ['Mulai', r.mulai], ['Status', r.status],
               ['Risiko', r.risikoAwal + ' → ' + r.risikoSisa + ' (' + r.zona + ')']]
      }));
    });

    D.jsea.langkah.forEach(function (s) {
      X.push(rekam({
        id: D.jsea.permit + '/L' + s.no, judul: s.kerja, modul: 'Work Permit & JSEA', rute: 'permit',
        badge: 'Langkah JSEA ' + s.no,
        teks: [s.bahaya, D.jsea.judul].concat(s.kendali.map(function (k) { return k[0] + ': ' + k[1]; })),
        meta: [['Pekerjaan', D.jsea.judul], ['Bahaya', s.bahaya],
               ['Risiko awal', s.awal.k * s.awal.s], ['Risiko sisa', s.sisa.k * s.sisa.s],
               ['Pengendalian', s.kendali.map(function (k) { return k[0] + ' — ' + k[1]; }).join('; ')]]
      }));
    });

    D.risikoRegister.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.ancaman, modul: 'Manajemen Risiko', rute: 'risk', badge: r.proses,
        nada: r.L * r.S >= 15 ? 'critical' : r.L * r.S >= 10 ? 'high' : 'medium',
        teks: [r.proses, r.penyebab, r.dampak, r.mitigasi, r.opsi, r.pj, r.status],
        meta: [['Proses', r.proses], ['Penyebab', r.penyebab], ['Dampak', r.dampak],
               ['Skor awal', r.L * r.S], ['Skor sisa', r.sisaL * r.sisaS],
               ['Opsi', r.opsi], ['Mitigasi', r.mitigasi], ['Penanggung jawab', r.pj], ['Reviu', r.reviu]]
      }));
    });

    (D.risikoKonteks.internal || []).forEach(function (s, i) {
      X.push(rekam({ id: 'KTK-IN-' + (i + 1), judul: s, modul: 'Manajemen Risiko', rute: 'risk',
        badge: 'Konteks internal', meta: [['Jenis', 'Konteks internal organisasi']] }));
    });
    (D.risikoKonteks.eksternal || []).forEach(function (s, i) {
      X.push(rekam({ id: 'KTK-EX-' + (i + 1), judul: s, modul: 'Manajemen Risiko', rute: 'risk',
        badge: 'Konteks eksternal', meta: [['Jenis', 'Konteks eksternal organisasi']] }));
    });

    D.capa.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.judul, modul: 'CAPA', rute: 'capa', badge: r.status,
        nada: r.terlambat ? 'critical' : r.prioritas === 'Tinggi' ? 'high' : 'medium',
        detail: 'capa:' + r.id,
        teks: [r.sumberJenis, r.sumber, r.pj, r.status, r.prioritas],
        meta: [['Sumber', r.sumberJenis + ' ' + r.sumber], ['Penanggung jawab', r.pj],
               ['Terbit', r.terbit], ['Tenggat', r.tenggat], ['Umur', r.umur + ' hari'],
               ['Prioritas', r.prioritas], ['Status', r.status]]
      }));
    });

    D.audit.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.standar, modul: 'Audit', rute: 'audit', badge: r.status,
        detail: 'audit:' + r.id,
        teks: [r.lingkup, r.auditor, r.status],
        meta: [['Lingkup', r.lingkup], ['Auditor', r.auditor], ['Tanggal', r.tanggal],
               ['Temuan', r.temuan], ['Status', r.status]]
      }));
    });

    D.temuanAudit.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.isi, modul: 'Audit', rute: 'audit', badge: 'Temuan ' + r.kategori,
        nada: r.kategori === 'Major' ? 'critical' : r.kategori === 'Minor' ? 'high' : 'info',
        teks: [r.audit, r.klausul, r.kategori, r.pj, r.status],
        meta: [['Audit', r.audit], ['Klausul', r.klausul], ['Kategori', r.kategori],
               ['Penanggung jawab', r.pj], ['Tenggat', r.tenggat], ['Status', r.status]]
      }));
    });

    D.elemenSMK3.forEach(function (r) {
      X.push(rekam({
        id: 'SMK3-' + String(r.no).padStart(2, '0'), judul: r.nama, modul: 'Audit', rute: 'audit',
        badge: 'Elemen SMK3', iso: true,
        teks: ['SMK3 PP 50/2012 elemen ' + r.no],
        meta: [['Elemen', r.no + ' — ' + r.nama],
               ['Pemenuhan', r.penuhi + ' dari ' + r.kriteria + ' kriteria'],
               ['Acuan', 'PP 50/2012 Lampiran II']]
      }));
    });

    ['pppa', 'pppu', 'limbah', 'plb3'].forEach(function (k) {
      const dom = L[k]; if (!dom) return;
      (dom.param || []).forEach(function (p) {
        X.push(rekam({
          id: k.toUpperCase() + '/' + p.nama, judul: p.nama + ' — ' + p.nilai + ' ' + (p.satuan || ''),
          modul: 'Environment', rute: 'environment', badge: dom.judul.split(' — ')[0],
          nada: p.ok === false ? 'critical' : 'low',
          teks: [dom.judul, dom.sub, dom.acuan, 'baku mutu ' + p.ambang],
          meta: [['Domain', dom.judul], ['Nilai', p.nilai + ' ' + (p.satuan || '')],
                 ['Baku mutu', p.ambang], ['Status', p.ok === false ? 'Melewati ambang' : 'Memenuhi'],
                 ['Acuan', dom.acuan], ['Pengujian', dom.sub]]
        }));
      });
    });

    D.dokInternal.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.judul, modul: 'Dokumen Internal', rute: 'docint', iso: true,
        badge: r.jenis, nada: r.status === 'Kedaluwarsa' ? 'critical' : r.status === 'Dalam Revisi' ? 'medium' : 'low',
        teks: [r.jenis, r.pemilik, r.status, 'tingkat ' + r.level, 'revisi ' + r.rev],
        meta: [['Tingkat', 'L' + r.level + ' — ' + r.jenis], ['Revisi', r.rev],
               ['Terbit', r.terbit], ['Tinjau ulang', r.tinjau],
               ['Pemilik', r.pemilik], ['Status', r.status]]
      }));
    });

    D.dokEksternal.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.judul, modul: 'Dokumen Eksternal', rute: 'docext', iso: true,
        badge: r.jenis, nada: r.sisa < 0 ? 'critical' : r.sisa <= 30 ? 'high' : r.sisa <= 60 ? 'medium' : 'low',
        teks: [r.jenis, r.penerbit, r.nomor],
        meta: [['Jenis', r.jenis], ['Penerbit', r.penerbit], ['Nomor', r.nomor],
               ['Terbit', r.terbit], ['Berlaku sampai', r.berlaku],
               ['Sisa', r.sisa < 0 ? 'kedaluwarsa ' + Math.abs(r.sisa) + ' hari' : r.sisa + ' hari']]
      }));
    });

    D.pelatihan.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.nama, modul: 'Manajemen Pelatihan', rute: 'training', badge: r.jenis,
        nada: r.status === 'Belum Terlaksana' ? 'critical' : r.status === 'Terjadwal' ? 'medium' : 'low',
        teks: [r.jenis, r.target, r.penyelenggara, r.status],
        meta: [['Jenis', r.jenis], ['Sasaran', r.target], ['Penyelenggara', r.penyelenggara],
               ['Rencana', r.rencanaTgl + ' · ' + r.rencanaPeserta + ' peserta'],
               ['Aktual', r.aktualTgl ? r.aktualTgl + ' · ' + r.aktualPeserta + ' peserta' : 'belum terlaksana'],
               ['Status', r.status]]
      }));
    });

    D.sertifikasi.forEach(function (r) {
      X.push(rekam({
        id: r.nomor, judul: r.nama + ' — ' + r.pemegang, modul: 'Manajemen Pelatihan', rute: 'training',
        badge: 'Sertifikat personel',
        nada: r.sisa <= 30 ? 'critical' : r.sisa <= 60 ? 'high' : 'low',
        teks: [r.nama, r.pemegang, r.nomor],
        meta: [['Sertifikasi', r.nama], ['Pemegang', r.pemegang], ['Nomor', r.nomor],
               ['Berlaku sampai', r.berlaku], ['Sisa', r.sisa + ' hari']]
      }));
    });

    D.kegiatan.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.judul, modul: 'SHE Activity', rute: 'activity', badge: r.jenis,
        detail: 'kegiatan:' + r.id,
        teks: [r.jenis, r.lokasi],
        meta: [['Jenis', r.jenis], ['Tanggal', r.tanggal], ['Lokasi', r.lokasi],
               ['Peserta', r.peserta], ['Durasi', r.durasi + ' jam'],
               ['Jam-orang', (r.peserta * r.durasi).toFixed(1).replace('.', ',')]]
      }));
    });

    D.kpiLagging.concat(D.kpiLeading).forEach(function (r, i) {
      const lagging = i < D.kpiLagging.length;
      X.push(rekam({
        id: 'KPI-' + String(i + 1).padStart(2, '0'), judul: r.nama + ' — ' + r.nilai + ' ' + (r.satuan || ''),
        modul: 'SHE KPI & Analytics', rute: 'kpi', badge: lagging ? 'Lagging' : 'Leading',
        nada: r.arah === 'bad' ? 'high' : r.arah === 'good' ? 'low' : 'neutral',
        teks: [r.nama, r.note, r.delta],
        meta: [['Jenis', lagging ? 'Lagging — hasil yang sudah terjadi' : 'Leading — usaha yang sedang dilakukan'],
               ['Nilai', r.nilai + ' ' + (r.satuan || '')], ['Perubahan', r.delta], ['Cakupan', r.note]]
      }));
    });

    D.notifikasi.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.judul, modul: 'Notifikasi', rute: r.aksi || 'notif', badge: r.modul,
        nada: r.jenis === 'critical' ? 'critical' : r.jenis === 'high' ? 'high' : 'info',
        teks: [r.isi, r.modul, r.waktu],
        meta: [['Modul asal', r.modul], ['Isi', r.isi], ['Waktu', r.waktu],
               ['Dibaca', r.baca ? 'ya' : 'belum']]
      }));
    });

    D.aturanNotifikasi.forEach(function (r, i) {
      X.push(rekam({
        id: 'RULE-' + String(i + 1).padStart(2, '0'), judul: r.peristiwa, modul: 'Notifikasi', rute: 'notif',
        badge: 'Aturan pemberitahuan',
        teks: [r.kanal, r.penerima, r.segera],
        meta: [['Kanal', r.kanal], ['Penerima', r.penerima], ['Ketepatan waktu', r.segera]]
      }));
    });

    D.pabrikKinerja.forEach(function (r) {
      X.push(rekam({
        id: 'PLT-' + r.nama.toUpperCase(), judul: 'Kinerja QHSE Pabrik ' + r.nama,
        modul: 'Dashboard Eksekutif', rute: 'exec', badge: r.status,
        nada: r.status === 'Kritis' ? 'critical' : r.status === 'Perhatian' ? 'high' : 'low',
        teks: [r.nama, 'TRIR ' + r.trir, 'LTIFR ' + r.ltifr, r.status],
        meta: [['Pekerja', r.pekerja], ['TRIR', r.trir], ['LTIFR', r.ltifr],
               ['Manhours', r.manhours], ['Insiden', r.insiden], ['Laporan bahaya', r.bahaya],
               ['CAPA tepat waktu', r.capa], ['SMK3', r.smk3], ['Status', r.status]]
      }));
    });

    D.programStrategis.forEach(function (r, i) {
      X.push(rekam({
        id: 'PRG-' + String(i + 1).padStart(2, '0'), judul: r.nama, modul: 'Dashboard Eksekutif', rute: 'exec',
        badge: r.status,
        teks: [r.target, r.status, r.tenggat],
        meta: [['Sasaran', r.target], ['Kemajuan', r.capai + ' dari ' + r.dari],
               ['Tenggat', r.tenggat], ['Status', r.status]]
      }));
    });

    D.jsa.forEach(function (r) {
      const sisa = r.langkah.reduce(function (m, x) { return Math.max(m, x.sk * x.ss); }, 0);
      X.push(rekam({
        id: r.id, judul: r.pekerjaan, modul: 'Analisis JSA', rute: 'jsa', badge: r.jenis,
        nada: sisa >= 15 ? 'critical' : sisa >= 10 ? 'high' : sisa >= 5 ? 'medium' : 'low',
        detail: 'jsa:' + r.id,
        teks: [r.area, r.jenis, r.penyusun, r.peninjau, r.pengesah, r.status]
          .concat(r.apd || [])
          .concat(r.langkah.map(function (x) { return x.kerja + ' ' + x.bahaya; }))
          .concat(r.langkah.reduce(function (a, x) {
            return a.concat((x.kendali || []).map(function (k) { return k[0] + ': ' + k[1]; }));
          }, [])),
        meta: [['Area', r.area], ['Jenis pekerjaan', r.jenis], ['Langkah', r.langkah.length],
               ['Penyusun', r.penyusun], ['Pengesah', r.pengesah], ['Status', r.status],
               ['Risiko sisa tertinggi', sisa], ['Tinjau berikutnya', r.tinjau], ['Revisi', r.rev]]
      }));
      r.langkah.forEach(function (x) {
        X.push(rekam({
          id: r.id + '/L' + x.no, judul: x.kerja, modul: 'Analisis JSA', rute: 'jsa',
          badge: 'Langkah ' + x.no,
          nada: x.sk * x.ss >= 15 ? 'critical' : x.sk * x.ss >= 10 ? 'high' : 'medium',
          detail: 'jsa:' + r.id,
          teks: [x.bahaya, r.pekerjaan].concat((x.kendali || []).map(function (k) { return k[0] + ': ' + k[1]; })),
          meta: [['Pekerjaan', r.pekerjaan], ['Bahaya', x.bahaya],
                 ['Risiko awal', x.k * x.s], ['Risiko sisa', x.sk * x.ss],
                 ['Pengendalian', (x.kendali || []).map(function (k) { return k[0] + ' — ' + k[1]; }).join('; ')]]
        }));
      });
    });

    D.hiradc.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.bahaya, modul: 'HIRADC K3', rute: 'hiradc', badge: r.kategori,
        nada: r.sk * r.sp >= 15 ? 'critical' : r.sk * r.sp >= 10 ? 'high' : r.sk * r.sp >= 5 ? 'medium' : 'low',
        detail: 'hiradc:' + r.id,
        teks: [r.proses, r.aktivitas, r.risiko, r.korban, r.kendaliAda, r.kendaliTambah,
               r.hierarki, r.pj, r.status, r.rutin, r.kategori],
        meta: [['Proses', r.proses], ['Aktivitas', r.aktivitas], ['Sifat', r.rutin],
               ['Kategori bahaya', r.kategori], ['Risiko', r.risiko], ['Terpapar', r.korban],
               ['Skor awal', r.k * r.p], ['Skor sisa', r.sk * r.sp],
               ['Pengendalian ada', r.kendaliAda], ['Pengendalian tambahan', r.kendaliTambah],
               ['Hierarki', r.hierarki], ['Penanggung jawab', r.pj], ['Target', r.target], ['Status', r.status]]
      }));
    });

    D.induksi.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: 'Induksi K3 — ' + r.nama, modul: 'Induksi K3', rute: 'induksi', badge: r.jenis,
        nada: r.status === 'Kedaluwarsa' || r.status === 'Tidak Lulus' ? 'critical'
              : r.status === 'Segera Berakhir' ? 'high' : 'low',
        detail: 'induksi:' + r.id,
        teks: [r.nama, r.jenis, r.asal, r.pemandu, r.status],
        meta: [['Nama', r.nama], ['Jenis', r.jenis], ['Asal', r.asal], ['Tanggal', r.tanggal],
               ['Pemandu', r.pemandu], ['Nilai', r.nilai], ['Berlaku sampai', r.berlaku],
               ['Status', r.status]]
      }));
    });

    D.induksiMateri.forEach(function (r) {
      X.push(rekam({
        id: 'IND-M' + String(r.no).padStart(2, '0'), judul: r.topik, modul: 'Induksi K3', rute: 'induksi',
        badge: 'Materi induksi',
        teks: [r.inti, 'materi induksi K3'],
        meta: [['Topik', r.topik], ['Durasi', r.menit + ' menit'], ['Inti bahasan', r.inti]]
      }));
    });

    D.regulasi.forEach(function (r) {
      X.push(rekam({
        id: r.id, judul: r.judul, modul: 'Regulasi K3', rute: 'regulasi', badge: r.bidang, iso: true,
        nada: r.status === 'Tidak Terpenuhi' ? 'critical'
              : r.status === 'Terpenuhi Sebagian' ? 'high' : 'low',
        detail: 'regulasi:' + r.id,
        teks: [r.nomor, r.penerbit, r.bidang, r.pasal, r.penerapan, r.bukti, r.pj, r.status],
        meta: [['Nomor', r.nomor], ['Penerbit', r.penerbit], ['Bidang', r.bidang],
               ['Pasal terkait', r.pasal], ['Penerapan di Khong Guan', r.penerapan],
               ['Bukti', r.bukti], ['Penanggung jawab', r.pj], ['Evaluasi', r.evaluasi],
               ['Status pemenuhan', r.status]]
      }));
    });

    D.observasiAPD.forEach(function (r) {
      const p = Math.round(r.patuh / r.diamati * 100);
      X.push(rekam({
        id: r.id, judul: 'Observasi APD — ' + r.area, modul: 'Observasi Perilaku', rute: 'bbs',
        badge: p + '% patuh', nada: p === 100 ? 'low' : p >= 90 ? 'medium' : 'critical',
        detail: 'apd:' + r.id,
        teks: [r.area, r.pengamat, r.catatan, 'kepatuhan alat pelindung diri']
          .concat((r.rincian || []).map(function (x) { return x[0]; })),
        meta: [['Area', r.area], ['Tanggal', r.tanggal], ['Pengamat', r.pengamat],
               ['Pekerja diamati', r.diamati], ['Memakai dengan benar', r.patuh],
               ['Kepatuhan', p + '%'], ['Catatan', r.catatan]]
      }));
    });

    D.pengguna.forEach(function (r) {
      X.push(rekam({
        id: r.email, judul: r.nama, modul: 'User Management', rute: 'users',
        badge: (D.peran[r.peran] || {}).nama || r.peran,
        nada: r.status === 'Aktif' ? 'low' : r.status === 'Menunggu' ? 'medium' : 'neutral',
        teks: [r.email, r.lokasi, r.status, (D.peran[r.peran] || {}).nama],
        meta: [['Surel', r.email], ['Peran', (D.peran[r.peran] || {}).nama || r.peran],
               ['Lokasi', r.lokasi], ['Status', r.status], ['Masuk terakhir', r.masuk]]
      }));
    });

    D.hakAkses.forEach(function (r, i) {
      X.push(rekam({
        id: 'ACL-' + String(i + 1).padStart(2, '0'), judul: 'Hak akses — ' + r.modul,
        modul: 'User Management', rute: 'users', badge: 'Matriks akses',
        teks: [r.modul, r.operator, r.qhse, r.manajemen, r.admin],
        meta: [['Modul', r.modul], ['Operator', r.operator], ['QHSE', r.qhse],
               ['Manajemen', r.manajemen], ['Administrator', r.admin]]
      }));
    });

    return X;
  }

  function indeks() { if (!IDX) IDX = bangunIndeks(); return IDX; }

  /* ══════════════════════ 2 · Pencarian ══════════════════════ */

  /* Kata sambung tidak pernah menyempitkan hasil, hanya membuatnya berisik. */
  const HENTI = {
    di: 1, ke: 1, ya: 1, dan: 1, atau: 1, yang: 1, untuk: 1, pada: 1, dari: 1, dengan: 1,
    ini: 1, itu: 1, ada: 1, adalah: 1, akan: 1, juga: 1, saja: 1, oleh: 1, agar: 1,
    apa: 1, apakah: 1, bagaimana: 1, berapa: 1, kapan: 1, siapa: 1, mana: 1, tolong: 1,
    saya: 1, kami: 1, kita: 1, bisa: 1, dapat: 1, mohon: 1, buatkan: 1, tampilkan: 1,
    the: 1, and: 1, for: 1, from: 1, with: 1, what: 1, show: 1, please: 1
  };

  function pecah(q) {
    return String(q == null ? '' : q).toLowerCase()
      .split(/[^0-9a-zÀ-ɏ]+/)
      .filter(function (t) { return t.length >= 2 && !HENTI[t]; });
  }

  /* Satu lintasan supaya penanda tidak pernah menyorot penanda yang baru disisipkan. */
  function sorot(teks, terms) {
    const aman = esc(teks);
    if (!terms.length) return aman;
    const pola = terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
    return aman.replace(new RegExp('(' + pola + ')', 'gi'), '<mark>$1</mark>');
  }

  function cuplikan(teks, terms) {
    const lc = teks.toLowerCase();
    let pos = -1;
    terms.forEach(function (t) { const i = lc.indexOf(t); if (i >= 0 && (pos < 0 || i < pos)) pos = i; });
    if (pos < 0) pos = 0;
    let a = Math.max(0, pos - 60);
    const b = Math.min(teks.length, pos + 170);
    if (a > 0) { const sp = teks.indexOf(' ', a); if (sp > 0 && sp < a + 24) a = sp + 1; }
    return (a > 0 ? '… ' : '') + sorot(teks.slice(a, b), terms) + (b < teks.length ? ' …' : '');
  }

  /* lingkup: 'iso' hanya dokumen sistem & kepatuhan, 'semua' seluruh isi sistem. */
  function cari(q, lingkup) {
    const terms = pecah(q);
    const utuh = String(q == null ? '' : q).trim().toLowerCase();
    if (!terms.length) return { terms: [], total: 0, grup: [], kueri: q };

    const kolam = indeks().filter(function (r) { return lingkup === 'iso' ? r.iso : true; });
    const hits = [];

    kolam.forEach(function (r) {
      let skor = 0, lengkap = true;
      terms.forEach(function (tk) {
        const diJudul = r.judulLc.indexOf(tk) >= 0;
        const diId = r.idLc.indexOf(tk) >= 0;
        const diTeks = r.teksLc.indexOf(tk) >= 0;
        if (!diTeks && !diId) lengkap = false;
        if (diJudul) skor += 12; else if (diId) skor += 8; else if (diTeks) skor += 3;
      });
      if (!lengkap) return;
      if (r.idLc === utuh) skor += 200;
      if (r.judulLc.indexOf(utuh) >= 0) skor += 25;
      hits.push({ rec: r, skor: skor, cuplik: cuplikan(r.teks, terms) });
    });

    hits.sort(function (a, b) { return b.skor - a.skor || a.rec.id.localeCompare(b.rec.id); });

    const urut = [], peta = {};
    hits.forEach(function (h) {
      if (!peta[h.rec.modul]) { peta[h.rec.modul] = { modul: h.rec.modul, rute: h.rec.rute, hits: [] }; urut.push(peta[h.rec.modul]); }
      peta[h.rec.modul].hits.push(h);
    });

    return { terms: terms, total: hits.length, grup: urut, kueri: q, lingkup: lingkup || 'semua' };
  }

  /* ══════════════════════ 3 · Referensi dokumen ISO baru ══════════════════════ */

  const SERI = {
    'Kebijakan':       { kode: 'KGK', level: 1, pemilik: 'Plant Manager', retensi: 'Permanen' },
    'Manual':          { kode: 'KGM', level: 1, pemilik: 'Management Representative', retensi: 'Permanen' },
    'Prosedur':        { kode: 'KGP', level: 2, pemilik: 'QHSE Supervisor', retensi: '3 tahun setelah digantikan' },
    'Instruksi Kerja': { kode: 'KGI', level: 3, pemilik: 'Supervisor Area terkait', retensi: '3 tahun setelah digantikan' },
    'Formulir':        { kode: 'KGF', level: 4, pemilik: 'QHSE Supervisor', retensi: '5 tahun sejak pengisian' }
  };

  /* Pemetaan kata kunci ke klausul standar. Tabel ini adalah satu-satunya sumber
     klausul yang boleh disebut asisten — tidak ada klausul yang disimpulkan sendiri. */
  const KLAUSUL = [
    [/insiden|kecelakaan|accident|nearmiss|investigasi|cedera|kronologi/, [
      ['ISO 45001:2018', '10.2', 'Insiden, ketidaksesuaian dan tindakan korektif'],
      ['ISO 45001:2018', '9.1.1', 'Pemantauan, pengukuran, analisis dan evaluasi kinerja'],
      ['SMK3 PP 50/2012', 'Elemen 8', 'Pelaporan dan Perbaikan Kekurangan']
    ]],
    [/risiko|bahaya|hira|hiradc|jsea|identifikasi|penilaian/, [
      ['ISO 45001:2018', '6.1.2', 'Identifikasi bahaya dan penilaian risiko serta peluang'],
      ['ISO 45001:2018', '8.1.2', 'Menghilangkan bahaya dan mengurangi risiko K3'],
      ['ISO 14001:2015', '6.1.2', 'Aspek lingkungan'],
      ['SMK3 PP 50/2012', 'Elemen 6', 'Keamanan Bekerja Berdasarkan SMK3']
    ]],
    [/darurat|evakuasi|kebakaran|tanggap|apar|hydrant|bencana/, [
      ['ISO 45001:2018', '8.2', 'Kesiapsiagaan dan tanggap darurat'],
      ['ISO 14001:2015', '8.2', 'Kesiagaan dan tanggap darurat'],
      ['SMK3 PP 50/2012', 'Elemen 6', 'Keamanan Bekerja Berdasarkan SMK3']
    ]],
    [/limbah|b3|lingkungan|emisi|ipal|air|udara|cemar|sampah/, [
      ['ISO 14001:2015', '6.1.2', 'Aspek lingkungan'],
      ['ISO 14001:2015', '8.1', 'Perencanaan dan pengendalian operasi'],
      ['ISO 14001:2015', '9.1.2', 'Evaluasi penaatan'],
      ['SMK3 PP 50/2012', 'Elemen 9', 'Pengelolaan Material dan Perpindahannya']
    ]],
    [/izin kerja|work permit|panas|ruang terbatas|ketinggian|loto|lockout|penggalian|pengangkatan/, [
      ['ISO 45001:2018', '8.1.2', 'Menghilangkan bahaya dan mengurangi risiko K3'],
      ['ISO 45001:2018', '8.1.4', 'Pengadaan, kontraktor dan alih daya'],
      ['SMK3 PP 50/2012', 'Elemen 6', 'Keamanan Bekerja Berdasarkan SMK3']
    ]],
    [/pelatihan|kompetensi|induksi|training|keterampilan|sertifikasi personel/, [
      ['ISO 45001:2018', '7.2', 'Kompetensi'],
      ['ISO 45001:2018', '7.3', 'Kepedulian'],
      ['SMK3 PP 50/2012', 'Elemen 12', 'Pengembangan Keterampilan dan Kemampuan']
    ]],
    [/kontraktor|vendor|pengadaan|pemasok|alih daya|outsourc/, [
      ['ISO 45001:2018', '8.1.4', 'Pengadaan, kontraktor dan alih daya'],
      ['SMK3 PP 50/2012', 'Elemen 5', 'Pembelian dan Pengendalian Produk']
    ]],
    [/audit|ketidaksesuaian|temuan/, [
      ['ISO 45001:2018', '9.2', 'Audit internal'],
      ['ISO 45001:2018', '10.2', 'Insiden, ketidaksesuaian dan tindakan korektif'],
      ['SMK3 PP 50/2012', 'Elemen 11', 'Pemeriksaan SMK3']
    ]],
    [/tinjauan manajemen|rapat manajemen|management review/, [
      ['ISO 45001:2018', '9.3', 'Tinjauan manajemen'],
      ['ISO 14001:2015', '9.3', 'Tinjauan manajemen'],
      ['SMK3 PP 50/2012', 'Elemen 1', 'Pembangunan dan Pemeliharaan Komitmen']
    ]],
    [/dokumen|rekaman|formulir|arsip|distribusi|revisi/, [
      ['ISO 45001:2018', '7.5', 'Informasi terdokumentasi'],
      ['ISO 9001:2015', '7.5', 'Informasi terdokumentasi'],
      ['SMK3 PP 50/2012', 'Elemen 4', 'Pengendalian Dokumen']
    ]],
    [/komunikasi|konsultasi|partisipasi|p2k3|serikat|safety talk/, [
      ['ISO 45001:2018', '5.4', 'Konsultasi dan partisipasi pekerja'],
      ['ISO 45001:2018', '7.4', 'Komunikasi'],
      ['SMK3 PP 50/2012', 'Elemen 1', 'Pembangunan dan Pemeliharaan Komitmen']
    ]],
    [/apd|alat pelindung|helm|sepatu|masker|sarung tangan/, [
      ['ISO 45001:2018', '8.1.2', 'Menghilangkan bahaya dan mengurangi risiko K3'],
      ['SMK3 PP 50/2012', 'Elemen 6', 'Keamanan Bekerja Berdasarkan SMK3']
    ]],
    [/pemantauan|pengukuran|kpi|indikator|statistik|analisis data/, [
      ['ISO 45001:2018', '9.1', 'Pemantauan, pengukuran, analisis dan evaluasi kinerja'],
      ['SMK3 PP 50/2012', 'Elemen 7', 'Standar Pemantauan'],
      ['SMK3 PP 50/2012', 'Elemen 10', 'Pengumpulan dan Penggunaan Data']
    ]],
    [/mutu|produk|pangan|haccp|higiene|sanitasi|kontaminasi|benda asing/, [
      ['ISO 9001:2015', '8.5.1', 'Pengendalian produksi dan penyediaan jasa'],
      ['ISO 9001:2015', '8.7', 'Pengendalian ketidaksesuaian keluaran'],
      ['SMK3 PP 50/2012', 'Elemen 3', 'Peninjauan Perancangan dan Kontrak']
    ]],
    [/perubahan|modifikasi|mesin baru|relokasi/, [
      ['ISO 45001:2018', '8.1.3', 'Manajemen perubahan'],
      ['ISO 14001:2015', '8.1', 'Perencanaan dan pengendalian operasi']
    ]],
    [/peraturan|perundang|kepatuhan|penaatan|regulasi|perizinan/, [
      ['ISO 45001:2018', '6.1.3', 'Penentuan peraturan perundangan dan persyaratan lain'],
      ['ISO 14001:2015', '6.1.3', 'Kewajiban penaatan'],
      ['SMK3 PP 50/2012', 'Elemen 2', 'Strategi Pendokumentasian']
    ]],
    [/kebijakan|komitmen|sasaran|program k3/, [
      ['ISO 45001:2018', '5.2', 'Kebijakan K3'],
      ['ISO 14001:2015', '5.2', 'Kebijakan lingkungan'],
      ['ISO 45001:2018', '6.2', 'Sasaran K3 dan perencanaan pencapaiannya']
    ]],
    /* Pekerjaan dan peralatan operasional: sebuah instruksi kerja pada dasarnya
       adalah pengendalian operasi, jadi kata kunci mesin dan proses ikut dipetakan. */
    [/oven|boiler|mesin|peralatan|pengoperasian|operasi|pemeliharaan|perawatan|kondensat|uap|tekanan|forklift|pengangkatan|conveyor|panel|instruksi kerja/, [
      ['ISO 45001:2018', '8.1.1', 'Perencanaan dan pengendalian operasi'],
      ['ISO 45001:2018', '8.1.2', 'Menghilangkan bahaya dan mengurangi risiko K3'],
      ['ISO 45001:2018', '6.1.2', 'Identifikasi bahaya dan penilaian risiko serta peluang'],
      ['SMK3 PP 50/2012', 'Elemen 6', 'Keamanan Bekerja Berdasarkan SMK3']
    ]]
  ];

  /* Kerangka isi per tingkat dokumen. */
  const KERANGKA = {
    'Kebijakan': [
      ['Pernyataan kebijakan', 'Satu halaman, kalimat aktif, ditandatangani pimpinan tertinggi lokasi.'],
      ['Ruang lingkup penerapan', 'Lokasi, proses, dan pihak yang terikat — termasuk kontraktor dan tamu.'],
      ['Komitmen manajemen', 'Penyediaan sumber daya, pemenuhan peraturan, perbaikan berkelanjutan.'],
      ['Kewajiban dan hak pekerja', 'Termasuk hak menghentikan pekerjaan yang tidak aman.'],
      ['Kerangka sasaran', 'Bagaimana kebijakan diterjemahkan menjadi sasaran terukur.'],
      ['Komunikasi dan ketersediaan', 'Cara kebijakan disampaikan ke pekerja dan pihak berkepentingan.'],
      ['Peninjauan', 'Ditinjau minimal setahun sekali atau saat ada perubahan besar.'],
      ['Pengesahan', 'Nama, jabatan, tanda tangan, tanggal berlaku.']
    ],
    'Manual': [
      ['Profil organisasi dan konteks', 'Isu internal dan eksternal, pihak berkepentingan dan kebutuhannya.'],
      ['Ruang lingkup sistem manajemen', 'Batas penerapan dan pengecualian beserta pembenarannya.'],
      ['Acuan normatif', 'Standar dan peraturan yang diacu.'],
      ['Istilah dan definisi', 'Hanya istilah yang dipakai berbeda dari arti umumnya.'],
      ['Kepemimpinan dan kebijakan', 'Peran, tanggung jawab, wewenang, dan kebijakan yang berlaku.'],
      ['Perencanaan', 'Risiko dan peluang, sasaran, dan rencana pencapaian.'],
      ['Dukungan', 'Sumber daya, kompetensi, kepedulian, komunikasi, informasi terdokumentasi.'],
      ['Operasi', 'Pengendalian operasional dan kesiapsiagaan tanggap darurat.'],
      ['Evaluasi kinerja', 'Pemantauan, audit internal, tinjauan manajemen.'],
      ['Peningkatan', 'Ketidaksesuaian, tindakan korektif, peningkatan berkelanjutan.'],
      ['Matriks korelasi klausul', 'Peta klausul standar terhadap prosedur yang menjawabnya.']
    ],
    'Prosedur': [
      ['1. Tujuan', 'Satu kalimat: hasil apa yang dijamin oleh prosedur ini.'],
      ['2. Ruang lingkup', 'Proses, area, dan pengecualian yang jelas batasnya.'],
      ['3. Acuan normatif', 'Klausul standar dan peraturan yang mendasari.'],
      ['4. Definisi', 'Istilah teknis dan singkatan yang dipakai di dalam prosedur.'],
      ['5. Tanggung jawab dan wewenang', 'Tabel peran — siapa mengerjakan, siapa memverifikasi, siapa mengesahkan.'],
      ['6. Rincian prosedur', 'Urutan langkah dengan pelaku, masukan, keluaran, dan tenggat setiap langkah.'],
      ['7. Bagan alir', 'Diagram satu halaman yang sejalan dengan bagian 6.'],
      ['8. Rekaman', 'Formulir yang dihasilkan, siapa menyimpan, dan berapa lama.'],
      ['9. Lampiran', 'Formulir, tabel bantu, dan contoh pengisian.'],
      ['10. Riwayat revisi', 'Nomor revisi, tanggal, ringkasan perubahan, pengesah.']
    ],
    'Instruksi Kerja': [
      ['1. Tujuan dan lingkup', 'Pekerjaan spesifik yang diatur, di mesin atau area mana.'],
      ['2. Kualifikasi pelaksana', 'Pelatihan atau sertifikat yang wajib dimiliki sebelum mengerjakan.'],
      ['3. Alat dan bahan', 'Daftar alat kerja, alat ukur, dan bahan yang dipakai.'],
      ['4. APD wajib', 'Ditulis eksplisit per langkah, bukan sebagai daftar umum.'],
      ['5. Bahaya dan pengendalian', 'Diambil dari JSEA atau register risiko yang relevan.'],
      ['6. Langkah kerja', 'Urutan bernomor, kalimat perintah, satu tindakan per baris.'],
      ['7. Kriteria hasil', 'Bagaimana pelaksana tahu langkahnya sudah benar.'],
      ['8. Keadaan tidak normal', 'Apa yang dihentikan, siapa dihubungi, dan batas kewenangannya.'],
      ['9. Rekaman', 'Checklist atau logsheet yang harus diisi setelah pekerjaan.']
    ],
    'Formulir': [
      ['Kepala formulir', 'Nomor dokumen, revisi, tanggal berlaku, dan logo — pada setiap halaman.'],
      ['Identitas pengisian', 'Tanggal, lokasi, shift, nama pengisi, dan nomor rekaman.'],
      ['Isian utama', 'Kolom data yang benar-benar dipakai; hindari kolom yang tidak pernah dibaca.'],
      ['Kolom verifikasi', 'Diisi oleh pihak yang berbeda dari pengisi — tidak boleh verifikasi sendiri.'],
      ['Tindak lanjut', 'Ruang untuk nomor CAPA bila ditemukan ketidaksesuaian.'],
      ['Tanda tangan', 'Pengisi, pemeriksa, dan pengesah beserta tanggalnya.'],
      ['Catatan retensi', 'Lama simpan dan tempat penyimpanan rekaman.']
    ]
  };

  function nomorBerikut(kode) {
    let maks = 0;
    D.dokInternal.forEach(function (d) {
      const m = String(d.id).match(new RegExp('^' + kode + '-(\\d+)$'));
      if (m) maks = Math.max(maks, parseInt(m[1], 10));
    });
    return kode + '-' + String(maks + 1).padStart(2, '0');
  }

  function klausulUntuk(topik, jenis) {
    const t = (topik + ' ' + jenis).toLowerCase();
    const out = [], lihat = {};
    KLAUSUL.forEach(function (aturan) {
      if (!aturan[0].test(t)) return;
      aturan[1].forEach(function (k) {
        const key = k[0] + k[1];
        if (lihat[key]) return;
        lihat[key] = 1; out.push({ standar: k[0], klausul: k[1], judul: k[2] });
      });
    });
    /* Dua klausul ini berlaku untuk dokumen sistem apa pun, jadi selalu disertakan. */
    [['ISO 45001:2018', '7.5', 'Informasi terdokumentasi'],
     ['SMK3 PP 50/2012', 'Elemen 4', 'Pengendalian Dokumen']].forEach(function (k) {
      const key = k[0] + k[1];
      if (lihat[key]) return;
      lihat[key] = 1; out.push({ standar: k[0], klausul: k[1], judul: k[2] });
    });
    return out;
  }

  /* Catatan di sistem yang membenarkan penerbitan dokumen ini. Diurutkan menurut
     banyaknya kata topik yang cocok, supaya catatan paling relevan muncul lebih dulu. */
  function pemicuUntuk(topik) {
    const terms = pecah(topik);
    if (!terms.length) return [];
    const modulPemicu = { 'Incident & Nearmiss': 1, 'Audit': 1, 'CAPA': 1, 'Manajemen Risiko': 1, 'Laporan Bahaya K3L': 1 };
    return indeks().filter(function (r) {
      /* Konteks organisasi bukan pemicu penerbitan dokumen, jadi tidak diikutkan. */
      return modulPemicu[r.modul] && r.id.indexOf('KTK-') !== 0;
    }).map(function (r) {
      let cocok = 0;
      terms.forEach(function (tk) {
        if (r.judulLc.indexOf(tk) >= 0) cocok += 2; else if (r.teksLc.indexOf(tk) >= 0) cocok += 1;
      });
      return { rec: r, cocok: cocok };
    }).filter(function (x) { return x.cocok > 0; })
      .sort(function (a, b) { return b.cocok - a.cocok; })
      .slice(0, 6)
      .map(function (x) {
        return { id: x.rec.id, judul: x.rec.judul, modul: x.rec.modul, rute: x.rec.rute, detail: x.rec.detail };
      });
  }

  function acuanInternal(topik, kecuali) {
    const terms = pecah(topik);
    return D.dokInternal.filter(function (d) {
      if (d.id === kecuali) return false;
      const t = (d.judul + ' ' + d.jenis).toLowerCase();
      return terms.some(function (tk) { return t.indexOf(tk) >= 0; });
    }).slice(0, 5);
  }

  function acuanEksternal(topik) {
    const terms = pecah(topik);
    return D.dokEksternal.filter(function (d) {
      const t = (d.judul + ' ' + d.jenis + ' ' + d.penerbit).toLowerCase();
      return terms.some(function (tk) { return t.indexOf(tk) >= 0; });
    }).slice(0, 5);
  }

  function referensi(jenis, topik) {
    const s = SERI[jenis] || SERI['Prosedur'];
    const nomor = nomorBerikut(s.kode);
    const judul = (topik || '').trim();
    const berlaku = tanggalId(HARI_INI);
    const tinjau = tanggalId(tambahTahun(HARI_INI, 1));

    return {
      jenis: jenis,
      topik: judul,
      nomor: nomor,
      judulUsulan: (jenis === 'Instruksi Kerja' ? 'IK ' : jenis === 'Formulir' ? 'Formulir ' :
                    jenis === 'Prosedur' ? 'Prosedur ' : jenis === 'Kebijakan' ? 'Kebijakan ' : 'Manual ') +
                   (judul || '(isi topik dokumen)'),
      level: s.level,
      rev: 0,
      pemilik: s.pemilik,
      terbit: berlaku,
      tinjau: tinjau,
      retensi: s.retensi,
      klausul: klausulUntuk(judul, jenis),
      kerangka: KERANGKA[jenis] || KERANGKA['Prosedur'],
      acuanInternal: acuanInternal(judul, nomor),
      acuanEksternal: acuanEksternal(judul),
      pemicu: pemicuUntuk(judul),
      pengesah: s.level === 1 ? 'Plant Manager' : s.level === 2 ? 'Management Representative' : 'QHSE Supervisor',
      distribusi: s.level <= 2
        ? 'Seluruh kepala bagian, papan dokumen area, dan salinan terkendali di ruang QHSE'
        : 'Area pelaksana terkait dan papan dokumen mesin/area'
    };
  }

  /* ══════════════════════ 4 · Ringkasan eksekutif ══════════════════════
     Setiap bagian menghitung ulang dari data, bukan mengambil kalimat jadi.
     Judul, label ubin, dan kepala tabel dibiarkan sebagai teks tetap supaya kamus
     i18n dapat menerjemahkannya; hanya kalimat yang dirakit dari angka yang
     ditulis dwibahasa dengan L(). */

  const TOPIK = [
    ['insiden', /insiden|kecelakaan|accident|nearmiss|cedera|lti|incident|injury/],
    ['capa', /capa|tindakan|korektif|perbaikan|tenggat|terlambat|corrective|overdue/],
    ['kepatuhan', /kepatuhan|dokumen|iso|sertifikat|izin|compliance|kedaluwarsa|smk3|legal|document|certificate|permit|expire/],
    ['risiko', /risiko|bahaya|hira|register|zona|ekstrem|risk|hazard|extreme/],
    ['lingkungan', /lingkungan|limbah|ipal|emisi|b3|air|udara|baku mutu|environment|waste|emission|effluent/],
    ['pelatihan', /pelatihan|kompetensi|sertifikasi|training|induksi|competence/],
    ['audit', /audit|temuan|ketidaksesuaian|major|minor|finding|nonconformity/],
    ['kpi', /kpi|trir|ltifr|indikator|lagging|leading|kinerja angka|indicator/],
    ['pabrik', /pabrik|antarpabrik|antar pabrik|perbandingan|grup|cibitung|bekasi|semarang|medan|plant|compare|group/]
  ];

  const SEMUA_TOPIK = ['insiden', 'capa', 'kepatuhan', 'risiko', 'lingkungan', 'pelatihan', 'audit', 'kpi', 'pabrik'];

  function bagianInsiden() {
    const I = D.insiden;
    const jenis = {}; I.forEach(function (r) { jenis[r.jenis] = (jenis[r.jenis] || 0) + 1; });
    const belum = I.filter(function (r) { return r.status !== 'Selesai'; });
    const telat = I.filter(function (r) { return r.terlambat; });
    const berat = I.filter(function (r) { return r.keparahan === 'Serius' || r.keparahan === 'Mayor' || r.keparahan === 'Katastropik'; });
    const tren = D.trenInsiden;
    const akhir = tren[tren.length - 1].v, awal = tren[0].v;

    return {
      judul: 'Insiden dan kejadian nyaris celaka',
      rute: 'incident',
      angka: [
        { label: 'Insiden tercatat', nilai: I.length, note: D.periode },
        { label: 'Belum selesai', nilai: belum.length, nada: belum.length ? 'high' : 'low',
          note: L('status bukan Selesai', 'status other than Completed') },
        { label: 'Keparahan serius ke atas', nilai: berat.length, nada: berat.length ? 'critical' : 'low',
          note: L('perlu investigasi penuh', 'full investigation required') }
      ],
      poin: [
        L('Komposisi kejadian: ', 'Composition of events: ') +
          Object.keys(jenis).map(function (k) { return jenis[k] + ' ' + k; }).join(', ') + '.',
        belum.length
          ? L(belum.length + ' kejadian belum berstatus Selesai' + (telat.length ? ', ' + telat.length + ' di antaranya sudah lewat tenggat penanganan' : '') + '.',
              belum.length + ' events are not yet Completed' + (telat.length ? ', ' + telat.length + ' of them already past the handling deadline' : '') + '.')
          : L('Seluruh kejadian bulan ini sudah ditutup.', 'Every event this month has been closed.'),
        berat.length
          ? L('Kejadian terberat: ' + berat[0].id + ' — ' + berat[0].ringkas + ' (' + berat[0].lokasi + '). Akar masalah tercatat: ' + berat[0].akar,
              'Most severe event: ' + berat[0].id + ' — ' + berat[0].ringkas + ' (' + berat[0].lokasi + '). Recorded root cause: ' + berat[0].akar)
          : L('Tidak ada kejadian berkeparahan serius ke atas bulan ini.', 'No event of Serious severity or above this month.'),
        L('Tren dua belas bulan bergerak dari ' + awal + ' ke ' + akhir + ' kejadian per bulan. ' +
          'Angka ini harus dibaca bersama jumlah laporan bahaya — insiden turun sementara laporan bahaya ikut turun biasanya berarti pelaporan yang melemah, bukan pabrik yang membaik.',
          'The twelve-month trend moves from ' + awal + ' to ' + akhir + ' events per month. ' +
          'Read it alongside the hazard report count — incidents down while hazard reports are also down usually means reporting is weakening, not that the plant is improving.')
      ],
      tabel: {
        head: ['Nomor', 'Kejadian', 'Keparahan', 'Status'],
        rows: I.map(function (r) { return [r.id, r.ringkas, r.keparahan, r.status]; })
      }
    };
  }

  function bagianCapa() {
    const C = D.capa;
    const telat = C.filter(function (r) { return r.terlambat; });
    const selesai = C.filter(function (r) { return r.status === 'Selesai'; });
    const tinggi = C.filter(function (r) { return r.prioritas === 'Tinggi' && r.status !== 'Selesai'; });
    const tua = C.slice().sort(function (a, b) { return b.umur - a.umur; })[0];
    const persen = Math.round(selesai.length / C.length * 100);
    const sumber = {}; C.forEach(function (r) { sumber[r.sumberJenis] = (sumber[r.sumberJenis] || 0) + 1; });
    const kpiCapa = D.kpiLeading.filter(function (k) { return /CAPA/.test(k.nama); })
      .map(function (k) { return k.nilai + k.satuan; })[0];

    return {
      judul: 'Tindakan korektif dan pencegahan (CAPA)',
      rute: 'capa',
      angka: [
        { label: 'CAPA aktif', nilai: C.length - selesai.length,
          note: L('dari ' + C.length + ' seluruhnya', 'of ' + C.length + ' in total') },
        { label: 'Lewat tenggat', nilai: telat.length, nada: telat.length ? 'critical' : 'low',
          note: L('dikirim ulang harian sampai ditutup', 'resent daily until closed') },
        { label: 'Ditutup & diverifikasi', nilai: persen, satuan: '%', nada: persen >= 85 ? 'low' : 'high',
          note: L(selesai.length + ' dari ' + C.length + ' entri saat ini', selesai.length + ' of ' + C.length + ' entries right now') }
      ],
      poin: [
        L('Angka ditutup pada potret hari ini (' + selesai.length + ' dari ' + C.length + ') berbeda dari KPI "CAPA Tepat Waktu" ' + kpiCapa +
          ': KPI mengukur ketepatan waktu sepanjang tahun berjalan, kolom ini mengukur berapa yang sudah tertutup sekarang. Keduanya benar dan tidak boleh dipertukarkan.',
          'The closed figure in today’s snapshot (' + selesai.length + ' of ' + C.length + ') differs from the "CAPA On Time" KPI of ' + kpiCapa +
          ': the KPI measures punctuality across the year to date, this column measures how many are closed right now. Both are correct and must not be swapped.'),
        telat.length
          ? L(telat.length + ' CAPA sudah lewat tenggat. Yang paling lama: ' + telat[0].id + ' — ' + telat[0].judul + ' (penanggung jawab ' + telat[0].pj + ', tenggat ' + telat[0].tenggat + ').',
              telat.length + ' CAPAs are past due. The longest running: ' + telat[0].id + ' — ' + telat[0].judul + ' (owner ' + telat[0].pj + ', due ' + telat[0].tenggat + ').')
          : L('Tidak ada CAPA yang lewat tenggat.', 'No CAPA is past due.'),
        tinggi.length
          ? L(tinggi.length + ' CAPA berprioritas Tinggi masih terbuka: ' + tinggi.map(function (r) { return r.id; }).join(', ') + '.',
              tinggi.length + ' High priority CAPAs are still open: ' + tinggi.map(function (r) { return r.id; }).join(', ') + '.')
          : L('Tidak ada CAPA prioritas Tinggi yang masih terbuka.', 'No High priority CAPA remains open.'),
        L('Item tertua berumur ' + tua.umur + ' hari sejak terbit (' + tua.id + '). Penuaan dihitung dari tanggal terbit, bukan tanggal tenggat.',
          'The oldest item is ' + tua.umur + ' days old since issue (' + tua.id + '). Ageing is counted from the issue date, not the due date.'),
        L('Asal CAPA: ' + Object.keys(sumber).map(function (k) { return sumber[k] + ' dari ' + k; }).join(', ') +
          '. CAPA tidak pernah dibuat dari nol — setiap entri membawa tautan balik ke catatan asalnya.',
          'CAPA origins: ' + Object.keys(sumber).map(function (k) { return sumber[k] + ' from ' + k; }).join(', ') +
          '. A CAPA is never created from nothing — every entry carries a link back to the record it came from.')
      ],
      tabel: {
        head: ['Nomor', 'Tindakan', 'Penanggung jawab', 'Tenggat', 'Status'],
        rows: C.filter(function (r) { return r.status !== 'Selesai'; })
               .map(function (r) { return [r.id, r.judul, r.pj, r.tenggat + (r.terlambat ? L(' (lewat)', ' (overdue)') : ''), r.status]; })
      }
    };
  }

  function bagianKepatuhan() {
    const DI = D.dokInternal, DE = D.dokEksternal;
    const kedaluwarsaDok = DI.filter(function (d) { return d.status === 'Kedaluwarsa'; });
    const revisi = DI.filter(function (d) { return d.status === 'Dalam Revisi'; });
    const habis = DE.filter(function (d) { return d.sisa < 0; });
    const dekat = DE.filter(function (d) { return d.sisa >= 0 && d.sisa <= 60; });
    const kriteria = D.elemenSMK3.reduce(function (a, e) { return a + e.kriteria; }, 0);
    const penuhi = D.elemenSMK3.reduce(function (a, e) { return a + e.penuhi; }, 0);
    const smk3 = Math.round(penuhi / kriteria * 100);
    const lemah = D.elemenSMK3.slice().sort(function (a, b) {
      return (a.penuhi / a.kriteria) - (b.penuhi / b.kriteria);
    })[0];

    return {
      judul: 'Kepatuhan dokumen dan sertifikasi',
      rute: 'docext',
      angka: [
        { label: 'Dokumen kedaluwarsa', nilai: habis.length, nada: habis.length ? 'critical' : 'low',
          note: L('sertifikat / izin pihak luar', 'externally issued certificates / permits') },
        { label: 'Jatuh tempo ≤ 60 hari', nilai: dekat.length, nada: dekat.length ? 'high' : 'low',
          note: L('penjadwalan lembaga perlu waktu', 'booking a certification body takes time') },
        { label: 'Pemenuhan SMK3', nilai: smk3, satuan: '%', nada: smk3 >= 90 ? 'low' : 'high',
          note: L(penuhi + ' dari ' + kriteria + ' kriteria', penuhi + ' of ' + kriteria + ' criteria') }
      ],
      poin: [
        habis.length
          ? L('Sudah kedaluwarsa: ' + habis.map(function (d) { return d.judul + ' (' + Math.abs(d.sisa) + ' hari)'; }).join('; ') +
              '. Pengoperasian peralatan tanpa dokumen yang masih berlaku adalah pelanggaran regulasi, bukan sekadar temuan administratif.',
              'Already expired: ' + habis.map(function (d) { return d.judul + ' (' + Math.abs(d.sisa) + ' days)'; }).join('; ') +
              '. Operating equipment without a valid document is a regulatory breach, not merely an administrative finding.')
          : L('Tidak ada sertifikat atau izin yang kedaluwarsa.', 'No certificate or permit has expired.'),
        dekat.length
          ? L('Jatuh tempo dalam 60 hari: ' + dekat.map(function (d) { return d.judul + ' (' + d.sisa + ' hari)'; }).join('; ') + '.',
              'Falling due within 60 days: ' + dekat.map(function (d) { return d.judul + ' (' + d.sisa + ' days)'; }).join('; ') + '.')
          : L('Tidak ada dokumen yang jatuh tempo dalam 60 hari.', 'No document falls due within 60 days.'),
        kedaluwarsaDok.length
          ? L(kedaluwarsaDok.length + ' dokumen internal lewat masa tinjau: ' + kedaluwarsaDok.map(function (d) { return d.id + ' ' + d.judul; }).join('; ') + '.',
              kedaluwarsaDok.length + ' internal documents are past their review date: ' + kedaluwarsaDok.map(function (d) { return d.id + ' ' + d.judul; }).join('; ') + '.')
          : L('Seluruh dokumen internal masih dalam masa tinjau.', 'All internal documents are within their review period.'),
        revisi.length
          ? L(revisi.length + ' dokumen sedang direvisi; versi berlaku tetap dipakai sampai revisi disahkan.',
              revisi.length + ' documents are under revision; the effective version stays in use until the revision is approved.')
          : '',
        L('Elemen SMK3 terlemah: elemen ' + lemah.no + ' — ' + lemah.nama + ' (' + lemah.penuhi + '/' + lemah.kriteria + '). ' +
          'Pemenuhan dibaca per elemen, bukan sebagai satu angka gabungan.',
          'Weakest SMK3 element: element ' + lemah.no + ' — ' + lemah.nama + ' (' + lemah.penuhi + '/' + lemah.kriteria + '). ' +
          'Compliance is read element by element, not as a single combined figure.')
      ].filter(Boolean),
      tabel: {
        head: ['Nomor', 'Dokumen', 'Penerbit', 'Berlaku sampai', 'Sisa'],
        rows: DE.filter(function (d) { return d.sisa <= 200; })
                .sort(function (a, b) { return a.sisa - b.sisa; })
                .map(function (d) {
                  return [d.id, d.judul, d.penerbit, d.berlaku,
                          d.sisa < 0 ? L('kedaluwarsa ' + Math.abs(d.sisa) + ' hari', 'expired ' + Math.abs(d.sisa) + ' days ago')
                                     : L(d.sisa + ' hari', d.sisa + ' days')];
                })
      }
    };
  }

  function bagianRisiko() {
    const R = D.risikoRegister;
    const skor = function (r) { return r.L * r.S; };
    const sisa = function (r) { return r.sisaL * r.sisaS; };
    const ekstremAwal = R.filter(function (r) { return skor(r) >= 15; });
    const ekstremSisa = R.filter(function (r) { return sisa(r) >= 15; });
    const tertinggi = R.slice().sort(function (a, b) { return skor(b) - skor(a); })[0];
    const turun = R.reduce(function (a, r) { return a + (skor(r) - sisa(r)); }, 0);

    return {
      judul: 'Register risiko',
      rute: 'risk',
      angka: [
        { label: 'Risiko terdaftar', nilai: R.length,
          note: L('matriks 5×5 kemungkinan × keparahan', '5×5 likelihood × severity matrix') },
        { label: 'Zona Ekstrem awal', nilai: ekstremAwal.length, nada: ekstremAwal.length ? 'high' : 'low',
          note: L('sebelum pengendalian', 'before controls') },
        { label: 'Zona Ekstrem sisa', nilai: ekstremSisa.length, nada: ekstremSisa.length ? 'critical' : 'low',
          note: L('setelah pengendalian', 'after controls') }
      ],
      poin: [
        ekstremSisa.length
          ? L('Ada ' + ekstremSisa.length + ' risiko sisa di zona Ekstrem. Pekerjaan terkait tidak boleh berjalan sampai skornya turun: ' + ekstremSisa.map(function (r) { return r.id; }).join(', ') + '.',
              ekstremSisa.length + ' residual risks sit in the Extreme zone. The work they cover must not run until the score comes down: ' + ekstremSisa.map(function (r) { return r.id; }).join(', ') + '.')
          : L('Tidak ada risiko sisa di zona Ekstrem. Ini syarat agar izin kerja dapat diterbitkan.',
              'No residual risk sits in the Extreme zone. This is the condition that allows work permits to be issued.'),
        L('Risiko awal tertinggi: ' + tertinggi.id + ' — ' + tertinggi.ancaman + ' pada proses ' + tertinggi.proses +
          ' (skor ' + skor(tertinggi) + ' → ' + sisa(tertinggi) + ' setelah ' + tertinggi.mitigasi.toLowerCase() + ').',
          'Highest initial risk: ' + tertinggi.id + ' — ' + tertinggi.ancaman + ' in process ' + tertinggi.proses +
          ' (score ' + skor(tertinggi) + ' → ' + sisa(tertinggi) + ' after ' + tertinggi.mitigasi.toLowerCase() + ').'),
        L('Pengendalian yang terpasang menurunkan total skor register sebesar ' + turun + ' poin. Matriks dan kosakata zonanya sama persis dengan yang dipakai JSEA pada modul Work Permit.',
          'The controls in place reduce the register’s total score by ' + turun + ' points. The matrix and its zone vocabulary are exactly the ones the JSEA uses in the Work Permit module.'),
        L('Opsi penanganan ditawarkan berurutan: Hindari → Kurangi → Transfer → Terima.',
          'Treatment options are offered in order: Avoid → Reduce → Transfer → Accept.')
      ],
      tabel: {
        head: ['Nomor', 'Ancaman', 'Proses', 'Awal', 'Sisa', 'Penanggung jawab'],
        rows: R.slice().sort(function (a, b) { return skor(b) - skor(a); })
               .map(function (r) { return [r.id, r.ancaman, r.proses, String(skor(r)), String(sisa(r)), r.pj]; })
      }
    };
  }

  function bagianLingkungan() {
    const LK = D.lingkungan;
    const lewat = [], semua = [];
    ['pppa', 'pppu', 'limbah', 'plb3'].forEach(function (k) {
      const dom = LK[k]; if (!dom) return;
      (dom.param || []).forEach(function (p) {
        const baris = { domain: dom.judul, acuan: dom.acuan, nama: p.nama,
                        nilai: p.nilai + ' ' + (p.satuan || ''), ambang: p.ambang, ok: p.ok !== false };
        semua.push(baris); if (!baris.ok) lewat.push(baris);
      });
    });

    return {
      judul: 'Kinerja lingkungan',
      rute: 'environment',
      angka: [
        { label: 'Parameter dipantau', nilai: semua.length,
          note: L('empat domain lingkungan', 'four environmental domains') },
        { label: 'Melewati baku mutu', nilai: lewat.length, nada: lewat.length ? 'critical' : 'low',
          note: L('melahirkan CAPA otomatis', 'creates a CAPA automatically') }
      ],
      poin: [
        lewat.length
          ? L('Melewati ambang: ' + lewat.map(function (p) { return p.nama + ' ' + p.nilai + ' terhadap baku mutu ' + p.ambang + ' (' + p.domain + ')'; }).join('; ') +
              '. Nilai yang melewati ambang melahirkan satu entri CAPA dan muncul di kolom Perhatian Segera pada Dashboard.',
              'Over the threshold: ' + lewat.map(function (p) { return p.nama + ' ' + p.nilai + ' against a limit of ' + p.ambang + ' (' + p.domain + ')'; }).join('; ') +
              '. A value that crosses the threshold creates one CAPA entry and appears in the Immediate Attention column on the Dashboard.')
          : L('Seluruh parameter berada di dalam baku mutu.', 'Every parameter sits within its quality standard.'),
        L('Setiap nilai terukur selalu disandingkan dengan baku mutunya. Angka tanpa ambang pembanding tidak berarti apa-apa bagi pembaca.',
          'Every measured value is always placed next to its quality standard. A figure with no threshold beside it means nothing to the reader.'),
        L('Acuan yang dipakai: ', 'Standards applied: ') + Object.keys(LK).map(function (k) { return LK[k].acuan; })
          .filter(function (v, i, a) { return v && a.indexOf(v) === i; }).join('; ') + '.'
      ],
      tabel: {
        head: ['Domain', 'Parameter', 'Nilai', 'Baku mutu', 'Status'],
        rows: semua.map(function (p) {
          return [p.domain.split(' — ')[0], p.nama, p.nilai, p.ambang,
                  p.ok ? L('Memenuhi', 'Within limit') : L('Melewati ambang', 'Over threshold')];
        })
      }
    };
  }

  function bagianPelatihan() {
    const P = D.pelatihan;
    const belum = P.filter(function (r) { return r.status === 'Belum Terlaksana'; });
    const jadwal = P.filter(function (r) { return r.status === 'Terjadwal'; });
    const jam = P.reduce(function (a, r) { return a + (r.aktualPeserta || 0); }, 0);
    const sertDekat = D.sertifikasi.filter(function (s) { return s.sisa <= 60; });

    return {
      judul: 'Pelatihan dan kompetensi',
      rute: 'training',
      angka: [
        { label: 'Program pelatihan', nilai: P.length,
          note: L('rencana tahun berjalan', 'plan for the year to date') },
        { label: 'Belum terlaksana', nilai: belum.length, nada: belum.length ? 'high' : 'low',
          note: L('sudah lewat tanggal rencana', 'past the planned date') },
        { label: 'Sertifikat ≤ 60 hari', nilai: sertDekat.length, nada: sertDekat.length ? 'high' : 'low',
          note: L('perpanjangan perlu dimulai', 'renewal needs to start') }
      ],
      poin: [
        belum.length
          ? L('Belum terlaksana: ' + belum.map(function (r) { return r.nama + ' (rencana ' + r.rencanaTgl + ')'; }).join('; ') +
              '. Yang ditanya auditor bukan daftar pelatihan yang pernah diadakan, melainkan mengapa yang direncanakan belum terlaksana.',
              'Not yet delivered: ' + belum.map(function (r) { return r.nama + ' (planned ' + r.rencanaTgl + ')'; }).join('; ') +
              '. What an auditor asks for is not the list of training already held, but why the training that was planned has not happened.')
          : L('Seluruh pelatihan yang direncanakan sudah terlaksana.', 'All planned training has been delivered.'),
        jadwal.length
          ? L(jadwal.length + ' pelatihan masih terjadwal ke depan.', jadwal.length + ' training sessions remain scheduled ahead.')
          : '',
        sertDekat.length
          ? L('Sertifikat personel yang mendekati akhir masa berlaku: ' + sertDekat.map(function (s) { return s.nama + ' — ' + s.pemegang + ' (' + s.sisa + ' hari)'; }).join('; ') + '.',
              'Personnel certificates approaching expiry: ' + sertDekat.map(function (s) { return s.nama + ' — ' + s.pemegang + ' (' + s.sisa + ' days)'; }).join('; ') + '.')
          : L('Tidak ada sertifikat personel yang jatuh tempo dalam 60 hari.', 'No personnel certificate falls due within 60 days.'),
        L('Total peserta aktual tercatat ' + jam + ' orang; jam-orangnya mengalir ke KPI Jam Pelatihan K3 di modul SHE KPI & Analytics.',
          'Actual participants recorded total ' + jam + ' people; their man-hours flow into the OHS Training Hours KPI in the SHE KPI & Analytics module.')
      ].filter(Boolean),
      tabel: {
        head: ['Nomor', 'Pelatihan', 'Rencana', 'Aktual', 'Status'],
        rows: P.map(function (r) {
          return [r.id, r.nama, r.rencanaTgl + ' · ' + r.rencanaPeserta,
                  r.aktualTgl ? r.aktualTgl + ' · ' + r.aktualPeserta : '—', r.status];
        })
      }
    };
  }

  function bagianAudit() {
    const A = D.audit, T = D.temuanAudit;
    const kat = {}; T.forEach(function (t) { kat[t.kategori] = (kat[t.kategori] || 0) + 1; });
    const terbuka = T.filter(function (t) { return t.status !== 'Selesai' && t.status !== 'Ditutup'; });
    const major = T.filter(function (t) { return t.kategori === 'Major'; });

    return {
      judul: 'Audit dan ketidaksesuaian',
      rute: 'audit',
      angka: [
        { label: 'Audit tercatat', nilai: A.length, note: 'ISO 45001, ISO 14001, SMK3' },
        { label: 'Temuan', nilai: T.length, note: Object.keys(kat).map(function (k) { return kat[k] + ' ' + k; }).join(', ') },
        { label: 'Temuan terbuka', nilai: terbuka.length, nada: terbuka.length ? 'high' : 'low',
          note: L('wajib punya CAPA bertenggat', 'must carry a CAPA with a due date') }
      ],
      poin: [
        major.length
          ? L(major.length + ' temuan Major: ' + major.map(function (t) { return t.id + ' (klausul ' + t.klausul + ') — ' + t.isi; }).join('; ') +
              '. Setiap temuan Major wajib punya CAPA dengan tenggat; yang lewat tenggat naik ke merah di seluruh papan.',
              major.length + ' Major findings: ' + major.map(function (t) { return t.id + ' (clause ' + t.klausul + ') — ' + t.isi; }).join('; ') +
              '. Every Major finding must carry a CAPA with a due date; anything past due turns red across every board.')
          : L('Tidak ada temuan berkategori Major.', 'There are no Major findings.'),
        terbuka.length
          ? L('Masih terbuka: ' + terbuka.map(function (t) { return t.id + ' (' + t.kategori + ', tenggat ' + t.tenggat + ')'; }).join('; ') + '.',
              'Still open: ' + terbuka.map(function (t) { return t.id + ' (' + t.kategori + ', due ' + t.tenggat + ')'; }).join('; ') + '.')
          : L('Seluruh temuan audit sudah ditutup.', 'Every audit finding has been closed.'),
        L('Jadwal audit berikutnya menentukan berapa lama temuan boleh menggantung — temuan tanpa CAPA adalah temuan audit berikutnya yang sedang menunggu.',
          'The next audit date sets how long a finding may hang — a finding without a CAPA is next audit’s finding, already waiting.')
      ],
      tabel: {
        head: ['Nomor', 'Temuan', 'Klausul', 'Kategori', 'Tenggat', 'Status'],
        rows: T.map(function (t) { return [t.id, t.isi, t.klausul, t.kategori, t.tenggat, t.status]; })
      }
    };
  }

  function bagianKpi() {
    const buruk = D.kpiLagging.concat(D.kpiLeading).filter(function (k) { return k.arah === 'bad'; });
    return {
      judul: 'Indikator kinerja K3',
      rute: 'kpi',
      angka: D.kpiLagging.slice(0, 3).map(function (k) {
        return { label: k.nama, nilai: k.nilai, satuan: k.satuan, nada: k.arah === 'bad' ? 'high' : 'low', note: k.delta };
      }),
      poin: [
        L('Lagging mengukur hasil yang sudah terjadi: ', 'Lagging measures outcomes that have already happened: ') +
          D.kpiLagging.map(function (k) { return k.nama + ' ' + k.nilai + (k.satuan || ''); }).join(', ') + '.',
        L('Leading mengukur usaha yang sedang dilakukan: ', 'Leading measures the effort being made now: ') +
          D.kpiLeading.map(function (k) { return k.nama + ' ' + k.nilai + (k.satuan || ''); }).join(', ') + '.',
        buruk.length
          ? L('Bergerak ke arah yang tidak diinginkan: ' + buruk.map(function (k) { return k.nama + ' (' + k.delta + ')'; }).join('; ') + '.',
              'Moving in the wrong direction: ' + buruk.map(function (k) { return k.nama + ' (' + k.delta + ')'; }).join('; ') + '.')
          : L('Tidak ada indikator yang bergerak ke arah yang tidak diinginkan.', 'No indicator is moving in the wrong direction.'),
        L('TRIR memakai basis 200.000 jam dan LTIFR 1.000.000 jam — membandingkan keduanya secara langsung adalah kekeliruan basis.',
          'TRIR uses a 200,000-hour base and LTIFR 1,000,000 hours — comparing the two directly is a base error.')
      ],
      tabel: {
        head: ['Indikator', 'Jenis', 'Nilai', 'Perubahan', 'Cakupan'],
        rows: D.kpiLagging.map(function (k) { return [k.nama, 'Lagging', k.nilai + ' ' + (k.satuan || ''), k.delta, k.note]; })
              .concat(D.kpiLeading.map(function (k) { return [k.nama, 'Leading', k.nilai + ' ' + (k.satuan || ''), k.delta, k.note]; }))
      }
    };
  }

  function bagianPabrik() {
    const P = D.pabrikKinerja;
    const kritis = P.filter(function (p) { return p.status === 'Kritis'; });
    const terburukTrir = P.slice().sort(function (a, b) { return num(b.trir) - num(a.trir); })[0];
    const terburukCapa = P.slice().sort(function (a, b) { return num(a.capa) - num(b.capa); })[0];
    const totalPekerja = P.reduce(function (a, p) { return a + p.pekerja; }, 0);
    const totalInsiden = P.reduce(function (a, p) { return a + p.insiden; }, 0);

    return {
      judul: 'Perbandingan antarpabrik',
      rute: 'exec',
      angka: [
        { label: 'Pabrik dipantau', nilai: P.length,
          note: L(totalPekerja + ' pekerja seluruhnya', totalPekerja + ' workers in total') },
        { label: 'Berstatus Kritis', nilai: kritis.length, nada: kritis.length ? 'critical' : 'low',
          note: L('ditentukan indikator terburuk', 'set by the worst indicator') },
        { label: 'Insiden grup', nilai: totalInsiden, note: D.periode }
      ],
      poin: [
        L('TRIR tertinggi di ' + terburukTrir.nama + ' (' + terburukTrir.trir + '), penyelesaian CAPA terendah di ' + terburukCapa.nama + ' (' + terburukCapa.capa + ').',
          'Highest TRIR at ' + terburukTrir.nama + ' (' + terburukTrir.trir + '), lowest CAPA completion at ' + terburukCapa.nama + ' (' + terburukCapa.capa + ').'),
        kritis.length
          ? L('Berstatus Kritis: ' + kritis.map(function (p) { return p.nama + ' (TRIR ' + p.trir + ', CAPA ' + p.capa + ', SMK3 ' + p.smk3 + ')'; }).join('; ') + '.',
              'In Critical status: ' + kritis.map(function (p) { return p.nama + ' (TRIR ' + p.trir + ', CAPA ' + p.capa + ', SMK3 ' + p.smk3 + ')'; }).join('; ') + '.')
          : L('Tidak ada pabrik berstatus Kritis.', 'No plant is in Critical status.'),
        L('Status pabrik ditentukan oleh indikator terburuk, bukan rata-rata. Angka grup menyembunyikan sebaran antarpabrik, jadi kartu skor pabrik selalu dibaca berdampingan dengan angka grup.',
          'Plant status is set by the worst indicator, not by the average. The group figure hides the spread between plants, so the plant scorecard is always read side by side with the group figure.')
      ],
      tabel: {
        head: ['Pabrik', 'Pekerja', 'TRIR', 'LTIFR', 'Insiden', 'CAPA', 'SMK3', 'Status'],
        rows: P.map(function (p) { return [p.nama, String(p.pekerja), p.trir, p.ltifr, String(p.insiden), p.capa, p.smk3, p.status]; })
      }
    };
  }

  const BAGIAN = {
    insiden: bagianInsiden, capa: bagianCapa, kepatuhan: bagianKepatuhan, risiko: bagianRisiko,
    lingkungan: bagianLingkungan, pelatihan: bagianPelatihan, audit: bagianAudit,
    kpi: bagianKpi, pabrik: bagianPabrik
  };

  /* Hal yang tidak dapat diselesaikan di tingkat pabrik — naik ke manajemen. */
  function keputusan() {
    const out = [];
    D.dokEksternal.filter(function (d) { return d.sisa < 0; }).forEach(function (d) {
      out.push({
        judul: L(d.judul + ' sudah kedaluwarsa ' + Math.abs(d.sisa) + ' hari',
                 d.judul + ' expired ' + Math.abs(d.sisa) + ' days ago'),
        alasan: L('Peralatan atau kegiatan yang dicakup dokumen ini berjalan tanpa dasar hukum yang masih berlaku.',
                  'The equipment or activity this document covers is running without a valid legal basis.'),
        opsi: L('Hentikan pengoperasian sampai dokumen terbit, atau tempuh percepatan penerbitan dengan ' + d.penerbit + '.',
                'Stop operation until the document is issued, or pursue expedited issuance with ' + d.penerbit + '.'),
        rute: 'docext'
      });
    });
    D.risikoRegister.filter(function (r) { return r.sisaL * r.sisaS >= 15; }).forEach(function (r) {
      out.push({
        judul: L('Risiko sisa ' + r.id + ' masih di zona Ekstrem', 'Residual risk ' + r.id + ' is still in the Extreme zone'),
        alasan: L(r.ancaman + ' pada proses ' + r.proses + '. Pengendalian yang ada belum menurunkan skor ke zona yang dapat diterima.',
                  r.ancaman + ' in process ' + r.proses + '. The controls in place have not brought the score into an acceptable zone.'),
        opsi: L('Hentikan pekerjaan terkait, atau setujui belanja pengendalian tambahan yang diusulkan ' + r.pj + '.',
                'Stop the work it covers, or approve the additional control spending proposed by ' + r.pj + '.'),
        rute: 'risk'
      });
    });
    D.programStrategis.filter(function (p) { return p.status === 'Terbuka'; }).forEach(function (p) {
      out.push({
        judul: L(p.nama + ' belum dimulai', p.nama + ' has not started'),
        alasan: L('Sasaran ' + p.target + ' dengan tenggat ' + p.tenggat + ' masih pada kemajuan ' + p.capai + ' dari ' + p.dari + '.',
                  'Target ' + p.target + ' with a deadline of ' + p.tenggat + ' stands at ' + p.capai + ' of ' + p.dari + '.'),
        opsi: L('Alokasikan anggaran dan penanggung jawab, atau geser tenggat secara resmi dengan alasan tertulis.',
                'Allocate budget and an owner, or move the deadline formally with a written reason.'),
        rute: 'exec'
      });
    });
    D.pabrikKinerja.filter(function (p) { return p.status === 'Kritis'; }).forEach(function (p) {
      out.push({
        judul: L('Pabrik ' + p.nama + ' berstatus Kritis', p.nama + ' plant is in Critical status'),
        alasan: L('TRIR ' + p.trir + ', penyelesaian CAPA ' + p.capa + ', pemenuhan SMK3 ' + p.smk3 + ' — di bawah pabrik lain pada grup yang sama.',
                  'TRIR ' + p.trir + ', CAPA completion ' + p.capa + ', SMK3 compliance ' + p.smk3 + ' — below the other plants in the same group.'),
        opsi: L('Tugaskan petugas K3 tambahan atau pendampingan dari tim pusat selama satu triwulan.',
                'Assign an additional safety officer or head-office coaching for one quarter.'),
        rute: 'exec'
      });
    });
    return out;
  }

  function rekomendasi(topik) {
    const out = [];
    const ada = function (t) { return topik.indexOf(t) >= 0; };

    if (ada('capa')) {
      const telat = D.capa.filter(function (r) { return r.terlambat; });
      if (telat.length) out.push({
        teks: L('Tutup ' + telat.length + ' CAPA yang lewat tenggat, mulai dari ' + telat[0].id + ' (' + telat[0].pj + '). Pemindahan ke Selesai hanya oleh petugas QHSE dengan bukti terlampir.',
                'Close the ' + telat.length + ' past-due CAPAs, starting with ' + telat[0].id + ' (' + telat[0].pj + '). Only a QHSE officer may move one to Completed, with evidence attached.'),
        sumber: 'Modul CAPA', rute: 'capa'
      });
    }
    if (ada('kepatuhan')) {
      const habis = D.dokEksternal.filter(function (d) { return d.sisa < 0; });
      if (habis.length) out.push({
        teks: L('Urus penerbitan ulang ' + habis[0].judul + ' ke ' + habis[0].penerbit + ' sebagai prioritas pertama minggu ini.',
                'Pursue re-issuance of ' + habis[0].judul + ' with ' + habis[0].penerbit + ' as this week’s first priority.'),
        sumber: 'Modul Dokumen Eksternal', rute: 'docext'
      });
      const dekat = D.dokEksternal.filter(function (d) { return d.sisa >= 0 && d.sisa <= 60; });
      if (dekat.length) out.push({
        teks: L('Mulai penjadwalan lembaga sertifikasi untuk ' + dekat.length + ' dokumen yang jatuh tempo dalam 60 hari — penjadwalan memerlukan waktu lebih lama daripada masa tersisa bila ditunda.',
                'Start booking the certification body for the ' + dekat.length + ' documents falling due within 60 days — booking takes longer than the time remaining if it is put off.'),
        sumber: 'Modul Dokumen Eksternal', rute: 'docext'
      });
    }
    if (ada('insiden')) {
      const belum = D.insiden.filter(function (r) { return r.status !== 'Selesai'; });
      if (belum.length) out.push({
        teks: L('Lengkapi investigasi akar masalah ' + belum[0].id + ' supaya statusnya dapat naik ke Terverifikasi dan CAPA-nya mengunci.',
                'Complete the root cause investigation for ' + belum[0].id + ' so its status can move to Verified and its CAPA can lock.'),
        sumber: 'Modul Incident & Nearmiss', rute: 'incident'
      });
    }
    if (ada('lingkungan')) {
      const LK = D.lingkungan;
      const lewat = [];
      ['pppa', 'pppu', 'limbah', 'plb3'].forEach(function (k) {
        if (!LK[k]) return;
        (LK[k].param || []).forEach(function (p) { if (p.ok === false) lewat.push(p); });
      });
      if (lewat.length) out.push({
        teks: L('Jadwalkan uji ulang parameter ' + lewat.map(function (p) { return p.nama; }).join(', ') + ' dalam 14 hari dan perbaiki sumber penyebabnya lebih dulu, bukan sebaliknya.',
                'Schedule a retest of ' + lewat.map(function (p) { return p.nama; }).join(', ') + ' within 14 days, and fix the source first rather than the other way round.'),
        sumber: 'Modul Environment', rute: 'environment'
      });
    }
    if (ada('pelatihan')) {
      const belum = D.pelatihan.filter(function (r) { return r.status === 'Belum Terlaksana'; });
      if (belum.length) out.push({
        teks: L('Jadwalkan ulang ' + belum.length + ' pelatihan yang belum terlaksana dan catat alasan keterlambatannya — kolom inilah yang diminta auditor.',
                'Reschedule the ' + belum.length + ' training sessions not yet delivered and record why they slipped — that column is what the auditor asks for.'),
        sumber: 'Modul Manajemen Pelatihan', rute: 'training'
      });
    }
    if (ada('audit')) {
      const major = D.temuanAudit.filter(function (t) { return t.kategori === 'Major'; });
      if (major.length) out.push({
        teks: L('Pastikan setiap temuan Major (' + major.map(function (t) { return t.id; }).join(', ') + ') sudah punya CAPA bertenggat sebelum surveillance berikutnya.',
                'Make sure every Major finding (' + major.map(function (t) { return t.id; }).join(', ') + ') carries a CAPA with a due date before the next surveillance audit.'),
        sumber: 'Modul Audit', rute: 'audit'
      });
    }
    if (ada('risiko')) {
      const ekstrem = D.risikoRegister.filter(function (r) { return r.sisaL * r.sisaS >= 15; });
      out.push({
        teks: ekstrem.length
          ? L('Hentikan pekerjaan yang tercakup ' + ekstrem.map(function (r) { return r.id; }).join(', ') + ' sampai risiko sisanya turun di bawah zona Ekstrem.',
              'Stop the work covered by ' + ekstrem.map(function (r) { return r.id; }).join(', ') + ' until its residual risk falls below the Extreme zone.')
          : L('Pertahankan nihil risiko sisa di zona Ekstrem; ini yang menjaga penerbitan izin kerja tetap dapat berjalan.',
              'Keep residual risk out of the Extreme zone entirely; that is what keeps work permit issuance possible.'),
        sumber: 'Modul Manajemen Risiko', rute: 'risk'
      });
    }
    if (ada('kpi')) {
      const buruk = D.kpiLeading.filter(function (k) { return k.arah === 'bad'; });
      if (buruk.length) out.push({
        teks: L('Perhatikan indikator leading yang melemah (' + buruk.map(function (k) { return k.nama; }).join(', ') + '); indikator leading turun lebih dulu sebelum angka lagging ikut memburuk.',
                'Watch the weakening leading indicators (' + buruk.map(function (k) { return k.nama; }).join(', ') + '); leading indicators fall first, before the lagging figures follow.'),
        sumber: 'Modul SHE KPI & Analytics', rute: 'kpi'
      });
    }
    if (ada('pabrik')) {
      const kritis = D.pabrikKinerja.filter(function (p) { return p.status === 'Kritis' || p.status === 'Perhatian'; });
      const rendah = D.pabrikKinerja.slice().sort(function (a, b) { return num(a.capa) - num(b.capa); })[0];
      if (kritis.length) out.push({
        teks: L('Jadwalkan tinjauan khusus untuk ' + kritis.map(function (p) { return p.nama + ' (' + p.status + ')'; }).join(' dan ') +
                '. Pabrik dengan penyelesaian CAPA terendah adalah ' + rendah.nama + ' (' + rendah.capa + ') — perbaiki kapasitas penutupan CAPA di sana sebelum menuntut angka TRIR turun.',
                'Schedule a dedicated review for ' + kritis.map(function (p) { return p.nama + ' (' + p.status + ')'; }).join(' and ') +
                '. The plant with the lowest CAPA completion is ' + rendah.nama + ' (' + rendah.capa + ') — fix the closing capacity there before demanding a lower TRIR.'),
        sumber: 'Dashboard Eksekutif', rute: 'exec'
      });
      out.push({
        teks: L('Baca kartu skor pabrik berdampingan dengan angka grup pada setiap rapat bulanan; angka grup yang lolos dapat menyembunyikan satu pabrik yang tidak.',
                'Read the plant scorecard side by side with the group figure at every monthly meeting; a group figure that passes can hide one plant that does not.'),
        sumber: 'Dashboard Eksekutif', rute: 'exec'
      });
    }
    if (!out.length) out.push({
      teks: L('Tidak ada tindakan mendesak pada lingkup yang diminta. Pertahankan irama pelaporan mingguan supaya penurunan indikator leading terlihat sebelum angka lagging ikut bergerak.',
              'No urgent action in the scope requested. Keep the weekly reporting rhythm so a dip in the leading indicators shows up before the lagging figures move.'),
      sumber: 'Dashboard & Laporan', rute: 'dashboard'
    });
    return out;
  }

  function ringkas(q) {
    const t = String(q == null ? '' : q).toLowerCase();
    let topik = TOPIK.filter(function (p) { return p[1].test(t); }).map(function (p) { return p[0]; });
    const lengkap = !topik.length || /lengkap|seluruh|semua|menyeluruh|penuh|full|complete|everything/.test(t);
    if (lengkap) topik = SEMUA_TOPIK;

    const bagian = topik.map(function (k) { return BAGIAN[k](); });
    const angka = [];
    bagian.forEach(function (b) { b.angka.forEach(function (a) { if (angka.length < 6) angka.push(a); }); });

    return {
      permintaan: String(q == null ? '' : q).trim(),
      judul: lengkap ? 'Kinerja QHSE Menyeluruh' : bagian.map(function (b) { return b.judul; }).join(', '),
      lingkup: D.plant + ' · ' + D.periode,
      terbaca: topik,
      angka: angka,
      bagian: bagian,
      keputusan: keputusan(),
      rekomendasi: rekomendasi(topik),
      sumber: bagian.map(function (b) { return { modul: b.judul, rute: b.rute }; })
    };
  }

  /* Contoh permintaan yang sudah pasti dikenali mesin di atas. */
  const CONTOH = {
    semua: ['boiler', 'forklift', 'limbah B3', 'ruang terbatas', 'Hendra Gunawan', 'INC-2026-0318', 'lewat tenggat'],
    iso: ['tanggap darurat', 'limbah B3', 'izin kerja', 'kondensat', 'observasi perilaku', 'ISO 45001'],
    ringkas: ['Ringkasan lengkap bulan ini', 'Bagaimana status CAPA dan temuan audit?',
              'Ringkas kepatuhan dokumen dan sertifikasi', 'Bandingkan kinerja antarpabrik',
              'Insiden dan risiko apa yang perlu perhatian?']
  };

  return {
    L: L,
    cari: cari,
    sorot: sorot,
    referensi: referensi,
    ringkas: ringkas,
    jenisDokumen: Object.keys(SERI),
    contoh: CONTOH,
    esc: esc,
    jumlahIndeks: function () { return indeks().length; },
    jumlahIso: function () { return indeks().filter(function (r) { return r.iso; }).length; }
  };
})();
