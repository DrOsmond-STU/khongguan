/* KG SafeGuard — sumber data.
 *
 * Berkas ini adalah satu-satunya tempat aplikasi memutuskan dari mana datanya
 * datang. Tujuannya satu: menyambungkan antarmuka ke peladen TANPA menyentuh
 * app.js, app.css, atau tokens.css sebaris pun.
 *
 * Caranya sederhana dan sengaja dibuat membosankan: API mengembalikan bentuk
 * yang sama persis dengan yang dihasilkan assets/data.js, lalu berkas ini
 * menaruhnya di window.KG dan baru memuat app.js. Bagi app.js tidak ada yang
 * berubah — ia tetap membaca window.KG seperti sebelumnya, dan karena itu
 * tampilannya tidak mungkin bergeser.
 *
 * Dua mode:
 *
 *   Peragaan   window.KG_KONFIG.api kosong. Data contoh dari data.js dipakai
 *              apa adanya. Inilah yang berjalan pada purwarupa hari ini.
 *   Tersambung window.KG_KONFIG.api berisi alamat API. Koleksi yang sudah
 *              punya endpoint diambil dari peladen; sisanya masih memakai
 *              data contoh sampai modulnya disambungkan.
 *
 * Selama masa peralihan kedua sumber bercampur. Itu disengaja dan sementara:
 * modul disambungkan satu per satu (docs/12 tahap 3), dan daftar mana yang
 * sudah hidup dicetak ke konsol supaya penguji tidak perlu menebak.
 */

