/* KG SafeGuard — penyimpanan laporan lapangan.

   Berkas ini adalah satu-satunya titik temu antara aplikasi lapangan (/m/) dan
   aplikasi meja. Keduanya berjalan pada origin yang sama, jadi keduanya membaca
   dan menulis antrean yang sama di localStorage. Laporan yang dikirim petugas di
   lapangan langsung terlihat pada modul Laporan Bahaya, Incident, Observasi
   Perilaku, dan Safety Checklist di aplikasi meja — tanpa server di antaranya.

   Dua mode, sama seperti aplikasi meja:

     Peragaan   window.KG_KONFIG.api kosong. "Mengirim" berarti menandai terkirim
                pada perangkat yang sama, dan laporannya muncul di aplikasi meja
                lewat localStorage. Inilah yang berjalan pada purwarupa.
     Tersambung Antrean dikirim ke POST /api/v1/lapangan/kirim. Peladen menjawab
                per butir: diterima beserta nomor resminya, atau ditolak beserta
                kode aturannya.

   Antrean tetap ada pada kedua mode, dan itu bukan kemewahan: sinyal di lantai
   produksi dan gudang tidak dapat diandalkan, dan laporan bahaya yang gagal
   terkirim karena sinyal adalah laporan yang tidak pernah ditulis ulang.

   Pengiriman aman diulang. Peladen mengunci pada (perangkat_id, id_lokal), jadi
   antrean yang terkirim dua kali karena sinyal putus di tengah jalan tidak
   menghasilkan dua catatan — jawabannya sama persis, ditandai diulang. */

