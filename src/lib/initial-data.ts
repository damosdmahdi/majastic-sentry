import { Project, User, Milestone, UseCase, Task } from '@/types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-mentor',
    name: 'Damos (You)',
    email: 'damos@majastic.internal',
    role: 'MENTOR',
    avatar: '👨‍🏫',
    tag: 'Lead & PM',
  },
  {
    id: 'user-junior-1',
    name: 'Ari Pratama',
    email: 'ari@majastic.internal',
    role: 'FULLSTACK',
    avatar: '👨‍💻',
    tag: 'Junior Fullstack',
  },
  {
    id: 'user-smk-1',
    name: 'Budi Santoso',
    email: 'budi@majastic.internal',
    role: 'FULLSTACK',
    avatar: '🎒',
    tag: 'SMK Intern',
  },
  {
    id: 'user-ui-1',
    name: 'Clara Putri',
    email: 'clara@majastic.internal',
    role: 'UI_FE',
    avatar: '🎨',
    tag: 'UI/FE Dev',
  },
  {
    id: 'user-biz-1',
    name: 'Hendra Wijaya',
    email: 'hendra@majastic.internal',
    role: 'BUSINESS',
    avatar: '📊',
    tag: 'Product / Business',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Majastic Core App',
    slug: 'majastic-core',
    description: 'Platform utama internal Majastic untuk manajemen tugas & koordinasi tim',
    githubRepo: 'majastic/core-app',
    protectedFiles: [
      'docker-compose.yml',
      'docker-compose.prod.yml',
      '.env.example',
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      '.github/workflows/deploy.yml'
    ],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    projectId: 'proj-1',
    title: 'Sprint 1 - Autentikasi & Onboarding',
    sdlcType: 'AGILE_SPRINT',
    startDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
];

export const INITIAL_USE_CASES: UseCase[] = [
  {
    id: 'uc-1',
    milestoneId: 'ms-1',
    code: 'UC-01',
    title: 'Autentikasi & Registrasi Akun Siswa',
    businessGoal: 'Memastikan siswa SMK dan anggota tim dapat mendaftar mandiri menggunakan email resmi dan login dengan sesi aman.',
    figmaUrl: 'https://www.figma.com/file/sample/Majastic-Auth-Design',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'uc-2',
    milestoneId: 'ms-1',
    code: 'UC-02',
    title: 'Dashboard Profil & Ringkasan Status',
    businessGoal: 'Memberikan tampilan ringkas bagi pengguna untuk melihat progres tugas aktif mereka dalam satu layar.',
    figmaUrl: 'https://www.figma.com/file/sample/Majastic-Dashboard',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    useCaseId: 'uc-1',
    title: 'Endpoint Registrasi Akun & Validasi Password',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'POST',
      route: '/api/v1/auth/register',
    },
    assigneeId: 'user-junior-1',
    status: 'DONE',
    githubPrUrl: 'https://github.com/majastic/core-app/pull/14',
    prNumber: 14,
    integrityCheck: {
      status: 'PASSED',
      violatedFiles: [],
      checkedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      message: '✅ Semua file aman. Tidak ada perubahan pada file konfigurasi arsitektur.',
    },
    lastUpdatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'task-2',
    useCaseId: 'uc-1',
    title: 'Endpoint Login JWT & Token Refresh',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'POST',
      route: '/api/v1/auth/login',
    },
    assigneeId: 'user-smk-1',
    status: 'REVIEW',
    githubPrUrl: 'https://github.com/majastic/core-app/pull/18',
    prNumber: 18,
    integrityCheck: {
      status: 'WARNING',
      violatedFiles: ['docker-compose.yml'],
      checkedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      message: '⚠️ AI-Diff Alert: File dilindungi "docker-compose.yml" terdeteksi dimodifikasi pada PR ini. Harap cek kembali sebelum merge!',
    },
    lastUpdatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'task-3',
    useCaseId: 'uc-1',
    title: 'Slicing & Integrasi Halaman Login + Form Validasi',
    type: 'UI_SLICING',
    assigneeId: 'user-ui-1',
    status: 'DONE',
    githubPrUrl: 'https://github.com/majastic/core-app/pull/15',
    prNumber: 15,
    integrityCheck: {
      status: 'PASSED',
      violatedFiles: [],
      checkedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      message: '✅ Validasi struktur komponen UI lolos standar.',
    },
    lastUpdatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'task-4',
    useCaseId: 'uc-2',
    title: 'Endpoint Profil Pengguna & Avatar Upload',
    type: 'ENDPOINT',
    endpointSpec: {
      method: 'GET',
      route: '/api/v1/users/me',
    },
    assigneeId: 'user-junior-1',
    status: 'IN_PROGRESS',
    lastUpdatedAt: new Date(Date.now() - 3 * 86400000).toISOString(), // > 48h to test Stale Task Alert!
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'task-5',
    useCaseId: 'uc-2',
    title: 'Slicing Kartu Profil & Layout Responsif',
    type: 'UI_SLICING',
    assigneeId: 'user-ui-1',
    status: 'BLOCKED',
    blockerNote: 'Menunggu konfirmasi palet warna dark-mode dan icon pack resmi dari Figma tim UI pusat.',
    lastUpdatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];
