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
    bahaya:       { jalur: '/bahaya',        modul: 'hazard'  },
    insiden:      { jalur: '/insiden',       modul: 'incident' },
    capa:         { jalur: '/capa',          modul: 'capa'    },
    izin:         { jalur: '/izin',          modul: 'permit'  },
    observasiAPD: { jalur: '/observasi-apd', modul: 'bbs'     }
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
        pelapor: r.pelapor || 'Anonim', waktu: waktuSingkat(r.dibuat_pada),
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
        pj: r.pj, terbit: r.terbit, tenggat: r.tenggat, umur: Number(r.umur),
        status: r.status, prioritas: r.prioritas, terlambat: r.terlambat === true
      };
    },
    izin: function (r) {
      return {
        id: r.nomor, jenis: r.jenis, ikon: ikonIzin(r.jenis), judul: r.judul,
        pelaksana: r.pelaksana, vendor: r.vendor === true, pekerja: Number(r.pekerja),
        pengawas: r.pengawas, mulai: r.mulai || '', status: r.status,
        zona: r.zona || '—', risikoAwal: null, risikoSisa: r.risiko_sisa,
        prasyarat: []
      };
    },
    observasiAPD: function (r) {
      return {
        id: r.nomor, area: r.area, tanggal: r.tanggal, pengamat: r.pengamat,
        diamati: Number(r.diamati), patuh: Number(r.patuh),
        catatan: r.catatan, rincian: []
      };
    }
  };

  function ikonIzin(jenis) {
    return { 'panas': 'hot', 'ruang-terbatas': 'conf', 'ketinggian': 'height', 'listrik': 'elec' }[jenis] || 'hot';
  }

  function waktuSingkat(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var jam = String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0');
    var hariIni = new Date();
    return d.toDateString() === hariIni.toDateString() ? jam + ' hari ini' : jam + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
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
