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
    pengguna:     { jalur: '/pengguna',      modul: 'users'    }
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
        aman: Number(r.aman), berisiko: Number(r.berisiko), kategori: r.kategori,
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
            window.KG[koleksi] = (r.data || []).map(PETA[koleksi]);
            hidup.push(koleksi);
          }).catch(function (e) {
            /* Satu modul gagal tidak boleh menggagalkan seluruh aplikasi:
               data contohnya tetap dipakai, dan kegagalannya disebutkan. */
            console.warn('[KG] ' + koleksi + ' memakai data contoh — ' + e.message);
          })
        );
      });

      return Promise.all(janji).then(function () {
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
