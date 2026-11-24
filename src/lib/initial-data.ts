import { Project, User, Milestone, UseCase, Task } from '@/types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-mentor',
    name: 'Damos (You)',
    email: 'damos@majastic.internal',
    password: process.env.MENTOR_PASSWORD || 'Adrigodri123',
    role: 'MENTOR',
    avatar: '👨‍🏫',
    tag: 'Lead & PM',
  },
  {
    id: 'user-junior-1',
    name: 'Ari Pratama',
    email: 'ari@majastic.internal',
    password: process.env.TEAM_PASSWORD || 'majastic123',
    role: 'FULLSTACK',
    avatar: '👨‍💻',
    tag: 'Junior Fullstack (Laravel)',
  },
  {
    id: 'user-smk-1',
    name: 'Budi Santoso',
    email: 'budi@majastic.internal',
    password: process.env.TEAM_PASSWORD || 'majastic123',
    role: 'FULLSTACK',
    avatar: '🎒',
    tag: 'SMK Intern (Laravel/Inertia)',
  },
  {
    id: 'user-ui-1',
    name: 'Clara Putri',
    email: 'clara@majastic.internal',
    password: process.env.TEAM_PASSWORD || 'majastic123',
    role: 'UI_FE',
    avatar: '🎨',
    tag: 'UI/FE Dev (Vue & Tailwind)',
  },
  {
    id: 'user-biz-1',
    name: 'Hendra Wijaya',
    email: 'hendra@majastic.internal',
    password: process.env.TEAM_PASSWORD || 'majastic123',
    role: 'BUSINESS',
    avatar: '📊',
    tag: 'Product / Business',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: process.env.PROJECT_NAME || 'Majastic E-PKL (Laravel 11 + Inertia.js + Vue 3)',
    slug: 'majastic-e-pkl',
    description: 'Sistem Informasi Manajemen Praktik Kerja Lapangan (PKL) SMK berbasis Laravel 11, Inertia.js, dan Vue 3',
    githubRepo: process.env.GITHUB_REPO || 'TefaMajastic/epkl-core',
    // Guardrail disesuaikan khusus untuk arsitektur Laravel Inertia Vue
    protectedFiles: [
      'app/Http/Middleware/HandleInertiaRequests.php',
      'vite.config.js',
      'vite.config.ts',
      'composer.json',
      'package.json',
      'docker-compose.yml',
      'compose.yaml',
      '.env.example',
      'bootstrap/app.php'
    ],
    createdAt: '2026-11-20T00:00:00.000Z',
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-sprint-2',
    projectId: 'proj-1',
    title: 'Sprint 2 - Portal Siswa, Presensi & Jurnal Harian',
    sdlcType: 'AGILE_SPRINT',
    startDate: '2026-11-24T00:00:00.000Z',
    endDate: '2026-12-08T00:00:00.000Z',
    status: 'ACTIVE',
  },
  {
    id: 'ms-sprint-1',
    projectId: 'proj-1',
    title: 'Sprint 1 - Pra-PKL & Administrasi Berkas (Selesai)',
    sdlcType: 'AGILE_SPRINT',
    startDate: '2026-11-10T00:00:00.000Z',
    endDate: '2026-11-23T00:00:00.000Z',
    status: 'COMPLETED',
  },
  {
    id: 'ms-sprint-3',
    projectId: 'proj-1',
    title: 'Sprint 3 - Monitoring Visit, Penilaian & Sertifikat',
    sdlcType: 'AGILE_SPRINT',
    startDate: '2026-12-09T00:00:00.000Z',
    endDate: '2026-12-23T00:00:00.000Z',
    status: 'ACTIVE',
  },
];