window.KGSUMBER = (function () {
  'use strict';

  var KONFIG = window.KG_KONFIG || {};
  var API = (KONFIG.api || '').replace(/\/$/, '');
  var KUNCI_TOKEN = 'kg-token';

  /* Koleksi yang endpoint-nya sudah ada. Ditambah seiring modul disambungkan. */
  var TERSAMBUNG = {
    bahaya:       { jalur: '/bahaya',        modul: 'hazard'   },
    insiden:      { jalur: '/insiden',       modul: 'incident' },
    capa:         { jalur: '/capa',          modul: 'capa'     },
    izin:         { jalur: '/izin',          modul: 'permit'   },
    observasiAPD: { jalur: '/observasi-apd', modul: 'bbs'      },
    observasi:    { jalur: '/observasi',     modul: 'bbs'      },
    jsa:          { jalur: '/jsa',           modul: 'jsa'      },
    hiradc:       { jalur: '/hiradc',        modul: 'hiradc'   },
    induksi:      { jalur: '/induksi',       modul: 'induksi'  },
    pengguna:     { jalur: '/pengguna',      modul: 'users'    },
    inspeksi:        { jalur: '/inspeksi',            modul: 'inspection'  },
    checklistHarian: { jalur: '/checklist',           modul: 'checklist'   },
    audit:           { jalur: '/audit',               modul: 'audit'       },
    temuanAudit:     { jalur: '/audit/temuan',        modul: 'audit'       },
    risikoRegister:  { jalur: '/risiko',              modul: 'risk'        },
    lingkungan:      { jalur: '/lingkungan',          modul: 'environment' },
    dokInternal:     { jalur: '/dokumen/internal',    modul: 'docint'      },
    dokEksternal:    { jalur: '/dokumen/eksternal',   modul: 'docext'      },
    regulasi:        { jalur: '/regulasi',            modul: 'regulasi'    },
    pelatihan:       { jalur: '/pelatihan',           modul: 'training'    },
    sertifikasi:     { jalur: '/pelatihan/sertifikasi', modul: 'training'  },
    kegiatan:        { jalur: '/kegiatan',            modul: 'activity'    },
    notifikasi:      { jalur: '/notifikasi',          modul: 'notif'       },
    kpi:             { jalur: '/kpi',                  modul: 'kpi'         },
    tren:            { jalur: '/kpi/tren',             modul: 'kpi'         },
    eksekutif:       { jalur: '/eksekutif',            modul: 'exec'        }
  };

  /* Koleksi yang balasannya bukan larik catatan; dipetakan utuh. */
  var UTUH = { lingkungan: true, kpi: true, eksekutif: true };

  /* Satu balasan yang mengisi beberapa koleksi window.KG sekaligus. Dipisah di
     sini, bukan di peladen: memecah /kpi menjadi enam endpoint hanya supaya
     bentuknya cocok dengan purwarupa berarti enam perjalanan jaringan untuk
     satu layar. */
  var PECAH = {
    kpi:       ['kpiLagging', 'kpiLeading'],
    tren:      ['trenInsiden', 'trenBahaya', 'trenTrir'],
    eksekutif: ['pabrikKinerja', 'programStrategis']
  };

  function token() {
    try { return localStorage.getItem(KUNCI_TOKEN); } catch (e) { return null; }
  }

  function simpanToken(t) {
    try { t ? localStorage.setItem(KUNCI_TOKEN, t) : localStorage.removeItem(KUNCI_TOKEN); } catch (e) {}
  }

  function ambil(jalur) {
    var opsi = { headers: { 'Accept': 'application/json' } };
    var t = token();
    if (t) opsi.headers['Authorization'] = 'Bearer ' + t;
    return fetch(API + '/api/v1' + jalur, opsi).then(function (r) {
      if (r.status === 401) { simpanToken(null); throw new Error('sesi berakhir'); }
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j.galat && j.galat.pesan) || ('HTTP ' + r.status));
        return j;
      });
    });
  }

  function kirim(jalur, isi) {
    var opsi = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(isi || {})
    };
    var t = token();
    if (t) opsi.headers['Authorization'] = 'Bearer ' + t;
    return fetch(API + '/api/v1' + jalur, opsi).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          var g = new Error((j.galat && j.galat.pesan) || ('HTTP ' + r.status));
          g.aturan = j.galat && j.galat.aturan;
          g.kode = j.galat && j.galat.kode;
          throw g;
        }
        return j;
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     Pemetaan balasan API ke bentuk yang dipakai app.js.

     Nama kolom di peladen memakai bahasa yang sama dengan basis data;
     app.js memakai nama yang sudah ada sejak purwarupa. Pemetaan di sini
     yang menjembatani keduanya, supaya tidak ada satu pun nama kolom yang
     harus diubah di app.js.
     ───────────────────────────────────────────────────────────────── */

  var PETA = {
    bahaya: function (r) {
      return {
        id: r.nomor, kategori: r.kategori, lokasi: r.area, isi: r.isi,
        pelapor: r.pelapor || 'Anonim', waktu: sejak(r.dibuat_pada),
        status: r.status, risiko: r.risiko
      };
    },
    insiden: function (r) {
      return {
        id: r.nomor, jenis: r.jenis, keparahan: r.keparahan, lokasi: r.area,
        tanggal: r.tanggal, waktu: (r.waktu || '').slice(0, 5),
        pelapor: r.pelapor || 'Anonim', status: r.status,
        terlambat: false, ringkas: r.ringkas,
        kronologi: r.kronologi || '', dampak: r.dampak || '', akar: r.akar || '',
        capa: r.capa_terbuka > 0 ? (r.capa_terbuka + ' terbuka') : '—'
      };
    },
    capa: function (r) {
      return {
        id: r.nomor, judul: r.judul, sumber: r.sumber_nomor, sumberJenis: r.sumber_jenis,
        pj: r.pj, terbit: tanggalPanjang(r.terbit), tenggat: tanggalPanjang(r.tenggat),
        umur: Number(r.umur),
        status: r.status, prioritas: r.prioritas, terlambat: r.terlambat === true
      };
    },
    izin: function (r) {
      return {
        id: r.nomor, jenis: r.jenis_nama, ikon: ikonIzin(r.jenis), judul: r.judul,
        pelaksana: r.pelaksana, vendor: r.vendor === true, pekerja: Number(r.pekerja),
        pengawas: r.pengawas,
        mulai: [tanggalPanjang(r.mulai), r.durasi].filter(Boolean).join(' \u00b7 '),
        status: r.status, zona: r.zona || '\u2014',
        risikoAwal: angka(r.risiko_awal), risikoSisa: angka(r.risiko_sisa),
        prasyarat: r.prasyarat || []
      };
    },
    observasiAPD: function (r) {
      return {
        id: r.nomor, area: r.area, tanggal: tanggalPanjang(r.tanggal), pengamat: r.pengamat,
        diamati: Number(r.diamati), patuh: Number(r.patuh),
        catatan: r.catatan,
        /* app.js membaca rincian sebagai [nama, diamati, patuh]. */
        rincian: (r.rincian || []).map(function (d) {
          return [d.jenis, Number(d.diamati), Number(d.patuh)];
        })
      };
    },
    observasi: function (r) {
      return {
        id: r.nomor, observer: r.pengamat, area: r.area, tanggal: tanggalPanjang(r.tanggal),
        aman: Number(r.aman), berisiko: Number(r.berisiko),
        /* Observasi yang seluruh perilakunya aman tidak punya kategori temuan;
           purwarupa menulisnya "\u2014". Dibiarkan null, app.js memanggil
           toUpperCase() padanya dan layarnya berhenti tergambar. */
        kategori: r.kategori || '\u2014',
        catatan: r.catatan, tindakan: r.tindakan || ''
      };
    },
    jsa: function (r) {
      return {
        id: r.nomor, pekerjaan: r.pekerjaan, area: r.area, jenis: r.jenis,
        penyusun: r.penyusun || '\u2014', peninjau: r.peninjau || '\u2014',
        pengesah: r.pengesah || '\u2014',
        disusun: tanggalPanjang(r.disusun), disahkan: tanggalPanjang(r.disahkan),
        tinjau: tanggalPanjang(r.tinjau), rev: Number(r.revisi), status: r.status,
        izinTerkait: r.izin_terkait || [], apd: r.apd_wajib || [],
        langkah: (r.langkah || []).map(function (l) {
          return {
            no: Number(l.nomor), kerja: l.kerja, bahaya: l.bahaya,
            k: Number(l.kemungkinan), s: Number(l.keparahan),
            sk: Number(l.kemungkinan_sisa), ss: Number(l.keparahan_sisa),
            /* app.js membaca kendali sebagai pasangan [hierarki, teks]. */
            kendali: (l.kendali || []).map(function (c) { return [c.hierarki, c.teks]; })
          };
        })
      };
    },
    hiradc: function (r) {
      return {
        id: r.nomor, proses: r.proses, aktivitas: r.aktivitas, rutin: r.sifat,
        kategori: r.kategori, bahaya: r.bahaya, risiko: r.risiko, korban: r.korban,
        k: Number(r.kemungkinan), p: Number(r.keparahan), kendaliAda: r.kendali_ada || '',
        sk: Number(r.kemungkinan_sisa), sp: Number(r.keparahan_sisa),
        kendaliTambah: r.kendali_tambahan || '', hierarki: r.hierarki || '\u2014',
        pj: r.pj || '\u2014', target: tanggalPanjang(r.target), status: r.status
      };
    },
    induksi: function (r) {
      return {
        id: r.nomor, nama: r.nama, jenis: r.jenis, asal: r.asal || '\u2014',
        tanggal: tanggalPanjang(r.tanggal), pemandu: r.pemandu || '\u2014',
        nilai: r.nilai === null ? null : Number(r.nilai),
        berlaku: tanggalPanjang(r.berlaku), sisa: r.sisa === null ? null : Number(r.sisa),
        status: r.status
      };
    },
    inspeksi: function (r) {
      return {
        id: r.nomor, jenis: r.jenis, area: r.area, petugas: r.petugas || '\u2014',
        tanggal: tanggalPanjang(r.tanggal), butir: Number(r.butir),
        selesai: Number(r.selesai), temuan: Number(r.temuan),
        status: r.status, jadwal: r.jadwal
      };
    },
    checklistHarian: function (r) {
      return {
        id: r.nomor, nama: r.nama, frekuensi: r.frekuensi, area: r.area || '\u2014',
        shift: r.shift || '\u2014', pj: r.pj || '\u2014', butir: Number(r.butir),
        selesai: Number(r.selesai), temuan: Number(r.temuan),
        status: r.status, waktu: (r.waktu || '').slice(0, 5)
      };
    },
    audit: function (r) {
      return {
        id: r.nomor, standar: r.standar, lingkup: r.lingkup, auditor: r.auditor,
        tanggal: rentangTanggal(r.mulai, r.selesai), status: r.status,
        temuan: { major: Number(r.major), minor: Number(r.minor), obs: Number(r.obs) }
      };
    },
    temuanAudit: function (r) {
      return {
        id: r.nomor, audit: r.audit, klausul: r.klausul, kategori: r.kategori,
        isi: r.isi, pj: r.pj || '\u2014', tenggat: tanggalPanjang(r.tenggat), status: r.status
      };
    },
    risikoRegister: function (r) {
      return {
        id: r.nomor, proses: r.proses, ancaman: r.ancaman, penyebab: r.penyebab, dampak: r.dampak,
        L: Number(r.kemungkinan), S: Number(r.keparahan),
        sisaL: Number(r.kemungkinan_sisa), sisaS: Number(r.keparahan_sisa),
        opsi: r.opsi, mitigasi: r.mitigasi, pj: r.pj || '\u2014',
        target: tanggalPanjang(r.target), reviu: tanggalPanjang(r.reviu), status: r.status
      };
    },
    dokInternal: function (r) {
      return {
        id: r.kode, level: Number(r.level), jenis: r.jenis, judul: r.judul,
        rev: Number(r.revisi), terbit: tanggalPanjang(r.terbit), tinjau: tanggalPanjang(r.tinjau),
        pemilik: r.pemilik, status: r.status
      };
    },
    dokEksternal: function (r) {
      return {
        id: r.kode, jenis: r.jenis, judul: r.judul, penerbit: r.penerbit, nomor: r.nomor,
        terbit: tanggalPanjang(r.terbit), berlaku: tanggalPanjang(r.berlaku), sisa: Number(r.sisa)
      };
    },
    regulasi: function (r) {
      return {
        id: r.kode, nomor: r.nomor, judul: r.judul, penerbit: r.penerbit, bidang: r.bidang,
        pasal: r.pasal, penerapan: r.penerapan, bukti: r.bukti || '\u2014',
        pj: r.pj || '\u2014', evaluasi: tanggalPanjang(r.evaluasi), status: r.status
      };
    },
    pelatihan: function (r) {
      return {
        id: r.nomor, nama: r.nama, jenis: r.jenis, target: Number(r.target),
        rencanaTgl: r.rencana_tanggal, rencanaPeserta: Number(r.rencana_peserta),
        aktualTgl: r.aktual_tanggal || '\u2014',
        aktualPeserta: r.aktual_peserta === null ? '\u2014' : Number(r.aktual_peserta),
        penyelenggara: r.penyelenggara, status: r.status,
        /* Purwarupa menulis biaya dengan koma desimal. */
        biaya: r.biaya_juta === null ? '\u2014' : String(r.biaya_juta).replace('.', ',')
      };
    },
    sertifikasi: function (r) {
      return {
        nama: r.nama, pemegang: r.pemegang, nomor: r.nomor,
        berlaku: tanggalPanjang(r.berlaku), sisa: Number(r.sisa)
      };
    },
    kegiatan: function (r) {
      return {
        id: r.nomor, jenis: r.jenis, judul: r.judul, tanggal: tanggalPanjang(r.tanggal),
        lokasi: r.lokasi || '\u2014', peserta: Number(r.peserta),
        durasi: Number(r.durasi_jam), foto: r.foto || ''
      };
    },
    notifikasi: function (r) {
      return {
        id: r.id, jenis: r.jenis, modul: r.modul, label: r.label || '', judul: r.judul,
        isi: r.isi, waktu: sejakJam(r.dibuat_pada), baca: r.baca === true, aksi: r.aksi
      };
    },
    /* KPI · dua deret terpisah, tidak pernah satu (AB-26). */
    kpi: function (o) {
      return {
        kpiLagging: (o.lagging || []).map(kartuKpi),
        kpiLeading: (o.leading || []).map(kartuKpi)
      };
    },
    tren: function (d) {
      return {
        trenInsiden: d.map(function (t) { return { bln: t.bln, v: Number(t.insiden) }; }),
        trenBahaya:  d.map(function (t) { return { bln: t.bln, v: Number(t.bahaya) }; }),
        trenTrir:    d.map(function (t) { return { bln: t.bln, v: t.trir === null ? 0 : Number(t.trir) }; })
      };
    },
    eksekutif: function (o) {
      return {
        pabrikKinerja: (o.pabrik || []).map(function (p) {
          return {
            nama: p.nama, pekerja: Number(p.pekerja),
            trir: num(p.trir, 2), ltifr: num(p.ltifr, 2),
            manhours: num(p.jam_kerja, 0),
            insiden: Number(p.insiden), bahaya: Number(p.bahaya),
            capa: p.capa === null ? '\u2014' : p.capa + '%',
            smk3: p.smk3 === null ? '\u2014' : p.smk3 + '%',
            status: p.status
          };
        }),
        programStrategis: (o.program || []).map(function (g) {
          return { nama: g.nama, target: g.target, capai: Number(g.capai),
                   dari: Number(g.dari), tenggat: g.tenggat, status: g.status };
        })
      };
    },
    /* Lingkungan bukan larik: empat pemantauan bernama, masing-masing dengan
       parameternya. Dipetakan utuh, bukan per baris. */
    lingkungan: function (o) {
      var keluar = {};
      Object.keys(o).forEach(function (k) {
        keluar[k] = {
          judul: o[k].judul, sub: o[k].sub, acuan: o[k].acuan,
          param: (o[k].param || []).map(function (v) {
            return { nama: v.nama, nilai: v.nilai, satuan: v.satuan,
                     ambang: v.ambang, ok: v.memenuhi === true };
          })
        };
      });
      return keluar;
    },
    pengguna: function (r) {
      return {
        email: r.email, nama: r.nama, inisial: r.inisial, peran: r.peran_kode,
        lokasi: r.pabrik.replace(/^Pabrik /, ''), status: r.status,
        masuk: r.masuk_terakhir ? tanggalPanjang(r.masuk_terakhir) + ', ' + jam(r.masuk_terakhir) : '\u2014'
      };
    }
  };

  function ikonIzin(jenis) {
    return { 'panas': 'hot', 'ruang-terbatas': 'conf', 'ketinggian': 'height', 'listrik': 'elec' }[jenis] || 'hot';
  }

  /* Format tanggal ditulis sama persis dengan purwarupa — "18 Sep 2026",
     bukan "2026-09-18". Tanggal yang tampil beda bentuk adalah perubahan
     tampilan, walaupun isinya sama. */
  var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function tanggalPanjang(nilai) {
    var d = tanggal(nilai);
    if (!d) return '\u2014';
    return String(d.getDate()).padStart(2, '0') + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }

  function jam(nilai) {
    var d = tanggal(nilai);
    if (!d) return '';
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* "3 jam lalu" — bentuk yang dipakai purwarupa pada laporan bahaya. */
  function sejak(nilai) {
    var d = tanggal(nilai);
    if (!d) return '';
    var menit = Math.round((Date.now() - d.getTime()) / 60000);
    if (menit < 60)   return Math.max(menit, 1) + ' menit lalu';
    if (menit < 1440) return Math.round(menit / 60) + ' jam lalu';
    return Math.round(menit / 1440) + ' hari lalu';
  }

  function tanggal(nilai) {
    if (!nilai) return null;
    /* Tanggal murni dibaca sebagai waktu setempat, bukan UTC: "2026-09-18"
       yang dibaca UTC berubah menjadi 17 September di zona waktu Indonesia. */
    var t = /^\d{4}-\d{2}-\d{2}$/.test(nilai) ? nilai + 'T00:00:00' : nilai;
    var d = new Date(t);
    return isNaN(d) ? null : d;
  }

  function angka(v) { return v === null || v === undefined ? null : Number(v); }

  /* Angka dalam bentuk Indonesia: titik ribuan, koma desimal. Purwarupa
     menulisnya begitu, dan angka yang berpindah bentuk adalah perubahan
     tampilan walaupun nilainya sama. */
  function num(v, desimal) {
    if (v === null || v === undefined) return '\u2014';
    var n = Number(v);
    if (isNaN(n)) return '\u2014';
    var t = n.toFixed(desimal === undefined ? 0 : desimal);
    var bagian = t.split('.');
    bagian[0] = bagian[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return bagian.join(',');
  }

  /* Satu kartu KPI: nilai, pembandingnya (AB-19), dan rumusnya (AB-27). */
  function kartuKpi(k) {
    var desimal = k.satuan === '%' || k.satuan === '/bln' || k.satuan === 'hari' ? 0
      : (k.kode === 'manhours' ? 0 : (k.kode === 'ltisr' || k.kode === 'pelatihan' ? 1 : 2));

    var delta;
    if (k.selisih === null || k.selisih === undefined) {
      delta = k.catatan || '\u2014';
    } else if (Number(k.selisih) === 0) {
      delta = 'sama dengan ' + k.bandingkan_dengan;
    } else {
      delta = num(Math.abs(k.selisih), desimal) + (k.satuan === '%' ? '%' : '')
        + ' vs ' + k.bandingkan_dengan;
      /* Selisih antara angka rekaman dan angka rekap sebelum sistem berjalan
         bukan perbandingan yang setara; dikatakan, bukan disembunyikan. */
      if (k.banding_setara === false) delta += ' (rekap awal)';
    }

    var bagian = [];
    if (k.selisih !== null && k.selisih !== undefined && k.catatan) bagian.push(k.catatan);
    else bagian.push(k.rumus);
    if (k.target !== null && k.target !== undefined) {
      bagian.push('target ' + k.target_arah + ' ' + num(k.target, desimal)
        + (k.satuan === '%' ? '%' : ''));
    }

    return {
      nama: k.nama, nilai: num(k.nilai, desimal), satuan: k.satuan,
      delta: delta, arah: k.arah, note: bagian.join(' \u00b7 ')
    };
  }

  /* "12–14 Okt 2026" bila sebulan sama, jika tidak dua tanggal penuh. */
  function rentangTanggal(mulai, selesai) {
    var a = tanggal(mulai);
    var b = tanggal(selesai);
    if (!a) return '\u2014';
    if (!b || a.getTime() === b.getTime()) return tanggalPanjang(mulai);
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
      return String(a.getDate()).padStart(2, '0') + '\u2013' + tanggalPanjang(selesai);
    }
    return tanggalPanjang(mulai) + ' \u2013 ' + tanggalPanjang(selesai);
  }

  /* Bentuk yang dipakai purwarupa pada kotak masuk: "08:12 hari ini",
     "Kemarin 16:20", lalu "2 hari lalu" untuk yang lebih tua. */
  function sejakJam(nilai) {
    var d = tanggal(nilai);
    if (!d) return '';
    var jm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    var hariIni = new Date();
    if (d.toDateString() === hariIni.toDateString()) return jm + ' hari ini';
    var kemarin = new Date(hariIni.getTime() - 86400000);
    if (d.toDateString() === kemarin.toDateString()) return 'Kemarin ' + jm;
    return sejak(nilai);
  }

  /* ─────────────────────────────────────────────────────────────────
     Pemuatan
     ───────────────────────────────────────────────────────────────── */

  function muatApp(selesai) {
    var s = document.createElement('script');
    s.src = (KONFIG.appJs || 'assets/app.js') + (KONFIG.versi ? '?v=' + KONFIG.versi : '');
    s.onload = function () { if (selesai) selesai(); };
    document.body.appendChild(s);
  }

  function tersambung() {
    /* Modul yang tidak terbuka untuk peran pengguna tidak diminta sama
       sekali — meminta lalu menerima 403 hanya membuat konsol penuh galat
       yang tidak berarti apa-apa. */
    return ambil('/saya').then(function (j) {
      var saya = j.data;
      window.KG_SAYA = saya;

      var janji = [];
      var hidup = [];
      Object.keys(TERSAMBUNG).forEach(function (koleksi) {
        var t = TERSAMBUNG[koleksi];
        if (saya.modul.indexOf(t.modul) === -1) return;
        janji.push(
          ambil(t.jalur).then(function (r) {
            var hasil = UTUH[koleksi]
              ? PETA[koleksi](r.data || {})
              : (PECAH[koleksi] ? PETA[koleksi](r.data || []) : (r.data || []).map(PETA[koleksi]));
            if (PECAH[koleksi]) {
              PECAH[koleksi].forEach(function (nama) { window.KG[nama] = hasil[nama]; });
              hidup.push(PECAH[koleksi].join('+'));
            } else {
              window.KG[koleksi] = hasil;
              hidup.push(koleksi);
            }
          }).catch(function (e) {
            /* Satu modul gagal tidak boleh menggagalkan seluruh aplikasi:
               data contohnya tetap dipakai, dan kegagalannya disebutkan. */
            console.warn('[KG] ' + koleksi + ' memakai data contoh — ' + e.message);
          })
        );
      });

      return Promise.all(janji).then(function () {
        /* Panel "Perhatian Segera" pada dashboard adalah pandangan lain atas
           pemberitahuan yang sama, bukan daftar kedua. Dua daftar terpisah
           akan berbeda isinya begitu salah satunya ditutup. */
        if (hidup.indexOf('notifikasi') !== -1) {
          window.KG.perhatian = window.KG.notifikasi
            .filter(function (n) { return n.jenis === 'critical' || n.jenis === 'high'; })
            .map(function (n) {
              return { chip: n.jenis, label: n.label, judul: n.judul, meta: n.isi };
            });
        }
        console.info('[KG] tersambung ke ' + API + ' sebagai ' + saya.nama
          + ' (' + saya.peran.nama + '). Koleksi langsung: ' + (hidup.sort().join(', ') || 'belum ada')
          + '. Sisanya masih data contoh.');
      });
    });
  }

  function mula() {
    if (!API) {                       /* mode peragaan, persis seperti purwarupa */
      muatApp();
      return;
    }
    tersambung()
      .catch(function (e) {
        console.warn('[KG] gagal tersambung ke peladen (' + e.message + '); memakai data contoh.');
      })
      .then(function () { muatApp(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mula);
  } else {
    mula();
  }

  return { ambil: ambil, kirim: kirim, token: token, simpanToken: simpanToken, api: API };
})();
