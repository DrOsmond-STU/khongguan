/* KG SafeGuard — penyimpanan laporan lapangan.

   Berkas ini adalah satu-satunya titik temu antara aplikasi lapangan (/m/) dan
   aplikasi meja. Keduanya berjalan pada origin yang sama, jadi keduanya membaca
   dan menulis antrean yang sama di localStorage. Laporan yang dikirim petugas di
   lapangan langsung terlihat pada modul Laporan Bahaya, Incident, Observasi
   Perilaku, dan Safety Checklist di aplikasi meja — tanpa server di antaranya.

   Pada sistem sebenarnya, fungsi kirim() di bawah adalah tempat panggilan POST ke
   API berada. Antrean tetap diperlukan: sinyal di lantai produksi dan gudang tidak
   dapat diandalkan, dan laporan bahaya yang gagal terkirim karena sinyal adalah
   laporan yang tidak pernah ditulis ulang. Yang berubah hanya isi kirim(); seluruh
   bagian lain — penomoran, antrean, dan penampilannya di modul — tetap sama. */

window.KGLAP = (function () {
  'use strict';

  const KUNCI = 'kg-lapangan';
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

  /* Di purwarupa ini "mengirim" berarti menandai terkirim pada perangkat yang sama,
     karena tidak ada server di belakangnya. Inilah satu-satunya tempat yang perlu
     diganti saat API sungguhan tersedia. */
  function kirim() {
    const arr = baca();
    const antre = arr.filter(function (r) { return r.status === 'Antre'; });
    if (!antre.length) return { terkirim: 0 };
    const now = new Date().toISOString();
    tulis(arr.map(function (r) {
      return r.status === 'Antre' ? Object.assign({}, r, { status: 'Terkirim', dikirim: now }) : r;
    }));
    siarkan();
    return { terkirim: antre.length };
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
      terkirim: arr.filter(function (r) { return r.status === 'Terkirim'; }).length
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
    ringkas: ringkas,
    nomorBerikut: nomorBerikut,
    dengar: function (fn) { pendengar.push(fn); }
  };
})();
