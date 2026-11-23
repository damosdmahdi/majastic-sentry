-- ========================================================
-- MAJASTIC SENTRY - SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Salin dan jalankan seluruh isi file ini di menu "SQL Editor" pada Supabase Dashboard kamu.
-- ========================================================

-- 1. Buat Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('MENTOR', 'FULLSTACK', 'UI_FE', 'BUSINESS')),
    avatar TEXT DEFAULT '👤',
    tag TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel Projects
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    github_repo TEXT NOT NULL,
    protected_files JSONB DEFAULT '["docker-compose.yml", ".env.example", "package.json", "tsconfig.json", "vite.config.ts"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat Tabel Milestones / Sprints
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sdlc_type TEXT NOT NULL CHECK (sdlc_type IN ('AGILE_SPRINT', 'WATERFALL_PHASE')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buat Tabel Use Cases
CREATE TABLE IF NOT EXISTS use_cases (
    id TEXT PRIMARY KEY,
    milestone_id TEXT REFERENCES milestones(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    business_goal TEXT NOT NULL,
    figma_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Buat Tabel Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    use_case_id TEXT REFERENCES use_cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ENDPOINT', 'UI_SLICING', 'GENERAL')),
    endpoint_spec JSONB,
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE')),
    blocker_note TEXT,
    github_pr_url TEXT,
    pr_number INTEGER,
    integrity_check JSONB,
    is_archived BOOLEAN DEFAULT FALSE,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- DATA SEED AWAL (Tim Majastic)
-- ========================================================

INSERT INTO users (id, name, email, role, avatar, tag)
VALUES
    ('user-mentor', 'Damos (You)', 'damos@majastic.internal', 'MENTOR', '👨‍🏫', 'Lead & PM'),
    ('user-junior-1', 'Ari Pratama', 'ari@majastic.internal', 'FULLSTACK', '👨‍💻', 'Junior Fullstack'),
    ('user-smk-1', 'Budi Santoso', 'budi@majastic.internal', 'FULLSTACK', '🎒', 'SMK Intern'),
    ('user-ui-1', 'Clara Putri', 'clara@majastic.internal', 'UI_FE', '🎨', 'UI/FE Dev'),
    ('user-biz-1', 'Hendra Wijaya', 'hendra@majastic.internal', 'BUSINESS', '📊', 'Product / Business')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, name, slug, description, github_repo, protected_files)
VALUES (
    'proj-1',
    'Majastic Core App',
    'majastic-core',
    'Platform utama internal Majastic untuk manajemen tugas & koordinasi tim',
    'majastic/core-app',
    '["docker-compose.yml", "docker-compose.prod.yml", ".env.example", "package.json", "tsconfig.json", "vite.config.ts", ".github/workflows/deploy.yml"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO milestones (id, project_id, title, sdlc_type, start_date, end_date, status)
VALUES (
    'ms-1',
    'proj-1',
    'Sprint 1 - Autentikasi & Onboarding',
    'AGILE_SPRINT',
    NOW() - INTERVAL '6 days',
    NOW() + INTERVAL '1 day',
    'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO use_cases (id, milestone_id, code, title, business_goal, figma_url)
VALUES
    ('uc-1', 'ms-1', 'UC-01', 'Autentikasi & Registrasi Akun Siswa', 'Memastikan siswa SMK dan anggota tim dapat mendaftar mandiri menggunakan email resmi dan login dengan sesi aman.', 'https://www.figma.com/file/sample/Majastic-Auth-Design'),
    ('uc-2', 'ms-1', 'UC-02', 'Dashboard Profil & Ringkasan Status', 'Memberikan tampilan ringkas bagi pengguna untuk melihat progres tugas aktif mereka dalam satu layar.', 'https://www.figma.com/file/sample/Majastic-Dashboard')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, use_case_id, title, type, endpoint_spec, assignee_id, status, blocker_note, github_pr_url, pr_number, integrity_check)
VALUES
    ('task-1', 'uc-1', 'Endpoint Registrasi Akun & Validasi Password', 'ENDPOINT', '{"method": "POST", "route": "/api/v1/auth/register"}'::jsonb, 'user-junior-1', 'DONE', NULL, 'https://github.com/majastic/core-app/pull/14', 14, '{"status": "PASSED", "violatedFiles": [], "checkedAt": "2026-11-21T00:00:00Z", "message": "✅ Semua file aman. Tidak ada perubahan pada file konfigurasi arsitektur."}'::jsonb),
    ('task-2', 'uc-1', 'Endpoint Login JWT & Token Refresh', 'ENDPOINT', '{"method": "POST", "route": "/api/v1/auth/login"}'::jsonb, 'user-smk-1', 'REVIEW', NULL, 'https://github.com/majastic/core-app/pull/18', 18, '{"status": "WARNING", "violatedFiles": ["docker-compose.yml"], "checkedAt": "2026-11-23T12:00:00Z", "message": "⚠️ AI-Diff Alert: File dilindungi \"docker-compose.yml\" terdeteksi dimodifikasi pada PR ini. Harap cek kembali sebelum merge!"}'::jsonb),
    ('task-3', 'uc-1', 'Slicing & Integrasi Halaman Login + Form Validasi', 'UI_SLICING', NULL, 'user-ui-1', 'DONE', NULL, 'https://github.com/majastic/core-app/pull/15', 15, '{"status": "PASSED", "violatedFiles": [], "checkedAt": "2026-11-22T00:00:00Z", "message": "✅ Validasi struktur komponen UI lolos standar."}'::jsonb),
    ('task-4', 'uc-2', 'Endpoint Profil Pengguna & Avatar Upload', 'ENDPOINT', '{"method": "GET", "route": "/api/v1/users/me"}'::jsonb, 'user-junior-1', 'IN_PROGRESS', NULL, NULL, NULL, NULL),
    ('task-5', 'uc-2', 'Slicing Kartu Profil & Layout Responsif', 'UI_SLICING', NULL, 'user-ui-1', 'BLOCKED', 'Menunggu konfirmasi palet warna dark-mode dan icon pack resmi dari Figma tim UI pusat.', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
