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
  };

  /* Pola yang memuat angka: ditangani dengan aturan, bukan entri kamus. */
  const RULES = [
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
      (m) => `Due ${m[1]} · ${m[2]} days late · ${m[3]}`]
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