export const INITIAL_USE_CASES: UseCase[] = [
  // ==========================================
  // MODUL 01: PRA-PKL (SELESAI)
  // ==========================================
  {
    id: 'uc-pra-01',
    milestoneId: 'ms-sprint-1',
    code: 'UC-PRA-01',
    title: 'Unggah Berkas Pendaftaran Awal (Fase 1)',
    businessGoal: 'Siswa mengunggah 2 berkas wajib: Surat Ketarunaan dan Nilai Rapor via Dropzone (PDF/JPG/PNG max 2MB) ke Cloud Storage S3',
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    id: 'uc-pra-02',
    milestoneId: 'ms-sprint-1',
    code: 'UC-PRA-02',
    title: 'Review Berkas Awal Siswa oleh Kaprodi / Guru (Fase 2)',
    businessGoal: 'Guru/Kaprodi menelaah berkas siswa pada antrean. Approved memajukan step_aktif=3, Rejected mengembalikan ke step 1 dengan catatan revisi',
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    id: 'uc-pra-03',
    milestoneId: 'ms-sprint-1',
    code: 'UC-PRA-03',
    title: 'Pemilihan Perusahaan Mitra & Cetak Surat Pengantar (Fase 3)',
    businessGoal: 'Siswa memilih 1 mitra industri dari katalog DUDI aktif berdasarkan sisa kuota, dan mencetak surat pengantar resmi fisik',
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    id: 'uc-pra-04',
    milestoneId: 'ms-sprint-1',
    code: 'UC-PRA-04',
    title: 'Unggah Berkas Lanjutan Pasca-Review DUDI (Fase 4)',
    businessGoal: 'Siswa mengunggah 2 berkas penentu: Surat Balasan Diterima PT (ACC PT) dan Surat Izin Orang Tua/Wali ke storage S3',
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    id: 'uc-pra-05',
    milestoneId: 'ms-sprint-1',
    code: 'UC-PRA-05',
    title: 'Review Berkas Lanjutan & Pengesahan Kesiapan PKL',
    businessGoal: 'Kaprodi memverifikasi keabsahan surat balasan industri dan surat izin orang tua untuk mengesahkan kelayakan siswa berangkat PKL',
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    id: 'uc-pra-06',
    milestoneId: 'ms-sprint-1',
    code: 'UC-PRA-06',
    title: 'Pembentukan Entitas PKL Aktif (Siap PKL)',
    businessGoal: 'Sistem secara otomatis mengunci step_aktif=5, menghubungkan relasi siswa-perusahaan-mentor DUDI, dan membuka akses modul PKL aktif',
    createdAt: '2026-11-10T08:00:00.000Z',
  },

  // ==========================================
  // MODUL 02: PORTAL & PROFIL SISWA
  // ==========================================
  {
    id: 'uc-dsh-01',
    milestoneId: 'ms-sprint-2',
    code: 'UC-DSH-01',
    title: 'Dashboard Ringkasan PKL Siswa',
    businessGoal: 'Menampilkan ringkasan status penempatan magang, nama mitra industri, nama mentor DUDI, dan status presensi hari ini via Inertia props dinamis (menggantikan dummy static Lebron/Steph)',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-prf-01',
    milestoneId: 'ms-sprint-2',
    code: 'UC-PRF-01',
    title: 'Pembaruan Profil & Biodata Siswa',
    businessGoal: 'Siswa dapat memperbarui data kontak (telepon, alamat) via PATCH /profile, dengan NIS, Kelas, dan Jurusan terkunci read-only',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-prf-02',
    milestoneId: 'ms-sprint-2',
    code: 'UC-PRF-02',
    title: 'Pengisian & Pemantauan Profil Perusahaan Tempat PKL',
    businessGoal: 'Migrasi total penyimpanan profil perusahaan dari localStorage browser ke tabel database melalui request Inertia',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // ==========================================
  // MODUL 03: PRESENSI & KEHADIRAN
  // ==========================================
  {
    id: 'uc-abs-01',
    milestoneId: 'ms-sprint-2',
    code: 'UC-ABS-01',
    title: 'Presensi Masuk (Check-In) Geofencing & Foto WebP',
    businessGoal: 'Presensi datang siswa dengan validasi radius geofencing Haversine <= 100m dari kantor mitra, selfie kamera WebP, dan perekaman jam server Laravel now(). Status Telat Masuk otomatis jika melewati jam kerja',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-abs-02',
    milestoneId: 'ms-sprint-2',
    code: 'UC-ABS-02',
    title: 'Presensi Pulang (Check-Out) & Foto Selesai Kerja',
    businessGoal: 'Presensi kepulangan kerja siswa dengan foto bukti situasi selesai kerja via kamera WebP dan merekam jam_pulang = now() di server',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-abs-03',
    milestoneId: 'ms-sprint-2',
    code: 'UC-ABS-03',
    title: 'Pengajuan Izin dan Sakit Siswa',
    businessGoal: 'Pengajuan permohonan izin/sakit terpadu (tanggal mulai s/d selesai, unggah surat dokter/izin ke S3). Kolom jam_datang dan jam_pulang wajib null, status_approval = pending',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-abs-04',
    milestoneId: 'ms-sprint-2',
    code: 'UC-ABS-04',
    title: 'Rekapitulasi Riwayat Presensi Siswa',
    businessGoal: 'Tabel logbook presensi bulanan dengan badge warna status dinamis dari database (hapus 15 baris dummy array statis di Vue)',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-abs-05',
    milestoneId: 'ms-sprint-2',
    code: 'UC-ABS-05',
    title: 'Verifikasi & Approval Izin/Sakit oleh Guru Pembimbing',
    businessGoal: 'Guru pembimbing sekolah memeriksa berkas bukti surat dan memberikan keputusan approval (approved = sah izin/sakit, rejected = otomatis Alpa)',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // ==========================================
  // MODUL 04: JURNAL KEGIATAN HARIAN
  // ==========================================
  {
    id: 'uc-jrn-01',
    milestoneId: 'ms-sprint-2',
    code: 'UC-JRN-01',
    title: 'Input Jurnal Harian (Anti-Backdate & date.now)',
    businessGoal: 'Pencatatan kegiatan harian dengan tanggal otomatis terkunci dari server now(). Aturan sakral anti-backdating: siswa lupa mengisi hari kemarin = baris kosong di cetak laporan (sanksi kedisiplinan). Unique 1 entri per hari',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-jrn-02',
    milestoneId: 'ms-sprint-2',
    code: 'UC-JRN-02',
    title: 'Koreksi Uraian Jurnal (Watermark & No Delete)',
    businessGoal: 'Perbaikan uraian kegiatan jurnal dengan proteksi: tanggal & paraf terkunci, tombol delete ditiadakan total, dan sistem menyematkan audit badge permanen Telah Diedit (is_edited = true)',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-jrn-03',
    milestoneId: 'ms-sprint-2',
    code: 'UC-JRN-03',
    title: 'Verifikasi & Paraf Digital Harian oleh Pembimbing DUDI',
    businessGoal: 'Pembimbing perusahaan mitra memvalidasi logbook kegiatan harian siswa magang dan membubuhkan tanda tangan/paraf digital canvas',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-jrn-04',
    milestoneId: 'ms-sprint-2',
    code: 'UC-JRN-04',
    title: 'Monitoring Logbook Jurnal oleh Guru Pembimbing',
    businessGoal: 'Guru pembimbing sekolah memantau keteraturan pengisian jurnal siswa bimbingan per minggu, watermark Telah Diedit, dan kelengkapan paraf DUDI',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-jrn-05',
    milestoneId: 'ms-sprint-2',
    code: 'UC-JRN-05',
    title: 'Cetak Dokumen Rekapitulasi Jurnal (Print View / Export PDF)',
    businessGoal: 'Mencetak dokumen rekapitulasi buku jurnal resmi sekolah untuk lampiran laporan fisik, hari tanpa entri tercetak baris kosong sesuai sanksi kedisiplinan',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // ==========================================
  // MODUL 05: BIMBINGAN LAPORAN
  // ==========================================
  {
    id: 'uc-bmb-01',
    milestoneId: 'ms-sprint-2',
    code: 'UC-BMB-01',
    title: 'Pencatatan Konsultasi Bimbingan Laporan oleh Siswa',
    businessGoal: 'Siswa mendokumentasikan resume arahan bimbingan laporan PKL dan paraf canvas digital pembimbing (migrasi total dari localStorage ke useForm Inertia)',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-bmb-02',
    milestoneId: 'ms-sprint-2',
    code: 'UC-BMB-02',
    title: 'Telaah & Catatan Arahan Bimbingan Guru Pembimbing',
    businessGoal: 'Guru menelaah riwayat konsultasi laporan siswa bimbingan dan memberikan catatan arahan perbaikan resmi dari pihak sekolah',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // ==========================================
  // MODUL 06: MONITORING VISIT GURU
  // ==========================================
  {
    id: 'uc-vst-01',
    milestoneId: 'ms-sprint-3',
    code: 'UC-VST-01',
    title: 'Input Laporan Kunjungan Fisik (Visit Offline) oleh Guru',
    businessGoal: 'Guru mendokumentasikan evaluasi monitoring tatap muka di industri dengan tanggal server now() terkunci, tanda tangan digital guru, tanpa fitur hapus',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-vst-02',
    milestoneId: 'ms-sprint-3',
    code: 'UC-VST-02',
    title: 'Pemantauan Riwayat Catatan Kunjungan Guru oleh DUDI (Read-Only)',
    businessGoal: 'Pembimbing industri memantau hasil catatan evaluasi dan saran kunjungan guru sekolah secara transparan dan read-only di portal DUDI',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // ==========================================
  // MODUL 07: PENILAIAN & KELULUSAN AKHIR
  // ==========================================
  {
    id: 'uc-nil-01',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-01',
    title: 'Sinkronisasi Capaian Pembelajaran (CP) Teknis',
    businessGoal: 'Menyelaraskan indikator capaian kurikulum kejuruan dengan pekerjaan aktual industri sebagai acuan butir penilaian keterampilan',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-nil-02',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-02',
    title: 'Input Nilai Sikap / Soft Skills oleh Pembimbing DUDI',
    businessGoal: 'Pembimbing DUDI memberikan skor evaluasi aspek sikap (kejujuran, disiplin, kerja sama) skala 0-100 dan catatan kepribadian siswa',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-nil-03',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-03',
    title: 'Input Nilai Keterampilan Teknis di Industri',
    businessGoal: 'Pembimbing DUDI & guru menilai kompetensi kejuruan siswa berdasarkan butir capaian pembelajaran yang telah disinkronisasi',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-nil-04',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-04',
    title: 'Unggah Dokumen Naskah Laporan PKL oleh Siswa',
    businessGoal: 'Siswa mengunggah berkas PDF draf naskah laporan PKL lengkap (max 10MB) ke S3 untuk ditelaah guru, tombol cetak terkunci',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-nil-05',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-05',
    title: 'Telaah & Persetujuan Naskah Laporan oleh Guru (Unlock Cetak)',
    businessGoal: 'Guru menelaah naskah laporan. Status approved membuka akses unduh & cetak resmi bagi siswa serta membuka form input nilai guru',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-nil-06',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-06',
    title: 'Input Nilai Naskah Laporan PKL oleh Guru',
    businessGoal: 'Guru menginput nilai naskah laporan bersyarat approved, sistem mengkalkulasi akumulasi nilai akhir total otomatis dengan bobot kurikulum',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-nil-07',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-07',
    title: 'Yudisium & Pengesahan Kelulusan Akhir oleh Kaprodi',
    businessGoal: 'Kaprodi mengevaluasi nilai akhir siswa terhadap KKM, menetapkan status remedial jika tidak tuntas, atau mengesahkan kelulusan resmi',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-nil-08',
    milestoneId: 'ms-sprint-3',
    code: 'UC-NIL-08',
    title: 'Penerbitan Sertifikat PKL Otomatis (QR Code)',
    businessGoal: 'Sistem otomatis mengenerate dokumen Sertifikat PKL resmi ber-QR Code verifikasi unik setelah pengesahan kelulusan oleh Kaprodi',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // ==========================================
  // MODUL 08: INFORMASI JADWAL
  // ==========================================
  {
    id: 'uc-jdw-01',
    milestoneId: 'ms-sprint-2',
    code: 'UC-JDW-01',
    title: 'Pemantauan Agenda Jadwal Kegiatan PKL',
    businessGoal: 'Siswa melihat tabel linimasa agenda seluruh tahapan PKL (sosialisasi, pengantaran, monitoring, sidang) secara dinamis dari database (hapus data statis)',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'uc-jdw-02',
    milestoneId: 'ms-sprint-2',
    code: 'UC-JDW-02',
    title: 'Pemantauan Jadwal Pembekalan PKL',
    businessGoal: 'Siswa memantau susunan sesi materi pembekalan, narasumber, ruangan, dan kartu ringkasan secara reaktif dari props Inertia',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
];

// Papan Tugas dikosongkan total agar pengguna dapat mengisinya sendiri dari antarmuka
export const INITIAL_TASKS: Task[] = [];
