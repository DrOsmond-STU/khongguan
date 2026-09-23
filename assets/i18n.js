/* KG SafeGuard — dwibahasa Indonesia / English.
   Cara kerjanya: tampilan tetap ditulis dalam bahasa Indonesia, lalu tr() menerjemahkan
   simpul teks yang cocok persis dengan kamus. Frasa yang belum ada di kamus dibiarkan
   apa adanya, jadi antarmuka tidak pernah rusak karena terjemahan yang hilang.

   Catatan: isi rekaman (kronologi insiden, catatan observasi, nama orang dan lokasi)
   sengaja TIDAK diterjemahkan. Rekaman K3 ditulis oleh pekerja dalam bahasa mereka dan
   menerjemahkannya otomatis akan mengubah bukti. */

window.KGI18N = (function () {
  'use strict';

  const EN = {
    /* ── Rincian sekali klik: label yang muncul di banyak modal ── */
    'Angka': 'Figure', 'Perubahan': 'Change', 'Cakupan': 'Scope', 'Rumus': 'Formula',
    'Sumber data': 'Data source', 'Periode': 'Period', 'RINCIAN': 'BREAKDOWN',
    'Jawaban': 'Answer', 'Zona': 'Zone', 'Tingkat': 'Level', 'Proses': 'Process',
    'Nomor dokumen': 'Document number', 'Sertifikasi': 'Certification', 'Pemegang': 'Holder',
    'Kategori': 'Category', 'Tindakan mitigasi': 'Mitigation action',
    'Opsi penanganan': 'Treatment option', 'Analisis awal': 'Initial analysis',
    'Risiko sisa': 'Residual risk', 'Risiko awal': 'Initial risk',
    'Reviu berikutnya': 'Next review',
    'Langkah pekerjaan': 'Work step', 'Bahaya': 'Hazard', 'Langkah': 'Step',
    'Nama': 'Name', 'Catatan': 'Note', 'Waktu': 'Time',
    'Lama menunggu': 'Waiting time', 'Klausul / elemen': 'Clause / element',
    'Kategori temuan': 'Finding category', 'Elemen': 'Element',
    'Kriteria terpenuhi': 'Criteria met', 'Belum terpenuhi': 'Not yet met',
    'Pemenuhan': 'Conformance', 'Jumlah dokumen': 'Documents', 'Berlaku': 'In force',
    'Dalam revisi': 'Under revision', 'Kedaluwarsa': 'Expired',
    'Pertanyaan yang dijawab': 'Question it answers',
    'DOKUMEN PADA TINGKAT INI': 'DOCUMENTS AT THIS LEVEL',
    'RISIKO DI ZONA INI': 'RISKS IN THIS ZONE',
    'PENGENDALIAN · HIERARKI': 'CONTROLS · HIERARCHY',
    'MODUL YANG DAPAT DIBUKA': 'MODULES THEY CAN OPEN',
    'Tanggal terbit': 'Issue date', 'Tanggal tinjau ulang': 'Review date',
    'Jenis': 'Type', 'Penerbit': 'Issuer',
    'Berlaku sampai': 'Valid until', 'Sisa masa berlaku': 'Validity remaining',
    'Hasil uji': 'Test result', 'Baku mutu': 'Quality standard',
    'Kesimpulan': 'Conclusion', 'Acuan regulasi': 'Regulatory reference',
    'Parameter': 'Parameter', 'Frekuensi': 'Frequency', 'Area': 'Area', 'Shift': 'Shift',
    'Kemajuan': 'Progress', 'Temuan': 'Findings', 'Petugas': 'Officer', 'Unit': 'Unit',
    'Pemeriksa': 'Inspector', 'Tingkat risiko': 'Risk level',
    'Jam kerja': 'Work hours', 'Pekerja': 'Workers', 'Insiden tercatat': 'Recorded incidents',
    'Laporan bahaya': 'Hazard reports', 'CAPA tepat waktu': 'CAPA on time',
    'Pemenuhan SMK3': 'SMK3 conformance', 'Terhadap target': 'Against target',
    'Target peserta': 'Target participants', 'Rencana': 'Plan', 'Aktual': 'Actual',
    'Selisih peserta': 'Participant variance', 'Biaya': 'Cost',
    'Surel': 'Email', 'Terakhir masuk': 'Last sign-in',
    'Status akun': 'Account status', 'Modul yang terlihat': 'Modules visible',
    'Peristiwa pemicu': 'Triggering event', 'Kanal': 'Channel', 'Penerima': 'Recipients',
    'Waktu kirim': 'Send time', 'Modul asal': 'Source module', 'Status baca': 'Read status',
    'Sudah dibaca': 'Read', 'Belum dibaca': 'Unread', 'Nomor': 'Number',
    'Rincian': 'Details', 'Total teramati': 'Total observed', 'Aman': 'Safe',
    'Berisiko': 'At risk', 'Perilaku aman': 'Safe behaviour',
    'Kategori perilaku': 'Behaviour category', 'Tanggal': 'Date', 'Target': 'Target',
    'Diputuskan oleh': 'Decided by', 'Buka modul': 'Open module',
    'Jumlah risiko sisa': 'Residual risks', 'Kriteria penerimaan': 'Acceptance criteria',
    'Accident': 'Accident', 'Incident': 'Incident', 'Nearmiss': 'Near miss',
    'Temuan inspeksi': 'Inspection findings', 'Temuan audit': 'Audit findings',
    'Lewat tenggat': 'Overdue', 'Jatuh tempo ≤ 7 hari': 'Due within 7 days',
    'Sumber': 'Source', 'Terbit': 'Issued', 'Tenggat': 'Due', 'Umur': 'Age',
    'MEMENUHI BAKU MUTU': 'MEETS QUALITY LIMIT', 'Di dalam ambang': 'Within limit',
    'Melewati ambang — uji ulang dan tindakan perbaikan wajib':
      'Exceeds the limit — retest and corrective action required',
    'Sesuai rencana': 'As planned', 'Belum dapat dihitung — pelaksanaan belum selesai':
      'Cannot be computed yet — the session has not finished',
    'Tidak ada butir Tidak Sesuai': 'No non-conforming items',
    'Tidak ada perilaku berisiko yang dicatat': 'No at-risk behaviour recorded',
    'Tidak ada akses — modul ini tidak muncul di navigasinya':
      'No access — this module does not appear in their navigation',
    'Sudah disetujui': 'Approved', 'Belum gilirannya': 'Not their turn yet',
    'Di bawah target tahun berjalan': 'Below the year-to-date target',
    'Di atas target tahun berjalan': 'Above the year-to-date target',
    'Keputusan segera': 'Immediate decision', 'Keputusan anggaran': 'Budget decision',
    'Rapat anggaran grup': 'Group budget meeting',
    'Plant Manager dan manajemen grup': 'Plant Manager and group management',
    'Ubin ringkasan': 'Summary tile',
    'Pelapor': 'Reported by', 'Prasyarat': 'Prerequisites',
    'Anonim (kanal tanpa nama)': 'Anonymous (nameless channel)',
    'Pemindahan ke Selesai hanya oleh petugas QHSE, dengan bukti terlampir.':
      'Only QHSE officers may move an item to Closed, and only with evidence attached.',

    /* ── Bulan & label grafik ── */
    'Okt': 'Oct', 'Des': 'Dec', 'Mei': 'May', 'Ags': 'Aug', 'Agu': 'Aug',
    'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr', 'Jun': 'Jun',
    'Jul': 'Jul', 'Nov': 'Nov', 'Sep': 'Sep',
    'Pabrik Cibitung · Okt 2025 – Sep 2026 · target internal ≤ 4 kejadian per bulan':
      'Cibitung Plant · Oct 2025 – Sep 2026 · internal target ≤ 4 events per month',
    'Naik itu baik. Penurunan September perlu ditindaklanjuti sebagai masalah partisipasi, bukan dirayakan sebagai perbaikan.':
      'Up is good. September’s drop needs to be treated as a participation problem, not celebrated as an improvement.',
    'Lagging · makin rendah makin baik · target ≤ 0,50': 'Lagging · lower is better · target ≤ 0.50',
    'Total kejadian': 'Total events', 'Target internal': 'Internal target', 'Puncak periode': 'Period peak',

    /* ── Aktivitas terbaru & perhatian segera ── */
    'Insiden baru dilaporkan — INC-2026-0318': 'New incident reported — INC-2026-0318',
    'Izin kerja menunggu verifikasi QHSE — WP-2026-0913': 'Work permit awaiting QHSE verification — WP-2026-0913',
    'Inspeksi Panel Listrik berjalan 21 dari 36 butir': 'Electrical Panel inspection at 21 of 36 items',
    'CAPA-2026-0138 ditutup dan diverifikasi': 'CAPA-2026-0138 closed and verified',
    'Safety Talk bahaya uap panas — 24 peserta': 'Safety Talk on steam burns — 24 participants',
    'Cermin cembung & marka persimpangan B2 terpasang': 'Convex mirror & crossing markings at B2 installed',
    'CAPA-2026-0124 · Laporan P2K3 triwulan II': 'CAPA-2026-0124 · Q2 P2K3 report',
    'CAPA-2026-0128 · Minyak & lemak outlet IPAL': 'CAPA-2026-0128 · Oil & grease at WWTP outlet',
    'Minyak & lemak IPAL 14 mg/L melewati ambang 10 mg/L': 'WWTP oil & grease 14 mg/L exceeds the 10 mg/L limit',
    'Oli bekas di TPS B3 tersisa 12 hari dari batas 90 hari': 'Waste oil in the B3 store has 12 days left of the 90-day limit',
    'WP-2026-0913 menunggu verifikasi QHSE 18 jam': 'WP-2026-0913 has waited 18 hours for QHSE verification',
    'AF-2026-018 · Sertifikat boiler 2 kedaluwarsa': 'AF-2026-018 · Boiler 2 certificate expired',
    'BAKU MUTU': 'QUALITY LIMIT', 'MASA SIMPAN': 'STORAGE TIME', 'TERTAHAN': 'HELD UP',
    'Uji gas O₂/LEL/H₂S belum dilampirkan': 'O₂/LEL/H₂S gas test not attached yet',
    'Sejak 30 Jun 2026 · tenggat CAPA 30 Sep': 'Since 30 Jun 2026 · CAPA due 30 Sep',
    'Uji 15 Sep · wajib uji ulang dalam 14 hari': 'Tested 15 Sep · retest required within 14 days',

    /* ── Pesan ── */
    'Laporan terkirim. Nomor INC-2026-0319.': 'Report submitted. Number INC-2026-0319.',
    'Laporan terkirim. Nomor HZ-2026-0452.': 'Report submitted. Number HZ-2026-0452.',
    'Preferensi tersimpan.': 'Preferences saved.',
    'Semua pemberitahuan ditandai terbaca.': 'All notifications marked as read.',
    'Undangan terkirim. Akun aktif setelah pengguna menyetel kata sandi.':
      'Invitation sent. The account activates once the user sets a password.',
    'Tautan pengaturan ulang akan dikirim ke email korporat Anda.':
      'A reset link will be sent to your corporate email.',

    /* ── Kerangka & navigasi ── */
    'QHSE · KHONG GUAN': 'QHSE · KHONG GUAN',
    'Dashboard Eksekutif': 'Executive Dashboard',
    'Dashboard & Laporan': 'Dashboard & Reports',
    'Dashboard &amp; Laporan': 'Dashboard &amp; Reports',
    'Incident & Nearmiss': 'Incident & Nearmiss',
    'Laporan Bahaya K3L': 'HSE Hazard Reports',
    'Observasi Perilaku': 'Behaviour Observation',
    'Safety Checklist': 'Safety Checklist',
    'Work Permit & JSEA': 'Work Permit & JSEA',
    'Manajemen Risiko': 'Risk Management',
    'Dokumen Internal': 'Internal Documents',
    'Dokumen Eksternal': 'External Documents',
    'Manajemen Pelatihan': 'Training Management',
    'SHE Activity': 'SHE Activity',
    'SHE KPI & Analytics': 'SHE KPI & Analytics',
    'Notifikasi': 'Notifications',
    'Pengaturan': 'Settings',
    'User Management': 'User Management',
    'KEJADIAN & BAHAYA': 'EVENTS & HAZARDS',
    'PENGENDALIAN': 'CONTROLS',
    'KEPATUHAN': 'COMPLIANCE',
    'PENGEMBANGAN': 'DEVELOPMENT',
    'ADMINISTRASI': 'ADMINISTRATION',
    'Keluar': 'Sign out',
    'Buka menu modul': 'Open module menu',
    'Lapor bahaya cepat': 'Quick hazard report',

    /* ── Login ── */
    'Masuk ke KG SafeGuard': 'Sign in to KG SafeGuard',
    'Sistem manajemen QHSE Khong Guan Group': 'Khong Guan Group QHSE management system',
    'Alamat email': 'Email address',
    'Kata sandi': 'Password',
    'Ingat saya di perangkat ini': 'Remember me on this device',
    'Masuk': 'Sign in',
    'Lupa kata sandi?': 'Forgot password?',
    'Akun demo': 'Demo accounts',
    'Purwarupa ini tidak terhubung ke direktori pengguna Khong Guan. Pilih salah satu akun demo di bawah, kata sandi semuanya':
      'This prototype is not connected to Khong Guan’s user directory. Pick one of the demo accounts below; the password for all of them is',
    'Email atau kata sandi salah. Periksa kembali, atau pakai salah satu akun demo di bawah.':
      'Wrong email or password. Check again, or use one of the demo accounts below.',
    'Alamat email belum diisi.': 'Email address is empty.',
    'Kata sandi belum diisi.': 'Password is empty.',
    'Nihil kecelakaan hilang waktu kerja': 'Zero lost-time injuries',
    'hari berjalan di Pabrik Cibitung': 'days running at Cibitung Plant',
    'Setiap pekerja berhak menghentikan pekerjaan yang tidak aman.':
      'Every worker has the right to stop unsafe work.',
    'Bahasa': 'Language',
    'Tema': 'Theme',
    'Terang': 'Light',
    'Gelap': 'Dark',
    'Sistem': 'System',

    /* ── Peran ── */
    'Operator Produksi': 'Production Operator',
    'QHSE Supervisor': 'QHSE Supervisor',
    'Plant Manager': 'Plant Manager',
    'Administrator Sistem': 'System Administrator',
    'Petugas Lingkungan': 'Environmental Officer',

    /* ── Umum ── */
    'Semua': 'All', 'Semua Jenis': 'All Types', 'Semua Shift': 'All Shifts',
    'Semua Tingkat': 'All Levels', 'Belum Selesai': 'Unfinished',
    'Belum Dibaca': 'Unread', 'Bulan Ini': 'This Month',
    'Belum Terlaksana': 'Not Yet Held', 'Wajib Regulasi': 'Regulatory',
    'Perlu Tinjau Ulang': 'Review Due', 'Shift 1': 'Shift 1', 'Shift 2': 'Shift 2',
    'Batal': 'Cancel', 'Tutup': 'Close', 'Mengerti': 'Got it', 'Simpan': 'Save',
    'Kirim Laporan': 'Submit Report', 'Mulai': 'Start', 'Terbitkan': 'Publish',
    'Daftarkan': 'Register', 'Filter': 'Filter', 'Ekspor Excel': 'Export Excel',
    'Draf tersimpan 08:42': 'Draft saved 08:42',
    'Tidak ada laporan yang cocok dengan filter ini.': 'No reports match this filter.',
    'Ambil foto': 'Take a photo',
    'atau lepaskan berkas di sini · JPG/PNG maksimal 10 MB': 'or drop files here · JPG/PNG, 10 MB max',
    'satu foto membuat laporan jauh lebih cepat ditindaklanjuti':
      'one photo makes a report far faster to act on',
    'Kirim sebagai laporan anonim': 'Submit as an anonymous report',

    /* ── Kosakata status & keparahan ── */
    'TERBUKA': 'OPEN', 'DALAM PROSES': 'IN PROGRESS', 'MENUNGGU VERIFIKASI': 'AWAITING VERIFICATION',
    'SELESAI': 'CLOSED', 'DITOLAK': 'REJECTED', 'AKTIF': 'ACTIVE',
    'MENUNGGU QHSE': 'AWAITING QHSE', 'MENUNGGU SUPERVISOR': 'AWAITING SUPERVISOR',
    'DIVERIFIKASI': 'VERIFIED', 'DITANGANI': 'RESOLVED', 'TERJADWAL': 'SCHEDULED',
    'TERTUNDA': 'POSTPONED', 'ANONIM': 'ANONYMOUS', 'BARU': 'NEW',
    'KATASTROPIK': 'CATASTROPHIC', 'MAYOR': 'MAJOR', 'SERIUS': 'SERIOUS',
    'SEDANG': 'MODERATE', 'RINGAN': 'MINOR',
    'NEARMISS': 'NEARMISS', 'INCIDENT': 'INCIDENT', 'ACCIDENT': 'ACCIDENT',
    'KRITIS': 'CRITICAL', 'TINGGI': 'HIGH', 'INFO': 'INFO',
    'SESUAI': 'CONFORMS', 'TIDAK SESUAI': 'NON-CONFORMING', 'BERSIH': 'CLEAN',
    'BERLAKU': 'VALID', 'KEDALUWARSA': 'EXPIRED', 'LEWAT TEMPO': 'OVERDUE',
    /* Sisa dari modul lama yang belum pernah masuk kamus, ditemukan saat modul 22–25 diperiksa. */
    'Naik itu baik · Leading indicator': 'Rising is good · leading indicator',
    'Supervisor dan operator terlatih': 'Trained supervisors and operators',
    'Bagian hijau adalah perilaku aman. Kategori dengan pita merah terpanjang menjadi tema safety talk bulan berikutnya.':
      'The green band is safe behaviour. The category with the longest red band becomes next month\'s safety talk topic.',
    'Risiko sisa ≥ 15 menutup penerbitan': 'A residual risk of 15 or more blocks issue',
    'TERPENUHI': 'MET', 'Fisik': 'Physical', 'Kimia': 'Chemical', 'Mekanik': 'Mechanical',
    'Listrik': 'Electrical', 'Ergonomi': 'Ergonomic', 'Biologi': 'Biological',
    'Psikososial': 'Psychosocial',
    'BELUM': 'NOT YET', 'BELUM MULAI': 'NOT STARTED', 'SESUAI RENCANA': 'AS PLANNED',
    'VENDOR': 'CONTRACTOR', 'INTERNAL': 'IN-HOUSE',
    'INSIDEN': 'INCIDENT', 'INSPEKSI': 'INSPECTION', 'AUDIT': 'AUDIT',
    'LINGKUNGAN': 'ENVIRONMENT', 'BAHAYA': 'HAZARD', 'PELATIHAN': 'TRAINING',
    'WORK PERMIT': 'WORK PERMIT', 'DOKUMEN EKSTERNAL': 'EXTERNAL DOCUMENTS',
    'DOKUMEN INTERNAL': 'INTERNAL DOCUMENTS', 'CAPA': 'CAPA',
    'UNSAFE CONDITION': 'UNSAFE CONDITION', 'UNSAFE ACTION': 'UNSAFE ACTION',
    'ASPEK LINGKUNGAN': 'ENVIRONMENTAL ASPECT',
    'Terbuka': 'Open', 'Dalam Proses': 'In Progress',
    'Menunggu Verifikasi': 'Awaiting Verification', 'Selesai': 'Closed',
    'Diverifikasi': 'Verified', 'Ditangani': 'Resolved',
    'Unsafe Condition': 'Unsafe Condition', 'Unsafe Action': 'Unsafe Action',
    'Aspek Lingkungan': 'Environmental Aspect',
    'Nyaris, tanpa cedera': 'Near miss, no injury',
    'Kerusakan, tanpa cedera': 'Damage, no injury',
    'Ada cedera manusia': 'Person injured',
    'Kondisi tidak aman': 'Unsafe condition',
    'Perilaku tidak aman': 'Unsafe behaviour',
    'Dampak lingkungan': 'Environmental impact',

    /* ── Kepala kolom tabel ── */
    'NO.': 'NO.', 'NO. LAPORAN': 'REPORT NO.', 'NO. DOKUMEN': 'DOCUMENT NO.',
    'JENIS': 'TYPE', 'KEPARAHAN': 'SEVERITY', 'LOKASI': 'LOCATION',
    'TANGGAL': 'DATE', 'PELAPOR': 'REPORTED BY', 'STATUS': 'STATUS',
    'JENIS INSPEKSI': 'INSPECTION TYPE', 'AREA': 'AREA', 'JADWAL': 'SCHEDULE',
    'KEMAJUAN': 'PROGRESS', 'TEMUAN': 'FINDINGS', 'PETUGAS': 'INSPECTOR',
    'STANDAR': 'STANDARD', 'LINGKUP': 'SCOPE', 'AUDITOR': 'AUDITOR',
    'KLAUSUL / ELEMEN': 'CLAUSE / ELEMENT', 'KATEGORI': 'CATEGORY',
    'PJ': 'OWNER', 'TENGGAT': 'DUE', 'TINDAKAN': 'ACTION', 'SUMBER': 'SOURCE',
    'TERBIT': 'ISSUED', 'UMUR': 'AGE', 'PABRIK': 'PLANT', 'PEKERJA': 'HEADCOUNT',
    'JAM KERJA': 'MAN-HOURS', 'TRIR': 'TRIR', 'LTIFR': 'LTIFR',
    'LAPORAN BAHAYA': 'HAZARD REPORTS', 'CAPA TEPAT WAKTU': 'CAPA ON TIME',
    'SMK3': 'SMK3', 'TRC': 'TRC', 'TERHADAP TARGET': 'VS TARGET',
    'PROGRAM PELATIHAN': 'TRAINING PROGRAMME', 'RENCANA': 'PLANNED',
    'AKTUAL': 'ACTUAL', 'PESERTA': 'PARTICIPANTS', 'PELAKSANAAN': 'HELD ON',
    'SELISIH': 'VARIANCE', 'SERTIFIKASI': 'CERTIFICATION', 'PEMEGANG': 'HOLDER',
    'NOMOR': 'NUMBER', 'BERLAKU SAMPAI': 'VALID UNTIL', 'SISA': 'REMAINING',
    'PROSES': 'PROCESS', 'ANCAMAN &amp; PENYEBAB': 'THREAT &amp; CAUSE',
    'DAMPAK': 'CONSEQUENCE', 'OPSI': 'OPTION', 'PENANGANAN': 'TREATMENT',
    'PJ / TENGGAT': 'OWNER / DUE', 'REVIU': 'REVIEW', 'TINGKAT': 'LEVEL',
    'JUDUL': 'TITLE', 'REV': 'REV', 'TINJAU ULANG': 'REVIEW DUE',
    'PEMILIK': 'OWNER', 'DOKUMEN': 'DOCUMENT', 'PENERBIT': 'ISSUER',
    'CHECKLIST': 'CHECKLIST', 'FREKUENSI': 'FREQUENCY', 'SHIFT': 'SHIFT',
    'LANGKAH PEKERJAAN': 'JOB STEP', 'PENGENDALIAN': 'CONTROLS',
    'AWAL': 'INITIAL', 'PERISTIWA': 'EVENT', 'KANAL': 'CHANNEL',
    'PENERIMA': 'RECIPIENTS', 'WAKTU KIRIM': 'SEND TIMING',
    'PENGGUNA': 'USER', 'PERAN': 'ROLE', 'TERAKHIR MASUK': 'LAST SIGN-IN',
    'ZONA': 'ZONE', 'PRASYARAT': 'PREREQUISITES',
    'PENGENDALIAN YANG DITERAPKAN': 'CONTROLS APPLIED',

    /* ── Dashboard operasional ── */
    'Kondisi QHSE hari ini': 'QHSE status today',
    'Ringkasan lintas sepuluh modul. Item yang menuntut tindakan hari ini muncul di kolom Perhatian Segera, tanpa perlu membuka laporan satu per satu.':
      'A summary across every module. Anything demanding action today appears under Needs Attention, with no need to open reports one by one.',
    'HARI TANPA KECELAKAAN HILANG WAKTU KERJA': 'DAYS WITHOUT A LOST-TIME INJURY',
    'TOTAL INSIDEN': 'TOTAL INCIDENTS', 'SAFE MANHOURS': 'SAFE MAN-HOURS',
    'TEMUAN TERBUKA': 'OPEN FINDINGS', 'CAPA JATUH TEMPO': 'CAPA DUE',
    'September 2026 · 1 accident, 2 nearmiss': 'September 2026 · 1 accident, 2 near misses',
    'Jam kerja sejak LTI terakhir · Lagging': 'Man-hours since the last LTI · Lagging',
    'Inspeksi 10 · audit 4 · lintas modul': 'Inspections 10 · audits 4 · across modules',
    'Selesai tepat waktu 82% · target ≥ 90%': 'Closed on time 82% · target ≥ 90%',
    'Tren Insiden 12 Bulan': '12-Month Incident Trend',
    'Aktivitas Terbaru': 'Recent Activity',
    'Lintas modul, 7 hari terakhir': 'Across modules, last 7 days',
    'Perhatian Segera': 'Needs Attention',
    'Item kritis dan tinggi dari seluruh modul': 'Critical and high items from every module',
    'Laporan siap cetak': 'Print-ready reports',
    'Dibangun dari data yang sama, kop memakai lambang korporat Khong Guan':
      'Built from the same data; letterhead carries the Khong Guan corporate mark',
    'Laporan Bulanan QHSE': 'Monthly QHSE Report',
    'Rekap Insiden Triwulan': 'Quarterly Incident Summary',
    'Laporan Lingkungan Triwulan': 'Quarterly Environmental Report',
    'Laporan SMK3 Tahunan': 'Annual SMK3 Report',

    /* ── Insiden ── */
    'Kejadian & Investigasi': 'Events & Investigation',
    'Lapor Insiden': 'Report Incident',
    'Daftar Laporan Insiden': 'Incident Report Register',
    'BULAN INI': 'THIS MONTH', 'BELUM SELESAI': 'STILL OPEN',
    'HARI KERJA HILANG': 'LOST WORK DAYS', 'RASIO NEARMISS': 'NEARMISS RATIO',
    'Jenis kejadian': 'Event type', 'Lokasi kejadian': 'Event location',
    'Waktu kejadian': 'Event time', 'Foto lokasi': 'Site photo',
    'Kronologi singkat': 'Brief chronology', 'Kronologi': 'Chronology',
    'Dampak': 'Consequence', 'Akar masalah': 'Root cause',
    'Belum ada lampiran': 'No attachment yet',
    'Minimal satu foto lokasi diperlukan sebelum laporan dapat dikirim.':
      'At least one site photo is required before the report can be submitted.',
    'Apa yang terjadi, dalam urutan waktu. Tanpa menyebut siapa yang salah.':
      'What happened, in order of time. Without naming who was at fault.',
    'Analisis akar masalah dilakukan terpisah di tahap investigasi.':
      'Root-cause analysis is done separately during investigation.',
    'Empat langkah · draf tersimpan otomatis': 'Four steps · draft saved automatically',
    'Anonim (kanal tanpa nama)': 'Anonymous (no-name channel)',

    /* ── Inspeksi ── */
    'Inspeksi K3 & Lingkungan': 'Safety & Environmental Inspection',
    'Mulai Inspeksi': 'Start Inspection',
    'Jadwal & Riwayat Inspeksi': 'Inspection Schedule & History',
    'TERJADWAL BULAN INI': 'SCHEDULED THIS MONTH', 'PENYELESAIAN': 'COMPLETION',
    'RATA-RATA PENUTUPAN': 'AVERAGE CLOSURE',
    'Jenis inspeksi': 'Inspection type',
    'Bulanan': 'Monthly', 'Mingguan': 'Weekly', 'Harian': 'Daily',
    'Setiap shift': 'Every shift',

    /* ── Izin kerja ── */
    'Izin Kerja Berisiko Tinggi': 'High-Risk Work Permits',
    'Ajukan Izin Kerja': 'Request Work Permit',
    'Izin Kerja': 'Work Permits',
    'Kartu, bukan baris tabel — izin dibaca sekilas di lapangan':
      'Cards, not table rows — permits are read at a glance on the floor',
    'IZIN AKTIF HARI INI': 'PERMITS ACTIVE TODAY',
    'MENUNGGU PERSETUJUAN': 'AWAITING APPROVAL',
    'PEKERJAAN VENDOR': 'CONTRACTOR WORK',
    'DITOLAK ZONA EKSTREM': 'BLOCKED, EXTREME ZONE',
    'Matriks Risiko JSEA': 'JSEA Risk Matrix',
    'Matriks Risiko 5×5': '5×5 Risk Matrix',
    'Jenis izin': 'Permit type', 'Uraian pekerjaan': 'Work description',
    'Mulai': 'Start', 'Lanjut ke JSEA': 'Continue to JSEA',
    'Jendela waktu': 'Time window', 'Pelaksana': 'Performed by',
    'Pengawas': 'Supervisor', 'Terbitkan Izin': 'Issue Permit',
    'Tutup Izin': 'Close Permit',
    'PANAS': 'HOT', 'RUANG': 'CONFINED', 'KETINGGIAN': 'WORKING AT HEIGHT', 'LISTRIK': 'ELECTRICAL',

    /* ── Bahaya ── */
    'Laporan Bahaya': 'Hazard Reports', 'Lapor Bahaya': 'Report Hazard',
    'Papan Tindak Lanjut': 'Follow-Up Board',
    'Tiga kolom, kiri ke kanan': 'Three columns, left to right',
    'Tren Laporan Bahaya 12 Bulan': '12-Month Hazard Report Trend',
    'LAPORAN BULAN INI': 'REPORTS THIS MONTH', 'PER PEKERJA': 'PER WORKER',
    'BELUM DIVERIFIKASI': 'NOT YET VERIFIED', 'LAPORAN ANONIM': 'ANONYMOUS REPORTS',
    'Target 30 detik · foto, lokasi, satu kalimat': '30-second target · photo, location, one sentence',
    'Apa yang Anda lihat?': 'What did you see?',
    'Satu kalimat sudah cukup.': 'One sentence is enough.',
    'Dilaporkan': 'Reported',

    /* ── Audit ── */
    'Audit SHE': 'SHE Audit', 'Program Audit': 'Audit Programme',
    'Temuan Terbuka': 'Open Findings',
    'Pemenuhan 12 Elemen SMK3': 'SMK3 Compliance — 12 Elements',
    'PEMENUHAN KRITERIA SMK3': 'SMK3 CRITERIA MET',
    'AUDIT TAHUN INI': 'AUDITS THIS YEAR', 'TEMUAN MAJOR': 'MAJOR FINDINGS',
    'TEMUAN MINOR': 'MINOR FINDINGS', 'KRITERIA SMK3': 'SMK3 CRITERIA',
    'MINOR': 'MINOR', 'OBS': 'OBS', 'OBSERVASI': 'OBSERVATION',

    /* ── Lingkungan ── */
    'Aspek Lingkungan': 'Environmental Aspects',
    'Input Hasil Uji': 'Enter Test Results',
    'PARAMETER DIPANTAU': 'PARAMETERS MONITORED',
    'MELEWATI AMBANG': 'ABOVE LIMIT',
    'MASA SIMPAN TERPENDEK': 'SHORTEST STORAGE LEFT',
    'LIMBAH DIDAUR ULANG': 'WASTE RECYCLED',
    'Domain': 'Domain', 'Tanggal pengujian': 'Test date', 'Laboratorium': 'Laboratory',
    'Simpan Hasil': 'Save Results',

    /* ── KPI ── */
    'Indikator Kinerja QHSE': 'QHSE Performance Indicators',
    'Lagging Indicator': 'Lagging Indicators',
    'Leading Indicator': 'Leading Indicators',
    'Insiden vs Target': 'Incidents vs Target',
    'Laporan Bahaya vs Target': 'Hazard Reports vs Target',
    'Pembandingan antarpabrik': 'Plant-to-plant comparison',
    'Lagging · makin rendah makin baik': 'Lagging · lower is better',
    'Leading · makin tinggi makin baik': 'Leading · higher is better',
    'DI BAWAH TARGET': 'BELOW TARGET', 'DI ATAS TARGET': 'ABOVE TARGET',

    /* ── Kegiatan ── */
    'Dokumentasi Kegiatan': 'Activity Records',
    'Unggah Kegiatan': 'Upload Activity',
    'KEGIATAN BULAN INI': 'ACTIVITIES THIS MONTH',
    'TOTAL JAM ORANG': 'TOTAL PERSON-HOURS',
    'PESERTA UNIK': 'UNIQUE PARTICIPANTS', 'RAPAT P2K3': 'P2K3 MEETING',
    'Jenis kegiatan': 'Activity type', 'Judul kegiatan': 'Activity title',
    'Jumlah peserta': 'Number of participants', 'Durasi (jam)': 'Duration (hours)',
    'Simpan Kegiatan': 'Save Activity', 'Unggah sekarang': 'Upload now',
    'Jam orang': 'Person-hours', 'Peserta': 'Participants', 'Durasi': 'Duration',

    /* ── CAPA ── */
    'Tindakan Perbaikan': 'Corrective Actions',
    'Papan CAPA': 'CAPA Board', 'Seluruh CAPA': 'All CAPA',
    'CAPA AKTIF': 'ACTIVE CAPA', 'LEWAT TENGGAT': 'PAST DUE',
    'RATA-RATA UMUR': 'AVERAGE AGE', 'TEPAT WAKTU': 'ON TIME',
    'Penanggung jawab': 'Owner', 'Prioritas': 'Priority',

    /* ── Pelatihan ── */
    'Pelatihan & Sertifikasi K3': 'Safety Training & Certification',
    'Jadwalkan Pelatihan': 'Schedule Training',
    'Jadwal, Rencana, dan Aktual Pelaksanaan': 'Schedule, Plan, and Actual Delivery',
    'Sertifikasi Personel Wajib': 'Mandatory Personnel Certification',
    'PROGRAM TAHUN INI': 'PROGRAMMES THIS YEAR',
    'REALISASI PESERTA': 'PARTICIPANT REALISATION',
    'JAM PELATIHAN': 'TRAINING HOURS', 'SERTIFIKAT H-60': 'CERTIFICATES D-60',
    'Program pelatihan': 'Training programme', 'Jadwal rencana': 'Planned schedule',
    'Rencana peserta': 'Planned participants', 'Penyelenggara': 'Provider',
    'Simpan Jadwal': 'Save Schedule',
    'SEGERA PERPANJANG': 'RENEW NOW', 'SIAPKAN': 'PREPARE',
    'Refreshment': 'Refresher',

    /* ── Risiko ── */
    'Risk Register Pabrik': 'Plant Risk Register',
    'Tambah Risiko': 'Add Risk', 'Enam Tahap': 'Six Stages',
    'Penetapan Konteks': 'Establishing Context',
    'Identifikasi Risiko': 'Risk Identification',
    'Analisis Risiko': 'Risk Analysis',
    'Evaluasi Risiko': 'Risk Evaluation',
    'Penanganan Risiko': 'Risk Treatment',
    'Pemantauan & Reviu': 'Monitoring & Review',
    'RUANG LINGKUP': 'SCOPE',
    'LINGKUNGAN INTERNAL': 'INTERNAL CONTEXT',
    'LINGKUNGAN EKSTERNAL': 'EXTERNAL CONTEXT',
    'SEBARAN RISIKO SISA': 'RESIDUAL RISK SPREAD',
    'RISIKO TERDAFTAR': 'RISKS REGISTERED',
    'ZONA EKSTREM AWAL': 'INITIALLY EXTREME',
    'TURUN SETELAH KENDALI': 'REDUCED BY CONTROLS',
    'REVIU BULAN INI': 'REVIEWS THIS MONTH',
    'EKSTREM 15–25': 'EXTREME 15–25', 'TINGGI 10–14': 'HIGH 10–14',
    'SEDANG 5–9': 'MODERATE 5–9', 'RENDAH 1–4': 'LOW 1–4',
    'Kurangi': 'Reduce', 'Hindari': 'Avoid', 'Transfer': 'Transfer', 'Terima': 'Accept',
    'KURANGI': 'REDUCE', 'HINDARI': 'AVOID', 'TRANSFER': 'TRANSFER', 'TERIMA': 'ACCEPT',
    'Proses / area': 'Process / area', 'Ancaman': 'Threat', 'Penyebab': 'Cause',
    'Kemungkinan (1–5)': 'Likelihood (1–5)', 'Keparahan (1–5)': 'Severity (1–5)',
    'Rekayasa': 'Engineering', 'Administratif': 'Administrative',
    'APD': 'PPE', 'Substitusi': 'Substitution', 'Eliminasi': 'Elimination',

    /* ── Dokumen ── */
    'Dokumen Sistem Manajemen': 'Management System Documents',
    'Terbitkan Dokumen': 'Issue Document',
    'Hierarki Dokumen': 'Document Hierarchy',
    'Daftar Induk Dokumen': 'Master Document List',
    'DOKUMEN TERKENDALI': 'CONTROLLED DOCUMENTS',
    'DALAM REVISI': 'UNDER REVISION',
    'LEWAT MASA TINJAU': 'REVIEW OVERDUE',
    'Manual & Kebijakan': 'Manual & Policy', 'Prosedur': 'Procedure',
    'Instruksi Kerja': 'Work Instruction', 'Formulir & Rekaman': 'Forms & Records',
    'Manual': 'Manual', 'Kebijakan': 'Policy', 'Formulir': 'Form',
    'Dokumen Kepatuhan': 'Compliance Documents',
    'Daftarkan Dokumen': 'Register Document',
    'Daftar Dokumen Kepatuhan': 'Compliance Document Register',
    'DOKUMEN DIPANTAU': 'DOCUMENTS TRACKED',
    'BERAKHIR ≤ 60 HARI': 'EXPIRING ≤ 60 DAYS', 'AMAN': 'SAFE',
    'PERPANJANG SEKARANG': 'RENEW NOW', 'SIAPKAN PERPANJANGAN': 'PREPARE RENEWAL',
    'Sertifikat Sistem': 'System Certificate', 'Izin Lingkungan': 'Environmental Permit',
    'Izin Peralatan': 'Equipment Permit', 'Pelaporan Wajib': 'Mandatory Reporting',
    'SERTIFIKAT SISTEM': 'SYSTEM CERTIFICATE', 'IZIN LINGKUNGAN': 'ENVIRONMENTAL PERMIT',
    'IZIN PERALATAN': 'EQUIPMENT PERMIT', 'PELAPORAN WAJIB': 'MANDATORY REPORTING',
    'Tingkat dokumen': 'Document level', 'Judul dokumen': 'Document title',
    'Pemilik dokumen': 'Document owner', 'Nama dokumen': 'Document name',

    /* ── Checklist ── */
    'Pemeriksaan Rutin Harian': 'Daily Routine Checks',
    'Kerjakan Checklist': 'Run Checklist',
    'Checklist Hari Ini': 'Today’s Checklists',
    'Mulai Checklist': 'Start Checklist',
    'CHECKLIST HARI INI': 'CHECKLISTS TODAY',
    'TEMUAN HARI INI': 'FINDINGS TODAY',
    'KEPATUHAN 30 HARI': '30-DAY COMPLIANCE',
    'Jenis checklist': 'Checklist type', 'Unit / area': 'Unit / area',

    /* ── Observasi perilaku ── */
    'Observasi Perilaku Aman': 'Safe Behaviour Observation',
    'Catat Observasi': 'Record Observation',
    'Perilaku per Kategori': 'Behaviour by Category',
    'Aturan Modul Ini': 'Rules of This Module',
    'Observasi Terbaru': 'Recent Observations',
    'OBSERVASI BULAN INI': 'OBSERVATIONS THIS MONTH',
    'INDEKS PERILAKU AMAN': 'SAFE BEHAVIOUR INDEX',
    'PERILAKU BERISIKO': 'AT-RISK BEHAVIOURS',
    'PENGAMAT AKTIF': 'ACTIVE OBSERVERS',
    'Alat Pelindung Diri': 'Personal Protective Equipment',
    'Posisi & Postur Tubuh': 'Body Position & Posture',
    'Alat & Peralatan Kerja': 'Tools & Equipment',
    'Kepatuhan Prosedur': 'Procedure Compliance',
    'Kerapian & Kebersihan': 'Order & Cleanliness',
    'Reaksi Terhadap Pengamat': 'Reaction to the Observer',
    'Tanpa nama': 'No names', 'Aman dulu': 'Safe first',
    'Percakapan wajib': 'Conversation required', 'Bukan CAPA': 'Not a CAPA',
    'Tindak lanjut': 'Follow-up', 'Pengamat': 'Observer',
    'Area pengamatan': 'Observation area',
    'Perilaku aman teramati': 'Safe behaviours observed',
    'Perilaku berisiko': 'At-risk behaviours',
    'Kategori perilaku berisiko': 'At-risk behaviour category',
    'Percakapan di tempat': 'On-the-spot conversation',
    'Apa yang dibicarakan dan apa yang disepakati': 'What was discussed and what was agreed',
    'Wajib diisi. Observasi tanpa percakapan hanyalah angka.':
      'Required. An observation without a conversation is just a number.',
    'Simpan Observasi': 'Save Observation',

    /* ── Eksekutif ── */
    'Kinerja QHSE Empat Pabrik': 'QHSE Performance Across Four Plants',
    'Kartu Skor Pabrik': 'Plant Scorecard',
    'Arah TRIR Grup 12 Bulan': '12-Month Group TRIR Direction',
    'Program Strategis QHSE': 'Strategic QHSE Programmes',
    'Perlu keputusan manajemen': 'Needs a management decision',
    'TRIR GRUP': 'GROUP TRIR', 'LTIFR GRUP': 'GROUP LTIFR',
    'TOTAL SAFE MANHOURS': 'TOTAL SAFE MAN-HOURS',
    'PABRIK NIHIL LTI': 'PLANTS WITH ZERO LTI',
    'KEPUTUSAN SEGERA': 'DECIDE NOW', 'KEPUTUSAN ANGGARAN': 'BUDGET DECISION',
    'BAIK': 'GOOD', 'PERHATIAN': 'WATCH',
    'Status ditentukan oleh indikator terburuk, bukan rata-rata':
      'Status follows the worst indicator, not the average',
    'Komitmen tahun berjalan dan kemajuannya': 'This year’s commitments and their progress',
    'Hal yang tidak dapat diselesaikan di tingkat pabrik':
      'Matters that cannot be settled at plant level',

    /* ── Notifikasi ── */
    'Pemberitahuan': 'Notifications', 'Kotak Masuk': 'Inbox',
    'Aturan Pengiriman': 'Delivery Rules',
    'Tandai semua terbaca': 'Mark all as read',
    'BELUM DIBACA': 'UNREAD',
    'Siapa menerima apa, lewat kanal mana, dan seberapa sering':
      'Who receives what, through which channel, and how often',
    'Mengapa antreannya pendek': 'Why the queue is short',

    /* ── Pengaturan ── */
    'Preferensi Aplikasi': 'Application Preferences',
    'Tampilan': 'Appearance',
    'Tema dan bahasa tersimpan di peramban ini saja': 'Theme and language are stored in this browser only',
    'Mode tampilan': 'Display mode',
    'Bahasa antarmuka': 'Interface language',
    'Lokasi Kerja': 'Work Location',
    'Angka KPI berbeda per pabrik': 'KPI figures differ per plant',
    'Pabrik aktif': 'Active plant',
    'Periode laporan': 'Reporting period',
    'Kanal Pemberitahuan': 'Notification Channels',
    'Pilih cara Anda menerima pemberitahuan': 'Choose how you receive notifications',
    'Pemberitahuan dalam aplikasi': 'In-app notifications',
    'Ringkasan harian lewat email': 'Daily summary by email',
    'Insiden Accident lewat WhatsApp': 'Accident-severity incidents by WhatsApp',
    'Pengingat dokumen kedaluwarsa': 'Expiring-document reminders',
    'Tentang Purwarupa': 'About This Prototype',
    'Simpan Preferensi': 'Save Preferences',

    /* ── User management ── */
    'Pengguna & Hak Akses': 'Users & Access Rights',
    'Tambah Pengguna': 'Add User',
    'Daftar Pengguna': 'User Directory',
    'Matriks Hak Akses': 'Access Rights Matrix',
    'TOTAL PENGGUNA': 'TOTAL USERS', 'AKTIF 30 HARI': 'ACTIVE IN 30 DAYS',
    'MENUNGGU AKTIVASI': 'PENDING ACTIVATION', 'PERAN BERBEDA': 'DISTINCT ROLES',
    'Nama lengkap': 'Full name', 'Peran': 'Role', 'Pabrik': 'Plant',
    'Nonaktif': 'Inactive', 'Aktif': 'Active', 'Menunggu': 'Pending',
    'NONAKTIF': 'INACTIVE', 'MENUNGGU': 'PENDING',
    'Kirim Undangan': 'Send Invitation',
    'Modul': 'Module', 'Baca': 'View', 'Isi': 'Create', 'Verifikasi': 'Verify', 'Kelola': 'Administer',

    /* ── Tautan ke aplikasi lapangan ── */
    "Aplikasi Lapangan Android":
      "Android Field App",
    "Untuk petugas yang bekerja di lantai produksi, gudang, dan area utilitas":
      "For staff working on the production floor, in the warehouse and around the utilities",
    "Alamat":
      "Address",
    "Akun":
      "Account",
    "Sama dengan aplikasi ini — masuk sekali, berlaku di keduanya":
      "The same as this app — sign in once, it holds for both",
    "Kiriman dari lapangan":
      "Field submissions",
    "Belum ada":
      "None yet",
    "Buka Aplikasi Lapangan":
      "Open the Field App",
    "Laporan yang dikirim dari aplikasi lapangan muncul di modul Laporan Bahaya, Incident, dan Observasi Perilaku, ditandai sebagai kiriman lapangan. Yang berstatus Antre belum melewati verifikasi QHSE, jadi belum dihitung dalam angka KPI mana pun.":
      "Reports sent from the field app appear in the Hazard Report, Incident and Behaviour Observation modules, marked as field submissions. Anything still Queued has not passed QHSE verification, so it counts towards no KPI figure yet.",
    "Kiriman lapangan belum melewati verifikasi QHSE, jadi belum dihitung dalam angka KPI mana pun. Yang berstatus Antre bahkan belum pernah meninggalkan perangkat pelapor — pada sistem sebenarnya, di titik itulah panggilan ke API berada.":
      "A field submission has not passed QHSE verification, so it counts towards no KPI figure yet. Anything still Queued has never even left the reporter's device — in a live system, that is exactly where the API call sits.",

    /* ── Aplikasi lapangan: tingkat & kategori ── */
    "Lingkungan": "Environment",
    "Rendah": "Low",
    "Sedang": "Medium",
    "Tinggi": "High",
    "Ringan": "Minor",
    "Serius": "Serious",

    /* ── Aplikasi lapangan (/m/) ── */
    "Beranda":
      "Home",
    "Lapor":
      "Report",
    "Tugas":
      "Tasks",
    "Saya":
      "Me",
    "Navigasi utama":
      "Main navigation",
    "Status sinkronisasi":
      "Sync status",
    "LAPANGAN · QHSE KHONG GUAN":
      "FIELD · QHSE KHONG GUAN",
    "AKUN DEMO LAPANGAN":
      "FIELD DEMO ACCOUNTS",
    "Akun dan perannya sama persis dengan aplikasi meja, dengan kata sandi demo1234.":
      "The accounts and their roles are exactly those of the desktop app; the password is demo1234.",
    "Email atau kata sandi tidak cocok.":
      "Email or password does not match.",
    "Akun ini tidak aktif. Hubungi administrator sistem.":
      "This account is inactive. Contact the system administrator.",
    "hari tanpa kecelakaan hilang waktu kerja di Pabrik Cibitung":
      "days without a lost-time injury at Cibitung Plant",
    "Angka ini kembali ke nol pada kecelakaan berikutnya. Laporan Anda hari ini yang menjaganya tetap berjalan.":
      "This figure resets to zero at the next injury. Your report today is what keeps it running.",
    "Observasi":
      "Observation",
    "Foto, area, satu kalimat — 30 detik":
      "Photo, area, one sentence — 30 seconds",
    "Paling sering dipakai · target 30 detik":
      "Used most often · 30-second target",
    "Nyaris celaka atau kecelakaan":
      "Near miss or accident",
    "Nearmiss sampai accident":
      "Near miss through accident",
    "Perilaku aman & berisiko":
      "Safe and at-risk behaviour",
    "Tugas hari ini":
      "Today's tasks",
    "Laporan saya":
      "My reports",
    "Perlu perhatian":
      "Needs attention",
    "Tidak ada tugas tertunda":
      "No outstanding tasks",
    "Checklist shift Anda sudah selesai seluruhnya.":
      "Your shift checklist is fully complete.",
    "Belum ada laporan":
      "No reports yet",
    "Laporan yang Anda kirim dari sini langsung muncul di modul QHSE pada aplikasi meja.":
      "Reports you send from here appear straight away in the QHSE modules of the desktop app.",
    "Buat laporan":
      "Create a report",
    "Antrean kirim":
      "Send queue",
    "Antrean kosong":
      "Queue is empty",
    "Semua laporan Anda sudah terkirim.":
      "All your reports have been sent.",
    "Laporan disimpan di perangkat lebih dulu, baru dikirim. Di lantai produksi dan gudang sinyal sering hilang, dan laporan bahaya yang gagal terkirim adalah laporan yang tidak pernah ditulis ulang.":
      "Reports are stored on the device first, then sent. Signal drops often on the production floor and in the warehouse, and a hazard report that fails to send is a report nobody writes twice.",
    "Target 30 detik · foto, area, satu kalimat":
      "30-second target · photo, area, one sentence",
    "Kejadian, nyaris celaka, atau kecelakaan":
      "Incident, near miss or accident",
    "Perilaku aman dicatat lebih dulu":
      "Safe behaviour is recorded first",
    "Area kerja":
      "Work area",
    "Apa yang terjadi?":
      "What happened?",
    "Tingkat risiko menurut Anda":
      "Risk level in your judgement",
    "Ada yang cedera?":
      "Was anyone injured?",
    "Foto":
      "Photo",
    "Titik lokasi":
      "Location fix",
    "Ketuk untuk memotret":
      "Tap to take a photo",
    "Memproses foto…":
      "Processing photo…",
    "Foto gagal dibaca — ketuk untuk mengulang":
      "Photo could not be read — tap to try again",
    "Pratinjau foto":
      "Photo preview",
    "Hapus foto":
      "Remove photo",
    "Belum diambil":
      "Not taken yet",
    "Mengambil…":
      "Getting fix…",
    "Ambil":
      "Get",
    "Izin lokasi ditolak":
      "Location permission denied",
    "Lokasi tidak terbaca":
      "Location could not be read",
    "Perangkat tidak mendukung lokasi":
      "This device does not support location",
    "Foto diperkecil di perangkat sebelum disimpan, jadi tetap muat walau sinyal mati berhari-hari.":
      "Photos are shrunk on the device before storage, so they still fit even after days without signal.",
    "Satu kalimat sudah cukup. Contoh: Selang APAR A-14 bocor di sambungan.":
      "One sentence is enough. For example: Extinguisher hose A-14 is leaking at the joint.",
    "Urutkan kejadiannya: apa yang dikerjakan, lalu apa yang terjadi.":
      "Put the event in order: what was being done, then what happened.",
    "Apa yang dibicarakan dengan pekerja saat itu juga.":
      "What was discussed with the worker on the spot.",
    "Perilaku aman yang teramati":
      "Safe behaviours observed",
    "Perilaku berisiko yang teramati":
      "At-risk behaviours observed",
    "Catatan percakapan di tempat":
      "Note of the on-the-spot conversation",
    "Hapus laporan":
      "Delete report",
    "Isian keterangan belum diisi.":
      "The description field is still empty.",
    "Laporan dihapus.":
      "Report deleted.",
    "Laporan bahaya tidak pernah menilai orang. Yang dicatat adalah kondisi dan tindakannya, bukan siapa yang melakukannya.":
      "A hazard report never judges a person. What is recorded is the condition and the act, not who did it.",
    "Kejadian berkeparahan Serius memicu pemberitahuan seketika ke QHSE dan Plant Manager begitu laporan terkirim.":
      "An event of Serious severity triggers an immediate notification to QHSE and the Plant Manager as soon as the report is sent.",
    "Kolom ini diisi lebih dulu dan biasanya lebih besar. Program yang hanya mencatat pelanggaran akan berhenti dilaporkan orang.":
      "This column is filled in first and is usually the larger one. A programme that logs only violations stops being reported at all.",
    "Pekerja yang diamati tidak pernah dicatat namanya. Observasi yang menamai orang berubah menjadi penilaian kinerja, dan orang berhenti jujur.":
      "The worker being observed is never recorded by name. An observation that names people turns into a performance review, and people stop being honest.",
    "Kondisi Tidak Aman":
      "Unsafe Condition",
    "Tindakan Tidak Aman":
      "Unsafe Act",
    "Housekeeping":
      "Housekeeping",
    "Peralatan":
      "Equipment",
    "Tidak ada cedera":
      "No injury",
    "Perlu P3K":
      "First aid needed",
    "Perlu perawatan medis":
      "Medical treatment needed",
    "Hilang waktu kerja":
      "Lost time",
    "Checklist shift":
      "Shift checklist",
    "Izin kerja berjalan":
      "Work permits in progress",
    "CAPA saya":
      "My CAPAs",
    "Lewat":
      "Overdue",
    "Satu butir dijawab Tidak Sesuai mengunci unit dari operasi sampai temuannya ditutup. Ini gerbang operasi, bukan peringatan yang bisa dilewati.":
      "A single Not Conforming answer locks the unit out of operation until its finding is closed. This is an operating gate, not a warning that can be waved through.",
    "Pada purwarupa ini butir checklist belum dapat dijawab dari aplikasi lapangan. Yang sudah berjalan adalah laporan bahaya, insiden, dan observasi.":
      "In this prototype, checklist items cannot yet be answered from the field app. What does work is hazard, incident and observation reporting.",
    "Cari apa saja di sistem":
      "Search anything in the system",
    "Prosedur, izin, insiden, CAPA, temuan audit, sertifikat — semuanya terindeks dan dapat dibuka di sini tanpa sinyal.":
      "Procedures, permits, incidents, CAPAs, audit findings, certificates — all indexed and openable here without signal.",
    "Cari catatan, dokumen, nomor — misalnya: boiler":
      "Search records, documents, numbers — for example: boiler",
    "Tidak ada yang cocok":
      "Nothing matches",
    "Seluruh kata yang diketik harus muncul pada catatan yang sama. Coba kurangi kata.":
      "Every word typed must appear in the same record. Try fewer words.",
    "Sinkronisasi":
      "Sync",
    "ANTRE":
      "QUEUED",
    "TERKIRIM":
      "SENT",
    "TOTAL":
      "TOTAL",
    "Antre":
      "Queued",
    "Terkirim":
      "Sent",
    "Kirim sekarang":
      "Send now",
    "TEMA":
      "THEME",
    "BAHASA":
      "LANGUAGE",
    "Indonesia":
      "Indonesian",
    "English":
      "English",
    "Aplikasi meja":
      "Desktop app",
    "Buka KG SafeGuard lengkap":
      "Open the full KG SafeGuard",
    "21 modul · laporan Anda sudah ada di sana":
      "21 modules · your reports are already there",
    "Pilihan ini sama dengan aplikasi meja. Mengubahnya di sini ikut berubah di sana.":
      "These settings are shared with the desktop app. Changing them here changes them there too.",
    "Aplikasi ini adalah purwarupa. Seluruh isinya data rekaan, dan laporan yang Anda kirim tersimpan di perangkat ini saja — tidak ada server di belakangnya. Jangan memakai kata sandi sungguhan di layar masuk.":
      "This is a prototype. All content is invented data, and the reports you send are stored on this device only — there is no server behind it. Do not use a real password on the sign-in screen.",
    "Tanpa sinyal — laporan tetap tersimpan":
      "No signal — reports are still saved",
    "Sinyal kembali.":
      "Signal is back.",
    "Kirim":
      "Send",
    "Belum ada sinyal. Laporan tetap aman di perangkat.":
      "No signal yet. Your reports are safe on the device.",
    "Tidak ada laporan yang menunggu.":
      "There are no reports waiting.",
    "Keterangan":
      "Description",
    "Risiko menurut pelapor":
      "Risk per the reporter",
    "Cedera":
      "Injury",
    "Perilaku aman / berisiko":
      "Safe / at-risk behaviours",
    "Laporan Bahaya":
      "Hazard Report",
    "Laporan Insiden":
      "Incident Report",
    "Dilepas karena penyimpanan perangkat penuh. Laporannya tetap utuh.":
      "Dropped because device storage is full. The report itself is intact.",
    "Izin kerja tidak berstatus Aktif sebelum seluruh langkah persetujuan selesai dan JSEA-nya lengkap.":
      "A work permit is not Active until every approval step is complete and its JSEA is filled in.",
    "Laporan Bahaya dari Lapangan":
      "Hazard Reports from the Field",
    "Laporan Insiden dari Lapangan":
      "Incident Reports from the Field",
    "Observasi dari Lapangan":
      "Observations from the Field",
    "DARI LAPANGAN":
      "FROM THE FIELD",
    "BERFOTO":
      "HAS PHOTO",
    "FOTO":
      "PHOTO",

    /* ── Asisten QHSE: sisa label ── */
    "Ringkasan Eksekutif": "Executive Summary",
    "Ringkasan eksekutif": "Executive summary",
    "Dalam Revisi": "Under Revision",
    "Pilihan": "Options",

    /* ── Asisten QHSE: label tabel & isian ── */
    "Cari": "Search",
    "Tinjau ulang": "Review date",
    "Distribusi": "Distribution",
    "Standar": "Standard",
    "Klausul": "Clause",
    "Keparahan": "Severity",
    "Tindakan": "Action",
    "Dokumen": "Document",
    "Sisa": "Remaining",
    "Awal": "Initial",
    "Nilai": "Value",
    "Pelatihan": "Training",
    "Indikator": "Indicator",
    "Insiden": "Incident",

    /* ── Asisten QHSE ── */
    "MODUL 21 · ASISTEN QHSE":
      "MODULE 21 · QHSE ASSISTANT",
    "Asisten QHSE":
      "QHSE Assistant",
    "Satu tempat untuk menyusun referensi dokumen ISO baru, menelusuri kata di seluruh catatan sistem, dan mengubah data menjadi ringkasan yang siap dibawa ke rapat manajemen.":
      "One place to build a reference for a new ISO document, search every record in the system, and turn data into a summary ready for the management meeting.",
    "catatan terindeks":
      "records indexed",
    "Cara Kerja Asisten":
      "How the Assistant Works",
    "Mode asisten":
      "Assistant mode",
    "Referensi Dokumen Baru":
      "New Document Reference",
    "Cari di Dokumen ISO":
      "Search ISO Documents",
    "Cari Seluruh Data":
      "Search All Data",
    "Susun Referensi":
      "Build Reference",
    "Susun Ringkasan":
      "Build Summary",
    "Jenis dokumen":
      "Document type",
    "Ketik kata yang dicari":
      "Type what you are looking for",
    "Sebutkan topik dokumennya":
      "Name the document topic",
    "Contoh: “Tanggap Darurat Kebakaran Gudang”, “Pengelolaan Limbah B3”, atau “Pembuangan Kondensat Oven”. Asisten menyusun nomor, klausul acuan, dan kerangka isinya dari daftar dokumen yang sudah ada.":
      "For example: “Warehouse Fire Emergency Response”, “Hazardous Waste Management”, or “Oven Condensate Draining”. The assistant builds the number, the clauses it answers, and the content outline from the register that already exists.",
    "Sebutkan ringkasan yang Anda butuhkan":
      "Say which summary you need",
    "Tulis dengan kalimat biasa. Asisten mengenali topiknya, lalu menghitung ulang angkanya dari data modul — bukan menyalin ringkasan yang sudah jadi.":
      "Write it in plain sentences. The assistant recognises the topic, then recomputes the figures from the module data — it does not copy a summary written earlier.",
    "Tidak ada bidang yang terbuka untuk peran Anda":
      "No area is open to your role",
    "Permintaan ini menyentuh modul yang tidak diizinkan bagi peran yang sedang masuk. Mintakan ringkasannya kepada QHSE atau Plant Manager.":
      "This request touches modules the signed-in role may not open. Ask QHSE or the Plant Manager for the summary.",
    "Topik dokumen — misalnya: Tanggap Darurat Kebakaran Gudang":
      "Document topic — for example: Warehouse Fire Emergency Response",
    "Kata yang dicari di dokumen ISO — misalnya: limbah B3":
      "Word to find in ISO documents — for example: limbah B3",
    "Kata, nama, lokasi, atau nomor catatan — misalnya: boiler":
      "Word, name, location or record number — for example: boiler",
    "Ringkasan apa yang Anda butuhkan? — misalnya: status CAPA dan temuan audit":
      "Which summary do you need? — for example: CAPA status and audit findings",
    "USULAN DOKUMEN BARU":
      "PROPOSED NEW DOCUMENT",
    "Nomor terusulkan":
      "Proposed number",
    "Pengesah":
      "Approver",
    "Tanggal berlaku":
      "Effective date",
    "Retensi rekaman":
      "Record retention",
    "Klausul yang dijawab":
      "Clauses answered",
    "Judul klausul":
      "Clause title",
    "Kerangka isi":
      "Content outline",
    "Catatan yang membenarkan penerbitannya":
      "Records that justify issuing it",
    "ACUAN INTERNAL TERKAIT":
      "RELATED INTERNAL REFERENCES",
    "ACUAN EKSTERNAL TERKAIT":
      "RELATED EXTERNAL REFERENCES",
    "Dokumen sistem yang tidak dapat menunjuk satu pun catatan sebagai alasan terbitnya biasanya tidak akan dipakai di lapangan.":
      "A system document that cannot point to a single record as the reason it exists is usually not used in the field.",
    "Tidak ada dokumen internal yang beririsan. Periksa sekali lagi sebelum menerbitkan — dokumen yang benar-benar berdiri sendiri jarang ada.":
      "No internal document overlaps this topic. Check once more before issuing — a document that genuinely stands alone is rare.",
    "Tidak ada sertifikat atau izin yang langsung terkait topik ini.":
      "No certificate or permit relates directly to this topic.",
    "Yang disusun asisten adalah kerangka dan acuannya, bukan isinya. Kalimat prosedur tetap ditulis oleh pemilik proses, karena hanya dia yang tahu bagaimana pekerjaan itu benar-benar dijalankan.":
      "What the assistant builds is the outline and its references, not the content. The procedure text is still written by the process owner, because only they know how the work is actually done.",
    "Seluruh kepala bagian, papan dokumen area, dan salinan terkendali di ruang QHSE":
      "All department heads, area document boards, and the controlled copy in the QHSE room",
    "Area pelaksana terkait dan papan dokumen mesin/area":
      "The performing area and its machine/area document board",
    "Supervisor Area terkait":
      "Supervisor of the relevant area",
    "Permanen":
      "Permanent",
    "3 tahun setelah digantikan":
      "3 years after superseded",
    "5 tahun sejak pengisian":
      "5 years from completion",
    "Insiden, ketidaksesuaian dan tindakan korektif":
      "Incident, nonconformity and corrective action",
    "Pemantauan, pengukuran, analisis dan evaluasi kinerja":
      "Monitoring, measurement, analysis and performance evaluation",
    "Pelaporan dan Perbaikan Kekurangan":
      "Reporting and Correcting Deficiencies",
    "Identifikasi bahaya dan penilaian risiko serta peluang":
      "Hazard identification and assessment of risks and opportunities",
    "Menghilangkan bahaya dan mengurangi risiko K3":
      "Eliminating hazards and reducing OHS risks",
    "Aspek lingkungan":
      "Environmental aspects",
    "Keamanan Bekerja Berdasarkan SMK3":
      "Safe Working Based on SMK3",
    "Kesiapsiagaan dan tanggap darurat":
      "Emergency preparedness and response",
    "Kesiagaan dan tanggap darurat":
      "Emergency preparedness and response",
    "Perencanaan dan pengendalian operasi":
      "Operational planning and control",
    "Evaluasi penaatan":
      "Evaluation of compliance",
    "Pengelolaan Material dan Perpindahannya":
      "Material Handling and Movement",
    "Pengadaan, kontraktor dan alih daya":
      "Procurement, contractors and outsourcing",
    "Kompetensi":
      "Competence",
    "Kepedulian":
      "Awareness",
    "Pengembangan Keterampilan dan Kemampuan":
      "Developing Skills and Capability",
    "Pembelian dan Pengendalian Produk":
      "Purchasing and Product Control",
    "Audit internal":
      "Internal audit",
    "Pemeriksaan SMK3":
      "SMK3 Inspection",
    "Tinjauan manajemen":
      "Management review",
    "Pembangunan dan Pemeliharaan Komitmen":
      "Building and Maintaining Commitment",
    "Informasi terdokumentasi":
      "Documented information",
    "Pengendalian Dokumen":
      "Document Control",
    "Konsultasi dan partisipasi pekerja":
      "Consultation and participation of workers",
    "Komunikasi":
      "Communication",
    "Standar Pemantauan":
      "Monitoring Standards",
    "Pengumpulan dan Penggunaan Data":
      "Data Collection and Use",
    "Pengendalian produksi dan penyediaan jasa":
      "Control of production and service provision",
    "Pengendalian ketidaksesuaian keluaran":
      "Control of nonconforming outputs",
    "Peninjauan Perancangan dan Kontrak":
      "Design and Contract Review",
    "Manajemen perubahan":
      "Management of change",
    "Penentuan peraturan perundangan dan persyaratan lain":
      "Determination of legal and other requirements",
    "Kewajiban penaatan":
      "Compliance obligations",
    "Strategi Pendokumentasian":
      "Documentation Strategy",
    "Kebijakan K3":
      "OHS policy",
    "Kebijakan lingkungan":
      "Environmental policy",
    "Sasaran K3 dan perencanaan pencapaiannya":
      "OHS objectives and planning to achieve them",
    "Pernyataan kebijakan":
      "Policy statement",
    "Satu halaman, kalimat aktif, ditandatangani pimpinan tertinggi lokasi.":
      "One page, active voice, signed by the most senior person on site.",
    "Ruang lingkup penerapan":
      "Scope of application",
    "Lokasi, proses, dan pihak yang terikat — termasuk kontraktor dan tamu.":
      "Sites, processes and parties bound by it — contractors and visitors included.",
    "Komitmen manajemen":
      "Management commitment",
    "Penyediaan sumber daya, pemenuhan peraturan, perbaikan berkelanjutan.":
      "Provision of resources, legal compliance, continual improvement.",
    "Kewajiban dan hak pekerja":
      "Worker duties and rights",
    "Termasuk hak menghentikan pekerjaan yang tidak aman.":
      "Including the right to stop unsafe work.",
    "Kerangka sasaran":
      "Objectives framework",
    "Bagaimana kebijakan diterjemahkan menjadi sasaran terukur.":
      "How the policy is translated into measurable objectives.",
    "Komunikasi dan ketersediaan":
      "Communication and availability",
    "Cara kebijakan disampaikan ke pekerja dan pihak berkepentingan.":
      "How the policy reaches workers and interested parties.",
    "Peninjauan":
      "Review",
    "Ditinjau minimal setahun sekali atau saat ada perubahan besar.":
      "Reviewed at least yearly, or whenever a major change occurs.",
    "Pengesahan":
      "Approval",
    "Nama, jabatan, tanda tangan, tanggal berlaku.":
      "Name, position, signature, effective date.",
    "Profil organisasi dan konteks":
      "Organisation profile and context",
    "Isu internal dan eksternal, pihak berkepentingan dan kebutuhannya.":
      "Internal and external issues, interested parties and their needs.",
    "Ruang lingkup sistem manajemen":
      "Scope of the management system",
    "Batas penerapan dan pengecualian beserta pembenarannya.":
      "Boundaries of application and exclusions with their justification.",
    "Acuan normatif":
      "Normative references",
    "Standar dan peraturan yang diacu.":
      "Standards and regulations referred to.",
    "Istilah dan definisi":
      "Terms and definitions",
    "Hanya istilah yang dipakai berbeda dari arti umumnya.":
      "Only terms used differently from their ordinary meaning.",
    "Kepemimpinan dan kebijakan":
      "Leadership and policy",
    "Peran, tanggung jawab, wewenang, dan kebijakan yang berlaku.":
      "Roles, responsibilities, authorities and the policy in force.",
    "Perencanaan":
      "Planning",
    "Risiko dan peluang, sasaran, dan rencana pencapaian.":
      "Risks and opportunities, objectives, and plans to achieve them.",
    "Dukungan":
      "Support",
    "Sumber daya, kompetensi, kepedulian, komunikasi, informasi terdokumentasi.":
      "Resources, competence, awareness, communication, documented information.",
    "Operasi":
      "Operation",
    "Pengendalian operasional dan kesiapsiagaan tanggap darurat.":
      "Operational control and emergency preparedness.",
    "Evaluasi kinerja":
      "Performance evaluation",
    "Pemantauan, audit internal, tinjauan manajemen.":
      "Monitoring, internal audit, management review.",
    "Peningkatan":
      "Improvement",
    "Ketidaksesuaian, tindakan korektif, peningkatan berkelanjutan.":
      "Nonconformity, corrective action, continual improvement.",
    "Matriks korelasi klausul":
      "Clause correlation matrix",
    "Peta klausul standar terhadap prosedur yang menjawabnya.":
      "A map of standard clauses against the procedures that answer them.",
    "1. Tujuan":
      "1. Purpose",
    "Satu kalimat: hasil apa yang dijamin oleh prosedur ini.":
      "One sentence: what outcome this procedure guarantees.",
    "2. Ruang lingkup":
      "2. Scope",
    "Proses, area, dan pengecualian yang jelas batasnya.":
      "Processes, areas and exclusions with clear boundaries.",
    "3. Acuan normatif":
      "3. Normative references",
    "Klausul standar dan peraturan yang mendasari.":
      "The standard clauses and regulations it rests on.",
    "4. Definisi":
      "4. Definitions",
    "Istilah teknis dan singkatan yang dipakai di dalam prosedur.":
      "Technical terms and abbreviations used inside the procedure.",
    "5. Tanggung jawab dan wewenang":
      "5. Responsibilities and authorities",
    "Tabel peran — siapa mengerjakan, siapa memverifikasi, siapa mengesahkan.":
      "A role table — who does it, who verifies, who approves.",
    "6. Rincian prosedur":
      "6. Procedure detail",
    "Urutan langkah dengan pelaku, masukan, keluaran, dan tenggat setiap langkah.":
      "The sequence of steps with actor, input, output and deadline for each.",
    "7. Bagan alir":
      "7. Flowchart",
    "Diagram satu halaman yang sejalan dengan bagian 6.":
      "A one-page diagram consistent with section 6.",
    "8. Rekaman":
      "8. Records",
    "Formulir yang dihasilkan, siapa menyimpan, dan berapa lama.":
      "The forms produced, who keeps them, and for how long.",
    "9. Lampiran":
      "9. Attachments",
    "Formulir, tabel bantu, dan contoh pengisian.":
      "Forms, helper tables and worked examples.",
    "10. Riwayat revisi":
      "10. Revision history",
    "Nomor revisi, tanggal, ringkasan perubahan, pengesah.":
      "Revision number, date, summary of changes, approver.",
    "1. Tujuan dan lingkup":
      "1. Purpose and scope",
    "Pekerjaan spesifik yang diatur, di mesin atau area mana.":
      "The specific job it governs, on which machine or area.",
    "2. Kualifikasi pelaksana":
      "2. Operator qualification",
    "Pelatihan atau sertifikat yang wajib dimiliki sebelum mengerjakan.":
      "Training or certificates required before doing the work.",
    "3. Alat dan bahan":
      "3. Tools and materials",
    "Daftar alat kerja, alat ukur, dan bahan yang dipakai.":
      "The work tools, measuring instruments and materials used.",
    "4. APD wajib":
      "4. Mandatory PPE",
    "Ditulis eksplisit per langkah, bukan sebagai daftar umum.":
      "Written explicitly per step, not as a general list.",
    "5. Bahaya dan pengendalian":
      "5. Hazards and controls",
    "Diambil dari JSEA atau register risiko yang relevan.":
      "Taken from the relevant JSEA or risk register entry.",
    "6. Langkah kerja":
      "6. Work steps",
    "Urutan bernomor, kalimat perintah, satu tindakan per baris.":
      "Numbered sequence, imperative sentences, one action per line.",
    "7. Kriteria hasil":
      "7. Acceptance criteria",
    "Bagaimana pelaksana tahu langkahnya sudah benar.":
      "How the operator knows the step was done correctly.",
    "8. Keadaan tidak normal":
      "8. Abnormal conditions",
    "Apa yang dihentikan, siapa dihubungi, dan batas kewenangannya.":
      "What is stopped, who is called, and the limits of authority.",
    "9. Rekaman":
      "9. Records",
    "Checklist atau logsheet yang harus diisi setelah pekerjaan.":
      "The checklist or logsheet to be completed after the work.",
    "Kepala formulir":
      "Form header",
    "Nomor dokumen, revisi, tanggal berlaku, dan logo — pada setiap halaman.":
      "Document number, revision, effective date and logo — on every page.",
    "Identitas pengisian":
      "Entry identity",
    "Tanggal, lokasi, shift, nama pengisi, dan nomor rekaman.":
      "Date, location, shift, name of the person filling it in, record number.",
    "Isian utama":
      "Main fields",
    "Kolom data yang benar-benar dipakai; hindari kolom yang tidak pernah dibaca.":
      "The data columns actually used; avoid columns nobody ever reads.",
    "Kolom verifikasi":
      "Verification column",
    "Diisi oleh pihak yang berbeda dari pengisi — tidak boleh verifikasi sendiri.":
      "Completed by someone other than the filler — self-verification is not allowed.",
    "Ruang untuk nomor CAPA bila ditemukan ketidaksesuaian.":
      "Space for a CAPA number when a nonconformity is found.",
    "Tanda tangan":
      "Signatures",
    "Pengisi, pemeriksa, dan pengesah beserta tanggalnya.":
      "Filler, checker and approver, each with a date.",
    "Catatan retensi":
      "Retention note",
    "Lama simpan dan tempat penyimpanan rekaman.":
      "How long the record is kept and where.",
    "RINGKASAN EKSEKUTIF":
      "EXECUTIVE SUMMARY",
    "Kinerja QHSE Menyeluruh":
      "QHSE Performance Overall",
    "Insiden dan kejadian nyaris celaka":
      "Incidents and near misses",
    "Tindakan korektif dan pencegahan (CAPA)":
      "Corrective and preventive actions (CAPA)",
    "Kepatuhan dokumen dan sertifikasi":
      "Document and certification compliance",
    "Register risiko":
      "Risk register",
    "Kinerja lingkungan":
      "Environmental performance",
    "Pelatihan dan kompetensi":
      "Training and competence",
    "Audit dan ketidaksesuaian":
      "Audit and nonconformities",
    "Indikator kinerja K3":
      "OHS performance indicators",
    "Perbandingan antarpabrik":
      "Comparison between plants",
    "Tindakan yang disarankan":
      "Recommended actions",
    "berurutan menurut akibat bila ditunda":
      "ordered by what happens if they are delayed",
    "Seluruh angka pada ringkasan ini dihitung dari modulnya masing-masing saat ringkasan disusun. Tidak ada angka yang diketik tangan, dan tidak ada kalimat yang dikarang di luar data — itulah sebabnya ringkasan ini dapat dibawa ke rapat dan ditelusuri sampai ke barisnya.":
      "Every figure in this summary is computed from its own module at the moment the summary is built. No figure is typed by hand and no sentence is invented beyond the data — which is why this summary can be taken into a meeting and traced back to its rows.",
    "Angka dihitung ulang dari data modul setiap kali ringkasan disusun, jadi selalu sama dengan yang terlihat di modulnya.":
      "The figure is recomputed from module data each time the summary is built, so it always matches what the module shows.",
    "Belum selesai":
      "Not yet completed",
    "Keparahan serius ke atas":
      "Serious severity or above",
    "CAPA aktif":
      "Active CAPAs",
    "Ditutup & diverifikasi":
      "Closed & verified",
    "Dokumen kedaluwarsa":
      "Expired documents",
    "Jatuh tempo ≤ 60 hari":
      "Falling due in ≤ 60 days",
    "Risiko terdaftar":
      "Risks registered",
    "Zona Ekstrem awal":
      "Extreme zone, initial",
    "Zona Ekstrem sisa":
      "Extreme zone, residual",
    "Parameter dipantau":
      "Parameters monitored",
    "Melewati baku mutu":
      "Over the quality standard",
    "Belum terlaksana":
      "Not yet delivered",
    "Sertifikat ≤ 60 hari":
      "Certificates ≤ 60 days",
    "Audit tercatat":
      "Audits recorded",
    "Temuan terbuka":
      "Open findings",
    "Pabrik dipantau":
      "Plants monitored",
    "Berstatus Kritis":
      "In Critical status",
    "Insiden grup":
      "Group incidents",
    "Kejadian":
      "Event",
    "Judul klausul ":
      "Clause title ",
    "Modul CAPA":
      "CAPA module",
    "Modul Dokumen Eksternal":
      "External Documents module",
    "Modul Incident & Nearmiss":
      "Incident & Nearmiss module",
    "Modul Environment":
      "Environment module",
    "Modul Manajemen Pelatihan":
      "Training Management module",
    "Modul Audit":
      "Audit module",
    "Modul Manajemen Risiko":
      "Risk Management module",
    "Modul SHE KPI & Analytics":
      "SHE KPI & Analytics module",
    "Cara Kerja Asisten QHSE":
      "How the QHSE Assistant Works",
    "Apa yang dikerjakannya, dan apa yang tidak":
      "What it does, and what it does not",
    "Asisten berjalan sepenuhnya di dalam peramban. Tidak ada server, tidak ada kunci API, dan tidak ada model bahasa di belakangnya. Empat kemampuannya nyata dan dapat diperiksa satu per satu.":
      "The assistant runs entirely inside the browser. There is no server, no API key and no language model behind it. Its four capabilities are real and can be checked one by one.",
    "Referensi dokumen baru":
      "New document reference",
    "Membaca daftar dokumen terkendali, mengambil nomor bebas berikutnya pada serinya, memetakan klausul ISO 45001, ISO 14001, ISO 9001, dan SMK3 PP 50/2012 dari tabel pemetaan kata kunci, lalu menyusun kerangka isi sesuai tingkat dokumennya. Catatan yang membenarkan penerbitannya diambil dari insiden, temuan audit, CAPA, dan register risiko yang benar-benar ada.":
      "Reads the controlled document register, takes the next free number in its series, maps ISO 45001, ISO 14001, ISO 9001 and SMK3 PP 50/2012 clauses from a keyword table, then builds a content outline matching the document level. The records that justify issuing it are taken from incidents, audit findings, CAPAs and risk register entries that genuinely exist.",
    "Pencarian dokumen ISO":
      "ISO document search",
    "Menelusuri dokumen internal empat tingkat, sertifikat dan izin eksternal, serta dua belas elemen SMK3.":
      "Covers the four levels of internal documents, external certificates and permits, and the twelve SMK3 elements.",
    "Pencarian seluruh data":
      "Search across all data",
    "Satu indeks atas insiden, laporan bahaya, observasi perilaku, inspeksi, checklist, izin kerja dan JSEA, register risiko, CAPA, audit dan temuannya, parameter lingkungan, dokumen, pelatihan dan sertifikasi personel, kegiatan, KPI, notifikasi, kinerja antarpabrik, serta pengguna dan hak aksesnya. Seluruh kata yang diketik harus muncul pada catatan yang sama.":
      "One index over incidents, hazard reports, behaviour observations, inspections, checklists, work permits and JSEAs, the risk register, CAPAs, audits and their findings, environmental parameters, documents, training and personnel certification, activities, KPIs, notifications, plant performance, and users with their access rights. Every word typed must appear in the same record.",
    "Mengenali topik dari kalimat permintaan, lalu menghitung ulang setiap angkanya dari data modul dan menyusun bagian mana yang perlu keputusan manajemen.":
      "Recognises the topic from the request sentence, then recomputes every figure from module data and works out which items need a management decision.",
    "Yang tidak dikerjakannya: mengarang jawaban. Bila sesuatu tidak ada di dalam data, asisten mengatakan tidak ada — bukan menebak. Untuk sistem QHSE sifat ini lebih berharga daripada kemampuan menjawab bebas, karena ringkasan yang dibawa ke rapat manajemen harus dapat dipertanggungjawabkan sampai ke baris datanya.":
      "What it does not do: invent answers. If something is not in the data, the assistant says so rather than guessing. For a QHSE system that trait is worth more than open-ended answering, because a summary taken into a management meeting has to be defensible down to its data rows.",
    "BATAS YANG PERLU DIKETAHUI":
      "LIMITS WORTH KNOWING",

    /* ── Catatan penjelas tambahan pada modal rincian ── */
    "Modul Incident, Nearmiss & Accident — hanya yang berstatus Terverifikasi":
      "Incident, Nearmiss & Accident module — Verified records only",
    "Jumlah CAPA belum selesai dengan tenggat dalam 7 hari ke depan":
      "Count of unfinished CAPAs falling due within the next 7 days",
    "Modul CAPA — status Terbuka dan Dalam Proses yang tenggatnya ≤ 7 hari":
      "CAPA module — Open and In Progress items due in ≤ 7 days",
    "Butir yang sesuai tetap disimpan sebagai rekaman, karena inspeksi tanpa jejak butir yang lolos tidak dapat dibuktikan kepada auditor.":
      "Conforming items are still kept on the record, because an inspection with no trace of the items that passed cannot be proven to an auditor.",
    "Jawaban Tidak Sesuai langsung membuka isian temuan — foto, tingkat risiko, penanggung jawab, dan tenggat — dan temuan itu menjadi CAPA bernomor.":
      "A Not Conforming answer opens the finding form straight away — photo, risk level, owner and due date — and that finding becomes a numbered CAPA.",
    "Satu butir Tidak Sesuai mengunci unit dari operasi sampai temuannya ditutup. Ini gerbang operasi, bukan peringatan.":
      "A single Not Conforming item locks the unit out of operation until its finding is closed. This is an operating gate, not a warning.",
    "Checklist dikerjakan tiap shift oleh operator dan bersifat gerbang operasi — berbeda dari Inspection yang bulanan dan bersifat penilaian.":
      "The checklist is run every shift by the operator and acts as an operating gate — unlike Inspection, which is monthly and assessment-based.",
    "Butir yang sesuai tetap disimpan sebagai rekaman. Checklist yang hanya mencatat pelanggaran tidak dapat membuktikan bahwa pemeriksaan benar-benar dilakukan.":
      "Conforming items are still kept on the record. A checklist that logs only violations cannot prove the check was actually carried out.",
    "Satu butir Tidak Sesuai membuat unit FL-03 otomatis berstatus tidak boleh dioperasikan sampai temuan ditutup. Ini gerbang, bukan peringatan yang bisa dilewati.":
      "A single Not Conforming item automatically puts unit FL-03 out of service until the finding is closed. This is a gate, not a warning that can be waved through.",
    "Tidak boleh diterima — pekerjaan terkait dihentikan sampai skor turun":
      "Unacceptable — the work it covers stops until the score comes down",
    "Temuan Major wajib punya CAPA dengan tenggat. Yang lewat tenggat naik ke merah di seluruh papan.":
      "Every Major finding must carry a CAPA with a due date. Anything past due turns red across every board.",
    "Temuan Minor wajib punya CAPA. Observasi dan Peluang Perbaikan tidak wajib, tetapi tetap dicatat.":
      "Every Minor finding must carry a CAPA. Observations and Improvement Opportunities are not mandatory, but are still recorded.",
    "Setiap nilai terukur selalu disandingkan dengan baku mutunya. Angka tanpa ambang pembanding tidak berarti apa-apa bagi pembaca.":
      "Every measured value is always placed next to its quality standard. A figure with no threshold beside it means nothing to the reader.",
    "Nilai yang melewati ambang melahirkan satu entri CAPA dan muncul di kolom Perhatian Segera pada Dashboard.":
      "A value that crosses the threshold creates one CAPA entry and appears in the Immediate Attention column on the Dashboard.",
    "Saat revisi baru disahkan, versi sebelumnya ditarik dari peredaran dan ditandai kedaluwarsa.":
      "Once a new revision is approved, the previous version is withdrawn from circulation and marked obsolete.",
    "Dokumen yang lewat masa tinjau tertaut ke temuan audit yang bersangkutan. Tanggal tinjau ulang tidak pernah boleh kosong.":
      "A document past its review date is linked to the audit finding that raised it. The review date must never be left empty.",
    "Jam-orang pelatihan ini mengalir ke KPI Jam Pelatihan K3 di modul SHE KPI & Analytics.":
      "These training man-hours flow into the OHS Training Hours KPI in the SHE KPI & Analytics module.",
    "Yang ditanya auditor bukan daftar pelatihan yang pernah diadakan, melainkan mengapa yang direncanakan belum terlaksana.":
      "What an auditor asks for is not the list of training already held, but why the training that was planned has not happened.",
    "Lagging mengukur hasil yang sudah terjadi. TRIR memakai basis 200.000 jam dan LTIFR 1.000.000 jam — membandingkan keduanya secara langsung adalah kekeliruan basis.":
      "Lagging measures outcomes that have already happened. TRIR uses a 200,000-hour base and LTIFR 1,000,000 hours — comparing the two directly is a base error.",
    "Laporan bahaya, inspeksi, pelatihan, patroli, dan CAPA dari modulnya masing-masing":
      "Hazard reports, inspections, training, patrols and CAPAs, each from its own module",
    "Leading mengukur usaha yang sedang dilakukan. Arah \"baik\" mengikuti arti indikatornya, bukan arah angkanya: jumlah laporan bahaya yang naik adalah kabar baik.":
      "Leading measures the effort being made now. The \"good\" direction follows what the indicator means, not which way the number moves: a rising hazard report count is good news.",
    "Hak akses dihitung ulang dari peran pada setiap pemuatan halaman, tidak pernah dititipkan di dalam sesi.":
      "Access rights are recomputed from the role on every page load, never carried inside the session.",
    "Akun tidak pernah dihapus, hanya dinonaktifkan. Menghapus akun akan memutus nama pelapor dari catatan insiden yang sudah ada.":
      "An account is never deleted, only deactivated. Deleting an account would cut the reporter's name loose from incident records that already exist.",

    /* ── Catatan panjang pada modal rincian ── */
    "Aktivitas Terbaru menampilkan tujuh hari terakhir dari seluruh modul, tanpa perlu membuka laporan satu per satu.":
      "Recent Activity shows the last seven days across every module, without opening each report one by one.",
    "Kolom ini hanya memuat item kritis dan tinggi dari seluruh modul. Perubahan status biasa tidak muncul di sini.":
      "This column carries only critical and high items from across the modules. Ordinary status changes do not appear here.",
    "Persetujuan berjenjang tidak dapat dilompati. Izin kerja tidak berstatus Aktif sebelum seluruh langkah selesai dan JSEA-nya lengkap.":
      "The approval chain cannot be skipped. A work permit is not Active until every step is complete and its JSEA is filled in.",
    "Risiko sisa di zona merah menutup penerbitan izin, bukan sekadar memberi peringatan.":
      "Residual risk in the red zone blocks permit issuance outright; it does not merely raise a warning.",
    "Pemenuhan ditampilkan per elemen, bukan sebagai satu angka gabungan. Satu elemen yang lemah tidak boleh tertutup oleh sebelas elemen yang baik.":
      "Compliance is shown element by element, not as a single combined figure. One weak element must never be hidden behind eleven good ones.",
    "TRIR dan LTIFR memakai basis berbeda (200.000 jam versus 1.000.000 jam). Membandingkan keduanya secara langsung adalah kekeliruan paling sering dalam pelaporan K3.":
      "TRIR and LTIFR use different bases (200,000 hours versus 1,000,000 hours). Comparing the two directly is the most common error in OHS reporting.",
    "Status pabrik ditentukan oleh indikator terburuk, bukan rata-rata. Merata-ratakan akan menyembunyikan satu angka yang bermasalah di balik angka lain yang baik.":
      "Plant status is set by the worst indicator, not by the average. Averaging would hide one problem figure behind the good ones.",
    "Program strategis dipantau di tingkat grup. Yang tidak dapat diselesaikan di tingkat pabrik naik ke bagian Perlu keputusan manajemen.":
      "Strategic programmes are tracked at group level. Whatever cannot be settled at the plant escalates to the Management decision required section.",
    "Papan eksekutif tanpa bagian ini hanya memindahkan angka, tidak memindahkan keputusan. Isinya adalah hal yang tidak dapat diselesaikan di tingkat pabrik: belanja modal, penugasan orang, dan penjadwalan lembaga sertifikasi.":
      "An executive board without this section moves numbers, not decisions. What sits here is what a plant cannot settle on its own: capital spending, staffing, and certification-body scheduling.",
    "Ambang tetap: sisa ≤ 30 hari merah, ≤ 60 hari jingga. Perpanjangan sertifikasi wajib dimulai sebelum masuk ambang merah, karena penjadwalan lembaga sertifikasi memerlukan waktu.":
      "Fixed thresholds: ≤ 30 days left is red, ≤ 60 days amber. Renewal of a mandatory certification has to start before the red threshold, because booking a certification body takes time.",
    "Tidak ada risiko sisa yang boleh berada di zona Ekstrem. Bila ada, pekerjaan terkait tidak boleh berjalan sampai skornya turun.":
      "No residual risk may sit in the Extreme zone. If one does, the work it covers must not run until the score comes down.",
    "Matriks 5×5 dan kosakata zonanya sama persis dengan yang dipakai JSEA pada modul Work Permit. Dua matriks berbeda dalam satu aplikasi menghasilkan dua angka yang tidak dapat dibandingkan.":
      "The 5×5 matrix and its zone vocabulary are exactly the ones the JSEA uses in the Work Permit module. Two different matrices inside one application produce two numbers that cannot be compared.",
    "Tingkat 1 mengikat tingkat di bawahnya. Instruksi kerja yang bertentangan dengan prosedur di atasnya adalah ketidaksesuaian, bukan penyesuaian lapangan.":
      "Level 1 binds every level beneath it. A work instruction that contradicts the procedure above it is a nonconformity, not a field adjustment.",
    "Peringatan otomatis dikirim pada H-60, H-30, H-14, dan H-7. Pelaporan wajib diperlakukan sama seperti izin, karena keterlambatan keduanya sama-sama berakibat hukum.":
      "Automatic alerts go out at D-60, D-30, D-14 and D-7. Mandatory reporting is treated exactly like a permit, because being late on either carries the same legal consequence.",
    "Kolom perilaku aman diisi lebih dulu dan selalu lebih besar. Kategori dengan pita merah terpanjang menjadi tema safety talk bulan berikutnya.":
      "The safe-behaviour column is filled in first and always runs higher. The category with the longest red bar becomes next month's safety talk theme.",
    "Pekerja yang diamati tidak pernah dicatat namanya. Satu temuan perilaku juga tidak otomatis menjadi CAPA — yang menjadi CAPA adalah pola yang berulang.":
      "The worker being observed is never recorded by name. A single behavioural finding does not automatically become a CAPA either — what becomes a CAPA is a repeating pattern.",
    "Menandai terbaca tidak menghentikan pengingat: item yang lewat tenggat tetap dikirim ulang setiap hari sampai ditutup di modulnya.":
      "Marking as read does not stop the reminder: an overdue item is resent every day until it is closed in its own module.",
    "Pemberitahuan hanya dikirim bila membawa tindakan: sesuatu yang lewat tenggat, menunggu keputusan penerimanya, atau melewati ambang. Perubahan status biasa tidak dikirim — cukup terlihat di modulnya.":
      "A notification is sent only when it carries an action: something overdue, something waiting on the recipient's decision, or a threshold crossed. Ordinary status changes are not sent — they are visible in the module itself.",
    "Tidak ada peran yang boleh memverifikasi catatannya sendiri. Sistem K3 yang memperbolehkan penutupan sendiri kehilangan gunanya sebagai bukti audit.":
      "No role may verify its own record. An OHS system that allows self-closure loses its worth as audit evidence.",
    "Angka turun bukan selalu kabar baik. Bacalah bersama jumlah laporan bahaya: insiden turun sementara laporan bahaya juga turun biasanya berarti pelaporan yang melemah, bukan pabrik yang membaik.":
      "A falling figure is not always good news. Read it alongside the hazard report count: incidents down while hazard reports are also down usually means reporting is weakening, not that the plant is improving.",
    "Angka ini kembali ke nol pada kecelakaan hilang waktu kerja berikutnya. Karena itu ia tidak pernah dipakai sendirian sebagai ukuran keberhasilan program.":
      "This figure resets to zero at the next lost-time injury. That is why it is never used on its own as a measure of programme success.",
    "Setiap temuan Major dan Minor wajib punya CAPA dengan tenggat. Temuan tanpa CAPA adalah temuan audit berikutnya yang sedang menunggu.":
      "Every Major and Minor finding must carry a CAPA with a due date. A finding without a CAPA is next audit's finding, already waiting.",
    "Penuaan dihitung dari tanggal terbit, bukan tanggal tenggat. Modul CAPA adalah tempat sistem QHSE paling sering gagal dalam praktik, jadi item macet sengaja dibuat tidak bisa tidak terlihat.":
      "Ageing is counted from the issue date, not the due date. The CAPA module is where QHSE systems most often fail in practice, so stalled items are deliberately made impossible to miss.",
    "Angka grup menyembunyikan sebaran antarpabrik. Semarang di 0,56 berada di atas target meskipun angka grup lolos — karena itu kartu skor pabrik dibaca berdampingan dengan ubin ini.":
      "The group figure hides the spread between plants. Semarang at 0.56 is above target even though the group figure passes — which is why the plant scorecard is read side by side with this tile.",
    "LTIFR memakai basis 1.000.000 jam, TRIR memakai 200.000 jam. Dua angka ini tidak boleh dibandingkan langsung satu sama lain.":
      "LTIFR uses a 1,000,000-hour base, TRIR a 200,000-hour base. The two figures must never be compared directly against each other.",
    "Angka akumulatif ini kembali ke nol per pabrik pada kecelakaan hilang waktu kerja berikutnya, jadi ia tidak pernah dipakai sendirian sebagai ukuran keberhasilan program.":
      "This running figure resets to zero for that plant at the next lost-time injury, so it is never used on its own as a measure of programme success.",
    "Status pabrik ditentukan oleh indikator terburuk, bukan rata-rata. Satu pabrik yang belum nihil tidak boleh tertutup oleh tiga pabrik yang sudah nihil.":
      "Plant status is set by the worst indicator, not by the average. One plant that is not yet at zero must not be hidden behind three that are.",

    /* ══ Modul 22 · Analisis JSA ══ */
    'MODUL 22 · ANALISIS JSA': 'MODULE 22 · JSA ANALYSIS',
    'Job Safety Analysis': 'Job Safety Analysis',
    'Setiap pekerjaan dipecah menjadi langkah, setiap langkah dinilai bahayanya, dan setiap bahaya diberi pengendalian menurut hierarki. JSA disusun sekali lalu dipakai berulang — menyusun ulang tiap kali izin terbit adalah cara tercepat membuat orang menyalin tanpa berpikir.':
      'Each job is broken into steps, each step is assessed for its hazards, and each hazard is given a control from the hierarchy. A JSA is written once and reused — rewriting it every time a permit is issued is the fastest way to make people copy without thinking.',
    'JSA TERDAFTAR': 'JSAs ON FILE',
    'Jumlah JSA pada pustaka, apa pun statusnya': 'JSAs in the library, whatever their status',
    'Pustaka dipakai ulang oleh izin kerja sejenis': 'The library is reused by permits of the same kind',
    'JSA berstatus Disahkan': 'JSAs with status Approved',
    'siap dipakai izin kerja': 'ready for permit use',
    'MENUNGGU PENGESAHAN': 'AWAITING APPROVAL',
    'JSA berstatus selain Disahkan': 'JSAs with any status other than Approved',
    'Belum dapat dipakai menerbitkan izin': 'Cannot yet be used to issue a permit',
    'RISIKO SISA TERTINGGI': 'HIGHEST RESIDUAL RISK',
    'Risiko sisa tertinggi': 'Highest residual risk',
    'Nilai tertinggi kemungkinan × keparahan setelah pengendalian': 'Highest likelihood × severity after controls',
    'Seluruh langkah pada seluruh JSA': 'Every step across every JSA',
    'dari seluruh langkah pada pustaka': 'across every step in the library',
    'Pustaka JSA': 'JSA library',
    'Pekerjaan': 'Job',
    'Pekerjaan yang dianalisis': 'Job analysed',
    'Jenis pekerjaan': 'Job type',
    'Awal → Sisa': 'Initial → Residual',
    'Rev': 'Rev',
    'Penyusun': 'Prepared by',
    'Tinjau berikutnya': 'Next review',
    'Langkah kerja': 'Work steps',
    'LANGKAH KERJA': 'WORK STEPS',
    'Langkah kerja & pengendaliannya': 'Work steps and their controls',
    'APD wajib': 'Mandatory PPE',
    'Izin kerja terkait': 'Related work permits',
    'Izin kerja yang memakai': 'Permits that use it',
    'belum dipakai izin mana pun': 'not yet used by any permit',
    'tidak memerlukan izin khusus': 'needs no special permit',
    'Susun JSA': 'Write a JSA',
    'Susun JSA Baru': 'Write a New JSA',
    'Satu JSA per jenis pekerjaan, dipakai berulang': 'One JSA per job type, reused',
    'Mulai Menyusun': 'Start Writing',
    'Contoh: Pengelasan pipa uap': 'Example: Welding a steam pipe',
    'Contoh: Pembersihan ducting exhaust': 'Example: Cleaning exhaust ducting',
    'Contoh: Pembersihan ducting exhaust oven': 'Example: Cleaning oven exhaust ducting',
    'Contoh: Produksi — Oven': 'Example: Production — Oven',
    'Langkah demi langkah diisi pada layar berikutnya. JSA baru berstatus Draf dan belum dapat dilampirkan pada izin kerja sampai disahkan.':
      'The steps are filled in on the next screen. A new JSA starts as a Draft and cannot be attached to a permit until it is approved.',
    'JSA-2026-013 dibuat sebagai draf. Lanjutkan mengisi langkah kerja.':
      'JSA-2026-013 created as a draft. Carry on filling in the work steps.',
    'Hierarki Pengendalian yang Dipakai': 'Hierarchy of Controls in Use',
    'Hierarki pengendalian': 'Hierarchy of controls',
    'urutan wajib: yang di atas dicoba lebih dulu': 'a required order: the upper levels are tried first',
    'Menghilangkan bahayanya sama sekali': 'Removes the hazard entirely',
    'Mengganti dengan yang kurang berbahaya': 'Replaces it with something less hazardous',
    'Memisahkan orang dari bahaya secara fisik': 'Physically separates people from the hazard',
    'Mengubah cara orang bekerja': 'Changes the way people work',
    'Pelindung terakhir pada tubuh pekerja': 'The last barrier, worn on the body',
    'Tertinggi — tidak bergantung pada kepatuhan orang': 'Highest — does not depend on anyone complying',
    'Tinggi — tetap bekerja walau orang lupa': 'High — still works when people forget',
    'Sedang — bergantung pada disiplin dan pengawasan': 'Moderate — depends on discipline and supervision',
    'Terendah — gagal begitu pekerja melepasnya': 'Lowest — fails the moment it is taken off',
    'Dipakai pada pustaka': 'Used in the library',
    'pengendalian': 'controls',
    'Pengesah: Plant Manager atau QHSE Supervisor': 'Approver: Plant Manager or QHSE Supervisor',
    'Skor ditulis sebagai kemungkinan × keparahan pada matriks 5×5 yang sama dengan HIRADC dan Manajemen Risiko. JSA yang belum disahkan tidak boleh dilampirkan pada izin kerja.':
      'Scores are written as likelihood × severity on the same 5×5 matrix used by HIRADC and Risk Management. A JSA that is not yet approved must not be attached to a work permit.',
    'JSA yang belum disahkan tidak boleh dilampirkan pada izin kerja. Izin yang terbit dengan JSA draf adalah temuan audit.':
      'A JSA that is not yet approved must not be attached to a work permit. A permit issued against a draft JSA is an audit finding.',
    'Kolom Awal → Sisa memakai skor tertinggi di antara seluruh langkah, bukan rata-rata. Satu langkah berbahaya tidak boleh tersamarkan oleh lima langkah aman.':
      'The Initial → Residual column takes the highest score across all steps, not the average. One dangerous step must not be masked by five safe ones.',
    'Selama ada satu langkah di zona Ekstrem, izin kerja untuk pekerjaan itu tidak dapat diterbitkan.':
      'While a single step sits in the Extreme zone, no permit can be issued for that job.',
    'APD adalah lapisan terakhir, bukan yang pertama. JSA yang seluruh pengendaliannya berupa APD berarti bahayanya belum benar-benar ditangani.':
      'PPE is the last layer, not the first. A JSA whose controls are all PPE means the hazard has not really been dealt with.',
    'JSA yang tidak pernah dipakai ulang biasanya tanda pekerjaan itu sebenarnya tidak berulang — atau tanda JSA-nya tidak pernah dicari orang.':
      'A JSA that is never reused usually means the job is not actually recurring — or that nobody ever goes looking for the JSA.',
    'Sebaran yang sehat menumpuk di Rekayasa ke atas. Bila APD paling banyak, bahayanya belum ditangani — hanya dipindahkan ke tubuh pekerja.':
      'A healthy spread clusters at Engineering and above. If PPE is the largest band, the hazard has not been dealt with — only moved onto the worker\'s body.',
    'Modul Analisis JSA': 'JSA Analysis module',
    'Analisis JSA': 'JSA Analysis',

    /* ══ Modul 23 · HIRADC K3 ══ */
    'MODUL 23 · HIRADC K3': 'MODULE 23 · OHS HIRADC',
    'Identifikasi Bahaya, Penilaian Risiko & Penentuan Pengendalian': 'Hazard Identification, Risk Assessment & Determining Control',
    'Menilai bahaya pada tingkat aktivitas — rutin, non-rutin, dan keadaan darurat. Hasilnya yang menjadi masukan bagi JSA, izin kerja, dan program pelatihan. Aktivitas yang tidak pernah masuk HIRADC tidak akan pernah punya pengendalian.':
      'Hazards are assessed at the activity level — routine, non-routine and emergency. What comes out of it feeds the JSAs, the permits and the training programme. An activity that never enters HIRADC will never have a control.',
    'AKTIVITAS DINILAI': 'ACTIVITIES ASSESSED',
    'Aktivitas dinilai': 'Activities assessed',
    'aktivitas dinilai': 'activities assessed',
    'Jumlah baris HIRADC aktif': 'Active HIRADC rows',
    'Seluruh proses produksi dan penunjang': 'All production and supporting processes',
    'non-rutin & darurat': 'non-routine & emergency',
    'ZONA EKSTREM SISA': 'EXTREME ZONE REMAINING',
    'Skor sisa ≥ 15 setelah pengendalian': 'Residual score ≥ 15 after controls',
    'Zona Ekstrem dimulai pada skor 15': 'The Extreme zone starts at a score of 15',
    'Aktivitas dengan risiko sisa Ekstrem tidak boleh berjalan sampai pengendalian tambahannya terpasang.':
      'An activity with an Extreme residual risk must not run until its additional controls are in place.',
    'PENURUNAN SKOR': 'SCORE REDUCTION',
    'Selisih total skor awal dan skor sisa': 'Total initial score less total residual score',
    'Σ (awal − sisa) seluruh aktivitas': 'Σ (initial − residual) across all activities',
    'oleh pengendalian yang sudah ada': 'by the controls already in place',
    'Angka ini hanya berarti bila pengendaliannya benar-benar terpasang di lapangan, bukan baru tertulis di kolom.':
      'This figure only means something when the controls are actually in place on the floor, not merely written into the column.',
    'BELUM DIKERJAKAN': 'NOT YET DONE',
    'Baris HIRADC berstatus Terbuka': 'HIRADC rows with status Open',
    'pengendalian tambahan berstatus Terbuka': 'additional controls still open',
    'Masing-masing punya penanggung jawab dan tenggat': 'Each one carries an owner and a due date',
    'Aktivitas non-rutin dan keadaan darurat paling sering terlewat, padahal di sanalah kecelakaan besar terjadi.':
      'Non-routine activities and emergencies are the ones most often missed, and they are where the serious accidents happen.',
    'Sumber Bahaya': 'Hazard Sources',
    'Sumber bahaya': 'Hazard source',
    'tujuh kategori': 'seven categories',
    'aktivitas': 'activities',
    'Register HIRADC': 'HIRADC register',
    'Aktivitas': 'Activity',
    'AKTIVITAS': 'ACTIVITY',
    'Sifat': 'Nature',
    'Sifat pekerjaan': 'Nature of the work',
    'Rutin': 'Routine',
    'Non-rutin': 'Non-routine',
    'Darurat': 'Emergency',
    'Bahaya yang teridentifikasi': 'Hazard identified',
    'Apa yang dapat mencederai, dan bagaimana': 'What can cause harm, and how',
    'Risiko yang timbul': 'Resulting risk',
    'Siapa yang terpapar': 'Who is exposed',
    'Yang terpapar': 'Those exposed',
    'Pengendalian yang sudah ada': 'Controls already in place',
    'Pengendalian tambahan': 'Additional controls',
    'Penilaian awal': 'Initial assessment',
    'Penilaian sisa': 'Residual assessment',
    'Kemungkinan × Keparahan setelah pengendalian yang ada': 'Likelihood × severity after the existing controls',
    'Hierarki': 'Hierarchy',
    'Tambah Aktivitas': 'Add Activity',
    'Tambah Aktivitas HIRADC': 'Add a HIRADC Activity',
    'Termasuk aktivitas non-rutin dan keadaan darurat': 'Including non-routine activities and emergencies',
    'Simpan Aktivitas': 'Save Activity',
    'HRD-013 tersimpan. Lengkapi penilaian dan pengendaliannya.': 'HRD-013 saved. Complete its assessment and controls.',
    'Matriks 5×5 dan kosakata zonanya sama persis dengan yang dipakai JSA dan Manajemen Risiko. Tiga matriks berbeda dalam satu sistem menghasilkan tiga angka yang tidak dapat dibandingkan.':
      'The 5×5 matrix and its zone vocabulary are exactly those used by JSA and Risk Management. Three different matrices in one system produce three figures that cannot be compared.',
    'Kategori dipakai supaya tidak ada jenis bahaya yang terlupakan seluruhnya. Psikososial dan ergonomi paling sering kosong pada HIRADC yang disusun terburu-buru.':
      'The categories exist so that no class of hazard is forgotten altogether. Psychosocial and ergonomic are the ones most often left empty in a hurried HIRADC.',
    'Penilaian sisa hanya boleh diturunkan setelah pengendaliannya benar-benar terpasang di lapangan, bukan setelah direncanakan.':
      'A residual score may only be lowered once the control is actually in place on the floor, not once it has been planned.',
    'Penilaian sisa hanya boleh diturunkan setelah pengendaliannya benar-benar terpasang di lapangan. Menurunkan skor karena pengendalian sudah direncanakan adalah cara paling umum HIRADC kehilangan artinya.':
      'A residual score may only be lowered once the control is actually in place on the floor. Lowering it because a control has been planned is the most common way a HIRADC loses its meaning.',
    'Modul HIRADC K3': 'OHS HIRADC module',
    'HIRADC K3': 'OHS HIRADC',
    'Bahaya per aktivitas & skornya': 'Hazards per activity and their scores',

    /* ══ Modul 24 · Induksi K3 ══ */
    'MODUL 24 · INDUKSI K3': 'MODULE 24 · OHS INDUCTION',
    'Induksi Keselamatan Kerja': 'Safety Induction',
    'Kartu induksi adalah gerbang masuk area produksi. Tanpa kartu yang masih berlaku, siapa pun tidak boleh berada di lantai produksi — termasuk kontraktor dan tamu. Kontraktor diberi masa berlaku lebih pendek karena perputarannya tinggi.':
      'The induction card is the gate into the production area. Without a valid card nobody may be on the production floor — contractors and visitors included. Contractors are given a shorter validity because they turn over quickly.',
    'KARTU BERLAKU': 'CARDS IN FORCE',
    'kartu berlaku': 'cards in force',
    'Induksi berstatus Berlaku': 'Inductions with status In force',
    'Boleh memasuki area produksi': 'May enter the production area',
    'SEGERA BERAKHIR': 'EXPIRING SOON',
    'Segera Berakhir': 'Expiring Soon',
    'Induksi dengan sisa masa berlaku ≤ 30 hari': 'Inductions with 30 days or less remaining',
    'Sisa ≤ 30 hari · induksi ulang perlu dijadwalkan': '30 days or less remaining · re-induction needs scheduling',
    'Akses dicabut otomatis pada tanggal berakhir': 'Access is withdrawn automatically on the expiry date',
    'Induksi yang masa berlakunya sudah lewat': 'Inductions whose validity has passed',
    'dilarang memasuki area produksi': 'barred from the production area',
    'Kontraktor dengan kartu kedaluwarsa yang tetap bekerja adalah temuan audit sekaligus pelanggaran kewajiban pengendalian kontraktor.':
      'A contractor still working on an expired card is both an audit finding and a breach of the duty to control contractors.',
    'TIDAK LULUS': 'NOT PASSED',
    'Tidak Lulus': 'Not Passed',
    'Peserta dengan nilai uji pemahaman < 80': 'Participants scoring below 80 on the comprehension test',
    'nilai di bawah 80': 'scored below 80',
    'Wajib mengulang induksi, bukan diloloskan': 'Must repeat the induction, not be waved through',
    'Meloloskan peserta yang tidak lulus membuat seluruh rekaman induksi kehilangan artinya sebagai bukti.':
      'Waving through a participant who did not pass strips the whole induction record of its worth as evidence.',
    'Materi Induksi': 'Induction Material',
    'Materi wajib': 'Mandatory material',
    'Materi wajib & masa berlaku kartu': 'Mandatory material and card validity',
    'Rekaman Induksi': 'Induction Records',
    'Kartu induksi Anda': 'Your induction card',
    'Jenis peserta': 'Participant type',
    'Pekerja Baru': 'New Worker',
    'Kontraktor': 'Contractor',
    'Tamu': 'Visitor',
    'Asal / keperluan': 'From / purpose',
    'Asal atau keperluan': 'Origin or purpose',
    'Tanggal induksi': 'Induction date',
    'Nilai uji pemahaman': 'Comprehension test score',
    'Jadwalkan Induksi': 'Schedule Induction',
    'Jadwalkan Induksi K3': 'Schedule an OHS Induction',
    'Kartu induksi adalah gerbang masuk area produksi': 'The induction card is the gate into the production area',
    'Nama atau nama rombongan': 'Name, or the name of the group',
    'Contoh: Tim CV Teknik Jaya (6 orang)': 'Example: CV Teknik Jaya team (6 people)',
    'Induksi IND-2026-0089 dijadwalkan.': 'Induction IND-2026-0089 scheduled.',
    'Masa berlaku otomatis: pekerja baru 12 bulan, kontraktor 6 bulan, tamu 3 bulan. Nilai uji pemahaman di bawah 80 berarti mengulang, bukan diloloskan.':
      'Validity is set automatically: 12 months for a new worker, 6 for a contractor, 3 for a visitor. A comprehension score below 80 means repeating the induction, not being waved through.',
    'Materi yang sama diberikan kepada pekerja, kontraktor, dan tamu. Yang berbeda hanya kedalaman bagian 6, karena tamu tidak menerbitkan izin kerja.':
      'The same material is given to workers, contractors and visitors. Only the depth of part 6 differs, because visitors do not issue work permits.',
    'Kartu ini sudah kedaluwarsa. Pemegangnya tidak boleh berada di area produksi sampai induksi ulang selesai.':
      'This card has expired. Its holder must not be in the production area until re-induction is complete.',
    'Nilai di bawah ambang lulus. Peserta wajib mengulang induksi — meloloskannya membuat seluruh rekaman induksi kehilangan artinya sebagai bukti.':
      'Below the pass mark. The participant must repeat the induction — waving them through strips the whole induction record of its worth as evidence.',
    'Kartu induksi adalah gerbang masuk area produksi. Masa berlaku kontraktor lebih pendek karena perputarannya tinggi.':
      'The induction card is the gate into the production area. Contractor validity is shorter because contractors turn over quickly.',
    'Kartu induksi adalah gerbang masuk area produksi. Kartu yang kedaluwarsa berarti tidak boleh masuk — bukan sekadar catatan administrasi yang tertunda.':
      'The induction card is the gate into the production area. An expired card means no entry — not merely a piece of paperwork running late.',
    'Modul Induksi K3': 'OHS Induction module',
    'Induksi K3': 'OHS Induction',

    /* ══ Modul 25 · Regulasi K3 ══ */
    'MODUL 25 · REGULASI K3': 'MODULE 25 · OHS REGULATIONS',
    'Peraturan Perundangan & Pemenuhannya': 'Legal Requirements & Compliance',
    'Klausul 6.1.3 ISO 45001 tidak meminta daftar peraturan. Yang diminta adalah bukti bahwa tiap peraturan sudah diterjemahkan menjadi sesuatu yang benar-benar dikerjakan — karena itu setiap baris di sini membawa kolom penerapan dan buktinya.':
      'Clause 6.1.3 of ISO 45001 does not ask for a list of regulations. It asks for evidence that each one has been turned into something actually done — which is why every row here carries an implementation column and its evidence.',
    'Klausul 6.1.3 ISO 45001 tidak meminta daftar peraturan, melainkan bukti bahwa peraturannya sudah diterjemahkan menjadi sesuatu yang dikerjakan. Karena itu baris tanpa kolom bukti dianggap belum terpenuhi.':
      'Clause 6.1.3 of ISO 45001 does not ask for a list of regulations but for evidence that each has been turned into something done. A row without an evidence column therefore counts as not met.',
    'PERATURAN TERDAFTAR': 'REGULATIONS ON FILE',
    'Jumlah peraturan pada register': 'Regulations in the register',
    'K3, lingkungan, dan kelembagaan': 'OHS, environment and institutional',
    'Peraturan berstatus Terpenuhi ÷ total': 'Regulations marked Met ÷ total',
    'terpenuhi penuh': 'fully met',
    'Penerapan dan buktinya lengkap': 'Implementation and evidence are complete',
    '% dari seluruh peraturan': '% of all regulations',
    'TERPENUHI SEBAGIAN': 'PARTIALLY MET',
    'Terpenuhi Sebagian': 'Partially Met',
    'Peraturan berstatus Terpenuhi Sebagian': 'Regulations marked Partially Met',
    'bukti belum lengkap atau kedaluwarsa': 'evidence incomplete or expired',
    'Perlu dilengkapi sebelum audit berikutnya': 'To be completed before the next audit',
    'TIDAK TERPENUHI': 'NOT MET',
    'Tidak Terpenuhi': 'Not Met',
    'Peraturan berstatus Tidak Terpenuhi': 'Regulations marked Not Met',
    'tidak ada': 'none',
    'Berakibat hukum, bukan sekadar temuan': 'Carries legal consequence, not merely a finding',
    'Ketidakpatuhan pada peraturan perundangan tidak dapat ditutup dengan CAPA internal saja — penyelesaiannya melibatkan instansi penerbit.':
      'Non-compliance with a legal requirement cannot be closed by an internal CAPA alone — resolving it involves the issuing authority.',
    'Register Peraturan': 'Regulation register',
    'Peraturan': 'Regulation',
    'Peraturan yang berlaku': 'Regulations in force',
    'Peraturan & penerapannya di sini': 'Regulations and how they apply here',
    'Bidang': 'Field',
    'Judul': 'Title',
    'Judul lengkap peraturan': 'Full title of the regulation',
    'Nomor peraturan': 'Regulation number',
    'Contoh: Permenaker No. 5 Tahun 2018': 'Example: Minister of Manpower Regulation No. 5 of 2018',
    'Pasal terkait': 'Relevant articles',
    'Pasal yang relevan': 'Relevant articles',
    'Contoh: Pasal 5–8, 12, 22': 'Example: Articles 5–8, 12, 22',
    'Penerapan di Khong Guan': 'How Khong Guan applies it',
    'Cara Khong Guan memenuhinya': 'How Khong Guan meets it',
    'Apa yang benar-benar dikerjakan, bukan kutipan pasalnya': 'What is actually done, not a quotation of the article',
    'Bukti': 'Evidence',
    'Evaluasi': 'Evaluation',
    'Evaluasi berikutnya': 'Next evaluation',
    'Evaluasi penaatan terakhir': 'Last compliance evaluation',
    'Status pemenuhan': 'Compliance status',
    'Tambah Peraturan': 'Add Regulation',
    'Setiap peraturan wajib punya kolom penerapan dan bukti': 'Every regulation must carry an implementation column and evidence',
    'REG-013 tersimpan. Lengkapi kolom bukti sebelum evaluasi berikutnya.': 'REG-013 saved. Complete the evidence column before the next evaluation.',
    'Evaluasi penaatan dilakukan sekurang-kurangnya setahun sekali dan setiap kali ada peraturan baru. Tanggal evaluasi yang tidak pernah berubah adalah tanda register ini hanya disalin, bukan dibaca.':
      'Compliance is evaluated at least once a year and whenever a new regulation appears. An evaluation date that never changes is a sign this register is being copied, not read.',
    'Baris tanpa kolom bukti dianggap belum terpenuhi. Daftar peraturan yang tidak menunjuk bukti apa pun tidak menjawab klausul 6.1.3.':
      'A row without an evidence column counts as not met. A list of regulations that points to no evidence does not answer clause 6.1.3.',
    'Peraturan tanpa kolom penerapan dan bukti hanyalah daftar bacaan. Yang diperiksa auditor adalah dua kolom itu, bukan jumlah peraturan yang terdaftar.':
      'A regulation without implementation and evidence columns is just a reading list. What the auditor checks is those two columns, not how many regulations are on file.',
    'Modul Regulasi K3': 'OHS Regulations module',
    'Regulasi K3': 'OHS Regulations',

    /* ══ Observasi APD ══ */
    'Observasi APD': 'PPE Observation',
    'Observasi APD dari Lapangan': 'Field PPE Observations',
    'Observasi Perilaku · APD': 'Behaviour Observation · PPE',
    'Catat Observasi APD': 'Record a PPE Observation',
    'Kepatuhan per jenis APD': 'Compliance by PPE type',
    'Kepatuhan per jenis APD per area': 'Compliance by PPE type, by area',
    'Kepatuhan per jenis APD di satu area': 'Compliance by PPE type in one area',
    'Kepatuhan APD': 'PPE compliance',
    'Jenis APD': 'PPE type',
    'Jenis APD diperiksa': 'PPE types checked',
    'Jenis APD yang diperiksa': 'PPE types checked',
    'Wajib di area': 'Required in area',
    'Wajib di:': 'Required in:',
    'Pekerja diamati': 'Workers observed',
    'Pekerja yang diamati': 'Workers observed',
    'Jumlah pekerja diamati': 'Number of workers observed',
    'Memakai dengan benar': 'Wearing it correctly',
    'Diamati': 'Observed',
    'Diamati / patuh': 'Observed / compliant',
    'Diamati / memakai dengan benar': 'Observed / wearing it correctly',
    'Patuh': 'Compliant',
    'Patuh lengkap': 'Fully compliant',
    'TIDAK PATUH': 'NON-COMPLIANT',
    'belum ada pengamatan': 'no observations yet',
    '% patuh': '% compliant',
    'APD-2026-0143 tersimpan. Angka masuk ke KPI Kepatuhan APD.': 'APD-2026-0143 saved. The figure feeds the PPE Compliance KPI.',
    'Contoh: Dua operator tanpa pelindung telinga di dekat mesin oven.': 'Example: Two operators without hearing protection near the oven.',
    'Jumlah pekerja yang diamati belum diisi.': 'The number of workers observed has not been filled in.',
    'Jumlah patuh tidak boleh melebihi jumlah yang diamati.': 'The compliant count cannot exceed the number observed.',
    'Ketuk untuk menyalakan atau mematikan. Hanya APD yang benar-benar diamati yang dinyalakan — jenis yang tidak diperiksa lebih baik kosong daripada ditebak.':
      'Tap to switch on or off. Only switch on the PPE you actually observed — a type you did not check is better left empty than guessed.',
    'Terpasang tetapi salah pakai dihitung tidak patuh. Helm tanpa tali dagu tidak menahan apa pun saat benda jatuh.':
      'Worn but worn wrongly counts as non-compliant. A helmet without its chin strap holds nothing when something falls.',
    'Kepatuhan APD adalah indikator leading: angkanya turun lebih dulu, jauh sebelum muncul sebagai cedera. Nama pekerja tidak dicatat.':
      'PPE compliance is a leading indicator: the figure falls first, long before it shows up as an injury. No worker is named.',
    'Kepatuhan APD adalah indikator leading. Angka yang turun lebih dulu terlihat di sini sebelum muncul sebagai cedera di modul Insiden.':
      'PPE compliance is a leading indicator. A falling figure shows up here before it shows up as an injury in the Incident module.',
    'Angka ini mengalir ke KPI Kepatuhan APD. Yang dicatat adalah kepatuhan per jenis APD per area, bukan nama pekerja — sama seperti observasi perilaku.':
      'This figure feeds the PPE Compliance KPI. What is recorded is compliance by PPE type and area, not worker names — exactly as for behaviour observations.',
    'Nama pekerja tidak dicatat. Yang diukur adalah kepatuhan per jenis APD per area, dan angkanya mengalir ke KPI Kepatuhan APD.':
      'No worker is named. What is measured is compliance by PPE type and area, and the figure feeds the PPE Compliance KPI.',
    'Observasi APD dipisahkan dari observasi perilaku karena yang diukur berbeda: bukan pola perilaku, melainkan kepatuhan pemakaian per jenis APD per area. Nama pekerja tidak pernah dicatat pada keduanya.':
      'PPE observation is kept separate from behaviour observation because it measures something different: not patterns of behaviour but compliance by PPE type and area. Neither ever records a worker\'s name.',

    /* ══ Izin kerja dari lapangan ══ */
    'Pengajuan Izin Kerja': 'Work Permit Request',
    'Pengajuan Izin Kerja dari Lapangan': 'Field Work Permit Requests',
    'Ajukan Izin': 'Submit Request',
    'Ajukan · disetujui QHSE': 'Request only · QHSE approves',
    'Pengajuan saja · persetujuan tetap di QHSE': 'A request only · approval stays with QHSE',
    'Pekerjaan yang akan dilakukan': 'Work to be carried out',
    'Contoh: Pengelasan penyangga pipa uap di atap Boiler 2.': 'Example: Welding a steam-pipe bracket on the Boiler 2 roof.',
    'Pengawas pekerjaan': 'Work supervisor',
    'Nama pengawas yang berada di lokasi': 'Name of the supervisor present on site',
    'Nama pengawas pekerjaan belum diisi.': 'The work supervisor has not been filled in.',
    'Rencana mulai': 'Planned start',
    'Perkiraan lama kerja': 'Expected duration',
    'Kurang dari 2 jam': 'Less than 2 hours',
    '2 sampai 4 jam': '2 to 4 hours',
    'Satu shift penuh': 'A full shift',
    'Lebih dari satu shift': 'More than one shift',
    'Prasyarat yang sudah disiapkan': 'Prerequisites already in place',
    'Prasyarat disiapkan': 'Prerequisites in place',
    'Boleh lebih dari satu. Yang belum ditandai akan diperiksa pengawas di lokasi sebelum izin diterbitkan.':
      'More than one may be ticked. Anything left unticked is checked on site by the supervisor before the permit is issued.',
    'belum ada yang ditandai': 'none ticked',
    'belum ada yang ditandai pelapor': 'none ticked by the reporter',
    'APAR di lokasi': 'Extinguisher on site',
    'Gas test': 'Gas test',
    'Penjaga lubang': 'Hole watch',
    'LOTO terpasang': 'LOTO applied',
    'Body harness': 'Body harness',
    'Area dibarikade': 'Area barricaded',
    'Ventilasi paksa': 'Forced ventilation',
    'Ruang Terbatas': 'Confined Space',
    'Pengajuan ini belum menjadi izin. Pekerjaan baru boleh dimulai setelah izin disetujui dan prasyaratnya diperiksa di lokasi oleh pengawas.':
      'This request is not yet a permit. Work may only start once the permit is approved and its prerequisites have been checked on site by the supervisor.',

    /* ══ Aplikasi lapangan · tab Panduan ══ */
    'Panduan': 'Reference',
    'Rujukan K3': 'OHS reference',
    'tersimpan di perangkat': 'stored on the device',
    'kembali ke Panduan': 'back to Reference',
    'JSA yang berlaku': 'JSAs in force',
    'risiko sisa tertinggi di atas': 'highest residual first',
    'Angka di kanan adalah risiko sisa tertinggi setelah pengendalian dipasang — bukan risiko awal. JSA dibaca sebelum pekerjaan dimulai, bukan setelah izin ditandatangani.':
      'The figure on the right is the highest residual risk once controls are in place — not the initial risk. A JSA is read before work starts, not after the permit is signed.',
    'HIRADC menilai aktivitas, bukan orang. Aktivitas non-rutin dan keadaan darurat ikut dinilai karena justru di sanalah pengendalian rutin tidak berlaku.':
      'HIRADC assesses activities, not people. Non-routine activities and emergencies are assessed too, because that is exactly where the routine controls do not hold.',
    'Kotak di atas mencari seluruh isi sistem — prosedur, izin, insiden, CAPA, temuan audit, sertifikat — dan semuanya terbaca tanpa sinyal.':
      'The box above searches the whole system — procedures, permits, incidents, CAPAs, audit findings, certificates — and all of it reads without a signal.',
    '25 modul · laporan Anda sudah ada di sana': '25 modules · your reports are already there',
  };

  /* Pola yang memuat angka: ditangani dengan aturan, bukan entri kamus. */
  const RULES = [
    /* ── Asisten QHSE ── */
    [/^Revisi (\d+)$/, (m) => `Revision ${m[1]}`],
    /* ── Rincian sekali klik ── */
    [/^(\d+) hari sejak terbit$/, (m) => `${m[1]} days since issue`],
    [/^(\d+) dari (\d+) butir \((\d+)%\)$/, (m) => `${m[1]} of ${m[2]} items (${m[3]}%)`],
    [/^(\d+) dari (\d+) butir · (\d+)%$/, (m) => `${m[1]} of ${m[2]} items · ${m[3]}%`],
    [/^(\d+) dari (\d+) modul$/, (m) => `${m[1]} of ${m[2]} modules`],
    [/^(\d+) dari (\d+)$/, (m) => `${m[1]} of ${m[2]}`],
    [/^(\d+) butir Tidak Sesuai$/, (m) => `${m[1]} non-conforming items`],
    [/^(\d+) kriteria$/, (m) => `${m[1]} criteria`],
    [/^(\d+) dokumen$/, (m) => `${m[1]} documents`],
    [/^(\d+) perilaku$/, (m) => `${m[1]} behaviours`],
    [/^(\d+) orang$/, (m) => `${m[1]} people`],
    [/^(\d+) hari$/, (m) => `${m[1]} days`],
    [/^lewat (\d+) hari$/, (m) => `${m[1]} days overdue`],
    [/^Lihat rincian (.+)$/, (m) => `View details for ${phrase(m[1])}`],
    [/^kemungkinan (\d+) × dampak (\d+) = (\d+)$/, (m) => `likelihood ${m[1]} × impact ${m[2]} = ${m[3]}`],
    [/^(\d+) — kemungkinan (\d+) × keparahan (\d+)$/, (m) => `${m[1]} — likelihood ${m[2]} × severity ${m[3]}`],
    [/^RISIKO AWAL (\d+)$/, (m) => `INITIAL RISK ${m[1]}`],
    [/^RISIKO SISA (\d+)$/, (m) => `RESIDUAL RISK ${m[1]}`],
    [/^TURUN (\d+) TINGKAT$/, (m) => `DOWN ${m[1]} LEVELS`],
    [/^OPSI (.+)$/, (m) => `OPTION ${phrase(m[1])}`],
    [/^Butir (\d+)$/, (m) => `Item ${m[1]}`],
    [/^Langkah (\d+) · (.+)$/, (m) => `Step ${m[1]} · ${m[2]}`],
    [/^Elemen (\d+) · (.+)$/, (m) => `Element ${m[1]} · ${m[2]}`],
    [/^Pabrik (.+)$/, (m) => `${m[1]} Plant`],
    [/^Zona (.+)$/, (m) => `Zone ${phrase(m[1])}`],
    [/^Tingkat L(\d) · (.+)$/, (m) => `Level L${m[1]} · ${phrase(m[2])}`],

    [/^(\d+(?:[.,]\d+)?)\s*(?:jt|juta)?\s*vs (\d{4})$/, (m) => `${m[1]} vs ${m[2]}`],
    [/^(.+) vs Agustus$/, (m) => `${phrase(m[1])} vs August`],
    [/^(.+) vs bulan lalu$/, (m) => `${phrase(m[1])} vs last month`],
    [/^(.+) vs audit sebelumnya$/, (m) => `${phrase(m[1])} vs previous audit`],
    [/^sama dengan Agustus$/, () => 'unchanged from August'],
    [/^(\d+) lewat tenggat$/, (m) => `${m[1]} past due`],
    [/^(\d+) lewat tempo$/i, (m) => `${m[1]} overdue`],
    [/^(\d+) TEMUAN$/, (m) => `${m[1]} FINDINGS`],
    [/^(\d+) MAJOR$/, (m) => `${m[1]} MAJOR`],
    [/^(\d+) MINOR$/, (m) => `${m[1]} MINOR`],
    [/^(\d+) OBS$/, (m) => `${m[1]} OBS`],
    [/^(\d+) AMAN$/, (m) => `${m[1]} SAFE`],
    [/^(\d+) BERISIKO$/, (m) => `${m[1]} AT RISK`],
    [/^(\d+) PESERTA$/, (m) => `${m[1]} PARTICIPANTS`],
    [/^([+-]\d+) PESERTA$/, (m) => `${m[1]} PARTICIPANTS`],
    [/^RISIKO (\d+)$/, (m) => `RISK ${m[1]}`],
    [/^RISIKO EKSTREM (\d+)$/, (m) => `EXTREME RISK ${m[1]}`],
    [/^RISIKO RENDAH (\d+)$/, (m) => `LOW RISK ${m[1]}`],
    [/^PRIORITAS (.+)$/, (m) => `PRIORITY ${phrase(m[1])}`],
    [/^TENGGAT (.+)$/, (m) => `DUE ${m[1]}`],
    [/^PJ: (.+)$/, (m) => `Owner: ${m[1]}`],
    [/^(\d+) hari$/, (m) => `${m[1]} days`],
    [/^lewat (\d+) hari$/, (m) => `${m[1]} days overdue`],
    [/^(\d+) jam lalu$/, (m) => `${m[1]} hours ago`],
    [/^(\d+) hari lalu$/, (m) => `${m[1]} day${m[1] === '1' ? '' : 's'} ago`],
    [/^menunggu (\d+) jam$/, (m) => `waiting ${m[1]} hours`],
    [/^Kemarin (\d\d:\d\d)$/, (m) => `Yesterday ${m[1]}`],
    [/^(\d\d:\d\d) hari ini$/, (m) => `${m[1]} today`],
    [/^umur (\d+) hari$/, (m) => `age ${m[1]} days`],
    [/^(\d+)\/(\d+) butir$/, (m) => `${m[1]}/${m[2]} items`],
    [/^target (.+)$/, (m) => `target ${m[1]}`],
    [/^tenggat (.+)$/, (m) => `due ${m[1]}`],
    [/^risiko (\d+) → (\d+)$/, (m) => `risk ${m[1]} → ${m[2]}`],
    [/^(\d+) terbuka bulan ini$/, (m) => `${m[1]} open this month`],
    [/^(\d+) izin aktif hari ini$/, (m) => `${m[1]} permits active today`],
    [/^(\d+) parameter dipantau$/, (m) => `${m[1]} parameters monitored`],
    [/^MODUL (\d+)$/, (m) => `MODULE ${m[1]}`],
    [/^Langkah (\d+) — (.+)$/, (m) => `Step ${m[1]} — ${m[2]}`],
    [/^Selamat datang, (.+)\.$/, (m) => `Welcome, ${m[1]}.`],
    [/^(\d+) hari tanpa LTI$/, (m) => `${m[1]} days without an LTI`],
    [/^(\d+) hari kerja hilang$/, (m) => `${m[1]} lost work days`],
    [/^(\d{1,2}) (Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Ags|Sep|Okt|Nov|Des) (\d{4})$/,
      (m) => `${m[1]} ${{ Mei: 'May', Agu: 'Aug', Ags: 'Aug', Okt: 'Oct', Des: 'Dec' }[m[2]] || m[2]} ${m[3]}`],
    [/^(\d{1,2})–(\d{1,2}) (Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Ags|Sep|Okt|Nov|Des) (\d{4})$/,
      (m) => `${m[1]}–${m[2]} ${{ Mei: 'May', Agu: 'Aug', Ags: 'Aug', Okt: 'Oct', Des: 'Dec' }[m[3]] || m[3]} ${m[4]}`],
    [/^Jatuh tempo (.+) · terlambat (\d+) hari · (.+)$/,
      (m) => `Due ${m[1]} · ${m[2]} days late · ${m[3]}`],
    /* ── Modul 22–25 ── */
    [/^(\d+) langkah kerja seluruhnya$/, (m) => `${m[1]} work steps in all`],
    [/^(\d+) langkah$/, (m) => `${m[1]} steps`],
    [/^(\d+) aktivitas$/, (m) => `${m[1]} activities`],
    [/^(\d+) aktivitas dinilai$/, (m) => `${m[1]} activities assessed`],
    [/^Sumber bahaya (.+)$/, (m) => `Hazard source — ${phrase(m[1])}`],
    [/^(\d+) pekerjaan$/, (m) => `${m[1]} jobs`],
    [/^(\d+) peraturan$/, (m) => `${m[1]} regulations`],
    [/^(\d+) bidang$/, (m) => `${m[1]} fields`],
    [/^(\d+)% dari seluruh peraturan$/, (m) => `${m[1]}% of all regulations`],
    [/^(\d+) pengamatan · kepatuhan per jenis APD$/, (m) => `${m[1]} observations · compliance by PPE type`],
    [/^(\d+) diamati$/, (m) => `${m[1]} observed`],
    [/^Lima catatan terakhir dari (\d+) bulan ini$/, (m) => `The last five of ${m[1]} this month`],
    [/^dari (\d+) izin bulan ini$/, (m) => `of ${m[1]} permits this month`],
    [/^(WP-[\d-]+) · (\d+) langkah · risiko tertinggi (\d+) → (\d+)$/,
      (m) => `${m[1]} · ${m[2]} steps · highest risk ${m[3]} → ${m[4]}`],
    [/^(\d+) topik · (\d+) menit$/, (m) => `${m[1]} topics · ${m[2]} min`],
    [/^(\d+) menit$/, (m) => `${m[1]} min`],
    /* Daftar jenis peserta induksi: "3 Pekerja Baru, 3 Kontraktor, 1 Tamu". */
    [/^\d+ (?:Pekerja Baru|Kontraktor|Tamu)(?:, \d+ (?:Pekerja Baru|Kontraktor|Tamu))*$/,
      (m) => m[0].split(', ').map(function (x) {
        const b = x.match(/^(\d+) (.+)$/);
        return b ? b[1] + ' ' + phrase(b[2]) : x;
      }).join(', ')]
  ];

  let lang = 'id';

  function phrase(s) {
    if (lang === 'id') return s;
    const k = String(s).trim();
    if (EN[k] !== undefined) return EN[k];
    for (const [re, fn] of RULES) {
      const m = k.match(re);
      if (m) return fn(m);
    }
    return s;
  }

  /* Menerjemahkan simpul teks yang cocok PENUH dengan kamus, ditambah beberapa atribut.
     Kecocokan sebagian sengaja tidak dilakukan supaya tidak pernah memotong kalimat. */
  function tr(html) {
    if (lang === 'id') return html;
    let out = String(html).replace(/>([^<>]+)</g, function (whole, txt) {
      const k = txt.trim();
      if (!k) return whole;
      const v = phrase(k);
      return v === k ? whole : whole.replace(txt, txt.replace(k, v));
    });
    out = out.replace(/(placeholder|aria-label|title|alt)="([^"]+)"/g, function (whole, attr, val) {
      const v = phrase(val);
      return v === val ? whole : attr + '="' + v + '"';
    });
    return out;
  }

  return {
    get lang() { return lang; },
    setLang: function (l) { lang = (l === 'en') ? 'en' : 'id'; },
    t: phrase,
    tr: tr
  };
})();
