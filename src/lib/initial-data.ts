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
    githubRepo: process.env.GITHUB_REPO || 'damosdmahdi/majastic-sentry',
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
];

export const INITIAL_USE_CASES: UseCase[] = [
  // --- Modul 02: Portal & Profil Siswa ---
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

  // --- Modul 03: Presensi & Kehadiran ---
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

  // --- Modul 04: Jurnal Kegiatan Harian ---
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

  // --- Modul 05: Bimbingan Laporan ---
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

  // --- Modul 08: Informasi Jadwal ---
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

export const INITIAL_TASKS: Task[] = [
  // --- Task Aktif Dashboard ---
  {
    id: 'task-dsh-01-ui',
    useCaseId: 'uc-dsh-01',
    title: 'Slicing Dashboard.vue: Ganti dummy data Lebron/Steph dengan props auth & penempatan',
    type: 'UI_SLICING',
    assigneeId: 'user-ui-1',
    status: 'IN_PROGRESS',
    lastUpdatedAt: '2026-11-24T08:15:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'task-dsh-01-be',
    useCaseId: 'uc-dsh-01',
    title: 'Endpoint GET /dashboard: Siapkan relasi PKL aktif & status presensi hari ini',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'GET',
      route: '/dashboard',
    },
    assigneeId: 'user-junior-1',
    status: 'IN_PROGRESS',
    lastUpdatedAt: '2026-11-24T08:20:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // --- Task Profil Siswa ---
  {
    id: 'task-prf-01-be',
    useCaseId: 'uc-prf-01',
    title: 'Endpoint PATCH /profile: Kunci NIS/Kelas read-only & validasi format kontak',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'PATCH',
      route: '/profile',
    },
    assigneeId: 'user-junior-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // --- Task Presensi Check-In ---
  {
    id: 'task-abs-01-ui',
    useCaseId: 'uc-abs-01',
    title: 'Refactor AttendanceModal.vue: Integrasi kamera WebP & navigasi GPS navigator',
    type: 'UI_SLICING',
    assigneeId: 'user-ui-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'task-abs-01-be',
    useCaseId: 'uc-abs-01',
    title: 'Endpoint POST /kehadiran/check-in: Haversine distance <=100m, foto WebP & server now()',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'POST',
      route: '/kehadiran/check-in',
    },
    assigneeId: 'user-smk-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // --- Task Presensi Check-Out ---
  {
    id: 'task-abs-02-be',
    useCaseId: 'uc-abs-02',
    title: 'Endpoint POST /kehadiran/check-out: Rekam jam_pulang = now() & foto bukti selesai kerja',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'POST',
      route: '/kehadiran/check-out',
    },
    assigneeId: 'user-smk-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // --- Task Pengajuan Izin/Sakit ---
  {
    id: 'task-abs-03-be',
    useCaseId: 'uc-abs-03',
    title: 'Endpoint POST /kehadiran/pengajuan-izin: Form Izin/Sakit terpadu & upload surat ke S3',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'POST',
      route: '/kehadiran/pengajuan-izin',
    },
    assigneeId: 'user-junior-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // --- Task Jurnal Harian ---
  {
    id: 'task-jrn-01-ui',
    useCaseId: 'uc-jrn-01',
    title: 'Refactor Student/Jurnal/Index.vue: Kunci input tanggal (date.now) & hapus tombol delete',
    type: 'UI_SLICING',
    assigneeId: 'user-ui-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'task-jrn-01-be',
    useCaseId: 'uc-jrn-01',
    title: 'Endpoint POST /jurnal: Kunci tanggal server now(), anti-backdating & unique tanggal per siswa',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'POST',
      route: '/jurnal',
    },
    assigneeId: 'user-smk-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'task-jrn-02-be',
    useCaseId: 'uc-jrn-02',
    title: 'Endpoint PUT /jurnal/{id}: Proteksi tanggal/paraf & set is_edited = true (Watermark)',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'PUT',
      route: '/jurnal/{id}',
    },
    assigneeId: 'user-junior-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },

  // --- Task Bimbingan Laporan ---
  {
    id: 'task-bmb-01-ui',
    useCaseId: 'uc-bmb-01',
    title: 'Migrasi Student/Bimbingan/Index.vue & Create.vue dari localStorage ke useForm Inertia',
    type: 'UI_SLICING',
    assigneeId: 'user-ui-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'task-bmb-01-be',
    useCaseId: 'uc-bmb-01',
    title: 'Endpoint POST /bimbingan: Simpan catatan konsultasi & canvas tanda tangan digital',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'POST',
      route: '/bimbingan',
    },
    assigneeId: 'user-smk-1',
    status: 'TODO',
    lastUpdatedAt: '2026-11-24T08:00:00.000Z',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
];

