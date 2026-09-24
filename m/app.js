/* KG SafeGuard Lapangan — aplikasi petugas di lapangan.

   Dibangun di atas berkas yang sama dengan aplikasi meja: data.js, i18n.js, ai.js,
   dan lapangan.js. Tidak ada salinan data, tidak ada kamus terpisah, dan tidak ada
   sesi tersendiri — pengguna yang sudah masuk di salah satu aplikasi langsung masuk
   di aplikasi lainnya, karena keduanya berbagi origin yang sama.

   Yang berbeda hanyalah bentuknya. Aplikasi ini dipakai sambil berdiri di lantai
   produksi, jadi urutan prioritasnya: laporan bahaya harus selesai dalam tiga puluh
   detik, semuanya harus tetap jalan tanpa sinyal, dan tidak boleh ada satu pun
   ketukan yang tidak perlu. */

(function () {
  'use strict';

  const D = window.KG;
  const LAP = window.KGLAP;

  /* ───────── Ikon ───────── */
  const ikon = {
    /* Ikon disamakan persis dengan aplikasi meja: pin untuk laporan bahaya,
       segitiga untuk insiden. Petugas yang berpindah antaraplikasi tidak boleh
       menemukan lambang yang sama berarti dua hal berbeda. */
    bahaya: '<path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10Z"/><circle cx="12" cy="11" r="2.5"/>',
    insiden: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    mata: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    centang: '<path d="M8 5h11M8 12h11M8 19h11"/><path d="m3 5 1.4 1.4L7 3.8"/><path d="m3 12 1.4 1.4L7 10.8"/><path d="m3 19 1.4 1.4L7 17.8"/>',
    izin: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6"/><path d="m9 15 2 2 4-4"/>',
    capa: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    kamera: '<path d="M4 8h3l1.6-2.2h6.8L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8Z"/><circle cx="12" cy="13" r="3.4"/>',
    pin: '<path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10Z"/><circle cx="12" cy="11" r="2.3"/>',
    tutup: '<path d="M18 6 6 18M6 6l12 12"/>',
    kirim: '<path d="M4 12h13"/><path d="m12 6 6 6-6 6"/>',
    luring: '<path d="M2 3 22 21"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 13a10 10 0 0 1 3.3-2.2"/><path d="M19 13a10 10 0 0 0-8.3-2.9"/><path d="M12 20h.01"/>',
    cari: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.7-4.7"/>',
    lonceng: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>',
    dokumen: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M8 13h8"/>',
    keluar: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h9"/>',
    terang: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    gelap: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"/>',
    sistem: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/>',
    orang: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5"/>',
    apd: '<path d="M4 13a8 8 0 0 1 16 0"/><path d="M3 13h18"/><path d="M6.5 13V9.8"/><path d="M12 13V8.5"/><path d="M17.5 13V9.8"/><path d="M4.5 16.5h15"/>',
    jsa: '<rect x="3.5" y="3" width="17" height="18" rx="2"/><path d="M7.5 8h9M7.5 12h9M7.5 16h5"/>',
    hiradc: '<path d="M12 3.5 3 19h18L12 3.5Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    induksi: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16.5c0-1.7 1.6-3 3.5-3s3.5 1.3 3.5 3"/><path d="M15 9.5h4M15 13h3"/>',
    regulasi: '<path d="M6 3h9l4 4v14H6Z"/><path d="M15 3v4h4"/><path d="M9.5 12h6M9.5 15.5h6"/>',
    buku: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 0 4 20.5Z"/>'
  };
  const I = (p, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  const esc = (s) => window.KGAI.esc(s);
  const T = (s) => KGI18N.t(s);
  const tr = (h) => KGI18N.tr(h);

  const simpan = {
    ambil: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    taruh: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ───────── Keadaan ───────── */
  let sesi = null;
  let tab = 'beranda';
  let daring = navigator.onLine !== false;
  let draf = null;      /* isian laporan yang sedang dibuka */

  const SANDI = 'demo1234';

  function muatSesi() {
    let email = null;
    try { email = sessionStorage.getItem('kg-session') || localStorage.getItem('kg-session'); } catch (e) {}
    if (!email) return null;
    return D.pengguna.filter(function (u) { return u.email === email && u.status === 'Aktif'; })[0] || null;
  }
  function boleh(id) {
    if (!sesi) return false;
    const r = D.peran[sesi.peran];
    return !!r && r.modul.indexOf(id) !== -1;
  }

  /* ───────── Pesan singkat ───────── */
  let rotiWaktu = null;
  function roti(pesan) {
    const el = document.getElementById('roti');
    el.textContent = T(pesan);
    el.hidden = false;
    clearTimeout(rotiWaktu);
    rotiWaktu = setTimeout(function () { el.hidden = true; }, 3400);
  }

  /* ───────── Lembar geser ───────── */
  function bukaLembar(o) {
    const host = document.getElementById('lembar');
    host.innerHTML = tr(`
      <div class="tirai" data-tutup>
        <section class="lembar" role="dialog" aria-modal="true" aria-label="${esc(o.judul)}">
          <div class="lembar-pegangan"></div>
          <div class="lembar-kepala">
            <div>
              <h2>${o.judul}</h2>
              ${o.sub ? `<div class="sub">${o.sub}</div>` : ''}
            </div>
            <button type="button" class="lembar-tutup" data-tutup aria-label="Tutup">${I(ikon.tutup, 18)}</button>
          </div>
          <div class="lembar-isi">${o.isi}</div>
          ${o.aksi ? `<div class="lembar-kaki">
            <button type="button" class="tbl tbl--hantu" data-tutup>${o.batal || 'Batal'}</button>
            <button type="button" class="tbl tbl--utama" data-kirim="${o.aksi}">${o.aksiLabel}</button>
          </div>` : ''}
        </section>
      </div>`);
    host.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function tutupLembar() {
    const host = document.getElementById('lembar');
    host.hidden = true; host.innerHTML = '';
    document.body.style.overflow = '';
    draf = null;
  }

  /* ───────── Kamera ─────────
     Atribut capture membuka kamera belakang langsung di Android, bukan pemilih berkas.
     Gambar diperkecil di perangkat karena penyimpanan peramban kecil dan foto lapangan
     tidak perlu resolusi penuh untuk dipakai sebagai bukti. */
  function bacaFoto(file, selesai) {
    if (!file) return selesai(null);
    const pembaca = new FileReader();
    pembaca.onload = function () {
      const img = new Image();
      img.onload = function () {
        const maks = 900;
        const skala = Math.min(1, maks / Math.max(img.width, img.height));
        const k = document.createElement('canvas');
        k.width = Math.round(img.width * skala);
        k.height = Math.round(img.height * skala);
        k.getContext('2d').drawImage(img, 0, 0, k.width, k.height);
        try { selesai(k.toDataURL('image/jpeg', 0.66)); }
        catch (e) { selesai(null); }
      };
      img.onerror = function () { selesai(null); };
      img.src = pembaca.result;
    };
    pembaca.onerror = function () { selesai(null); };
    pembaca.readAsDataURL(file);
  }

  /* ───────── Lokasi ───────── */
  function ambilLokasi(selesai) {
    if (!navigator.geolocation) return selesai(null, 'Perangkat tidak mendukung lokasi');
    navigator.geolocation.getCurrentPosition(
      function (p) {
        selesai({ lat: p.coords.latitude, lon: p.coords.longitude, akurasi: Math.round(p.coords.accuracy) }, null);
      },
      function (err) {
        selesai(null, err.code === 1 ? 'Izin lokasi ditolak' : 'Lokasi tidak terbaca');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }

  /* ───────── Formulir laporan ─────────
     Tiga isian wajib saja untuk laporan bahaya: area, satu kalimat, dan foto bila ada.
     Segala yang dapat diisi sistem tidak ditanyakan kepada pelapor. */

  const KATEGORI_BAHAYA = ['Kondisi Tidak Aman', 'Tindakan Tidak Aman', 'Lingkungan', 'Housekeeping', 'Peralatan'];
  const JENIS_INSIDEN = ['Nearmiss', 'Incident', 'Accident'];
  const KATEGORI_OBS = D.obsKategori.map(function (o) { return o.nama; });
  const JENIS_IZIN = ['Panas', 'Ruang Terbatas', 'Ketinggian', 'Listrik', 'Penggalian'];
  const PRASYARAT_IZIN = ['APAR di lokasi', 'Gas test', 'Penjaga lubang', 'LOTO terpasang',
                          'Body harness', 'Area dibarikade', 'Ventilasi paksa'];

  function isianArea(terpilih) {
    return `
      <div class="f">
        <label for="l-area">Area kerja <span class="wajib">*</span></label>
        <select id="l-area">
          ${D.lokasi.map(function (l) {
            return `<option${l === terpilih ? ' selected' : ''}>${l}</option>`;
          }).join('')}
        </select>
      </div>`;
  }

  function isianFoto() {
    return `
      <div class="f">
        <label for="l-foto">Foto</label>
        <input id="l-foto" type="file" accept="image/*" capture="environment" hidden>
        <div class="foto-kotak" id="foto-kotak" role="button" tabindex="0">
          ${I(ikon.kamera, 26)}
          <span>Ketuk untuk memotret</span>
        </div>
        <div class="bantu">Foto diperkecil di perangkat sebelum disimpan, jadi tetap muat walau sinyal mati berhari-hari.</div>
      </div>`;
  }

  function isianLokasi() {
    return `
      <div class="f">
        <label>Titik lokasi</label>
        <div class="lokasi-kotak" id="lokasi-kotak">
          ${I(ikon.pin, 18)}
          <span id="lokasi-teks">Belum diambil</span>
          <button type="button" id="tbl-lokasi">Ambil</button>
        </div>
      </div>`;
  }

  function formBahaya() {
    return isianArea() + `
      <div class="f">
        <label for="l-isi">Apa yang Anda lihat? <span class="wajib">*</span></label>
        <textarea id="l-isi" placeholder="Satu kalimat sudah cukup. Contoh: Selang APAR A-14 bocor di sambungan."></textarea>
      </div>
      <div class="f">
        <label>Kategori</label>
        <div class="keping" id="k-kategori">
          ${KATEGORI_BAHAYA.map(function (k, i) {
            return `<button type="button" data-nilai="${k}" aria-pressed="${i === 0}">${k}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="f">
        <label>Tingkat risiko menurut Anda</label>
        <div class="keping" id="k-risiko">
          ${['Rendah', 'Sedang', 'Tinggi'].map(function (k, i) {
            return `<button type="button" data-nilai="${k}" aria-pressed="${i === 1}">${k}</button>`;
          }).join('')}
        </div>
      </div>` + isianFoto() + isianLokasi() + `
      <div class="catatan">Laporan bahaya tidak pernah menilai orang. Yang dicatat adalah kondisi dan tindakannya, bukan siapa yang melakukannya.</div>`;
  }

  function formInsiden() {
    return `
      <div class="f">
        <label>Jenis kejadian <span class="wajib">*</span></label>
        <div class="keping" id="k-jenis">
          ${JENIS_INSIDEN.map(function (k, i) {
            return `<button type="button" data-nilai="${k}" aria-pressed="${i === 0}">${k}</button>`;
          }).join('')}
        </div>
      </div>` + isianArea() + `
      <div class="f">
        <label for="l-isi">Apa yang terjadi? <span class="wajib">*</span></label>
        <textarea id="l-isi" placeholder="Urutkan kejadiannya: apa yang dikerjakan, lalu apa yang terjadi."></textarea>
      </div>
      <div class="f">
        <label>Keparahan</label>
        <div class="keping" id="k-parah">
          ${['Ringan', 'Sedang', 'Serius'].map(function (k, i) {
            return `<button type="button" data-nilai="${k}" aria-pressed="${i === 0}">${k}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="f">
        <label for="l-cedera">Ada yang cedera?</label>
        <select id="l-cedera">
          <option>Tidak ada cedera</option>
          <option>Perlu P3K</option>
          <option>Perlu perawatan medis</option>
          <option>Hilang waktu kerja</option>
        </select>
      </div>` + isianFoto() + isianLokasi() + `
      <div class="catatan">Kejadian berkeparahan Serius memicu pemberitahuan seketika ke QHSE dan Plant Manager begitu laporan terkirim.</div>`;
  }

  function formObservasi() {
    return isianArea() + `
      <div class="f">
        <label>Kategori perilaku</label>
        <div class="keping" id="k-kategori">
          ${KATEGORI_OBS.map(function (k, i) {
            return `<button type="button" data-nilai="${k}" aria-pressed="${i === 0}">${k}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="f">
        <label for="l-aman">Perilaku aman yang teramati <span class="wajib">*</span></label>
        <input id="l-aman" type="number" inputmode="numeric" min="0" value="5">
        <div class="bantu">Kolom ini diisi lebih dulu dan biasanya lebih besar. Program yang hanya mencatat pelanggaran akan berhenti dilaporkan orang.</div>
      </div>
      <div class="f">
        <label for="l-berisiko">Perilaku berisiko yang teramati</label>
        <input id="l-berisiko" type="number" inputmode="numeric" min="0" value="0">
      </div>
      <div class="f">
        <label for="l-isi">Catatan percakapan di tempat <span class="wajib">*</span></label>
        <textarea id="l-isi" placeholder="Apa yang dibicarakan dengan pekerja saat itu juga."></textarea>
      </div>` + isianLokasi() + `
      <div class="catatan">Pekerja yang diamati tidak pernah dicatat namanya. Observasi yang menamai orang berubah menjadi penilaian kinerja, dan orang berhenti jujur.</div>`;
  }

  /* Observasi APD berbeda dari observasi perilaku: yang dihitung adalah kepatuhan
     per jenis APD, bukan pola perilaku. Dipisahkan karena angkanya masuk ke KPI
     yang berbeda, dan mencampurnya membuat keduanya tidak terbaca. */
  function formApd() {
    return isianArea() + `
      <div class="f">
        <label for="l-diamati">Pekerja yang diamati <span class="wajib">*</span></label>
        <input id="l-diamati" type="number" inputmode="numeric" min="1" value="12">
      </div>
      <div class="f">
        <label>Jenis APD yang diperiksa</label>
        <div class="keping" id="k-apd">
          ${D.apdJenis.map(function (a, i) {
            return `<button type="button" data-nilai="${a.nama}" data-banyak="1" aria-pressed="${i < 3}">${a.nama}</button>`;
          }).join('')}
        </div>
        <div class="bantu">Ketuk untuk menyalakan atau mematikan. Hanya APD yang benar-benar diamati yang dinyalakan — jenis yang tidak diperiksa lebih baik kosong daripada ditebak.</div>
      </div>
      <div class="f">
        <label for="l-patuh">Memakai dengan benar <span class="wajib">*</span></label>
        <input id="l-patuh" type="number" inputmode="numeric" min="0" value="12">
        <div class="bantu">Terpasang tetapi salah pakai dihitung tidak patuh. Helm tanpa tali dagu tidak menahan apa pun saat benda jatuh.</div>
      </div>
      <div class="f">
        <label for="l-isi">Catatan <span class="wajib">*</span></label>
        <textarea id="l-isi" placeholder="Contoh: Dua operator tanpa pelindung telinga di dekat mesin oven."></textarea>
      </div>` + isianFoto() + isianLokasi() + `
      <div class="catatan">Kepatuhan APD adalah indikator leading: angkanya turun lebih dulu, jauh sebelum muncul sebagai cedera. Nama pekerja tidak dicatat.</div>`;
  }

  /* Pengajuan izin dari lapangan hanya mengajukan — tidak pernah menyetujui.
     Persetujuan tetap di aplikasi meja, pada orang yang berwenang.

     Karena itu formulir ini tidak dibatasi peran, meski modul Izin Kerja dibatasi:
     yang meminta izin justru operator yang akan mengerjakan, dan menutup jalur
     permintaannya berarti pekerjaan berisiko tinggi dimulai tanpa izin sama
     sekali — persis yang hendak dicegah. Yang dibatasi peran adalah membaca dan
     menyetujui register izin, bukan mengajukannya. */
  function formIzin() {
    return `
      <div class="f">
        <label>Jenis izin <span class="wajib">*</span></label>
        <div class="keping" id="k-jenis">
          ${JENIS_IZIN.map(function (k, i) {
            return `<button type="button" data-nilai="${k}" aria-pressed="${i === 0}">${k}</button>`;
          }).join('')}
        </div>
      </div>` + isianArea() + `
      <div class="f">
        <label for="l-isi">Pekerjaan yang akan dilakukan <span class="wajib">*</span></label>
        <textarea id="l-isi" placeholder="Contoh: Pengelasan penyangga pipa uap di atap Boiler 2."></textarea>
      </div>
      <div class="f">
        <label for="l-pengawas">Pengawas pekerjaan <span class="wajib">*</span></label>
        <input id="l-pengawas" type="text" placeholder="Nama pengawas yang berada di lokasi">
      </div>
      <div class="f">
        <label for="l-mulai">Rencana mulai</label>
        <input id="l-mulai" type="datetime-local">
      </div>
      <div class="f">
        <label for="l-durasi">Perkiraan lama kerja</label>
        <select id="l-durasi">
          <option>Kurang dari 2 jam</option>
          <option selected>2 sampai 4 jam</option>
          <option>Satu shift penuh</option>
          <option>Lebih dari satu shift</option>
        </select>
      </div>
      <div class="f">
        <label>Prasyarat yang sudah disiapkan</label>
        <div class="keping" id="k-syarat">
          ${PRASYARAT_IZIN.map(function (k) {
            return `<button type="button" data-nilai="${k}" data-banyak="1" aria-pressed="false">${k}</button>`;
          }).join('')}
        </div>
        <div class="bantu">Boleh lebih dari satu. Yang belum ditandai akan diperiksa pengawas di lokasi sebelum izin diterbitkan.</div>
      </div>` + isianFoto() + isianLokasi() + `
      <div class="catatan">Pengajuan ini belum menjadi izin. Pekerjaan baru boleh dimulai setelah izin disetujui dan prasyaratnya diperiksa di lokasi oleh pengawas.</div>`;
  }

  const FORM = {
    bahaya: { judul: 'Lapor Bahaya', sub: 'Target 30 detik · foto, area, satu kalimat', isi: formBahaya, aksiLabel: 'Kirim Laporan' },
    insiden: { judul: 'Lapor Insiden', sub: 'Kejadian, nyaris celaka, atau kecelakaan', isi: formInsiden, aksiLabel: 'Kirim Laporan' },
    observasi: { judul: 'Observasi Perilaku', sub: 'Perilaku aman dicatat lebih dulu', isi: formObservasi, aksiLabel: 'Simpan Observasi' },
    apd: { judul: 'Observasi APD', sub: 'Kepatuhan per jenis APD di satu area', isi: formApd, aksiLabel: 'Simpan Observasi' },
    izin: { judul: 'Ajukan Izin Kerja', sub: 'Pengajuan saja · persetujuan tetap di QHSE', isi: formIzin, aksiLabel: 'Ajukan Izin' }
  };

  function bukaForm(jenis) {
    const f = FORM[jenis];
    if (!f) return;
    draf = { jenis: jenis, foto: null, koordinat: null };
    bukaLembar({ judul: f.judul, sub: f.sub, isi: f.isi(), aksi: jenis, aksiLabel: f.aksiLabel });
  }

  function nilaiKeping(id, bawaan) {
    const el = document.getElementById(id);
    if (!el) return bawaan;
    const on = el.querySelector('[aria-pressed="true"]');
    return on ? on.dataset.nilai : bawaan;
  }

  function nilaiKepingBanyak(id) {
    const el = document.getElementById(id);
    if (!el) return [];
    return Array.prototype.map.call(el.querySelectorAll('[aria-pressed="true"]'), function (b) {
      return b.dataset.nilai;
    });
  }

  function kirimForm(jenis) {
    const isi = (document.getElementById('l-isi') || {}).value || '';
    const area = (document.getElementById('l-area') || {}).value || D.lokasi[0];

    if (!isi.trim()) { roti('Isian keterangan belum diisi.'); return; }

    const dasar = {
      jenis: jenis,
      lokasi: area,
      isi: isi.trim(),
      foto: draf ? draf.foto : null,
      koordinat: draf ? draf.koordinat : null,
      pelapor: sesi.nama,
      peran: (D.peran[sesi.peran] || {}).nama || sesi.peran,
      waktuTampil: waktuSekarang()
    };

    let rec;
    if (jenis === 'bahaya') {
      rec = Object.assign(dasar, {
        kategori: nilaiKeping('k-kategori', KATEGORI_BAHAYA[0]),
        risiko: nilaiKeping('k-risiko', 'Sedang')
      });
    } else if (jenis === 'insiden') {
      rec = Object.assign(dasar, {
        kategori: nilaiKeping('k-jenis', 'Nearmiss'),
        keparahan: nilaiKeping('k-parah', 'Ringan'),
        cedera: (document.getElementById('l-cedera') || {}).value || 'Tidak ada cedera'
      });
    } else if (jenis === 'apd') {
      const diamati = parseInt((document.getElementById('l-diamati') || {}).value, 10) || 0;
      let patuh = parseInt((document.getElementById('l-patuh') || {}).value, 10) || 0;
      if (!diamati) { roti('Jumlah pekerja yang diamati belum diisi.'); return; }
      /* Angka patuh tidak boleh melampaui yang diamati: kepatuhan di atas 100%
         akan merusak rata-rata KPI tanpa ada yang menyadarinya. */
      if (patuh > diamati) { roti('Jumlah patuh tidak boleh melebihi jumlah yang diamati.'); return; }
      rec = Object.assign(dasar, {
        kategori: 'Kepatuhan APD',
        diamati: diamati, patuh: patuh,
        apd: nilaiKepingBanyak('k-apd')
      });
    } else if (jenis === 'izin') {
      const pengawas = ((document.getElementById('l-pengawas') || {}).value || '').trim();
      if (!pengawas) { roti('Nama pengawas pekerjaan belum diisi.'); return; }
      rec = Object.assign(dasar, {
        kategori: nilaiKeping('k-jenis', JENIS_IZIN[0]),
        pengawas: pengawas,
        mulai: (document.getElementById('l-mulai') || {}).value || '',
        durasi: (document.getElementById('l-durasi') || {}).value || '',
        prasyarat: nilaiKepingBanyak('k-syarat')
      });
    } else {
      const aman = parseInt((document.getElementById('l-aman') || {}).value, 10) || 0;
      const berisiko = parseInt((document.getElementById('l-berisiko') || {}).value, 10) || 0;
      rec = Object.assign(dasar, {
        kategori: nilaiKeping('k-kategori', KATEGORI_OBS[0]),
        aman: aman, berisiko: berisiko
      });
    }

    const hasil = LAP.tambah(rec);
    tutupLembar();

    if (!hasil.ok) { roti('Laporan gagal disimpan: ' + hasil.galat); return; }
    if (hasil.fotoDilepas) roti(hasil.rec.id + ' tersimpan. Foto lama dilepas karena penyimpanan penuh.');
    else roti(hasil.rec.id + (daring ? ' tersimpan di antrean.' : ' tersimpan. Akan terkirim saat sinyal kembali.'));

    gambar();
  }

  function waktuSekarang() {
    const d = new Date();
    const j = String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0');
    return j + ' hari ini';
  }

  /* ───────── Menu ikon ─────────
     Sebelum ini seluruh fitur selain tiga tombol cepat hanya dapat dicapai
     lewat tab bawah, dan apa yang ada di dalam tiap tab tidak terlihat sampai
     tabnya dibuka. Petak ikon membuat seluruh isi aplikasi terlihat sekaligus
     di layar pertama — di lapangan, fitur yang tidak terlihat sama dengan
     fitur yang tidak ada.

     'boleh' berisi id modul yang harus terbuka untuk peran pengguna; petak
     tanpa 'boleh' terbuka untuk semua, karena melapor tidak pernah dibatasi
     peran — yang dibatasi adalah membaca register dan menyetujuinya. */
  const MENU = [
    { id: 'insiden',   nama: 'Lapor Insiden',  ikon: 'insiden',  aksi: 'form:insiden' },
    { id: 'observasi', nama: 'Observasi',      ikon: 'mata',     aksi: 'form:observasi' },
    { id: 'apd',       nama: 'Observasi APD',  ikon: 'apd',      aksi: 'form:apd' },
    { id: 'izin',      nama: 'Izin Kerja',     ikon: 'izin',     aksi: 'form:izin' },
    { id: 'tugas',     nama: 'Tugas',          ikon: 'centang',  aksi: 'tab:tugas', angka: 'tugas' },
    { id: 'antrean',   nama: 'Antrean Kirim',  ikon: 'kirim',    aksi: 'tab:lapor', angka: 'antre' },
    { id: 'jsa',       nama: 'Analisis JSA',   ikon: 'jsa',      aksi: 'rujukan:jsa',      boleh: 'jsa' },
    { id: 'hiradc',    nama: 'HIRADC K3',      ikon: 'hiradc',   aksi: 'rujukan:hiradc',   boleh: 'hiradc' },
    { id: 'induksi',   nama: 'Induksi K3',     ikon: 'induksi',  aksi: 'rujukan:induksi',  boleh: 'induksi' },
    { id: 'regulasi',  nama: 'Regulasi K3',    ikon: 'regulasi', aksi: 'rujukan:regulasi', boleh: 'regulasi' },
    { id: 'cari',      nama: 'Cari',           ikon: 'cari',     aksi: 'tab:panduan' },
    { id: 'saya',      nama: 'Saya',           ikon: 'orang',    aksi: 'tab:saya' }
  ];

  function menuIkon() {
    const r = LAP.ringkas();
    const nTugas = tugasHariIni().length;
    const petak = MENU.filter(function (m) { return !m.boleh || boleh(m.boleh); });

    return `<div class="menu-kisi">
      ${petak.map(function (m) {
        const n = m.angka === 'tugas' ? nTugas : m.angka === 'antre' ? r.antre : 0;
        return `<button type="button" class="menu-petak" data-menu="${m.aksi}" aria-label="${m.nama}">
          <span class="menu-ikon">${I(ikon[m.ikon], 18)}</span>
          <span class="menu-label">${m.nama}</span>
          ${n ? `<span class="menu-angka">${n}</span>` : ''}
        </button>`;
      }).join('')}
    </div>`;
  }

  /* ───────── Layar: Beranda ───────── */
  function layarBeranda() {
    const r = LAP.ringkas();
    const mendesak = D.notifikasi.filter(function (n) {
      return (n.jenis === 'critical' || n.jenis === 'high') && boleh(n.aksi || 'notif');
    }).slice(0, 3);
    const tugas = tugasHariIni();

    return `
      <div class="sorot">
        <div class="sorot-angka">238</div>
        <div class="sorot-label">hari tanpa kecelakaan hilang waktu kerja di ${D.plant}</div>
        <div class="sorot-catatan">Angka ini kembali ke nol pada kecelakaan berikutnya. Laporan Anda hari ini yang menjaganya tetap berjalan.</div>
      </div>

      <div class="aksi-cepat">
        <button type="button" class="aksi aksi--bahaya" data-form="bahaya">
          ${I(ikon.bahaya, 26)}
          <span class="aksi-teks"><b>Lapor Bahaya</b><br><span>Foto, area, satu kalimat — 30 detik</span></span>
        </button>
      </div>

      <section class="bagian">
        <div class="bagian-kepala"><h2>Menu</h2>
          <span class="sub">seluruh fitur</span></div>
        ${menuIkon()}
      </section>

      <section class="bagian">
        <div class="bagian-kepala"><h2>Tugas hari ini</h2>
          <span class="sub">${KGAI.L(tugas.length + ' butir', tugas.length + ' items')}</span></div>
        ${tugas.length
          ? tugas.map(barisTugas).join('')
          : `<div class="kosong"><b>Tidak ada tugas tertunda</b><p>Checklist shift Anda sudah selesai seluruhnya.</p></div>`}
      </section>

      ${mendesak.length ? `
      <section class="bagian">
        <div class="bagian-kepala"><h2>Perlu perhatian</h2></div>
        ${mendesak.map(function (n) {
          return `<button type="button" class="baris" data-notif="${n.id}">
            <span class="baris-ikon" style="background:var(--signal-${n.jenis === 'critical' ? 'critical' : 'high'}-bg);color:var(--signal-${n.jenis === 'critical' ? 'critical' : 'high'})">${I(ikon.lonceng, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(n.judul)}</span>
              <span class="baris-meta">${n.modul} · ${n.waktu}</span>
            </span>
          </button>`;
        }).join('')}
      </section>` : ''}

      <section class="bagian">
        <div class="bagian-kepala"><h2>Laporan saya</h2>
          <span class="sub">${KGAI.L(`${r.antre} antre · ${r.terkirim} terkirim`, `${r.antre} queued · ${r.terkirim} sent`)}</span></div>
        ${r.total
          ? LAP.daftar().slice(0, 4).map(barisLaporan).join('')
          : `<div class="kosong"><b>Belum ada laporan</b><p>Laporan yang Anda kirim dari sini langsung muncul di modul QHSE pada aplikasi meja.</p></div>`}
      </section>`;
  }

  function tugasHariIni() {
    const t = [];
    D.checklistHarian.filter(function (c) { return c.status !== 'Selesai'; }).forEach(function (c) {
      t.push({ jenis: 'checklist', id: c.id, judul: c.nama, meta: c.area + ' · ' + c.shift, nada: c.status === 'Belum Dimulai' ? 'critical' : 'medium', status: c.status });
    });
    if (boleh('capa')) {
      D.capa.filter(function (c) { return c.pj === (sesi ? sesi.nama : '') && c.status !== 'Selesai'; }).forEach(function (c) {
        t.push({ jenis: 'capa', id: c.id, judul: c.judul, meta: 'Tenggat ' + c.tenggat, nada: c.terlambat ? 'critical' : 'medium', status: c.status });
      });
    }
    return t;
  }

  function barisTugas(t) {
    return `<button type="button" class="baris" data-tugas="${t.jenis}:${t.id}">
      <span class="baris-ikon">${I(ikon[t.jenis === 'capa' ? 'capa' : 'centang'], 17)}</span>
      <span class="baris-isi">
        <span class="baris-judul">${esc(t.judul)}</span>
        <span class="baris-meta"><span class="mono mono--id">${t.id}</span> · ${esc(t.meta)}</span>
      </span>
      <span class="baris-kanan"><span class="cip cip--${t.nada}">${t.status}</span></span>
    </button>`;
  }

  function barisLaporan(r) {
    /* Ditolak berwarna merah, bukan hijau. Laporan yang ditolak peladen dan
       tampil seperti laporan yang berhasil adalah laporan yang hilang. */
    const nada = { 'Antre': 'medium', 'Ditolak': 'critical' }[r.status] || 'low';
    const label = { bahaya: 'Bahaya', insiden: 'Insiden', observasi: 'Observasi',
                    apd: 'APD', izin: 'Izin Kerja' }[r.jenis] || r.jenis;
    return `<button type="button" class="baris" data-lapor="${r.id}">
      <span class="baris-ikon">${I(ikon[r.jenis === 'observasi' ? 'mata' : r.jenis] || ikon.bahaya, 17)}</span>
      <span class="baris-isi">
        <span class="baris-judul">${esc(r.isi.slice(0, 72))}${r.isi.length > 72 ? '…' : ''}</span>
        <span class="baris-meta"><span class="mono mono--id">${r.id}</span> · ${label} · ${esc(r.lokasi)}</span>
      </span>
      <span class="baris-kanan">
        <span class="cip cip--${nada}">${r.status}</span>
        ${r.foto ? `<span class="baris-meta">foto</span>` : ''}
      </span>
    </button>`;
  }

  /* ───────── Layar: Lapor ───────── */
  function layarLapor() {
    const r = LAP.ringkas();
    return `
      <section class="bagian">
        <div class="bagian-kepala"><h2>Buat laporan</h2></div>
        <button type="button" class="aksi aksi--bahaya" data-form="bahaya" style="margin-bottom:var(--space-3)">
          ${I(ikon.bahaya, 26)}
          <span class="aksi-teks"><b>Lapor Bahaya</b><br><span>Paling sering dipakai · target 30 detik</span></span>
        </button>
        <div class="aksi-cepat">
          <button type="button" class="aksi" data-form="insiden">
            ${I(ikon.insiden, 24)}<b>Lapor Insiden</b><span>Nearmiss sampai accident</span>
          </button>
          <button type="button" class="aksi" data-form="observasi">
            ${I(ikon.mata, 24)}<b>Observasi</b><span>Perilaku aman & berisiko</span>
          </button>
          <button type="button" class="aksi" data-form="apd">
            ${I(ikon.apd, 24)}<b>Observasi APD</b><span>Kepatuhan per jenis APD</span>
          </button>
          <button type="button" class="aksi" data-form="izin">
            ${I(ikon.izin, 24)}<b>Izin Kerja</b><span>Ajukan · disetujui QHSE</span>
          </button>
        </div>
      </section>

      <section class="bagian">
        <div class="bagian-kepala"><h2>Antrean kirim</h2>
          <span class="sub">${KGAI.L(r.antre + ' menunggu', r.antre + ' waiting')}</span></div>
        ${r.total
          ? LAP.daftar().map(barisLaporan).join('') +
            (r.antre ? `<button type="button" class="tbl tbl--utama tbl--penuh" id="tbl-kirim-semua"
                style="margin-top:var(--space-3)">${I(ikon.kirim, 18)} ${KGAI.L('Kirim ' + r.antre + ' laporan', 'Send ' + r.antre + ' reports')}</button>` : '')
          : `<div class="kosong"><b>Antrean kosong</b><p>Semua laporan Anda sudah terkirim.</p></div>`}
      </section>

      <div class="catatan">Laporan disimpan di perangkat lebih dulu, baru dikirim. Di lantai produksi dan gudang sinyal sering hilang, dan laporan bahaya yang gagal terkirim adalah laporan yang tidak pernah ditulis ulang.</div>`;
  }

  /* ───────── Layar: Tugas ───────── */
  function layarTugas() {
    const cek = D.checklistHarian;
    const izin = boleh('permit') ? D.izin.filter(function (p) { return p.status === 'Aktif' || p.status.indexOf('Menunggu') === 0; }) : [];
    const capa = boleh('capa') ? D.capa.filter(function (c) { return c.pj === sesi.nama && c.status !== 'Selesai'; }) : [];

    return `
      <section class="bagian">
        <div class="bagian-kepala"><h2>Checklist shift</h2><span class="sub">${KGAI.L(cek.filter(function (c) { return c.status === 'Selesai'; }).length + '/' + cek.length + ' selesai', cek.filter(function (c) { return c.status === 'Selesai'; }).length + '/' + cek.length + ' done')}</span></div>
        ${cek.map(function (c) {
          const nada = c.status === 'Selesai' ? 'low' : c.status === 'Belum Dimulai' ? 'critical' : 'medium';
          return `<button type="button" class="baris" data-tugas="checklist:${c.id}">
            <span class="baris-ikon">${I(ikon.centang, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(c.nama)}</span>
              <span class="baris-meta"><span class="mono mono--id">${c.id}</span> · ${esc(c.area)} · ${c.selesai}/${c.butir} butir</span>
            </span>
            <span class="baris-kanan"><span class="cip cip--${nada}">${c.status}</span></span>
          </button>`;
        }).join('')}
      </section>

      ${izin.length ? `
      <section class="bagian">
        <div class="bagian-kepala"><h2>Izin kerja berjalan</h2><span class="sub">${KGAI.L(izin.length + ' izin', izin.length + ' permits')}</span></div>
        ${izin.map(function (p) {
          const nada = p.zona === 'Ekstrem' ? 'critical' : p.zona === 'Tinggi' ? 'high' : 'medium';
          return `<button type="button" class="baris" data-izin="${p.id}">
            <span class="baris-ikon">${I(ikon.izin, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(p.judul)}</span>
              <span class="baris-meta"><span class="mono mono--id">${p.id}</span> · Izin ${p.jenis} · ${esc(p.pelaksana)}</span>
            </span>
            <span class="baris-kanan"><span class="cip cip--${nada}">${p.status}</span></span>
          </button>`;
        }).join('')}
      </section>` : ''}

      ${capa.length ? `
      <section class="bagian">
        <div class="bagian-kepala"><h2>CAPA saya</h2><span class="sub">${KGAI.L(capa.length + ' terbuka', capa.length + ' open')}</span></div>
        ${capa.map(function (c) {
          return `<button type="button" class="baris" data-tugas="capa:${c.id}">
            <span class="baris-ikon">${I(ikon.capa, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(c.judul)}</span>
              <span class="baris-meta"><span class="mono mono--id">${c.id}</span> · Tenggat ${c.tenggat}</span>
            </span>
            <span class="baris-kanan"><span class="cip cip--${c.terlambat ? 'critical' : 'medium'}">${c.terlambat ? 'Lewat' : c.status}</span></span>
          </button>`;
        }).join('')}
      </section>` : ''}

      <div class="catatan">Satu butir dijawab Tidak Sesuai mengunci unit dari operasi sampai temuannya ditutup. Ini gerbang operasi, bukan peringatan yang bisa dilewati.</div>`;
  }

  /* ───────── Layar: Panduan ─────────
     Satu tab untuk segala yang perlu dibaca di lokasi, bukan diisi: pencarian
     seluruh sistem, ditambah empat rujukan yang paling sering ditanyakan di
     lantai produksi. Semuanya sudah tersimpan di perangkat, jadi terbaca ketika
     sinyal mati — justru saat pekerja paling perlu membacanya. */
  let cariQ = '';
  let rujukanBuka = null;

  const RUJUKAN = [
    { id: 'jsa', nama: 'Analisis JSA', ikon: 'jsa', sub: 'Langkah kerja & pengendaliannya' },
    { id: 'hiradc', nama: 'HIRADC K3', ikon: 'hiradc', sub: 'Bahaya per aktivitas & skornya' },
    { id: 'induksi', nama: 'Induksi K3', ikon: 'induksi', sub: 'Materi wajib & masa berlaku kartu' },
    { id: 'regulasi', nama: 'Regulasi K3', ikon: 'regulasi', sub: 'Peraturan & penerapannya di sini' }
  ];

  function layarPanduan() {
    /* Rujukan mengikuti peran yang sama dengan aplikasi meja. Petugas Lingkungan
       tidak membuka JSA dan HIRADC di sana, jadi tidak membukanya di sini juga —
       dua daftar modul yang berbeda untuk orang yang sama adalah cara tercepat
       membuat matriks hak akses berhenti dipercaya. */
    const rujukan = RUJUKAN.filter(function (r) { return boleh(r.id); });
    if (rujukanBuka && !boleh(rujukanBuka)) rujukanBuka = null;
    if (rujukanBuka) return layarRujukan(rujukanBuka);
    return `
      <div class="cari-kotak">
        ${I(ikon.cari, 18)}
        <input id="cari-q" type="search" inputmode="search" value="${esc(cariQ)}"
               placeholder="Cari catatan, dokumen, nomor — misalnya: boiler">
      </div>
      <div class="keping" id="cari-contoh" style="margin-bottom:var(--space-4)">
        ${['boiler', 'forklift', 'limbah B3', 'APAR', 'ruang terbatas'].map(function (c) {
          return `<button type="button" data-contoh="${c}">${c}</button>`;
        }).join('')}
      </div>
      ${cariQ.trim() ? `<div id="cari-hasil">${hasilCari()}</div>` : `
      ${rujukan.length ? `<section class="bagian">
        <div class="bagian-kepala"><h2>Rujukan K3</h2>
          <span class="sub">tersimpan di perangkat</span></div>
        <div class="aksi-cepat">
          ${rujukan.map(function (r) {
            return `<button type="button" class="aksi" data-rujukan="${r.id}">
              ${I(ikon[r.ikon], 24)}<b>${r.nama}</b><span>${r.sub}</span>
            </button>`;
          }).join('')}
        </div>
      </section>` : ''}
      <div id="cari-hasil"></div>
      <div class="catatan">Kotak di atas mencari seluruh isi sistem — prosedur, izin, insiden, CAPA, temuan audit, sertifikat — dan semuanya terbaca tanpa sinyal.</div>`}`;
  }

  function kembaliRujukan(judul, sub) {
    return `<button type="button" class="baris" id="rujukan-kembali" style="margin-bottom:var(--space-4)">
      <span class="baris-ikon">${I(ikon.cari, 17)}</span>
      <span class="baris-isi">
        <span class="baris-judul">${judul}</span>
        <span class="baris-meta">${sub}</span>
      </span>
    </button>`;
  }

  /* Warna zona dipakai persis seperti di aplikasi meja. Angka yang sama tidak
     boleh berwarna lain hanya karena layarnya lebih kecil. */
  function zonaNada(n) {
    return n >= 15 ? 'critical' : n >= 10 ? 'high' : n >= 5 ? 'medium' : 'low';
  }
  function zonaNama(n) {
    return n >= 15 ? 'Ekstrem' : n >= 10 ? 'Tinggi' : n >= 5 ? 'Sedang' : 'Rendah';
  }

  function layarRujukan(id) {
    if (id === 'jsa') return rujukanJsa();
    if (id === 'hiradc') return rujukanHiradc();
    if (id === 'induksi') return rujukanInduksi();
    return rujukanRegulasi();
  }

  function rujukanJsa() {
    return kembaliRujukan('Analisis JSA', 'kembali ke Panduan') + `
      <section class="bagian">
        <div class="bagian-kepala"><h2>JSA yang berlaku</h2>
          <span class="sub">${KGAI.L(D.jsa.length + ' pekerjaan', D.jsa.length + ' jobs')}</span></div>
        ${D.jsa.map(function (j) {
          const sisa = j.langkah.reduce(function (m, x) { return Math.max(m, x.sk * x.ss); }, 0);
          return `<button type="button" class="baris" data-jsa="${j.id}">
            <span class="baris-ikon">${I(ikon.jsa, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(j.pekerjaan)}</span>
              <span class="baris-meta"><span class="mono mono--id">${j.id}</span> · ${esc(j.area)} · ${j.langkah.length} langkah</span>
            </span>
            <span class="baris-kanan"><span class="cip cip--${zonaNada(sisa)}">${sisa}</span></span>
          </button>`;
        }).join('')}
      </section>
      <div class="catatan">Angka di kanan adalah risiko sisa tertinggi setelah pengendalian dipasang — bukan risiko awal. JSA dibaca sebelum pekerjaan dimulai, bukan setelah izin ditandatangani.</div>`;
  }

  function rujukanHiradc() {
    const urut = D.hiradc.slice().sort(function (a, b) { return b.sk * b.sp - a.sk * a.sp; });
    return kembaliRujukan('HIRADC K3', 'kembali ke Panduan') + `
      <section class="bagian">
        <div class="bagian-kepala"><h2>Sumber bahaya</h2></div>
        <div class="keping" style="margin-bottom:var(--space-3)">
          ${D.hiradcKategori.map(function (k) {
            const n = D.hiradc.filter(function (h) { return h.kategori === k; }).length;
            return `<button type="button" disabled aria-pressed="false">${k} · ${n}</button>`;
          }).join('')}
        </div>
      </section>
      <section class="bagian">
        <div class="bagian-kepala"><h2>Aktivitas dinilai</h2>
          <span class="sub">${KGAI.L('risiko sisa tertinggi di atas', 'highest residual first')}</span></div>
        ${urut.map(function (h) {
          const sisa = h.sk * h.sp;
          return `<button type="button" class="baris" data-hiradc="${h.id}">
            <span class="baris-ikon">${I(ikon.hiradc, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(h.bahaya)}</span>
              <span class="baris-meta"><span class="mono mono--id">${h.id}</span> · ${esc(h.aktivitas)}</span>
            </span>
            <span class="baris-kanan"><span class="cip cip--${zonaNada(sisa)}">${sisa}</span></span>
          </button>`;
        }).join('')}
      </section>
      <div class="catatan">HIRADC menilai aktivitas, bukan orang. Aktivitas non-rutin dan keadaan darurat ikut dinilai karena justru di sanalah pengendalian rutin tidak berlaku.</div>`;
  }

  function rujukanInduksi() {
    const menit = D.induksiMateri.reduce(function (a, m) { return a + m.menit; }, 0);
    const saya = D.induksi.filter(function (r) { return sesi && r.nama === sesi.nama; })[0];
    return kembaliRujukan('Induksi K3', 'kembali ke Panduan') + `
      ${saya ? `<section class="bagian">
        <div class="bagian-kepala"><h2>Kartu induksi Anda</h2></div>
        <div class="kartu">
          <dl class="kv">
            <dt>Nomor</dt><dd class="mono mono--id">${saya.id}</dd>
            <dt>Jenis</dt><dd>${esc(saya.jenis)}</dd>
            <dt>Berlaku sampai</dt><dd>${esc(saya.berlaku)}</dd>
            <dt>Status</dt><dd><span class="cip cip--${saya.status === 'Berlaku' ? 'low' : saya.status === 'Segera Berakhir' ? 'high' : 'critical'}">${saya.status}</span></dd>
          </dl>
        </div>
      </section>` : ''}

      <section class="bagian">
        <div class="bagian-kepala"><h2>Materi wajib</h2>
          <span class="sub">${KGAI.L(D.induksiMateri.length + ' topik · ' + menit + ' menit', D.induksiMateri.length + ' topics · ' + menit + ' min')}</span></div>
        ${D.induksiMateri.map(function (m) {
          return `<button type="button" class="baris" data-materi="${m.no}">
            <span class="baris-ikon">${I(ikon.induksi, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(m.topik)}</span>
              <span class="baris-meta">${m.menit} menit · ${esc(m.inti)}</span>
            </span>
          </button>`;
        }).join('')}
      </section>
      <div class="catatan">Kartu induksi adalah gerbang masuk area produksi. Kartu yang kedaluwarsa berarti tidak boleh masuk — bukan sekadar catatan administrasi yang tertunda.</div>`;
  }

  function rujukanRegulasi() {
    return kembaliRujukan('Regulasi K3', 'kembali ke Panduan') + `
      <section class="bagian">
        <div class="bagian-kepala"><h2>Peraturan yang berlaku</h2>
          <span class="sub">${KGAI.L(D.regulasi.length + ' peraturan', D.regulasi.length + ' regulations')}</span></div>
        ${D.regulasi.map(function (r) {
          const nada = r.status === 'Tidak Terpenuhi' ? 'critical' : r.status === 'Terpenuhi Sebagian' ? 'high' : 'low';
          return `<button type="button" class="baris" data-regulasi="${r.id}">
            <span class="baris-ikon">${I(ikon.regulasi, 17)}</span>
            <span class="baris-isi">
              <span class="baris-judul">${esc(r.judul)}</span>
              <span class="baris-meta">${esc(r.nomor)} · ${esc(r.bidang)}</span>
            </span>
            <span class="baris-kanan"><span class="cip cip--${nada}">${r.status}</span></span>
          </button>`;
        }).join('')}
      </section>
      <div class="catatan">Peraturan tanpa kolom penerapan dan bukti hanyalah daftar bacaan. Yang diperiksa auditor adalah dua kolom itu, bukan jumlah peraturan yang terdaftar.</div>`;
  }

  /* ───────── Rincian rujukan ───────── */
  function rincianJsa(id) {
    const j = D.jsa.filter(function (x) { return x.id === id; })[0];
    if (!j) return;
    bukaLembar({
      judul: j.pekerjaan, sub: `<span class="mono mono--id">${j.id}</span> · <span>${esc(j.area)}</span>`,
      isi: `<dl class="kv">
          <dt>Jenis pekerjaan</dt><dd>${esc(j.jenis)}</dd>
          <dt>APD wajib</dt><dd>${esc(j.apd.join(', '))}</dd>
          <dt>Izin kerja terkait</dt><dd>${j.izinTerkait.length ? esc(j.izinTerkait.join(', ')) : 'tidak memerlukan izin khusus'}</dd>
          <dt>Disahkan</dt><dd>${esc(j.pengesah)} · ${esc(j.disahkan)}</dd>
          <dt>Tinjau berikutnya</dt><dd>${esc(j.tinjau)}</dd>
        </dl>
        <div class="bagian-kepala" style="margin-top:var(--space-5)"><h2>Langkah kerja</h2></div>
        ${j.langkah.map(function (x) {
          const awal = x.k * x.s, sisa = x.sk * x.ss;
          return `<div class="kartu" style="margin-bottom:var(--space-3)">
            <div class="label-kecil">Langkah ${x.no}</div>
            <div style="font-size:14.5px;font-weight:600;margin:4px 0 var(--space-2)">${esc(x.kerja)}</div>
            <div style="font-size:13.5px;line-height:20px;color:var(--ink-700)">${esc(x.bahaya)}</div>
            <ul style="margin:var(--space-3) 0 0;padding-left:18px;font-size:13px;line-height:20px">
              ${x.kendali.map(function (k) {
                return `<li><b>${k[0]}</b> — ${esc(k[1])}</li>`;
              }).join('')}
            </ul>
            <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
              <span class="cip cip--${zonaNada(awal)}">Awal ${awal}</span>
              <span class="cip cip--${zonaNada(sisa)}">Sisa ${sisa}</span>
            </div>
          </div>`;
        }).join('')}`
    });
  }

  function rincianHiradc(id) {
    const h = D.hiradc.filter(function (x) { return x.id === id; })[0];
    if (!h) return;
    const awal = h.k * h.p, sisa = h.sk * h.sp;
    bukaLembar({
      judul: h.bahaya, sub: `<span class="mono mono--id">${h.id}</span> · <span>${esc(h.kategori)}</span>`,
      isi: `<div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4)">
          <span class="cip cip--${zonaNada(awal)}">Awal ${awal} · ${zonaNama(awal)}</span>
          <span class="cip cip--${zonaNada(sisa)}">Sisa ${sisa} · ${zonaNama(sisa)}</span>
        </div>
        <dl class="kv">
          <dt>Proses</dt><dd>${esc(h.proses)}</dd>
          <dt>Aktivitas</dt><dd>${esc(h.aktivitas)} · ${esc(h.rutin)}</dd>
          <dt>Risiko</dt><dd>${esc(h.risiko)}</dd>
          <dt>Yang terpapar</dt><dd>${esc(h.korban)}</dd>
          <dt>Penilaian awal</dt><dd>${KGAI.L(
            `kemungkinan ${h.k} × keparahan ${h.p} = ${awal}`,
            `likelihood ${h.k} × severity ${h.p} = ${awal}`)}</dd>
          <dt>Pengendalian yang sudah ada</dt><dd>${esc(h.kendaliAda)}</dd>
          <dt>Penilaian sisa</dt><dd>${KGAI.L(
            `kemungkinan ${h.sk} × keparahan ${h.sp} = ${sisa}`,
            `likelihood ${h.sk} × severity ${h.sp} = ${sisa}`)}</dd>
          <dt>Pengendalian tambahan</dt><dd>${esc(h.kendaliTambah)}</dd>
          <dt>Hierarki</dt><dd>${esc(h.hierarki)}</dd>
          <dt>Penanggung jawab</dt><dd>${esc(h.pj)} · target ${esc(h.target)}</dd>
          <dt>Status</dt><dd>${esc(h.status)}</dd>
        </dl>`
    });
  }

  function rincianMateri(no) {
    const m = D.induksiMateri.filter(function (x) { return String(x.no) === String(no); })[0];
    if (!m) return;
    bukaLembar({
      judul: m.topik, sub: `<span>Materi induksi ${m.no}</span> · <span>${m.menit} menit</span>`,
      isi: `<p style="font-size:14.5px;line-height:22px;margin:0">${esc(m.inti)}</p>`
    });
  }

  function rincianRegulasi(id) {
    const r = D.regulasi.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    bukaLembar({
      judul: r.judul, sub: `<span class="mono mono--id">${r.id}</span> · <span>${esc(r.bidang)}</span>`,
      isi: `<dl class="kv">
          <dt>Nomor</dt><dd>${esc(r.nomor)}</dd>
          <dt>Penerbit</dt><dd>${esc(r.penerbit)}</dd>
          <dt>Pasal terkait</dt><dd>${esc(r.pasal)}</dd>
          <dt>Penerapan di Khong Guan</dt><dd>${esc(r.penerapan)}</dd>
          <dt>Bukti</dt><dd>${esc(r.bukti)}</dd>
          <dt>Penanggung jawab</dt><dd>${esc(r.pj)}</dd>
          <dt>Evaluasi berikutnya</dt><dd>${esc(r.evaluasi)}</dd>
          <dt>Status pemenuhan</dt><dd>${esc(r.status)}</dd>
        </dl>`
    });
  }

  function hasilCari() {
    if (!cariQ.trim()) {
      return `<div class="kosong">${I(ikon.cari, 24)}<b>Cari apa saja di sistem</b>
        <p>Prosedur, izin, insiden, CAPA, temuan audit, sertifikat — semuanya terindeks dan dapat dibuka di sini tanpa sinyal.</p></div>`;
    }
    const r = window.KGAI.cari(cariQ, 'semua');
    const grup = r.grup.filter(function (g) { return boleh(g.rute); });
    const total = grup.reduce(function (a, g) { return a + g.hits.length; }, 0);
    const disaring = r.total - total;

    if (!total) {
      return `<div class="kosong"><b>Tidak ada yang cocok</b>
        <p>${disaring ? disaring + ' catatan cocok tetapi berada di modul yang tidak terbuka untuk peran Anda.'
                      : 'Seluruh kata yang diketik harus muncul pada catatan yang sama. Coba kurangi kata.'}</p></div>`;
    }

    return grup.map(function (g) {
      return `<div class="hasil-grup"><span>${g.modul}</span> · <span>${KGAI.L(g.hits.length + ' catatan', g.hits.length + ' records')}</span></div>` +
        g.hits.slice(0, 6).map(function (h) {
          return `<button type="button" class="baris" data-hasil="${esc(h.rec.id)}">
            <span class="baris-isi">
              <span class="baris-judul">${esc(h.rec.judul)}</span>
              <span class="baris-meta">${h.rec.id ? `<span class="mono mono--id">${esc(h.rec.id)}</span> · ` : ''}${h.cuplik}</span>
            </span>
          </button>`;
        }).join('');
    }).join('') + (disaring ? `<div class="catatan">${KGAI.L(
      `${disaring} catatan lain juga cocok, tetapi berada di modul yang tidak terbuka untuk peran Anda.`,
      `${disaring} further records also match, but sit in modules your role cannot open.`)}</div>` : '');
  }

  /* ───────── Layar: Saya ───────── */
  function layarSaya() {
    const r = LAP.ringkas();
    const tema = simpan.ambil('kg-theme') || 'system';
    const bahasa = KGI18N.lang;
    return `
      <div class="kartu" style="display:flex;gap:var(--space-4);align-items:center">
        <span class="avatar" style="width:52px;height:52px;background:var(--brand-050);color:var(--brand-700);font-size:16px">${sesi.inisial}</span>
        <div style="min-width:0">
          <div style="font-size:16px;font-weight:700">${esc(sesi.nama)}</div>
          <div style="font-size:13px;color:var(--ink-500)">${T((D.peran[sesi.peran] || {}).nama)} · ${esc(sesi.lokasi)}</div>
          <div style="font-size:12px;color:var(--ink-500);margin-top:2px">${esc(sesi.email)}</div>
        </div>
      </div>

      <section class="bagian">
        <div class="bagian-kepala"><h2>Sinkronisasi</h2></div>
        <div class="kartu">
          <div style="display:flex;gap:var(--space-4);text-align:center">
            <div style="flex:1"><div class="mono" style="font-size:24px;font-weight:600">${r.antre}</div><div class="label-kecil">ANTRE</div></div>
            <div style="flex:1"><div class="mono" style="font-size:24px;font-weight:600">${r.terkirim}</div><div class="label-kecil">TERKIRIM</div></div>
            <div style="flex:1"><div class="mono" style="font-size:24px;font-weight:600">${r.total}</div><div class="label-kecil">TOTAL</div></div>
          </div>
          ${r.antre ? `<button type="button" class="tbl tbl--utama tbl--penuh" id="tbl-kirim-semua" style="margin-top:var(--space-4)">${I(ikon.kirim, 18)} Kirim sekarang</button>` : ''}
          <div class="bantu" style="margin-top:var(--space-3);font-size:12.5px;line-height:18px;color:var(--ink-500)">${
            KGAI.L(`Status jaringan saat ini ${daring ? 'daring' : 'luring'}. Laporan tersimpan di perangkat lebih dulu dan tidak pernah hilang karena sinyal.`,
                   `The network is currently ${daring ? 'online' : 'offline'}. Reports are stored on the device first and are never lost to a dropped signal.`)}</div>
        </div>
      </section>

      <section class="bagian">
        <div class="bagian-kepala"><h2>Tampilan</h2></div>
        <div class="kartu">
          <div class="label-kecil" style="margin-bottom:var(--space-2)">TEMA</div>
          <div class="keping" id="k-tema" style="margin-bottom:var(--space-4)">
            <button type="button" data-tema="light" aria-pressed="${tema === 'light'}">${I(ikon.terang, 16)} Terang</button>
            <button type="button" data-tema="dark" aria-pressed="${tema === 'dark'}">${I(ikon.gelap, 16)} Gelap</button>
            <button type="button" data-tema="system" aria-pressed="${tema !== 'light' && tema !== 'dark'}">${I(ikon.sistem, 16)} Sistem</button>
          </div>
          <div class="label-kecil" style="margin-bottom:var(--space-2)">BAHASA</div>
          <div class="keping" id="k-bahasa">
            <button type="button" data-bahasa="id" aria-pressed="${bahasa === 'id'}">Indonesia</button>
            <button type="button" data-bahasa="en" aria-pressed="${bahasa === 'en'}">English</button>
          </div>
          <div class="bantu" style="margin-top:var(--space-3);font-size:12.5px;color:var(--ink-500)">
            Pilihan ini sama dengan aplikasi meja. Mengubahnya di sini ikut berubah di sana.
          </div>
        </div>
      </section>

      <section class="bagian">
        <div class="bagian-kepala"><h2>Aplikasi meja</h2></div>
        <a class="baris" href="../" style="text-decoration:none;color:inherit">
          <span class="baris-ikon">${I(ikon.dokumen, 17)}</span>
          <span class="baris-isi">
            <span class="baris-judul">Buka KG SafeGuard lengkap</span>
            <span class="baris-meta">25 modul · laporan Anda sudah ada di sana</span>
          </span>
        </a>
      </section>

      <button type="button" class="tbl tbl--penuh" id="tbl-keluar" style="color:var(--signal-critical)">
        ${I(ikon.keluar, 18)} Keluar
      </button>

      <div class="catatan">Aplikasi ini adalah purwarupa. Seluruh isinya data rekaan, dan laporan yang Anda kirim tersimpan di perangkat ini saja — tidak ada server di belakangnya. Jangan memakai kata sandi sungguhan di layar masuk.</div>`;
  }

  /* ───────── Rincian ───────── */
  function rincianLaporan(id) {
    const r = LAP.daftar().filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    const label = { bahaya: 'Laporan Bahaya', insiden: 'Laporan Insiden', observasi: 'Observasi Perilaku',
                    apd: 'Observasi APD', izin: 'Pengajuan Izin Kerja' }[r.jenis] || r.jenis;
    bukaLembar({
      judul: r.id, sub: `<span>${label}</span> · <span>${r.status}</span>`,
      isi: (r.foto ? `<img src="${r.foto}" alt="Foto laporan ${r.id}" style="width:100%;border-radius:var(--radius-md);margin-bottom:var(--space-4)">` : '') + `
        <dl class="kv">
          <dt>Keterangan</dt><dd>${esc(r.isi)}</dd>
          <dt>Area</dt><dd>${esc(r.lokasi)}</dd>
          ${r.kategori ? `<dt>Kategori</dt><dd>${esc(r.kategori)}</dd>` : ''}
          ${r.risiko ? `<dt>Risiko menurut pelapor</dt><dd>${esc(r.risiko)}</dd>` : ''}
          ${r.keparahan ? `<dt>Keparahan</dt><dd>${esc(r.keparahan)}</dd>` : ''}
          ${r.cedera ? `<dt>Cedera</dt><dd>${esc(r.cedera)}</dd>` : ''}
          ${r.aman != null ? `<dt>Perilaku aman / berisiko</dt><dd>${r.aman} / ${r.berisiko}</dd>` : ''}
          ${r.diamati != null ? `<dt>Diamati / patuh</dt><dd>${r.patuh} dari ${r.diamati} · <span class="mono">${Math.round(r.patuh / r.diamati * 100)}%</span></dd>` : ''}
          ${r.apd && r.apd.length ? `<dt>Jenis APD diperiksa</dt><dd>${esc(r.apd.join(', '))}</dd>` : ''}
          ${r.pengawas ? `<dt>Pengawas pekerjaan</dt><dd>${esc(r.pengawas)}</dd>` : ''}
          ${r.durasi ? `<dt>Perkiraan lama kerja</dt><dd>${esc(r.durasi)}</dd>` : ''}
          ${r.prasyarat ? `<dt>Prasyarat disiapkan</dt><dd>${r.prasyarat.length ? esc(r.prasyarat.join(', ')) : 'belum ada yang ditandai'}</dd>` : ''}
          ${r.koordinat ? `<dt>Titik lokasi</dt><dd class="mono">${r.koordinat.lat.toFixed(5)}, ${r.koordinat.lon.toFixed(5)} · ±${r.koordinat.akurasi} m</dd>` : ''}
          ${r.fotoDilepas ? `<dt>Foto</dt><dd>Dilepas karena penyimpanan perangkat penuh. Laporannya tetap utuh.</dd>` : ''}
          <dt>Pelapor</dt><dd>${esc(r.pelapor)} · ${esc(r.peran)}</dd>
          <dt>Waktu</dt><dd>${esc(r.waktuTampil)}</dd>
          <dt>Status</dt><dd>${r.status}</dd>
          ${r.nomorResmi ? `<dt>Nomor resmi</dt><dd class="mono">${esc(r.nomorResmi)}</dd>` : ''}
          ${r.pesanTolak ? `<dt>Sebab ditolak</dt><dd>${esc(r.pesanTolak)}${r.aturan ? ` <span class="mono">(${esc(r.aturan)})</span>` : ''}</dd>` : ''}
        </dl>
        <div class="catatan">${r.status === 'Ditolak'
          ? KGAI.L(
            'Laporan ini tidak diterima peladen dan belum masuk ke modul mana pun. Perbaiki isinya lalu kirim ulang, atau hapus bila memang keliru.',
            'The server did not accept this report, so it has not entered any module. Fix it and resend, or delete it if it was a mistake.')
          : KGAI.L(
            `Laporan ini sudah terlihat di aplikasi meja pada modul ${modulUntuk(r.jenis)}, ditandai sebagai kiriman dari lapangan.`,
            `This report is already visible in the desktop app under ${modulUntuk(r.jenis)}, marked as a field submission.`)}</div>`,
      aksi: 'hapus:' + r.id, aksiLabel: 'Hapus laporan', batal: 'Tutup'
    });
  }

  function modulUntuk(jenis) {
    return { bahaya: 'Laporan Bahaya K3L', insiden: 'Incident & Nearmiss', observasi: 'Observasi Perilaku',
             apd: 'Observasi Perilaku', izin: 'Work Permit & JSEA' }[jenis] || 'QHSE';
  }

  function rincianTugas(kind, id) {
    if (kind === 'checklist') {
      const c = D.checklistHarian.filter(function (x) { return x.id === id; })[0];
      if (!c) return;
      bukaLembar({
        judul: c.nama, sub: c.id + ' · ' + c.area,
        isi: `<dl class="kv">
            <dt>Frekuensi</dt><dd>${c.frekuensi} · ${c.shift}</dd>
            <dt>Penanggung jawab</dt><dd>${esc(c.pj)}</dd>
            <dt>Kemajuan</dt><dd>${c.selesai} dari ${c.butir} butir</dd>
            <dt>Temuan</dt><dd>${c.temuan}</dd>
            <dt>Status</dt><dd>${c.status}</dd>
          </dl>
          <div class="catatan">Pada purwarupa ini butir checklist belum dapat dijawab dari aplikasi lapangan. Yang sudah berjalan adalah laporan bahaya, insiden, dan observasi.</div>`
      });
      return;
    }
    const c = D.capa.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    bukaLembar({
      judul: c.id, sub: c.sumberJenis + ' ' + c.sumber,
      isi: `<h3 style="font-size:16px;margin:0 0 var(--space-3)">${esc(c.judul)}</h3>
        <dl class="kv">
          <dt>Penanggung jawab</dt><dd>${esc(c.pj)}</dd>
          <dt>Terbit</dt><dd>${c.terbit}</dd>
          <dt>Tenggat</dt><dd>${c.tenggat}${c.terlambat ? ' — sudah lewat' : ''}</dd>
          <dt>Prioritas</dt><dd>${c.prioritas}</dd>
          <dt>Status</dt><dd>${c.status}</dd>
        </dl>
        <div class="catatan">Pemindahan ke Selesai hanya oleh petugas QHSE, dengan bukti terlampir.</div>`
    });
  }

  function rincianIzin(id) {
    const p = D.izin.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    bukaLembar({
      judul: p.id, sub: 'Izin ' + p.jenis + ' · ' + p.mulai,
      isi: `<h3 style="font-size:16px;margin:0 0 var(--space-3)">${esc(p.judul)}</h3>
        <dl class="kv">
          <dt>Pelaksana</dt><dd>${esc(p.pelaksana)}</dd>
          <dt>Pengawas</dt><dd>${esc(p.pengawas)}</dd>
          <dt>Pekerja</dt><dd>${p.pekerja} orang</dd>
          <dt>Risiko</dt><dd>${p.risikoAwal} → ${p.risikoSisa} (zona ${p.zona})</dd>
          <dt>Status</dt><dd>${p.status}</dd>
          <dt>Prasyarat</dt><dd>${(p.prasyarat || []).join(' · ')}</dd>
        </dl>
        <div class="catatan">Izin kerja tidak berstatus Aktif sebelum seluruh langkah persetujuan selesai dan JSEA-nya lengkap.</div>`
    });
  }

  function rincianNotif(id) {
    const n = D.notifikasi.filter(function (x) { return x.id === id; })[0];
    if (!n) return;
    bukaLembar({
      judul: n.judul, sub: n.modul + ' · ' + n.waktu,
      isi: `<p style="font-size:14.5px;line-height:22px;margin:0 0 var(--space-4)">${esc(n.isi)}</p>`
    });
  }

  function rincianHasil(id) {
    const r = window.KGAI.cari(id, 'semua');
    const h = r.grup.length ? r.grup[0].hits[0] : null;
    if (!h) return;
    bukaLembar({
      judul: h.rec.judul, sub: h.rec.modul + (h.rec.id ? ' · ' + h.rec.id : ''),
      isi: `<dl class="kv">${h.rec.meta.map(function (m) {
        return `<dt>${m[0]}</dt><dd>${esc(String(m[1]))}</dd>`;
      }).join('')}</dl>`
    });
  }

  /* Bagian cangkang yang ditulis langsung di index.html — label tab bawah dan
     layar masuk — tidak melewati tr(), jadi diterjemahkan tersendiri di sini.
     Teks aslinya disimpan pada simpul supaya terjemahan tidak menumpuk. */
  function terjemahkanCangkang(akar) {
    if (!akar) return;
    const jalan = document.createTreeWalker(akar, NodeFilter.SHOW_TEXT, null);
    const simpul = [];
    while (jalan.nextNode()) simpul.push(jalan.currentNode);
    simpul.forEach(function (n) {
      const asli = n.nodeValue;
      if (!asli || !asli.trim()) return;
      if (n.__kg === undefined) n.__kg = asli.trim();
      n.nodeValue = asli.replace(asli.trim(), T(n.__kg));
    });
    ['placeholder', 'aria-label', 'title'].forEach(function (atr) {
      const els = akar.querySelectorAll('[' + atr + ']');
      for (let i = 0; i < els.length; i++) {
        const el = els[i], kunci = '__kg_' + atr;
        if (el[kunci] === undefined) el[kunci] = el.getAttribute(atr);
        el.setAttribute(atr, T(el[kunci]));
      }
    });
  }

  /* ───────── Penggambaran ───────── */
  const LAYAR = { beranda: layarBeranda, lapor: layarLapor, tugas: layarTugas, panduan: layarPanduan, saya: layarSaya };
  const JUDUL = { beranda: 'Beranda', lapor: 'Lapor', tugas: 'Tugas', panduan: 'Panduan', saya: 'Saya' };

  function gambar() {
    terjemahkanCangkang(document.querySelector('.bawah'));
    document.getElementById('layar').innerHTML = tr(LAYAR[tab]());
    const rj = tab === 'panduan' && rujukanBuka
      ? (RUJUKAN.filter(function (r) { return r.id === rujukanBuka; })[0] || {}).nama
      : null;
    document.getElementById('layar-judul').textContent = T(rj || JUDUL[tab]);
    const tabs = document.querySelectorAll('.tab');
    for (let i = 0; i < tabs.length; i++) {
      const on = tabs[i].dataset.tab === tab;
      if (on) tabs[i].setAttribute('aria-current', 'page');
      else tabs[i].removeAttribute('aria-current');
    }
    perbaruiJalur();
    window.scrollTo(0, 0);
  }

  function perbaruiJalur() {
    const r = LAP.ringkas();
    const jalur = document.getElementById('jalur');
    const angka = document.getElementById('antre-angka');
    const tugasAngka = document.getElementById('tugas-angka');

    angka.hidden = !r.antre;
    angka.textContent = r.antre;

    const n = tugasHariIni().length;
    tugasAngka.hidden = !n;
    tugasAngka.textContent = n;

    if (!daring) {
      jalur.className = 'jalur jalur--luring';
      jalur.innerHTML = tr(I(ikon.luring, 16) + '<span>Tanpa sinyal — laporan tetap tersimpan</span>');
      jalur.hidden = false;
    } else if (r.antre) {
      jalur.className = 'jalur jalur--antre';
      jalur.innerHTML = tr(I(ikon.kirim, 16) + `<span>${KGAI.L(r.antre + ' laporan menunggu dikirim', r.antre + ' reports waiting to be sent')}</span><button type="button" id="jalur-kirim">Kirim</button>`);
      jalur.hidden = false;
    } else {
      jalur.hidden = true;
    }
  }

  function kirimSemua() {
    if (!daring) { roti('Belum ada sinyal. Laporan tetap aman di perangkat.'); return; }
    LAP.kirim().then(function (h) {
      gambar();
      if (h.luring) {
        /* Gagal kirim bukan gagal simpan; antrean tetap utuh. */
        roti('Pengiriman gagal, laporan tetap aman di antrean.');
      } else if (!h.terkirim && !h.ditolak) {
        roti('Tidak ada laporan yang menunggu.');
      } else if (h.ditolak) {
        roti(h.terkirim + ' terkirim, ' + h.ditolak + ' ditolak. Buka laporannya untuk melihat sebabnya.');
      } else {
        roti(h.terkirim + ' laporan terkirim dan sudah terlihat di aplikasi meja.');
      }
    });
  }

  /* ───────── Masuk ───────── */
  function gambarAkun() {
    const pilihan = D.pengguna.filter(function (u) {
      return u.status === 'Aktif' && ['operator', 'qhse', 'lingkungan'].indexOf(u.peran) !== -1;
    }).slice(0, 4);
    document.getElementById('masuk-akun').innerHTML = tr(pilihan.map(function (u) {
      return `<button type="button" class="akun" data-akun="${u.email}">
        <b>${u.nama}</b><span>${T(D.peran[u.peran].nama)}</span></button>`;
    }).join(''));
  }

  function galatMasuk(pesan) {
    const el = document.getElementById('masuk-galat');
    if (!pesan) { el.hidden = true; return; }
    el.textContent = T(pesan);
    el.hidden = false;
  }

  function cobaMasuk() {
    const email = (document.getElementById('m-email').value || '').trim().toLowerCase();
    const sandi = document.getElementById('m-sandi').value || '';
    const u = D.pengguna.filter(function (x) { return x.email.toLowerCase() === email; })[0];
    if (!u || sandi !== SANDI) { galatMasuk('Email atau kata sandi tidak cocok.'); return; }
    if (u.status !== 'Aktif') { galatMasuk('Akun ini tidak aktif. Hubungi administrator sistem.'); return; }
    try { localStorage.setItem('kg-session', u.email); } catch (e) {}
    sesi = u;
    tampilkanApp();
    /* Bila peladen dikonfigurasi, sesi perangkat dibuka di belakang layar dan
       data acuan diambil sekali. Kegagalannya tidak menahan petugas masuk:
       aplikasi ini harus tetap dapat dipakai tanpa sinyal, dan antrean yang
       belum terkirim tidak hilang karenanya. */
    ambilSesiPeladen(u.email);
  }

  function ambilSesiPeladen(email) {
    const alamat = ((window.KG_KONFIG || {}).api || '').replace(/\/$/, '');
    if (!alamat) return;
    fetch(alamat + '/api/v1/sesi/masuk-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      /* Sesi lapangan berumur jauh lebih panjang daripada sesi aplikasi meja:
         petugas tidak dapat diminta masuk ulang di tengah shift, dengan sarung
         tangan, di area tanpa sinyal. */
      body: JSON.stringify({ email: email, klien: 'lapangan' })
    }).then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.data || !j.data.token) return;
        try { localStorage.setItem('kg-token', j.data.token); } catch (e) {}
        return LAP.muatAcuan();
      })
      .catch(function () {});
  }

  function tampilkanApp() {
    document.getElementById('masuk').hidden = true;
    document.getElementById('app').hidden = false;
    document.getElementById('u-inisial').textContent = sesi.inisial;
    document.getElementById('u-peran').textContent =
      T((D.peran[sesi.peran] || {}).nama) + ' · ' + sesi.lokasi;
    gambar();
  }

  function tampilkanMasuk() {
    document.getElementById('app').hidden = true;
    document.getElementById('masuk').hidden = false;
    galatMasuk(null);
    gambarAkun();
    terjemahkanCangkang(document.getElementById('masuk'));
  }

  /* ───────── Peristiwa ───────── */
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'form-masuk') { e.preventDefault(); cobaMasuk(); }
  });

  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;

    const akun = t.closest('[data-akun]');
    if (akun) {
      document.getElementById('m-email').value = akun.dataset.akun;
      document.getElementById('m-sandi').value = SANDI;
      galatMasuk(null);
      return;
    }

    if (t.closest('[data-tutup]') && (t.matches('[data-tutup]') || t.closest('button[data-tutup]'))) {
      tutupLembar(); return;
    }

    const kirim = t.closest('[data-kirim]');
    if (kirim) {
      const v = kirim.dataset.kirim;
      if (v.indexOf('hapus:') === 0) {
        LAP.hapus(v.slice(6)); tutupLembar(); roti('Laporan dihapus.'); gambar(); return;
      }
      kirimForm(v);
      return;
    }

    const tabBtn = t.closest('.tab');
    if (tabBtn) { tab = tabBtn.dataset.tab; if (tab !== 'panduan') rujukanBuka = null; gambar(); return; }

    /* Satu petak menu dapat berarti tiga hal berbeda: membuka formulir,
       berpindah tab, atau membuka rujukan di dalam tab Panduan. Ketiganya
       ditulis sebagai "jenis:nilai" supaya daftar MENU tetap dapat dibaca
       sebagai daftar, bukan sebagai cabang logika. */
    const menu = t.closest('[data-menu]');
    if (menu) {
      const bagi = menu.dataset.menu.split(':');
      if (bagi[0] === 'form') { bukaForm(bagi[1]); return; }
      if (bagi[0] === 'tab') { tab = bagi[1]; if (tab !== 'panduan') rujukanBuka = null; gambar(); return; }
      if (bagi[0] === 'rujukan') { tab = 'panduan'; rujukanBuka = bagi[1]; gambar(); return; }
      return;
    }

    const form = t.closest('[data-form]');
    if (form) { bukaForm(form.dataset.form); return; }

    const rujukan = t.closest('[data-rujukan]');
    if (rujukan) { rujukanBuka = rujukan.dataset.rujukan; gambar(); return; }

    if (t.closest('#rujukan-kembali')) { rujukanBuka = null; gambar(); return; }

    const bJsa = t.closest('[data-jsa]');
    if (bJsa) { rincianJsa(bJsa.dataset.jsa); return; }

    const bHir = t.closest('[data-hiradc]');
    if (bHir) { rincianHiradc(bHir.dataset.hiradc); return; }

    const bMat = t.closest('[data-materi]');
    if (bMat) { rincianMateri(bMat.dataset.materi); return; }

    const bReg = t.closest('[data-regulasi]');
    if (bReg) { rincianRegulasi(bReg.dataset.regulasi); return; }

    if (t.closest('#foto-kotak')) { document.getElementById('l-foto').click(); return; }

    const hapusFoto = t.closest('#foto-hapus');
    if (hapusFoto) {
      if (draf) draf.foto = null;
      const kotak = document.getElementById('foto-kotak');
      kotak.innerHTML = tr(I(ikon.kamera, 26) + '<span>Ketuk untuk memotret</span>');
      return;
    }

    if (t.closest('#tbl-lokasi')) {
      const teks = document.getElementById('lokasi-teks');
      teks.textContent = T('Mengambil…');
      ambilLokasi(function (pos, galat) {
        if (pos) {
          if (draf) draf.koordinat = pos;
          teks.innerHTML = `<span class="mono">${pos.lat.toFixed(5)}, ${pos.lon.toFixed(5)}</span> · ±${pos.akurasi} m`;
        } else {
          teks.textContent = T(galat || 'Lokasi tidak terbaca');
        }
      });
      return;
    }

    const keping = t.closest('.keping button[data-nilai]');
    if (keping) {
      /* Keping bertanda data-banyak boleh menyala bersamaan — dipakai pada daftar
         yang memang jamak, seperti jenis APD dan prasyarat izin. Sisanya tetap
         pilihan tunggal. */
      if (keping.dataset.banyak) {
        keping.setAttribute('aria-pressed', keping.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      } else {
        const sib = keping.parentElement.querySelectorAll('button');
        for (let i = 0; i < sib.length; i++) sib[i].setAttribute('aria-pressed', 'false');
        keping.setAttribute('aria-pressed', 'true');
      }
      return;
    }

    if (t.closest('#tbl-kirim-semua') || t.closest('#jalur-kirim') || t.closest('#tbl-sinkron')) {
      kirimSemua(); return;
    }

    const lapor = t.closest('[data-lapor]');
    if (lapor) { rincianLaporan(lapor.dataset.lapor); return; }

    const tugas = t.closest('[data-tugas]');
    if (tugas) { const p = tugas.dataset.tugas.split(':'); rincianTugas(p[0], p[1]); return; }

    const izin = t.closest('[data-izin]');
    if (izin) { rincianIzin(izin.dataset.izin); return; }

    const notif = t.closest('[data-notif]');
    if (notif) { rincianNotif(notif.dataset.notif); return; }

    const hasil = t.closest('[data-hasil]');
    if (hasil) { rincianHasil(hasil.dataset.hasil); return; }

    const contoh = t.closest('[data-contoh]');
    if (contoh) {
      cariQ = contoh.dataset.contoh;
      gambar();
      return;
    }

    const tema = t.closest('[data-tema]');
    if (tema) {
      const v = tema.dataset.tema;
      simpan.taruh('kg-theme', v);
      if (v === 'dark' || v === 'light') document.documentElement.setAttribute('data-theme', v);
      else document.documentElement.removeAttribute('data-theme');
      gambar();
      return;
    }

    const bhs = t.closest('[data-bahasa]');
    if (bhs) {
      KGI18N.setLang(bhs.dataset.bahasa);
      simpan.taruh('kg-lang', bhs.dataset.bahasa);
      document.documentElement.lang = bhs.dataset.bahasa;
      gambar();
      return;
    }

    if (t.closest('#tbl-keluar')) {
      try {
        localStorage.removeItem('kg-session');
        sessionStorage.removeItem('kg-session');
        /* Token dihapus, penanda perangkat tidak: ia separuh kunci
           keidempotenan, dan penanda baru membuat antrean lama terkirim dua
           kali sebagai dua catatan. */
        localStorage.removeItem('kg-token');
      } catch (e) {}
      sesi = null; tab = 'beranda'; rujukanBuka = null; cariQ = '';
      tampilkanMasuk();
      return;
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'l-foto') {
      const f = e.target.files && e.target.files[0];
      const kotak = document.getElementById('foto-kotak');
      kotak.innerHTML = tr('<span>Memproses foto…</span>');
      bacaFoto(f, function (data) {
        if (!data) {
          kotak.innerHTML = tr(I(ikon.kamera, 26) + '<span>Foto gagal dibaca — ketuk untuk mengulang</span>');
          return;
        }
        if (draf) draf.foto = data;
        kotak.innerHTML = `<img src="${data}" alt="Pratinjau foto">
          <button type="button" class="foto-hapus" id="foto-hapus" aria-label="Hapus foto">${I(ikon.tutup, 16)}</button>`;
      });
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'cari-q') {
      const adaSebelumnya = !!cariQ.trim();
      cariQ = e.target.value;
      /* Kartu rujukan hanya tampil saat kotak pencarian kosong, jadi saat huruf
         pertama masuk — dan saat huruf terakhir dihapus — layarnya digambar ulang
         seutuhnya. Fokus dikembalikan supaya papan ketik tidak menutup sendiri. */
      if (adaSebelumnya !== !!cariQ.trim()) {
        gambar();
        const kotak = document.getElementById('cari-q');
        if (kotak) { kotak.focus(); kotak.setSelectionRange(cariQ.length, cariQ.length); }
        return;
      }
      const hasil = document.getElementById('cari-hasil');
      if (hasil) hasil.innerHTML = tr(hasilCari());
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !document.getElementById('lembar').hidden) tutupLembar();
  });

  window.addEventListener('online', function () { daring = true; perbaruiJalur(); roti('Sinyal kembali.'); });
  window.addEventListener('offline', function () { daring = false; perbaruiJalur(); });

  /* Laporan yang masuk dari tab lain ikut terlihat di sini. */
  LAP.dengar(function () { if (sesi && !document.getElementById('app').hidden) perbaruiJalur(); });

  /* ───────── Mula ───────── */
  const bahasaAwal = simpan.ambil('kg-lang') || 'id';
  KGI18N.setLang(bahasaAwal);
  document.documentElement.lang = bahasaAwal;

  sesi = muatSesi();
  if (sesi) tampilkanApp(); else tampilkanMasuk();

  /* Pintasan ikon Android (tekan lama pada ikon aplikasi) membuka langsung
     formulirnya, bukan sekadar halaman depan — itulah gunanya pintasan. */
  if (sesi) {
    const aksi = new URLSearchParams(location.search).get('aksi');
    if (FORM[aksi]) {
      tab = 'lapor'; gambar(); bukaForm(aksi);
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
    }
  }

  /* Pekerja layanan membuat aplikasi tetap terbuka tanpa sinyal — syarat utama
     di gudang dan lantai produksi, dan syarat agar dapat dipasang sebagai aplikasi. */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      /* Penanda ?v= disertakan karena peladen melayani sw.js dengan masa simpan
         satu bulan, dan simpanan di depannya sempat menyajikan versi lama
         berhari-hari. Alamat yang berbeda menjadi pendaftaran yang berbeda,
         jadi pekerja layanan baru benar-benar terpasang, menggantikan yang
         lama pada cakupan yang sama. Angkanya disamakan dengan penanda di
         index.html supaya keduanya naik bersamaan. */
      navigator.serviceWorker.register('sw.js?v=4').catch(function () {});
    });
  }
})();