window.KGLAP = (function () {
  'use strict';

  const KUNCI = 'kg-lapangan';
  const KUNCI_TOKEN = 'kg-token';
  const KUNCI_PERANGKAT = 'kg-perangkat';
  const KUNCI_ACUAN = 'kg-acuan';
  const BATAS_FOTO = 20;      /* foto yang disimpan; selebihnya dilepas, laporannya tetap */
  const pendengar = [];

  function baca() {
    try {
      const s = localStorage.getItem(KUNCI);
      const a = s ? JSON.parse(s) : [];
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }

  function tulis(arr) {
    try {
      localStorage.setItem(KUNCI, JSON.stringify(arr));
      return { ok: true };
    } catch (e) {
      /* Kuota penuh. Laporan lebih penting daripada fotonya, jadi foto terlama
         dilepas lebih dulu dan pengguna diberi tahu apa adanya. */
      const tanpaFoto = arr.map(function (r, i) {
        return (i < arr.length - 3 && r.foto) ? Object.assign({}, r, { foto: null, fotoDilepas: true }) : r;
      });
      try {
        localStorage.setItem(KUNCI, JSON.stringify(tanpaFoto));
        return { ok: true, fotoDilepas: true };
      } catch (e2) {
        return { ok: false, galat: 'Penyimpanan perangkat penuh' };
      }
    }
  }

  function siarkan() {
    pendengar.forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  /* Hanya sejumlah foto terbaru yang disimpan; laporannya sendiri tidak pernah dibuang. */
  function pangkasFoto(arr) {
    let sisa = BATAS_FOTO;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!arr[i].foto) continue;
      if (sisa > 0) { sisa--; continue; }
      arr[i] = Object.assign({}, arr[i], { foto: null, fotoDilepas: true });
    }
    return arr;
  }

  const AWALAN = {
    bahaya: 'HZ-L', insiden: 'INC-L', observasi: 'OBS-L', checklist: 'CHK-L',
    apd: 'APD-L', izin: 'WP-L'
  };

  function nomorBerikut(jenis) {
    const awal = AWALAN[jenis] || 'LAP';
    const punya = baca().filter(function (r) { return r.jenis === jenis; }).length;
    return awal + '-' + String(punya + 1).padStart(4, '0');
  }

  function tambah(rec) {
    const arr = baca();
    const lengkap = Object.assign({
      id: nomorBerikut(rec.jenis),
      status: 'Antre',
      dibuat: new Date().toISOString(),
      foto: null,
      koordinat: null
    }, rec);
    arr.push(lengkap);
    const hasil = tulis(pangkasFoto(arr));
    siarkan();
    return Object.assign({ rec: lengkap }, hasil);
  }

  function hapus(id) {
    tulis(baca().filter(function (r) { return r.id !== id; }));
    siarkan();
  }

  function kosongkan() { tulis([]); siarkan(); }

  /* ── Sambungan ke peladen ─────────────────────────────────────────── */

  function konfig() { return window.KG_KONFIG || {}; }
  function api() { return (konfig().api || '').replace(/\/$/, ''); }

  function token() {
    try { return localStorage.getItem(KUNCI_TOKEN); } catch (e) { return null; }
  }

  /* Penanda perangkat, dibuat sekali dan tidak pernah berubah. Inilah separuh
     kunci keidempotenan di peladen; kalau ia berubah tiap kali aplikasi dibuka,
     antrean yang dikirim ulang akan menjadi catatan kedua. */
  function perangkat() {
    try {
      let p = localStorage.getItem(KUNCI_PERANGKAT);
      if (!p) {
        p = (window.crypto && window.crypto.randomUUID)
          ? window.crypto.randomUUID()
          : 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(KUNCI_PERANGKAT, p);
      }
      return p;
    } catch (e) {
      return 'dev-tanpa-simpanan';
    }
  }

  /* Data acuan disimpan karena nama area harus diterjemahkan menjadi id sebelum
     dikirim, dan saat antrean akhirnya terkirim sinyalnya belum tentu cukup
     untuk mengambilnya lebih dulu. */
  function acuanTersimpan() {
    try { return JSON.parse(localStorage.getItem(KUNCI_ACUAN) || 'null'); } catch (e) { return null; }
  }

  function muatAcuan() {
    if (!api() || !token()) return Promise.resolve(acuanTersimpan());
    return fetch(api() + '/api/v1/acuan', {
      headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + token() }
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      try { localStorage.setItem(KUNCI_ACUAN, JSON.stringify(j.data)); } catch (e) {}
      return j.data;
    }).catch(function () { return acuanTersimpan(); });
  }

  function areaId(acuan, nama) {
    if (!acuan || !acuan.area) return null;
    for (let i = 0; i < acuan.area.length; i++) {
      if (acuan.area[i].nama === nama) return acuan.area[i].id;
    }
    return null;
  }

  /* Aplikasi lapangan dan aplikasi meja memakai dua kosakata berbeda untuk hal
     yang sama: layar lapangan menulis "Kondisi Tidak Aman", basis data menyimpan
     "Unsafe Condition". Penerjemahan dilakukan di sini, bukan dengan mengubah
     salah satu layar — dua nama untuk satu hal dalam satu daftar memecah
     penyaring, hitungan, dan laporan tanpa ada yang menyadarinya.

     "Housekeeping" dan "Peralatan" tidak punya padanan di aplikasi meja dan
     dikirim apa adanya; keduanya ditambahkan ke tabel acuan kategori_bahaya,
     bukan dipaksa masuk ke kategori lain. Memaksakannya berarti membuang
     keterangan yang sengaja dikumpulkan petugas. */
  const KATEGORI_KE_API = {
    'Kondisi Tidak Aman': 'Unsafe Condition',
    'Tindakan Tidak Aman': 'Unsafe Action',
    'Lingkungan': 'Aspek Lingkungan'
  };

  /* Izin kerja disimpan menurut kodenya, bukan nama tampilannya. Tanpa
     penerjemahan ini seluruh pengajuan izin dari lapangan ditolak peladen —
     dan ditolak dengan alasan yang tidak dapat diperbaiki petugas. */
  const JENIS_IZIN_KE_API = {
    'Panas': 'panas', 'Ruang Terbatas': 'ruang-terbatas', 'Ketinggian': 'ketinggian',
    'Listrik': 'listrik', 'Penggalian': 'penggalian'
  };

  function kategoriApi(r) {
    if (r.jenis === 'bahaya') return KATEGORI_KE_API[r.kategori] || r.kategori;
    if (r.jenis === 'izin')   return JENIS_IZIN_KE_API[r.kategori] || r.kategori;
    return r.kategori;
  }

  /* Satu butir antrean dalam bentuk yang dimengerti peladen. id_lokal adalah
     nomor sementara yang sudah tertera pada layar petugas; peladen menyimpannya
     sebagai nomor_asal supaya laporan tetap dapat dilacak ke perangkat asalnya. */
  function keBentukApi(r, acuan) {
    return {
      id_lokal: r.id,
      jenis: r.jenis,
      area_id: areaId(acuan, r.lokasi),
      isi: r.isi,
      kategori: kategoriApi(r),
      risiko: r.risiko,
      keparahan: r.keparahan,
      cedera: r.cedera,
      diamati: r.diamati,
      patuh: r.patuh,
      aman: r.aman,
      berisiko: r.berisiko,
      pengawas: r.pengawas,
      mulai: r.mulai,
      durasi: r.durasi,
      prasyarat: r.prasyarat,
      koordinat: r.koordinat
    };
  }

  /**
   * Mengirim seluruh antrean.
   *
   * Selalu mengembalikan janji, pada kedua mode, supaya pemanggilnya tidak
   * perlu tahu sedang berjalan di mode yang mana.
   */
  function kirim() {
    const antre = baca().filter(function (r) { return r.status === 'Antre'; });
    if (!antre.length) return Promise.resolve({ terkirim: 0, ditolak: 0, luring: false });

    if (!api() || !token()) return Promise.resolve(tandaiLokal(antre));

    return muatAcuan().then(function (acuan) {
      return fetch(api() + '/api/v1/lapangan/kirim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + token()
        },
        body: JSON.stringify({
          perangkat_id: perangkat(),
          kiriman: antre.map(function (r) { return keBentukApi(r, acuan); })
        })
      });
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j.galat && j.galat.pesan) || ('HTTP ' + r.status));
        return j.data.hasil || [];
      });
    }).then(function (hasil) {
      return terapkan(hasil);
    }).catch(function (e) {
      /* Gagal kirim bukan gagal simpan. Antrean tetap utuh dan dicoba lagi
         nanti; itulah sebabnya antrean ada. */
      return { terkirim: 0, ditolak: 0, luring: true, galat: e.message };
    });
  }

  /* Mode peragaan: tidak ada peladen, jadi "terkirim" berarti terlihat oleh
     aplikasi meja pada perangkat yang sama. */
  function tandaiLokal(antre) {
    const now = new Date().toISOString();
    tulis(baca().map(function (r) {
      return r.status === 'Antre' ? Object.assign({}, r, { status: 'Terkirim', dikirim: now }) : r;
    }));
    siarkan();
    return { terkirim: antre.length, ditolak: 0, luring: false };
  }

  /* Jawaban peladen diterapkan per butir. Yang ditolak TIDAK dihapus: petugas
     perlu melihat sebabnya, dan laporan yang hilang diam-diam lebih buruk
     daripada laporan yang ditolak dengan alasan. */
  function terapkan(hasil) {
    const peta = {};
    hasil.forEach(function (h) { peta[h.id_lokal] = h; });

    let terkirim = 0;
    let ditolak = 0;
    const now = new Date().toISOString();

    tulis(baca().map(function (r) {
      const h = peta[r.id];
      if (!h) return r;
      if (h.status === 'diterima') {
        terkirim++;
        return Object.assign({}, r, {
          status: 'Terkirim', dikirim: now, nomorResmi: h.nomor, diulang: h.diulang === true
        });
      }
      ditolak++;
      return Object.assign({}, r, {
        status: 'Ditolak', dikirim: now, aturan: h.aturan || null, pesanTolak: h.pesan || null
      });
    }));
    siarkan();
    return { terkirim: terkirim, ditolak: ditolak, luring: false };
  }

  function daftar(jenis) {
    const arr = baca().slice().reverse();   /* terbaru di atas */
    return jenis ? arr.filter(function (r) { return r.jenis === jenis; }) : arr;
  }

  function ringkas() {
    const arr = baca();
    return {
      total: arr.length,
      antre: arr.filter(function (r) { return r.status === 'Antre'; }).length,
      terkirim: arr.filter(function (r) { return r.status === 'Terkirim'; }).length,
      ditolak: arr.filter(function (r) { return r.status === 'Ditolak'; }).length
    };
  }

  /* Perubahan dari tab lain ikut tersiar, jadi aplikasi meja yang sedang terbuka
     memperbarui dirinya begitu laporan lapangan masuk. */
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('storage', function (e) { if (e.key === KUNCI) siarkan(); });
  }

  return {
    KUNCI: KUNCI,
    daftar: daftar,
    tambah: tambah,
    hapus: hapus,
    kosongkan: kosongkan,
    kirim: kirim,
    muatAcuan: muatAcuan,
    perangkat: perangkat,
    tersambung: function () { return !!api(); },
    ringkas: ringkas,
    nomorBerikut: nomorBerikut,
    dengar: function (fn) { pendengar.push(fn); }
  };
})();
