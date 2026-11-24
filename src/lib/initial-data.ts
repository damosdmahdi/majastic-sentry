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
    name: process.env.PROJECT_NAME || 'Majastic Core App (Laravel Inertia)',
    slug: 'majastic-core',
    description: 'Platform utama internal Majastic berbasis Laravel 11, Inertia.js, dan Vue 3',
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
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    projectId: 'proj-1',
    title: 'Sprint 1 - Inisialisasi & Fitur Utama',
    sdlcType: 'AGILE_SPRINT',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
];

export const INITIAL_USE_CASES: UseCase[] = [];

export const INITIAL_TASKS: Task[] = [];

