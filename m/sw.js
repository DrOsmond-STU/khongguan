/* KG SafeGuard Lapangan — pekerja layanan.

   Satu-satunya alasan berkas ini ada: di gudang bahan baku dan di sekitar boiler,
   sinyal hilang. Aplikasi yang menolak terbuka di tempat itu tidak akan dipakai,
   dan laporan bahaya yang gagal dibuka adalah laporan yang tidak pernah ditulis.

   Aturannya sederhana dan sengaja dibuat mudah dilacak:
   - Navigasi: coba jaringan dulu supaya pembaruan cepat terlihat, jatuh ke
     simpanan bila jaringan tidak ada.
   - Berkas statis: ambil dari simpanan dulu supaya layar terbuka seketika, lalu
     perbarui simpanan di belakang layar.
   - Berkas pihak ketiga (huruf): tidak pernah menghalangi; bila gagal, huruf
     bawaan sistem dipakai dan aplikasi tetap terbaca. */

/* Nomor versi dinaikkan setiap kali isi INTI berubah. Tanpa itu perangkat yang
   sudah memasang aplikasi tetap menyajikan salinan lama dari simpanannya, dan
   fitur yang sudah tayang di server tidak pernah sampai ke lapangan.
   v2: tab Panduan, formulir Observasi APD dan pengajuan izin kerja.
   v3: menu ikon di Beranda; berkas pendukung dipanggil dengan penanda ?v=.
   v4: antrean dikirim ke peladen; konfigurasi.js ikut disimpan.

   Penanda ?v= pada alamat di bawah harus sama persis dengan yang tertulis di
   index.html. Berkas yang sama dengan penanda berbeda adalah dua alamat yang
   berbeda bagi simpanan — itulah yang membuat pembaruan benar-benar sampai,
   dan itu pula yang membuat ketidakcocokan menjadi salinan ganda yang
   diam-diam memenuhi penyimpanan perangkat. */
const TANDA = '?v=4';
const VERSI = 'kg-lapangan-v4';
const INTI = [
  './',
  './index.html',
  './app.css' + TANDA,
  './app.js' + TANDA,
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  '../assets/tokens.css' + TANDA,
  '../assets/data.js' + TANDA,
  '../assets/konfigurasi.js' + TANDA,
  '../assets/i18n.js' + TANDA,
  '../assets/lapangan.js' + TANDA,
  '../assets/ai.js' + TANDA
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSI).then(function (c) {
      /* Satu berkas yang gagal tidak boleh menggagalkan seluruh pemasangan. */
      return Promise.all(INTI.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nama) {
      return Promise.all(nama.map(function (n) {
        return n === VERSI ? null : caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const samaAsal = url.origin === self.location.origin;

  /* Navigasi: jaringan dulu, simpanan sebagai jaring pengaman. */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        const salin = res.clone();
        caches.open(VERSI).then(function (c) { c.put('./index.html', salin); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (r) {
          return r || new Response('<!doctype html><meta charset="utf-8"><p>Aplikasi belum tersimpan untuk dipakai tanpa sinyal. Buka sekali saat ada sinyal.',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        });
      })
    );
    return;
  }

  if (!samaAsal) {
    /* Huruf dari luar: pakai simpanan bila ada, jangan pernah menahan tampilan. */
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) {
        const salin = res.clone();
        caches.open(VERSI).then(function (c) { c.put(req, salin); });
        return res;
      }).catch(function () { return new Response('', { status: 504 }); });
    }));
    return;
  }

  /* Berkas statis se-origin: simpanan dulu, perbarui di belakang layar. */
  e.respondWith(
    caches.match(req).then(function (tersimpan) {
      const jaringan = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          const salin = res.clone();
          caches.open(VERSI).then(function (c) { c.put(req, salin); });
        }
        return res;
      }).catch(function () { return tersimpan; });
      return tersimpan || jaringan;
    })
  );
});
