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

  /* Data acuan, diambil sekali saat tersambung. Formulir memakai nama area
     ("Line 3 — Oven Biskuit"); peladen memakai id-nya. */
  var ACUAN = null;
  var UNIT = [];

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
    try {
      return sessionStorage.getItem(KUNCI_TOKEN) || localStorage.getItem(KUNCI_TOKEN);
    } catch (e) { return null; }
  }

  /* "Ingat saya" dimatikan berarti sesi hilang begitu peramban ditutup:
     tokennya disimpan di sessionStorage, bukan localStorage. Di komputer
     bersama di pos satpam atau ruang produksi, itu bedanya antara akun yang
     aman dan akun yang dipakai orang shift berikutnya. */
  function simpanToken(t, ingat) {
    try {
      sessionStorage.removeItem(KUNCI_TOKEN);
      localStorage.removeItem(KUNCI_TOKEN);
      if (t) (ingat === false ? sessionStorage : localStorage).setItem(KUNCI_TOKEN, t);
    } catch (e) {}
  }

  /* Benar setelah sesi pernah terbuka. Membedakan "belum masuk" dari "sesi
     berakhir di tengah jalan" — yang pertama biasa, yang kedua harus
     dikatakan kepada pengguna. */
  var PERNAH_MASUK = false;

  function sesiPutus() {
    simpanToken(null);
    if (!PERNAH_MASUK) return;
    PERNAH_MASUK = false;
    /* Membiarkan aplikasi berjalan dengan data contoh setelah sesi berakhir
       berarti menampilkan catatan rekaan sebagai catatan sungguhan. Pada
       sistem K3 itu kegagalan terburuk yang mungkin: orang mengambil
       keputusan dari angka yang tidak pernah ada. */
    keluar('Sesi berakhir. Masuk kembali untuk melanjutkan.');
  }

  function ambil(jalur) {
    var opsi = { headers: { 'Accept': 'application/json' } };
    var t = token();
    if (t) opsi.headers['Authorization'] = 'Bearer ' + t;
    return fetch(API + '/api/v1' + jalur, opsi).then(function (r) {
      if (r.status === 401) { sesiPutus(); throw new Error('sesi berakhir'); }
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j.galat && j.galat.pesan) || ('HTTP ' + r.status));
        return j;
      });
    });
  }

  /* tanpaSesi: untuk layar masuk dan penyetel sandi. Di sana 401 berarti
     "sandi salah", bukan "sesi berakhir" — menafsirkannya sebagai sesi putus
     membuang pesan yang justru harus dibaca orangnya. */
  function kirim(jalur, isi, tanpaSesi) {
    var opsi = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(isi || {})
    };
    var t = tanpaSesi ? null : token();
    if (t) opsi.headers['Authorization'] = 'Bearer ' + t;
    return fetch(API + '/api/v1' + jalur, opsi).then(function (r) {
      if (r.status === 401 && !tanpaSesi) { sesiPutus(); throw new Error('sesi berakhir'); }
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
        id: r.nomor, uuid: r.id, kategori: r.kategori, lokasi: r.area, isi: r.isi,
        pelapor: r.pelapor || 'Anonim', waktu: sejak(r.dibuat_pada),
        status: r.status, risiko: r.risiko,
        areaId: r.area_id, milikSaya: r.milik_saya === true,
        dibuatIso: r.dibuat_pada, anonim: r.anonim === true
      };
    },
    insiden: function (r) {
      return {
        id: r.nomor, uuid: r.id, jenis: r.jenis, keparahan: r.keparahan, lokasi: r.area,
        tanggal: r.tanggal, waktu: (r.waktu || '').slice(0, 5),
        pelapor: r.pelapor || 'Anonim', status: r.status,
        terlambat: false, ringkas: r.ringkas,
        kronologi: r.kronologi || '', dampak: r.dampak || '', akar: r.akar || '',
        capa: r.capa_terbuka > 0 ? (r.capa_terbuka + ' terbuka') : '—',
        areaId: r.area_id, milikSaya: r.milik_saya === true, tanggalIso: r.tanggal,
        cedera: r.cedera || '', hariHilang: Number(r.hari_kerja_hilang) || 0
      };
    },
    capa: function (r) {
      return {
        id: r.nomor, uuid: r.id, judul: r.judul, sumber: r.sumber_nomor, sumberJenis: r.sumber_jenis,
        pj: r.pj, pjId: r.pj_id, adaBukti: r.ada_bukti === true, terbit: tanggalPanjang(r.terbit), tenggat: tanggalPanjang(r.tenggat),
        umur: Number(r.umur),
        status: r.status, prioritas: r.prioritas, terlambat: r.terlambat === true,
        milikSaya: r.milik_saya === true, tenggatIso: r.tenggat, pabrikId: r.pabrik_id,
        terbitIso: r.terbit, verifIso: r.diverifikasi_pada || ''
      };
    },
    izin: function (r) {
      return {
        id: r.nomor, uuid: r.id, jenis: r.jenis_nama, ikon: ikonIzin(r.jenis), judul: r.judul,
        pelaksana: r.pelaksana, vendor: r.vendor === true, pekerja: Number(r.pekerja),
        pengawas: r.pengawas,
        mulai: [tanggalPanjang(r.mulai), r.durasi].filter(Boolean).join(' \u00b7 '),
        status: r.status, zona: r.zona || '\u2014',
        risikoAwal: angka(r.risiko_awal), risikoSisa: angka(r.risiko_sisa),
        prasyarat: r.prasyarat || [],
        milikSaya: r.milik_saya === true, mulaiIso: r.mulai || '', durasi: r.durasi || '',
        dibuatIso: r.dibuat_pada || ''
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
        catatan: r.catatan, tindakan: r.tindakan || '', tanggalIso: r.tanggal
      };
    },
    jsa: function (r) {
      return {
        id: r.nomor, uuid: r.id, penyusunId: r.penyusun_id,
        areaId: r.area_id, milikSaya: r.milik_saya === true,
        pekerjaan: r.pekerjaan, area: r.area, jenis: r.jenis,
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
        status: r.status, jadwal: r.jadwal, tanggalIso: r.tanggal
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
        id: r.nomor, uuid: r.id, standar: r.standar, lingkup: r.lingkup, auditor: r.auditor,
        tanggal: rentangTanggal(r.mulai, r.selesai), status: r.status,
        temuan: { major: Number(r.major), minor: Number(r.minor), obs: Number(r.obs) },
        mulaiIso: r.mulai
      };
    },
    temuanAudit: function (r) {
      return {
        id: r.nomor, uuid: r.id, audit: r.audit, klausul: r.klausul, kategori: r.kategori,
        isi: r.isi, pj: r.pj || '\u2014', tenggat: tanggalPanjang(r.tenggat), status: r.status
      };
    },
    risikoRegister: function (r) {
      return {
        id: r.nomor, proses: r.proses, ancaman: r.ancaman, penyebab: r.penyebab, dampak: r.dampak,
        L: Number(r.kemungkinan), S: Number(r.keparahan),
        sisaL: Number(r.kemungkinan_sisa), sisaS: Number(r.keparahan_sisa),
        opsi: r.opsi, mitigasi: r.mitigasi, pj: r.pj || '\u2014',
        target: tanggalPanjang(r.target), reviu: tanggalPanjang(r.reviu), status: r.status,
        reviuIso: r.reviu || ''
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
        durasi: Number(r.durasi_jam), foto: r.foto || '', tanggalIso: r.tanggal
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
                     ambang: v.ambang, ok: v.memenuhi === true, uuid: v.id };
          })
        };
      });
      return keluar;
    },
    pengguna: function (r) {
      return {
        /* Dikenali dengan uuid, bukan email: email boleh memuat tanda petik,
           dan penanda ini ikut masuk ke atribut HTML tombol aksi. */
        id: r.id, uuid: r.id, pabrikId: r.pabrik_id, adaSandi: r.ada_sandi === true,
        tautanSampai: r.tautan_berlaku_sampai || null,
        email: r.email, nama: r.nama, inisial: r.inisial, peran: r.peran_kode,
        lokasi: r.pabrik.replace(/^Pabrik /, ''), status: r.status,
        masuk: r.masuk_terakhir ? tanggalPanjang(r.masuk_terakhir) + ', ' + jam(r.masuk_terakhir) : '\u2014'
      };
    }
  };

  /*
   * Semua teks dari peladen di-escape di sini, satu kali, sebelum sampai ke
   * app.js.
   *
   * app.js merakit layar dari templat HTML dan menyisipkan nilai apa adanya —
   * wajar untuk purwarupa yang datanya ditulis sendiri. Dengan pengguna
   * sungguhan, isi laporan bahaya yang diketik operator akan dijalankan
   * sebagai kode di peramban QHSE Supervisor yang membukanya, dan token
   * sesinya dapat diambil. Menyisir ratusan templat satu per satu pasti ada
   * yang terlewat; menyaring di satu pintu yang dilewati seluruh data tidak.
   *
   * Aman dilakukan di sini karena PETA hanya menghasilkan teks polos, tidak
   * pernah HTML. Nilai yang sudah di-escape juga aman di dalam atribut, karena
   * tanda petiknya ikut di-escape.
   */
  function amanHtml(x) {
    if (typeof x === 'string') {
      return x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    if (Array.isArray(x)) return x.map(amanHtml);
    if (x && typeof x === 'object') {
      var o = {};
      for (var k in x) if (Object.prototype.hasOwnProperty.call(x, k)) o[k] = amanHtml(x[k]);
      return o;
    }
    return x;
  }

  /* Koleksi yang dapat diubah dari rinciannya membawa penanda catatan (uuid)
     dan baris peladen apa adanya (mentah) — formulir ubah membaca nama kolom
     peladen dari sana, bukan nama purwarupa yang sudah diformat untuk layar
     ("18 Sep 2026", "—"). Ikut di-escape bersama bidang lainnya. */
  ['observasi', 'observasiAPD', 'inspeksi', 'checklistHarian', 'hiradc', 'risikoRegister', 'induksi',
   'regulasi', 'kegiatan', 'pelatihan', 'dokInternal', 'dokEksternal', 'audit'].forEach(function (k) {
    var asli = PETA[k];
    PETA[k] = function (r) {
      var o = asli(r);
      o.uuid = r.id;
      o.milikSaya = r.milik_saya === true;
      o.mentah = r;
      return o;
    };
  });

  Object.keys(PETA).forEach(function (k) {
    var asli = PETA[k];
    PETA[k] = function (r) { return amanHtml(asli(r)); };
  });

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
     Aksi pada rincian catatan

     Di sinilah aturan bisnis benar-benar menggigit: penerbitan izin (AB-09,
     AB-10, AB-11), penutupan kejadian (AB-03), verifikasi CAPA (AB-17), dan
     penutupan audit (AB-18). Purwarupa tidak punya tombolnya karena tidak ada
     yang dapat ditolaknya.

     Tombol hanya muncul bila TIGA hal terpenuhi: aplikasi tersambung ke
     peladen, peran pengguna berwenang, dan status catatannya memang menunggu
     tindakan itu. Tombol yang muncul lalu ditolak setiap kali ditekan
     mengajari orang untuk mengabaikan penolakan.
     ───────────────────────────────────────────────────────────────── */

  var AKSI = {
    bahaya: [{
      kunci: 'verifikasi', label: 'Verifikasi Laporan', modul: 'hazard', wewenang: 'verifikasi',
      bila: function (r) { return r.status === 'Terbuka'; },
      jalur: function (r) { return '/bahaya/' + r.uuid + '/verifikasi'; },
      koleksi: ['bahaya']
    }],
    insiden: [{
      kunci: 'tutup', label: 'Tutup Kejadian', modul: 'incident', wewenang: 'verifikasi',
      bila: function (r) { return r.status !== 'Selesai'; },
      jalur: function (r) { return '/insiden/' + r.uuid + '/tutup'; },
      koleksi: ['insiden', 'capa']
    }],
    capa: [{
      kunci: 'verifikasi', label: 'Verifikasi CAPA', modul: 'capa', wewenang: 'verifikasi',
      bila: function (r) { return r.status !== 'Selesai'; },
      jalur: function (r) { return '/capa/' + r.uuid + '/verifikasi'; },
      /* Penanggung jawab tidak boleh menutup CAPA-nya sendiri (AB-17).
         Tombolnya tidak ditawarkan kepadanya, bukan ditawarkan lalu ditolak. */
      kecuali: function (r) {
        var saya = window.KG_SAYA ? window.KG_SAYA.id : null;
        return !!saya && r.pjId === saya;
      },
      /* Bukti wajib ada sebelum CAPA ditutup. Bila catatannya belum punya,
         ia diminta di sini — bukan dibiarkan ditolak peladen tanpa
         penjelasan. */
      tanya: function (r) {
        return r.adaBukti ? null : { kunci: 'bukti', label: 'Bukti penyelesaian' };
      },
      koleksi: ['capa', 'insiden']
    }],
    izin: [{
      kunci: 'terbitkan', label: 'Terbitkan Izin', modul: 'permit', wewenang: 'verifikasi',
      bila: function (r) { return r.status !== 'Aktif' && r.status !== 'Selesai' && r.status !== 'Ditolak'; },
      jalur: function (r) { return '/izin/' + r.uuid + '/terbitkan'; },
      koleksi: ['izin']
    }],
    jsa: [{
      kunci: 'sahkan', label: 'Sahkan JSA', modul: 'jsa', wewenang: 'verifikasi',
      bila: function (r) { return r.status !== 'Disahkan'; },
      /* Penyusun tidak mengesahkan JSA-nya sendiri (AB-17), dan izin kerja
         bersandar pada pengesahan itu (AB-09). */
      kecuali: function (r) {
        var saya = window.KG_SAYA ? window.KG_SAYA.id : null;
        return !!saya && r.penyusunId === saya;
      },
      jalur: function (r) { return '/jsa/' + r.uuid + '/sahkan'; },
      koleksi: ['jsa', 'izin']
    }],
    audit: [{
      kunci: 'tutup', label: 'Tutup Audit', modul: 'audit', wewenang: 'verifikasi',
      bila: function (r) { return r.status !== 'Selesai'; },
      jalur: function (r) { return '/audit/' + r.uuid + '/tutup'; },
      koleksi: ['audit', 'temuanAudit']
    }],

    /* Akun. Administrator tidak pernah menentukan sandi siapa pun: yang ia
       buat hanya tautan, dan pemilik akun menyetel sandinya sendiri. */
    pengguna: [{
      kunci: 'ubah', label: 'Ubah', gaya: 'secondary', modul: 'users', wewenang: 'kelola',
      bila: function (r) { return r.status !== 'Nonaktif'; },
      buka: function (r) { formulirUbahPengguna(r); }
    }, {
      kunci: 'tautan', gaya: 'secondary', modul: 'users', wewenang: 'kelola',
      label: function (r) { return r.adaSandi ? 'Atur Ulang Sandi' : 'Kirim Ulang Undangan'; },
      bila: function (r) { return r.status !== 'Nonaktif'; },
      jalur: function (r) { return '/pengguna/' + r.uuid + '/tautan'; },
      koleksi: ['pengguna'],
      hasil: function (d) { tampilkanTautan(d); return ''; }
    }, {
      kunci: 'nonaktifkan', label: 'Nonaktifkan', gaya: 'danger', modul: 'users', wewenang: 'kelola',
      bila: function (r) { return r.status === 'Aktif'; },
      /* Menonaktifkan diri sendiri ditolak peladen; tombolnya tidak ditawarkan. */
      kecuali: function (r) { return !!window.KG_SAYA && r.uuid === window.KG_SAYA.id; },
      jalur: function (r) { return '/pengguna/' + r.uuid + '/status'; },
      isi: function () { return { status: 'Nonaktif' }; },
      koleksi: ['pengguna'],
      hasil: function (d) { return (d.email || 'Akun') + ' dinonaktifkan. Seluruh sesinya sudah diputus.'; }
    }, {
      kunci: 'aktifkan', label: 'Aktifkan Kembali', modul: 'users', wewenang: 'kelola',
      /* Akun yang belum pernah menyetel sandi diaktifkan lewat undangan,
         bukan tombol ini — Aktif tanpa sandi adalah akun yang tak bisa dipakai. */
      bila: function (r) { return r.status === 'Nonaktif' && r.adaSandi; },
      jalur: function (r) { return '/pengguna/' + r.uuid + '/status'; },
      isi: function () { return { status: 'Aktif' }; },
      koleksi: ['pengguna'],
      hasil: function (d) { return (d.email || 'Akun') + ' aktif kembali.'; }
    }]
  };

  /* ─────────────────────────────────────────────────────────────────
     Ubah dan hapus catatan K3

     Status yang membuka keduanya sama dengan yang ditegakkan peladen
     (api/src/Modul/Catatan.php). Catatan yang sudah diverifikasi, ditutup,
     diterbitkan, atau disahkan tidak menawarkan tombolnya sama sekali.
     ───────────────────────────────────────────────────────────────── */

  var CATATAN = {
    bahaya:  { modul: 'hazard',   nama: 'Laporan bahaya', ubah: ['Terbuka'], hapus: ['Terbuka'],
               segarkan: ['bahaya'] },
    insiden: { modul: 'incident', nama: 'Kejadian',
               ubah: ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'],
               hapus: ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'], segarkan: ['insiden', 'capa'] },
    capa:    { modul: 'capa',     nama: 'CAPA',
               ubah: ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'],
               hapus: ['Terbuka', 'Dalam Proses', 'Menunggu Verifikasi'], segarkan: ['capa', 'insiden'] },
    izin:    { modul: 'permit',   nama: 'Izin kerja', ubah: ['Menunggu Supervisor', 'Menunggu QHSE'],
               hapus: ['Menunggu Supervisor', 'Menunggu QHSE', 'Ditolak'], segarkan: ['izin', 'jsa'] },
    jsa:     { modul: 'jsa',      nama: 'JSA', ubah: ['Draf', 'Menunggu Pengesahan'],
               hapus: ['Draf', 'Menunggu Pengesahan'], segarkan: ['jsa', 'izin'] },

    /* Modul lainnya. ubah/hapus null: tidak berstatus, selalu dapat.
       ubahMin/hapusMin: daftar bersama tanpa pemilik — siapa pun yang
       berwenang mengisi modulnya. Sama dengan peladen (Catatan::LAINNYA). */
    observasi: { modul: 'bbs', nama: 'Observasi perilaku', ubah: null, hapus: null, segarkan: ['observasi'] },
    apd:       { modul: 'bbs', nama: 'Observasi APD', jalur: 'observasi-apd', ubah: null, hapus: null,
                 segarkan: ['observasiAPD'] },
    inspeksi:  { modul: 'inspection', nama: 'Inspeksi', ubah: ['Terbuka', 'Dalam Proses'],
                 hapus: ['Terbuka', 'Dalam Proses'], segarkan: ['inspeksi'] },
    checklist: { modul: 'checklist', nama: 'Checklist', ubah: ['Terbuka', 'Dalam Proses'],
                 hapus: ['Terbuka', 'Dalam Proses'], segarkan: ['checklistHarian'] },
    hiradc:    { modul: 'hiradc', nama: 'Baris HIRADC', ubahMin: 'isi', ubah: ['Terbuka', 'Dalam Proses'],
                 hapus: ['Terbuka', 'Dalam Proses'], segarkan: ['hiradc'] },
    risiko:    { modul: 'risk', nama: 'Risiko', ubahMin: 'isi', ubah: ['Terbuka', 'Dalam Proses'],
                 hapus: ['Terbuka', 'Dalam Proses'], segarkan: ['risikoRegister'] },
    induksi:   { modul: 'induksi', nama: 'Induksi', ubahMin: 'isi', hapusMin: 'isi', ubah: null, hapus: null,
                 segarkan: ['induksi'] },
    regulasi:  { modul: 'regulasi', nama: 'Peraturan', ubahMin: 'isi', hapusMin: 'isi', ubah: null, hapus: null,
                 segarkan: ['regulasi'] },
    kegiatan:  { modul: 'activity', nama: 'Kegiatan', ubahMin: 'isi', hapusMin: 'isi', ubah: null, hapus: null,
                 segarkan: ['kegiatan'] },
    pelatihan: { modul: 'training', nama: 'Program pelatihan', ubahMin: 'isi', hapusMin: 'isi', ubah: null, hapus: null,
                 segarkan: ['pelatihan'] },
    dokint:    { modul: 'docint', nama: 'Dokumen', jalur: 'dokumen/internal', ubahMin: 'isi', hapusMin: 'isi',
                 ubah: null, hapus: null, segarkan: ['dokInternal'] },
    dokext:    { modul: 'docext', nama: 'Dokumen kepatuhan', jalur: 'dokumen/eksternal', ubahMin: 'isi', hapusMin: 'isi',
                 ubah: null, hapus: null, segarkan: ['dokEksternal'] },
    audit:     { modul: 'audit', nama: 'Audit', ubahMin: 'isi', hapusMin: 'isi', ubah: ['Terbuka', 'Dalam Proses'],
                 hapus: ['Terbuka', 'Dalam Proses'], segarkan: ['audit', 'temuanAudit'] }
  };

  /* Verifikator modulnya, atau pembuat catatan yang masih berwenang mengisi.
     Laporan anonim tidak pernah "milik saya" — peladen tidak tahu pengirimnya. */
  function bolehUbahCatatan(jenis, r) {
    var c = CATATAN[jenis];
    if (c.ubah && c.ubah.indexOf(r.status) === -1) return false;
    if (c.ubahMin) return berwenang(c.modul, c.ubahMin);
    return berwenang(c.modul, 'verifikasi') || (r.milikSaya === true && berwenang(c.modul, 'isi'));
  }

  Object.keys(CATATAN).forEach(function (jenis) {
    var c = CATATAN[jenis];
    AKSI[jenis] = [{
      kunci: 'hapus', label: 'Hapus', gaya: 'secondary', modul: c.modul, wewenang: c.hapusMin || 'verifikasi',
      bila: function (r) { return !c.hapus || c.hapus.indexOf(r.status) !== -1; },
      buka: function (r) { formulirHapusCatatan(jenis, r); }
    }, {
      kunci: 'ubah', label: 'Ubah', gaya: 'secondary', modul: c.modul, wewenang: 'isi',
      bila: function (r) { return bolehUbahCatatan(jenis, r); },
      buka: function (r) { formulirUbahCatatan(jenis, r); }
    }].concat(AKSI[jenis] || []);
  });

  /* ─────────────────────────────────────────────────────────────────
     Ubin angka ringkasan

     Purwarupa menulis angka pada ubin di kepala layar sebagai teks tetap —
     "87 laporan bulan ini", "CAPA aktif 8". Saat tersambung, angka itu
     dihitung dari catatan yang sudah dimuat. Yang belum punya sumber data
     sungguhan tampil "—" dengan keterangan, TIDAK PERNAH angka contoh:
     angka contoh yang tampak seperti angka sungguhan adalah kegagalan yang
     paling mahal pada sistem K3.

     Kunci: "<layar>|<LABEL UBIN>". Ubin yang sejak purwarupa dihitung dari
     koleksi (jumlah dokumen, jumlah JSA, …) tidak terdaftar di sini dan
     tidak disentuh.
     ───────────────────────────────────────────────────────────────── */

  var BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
                       'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function ubinBulan(geser) {
    var d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + (geser || 0));
    return { th: d.getFullYear(), bl: d.getMonth(), nama: BULAN_PANJANG[d.getMonth()] };
  }
  function diBulan(iso, b) {
    var d = tanggal(iso);
    return !!d && d.getFullYear() === b.th && d.getMonth() === b.bl;
  }
  function diTahun(iso) {
    var d = tanggal(iso);
    return !!d && d.getFullYear() === new Date().getFullYear();
  }
  function hariSejak(iso) {
    var d = tanggal(iso);
    return d ? Math.floor((Date.now() - d.getTime()) / 86400000) : null;
  }
  function koma(n, desimal) {
    return Number(n).toFixed(desimal).replace('.', ',');
  }
  /* "2 vs September" — selisih mutlak, arah ditentukan pemanggil. */
  function selisih(kini, lalu, namaLalu) {
    var d = Math.abs(kini - lalu);
    return d === 0 ? 'sama dengan ' + namaLalu : (Number.isInteger(d) ? d : koma(d, 1)) + ' vs ' + namaLalu;
  }
  function daftarKG(nama) { return (window.KG && window.KG[nama]) || []; }
  function jumlahPekerja() {
    return ((ACUAN && ACUAN.pabrik) || []).reduce(function (a, p) { return a + Number(p.jumlah_pekerja || 0); }, 0);
  }
  function belumAda(alasan) {
    return { value: '—', unit: '', arah: 'flat', delta: 'belum dihitung', note: alasan };
  }

  var UBIN = {
    /* ── Insiden ── */
    'incident|BULAN INI': function () {
      var L = daftarKG('insiden'), b = ubinBulan(0), l = ubinBulan(-1);
      var ini = L.filter(function (x) { return diBulan(x.tanggalIso, b); });
      var lalu = L.filter(function (x) { return diBulan(x.tanggalIso, l); }).length;
      var hit = function (j) { return ini.filter(function (x) { return x.jenis === j; }).length; };
      return { value: String(ini.length), arah: ini.length <= lalu ? 'good' : 'bad',
        delta: selisih(ini.length, lalu, l.nama),
        note: hit('Accident') + ' accident · ' + hit('Incident') + ' incident · ' + hit('Nearmiss') + ' nearmiss' };
    },
    'incident|BELUM SELESAI': function () {
      var L = daftarKG('insiden').filter(function (x) { return x.status !== 'Selesai'; });
      var tua = L.slice().sort(function (a, c) { return a.tanggalIso < c.tanggalIso ? -1 : 1; })[0];
      return { value: String(L.length), arah: L.length ? 'bad' : 'good',
        delta: L.filter(function (x) { return x.status === 'Menunggu Verifikasi'; }).length + ' menunggu verifikasi',
        note: tua ? 'Tertua: ' + tua.id + ', ' + hariSejak(tua.tanggalIso) + ' hari' : 'Tidak ada kejadian terbuka' };
    },
    'incident|HARI KERJA HILANG': function () {
      var L = daftarKG('insiden'), b = ubinBulan(0), l = ubinBulan(-1);
      var jum = function (f) { return L.filter(f).reduce(function (a, x) { return a + (x.hariHilang || 0); }, 0); };
      var ini = jum(function (x) { return diBulan(x.tanggalIso, b); });
      var lalu = jum(function (x) { return diBulan(x.tanggalIso, l); });
      return { value: String(ini), unit: 'hari', arah: ini <= lalu ? 'good' : 'bad',
        delta: selisih(ini, lalu, l.nama),
        note: 'Akumulasi ' + b.th + ': ' + jum(function (x) { return diTahun(x.tanggalIso); }) + ' hari' };
    },
    'incident|RASIO NEARMISS': function () {
      var L = daftarKG('insiden').filter(function (x) { return diTahun(x.tanggalIso); });
      var nm = L.filter(function (x) { return x.jenis === 'Nearmiss'; }).length;
      var ac = L.length - nm;
      if (!ac) return { value: nm ? String(nm) : '—', unit: nm ? ':0' : '', arah: 'flat',
        delta: 'tahun berjalan', note: 'Belum ada incident/accident tahun ini · nearmiss ' + nm };
      return { value: koma(nm / ac, 1), unit: ':1', arah: 'flat', delta: 'tahun berjalan',
        note: 'Nearmiss per incident/accident · makin tinggi makin baik' };
    },

    /* ── Inspeksi ── */
    'inspection|TERJADWAL BULAN INI': function () {
      var b = ubinBulan(0), l = ubinBulan(-1), L = daftarKG('inspeksi');
      var ini = L.filter(function (x) { return diBulan(x.tanggalIso, b); });
      var lalu = L.filter(function (x) { return diBulan(x.tanggalIso, l); }).length;
      var jenis = {}; ini.forEach(function (x) { jenis[x.jenis] = 1; });
      return { value: String(ini.length), arah: 'flat', delta: selisih(ini.length, lalu, l.nama),
        note: Object.keys(jenis).length + ' jenis inspeksi' };
    },
    'inspection|PENYELESAIAN': function () {
      var b = ubinBulan(0), ini = daftarKG('inspeksi').filter(function (x) { return diBulan(x.tanggalIso, b); });
      if (!ini.length) return belumAda('Belum ada inspeksi terjadwal bulan ini');
      var s = ini.filter(function (x) { return x.status === 'Selesai'; }).length;
      var p = Math.round(s * 100 / ini.length);
      return { value: String(p), unit: '%', arah: p >= 95 ? 'good' : 'bad', delta: 'bulan berjalan',
        note: 'Selesai ' + s + ' dari ' + ini.length + ' · target ≥ 95% · Leading' };
    },
    'inspection|TEMUAN TERBUKA': function () {
      var L = daftarKG('inspeksi').filter(function (x) { return x.status !== 'Selesai'; });
      var t = L.reduce(function (a, x) { return a + (x.temuan || 0); }, 0);
      return { value: String(t), arah: t ? 'bad' : 'good', delta: 'pada ' + L.length + ' inspeksi belum selesai',
        note: 'Butir yang dijawab Tidak Sesuai' };
    },
    'inspection|RATA-RATA PENUTUPAN': function () { return belumAda('Tanggal penutupan temuan belum dicatat sistem'); },

    /* ── Izin kerja ── */
    'permit|IZIN AKTIF HARI INI': function () {
      var L = daftarKG('izin').filter(function (x) { return x.status === 'Aktif'; });
      return { value: String(L.length), arah: 'flat',
        delta: L.length ? L.slice(0, 2).map(function (x) { return x.jenis; }).join(' · ') : 'tidak ada',
        note: 'Izin berstatus Aktif' };
    },
    'permit|MENUNGGU PERSETUJUAN': function () {
      var L = daftarKG('izin').filter(function (x) { return /^Menunggu/.test(x.status); });
      var tua = L.map(function (x) { return tanggal(x.dibuatIso); }).filter(Boolean)
        .sort(function (a, c) { return a - c; })[0];
      var jamTua = tua ? Math.round((Date.now() - tua.getTime()) / 3600000) : 0;
      return { value: String(L.length), arah: L.length ? 'bad' : 'good',
        delta: L.length ? 'tertua ' + jamTua + ' jam' : 'tidak ada antrean',
        note: 'Eskalasi otomatis setelah 24 jam' };
    },
    'permit|PEKERJAAN VENDOR': function () {
      var L = daftarKG('izin'), b = ubinBulan(0);
      var bln = L.filter(function (x) { return diBulan(x.dibuatIso, b); });
      return { value: String(bln.filter(function (x) { return x.vendor; }).length), arah: 'flat',
        delta: 'dari ' + bln.length + ' izin bulan ini', note: 'Induksi K3 & asuransi diverifikasi terpisah' };
    },
    'permit|DITOLAK ZONA EKSTREM': function () {
      var L = daftarKG('izin').filter(function (x) { return x.zona === 'Ekstrem' && x.status !== 'Aktif' && x.status !== 'Selesai'; });
      return { value: String(L.length), arah: L.length ? 'bad' : 'good', delta: 'tertahan saat ini',
        note: 'Risiko sisa ≥ 15 menutup penerbitan' };
    },

    /* ── Laporan bahaya ── */
    'hazard|LAPORAN BULAN INI': function () {
      var L = daftarKG('bahaya'), b = ubinBulan(0), l = ubinBulan(-1);
      var ini = L.filter(function (x) { return diBulan(x.dibuatIso, b); }).length;
      var lalu = L.filter(function (x) { return diBulan(x.dibuatIso, l); }).length;
      return { value: String(ini), unit: '/bln', arah: ini >= lalu ? 'good' : 'bad',
        delta: selisih(ini, lalu, l.nama), note: 'Naik itu baik · Leading indicator utama' };
    },
    'hazard|PER PEKERJA': function () {
      var n = jumlahPekerja(), b = ubinBulan(0);
      if (!n) return belumAda('Jumlah pekerja pabrik belum diisi');
      var ini = daftarKG('bahaya').filter(function (x) { return diBulan(x.dibuatIso, b); }).length;
      var v = ini / n;
      return { value: koma(v, 2), arah: v >= 0.25 ? 'good' : 'bad', delta: 'bulan berjalan',
        note: n.toLocaleString('id-ID') + ' pekerja · target ≥ 0,25' };
    },
    'hazard|BELUM DIVERIFIKASI': function () {
      var L = daftarKG('bahaya').filter(function (x) { return x.status === 'Terbuka'; });
      var tua = L.map(function (x) { return tanggal(x.dibuatIso); }).filter(Boolean)
        .sort(function (a, c) { return a - c; })[0];
      return { value: String(L.length), arah: L.length ? 'bad' : 'good',
        delta: tua ? 'tertua ' + Math.round((Date.now() - tua.getTime()) / 3600000) + ' jam' : 'tidak ada antrean',
        note: 'Target verifikasi dalam 8 jam kerja' };
    },
    'hazard|LAPORAN ANONIM': function () {
      var b = ubinBulan(0), L = daftarKG('bahaya').filter(function (x) { return diBulan(x.dibuatIso, b); });
      if (!L.length) return belumAda('Belum ada laporan bulan ini');
      var a = L.filter(function (x) { return x.anonim; }).length;
      return { value: String(Math.round(a * 100 / L.length)), unit: '%', arah: 'flat',
        delta: a + ' dari ' + L.length + ' laporan', note: 'Kanal anonim dipertahankan apa pun angkanya' };
    },

    /* ── Audit ── */
    'audit|AUDIT TAHUN INI': function () {
      var L = daftarKG('audit').filter(function (x) { return diTahun(x.mulaiIso); });
      var s = L.filter(function (x) { return x.status === 'Selesai'; }).length;
      return { value: String(L.length), arah: 'flat', delta: s + ' selesai · ' + (L.length - s) + ' berjalan',
        note: 'Audit yang dimulai tahun ini' };
    },
    'audit|TEMUAN MAJOR': function () {
      var L = daftarKG('temuanAudit').filter(function (x) { return x.kategori === 'Major'; });
      var buka = L.filter(function (x) { return x.status !== 'Selesai'; }).length;
      return { value: String(L.length), arah: buka ? 'bad' : 'good', delta: buka + ' masih terbuka',
        note: 'Setiap temuan Major wajib ber-CAPA' };
    },
    'audit|TEMUAN MINOR': function () {
      var L = daftarKG('temuanAudit').filter(function (x) { return x.kategori === 'Minor'; });
      var buka = L.filter(function (x) { return x.status !== 'Selesai'; }).length;
      return { value: String(L.length), arah: buka ? 'bad' : 'good', delta: buka + ' masih terbuka',
        note: 'Seluruh audit dalam cakupan Anda' };
    },
    'audit|KRITERIA SMK3': function () { return belumAda('Penilaian elemen SMK3 belum diisi di sistem'); },

    /* ── Lingkungan ── */
    'environment|PARAMETER DIPANTAU': function () {
      var o = (window.KG && window.KG.lingkungan) || {}, n = 0, per = [];
      Object.keys(o).forEach(function (k) { var c = (o[k].param || []).length; n += c; per.push(k.toUpperCase() + ' ' + c); });
      if (!n) return belumAda('Belum ada hasil uji yang tercatat');
      return { value: String(n), arah: 'flat', delta: Object.keys(o).length + ' domain lingkungan', note: per.join(' · ') };
    },
    'environment|MELEWATI AMBANG': function () {
      var o = (window.KG && window.KG.lingkungan) || {}, lewat = [];
      Object.keys(o).forEach(function (k) {
        (o[k].param || []).forEach(function (v) { if (!v.ok) lewat.push(v); });
      });
      if (!Object.keys(o).length) return belumAda('Belum ada hasil uji yang tercatat');
      return { value: String(lewat.length), arah: lewat.length ? 'bad' : 'good',
        delta: lewat.length ? lewat[0].nama : 'seluruhnya memenuhi baku mutu',
        note: lewat.length ? lewat[0].nilai + ' ' + lewat[0].satuan + ' terhadap ambang ' + lewat[0].ambang : 'Hasil uji terakhir tiap domain' };
    },
    'environment|MASA SIMPAN TERPENDEK': function () { return belumAda('Neraca limbah B3 di TPS belum dicatat sistem'); },
    'environment|LIMBAH DIDAUR ULANG': function () { return belumAda('Timbulan limbah non-B3 belum dicatat sistem'); },

    /* ── Kegiatan SHE ── */
    'activity|KEGIATAN BULAN INI': function () {
      var L = daftarKG('kegiatan'), b = ubinBulan(0), l = ubinBulan(-1);
      var ini = L.filter(function (x) { return diBulan(x.tanggalIso, b); });
      var lalu = L.filter(function (x) { return diBulan(x.tanggalIso, l); }).length;
      var j = {}; ini.forEach(function (x) { j[x.jenis] = 1; });
      return { value: String(ini.length), arah: 'flat', delta: selisih(ini.length, lalu, l.nama),
        note: Object.keys(j).join(', ') || 'Belum ada kegiatan bulan ini' };
    },
    'activity|PESERTA UNIK': function () { return belumAda('Daftar hadir per nama belum dicatat sistem'); },
    'activity|RAPAT P2K3': function () {
      var b = ubinBulan(0), n = daftarKG('kegiatan').filter(function (x) {
        return x.jenis === 'Rapat P2K3' && diBulan(x.tanggalIso, b);
      }).length;
      return { value: String(n), arah: n ? 'good' : 'bad', delta: n ? 'sudah terisi' : 'wajib bulanan · belum terisi',
        note: 'Regulasi mewajibkan rapat P2K3 setiap bulan' };
    },

    /* ── CAPA ── */
    'capa|CAPA AKTIF': function () {
      var L = daftarKG('capa').filter(function (x) { return x.status !== 'Selesai'; });
      var per = {}; L.forEach(function (x) { per[x.sumberJenis] = (per[x.sumberJenis] || 0) + 1; });
      return { value: String(L.length), arah: 'flat',
        delta: Object.keys(per).map(function (k) { return per[k] + ' dari ' + k.toLowerCase(); }).join(' · ') || 'tidak ada',
        note: 'Tidak termasuk yang sudah Selesai' };
    },
    'capa|LEWAT TENGGAT': function () {
      var L = daftarKG('capa').filter(function (x) { return x.terlambat; });
      var tua = L.map(function (x) { return hariSejak(x.tenggatIso); }).sort(function (a, c) { return c - a; })[0];
      return { value: String(L.length), arah: L.length ? 'bad' : 'good',
        delta: L.length ? 'tertua ' + tua + ' hari lewat' : 'tidak ada', note: 'Naik otomatis ke Dashboard sebagai kritis' };
    },
    'capa|RATA-RATA UMUR': function () {
      var L = daftarKG('capa').filter(function (x) { return x.status !== 'Selesai'; });
      if (!L.length) return belumAda('Tidak ada CAPA aktif');
      var r = L.reduce(function (a, x) { return a + (x.umur || 0); }, 0) / L.length;
      return { value: String(Math.round(r)), unit: 'hari', arah: r <= 14 ? 'good' : 'bad',
        delta: 'dari ' + L.length + ' CAPA aktif', note: 'Dihitung dari tanggal terbit' };
    },
    'capa|TEPAT WAKTU': function () {
      var L = daftarKG('capa').filter(function (x) { return x.status === 'Selesai' && x.verifIso; });
      if (!L.length) return belumAda('Belum ada CAPA yang selesai');
      var t = L.filter(function (x) { return x.verifIso.slice(0, 10) <= x.tenggatIso; }).length;
      var p = Math.round(t * 100 / L.length);
      return { value: String(p), unit: '%', arah: p >= 90 ? 'good' : 'bad', delta: 'seluruh CAPA selesai',
        note: t + ' dari ' + L.length + ' CAPA selesai sebelum tenggat · Leading' };
    },

    /* ── Dashboard eksekutif ── */
    'exec|TRIR GRUP': function () {
      var P = daftarKG('pabrikKinerja'), jam = 0, bobot = 0;
      P.forEach(function (p) {
        var mh = Number(String(p.manhours).replace(/\./g, '')) || 0, t = Number(String(p.trir).replace(',', '.'));
        if (mh && !isNaN(t)) { jam += mh; bobot += t * mh; }
      });
      if (!jam) return belumAda('Jam kerja bulanan belum diisi');
      var v = bobot / jam;
      return { value: koma(v, 2), arah: v <= 0.5 ? 'good' : 'bad', delta: 'bulan berjalan',
        note: '(TRC × 200.000) ÷ jam kerja · target ≤ 0,50', periode: 'Bulan berjalan · seluruh grup' };
    },
    'exec|LTIFR GRUP': function () {
      var P = daftarKG('pabrikKinerja'), jam = 0, bobot = 0;
      P.forEach(function (p) {
        var mh = Number(String(p.manhours).replace(/\./g, '')) || 0, t = Number(String(p.ltifr).replace(',', '.'));
        if (mh && !isNaN(t)) { jam += mh; bobot += t * mh; }
      });
      if (!jam) return belumAda('Jam kerja bulanan belum diisi');
      var v = bobot / jam;
      return { value: koma(v, 2), arah: v <= 2 ? 'good' : 'bad', delta: 'bulan berjalan',
        note: '(LTI × 1.000.000) ÷ jam kerja · target ≤ 2,00', periode: 'Bulan berjalan · seluruh grup' };
    },
    'exec|PABRIK NIHIL LTI': function () {
      var P = daftarKG('pabrikKinerja').filter(function (p) { return p.ltifr !== '—'; });
      if (!P.length) return belumAda('Jam kerja bulanan belum diisi');
      var nihil = P.filter(function (p) { return Number(String(p.ltifr).replace(',', '.')) === 0; });
      var belum = P.filter(function (p) { return nihil.indexOf(p) === -1; }).map(function (p) { return p.nama; });
      return { value: String(nihil.length), unit: '/' + P.length, arah: belum.length ? 'bad' : 'good',
        delta: belum.length ? belum.join(', ') + ' belum nihil' : 'seluruhnya nihil',
        note: 'Bulan berjalan', periode: 'Bulan berjalan · seluruh grup' };
    },

    /* ── Pelatihan ── */
    'training|JAM PELATIHAN': function () { return belumAda('Lihat SHE KPI: jam pelatihan dihitung dari Kegiatan SHE'); },
    'training|SERTIFIKAT H-60': function () {
      var L = daftarKG('sertifikasi').filter(function (x) { return x.sisa <= 60; })
        .sort(function (a, c) { return a.sisa - c.sisa; });
      return { value: String(L.length), arah: L.length ? 'bad' : 'good',
        delta: L.length ? 'terdekat ' + L[0].sisa + ' hari lagi' : 'tidak ada',
        note: L.slice(0, 2).map(function (x) { return x.nama; }).join(' · ') || 'Sertifikasi yang berakhir dalam 60 hari' };
    },

    /* ── Risiko, checklist, observasi ── */
    'risk|REVIU BULAN INI': function () {
      var b = ubinBulan(0), L = daftarKG('risikoRegister').filter(function (x) { return diBulan(x.reviuIso, b); })
        .sort(function (a, c) { return a.reviuIso < c.reviuIso ? -1 : 1; });
      return { value: String(L.length), arah: L.length ? 'bad' : 'flat',
        delta: L.length ? 'terdekat ' + L[0].reviu : 'tidak ada', note: L.slice(0, 2).map(function (x) { return x.proses; }).join(' dan ') || 'Risiko yang jatuh tempo reviu bulan ini' };
    },
    'checklist|KEPATUHAN 30 HARI': function () { return belumAda('Riwayat checklist 30 hari belum dimuat layar ini'); },
    'bbs|OBSERVASI BULAN INI': function () {
      var b = ubinBulan(0), n = daftarKG('observasi').filter(function (x) { return diBulan(x.tanggalIso, b); }).length;
      return { value: String(n), arah: n >= 400 ? 'good' : 'bad', delta: 'target 400 per bulan', note: 'Naik itu baik · Leading indicator' };
    },
    'bbs|PENGAMAT AKTIF': function () {
      var b = ubinBulan(0), o = {};
      daftarKG('observasi').forEach(function (x) { if (diBulan(x.tanggalIso, b)) o[x.observer] = 1; });
      return { value: String(Object.keys(o).length), arah: 'flat', delta: 'bulan berjalan',
        note: 'Pengamat yang mencatat observasi bulan ini' };
    }
  };

  /* Angka pada menu samping: hal yang menunggu tindakan di modul itu. Sama
     dengan yang dihitung purwarupa — kejadian belum selesai, bahaya belum
     diverifikasi, CAPA lewat tenggat, dokumen berakhir ≤ 60 hari, regulasi
     belum terpenuhi, kartu induksi segera berakhir, pemberitahuan belum dibaca. */
  var MENU = {
    incident: function () { return daftarKG('insiden').filter(function (x) { return x.status !== 'Selesai'; }).length; },
    hazard:   function () { return daftarKG('bahaya').filter(function (x) { return x.status === 'Terbuka'; }).length; },
    capa:     function () { return daftarKG('capa').filter(function (x) { return x.terlambat; }).length; },
    docext:   function () { return daftarKG('dokEksternal').filter(function (x) { return x.sisa <= 60; }).length; },
    regulasi: function () { return daftarKG('regulasi').filter(function (x) { return x.status !== 'Terpenuhi'; }).length; },
    induksi:  function () {
      return daftarKG('induksi').filter(function (x) { return x.status === 'Segera Berakhir' || x.status === 'Kedaluwarsa'; }).length;
    },
    notif:    function () { return daftarKG('notifikasi').filter(function (x) { return !x.baca; }).length; }
  };

  function hitungMenu(id) {
    if (!MENU[id]) return 0;
    try { return MENU[id](); } catch (e) { return 0; }
  }

  /**
   * Ubin layar saat tersambung. Mode peragaan tidak pernah sampai ke sini.
   * Rincian dan catatan contoh pada modal ubin ikut dibuang: keduanya berisi
   * kalimat purwarupa tentang angka yang sudah tidak ada.
   */
  function ubin(layar, t) {
    if (!API) return t;
    var f = UBIN[layar + '|' + t.label];
    if (!f) return t;
    var h;
    try { h = f(); } catch (e) { h = null; }
    if (!h) h = belumAda('Angka ini belum dapat dihitung dari data.');
    return Object.assign({}, t, {
      value: h.value, unit: h.unit === undefined ? t.unit : h.unit, arah: h.arah,
      delta: h.delta, note: h.note, periode: h.periode,
      rincian: '', catatan: '', sumber: h.value === '—' ? '' : 'Dihitung dari catatan di basis data'
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     Buat CAPA dari sumbernya (AB-01)

     CAPA tidak pernah berdiri sendiri, jadi tidak ada tombol "CAPA baru"
     di layar CAPA. Ia dibuat dari rincian sumbernya, dan sumbernya terisi
     sendiri — orang tidak perlu menyalin nomor kejadian ke formulir.
     ───────────────────────────────────────────────────────────────── */

  var SUMBER_CAPA = {
    insiden:   { jenis: 'Insiden',    bila: function (r) { return r.status !== 'Selesai'; } },
    temuan:    { jenis: 'Audit',      bila: function (r) { return r.status !== 'Selesai'; } },
    inspeksi:  { jenis: 'Inspeksi',   bila: function () { return true; } },
    hiradc:    { jenis: 'HIRADC',     bila: function (r) { return r.status !== 'Selesai'; } },
    observasi: { jenis: 'Observasi',  bila: function (r) { return Number(r.berisiko) > 0; } },
    parameter: { jenis: 'Lingkungan', bila: function (r) { return !r.ok; } }
  };

  Object.keys(SUMBER_CAPA).forEach(function (jenis) {
    var s = SUMBER_CAPA[jenis];
    AKSI[jenis] = (AKSI[jenis] || []).concat([{
      kunci: 'capa', label: 'Buat CAPA', gaya: 'secondary', modul: 'capa', wewenang: 'isi',
      bila: s.bila,
      buka: function (r) { formulirCapa(s.jenis, r); }
    }]);
  });

  /* ── Isi hasil inspeksi dan checklist ── */
  var PERIKSA = {
    inspeksi:  { jalur: 'inspeksi',  modul: 'inspection', segarkan: ['inspeksi'] },
    checklist: { jalur: 'checklist', modul: 'checklist',  segarkan: ['checklistHarian'] }
  };

  Object.keys(PERIKSA).forEach(function (jenis) {
    var d = PERIKSA[jenis];
    AKSI[jenis] = (AKSI[jenis] || []).concat([{
      kunci: 'hasil', label: 'Isi Hasil', modul: d.modul, wewenang: 'isi',
      bila: function (r) { return r.status !== 'Selesai'; },
      buka: function (r) { formulirHasil(jenis, r); }
    }]);
  });

  function formulirHasil(jenis, r) {
    if (!window.KG_BUKA) return;
    ambil('/' + PERIKSA[jenis].jalur + '/' + r.uuid + '/butir').then(function (j) {
      var butir = j.data || [];
      var opsi = ['', 'Sesuai', 'Tidak Sesuai', 'Tidak Berlaku'];
      window.KG_BUKA({
        title: 'Isi Hasil ' + r.id, sub: (r.jenis || r.nama || '') + ' · ' + butir.length + ' butir',
        body: butir.map(function (b, i) {
          return '<div class="card" data-hasil="' + b.id + '" style="padding:var(--space-4);margin-bottom:var(--space-3)">'
            + '<div style="font-weight:600;margin-bottom:var(--space-3)">' + (i + 1) + '. ' + esc(b.butir) + '</div>'
            + '<div class="row2"><div class="field"><label>Jawaban</label><select data-h="jawab">' + opsi.map(function (o) {
                return '<option value="' + o + '"' + ((b.jawab || '') === o ? ' selected' : '') + '>' + (o || '— Belum dijawab —') + '</option>';
              }).join('') + '</select></div>'
            + '<div class="field"><label>Catatan / uraian temuan</label><input type="text" data-h="catatan" value="'
            + esc(b.catatan || '') + '"></div></div></div>';
        }).join('')
          + bidang('selesai', 'Simpan sebagai', '<select id="e-selesai"><option value="">Sementara — dilanjutkan nanti</option>'
            + '<option value="1">Selesai — seluruh butir sudah dijawab</option></select>', true)
          + catatanKaki('"Tidak Sesuai" wajib diuraikan. Setelah selesai, hasil tidak diubah lagi; temuan dijadikan CAPA dari rinciannya.'),
        ok: 'Simpan Hasil', aksi: 'hasil-periksa:' + jenis + ':' + r.uuid
      });
    }).catch(function (e) {
      if (window.KG_PESAN) window.KG_PESAN('Butir tidak dapat dimuat: ' + e.message);
    });
  }

  /* ── Temuan audit ── */
  AKSI.audit = (AKSI.audit || []).concat([{
    kunci: 'temuan', label: 'Tambah Temuan', gaya: 'secondary', modul: 'audit', wewenang: 'isi',
    bila: function (r) { return r.status !== 'Selesai'; },
    buka: function (r) {
      if (!window.KG_BUKA) return;
      var orang = ((ACUAN && ACUAN.penanggung_jawab) || []).map(function (o) { return [o.id, esc(o.nama)]; });
      window.KG_BUKA({
        title: 'Tambah Temuan', sub: r.id + ' · ' + r.standar,
        body: '<div class="row2">' + isian('klausul', 'Klausul / elemen', '', true)
          + pilihan('kategori', 'Kategori', ['Major', 'Minor', 'Observasi'], 'Minor') + '</div>'
          + paragraf('isi', 'Uraian temuan', '', true)
          + '<div class="row2">' + pilihanNilai('pj_id', 'Penanggung jawab', [['', '— Belum ditentukan —']].concat(orang), '', false)
          + isian('tenggat', 'Tenggat', '', false, 'date') + '</div>'
          + catatanKaki('Temuan Major dan Minor wajib ber-CAPA sebelum audit dapat ditutup (AB-18).'),
        ok: 'Simpan Temuan', aksi: 'temuan-baru:' + r.uuid
      });
    }
  }]);

  function formulirCapa(sumberJenis, r) {
    if (!window.KG_BUKA) return;
    var orang = ((ACUAN && ACUAN.penanggung_jawab) || []).map(function (o) {
      return [o.id, esc(o.nama)];
    });
    var tenggat = new Date(Date.now() + 14 * 86400000);
    var iso = tenggat.getFullYear() + '-' + String(tenggat.getMonth() + 1).padStart(2, '0') + '-' + String(tenggat.getDate()).padStart(2, '0');
    window.KG_BUKA({
      title: 'Buat CAPA', sub: 'Sumber: ' + sumberJenis + ' · ' + (r.nama && sumberJenis === 'Lingkungan' ? r.nama : r.id),
      body: isian('judul', 'Tindakan perbaikan', '', true)
        + pilihanNilai('pj_id', 'Penanggung jawab', [['', '— Pilih —']].concat(orang), '', true)
        + '<div class="row2">' + isian('tenggat', 'Tenggat', iso, true, 'date')
        + pilihan('prioritas', 'Prioritas', ['Rendah', 'Sedang', 'Tinggi'], 'Sedang') + '</div>'
        + '<div class="tile-note">Penanggung jawab tidak dapat memverifikasi CAPA-nya sendiri (AB-17). Penuaan CAPA dihitung dari hari ini.</div>',
      ok: 'Buat CAPA', aksi: 'capa-baru:' + sumberJenis + ':' + r.uuid
    });
  }

  /* Koleksi window.KG tempat mencari catatan menurut jenis rincian. */
  var KOLEKSI_RINCIAN = {
    bahaya: 'bahaya', insiden: 'insiden', capa: 'capa',
    izin: 'izin', jsa: 'jsa', audit: 'audit', pengguna: 'pengguna',
    observasi: 'observasi', apd: 'observasiAPD', inspeksi: 'inspeksi', checklist: 'checklistHarian',
    hiradc: 'hiradc', risiko: 'risikoRegister', induksi: 'induksi', regulasi: 'regulasi',
    kegiatan: 'kegiatan', pelatihan: 'pelatihan', dokint: 'dokInternal', dokext: 'dokEksternal',
    temuan: 'temuanAudit'
  };

  function catatan(jenis, id) {
    /* Parameter lingkungan tidak punya nomor sendiri; dikenali dengan uuid-nya
       di dalam hasil uji per domain. */
    if (jenis === 'parameter') {
      var o = (window.KG && window.KG.lingkungan) || {}, hasil = null;
      Object.keys(o).forEach(function (k) {
        (o[k].param || []).forEach(function (v) {
          if (v.uuid && v.uuid === id) hasil = Object.assign({ id: v.uuid, judulDomain: o[k].judul }, v);
        });
      });
      return hasil;
    }
    var nama = KOLEKSI_RINCIAN[jenis];
    var arr = nama ? (window.KG[nama] || []) : [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }

  function berwenang(modul, minimal) {
    var urut = { baca: 1, isi: 2, verifikasi: 3, kelola: 4 };
    var punya = window.KG_SAYA && window.KG_SAYA.kewenangan
      ? window.KG_SAYA.kewenangan[modul] : null;
    return !!punya && urut[punya] >= urut[minimal];
  }

  /**
   * Aksi yang boleh dilakukan atas satu catatan.
   *
   * @return array<{kunci,label,tanya}> — kosong bila tidak ada
   */
  function aksiRincian(jenis, id) {
    if (!API || !AKSI[jenis]) return [];
    var r = catatan(jenis, id);
    if (!r || !r.uuid) return [];

    return AKSI[jenis].filter(function (a) {
      if (!berwenang(a.modul, a.wewenang) || !a.bila(r)) return false;
      return !a.kecuali || !a.kecuali(r);
    }).map(function (a) {
      return {
        kunci: a.kunci, gaya: a.gaya || 'primary',
        label: typeof a.label === 'function' ? a.label(r) : a.label,
        tanya: a.tanya ? a.tanya(r) : null
      };
    });
  }

  /** Menjalankan satu aksi. Mengembalikan janji berisi pesan siap tampil. */
  function jalankanAksi(jenis, id, kunci, isi) {
    var r = catatan(jenis, id);
    var def = (AKSI[jenis] || []).filter(function (a) { return a.kunci === kunci; })[0];
    if (!r || !def) return Promise.resolve('Aksi tidak dikenal.');

    /* Aksi yang membuka formulir, bukan langsung mengirim. */
    if (def.buka) { def.buka(r); return Promise.resolve(''); }

    var badan = def.isi ? Object.assign(def.isi(r), isi || {}) : (isi || {});
    return kirim(def.jalur(r), badan)
      .then(function (j) {
        var ikut = def.koleksi.slice();
        var modul = (window.KG_SAYA && window.KG_SAYA.modul) || [];
        if (modul.indexOf('kpi') !== -1) ikut = ikut.concat(['tren', 'kpi']);
        if (modul.indexOf('exec') !== -1) ikut = ikut.concat(['eksekutif']);
        if (modul.indexOf('notif') !== -1) ikut = ikut.concat(['notifikasi']);
        return segarkan(ikut).then(function () {
          if (def.hasil) return def.hasil(j.data || {}, r);
          var st = j.data && j.data.status ? ' ' + j.data.status + '.' : '.';
          return id + st;
        });
      })
      .catch(function (e) {
        /* Penolakan aturan membawa kodenya. Itu yang membedakan "tidak boleh"
           dari "sedang rusak". */
        return e.aturan ? e.message + ' (' + e.aturan + ')' : 'Gagal: ' + e.message;
      });
  }

  /* ─────────────────────────────────────────────────────────────────
     Ekspor
     ───────────────────────────────────────────────────────────────── */

  /* Modul → kode ekspor pada peladen. */
  var EKSPOR = {
    hazard: 'bahaya', incident: 'insiden', capa: 'capa', permit: 'izin',
    hiradc: 'hiradc', bbs: 'observasi-apd', regulasi: 'regulasi',
    docext: 'dokumen-eksternal', induksi: 'induksi'
  };

  function ekspor(modul) {
    if (!API || !EKSPOR[modul]) return null;
    return berwenang(modul, 'baca') ? EKSPOR[modul] : null;
  }

  /**
   * Mengunduh berkas ekspor.
   *
   * Lewat fetch, bukan tautan biasa: unduhan membawa token sesi, dan tautan
   * <a> tidak dapat menyertakannya. Sekaligus membuat penolakan hak akses
   * terlihat sebagai pesan, bukan sebagai berkas rusak yang terunduh.
   */
  function unduh(kode, bentuk) {
    if (!API || !kode) return Promise.resolve('Ekspor tidak tersedia.');
    var t = token();
    return fetch(API + '/api/v1/ekspor/' + kode + '/' + bentuk, {
      headers: t ? { 'Authorization': 'Bearer ' + t } : {}
    }).then(function (r) {
      if (r.status === 401) { sesiPutus(); throw new Error('sesi berakhir'); }
      if (!r.ok) {
        return r.json().then(function (j) {
          throw new Error((j.galat && j.galat.pesan) || ('HTTP ' + r.status));
        });
      }
      var nama = 'KG-' + kode + '-' + hariIni() + (bentuk === 'xlsx' ? '.xlsx' : '.html');
      return r.blob().then(function (b) {
        var url = URL.createObjectURL(b);
        if (bentuk === 'cetak') {
          window.open(url, '_blank');
        } else {
          var a = document.createElement('a');
          a.href = url; a.download = nama;
          document.body.appendChild(a); a.click(); a.remove();
        }
        /* Alamat objek dilepas setelah peramban sempat memakainya; tanpa ini
           setiap unduhan menyisakan berkasnya di memori tab. */
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        return bentuk === 'xlsx' ? 'Berkas Excel terunduh.' : 'Halaman cetak dibuka di tab baru.';
      });
    }).catch(function (e) {
      return 'Ekspor gagal: ' + e.message;
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     Pemuatan
     ───────────────────────────────────────────────────────────────── */

  /* ─────────────────────────────────────────────────────────────────
     Menyimpan dari formulir

     Purwarupa hanya menampilkan pesan bernomor tetap saat formulir dikirim —
     tidak ada yang tersimpan, karena memang tidak ada peladen di belakangnya.
     Bagian di bawah yang membuat formulir yang sama benar-benar menulis, dan
     menampilkan nomor yang sungguhan dari peladen alih-alih nomor rekaan.

     Pembacaan formulir ada di sini, bukan di app.js, karena inilah lapisan
     yang tahu bentuk yang diminta peladen. app.js tetap tidak tahu-menahu
     soal peladen.
     ───────────────────────────────────────────────────────────────── */

  function nilai(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function angkaDari(id, bawaan) {
    var n = parseInt(nilai(id), 10);
    return isNaN(n) ? (bawaan === undefined ? 0 : bawaan) : n;
  }

  function dicentang(id) {
    var el = document.getElementById(id);
    return !!(el && el.checked);
  }

  /* Keping pilihan (chip) menyimpan pilihannya pada aria-pressed. */
  function keping(nama, bawaan) {
    var p = document.querySelectorAll('[data-pick="' + nama + '"][aria-pressed="true"]');
    if (!p.length) return bawaan;
    var t = p[0].querySelector('.pt');
    return t ? t.textContent.trim() : bawaan;
  }

  /* Jenis dokumen mengikuti levelnya, seperti pada purwarupa: level 1 manual
     dan kebijakan, 2 prosedur, 3 instruksi kerja, 4 formulir. Kodenya
     dibangkitkan peladen menurut jenis itu. */
  function jenisDokumen(level) {
    return { 1: 'Kebijakan', 2: 'Prosedur', 3: 'Instruksi Kerja', 4: 'Formulir' }[level] || 'Prosedur';
  }

  /**
   * Id area dari namanya.
   *
   * Nama area berulang di setiap pabrik — "Line 2 — Moulding" ada di keempatnya.
   * Bagi Administrator yang cakupannya seluruh pabrik, mencocokkan nama saja
   * menyimpan laporan ke pabrik yang kebetulan lebih dulu pada daftar. Sempat
   * terjadi: dua laporan bahaya Cibitung tercatat di Bekasi, dan tidak ada yang
   * kelihatan salah di layar mana pun.
   *
   * Karena itu pabrik pengguna diutamakan. Formulir purwarupa memang tidak
   * punya pemilih pabrik, dan menambahkannya adalah keputusan rancangan;
   * sampai itu diputuskan, pabrik sendiri adalah satu-satunya jawaban yang
   * tidak menebak.
   */
  function areaId(nama) {
    if (!ACUAN || !ACUAN.area) return null;
    var pabrikSaya = window.KG_SAYA && window.KG_SAYA.pabrik ? window.KG_SAYA.pabrik.id : null;

    var cadangan = null;
    for (var i = 0; i < ACUAN.area.length; i++) {
      var a = ACUAN.area[i];
      if (a.nama !== nama) continue;
      if (a.pabrik_id === pabrikSaya) return a.id;
      if (cadangan === null) cadangan = a.id;
    }
    return cadangan;
  }

  function jenisIzinKode(nama) {
    if (!ACUAN || !ACUAN.jenis_izin) return null;
    for (var i = 0; i < ACUAN.jenis_izin.length; i++) {
      if (ACUAN.jenis_izin[i].nama === nama) return ACUAN.jenis_izin[i].kode;
    }
    return null;
  }

  /* Tanggal "21 Sep 2026" atau "21 Sep 2026, 08:40 WIB" → "2026-09-21". */
  var BULAN_KE = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, Mei: 5, Jun: 6, Jul: 7, Agu: 8,
                   Sep: 9, Okt: 10, Nov: 11, Des: 12 };

  function keIso(teks) {
    var m = String(teks || '').match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
    if (!m || !BULAN_KE[m[2]]) return null;
    return m[3] + '-' + String(BULAN_KE[m[2]]).padStart(2, '0')
      + '-' + String(m[1]).padStart(2, '0');
  }

  /* "03 Okt 2026" dan "03 Okt 2026, 08:40 WIB" — bentuk isian tanggal purwarupa. */
  function tanggalIsian(d, denganJam) {
    var t = String(d.getDate()).padStart(2, '0') + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
    if (!denganJam) return t;
    return t + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' WIB';
  }

  /**
   * Tanggal bawaan formulir saat tersambung.
   *
   * Formulir purwarupa berisi tanggal tetap ("21 Sep 2026, 08:40 WIB"). Pada
   * peragaan itu tidak apa-apa; pada sistem sungguhan, pelapor yang tidak
   * mengubahnya menyimpan kejadian hari ini bertanggal tiga minggu lalu.
   */
  function tanggalBawaan(host) {
    if (!API || !host) return;
    var kini = new Date();
    var besok = new Date(kini.getTime() + 86400000);
    var setahun = new Date(kini); setahun.setFullYear(kini.getFullYear() + 1);
    var isi = {
      'f-waktu': tanggalIsian(kini, true),
      'p-mulai': tanggalIsian(besok) + ', 08:00 WIB',
      'p-selesai': tanggalIsian(besok) + ', 16:00 WIB',
      'e-tgl': tanggalIsian(kini),
      't-tgl': tanggalIsian(kini),
      'i-tgl': tanggalIsian(kini),
      'd-tinjau': tanggalIsian(setahun),
      /* Masa berlaku dokumen tidak dapat ditebak; wajib diisi dari dokumennya. */
      'c-berlaku': ''
    };
    Object.keys(isi).forEach(function (id) {
      var el = host.querySelector('#' + id);
      if (el) { el.value = isi[id]; if (!isi[id]) el.placeholder = 'Contoh: ' + tanggalIsian(setahun); }
    });
  }

  function hariIni() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* Satu aksi = satu endpoint, satu pembaca formulir, dan koleksi yang perlu
     dimuat ulang setelahnya. Aksi yang belum punya endpoint tidak dicantumkan;
     bagi aksi itu app.js tetap memakai perilaku purwarupa. */
  var SIMPAN = {
    'lapor-bahaya': {
      jalur: '/bahaya', segarkan: ['bahaya'],
      isi: function () {
        return {
          area_id: areaId(nilai('b-lokasi')),
          kategori: keping('kat', 'Unsafe Condition'),
          isi: nilai('b-isi'),
          anonim: dicentang('b-anon')
        };
      }
    },
    'lapor-insiden': {
      jalur: '/insiden', segarkan: ['insiden'],
      isi: function () {
        return {
          area_id: areaId(nilai('f-lokasi')),
          jenis: keping('jenis', 'Incident'),
          keparahan: keping('parah', 'Sedang'),
          tanggal: keIso(nilai('f-waktu')) || hariIni(),
          ringkas: nilai('f-kronologi').slice(0, 200),
          kronologi: nilai('f-kronologi')
        };
      }
    },
    'observasi-apd': {
      jalur: '/observasi-apd', segarkan: ['observasiAPD'],
      isi: function () {
        var isi = bacaIsian();
        if (isi.patuh > isi.diamati) throw galatJelas('Jumlah patuh tidak boleh melebihi jumlah yang diamati (AB-07).');
        var el = document.querySelectorAll('#modal-host [data-apd]');
        isi.rincian = [];
        for (var i = 0; i < el.length; i++) {
          if (el[i].value === '') continue;
          var p = Number(el[i].value);
          if (p > isi.diamati) throw galatJelas('Patuh per jenis APD tidak boleh melebihi jumlah yang diamati (AB-07).');
          isi.rincian.push({ jenis_apd_id: el[i].getAttribute('data-apd'), diamati: isi.diamati, patuh: p });
        }
        return isi;
      }
    },
    'observasi-baru': {
      jalur: '/observasi', segarkan: ['observasi'],
      isi: function () {
        return {
          area_id: areaId(nilai('o-area')),
          aman: angkaDari('o-aman', 0),
          berisiko: angkaDari('o-risk', 0),
          kategori: nilai('o-kat'),
          catatan: nilai('o-tindak') || 'Observasi perilaku dari aplikasi meja.',
          tindakan: nilai('o-tindak')
        };
      }
    },
    'hiradc-baru': {
      jalur: '/hiradc', segarkan: ['hiradc'],
      isi: function () {
        var isi = bacaIsian();
        isi.kemungkinan = Number(isi.kemungkinan);
        isi.keparahan = Number(isi.keparahan);
        return isi;
      }
    },
    'risiko-baru': {
      jalur: '/risiko', segarkan: ['risikoRegister'],
      isi: function () {
        var isi = bacaIsian();
        isi.kemungkinan = Number(isi.kemungkinan);
        isi.keparahan = Number(isi.keparahan);
        return isi;
      }
    },
    'jsa-baru': {
      jalur: '/jsa', segarkan: ['jsa'],
      isi: function () {
        var isi = bacaIsian();
        isi.langkah = langkahJsa();
        return isi;
      }
    },
    'induksi-baru': {
      jalur: '/induksi', segarkan: ['induksi'],
      isi: function () {
        return {
          nama: nilai('i-nama'), jenis: keping('ind', 'Pekerja Baru'),
          asal: nilai('i-asal'), tanggal: keIso(nilai('i-tgl')) || hariIni()
        };
      }
    },
    'regulasi-baru': {
      jalur: '/regulasi', segarkan: ['regulasi'],
      isi: function () { return bacaIsian(); }
    },
    'inspeksi-baru': {
      jalur: '/inspeksi', segarkan: ['inspeksi'],
      isi: function () {
        var isi = bacaIsian();
        isi.jenis = nilai('e-jenis-periksa');
        isi.butir = bacaButir();
        return isi;
      }
    },
    'checklist-mulai': {
      jalur: '/checklist', segarkan: ['checklistHarian'],
      isi: function () {
        var isi = bacaIsian();
        isi.nama = nilai('e-jenis-periksa');
        isi.frekuensi = 'Harian';
        isi.butir = bacaButir();
        return isi;
      }
    },
    'izin-baru': {
      jalur: '/izin', segarkan: ['izin'],
      isi: function () {
        var isi = bacaIsian();
        isi.vendor = isi.vendor === '1';
        return isi;
      }
    },
    'unggah-kegiatan': {
      jalur: '/kegiatan', segarkan: ['kegiatan'],
      isi: function () {
        return {
          jenis: nilai('a-jenis'), judul: nilai('a-judul'),
          peserta: angkaDari('a-peserta', 0),
          durasi_jam: parseFloat(nilai('a-durasi').replace(',', '.')) || 1
        };
      }
    },
    'pelatihan-baru': {
      jalur: '/pelatihan', segarkan: ['pelatihan'],
      isi: function () {
        return {
          nama: nilai('t-nama'), jenis: nilai('t-jenis') || 'Internal',
          target: angkaDari('t-peserta', 0),
          rencana_tanggal: nilai('t-tgl'),
          rencana_peserta: angkaDari('t-peserta', 0),
          penyelenggara: nilai('t-pjk3') || 'Internal'
        };
      }
    },
    'dokumen-baru': {
      jalur: '/dokumen/internal', segarkan: ['dokInternal'],
      isi: function () {
        return {
          level: angkaDari('d-level', 3),
          jenis: jenisDokumen(angkaDari('d-level', 3)),
          judul: nilai('d-judul'), pemilik: nilai('d-pemilik'),
          tinjau: keIso(nilai('d-tinjau')), status: 'Dalam Revisi'
        };
      }
    },

    /* Formulir "Tambah Pengguna" dari purwarupa, apa adanya. Peladen
       membalas dengan tautan undangan, dan tautan itu yang ditampilkan —
       selama surel sistem belum dinyalakan, administratorlah yang
       meneruskannya. */
    'tambah-pengguna': {
      jalur: '/pengguna', segarkan: ['pengguna'],
      isi: function () {
        return {
          nama: nilai('u-nama'), email: nilai('u-email'),
          peran_kode: kodePeran(nilai('u-peran')),
          pabrik_id: pabrikIdDariNama(nilai('u-lokasi'))
        };
      },
      hasil: function (d) { tampilkanTautan(d); return ''; }
    },

    /* 'ubah-pengguna:<uuid>' — formulir yang sama, terisi, untuk satu akun. */
    'ubah-pengguna': {
      jalur: function (id) {
        var r = catatan('pengguna', id);
        if (!r) throw galatJelas('Pengguna tidak ditemukan pada daftar. Muat ulang halaman.');
        return '/pengguna/' + r.uuid + '/ubah';
      },
      segarkan: ['pengguna'],
      isi: function () {
        return {
          nama: nilai('u-nama'),
          peran_kode: kodePeran(nilai('u-peran')),
          pabrik_id: pabrikIdDariNama(nilai('u-lokasi'))
        };
      },
      hasil: function (d) { return 'Perubahan untuk ' + (d.email || 'pengguna') + ' tersimpan.'; }
    },

    'input-uji': {
      jalur: '/lingkungan', segarkan: ['lingkungan'],
      isi: function () {
        var isi = bacaIsian();
        isi.parameter = bacaParameter();
        return isi;
      },
      hasil: function (d) {
        var m = 'Hasil uji ' + String(d.kode || '').toUpperCase() + ' tersimpan, ' + d.parameter + ' parameter'
          + (d.mengganti ? ' (menggantikan hasil bulan ini)' : '') + '.';
        return d.melewati && d.melewati.length ? m + ' Melewati baku mutu: ' + d.melewati.join(', ') + '.' : m + ' Seluruhnya memenuhi baku mutu.';
      }
    },
    'hasil-periksa': {
      jalur: function (param) { var b = param.split(':'); return '/' + PERIKSA[b[0]].jalur + '/' + b[1] + '/jawab'; },
      segarkan: function (param) { return PERIKSA[param.split(':')[0]].segarkan; },
      isi: function () {
        var baris = document.querySelectorAll('#modal-host [data-hasil]'), jawaban = [];
        for (var i = 0; i < baris.length; i++) {
          var j = baris[i].querySelector('[data-h="jawab"]').value;
          var c = baris[i].querySelector('[data-h="catatan"]').value.trim();
          if (j === 'Tidak Sesuai' && !c) throw galatJelas('Butir ' + (i + 1) + ' dijawab Tidak Sesuai: uraikan temuannya.');
          jawaban.push({ id: baris[i].getAttribute('data-hasil'), jawab: j, catatan: c });
        }
        return { jawaban: jawaban, selesai: nilai('e-selesai') === '1' };
      },
      hasil: function (d) {
        var m = d.nomor + ': ' + d.dijawab + ' dari ' + d.butir + ' butir terjawab, status ' + d.status + '.';
        if (d.tidak_sesuai) m += ' ' + d.tidak_sesuai + ' tidak sesuai.';
        if (d.unit) m += ' Unit ' + d.unit.kode + ' ' + (d.unit.status === 'Terkunci' ? 'TERKUNCI dari operasi.' : 'layak beroperasi.');
        return m;
      }
    },
    'temuan-baru': {
      jalur: function (id) { return '/audit/' + id + '/temuan'; },
      segarkan: ['temuanAudit', 'audit'],
      isi: function () { return bacaIsian(); },
      hasil: function (d) { return 'Temuan ' + (d.nomor || '') + ' tersimpan.'; }
    },

    /* "capa-baru:<SumberJenis>:<uuid>" — dari rincian sumbernya. */
    'capa-baru': {
      jalur: '/capa',
      segarkan: ['capa', 'insiden', 'temuanAudit', 'inspeksi'],
      isi: function (param) {
        var b = String(param || '').split(':');
        var isi = bacaIsian();
        isi.sumber_jenis = b[0];
        isi.sumber_id = b[1];
        return isi;
      },
      hasil: function (d) { return 'CAPA ' + d.nomor + ' dibuat dari ' + d.sumber_nomor + '.'; }
    },
    'compliance-baru': {
      jalur: '/dokumen/eksternal', segarkan: ['dokEksternal'],
      isi: function () { return bacaIsian(); },
      hasil: function (d) { return 'Dokumen ' + d.kode + ' terdaftar dan mulai dipantau.'; }
    },
    'tandai-baca': {
      jalur: '/notifikasi/terbaca-semua', segarkan: ['notifikasi'],
      isi: function () { return {}; },
      hasil: function (d) { return d.ditandai + ' pemberitahuan ditandai terbaca.'; }
    },

    /* "ubah-catatan:<jenis>:<uuid>". Seluruh isian formulir dikirim; peladen
       yang menentukan mana yang sungguh berubah, dan hanya itu yang masuk
       jejak audit. */
    'ubah-catatan': {
      jalur: function (param) { var b = param.split(':'); return '/' + (CATATAN[b[0]].jalur || b[0]) + '/' + b[1] + '/ubah'; },
      segarkan: function (param) { return CATATAN[param.split(':')[0]].segarkan; },
      isi: function () {
        var isi = {};
        var el = document.querySelectorAll('#modal-host [data-kolom]');
        for (var i = 0; i < el.length; i++) {
          var v = String(el[i].value || '').trim();
          if (el[i].hasAttribute('data-asal') && v === el[i].getAttribute('data-asal')) continue;
          if (!v && el[i].hasAttribute('data-wajib')) {
            throw galatJelas('Isian "' + el[i].getAttribute('data-wajib') + '" wajib diisi.');
          }
          /* Jam setempat dikirim bersama zonanya; tanpa itu peladen menafsirkannya
             menurut zona waktunya sendiri, dan izin mulai tujuh jam bergeser. */
          if (v && el[i].type === 'datetime-local') v = new Date(v).toISOString();
          isi[el[i].getAttribute('data-kolom')] = v;
        }
        return isi;
      },
      hasil: function (d) {
        if (!d.berubah || !d.berubah.length) return 'Tidak ada yang berubah pada ' + d.nomor + '.';
        var m = 'Perubahan pada ' + d.nomor + ' tersimpan.';
        /* AB-02: kenaikan ke Serius memberi tahu seketika, seperti laporan baru. */
        if (d.pemberitahuan_ke) m += ' Keparahan Serius — QHSE dan manajemen pabrik diberi tahu.';
        return m;
      }
    },

    /* "hapus-catatan:<jenis>:<uuid>" — selalu lunak, selalu beralasan. */
    'hapus-catatan': {
      jalur: function (param) { var b = param.split(':'); return '/' + (CATATAN[b[0]].jalur || b[0]) + '/' + b[1] + '/hapus'; },
      segarkan: function (param) { return CATATAN[param.split(':')[0]].segarkan; },
      isi: function () {
        var alasan = nilai('e-alasan');
        if (alasan.length < 5) throw galatJelas('Alasan penghapusan wajib diisi — auditor akan menanyakannya.');
        return { alasan: alasan };
      },
      hasil: function (d) { return d.nomor + ' dihapus. Catatannya tetap tersimpan untuk auditor.'; }
    },

    'ganti-sandi': {
      jalur: '/sesi/sandi', segarkan: [],
      isi: function () {
        var baru = nilai('s-baru');
        if (baru !== nilai('s-ulang')) throw galatJelas('Kata sandi baru dan ulangannya tidak sama.');
        return { sandi_lama: nilai('s-lama'), sandi_baru: baru };
      },
      hasil: function () {
        return 'Kata sandi diganti. Sesi di perangkat lain sudah diakhiri.';
      }
    }
  };

  var D = window.KG || {};

  /* ─────────────────────────────────────────────────────────────────
     Akun: bantuan untuk formulir pengguna dan tautan
     ───────────────────────────────────────────────────────────────── */

  /* Galat yang pesannya sudah siap dibaca orang, tanpa awalan teknis. */
  function galatJelas(pesan) {
    var e = new Error(pesan);
    e.jelas = true;
    return e;
  }

  function esc(t) {
    return String(t === null || t === undefined ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Nama peran pada formulir purwarupa → kode peran peladen. */
  function kodePeran(nama) {
    var peran = (window.KG && window.KG.peran) || {};
    for (var k in peran) if (peran[k].nama === nama) return k;
    throw galatJelas('Peran "' + nama + '" tidak dikenal.');
  }

  /* "Pabrik Cibitung" → id pabrik. Pilihan purwarupa yang belum ada di
     peladen ("Kantor Pusat") ditolak dengan menyebut namanya, bukan
     disimpan ke pabrik lain. */
  function pabrikIdDariNama(nama) {
    var bersih = String(nama || '').replace(/^Pabrik\s+/, '');
    var daftar = (ACUAN && ACUAN.pabrik) || [];
    for (var i = 0; i < daftar.length; i++) {
      if (daftar[i].nama === bersih || daftar[i].nama === nama) return daftar[i].id;
    }
    throw galatJelas('"' + nama + '" belum terdaftar sebagai pabrik di sistem.');
  }

  function namaPabrik(id) {
    var daftar = (ACUAN && ACUAN.pabrik) || [];
    for (var i = 0; i < daftar.length; i++) if (daftar[i].id === id) return daftar[i].nama;
    return '';
  }

  function tanggalJam(nilaiIso) {
    return nilaiIso ? tanggalPanjang(nilaiIso) + ', ' + jam(nilaiIso) + ' WIB' : '';
  }

  /**
   * Menampilkan tautan undangan/atur ulang kepada administrator.
   *
   * Surel sistem belum dinyalakan, jadi tautannya belum sampai ke siapa pun
   * — dan itu dikatakan terang-terangan. Modal yang berbunyi "undangan
   * terkirim" padahal tidak ada yang terkirim membuat karyawan menunggu
   * surel yang tidak akan pernah datang.
   */
  function tampilkanTautan(d) {
    if (!window.KG_BUKA || !d || !d.tautan) return;
    var undangan = d.jenis ? d.jenis === 'undangan' : true;
    /* Peladen memberi alamat lengkap bila 'alamat_aplikasi' diisi. Bila
       belum, alamat halaman ini yang dipakai — tautan relatif yang
       diteruskan lewat WhatsApp tidak dapat dibuka siapa pun. */
    if (!/^https?:\/\//.test(d.tautan)) {
      d = Object.assign({}, d, { tautan: location.origin + location.pathname.replace(/[^/]*$/, '')
        + d.tautan.replace(/^\/?/, '') });
    }
    window.KG_BUKA({
      title: undangan ? 'Undangan Siap Dikirim' : 'Tautan Atur Ulang Siap',
      sub: esc(d.nama || '') + ' · ' + esc(d.email || ''),
      body: '<div class="field"><label for="tautan-sandi">Tautan untuk menyetel kata sandi</label>'
        + '<input id="tautan-sandi" type="text" readonly value="' + esc(d.tautan) + '">'
        + '<span class="hint">Berlaku sampai ' + esc(tanggalJam(d.kedaluwarsa))
        + ' · hanya dapat dipakai sekali</span></div>'
        + '<div class="tile-note">Surel sistem belum dinyalakan, jadi tautan ini <b>belum terkirim</b> '
        + 'ke siapa pun. Salin dan kirimkan sendiri kepada ' + esc(d.nama || 'pemilik akun')
        + ' — lewat surel kantor atau pesan pribadi, jangan ke grup. Siapa pun yang memegang '
        + 'tautan ini dapat menyetel sandi akun tersebut.'
        + (undangan ? '' : ' Sandi lamanya tetap berlaku sampai tautan ini dipakai.') + '</div>',
      salin: 'tautan-sandi'
    });
  }

  function formulirUbahPengguna(r) {
    if (!window.KG_BUKA) return;
    var peran = (window.KG && window.KG.peran) || {};
    var opsiPeran = Object.keys(peran).map(function (k) {
      return '<option' + (k === r.peran ? ' selected' : '') + '>' + esc(peran[k].nama) + '</option>';
    }).join('');
    var pabrikSaat = namaPabrik(r.pabrikId);
    var opsiPabrik = ((ACUAN && ACUAN.pabrik) || []).map(function (pb) {
      return '<option' + (pb.nama === pabrikSaat ? ' selected' : '') + '>Pabrik ' + esc(pb.nama) + '</option>';
    }).join('');
    window.KG_BUKA({
      /* r.* sudah di-escape oleh PETA; di-escape lagi akan menampilkan &amp;. */
      title: 'Ubah Pengguna', sub: r.email,
      body: '<div class="field"><label for="u-nama">Nama lengkap <span class="req">*</span></label>'
        + '<input id="u-nama" type="text" value="' + r.nama + '"></div>'
        + '<div class="row2">'
        + '<div class="field"><label for="u-peran">Peran <span class="req">*</span></label>'
        + '<select id="u-peran">' + opsiPeran + '</select></div>'
        + '<div class="field"><label for="u-lokasi">Pabrik <span class="req">*</span></label>'
        + '<select id="u-lokasi">' + opsiPabrik + '</select></div>'
        + '</div>'
        + '<div class="tile-note">Alamat email tidak dapat diubah — ia penanda akun pada jejak audit. '
        + 'Perubahan peran berlaku seketika, termasuk pada sesi yang sedang terbuka.</div>',
      ok: 'Simpan Perubahan', aksi: 'ubah-pengguna:' + r.uuid
    });
  }

  /* ── Formulir ubah dan hapus catatan K3 ──
     Nilai r.* sudah di-escape PETA, jadi masuk ke value dan textarea apa
     adanya. Teks dari ACUAN belum, jadi melewati esc(). */

  function bidang(kolom, label, isi, wajib) {
    return '<div class="field"><label for="e-' + kolom + '">' + label
      + (wajib ? ' <span class="req">*</span>' : '') + '</label>' + isi + '</div>';
  }

  function atribut(kolom, label, wajib) {
    return ' id="e-' + kolom + '" data-kolom="' + kolom + '"' + (wajib ? ' data-wajib="' + label + '"' : '');
  }

  function isian(kolom, label, nilai, wajib, tipe) {
    return bidang(kolom, label, '<input type="' + (tipe || 'text') + '"' + atribut(kolom, label, wajib)
      + ' value="' + (nilai === null || nilai === undefined ? '' : nilai) + '"'
      + (tipe === 'number' ? ' min="0" step="1"' : '') + '>', wajib);
  }

  function paragraf(kolom, label, nilai, wajib) {
    return bidang(kolom, label, '<textarea rows="3"' + atribut(kolom, label, wajib) + '>'
      + (nilai || '') + '</textarea>', wajib);
  }

  /* Nilai yang tidak ada pada daftar pilihan tetap ditawarkan, supaya
     membuka lalu menyimpan formulir tidak diam-diam mengganti isinya. */
  function pilihan(kolom, label, opsi, nilai) {
    var daftar = opsi.slice();
    if (nilai && daftar.indexOf(nilai) === -1) daftar.unshift(nilai);
    return bidang(kolom, label, '<select' + atribut(kolom, label, true) + '>' + daftar.map(function (o) {
      return '<option' + (o === nilai ? ' selected' : '') + '>' + o + '</option>';
    }).join('') + '</select>', true);
  }

  /* Area hanya dari pabrik catatannya sendiri; pindah pabrik ditolak peladen. */
  function pilihanArea(r) {
    var semua = (ACUAN && ACUAN.area) || [];
    var pabrik = null;
    for (var i = 0; i < semua.length; i++) if (semua[i].id === r.areaId) pabrik = semua[i].pabrik_id;
    var opsi = semua.filter(function (a) { return a.pabrik_id === pabrik; }).map(function (a) {
      return '<option value="' + a.id + '"' + (a.id === r.areaId ? ' selected' : '') + '>' + esc(a.nama) + '</option>';
    }).join('');
    /* Area yang sudah dinonaktifkan tidak ada di acuan; isiannya tidak dikirim
       sama sekali, supaya catatannya tetap pada area lamanya. */
    if (!opsi) return '';
    return bidang('area_id', 'Area kerja', '<select' + atribut('area_id', 'Area kerja', true) + '>'
      + opsi + '</select>', true);
  }

  /* Penanggung jawab CAPA: akun aktif di pabrik CAPA itu. Penanggung jawab
     yang akunnya sudah nonaktif tetap tampil sebagai pilihan saat ini dan
     tidak dikirim bila tidak diganti (data-asal) — justru CAPA seperti itulah
     yang paling perlu dipindahkan ke orang lain, dan formulirnya tidak boleh
     menolak disimpan hanya karena orang lamanya sudah keluar. */
  function pilihanPj(r) {
    var orang = ((ACUAN && ACUAN.penanggung_jawab) || []).filter(function (o) {
      return o.pabrik_id === r.pabrikId;
    });
    if (!orang.length) return '';
    var ada = orang.some(function (o) { return o.id === r.pjId; });
    var opsi = (ada ? '' : '<option value="' + r.pjId + '" selected>' + r.pj + ' (tidak aktif)</option>')
      + orang.map(function (o) {
        return '<option value="' + o.id + '"' + (o.id === r.pjId ? ' selected' : '') + '>' + esc(o.nama) + '</option>';
      }).join('');
    return bidang('pj_id', 'Penanggung jawab', '<select' + atribut('pj_id', 'Penanggung jawab', true)
      + ' data-asal="' + r.pjId + '">' + opsi + '</select>', true);
  }

  /* ISO dari peladen → nilai <input type="datetime-local">, waktu setempat. */
  function keLokal(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return '';
    function dua(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + dua(d.getMonth() + 1) + '-' + dua(d.getDate())
      + 'T' + dua(d.getHours()) + ':' + dua(d.getMinutes());
  }

  var FORMULIR_UBAH = {
    bahaya: function (r) {
      return pilihan('kategori', 'Kategori', ['Unsafe Condition', 'Unsafe Action', 'Aspek Lingkungan'], r.kategori)
        + pilihanArea(r)
        + paragraf('isi', 'Apa yang dilihat', r.isi, true)
        + pilihan('risiko', 'Tingkat risiko', ['Rendah', 'Sedang', 'Tinggi'], r.risiko);
    },
    insiden: function (r) {
      return '<div class="row2">' + pilihan('jenis', 'Jenis', ['Nearmiss', 'Incident', 'Accident'], r.jenis)
        + pilihan('keparahan', 'Keparahan', ['Ringan', 'Sedang', 'Serius'], r.keparahan) + '</div>'
        + '<div class="row2">' + isian('tanggal', 'Tanggal', r.tanggalIso, true, 'date')
        + isian('waktu', 'Jam', r.waktu, false, 'time') + '</div>'
        + pilihanArea(r)
        + paragraf('ringkas', 'Ringkasan', r.ringkas, true)
        + paragraf('kronologi', 'Kronologi', r.kronologi, false)
        + paragraf('dampak', 'Dampak', r.dampak, false)
        + paragraf('akar', 'Akar masalah', r.akar, false)
        + '<div class="row2">' + isian('cedera', 'Cedera', r.cedera, false)
        + isian('hari_kerja_hilang', 'Hari kerja hilang', r.hariHilang, true, 'number') + '</div>';
    },
    capa: function (r) {
      return isian('judul', 'Tindakan', r.judul, true)
        + pilihanPj(r)
        + '<div class="row2">' + isian('tenggat', 'Tenggat', r.tenggatIso, true, 'date')
        + pilihan('prioritas', 'Prioritas', ['Rendah', 'Sedang', 'Tinggi'], r.prioritas) + '</div>';
    },
    izin: function (r) {
      return isian('judul', 'Pekerjaan', r.judul, true)
        + '<div class="row2">' + isian('pelaksana', 'Pelaksana', r.pelaksana, true)
        + isian('pengawas', 'Pengawas', r.pengawas, true) + '</div>'
        + '<div class="row2">' + isian('mulai', 'Mulai', keLokal(r.mulaiIso), false, 'datetime-local')
        + isian('durasi', 'Durasi', r.durasi, false) + '</div>'
        + isian('pekerja', 'Jumlah pekerja', r.pekerja, true, 'number');
    },
    jsa: function (r) {
      return isian('pekerjaan', 'Pekerjaan', r.pekerjaan, true)
        + '<div class="row2">' + pilihan('jenis', 'Sifat pekerjaan', ['Rutin', 'Non-rutin'], r.jenis)
        + '</div>' + pilihanArea(r)
        + '<div class="tile-note">Langkah kerja dan pengendaliannya tidak berubah lewat formulir ini.</div>';
    }
  };

  /* Pilihan dengan nilai (value) berbeda dari teksnya: [[nilai, teks], …]. */
  function pilihanNilai(kolom, label, opsi, nilai, wajib) {
    var ada = opsi.some(function (o) { return String(o[0]) === String(nilai); });
    var daftar = (ada || nilai === null || nilai === undefined || nilai === '' ? [] : [[nilai, nilai]]).concat(opsi);
    return bidang(kolom, label, '<select' + atribut(kolom, label, wajib) + '>' + daftar.map(function (o) {
      return '<option value="' + o[0] + '"' + (String(o[0]) === String(nilai) ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('') + '</select>', wajib);
  }
  function v(m, k) { return m[k] === null || m[k] === undefined ? '' : m[k]; }

  var FORMULIR_UBAH_LAIN = {
    observasi: function (r, m) {
      var kat = [['', '— Tidak ada perilaku berisiko —']].concat(((ACUAN && ACUAN.kategori_observasi) || []).map(function (k) {
        return [esc(k.kode), esc(k.nama)]; }));
      return pilihanArea({ areaId: m.area_id }) + isian('tanggal', 'Tanggal', v(m, 'tanggal'), true, 'date')
        + '<div class="row2">' + isian('aman', 'Perilaku aman', v(m, 'aman'), true, 'number')
        + isian('berisiko', 'Perilaku berisiko', v(m, 'berisiko'), true, 'number') + '</div>'
        + pilihanNilai('kategori', 'Kategori perilaku berisiko', kat, v(m, 'kategori'), false)
        + paragraf('catatan', 'Catatan', v(m, 'catatan'), true) + paragraf('tindakan', 'Tindakan', v(m, 'tindakan'), false);
    },
    apd: function (r, m) {
      return pilihanArea({ areaId: m.area_id }) + isian('tanggal', 'Tanggal', v(m, 'tanggal'), true, 'date')
        + paragraf('catatan', 'Catatan', v(m, 'catatan'), true)
        + '<div class="tile-note">Jumlah diamati dan patuh terikat pada rincian per jenis APD. Bila salah hitung, hapus catatan ini lalu catat ulang.</div>';
    },
    inspeksi: function (r, m) {
      return isian('jenis', 'Jenis inspeksi', v(m, 'jenis'), true) + isian('area', 'Area', v(m, 'area'), true)
        + '<div class="row2">' + isian('tanggal', 'Tanggal', v(m, 'tanggal'), true, 'date')
        + pilihan('jadwal', 'Jadwal', ['Harian', 'Mingguan', 'Bulanan', 'Triwulanan', 'Tahunan'], v(m, 'jadwal')) + '</div>';
    },
    checklist: function (r, m) {
      return isian('nama', 'Jenis checklist', v(m, 'nama'), true)
        + '<div class="row2">' + isian('frekuensi', 'Frekuensi', v(m, 'frekuensi'), true) + isian('shift', 'Shift', v(m, 'shift'), false) + '</div>'
        + '<div class="row2">' + isian('lokasi', 'Unit / area', v(m, 'lokasi_teks'), false) + isian('tanggal', 'Tanggal', v(m, 'tanggal'), true, 'date') + '</div>';
    },
    hiradc: function (r, m) {
      var kat = (window.KG.hiradcKategori || []).map(function (k) { return [esc(k), esc(k)]; });
      return isian('proses', 'Proses', v(m, 'proses'), true) + isian('aktivitas', 'Aktivitas', v(m, 'aktivitas'), true)
        + '<div class="row2">' + pilihan('sifat', 'Sifat', ['Rutin', 'Non-rutin', 'Darurat'], v(m, 'sifat'))
        + pilihanNilai('kategori', 'Sumber bahaya', kat, v(m, 'kategori'), true) + '</div>'
        + paragraf('bahaya', 'Bahaya', v(m, 'bahaya'), true)
        + '<div class="row2">' + isian('risiko', 'Risiko (akibatnya)', v(m, 'risiko'), true) + isian('korban', 'Yang dapat terdampak', v(m, 'korban'), true) + '</div>'
        + '<div class="row2">' + skala('kemungkinan', 'Kemungkinan awal', Number(m.kemungkinan), KATA_K) + skala('keparahan', 'Keparahan awal', Number(m.keparahan), KATA_S) + '</div>'
        + paragraf('kendali_ada', 'Pengendalian yang ada', v(m, 'kendali_ada'), false)
        + paragraf('kendali_tambahan', 'Pengendalian tambahan', v(m, 'kendali_tambahan'), false)
        + '<div class="row2">' + pilihanNilai('hierarki', 'Hierarki pengendalian', [['', '—'], ['Eliminasi', 'Eliminasi'], ['Substitusi', 'Substitusi'],
            ['Rekayasa', 'Rekayasa'], ['Administratif', 'Administratif'], ['APD', 'APD']], v(m, 'hierarki'), false)
        + isian('target', 'Target selesai', v(m, 'target'), false, 'date') + '</div>'
        + pilihan('status', 'Status', ['Terbuka', 'Dalam Proses', 'Selesai'], v(m, 'status'))
        + '<div class="tile-note">Penilaian sisa diturunkan lewat jalurnya sendiri setelah pengendalian tambahan terpasang (AB-15).</div>';
    },
    risiko: function (r, m) {
      return isian('proses', 'Proses / area', v(m, 'proses'), true) + isian('ancaman', 'Ancaman', v(m, 'ancaman'), true)
        + paragraf('penyebab', 'Penyebab', v(m, 'penyebab'), true) + paragraf('dampak', 'Dampak', v(m, 'dampak'), true)
        + '<div class="row2">' + skala('kemungkinan', 'Kemungkinan awal', Number(m.kemungkinan), KATA_K) + skala('keparahan', 'Keparahan awal', Number(m.keparahan), KATA_S) + '</div>'
        + '<div class="row2">' + skala('kemungkinan_sisa', 'Kemungkinan sisa', Number(m.kemungkinan_sisa), KATA_K) + skala('keparahan_sisa', 'Keparahan sisa', Number(m.keparahan_sisa), KATA_S) + '</div>'
        + pilihan('opsi', 'Opsi penanganan', ['Hindari', 'Kurangi', 'Transfer', 'Terima'], v(m, 'opsi'))
        + paragraf('mitigasi', 'Rencana mitigasi', v(m, 'mitigasi'), true)
        + '<div class="row2">' + isian('target', 'Target', v(m, 'target'), false, 'date') + isian('reviu', 'Reviu berikutnya', v(m, 'reviu'), false, 'date') + '</div>'
        + pilihan('status', 'Status', ['Terbuka', 'Dalam Proses', 'Selesai'], v(m, 'status'));
    },
    induksi: function (r, m) {
      return isian('nama', 'Nama atau nama rombongan', v(m, 'nama'), true)
        + '<div class="row2">' + pilihan('jenis', 'Jenis peserta', ['Pekerja Baru', 'Kontraktor', 'Tamu'], v(m, 'jenis'))
        + isian('tanggal', 'Tanggal induksi', v(m, 'tanggal'), true, 'date') + '</div>'
        + '<div class="row2">' + isian('asal', 'Asal atau keperluan', v(m, 'asal'), false) + isian('pemandu', 'Pemandu', v(m, 'pemandu'), false) + '</div>'
        + isian('nilai', 'Nilai ujian (0–100)', v(m, 'nilai'), false, 'number')
        + '<div class="tile-note">Status kartu dan masa berlakunya dihitung ulang dari nilai, jenis peserta, dan tanggal (AB-23, AB-24).</div>';
    },
    regulasi: function (r, m) {
      return isian('nomor', 'Nomor peraturan', v(m, 'nomor'), true) + isian('judul', 'Judul', v(m, 'judul'), true)
        + '<div class="row2">' + isian('penerbit', 'Penerbit', v(m, 'penerbit'), true) + isian('bidang', 'Bidang', v(m, 'bidang'), true) + '</div>'
        + isian('pasal', 'Pasal yang relevan', v(m, 'pasal'), true)
        + paragraf('penerapan', 'Cara Khong Guan memenuhinya', v(m, 'penerapan'), true)
        + paragraf('bukti', 'Bukti pemenuhan', v(m, 'bukti'), false)
        + '<div class="row2">' + pilihan('status', 'Status', ['Terpenuhi', 'Terpenuhi Sebagian', 'Tidak Terpenuhi'], v(m, 'status'))
        + isian('evaluasi', 'Evaluasi berikutnya', v(m, 'evaluasi'), false, 'date') + '</div>'
        + '<div class="tile-note">Status Terpenuhi menuntut bukti (AB-22).</div>';
    },
    kegiatan: function (r, m) {
      return pilihan('jenis', 'Jenis kegiatan', ['Safety Talk', 'Safety Patrol', 'Simulasi Tanggap Darurat', 'Pelatihan', 'Rapat P2K3',
          'Kampanye K3', 'Audit Internal', 'Kegiatan Lingkungan'], v(m, 'jenis'))
        + isian('judul', 'Judul kegiatan', v(m, 'judul'), true)
        + '<div class="row2">' + isian('tanggal', 'Tanggal', v(m, 'tanggal'), true, 'date') + isian('lokasi', 'Lokasi', v(m, 'lokasi_teks'), false) + '</div>'
        + '<div class="row2">' + isian('peserta', 'Jumlah peserta', v(m, 'peserta'), true, 'number')
        + isian('durasi_jam', 'Durasi (jam)', String(v(m, 'durasi_jam')).replace('.', ','), true) + '</div>';
    },
    pelatihan: function (r, m) {
      return isian('nama', 'Program pelatihan', v(m, 'nama'), true)
        + '<div class="row2">' + pilihan('jenis', 'Jenis', ['Wajib Regulasi', 'Internal', 'Refreshment'], v(m, 'jenis'))
        + isian('penyelenggara', 'Penyelenggara', v(m, 'penyelenggara'), true) + '</div>'
        + '<div class="row2">' + isian('rencana_tanggal', 'Jadwal rencana', v(m, 'rencana_tanggal'), true)
        + isian('rencana_peserta', 'Rencana peserta', v(m, 'rencana_peserta'), true, 'number') + '</div>'
        + '<div class="row2">' + isian('aktual_tanggal', 'Tanggal aktual', v(m, 'aktual_tanggal'), false)
        + isian('aktual_peserta', 'Peserta aktual', v(m, 'aktual_peserta'), false, 'number') + '</div>'
        + '<div class="row2">' + isian('target', 'Target peserta', v(m, 'target'), true, 'number')
        + isian('biaya_juta', 'Biaya (juta Rp)', String(v(m, 'biaya_juta')).replace('.', ','), false) + '</div>'
        + pilihan('status', 'Status', ['Terjadwal', 'Tertunda', 'Selesai'], v(m, 'status'));
    },
    dokint: function (r, m) {
      return isian('judul', 'Judul dokumen', v(m, 'judul'), true)
        + '<div class="row2">' + isian('revisi', 'Revisi', v(m, 'revisi'), true, 'number') + isian('pemilik', 'Pemilik dokumen', v(m, 'pemilik'), true) + '</div>'
        + '<div class="row2">' + isian('terbit', 'Terbit', v(m, 'terbit'), true, 'date') + isian('tinjau', 'Tinjau ulang', v(m, 'tinjau'), false, 'date') + '</div>'
        + pilihan('status', 'Status', ['Berlaku', 'Dalam Revisi', 'Kedaluwarsa'], v(m, 'status'))
        + '<div class="tile-note">Dokumen berstatus Berlaku menuntut tanggal tinjau ulang (AB-20). Tingkat dan jenisnya terkandung dalam kode, jadi tidak diubah di sini.</div>';
    },
    dokext: function (r, m) {
      return pilihan('jenis', 'Jenis', ['Sertifikat Sistem', 'Izin Lingkungan', 'Izin Peralatan', 'Pelaporan Wajib'], v(m, 'jenis'))
        + isian('judul', 'Nama dokumen', v(m, 'judul'), true)
        + '<div class="row2">' + isian('penerbit', 'Penerbit', v(m, 'penerbit'), true) + isian('nomor', 'Nomor dokumen', v(m, 'nomor'), true) + '</div>'
        + '<div class="row2">' + isian('terbit', 'Terbit', v(m, 'terbit'), false, 'date') + isian('berlaku', 'Berlaku sampai', v(m, 'berlaku'), true, 'date') + '</div>';
    },
    audit: function (r, m) {
      return isian('standar', 'Standar', v(m, 'standar'), true) + isian('lingkup', 'Lingkup', v(m, 'lingkup'), true)
        + isian('auditor', 'Auditor', v(m, 'auditor'), true)
        + '<div class="row2">' + isian('mulai', 'Mulai', v(m, 'mulai'), true, 'date') + isian('selesai', 'Selesai', v(m, 'selesai'), false, 'date') + '</div>';
    }
  };

  function formulirUbahCatatan(jenis, r) {
    if (!window.KG_BUKA) return;
    window.KG_BUKA({
      title: 'Ubah ' + CATATAN[jenis].nama, sub: r.id + (r.status ? ' · ' + r.status : ''),
      body: (FORMULIR_UBAH[jenis] ? FORMULIR_UBAH[jenis](r) : FORMULIR_UBAH_LAIN[jenis](r, r.mentah || {}))
        + '<div class="tile-note">Setiap perubahan tercatat di jejak audit: siapa, kapan, nilai lama dan '
        + 'nilai barunya. Setelah diverifikasi, catatan ini tidak dapat diubah lagi.</div>',
      ok: 'Simpan Perubahan', aksi: 'ubah-catatan:' + jenis + ':' + r.uuid
    });
  }

  function formulirHapusCatatan(jenis, r) {
    if (!window.KG_BUKA) return;
    var ringkas = r.isi || r.ringkas || r.judul || r.pekerjaan || r.nama || r.aktivitas || r.ancaman
      || r.catatan || r.standar || '';
    if (typeof ringkas !== 'string') ringkas = '';
    window.KG_BUKA({
      title: 'Hapus ' + CATATAN[jenis].nama, sub: r.id,
      body: (ringkas ? '<div class="tile-note" style="border:0;padding:0;margin-bottom:var(--space-4)">'
          + ringkas + '</div>' : '')
        + '<div class="field"><label for="e-alasan">Alasan penghapusan <span class="req">*</span></label>'
        + '<input id="e-alasan" type="text" placeholder="Misalnya: ganda dengan HZ-2026-0451"></div>'
        + '<div class="tile-note">Catatan tidak benar-benar dibuang. Ia hilang dari daftar dan dari '
        + 'perhitungan KPI, tetapi tetap tersimpan bersama alasan ini untuk auditor.</div>',
      ok: 'Hapus Catatan', okGaya: 'danger', aksi: 'hapus-catatan:' + jenis + ':' + r.uuid
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     Formulir tambah yang lengkap (hanya saat tersambung)

     Formulir purwarupa dirancang untuk memperlihatkan alur, bukan untuk
     menangkap seluruh isian yang dibutuhkan catatannya. Sempat diisi nilai
     pengganti saat menyimpan — observasi APD selalu 100% patuh, izin kerja
     selalu di area pertama, HIRADC selalu 3×3, JSA dengan satu langkah
     "Belum diisi" berskor 1×1. Itu data K3 palsu yang tampak sah. Di sini
     setiap isian yang disimpan diisi orang, dengan komponen yang sama
     dengan formulir purwarupa.
     ───────────────────────────────────────────────────────────────── */

  function areaSaya() {
    var semua = (ACUAN && ACUAN.area) || [];
    var saya = window.KG_SAYA || {};
    if (saya.peran && saya.peran.kode === 'admin') return semua;
    return semua.filter(function (a) { return a.pabrik_id === (saya.pabrik && saya.pabrik.id); });
  }

  function pilihAreaBaru() {
    var pabrik = {};
    ((ACUAN && ACUAN.pabrik) || []).forEach(function (p) { pabrik[p.id] = p.nama; });
    var banyak = Object.keys(pabrik).length > 1;
    var opsi = areaSaya().map(function (a) {
      return '<option value="' + a.id + '">' + esc((banyak ? pabrik[a.pabrik_id] + ' — ' : '') + a.nama) + '</option>';
    }).join('');
    return bidang('area_id', 'Area', '<select' + atribut('area_id', 'Area', true) + '>' + opsi + '</select>', true);
  }

  function skala(kolom, label, nilai, kata) {
    return bidang(kolom, label, '<select' + atribut(kolom, label, true) + '>' + [1, 2, 3, 4, 5].map(function (n) {
      return '<option value="' + n + '"' + (n === nilai ? ' selected' : '') + '>' + n + ' — ' + kata[n - 1] + '</option>';
    }).join('') + '</select>', true);
  }
  var KATA_K = ['Jarang Sekali', 'Jarang', 'Mungkin', 'Sering', 'Hampir Pasti'];
  var KATA_S = ['Ringan', 'Sedang', 'Serius', 'Mayor', 'Katastropik'];

  function catatanKaki(t) { return '<div class="tile-note" style="margin-top:var(--space-4)">' + t + '</div>'; }

  /* Isian [data-kolom] di modal → objek. Kosong yang wajib ditolak di sini,
     dengan nama isiannya, sebelum modal tertutup. */
  function bacaIsian() {
    var isi = {};
    var el = document.querySelectorAll('#modal-host [data-kolom]');
    for (var i = 0; i < el.length; i++) {
      var v = String(el[i].value || '').trim();
      if (!v && el[i].hasAttribute('data-wajib')) {
        throw galatJelas('Isian "' + el[i].getAttribute('data-wajib') + '" wajib diisi.');
      }
      if (v && el[i].type === 'datetime-local') v = new Date(v).toISOString();
      if (v && el[i].type === 'number') v = Number(v);
      isi[el[i].getAttribute('data-kolom')] = v === '' ? null : v;
    }
    return isi;
  }

  function besokJam(j) {
    var d = new Date(Date.now() + 86400000);
    d.setHours(j, 0, 0, 0);
    return keLokal(d.toISOString());
  }

  /* Baris langkah JSA. Tombol "Tambah langkah" ditangani di bawah. */
  function barisLangkah(no) {
    return '<div class="card" data-langkah style="padding:var(--space-4);margin-bottom:var(--space-3)">'
      + '<div class="label-caps" style="margin-bottom:var(--space-3)">LANGKAH ' + no + '</div>'
      + '<div class="field"><label>Langkah kerja <span class="req">*</span></label><input type="text" data-l="kerja" placeholder="Apa yang dikerjakan"></div>'
      + '<div class="field"><label>Bahaya <span class="req">*</span></label><input type="text" data-l="bahaya" placeholder="Apa yang dapat mencederai"></div>'
      + '<div class="field"><label>Pengendalian</label><input type="text" data-l="kendali" placeholder="Contoh: LOTO panel, APD sarung tangan las"></div>'
      + '<div class="row2">'
      + '<div class="field"><label>Risiko awal (K × S) <span class="req">*</span></label><div class="row2">'
      + '<select data-l="kemungkinan">' + [1, 2, 3, 4, 5].map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select>'
      + '<select data-l="keparahan">' + [1, 2, 3, 4, 5].map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select></div></div>'
      + '<div class="field"><label>Risiko sisa (K × S) <span class="req">*</span></label><div class="row2">'
      + '<select data-l="kemungkinan_sisa">' + [1, 2, 3, 4, 5].map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select>'
      + '<select data-l="keparahan_sisa">' + [1, 2, 3, 4, 5].map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select></div></div>'
      + '</div></div>';
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-tambah-langkah]');
    if (!t) return;
    var wadah = document.getElementById('jsa-langkah');
    if (wadah) wadah.insertAdjacentHTML('beforeend', barisLangkah(wadah.querySelectorAll('[data-langkah]').length + 1));
  });

  /* Baris parameter hasil uji lingkungan. Daftar parameternya diambil dari
     hasil uji terakhir domain itu, supaya yang diketik hanya nilainya. */
  function barisParameter(v) {
    v = v || {};
    return '<div class="card" data-param style="padding:var(--space-4);margin-bottom:var(--space-3)">'
      + '<div class="row2">'
      + '<div class="field"><label>Parameter</label><input type="text" data-p="nama" value="' + (v.nama || '') + '" placeholder="Contoh: BOD"></div>'
      + '<div class="field"><label>Nilai hasil uji <span class="req">*</span></label><input type="text" data-p="nilai" placeholder="Contoh: 38"></div>'
      + '</div><div class="row2">'
      + '<div class="field"><label>Satuan</label><input type="text" data-p="satuan" value="' + (v.satuan || '') + '" placeholder="mg/L"></div>'
      + '<div class="field"><label>Baku mutu</label><input type="text" data-p="ambang" value="' + (v.ambang || '') + '" placeholder="Contoh: ≤ 50 atau 6,0 – 9,0"></div>'
      + '</div>'
      + '<div class="field"><label>Memenuhi baku mutu?</label><select data-p="memenuhi">'
      + '<option value="">Dihitung dari angka</option><option value="1">Memenuhi</option><option value="0">Tidak memenuhi</option>'
      + '</select><span class="hint">Bila baku mutunya berupa angka, peladen yang menghitung; pilihan ini dipakai hanya bila tidak.</span></div>'
      + '</div>';
  }

  function isiParameter(kode) {
    var wadah = document.getElementById('uji-param');
    if (!wadah) return;
    var lalu = ((window.KG.lingkungan || {})[kode] || {}).param || [];
    wadah.innerHTML = lalu.length ? lalu.map(barisParameter).join('') : barisParameter();
  }

  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'e-kode') isiParameter(e.target.value);
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-tambah-param]');
    var wadah = document.getElementById('uji-param');
    if (t && wadah) wadah.insertAdjacentHTML('beforeend', barisParameter());
  });

  function bacaParameter() {
    var baris = document.querySelectorAll('#uji-param [data-param]'), out = [];
    for (var i = 0; i < baris.length; i++) {
      var v = function (k) { var el = baris[i].querySelector('[data-p="' + k + '"]'); return el ? String(el.value || '').trim() : ''; };
      if (!v('nilai')) continue;
      if (!v('nama')) throw galatJelas('Parameter ke-' + (i + 1) + ': namanya wajib diisi.');
      var r = { nama: v('nama'), nilai: v('nilai'), satuan: v('satuan'), ambang: v('ambang') };
      if (v('memenuhi') !== '') r.memenuhi = v('memenuhi') === '1';
      out.push(r);
    }
    if (!out.length) throw galatJelas('Isi nilai sedikitnya satu parameter.');
    return out;
  }

  /* ── Templat butir periksa ──
     Daftar butir standar per jenis. Dapat disunting sebelum disimpan —
     tiap pabrik punya alat dan kebiasaan sendiri — tetapi tidak pernah
     dimulai dari satu butir kosong. APAR dan P2H forklift memakai butir
     yang sama dengan purwarupa. */
  var TEMPLAT = {
    'APAR & Hydrant': function () { return (window.KG.checklistAPAR || []).map(function (x) { return x.butir; }); },
    'P2H Forklift': function () { return (window.KG.checklistP2H || []).map(function (x) { return x.butir; }); },
    'Forklift & Alat Angkat': function () { return (window.KG.checklistP2H || []).map(function (x) { return x.butir; }); },
    'Jalur Evakuasi': ['Jalur evakuasi bebas hambatan', 'Rambu dan lampu darurat menyala', 'Pintu darurat dapat dibuka dari dalam',
      'Titik kumpul bertanda dan bebas hambatan', 'Denah evakuasi terpasang dan terbaca'],
    'P3K': ['Kotak P3K lengkap sesuai daftar isi', 'Tidak ada isi yang kedaluwarsa', 'Petugas P3K terlatih tercantum',
      'Kotak mudah dijangkau dan bertanda'],
    'Panel Listrik': ['Pintu panel tertutup dan terkunci', 'Tidak ada kabel terkelupas atau terbakar', 'Label sirkuit terbaca',
      'Area depan panel bebas 1 meter', 'Grounding terpasang', 'Tidak ada bau atau suara tidak wajar'],
    'Higiene & Sanitasi Produksi': ['Pekerja memakai penutup kepala dan masker', 'Tempat cuci tangan berfungsi dan bersabun',
      'Tidak ada hama atau tanda hama', 'Permukaan kontak pangan bersih', 'Tempat sampah tertutup'],
    'Boiler': ['Tekanan kerja dalam batas izin', 'Safety valve bertanggal uji yang berlaku', 'Level air terbaca di gelas penduga',
      'Tidak ada kebocoran uap atau bahan bakar', 'Operator bersertifikat bertugas', 'Logbook harian terisi'],
    'IPAL': ['Pompa dan blower beroperasi', 'Tidak ada luapan atau bau menyengat', 'Debit outlet tercatat',
      'Sampel harian diambil', 'Logbook operasi terisi'],
    'Pra-nyala Boiler': ['Level air normal', 'Katup bahan bakar tertutup sebelum penyalaan', 'Safety valve bebas hambatan',
      'Alarm level air rendah berfungsi', 'Ventilasi ruang boiler terbuka'],
    'Kepatuhan APD Lini Produksi': ['Helm pengaman dipakai', 'Sepatu safety dipakai', 'Masker dipakai di area berdebu',
      'Sarung tangan dipakai di area panas', 'Pelindung telinga dipakai di area bising'],
    'Kebersihan & Kerapian Area (5R)': ['Barang tidak perlu disingkirkan', 'Peralatan di tempat bertanda', 'Lantai bersih dan kering',
      'Jalur pejalan kaki bebas', 'Papan 5R diperbarui'],
    'Ruang Panel & Genset': ['Ruang bersih dan kering', 'APAR CO2 tersedia', 'Level BBM genset cukup', 'Uji jalan genset mingguan tercatat',
      'Tidak ada kebocoran oli']
  };

  function butirTemplat(jenis) {
    var t = TEMPLAT[jenis];
    var daftar = typeof t === 'function' ? t() : (t || []);
    return daftar.join('\n');
  }

  document.addEventListener('change', function (e) {
    var id = e.target && e.target.id;
    if (id !== 'e-jenis-periksa') return;
    var area = document.getElementById('e-butir');
    if (area) area.value = butirTemplat(e.target.value);
  });

  function bacaButir() {
    var el = document.getElementById('e-butir');
    var baris = String(el ? el.value : '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    if (!baris.length) throw galatJelas('Isi sedikitnya satu butir periksa.');
    return baris.map(function (b) { return { butir: b }; });
  }

  var JENIS_INSPEKSI = ['APAR & Hydrant', 'Jalur Evakuasi', 'P3K', 'Forklift & Alat Angkat', 'Panel Listrik',
                        'Higiene & Sanitasi Produksi', 'Boiler', 'IPAL'];
  var JENIS_CHECKLIST = ['P2H Forklift', 'Pra-nyala Boiler', 'Kepatuhan APD Lini Produksi',
                         'Kebersihan & Kerapian Area (5R)', 'Ruang Panel & Genset'];

  function pilihJenisPeriksa(daftar) {
    return bidang('jenis-periksa', 'Jenis', '<select id="e-jenis-periksa">' + daftar.map(function (j) {
      return '<option>' + esc(j) + '</option>'; }).join('') + '</select>', true);
  }

  var FORMULIR_BARU = {
    'inspeksi-baru': function () {
      var area = areaSaya().map(function (a) { return esc(a.nama); });
      return { title: 'Mulai Inspeksi', sub: 'Pilih jenis checklist yang akan dikerjakan',
        body: pilihJenisPeriksa(JENIS_INSPEKSI)
          + '<div class="row2">' + pilihan('area', 'Area', area, area[0]) + pilihan('jadwal', 'Jadwal', ['Harian', 'Mingguan', 'Bulanan', 'Triwulanan', 'Tahunan'], 'Bulanan') + '</div>'
          + bidang('butir', 'Butir periksa (satu per baris)', '<textarea id="e-butir" rows="8">' + esc(butirTemplat(JENIS_INSPEKSI[0])) + '</textarea>', true)
          + catatanKaki('Hasil per butir diisi lewat "Isi Hasil" pada rincian inspeksi. Jawaban "Tidak Sesuai" wajib diuraikan dan dapat dijadikan CAPA.'),
        ok: 'Mulai', toast: '' };
    },
    'checklist-mulai': function () {
      var unit = [['', '— Bukan unit/alat —']].concat(UNIT.map(function (x) {
        return [x.id, esc(x.kode + ' · ' + x.nama) + (x.status === 'Terkunci' ? ' (TERKUNCI)' : '')]; }));
      return { title: 'Kerjakan Checklist', sub: 'Alat tidak boleh beroperasi sebelum checklist selesai',
        body: pilihJenisPeriksa(JENIS_CHECKLIST)
          + '<div class="row2">' + pilihanNilai('unit_id', 'Unit / alat', unit, '', false)
          + isian('lokasi', 'Area / lokasi', '', false) + '</div>'
          + pilihan('shift', 'Shift', ['Shift 1', 'Shift 2', 'Shift 3'], 'Shift 1')
          + bidang('butir', 'Butir periksa (satu per baris)', '<textarea id="e-butir" rows="8">' + esc(butirTemplat(JENIS_CHECKLIST[0])) + '</textarea>', true)
          + catatanKaki('Satu butir dijawab "Tidak Sesuai" mengunci unitnya dari operasi. Kuncinya dibuka oleh checklist ulang pada unit yang sama yang lulus seluruhnya.'),
        ok: 'Mulai Checklist', toast: '' };
    },
    'input-uji': function () {
      var kode = 'pppa';
      var domain = [['pppa', 'PPPA — Pengendalian Pencemaran Air'], ['pppu', 'PPPU — Pengendalian Pencemaran Udara'],
                    ['plb3', 'PLB3 — Limbah B3'], ['limbah', 'Waste Management']];
      var lalu = ((window.KG.lingkungan || {})[kode] || {}).param || [];
      return { title: 'Input Hasil Uji Lingkungan', sub: 'Nilai dibandingkan otomatis dengan baku mutu',
        body: bidang('kode', 'Domain', '<select' + atribut('kode', 'Domain', true) + '>' + domain.map(function (d) {
            return '<option value="' + d[0] + '">' + d[1] + '</option>'; }).join('') + '</select>', true)
          + '<div class="row2">' + isian('tanggal', 'Tanggal pengujian', hariIni(), true, 'date')
          + isian('lab', 'Laboratorium', '', true) + '</div>'
          + isian('titik', 'Titik / sumber uji', '', false)
          + '<div class="label-caps" style="margin:var(--space-4) 0 var(--space-2)">HASIL PER PARAMETER</div>'
          + '<div id="uji-param">' + (lalu.length ? lalu.map(barisParameter).join('') : barisParameter()) + '</div>'
          + '<button type="button" class="btn btn--secondary" data-tambah-param>Tambah parameter</button>'
          + catatanKaki('Parameter yang melewati baku mutu ditandai merah di layar Lingkungan dan dihitung pada ubin "Melewati Ambang". Uji ulang pada bulan yang sama menggantikan hasil sebelumnya.'),
        ok: 'Simpan Hasil', toast: '' };
    },
    'compliance-baru': function () {
      return { title: 'Daftarkan Dokumen Kepatuhan', sub: 'Peringatan otomatis H-60, H-30, H-14, H-7',
        body: pilihan('jenis', 'Jenis', ['Sertifikat Sistem', 'Izin Lingkungan', 'Izin Peralatan', 'Pelaporan Wajib'], 'Izin Peralatan')
          + isian('judul', 'Nama dokumen', '', true)
          + '<div class="row2">' + isian('penerbit', 'Penerbit', '', true) + isian('nomor', 'Nomor dokumen', '', false) + '</div>'
          + '<div class="row2">' + isian('terbit', 'Tanggal terbit', '', false, 'date') + isian('berlaku', 'Berlaku sampai', '', true, 'date') + '</div>'
          + catatanKaki('Masa berlaku diambil dari dokumennya, tidak ditebak: dokumen tanpa tanggal berakhir tidak pernah memicu peringatan.'),
        ok: 'Daftarkan', toast: '' };
    },
    'tandai-baca': function () {
      var n = daftarKG('notifikasi').filter(function (x) { return !x.baca; }).length;
      return { title: 'Tandai Semua Terbaca', sub: 'Pemberitahuan tetap tersimpan di riwayat',
        body: '<div class="tile-note" style="border:0;padding:0">' + (n ? n + ' pemberitahuan belum dibaca akan ditandai terbaca.'
          : 'Tidak ada pemberitahuan yang belum dibaca.') + ' Item yang lewat tenggat tetap dikirim ulang setiap hari sampai ditutup di modulnya, jadi menandai terbaca tidak menghentikan pengingat.</div>',
        ok: 'Tandai Terbaca', toast: '' };
    },
    'observasi-apd': function () {
      var apd = ((ACUAN && ACUAN.jenis_apd) || []).map(function (a) {
        return '<div class="row2" style="align-items:end"><div class="field"><label>' + esc(a.nama) + '</label>'
          + '<input type="number" min="0" step="1" data-apd="' + a.id + '" placeholder="Jumlah patuh · kosong = tidak diperiksa"></div></div>';
      }).join('');
      return { title: 'Catat Observasi APD', sub: 'Kepatuhan per jenis APD per area',
        body: pilihAreaBaru()
          + '<div class="row2">' + isian('diamati', 'Jumlah pekerja diamati', 8, true, 'number')
          + isian('patuh', 'Patuh lengkap (semua APD)', '', true, 'number') + '</div>'
          + '<div class="label-caps" style="margin:var(--space-4) 0 var(--space-2)">PATUH PER JENIS APD</div>' + apd
          + paragraf('catatan', 'Catatan', '', true)
          + catatanKaki('Nama pekerja tidak dicatat. Yang diukur adalah kepatuhan per jenis APD per area, dan angkanya mengalir ke KPI Kepatuhan APD.'),
        ok: 'Simpan Observasi', toast: '' };
    },
    'izin-baru': function () {
      var jenis = ((ACUAN && ACUAN.jenis_izin) || []).map(function (j) {
        return '<option value="' + esc(j.kode) + '">' + esc(j.nama) + '</option>';
      }).join('');
      var jsa = daftarKG('jsa').map(function (j) {
        return '<option value="' + j.uuid + '">' + j.id + ' · ' + j.pekerjaan + ' (' + j.status + ')</option>';
      }).join('');
      var saya = window.KG_SAYA || {};
      return { title: 'Ajukan Izin Kerja', sub: 'JSEA wajib lengkap sebelum izin dapat diterbitkan',
        body: bidang('jenis', 'Jenis izin', '<select' + atribut('jenis', 'Jenis izin', true) + '>' + jenis + '</select>', true)
          + isian('judul', 'Uraian pekerjaan', '', true)
          + pilihAreaBaru()
          + '<div class="row2">' + isian('pelaksana', 'Pelaksana', esc(saya.nama || ''), true)
          + isian('pengawas', 'Pengawas', '', true) + '</div>'
          + '<div class="row2">' + isian('mulai', 'Mulai', besokJam(8), true, 'datetime-local')
          + isian('durasi', 'Durasi', '8 jam', false) + '</div>'
          + '<div class="row2">' + isian('pekerja', 'Jumlah pekerja', 1, true, 'number')
          + bidang('vendor', 'Pekerja vendor', '<select' + atribut('vendor', 'Pekerja vendor', true) + '><option value="0">Tidak</option><option value="1">Ya</option></select>', true) + '</div>'
          + bidang('jsa_id', 'JSA terlampir', '<select' + atribut('jsa_id', 'JSA terlampir', false) + '><option value="">Belum ada — disusun kemudian</option>' + jsa + '</select>', false)
          + catatanKaki('Izin tidak dapat diterbitkan tanpa JSA yang disahkan, dan tidak selama risiko sisa berada di zona Ekstrem (15–25).'),
        ok: 'Ajukan Izin', toast: '' };
    },
    'hiradc-baru': function () {
      var kat = (window.KG.hiradcKategori || []).map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('');
      return { title: 'Tambah Aktivitas HIRADC', sub: 'Termasuk aktivitas non-rutin dan keadaan darurat',
        body: isian('proses', 'Proses', '', true) + isian('aktivitas', 'Aktivitas', '', true)
          + '<div class="row2">' + pilihan('sifat', 'Sifat', ['Rutin', 'Non-rutin', 'Darurat'], 'Rutin')
          + bidang('kategori', 'Sumber bahaya', '<select' + atribut('kategori', 'Sumber bahaya', true) + '>' + kat + '</select>', true) + '</div>'
          + paragraf('bahaya', 'Bahaya yang teridentifikasi', '', true)
          + '<div class="row2">' + isian('risiko', 'Risiko (akibatnya)', '', true) + isian('korban', 'Yang dapat terdampak', '', true) + '</div>'
          + '<div class="row2">' + skala('kemungkinan', 'Kemungkinan (1–5)', 3, KATA_K) + skala('keparahan', 'Keparahan (1–5)', 3, KATA_S) + '</div>'
          + paragraf('kendali_ada', 'Pengendalian yang sudah ada', '', false)
          + catatanKaki('Penilaian sisa sama dengan penilaian awal sampai pengendalian tambahan benar-benar terpasang di lapangan.'),
        ok: 'Simpan Aktivitas', toast: '' };
    },
    'risiko-baru': function () {
      return { title: 'Tambah Risiko', sub: 'Tahap 2 dan 3 — identifikasi lalu analisis',
        body: isian('proses', 'Proses / area', '', true) + isian('ancaman', 'Ancaman', '', true)
          + paragraf('penyebab', 'Penyebab', '', true) + paragraf('dampak', 'Dampak', '', true)
          + '<div class="row2">' + skala('kemungkinan', 'Kemungkinan (1–5)', 3, KATA_K) + skala('keparahan', 'Keparahan (1–5)', 3, KATA_S) + '</div>'
          + pilihan('opsi', 'Opsi penanganan', ['Hindari', 'Kurangi', 'Transfer', 'Terima'], 'Kurangi')
          + paragraf('mitigasi', 'Rencana mitigasi', '', true)
          + catatanKaki('Opsi penanganan ditawarkan dalam urutan Hindari → Kurangi → Transfer → Terima.'),
        ok: 'Simpan Risiko', toast: '' };
    },
    'regulasi-baru': function () {
      return { title: 'Tambah Peraturan', sub: 'Setiap peraturan wajib punya kolom penerapan dan bukti',
        body: isian('nomor', 'Nomor peraturan', '', true) + isian('judul', 'Judul', '', true)
          + '<div class="row2">' + isian('penerbit', 'Penerbit', '', true)
          + pilihan('bidang', 'Bidang', ['K3 Umum', 'Lingkungan', 'Keselamatan Kebakaran', 'Kesehatan Kerja', 'Pesawat & Peralatan', 'Listrik', 'Bahan Kimia'], 'K3 Umum') + '</div>'
          + isian('pasal', 'Pasal yang relevan', '', true)
          + paragraf('penerapan', 'Cara Khong Guan memenuhinya', '', true)
          + catatanKaki('Baris tanpa kolom bukti dianggap belum terpenuhi. Bukti dilengkapi lewat Ubah setelah tersedia.'),
        ok: 'Simpan', toast: '' };
    },
    'jsa-baru': function () {
      return { title: 'Susun JSA Baru', sub: 'Satu JSA per jenis pekerjaan, dipakai berulang',
        body: isian('pekerjaan', 'Pekerjaan yang dianalisis', '', true)
          + '<div class="row2">' + pilihAreaBaru() + pilihan('jenis', 'Sifat pekerjaan', ['Rutin', 'Non-rutin'], 'Non-rutin') + '</div>'
          + '<div class="label-caps" style="margin:var(--space-4) 0 var(--space-2)">LANGKAH KERJA</div>'
          + '<div id="jsa-langkah">' + barisLangkah(1) + '</div>'
          + '<button type="button" class="btn btn--secondary" data-tambah-langkah>Tambah langkah</button>'
          + catatanKaki('JSA baru berstatus Draf dan belum dapat dilampirkan pada izin kerja sampai disahkan. Izin memakai skor sisa tertinggi di antara langkahnya.'),
        ok: 'Simpan JSA', toast: '' };
    }
  };

  function langkahJsa() {
    var baris = document.querySelectorAll('#jsa-langkah [data-langkah]'), out = [];
    for (var i = 0; i < baris.length; i++) {
      var v = function (k) { var el = baris[i].querySelector('[data-l="' + k + '"]'); return el ? String(el.value || '').trim() : ''; };
      if (!v('kerja') && !v('bahaya')) continue;
      if (!v('kerja') || !v('bahaya')) throw galatJelas('Langkah ' + (i + 1) + ': langkah kerja dan bahayanya wajib diisi.');
      out.push({
        nomor: out.length + 1, kerja: v('kerja'), bahaya: v('bahaya'),
        kemungkinan: Number(v('kemungkinan')), keparahan: Number(v('keparahan')),
        kemungkinan_sisa: Number(v('kemungkinan_sisa')), keparahan_sisa: Number(v('keparahan_sisa')),
        kendali: v('kendali') ? [{ hierarki: 'Administratif', teks: v('kendali') }] : []
      });
    }
    if (!out.length) throw galatJelas('JSA harus memuat sedikitnya satu langkah kerja.');
    return out;
  }

  /**
   * Pengganti isi modal purwarupa yang tidak lagi benar saat tersambung.
   * Mengembalikan null untuk aksi lain — app.js lalu memakai modal aslinya.
   */
  function aksiTersambung(kunci) {
    if (!API) return null;
    if (FORMULIR_BARU[kunci]) return FORMULIR_BARU[kunci]();
    if (kunci === 'lupa-sandi') {
      return {
        title: 'Lupa Kata Sandi', sub: 'Pengaturan ulang lewat administrator sistem',
        body: '<div class="tile-note" style="border:0;padding:0">Hubungi administrator sistem di pabrik '
          + 'Anda. Ia akan membuat tautan pengaturan ulang yang berlaku 24 jam; lewat tautan itu Anda '
          + 'menyetel sandi baru sendiri. Administrator tidak pernah mengetahui sandi Anda, jadi jangan '
          + 'pernah memberitahukannya kepada siapa pun — termasuk kepadanya.</div>',
        ok: 'Mengerti', toast: ''
      };
    }
    if (kunci === 'ganti-sandi') {
      return {
        title: 'Ganti Kata Sandi', sub: 'Sesi di perangkat lain akan diakhiri',
        body: '<div class="field"><label for="s-lama">Kata sandi saat ini <span class="req">*</span></label>'
          + '<input id="s-lama" type="password" autocomplete="current-password"></div>'
          + '<div class="field"><label for="s-baru">Kata sandi baru <span class="req">*</span></label>'
          + '<input id="s-baru" type="password" autocomplete="new-password">'
          + '<span class="hint">Minimal 10 aksara. Kalimat pendek yang mudah Anda ingat lebih kuat '
          + 'daripada kata pendek yang rumit.</span></div>'
          + '<div class="field"><label for="s-ulang">Ulangi kata sandi baru <span class="req">*</span></label>'
          + '<input id="s-ulang" type="password" autocomplete="new-password"></div>',
        ok: 'Simpan Sandi', aksi: 'ganti-sandi'
      };
    }
    return null;
  }

  /**
   * Menyimpan isi formulir yang sedang terbuka.
   *
   * Mengembalikan null bila aplikasi berjalan pada mode peragaan atau aksinya
   * belum punya endpoint — pemanggil lalu memakai perilaku purwarupa apa
   * adanya. Bila tersambung, mengembalikan janji berisi pesan yang siap
   * ditampilkan.
   */
  function simpan(aksi) {
    /* "ubah-pengguna:<uuid>" → aksi "ubah-pengguna" untuk satu catatan. */
    var bagian = String(aksi || '').split(':');
    var kunci = bagian.shift();
    var param = bagian.join(':');
    if (!API || !SIMPAN[kunci]) return null;

    var def = SIMPAN[kunci];
    var isi, jalur, segar;
    try {
      isi = def.isi(param);
      jalur = typeof def.jalur === 'function' ? def.jalur(param) : def.jalur;
      segar = typeof def.segarkan === 'function' ? def.segarkan(param) : def.segarkan;
    } catch (e) {
      return Promise.resolve(e.jelas ? e.message : 'Formulir belum dapat dibaca: ' + e.message);
    }

    return kirim(jalur, isi)
      .then(function (j) {
        /* Tren dan KPI ikut disegarkan: hampir setiap catatan masuk ke
           keduanya, dan papan yang menunjukkan delapan sementara grafiknya
           masih tujuh membuat orang ragu simpanannya berhasil. Simpanan yang
           tidak menyentuh koleksi apa pun (sandi) tidak ikut menyegarkan. */
        var ikut = segar.slice();
        var modul = (window.KG_SAYA && window.KG_SAYA.modul) || [];
        if (ikut.length && modul.indexOf('kpi') !== -1) ikut = ikut.concat(['tren', 'kpi']);
        if (ikut.length && modul.indexOf('exec') !== -1) ikut = ikut.concat(['eksekutif']);
        if (def.hasil) {
          return segarkan(ikut).then(function () { return def.hasil(j.data || {}); });
        }
        var nomor = (j.data && (j.data.nomor || j.data.kode)) || '';
        return segarkan(ikut).then(function () {
          return nomor ? 'Tersimpan. Nomor ' + nomor + '.' : 'Tersimpan.';
        });
      })
      .catch(function (e) {
        /* Penolakan aturan membawa kodenya, supaya pengisi tahu apa yang harus
           diperbaiki — bukan sekadar "gagal menyimpan". */
        return e.aturan ? e.message + ' (' + e.aturan + ')' : 'Gagal menyimpan: ' + e.message;
      });
  }

  /* Memuat ulang koleksi yang berubah, lalu menggambar ulang layar yang
     sedang terbuka. Tanpa ini catatan baru tidak muncul sampai halaman
     dimuat ulang, dan orang mengira simpanannya gagal. */
  function segarkan(koleksi) {
    var janji = (koleksi || []).map(function (nama) {
      var t = TERSAMBUNG[nama];
      if (!t) return Promise.resolve();
      return ambil(t.jalur).then(function (r) {
        /* Sama persis dengan jalur pemuatan awal, termasuk pemecahan koleksi
           gabungan. Sempat tidak: /kpi/tren disimpan utuh ke window.KG.tren
           sedangkan layar membaca trenBahaya, sehingga grafik tidak pernah
           ikut terbarui setelah menyimpan — papan menunjukkan sembilan,
           grafiknya masih delapan. */
        var hasil = UTUH[nama]
          ? PETA[nama](r.data || {})
          : (PECAH[nama] ? PETA[nama](r.data || []) : (r.data || []).map(PETA[nama]));
        if (PECAH[nama]) {
          PECAH[nama].forEach(function (k) { window.KG[k] = hasil[k]; });
        } else {
          window.KG[nama] = hasil;
        }
      }).catch(function () {});
    });
    return Promise.all(janji).then(function () {
      try {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } catch (e) {
        /* HashChangeEvent tidak ada di peramban lama; peristiwa biasa cukup. */
        var ev = document.createEvent('Event');
        ev.initEvent('hashchange', true, true);
        window.dispatchEvent(ev);
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     Masuk, keluar, dan tautan penyetel sandi
     ───────────────────────────────────────────────────────────────── */

  /**
   * Sesi dalam bentuk yang dikenal app.js — bentuk yang sama dengan akun
   * purwarupa, supaya kartu pengguna, izin modul, dan seluruh layar bekerja
   * tanpa ada yang perlu tahu dari mana sesinya datang.
   */
  function sesiDariSaya() {
    var s = window.KG_SAYA;
    if (!s) return null;
    return {
      email: s.email, nama: s.nama, inisial: s.inisial, peran: s.peran.kode,
      lokasi: s.pabrik.nama, status: 'Aktif'
    };
  }

  /**
   * Masuk dengan email dan kata sandi. Berhasil → janji berisi sesi;
   * gagal → janji ditolak dengan pesan dari peladen, apa adanya.
   */
  function masukSandi(email, sandi, ingat) {
    return kirim('/sesi/masuk', { email: email, sandi: sandi, klien: 'meja' }, true)
      .then(function (j) {
        simpanToken(j.data.token, ingat);
        PERNAH_MASUK = true;
        return tersambung().then(sesiDariSaya);
      });
  }

  /**
   * Keluar: sesi diakhiri di peladen, lalu halaman dimuat ulang.
   *
   * Dimuat ulang, bukan sekadar kembali ke layar masuk: catatan K3 orang
   * sebelumnya masih ada di memori halaman ini. Di komputer bersama, orang
   * berikutnya tidak boleh dapat menemukannya lewat konsol peramban.
   */
  function keluar(pesan) {
    var t = token();
    var akhiri = t
      ? fetch(API + '/api/v1/sesi/akhiri', {
          method: 'POST', headers: { 'Authorization': 'Bearer ' + t, 'Accept': 'application/json' }
        }).catch(function () {})
      : Promise.resolve();
    return akhiri.then(function () {
      simpanToken(null);
      try { if (pesan) sessionStorage.setItem('kg-pesan-masuk', pesan); } catch (e) {}
      location.replace(location.pathname + location.search);
    });
  }

  /* Pesan yang dititipkan sebelum halaman dimuat ulang ("sesi berakhir"). */
  function pesanMasuk() {
    try {
      var p = sessionStorage.getItem('kg-pesan-masuk');
      sessionStorage.removeItem('kg-pesan-masuk');
      return p;
    } catch (e) { return null; }
  }

  function periksaTautan(t) {
    return kirim('/sesi/tautan/periksa', { token: t }, true).then(function (j) { return j.data; });
  }

  /* Menyetel sandi lewat tautan; peladen langsung membuka sesi. */
  function pakaiTautan(t, sandi) {
    return kirim('/sesi/tautan/pakai', { token: t, sandi: sandi }, true).then(function (j) {
      simpanToken(j.data.token, true);
      return true;
    });
  }

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

      /* Kepala setiap layar menyebut pabrik dan periode. Purwarupa menulis
         "Pabrik Cibitung · September 2026" tetap; di sini keduanya milik
         pengguna dan bulan berjalan. */
      window.KG.plant = saya.peran.kode === 'admin' ? 'Seluruh Pabrik'
        : 'Pabrik ' + ((saya.pabrik && saya.pabrik.nama) || '');
      window.KG.periode = BULAN_PANJANG[new Date().getMonth()] + ' ' + new Date().getFullYear();

      /* Modul yang terbuka untuk peran ini ditentukan peladen. Daftar pada
         data purwarupa hanya salinan; bila keduanya berbeda, navigasi yang
         menawarkan modul yang lalu ditolak peladen adalah hasilnya. */
      if (window.KG.peran && window.KG.peran[saya.peran.kode]) {
        window.KG.peran[saya.peran.kode].modul = saya.modul.slice();
      }

      var janji = [];
      var hidup = [];
      var gagal = [];

      /* Data acuan diambil sekali: formulir memakai nama area, peladen
         memakai id-nya. */
      janji.push(ambil('/acuan').then(function (a) { ACUAN = a.data; }).catch(function () {}));
      if (saya.modul.indexOf('checklist') !== -1) {
        janji.push(ambil('/checklist/unit').then(function (a) { UNIT = a.data || []; }).catch(function () {}));
      }
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
               data contohnya tetap dipakai. Tetapi itu TIDAK boleh diam-diam —
               lihat peringatan setelah seluruh koleksi selesai. */
            gagal.push(koleksi);
            console.warn('[KG] ' + koleksi + ' memakai data contoh — ' + e.message);
          })
        );
      });

      return Promise.all(janji).then(function () {
        PERNAH_MASUK = true;

        /* Modul yang gagal diambil tetap menampilkan data contoh, dan itu
           harus dikatakan. Angka contoh yang tampak seperti angka sungguhan
           adalah kegagalan yang paling mahal pada sistem K3. */
        if (gagal.length && window.KG_PESAN) {
          window.KG_PESAN(gagal.length + ' modul memakai data contoh karena peladen '
            + 'tidak menjawab: ' + gagal.sort().join(', ') + '.');
        }

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
        /* Sebelum masuk memang belum ada sesi; itu keadaan biasa, bukan
           kegagalan, dan tidak perlu diumumkan. Layar masuk yang tampil
           berikutnya adalah jawabannya. */
        if (e.message !== 'sesi berakhir') {
          console.warn('[KG] gagal tersambung ke peladen (' + e.message + '); memakai data contoh.');
        }
      })
      .then(function () { muatApp(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mula);
  } else {
    mula();
  }

  return {
    ambil: ambil, kirim: kirim, token: token, simpanToken: simpanToken, api: API,
    simpan: simpan, tersambung: function () { return !!API; },
    masukSandi: masukSandi, keluar: keluar, sesiDariSaya: sesiDariSaya, pesanMasuk: pesanMasuk,
    periksaTautan: periksaTautan, pakaiTautan: pakaiTautan, aksiTersambung: aksiTersambung,
    aksiRincian: aksiRincian, jalankanAksi: jalankanAksi, ubin: ubin, hitungMenu: hitungMenu,
    tanggalBawaan: tanggalBawaan,
    ekspor: ekspor, unduh: unduh
  };
})();
