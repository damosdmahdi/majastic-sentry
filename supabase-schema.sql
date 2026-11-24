-- ========================================================
-- MAJASTIC SENTRY - SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Proyek: Majastic E-PKL (Laravel 11 + Inertia.js + Vue 3)
-- Salin dan jalankan seluruh isi file ini di menu "SQL Editor" pada Supabase Dashboard kamu.
-- ========================================================

-- 1. Buat Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT DEFAULT 'majastic123',
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
    protected_files JSONB DEFAULT '["app/Http/Middleware/HandleInertiaRequests.php", "vite.config.js", "vite.config.ts", "composer.json", "package.json", "docker-compose.yml", "compose.yaml", ".env.example", "bootstrap/app.php"]'::jsonb,
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
-- DATA SEED AWAL: USERS (Tim Majastic TEFA)
-- ========================================================
INSERT INTO users (id, name, email, password, role, avatar, tag)
VALUES
    ('user-mentor', 'Damos (You)', 'damos@majastic.internal', 'Adrigodri123', 'MENTOR', '👨‍🏫', 'Lead & PM'),
    ('user-junior-1', 'Ari Pratama', 'ari@majastic.internal', 'majastic123', 'FULLSTACK', '👨‍💻', 'Junior Fullstack (Laravel)'),
    ('user-smk-1', 'Budi Santoso', 'budi@majastic.internal', 'majastic123', 'FULLSTACK', '🎒', 'SMK Intern (Laravel/Inertia)'),
    ('user-ui-1', 'Clara Putri', 'clara@majastic.internal', 'majastic123', 'UI_FE', '🎨', 'UI/FE Dev (Vue & Tailwind)'),
    ('user-biz-1', 'Hendra Wijaya', 'hendra@majastic.internal', 'majastic123', 'BUSINESS', '📊', 'Product / Business')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    tag = EXCLUDED.tag;

-- ========================================================
-- DATA SEED AWAL: PROJECT
-- ========================================================
INSERT INTO projects (id, name, slug, description, github_repo, protected_files)
VALUES (
    'proj-1',
    'Majastic E-PKL (Laravel 11 + Inertia.js + Vue 3)',
    'majastic-e-pkl',
    'Sistem Informasi Manajemen Praktik Kerja Lapangan (PKL) SMK berbasis Laravel 11, Inertia.js, dan Vue 3',
    'damosdmahdi/majastic-sentry',
    '["app/Http/Middleware/HandleInertiaRequests.php", "vite.config.js", "vite.config.ts", "composer.json", "package.json", "docker-compose.yml", "compose.yaml", ".env.example", "bootstrap/app.php"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    protected_files = EXCLUDED.protected_files;

-- ========================================================
-- DATA SEED AWAL: MILESTONES (Sprints)
-- ========================================================
INSERT INTO milestones (id, project_id, title, sdlc_type, start_date, end_date, status)
VALUES
    ('ms-sprint-2', 'proj-1', 'Sprint 2 - Portal Siswa, Presensi & Jurnal Harian', 'AGILE_SPRINT', NOW(), NOW() + INTERVAL '14 days', 'ACTIVE'),
    ('ms-sprint-1', 'proj-1', 'Sprint 1 - Pra-PKL & Administrasi Berkas (Selesai)', 'AGILE_SPRINT', NOW() - INTERVAL '14 days', NOW(), 'COMPLETED')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;

-- ========================================================
-- DATA SEED: USE CASES (Dari Obsidian Vault Zona 4)
-- ========================================================
INSERT INTO use_cases (id, milestone_id, code, title, business_goal)
VALUES
    -- Modul 02: Portal & Profil Siswa
    ('uc-dsh-01', 'ms-sprint-2', 'UC-DSH-01', 'Dashboard Ringkasan PKL Siswa', 'Menampilkan ringkasan status penempatan magang, nama mitra industri, nama mentor DUDI, dan status presensi hari ini via Inertia props dinamis (menggantikan dummy static Lebron/Steph)'),
    ('uc-prf-01', 'ms-sprint-2', 'UC-PRF-01', 'Pembaruan Profil & Biodata Siswa', 'Siswa dapat memperbarui data kontak (telepon, alamat) via PATCH /profile, dengan NIS, Kelas, dan Jurusan terkunci read-only'),
    ('uc-prf-02', 'ms-sprint-2', 'UC-PRF-02', 'Pengisian & Pemantauan Profil Perusahaan Tempat PKL', 'Migrasi total penyimpanan profil perusahaan dari localStorage browser ke tabel database melalui request Inertia'),

    -- Modul 03: Presensi & Kehadiran
    ('uc-abs-01', 'ms-sprint-2', 'UC-ABS-01', 'Presensi Masuk (Check-In) Geofencing & Foto WebP', 'Presensi datang siswa dengan validasi radius geofencing Haversine <= 100m dari kantor mitra, selfie kamera WebP, dan perekaman jam server Laravel now(). Status Telat Masuk otomatis jika melewati jam kerja'),
    ('uc-abs-02', 'ms-sprint-2', 'UC-ABS-02', 'Presensi Pulang (Check-Out) & Foto Selesai Kerja', 'Presensi kepulangan kerja siswa dengan foto bukti situasi selesai kerja via kamera WebP dan merekam jam_pulang = now() di server'),
    ('uc-abs-03', 'ms-sprint-2', 'UC-ABS-03', 'Pengajuan Izin dan Sakit Siswa', 'Pengajuan permohonan izin/sakit terpadu (tanggal mulai s/d selesai, unggah surat dokter/izin ke S3). Kolom jam_datang dan jam_pulang wajib null, status_approval = pending'),
    ('uc-abs-04', 'ms-sprint-2', 'UC-ABS-04', 'Rekapitulasi Riwayat Presensi Siswa', 'Tabel logbook presensi bulanan dengan badge warna status dinamis dari database (hapus 15 baris dummy array statis di Vue)'),
    ('uc-abs-05', 'ms-sprint-2', 'UC-ABS-05', 'Verifikasi & Approval Izin/Sakit oleh Guru Pembimbing', 'Guru pembimbing sekolah memeriksa berkas bukti surat dan memberikan keputusan approval (approved = sah izin/sakit, rejected = otomatis Alpa)'),

    -- Modul 04: Jurnal Kegiatan Harian
    ('uc-jrn-01', 'ms-sprint-2', 'UC-JRN-01', 'Input Jurnal Harian (Anti-Backdate & date.now)', 'Pencatatan kegiatan harian dengan tanggal otomatis terkunci dari server now(). Aturan sakral anti-backdating: siswa lupa mengisi hari kemarin = baris kosong di cetak laporan (sanksi kedisiplinan). Unique 1 entri per hari'),
    ('uc-jrn-02', 'ms-sprint-2', 'UC-JRN-02', 'Koreksi Uraian Jurnal (Watermark & No Delete)', 'Perbaikan uraian kegiatan jurnal dengan proteksi: tanggal & paraf terkunci, tombol delete ditiadakan total, dan sistem menyematkan audit badge permanen Telah Diedit (is_edited = true)'),
    ('uc-jrn-03', 'ms-sprint-2', 'UC-JRN-03', 'Verifikasi & Paraf Digital Harian oleh Pembimbing DUDI', 'Pembimbing perusahaan mitra memvalidasi logbook kegiatan harian siswa magang dan membubuhkan tanda tangan/paraf digital canvas'),
    ('uc-jrn-04', 'ms-sprint-2', 'UC-JRN-04', 'Monitoring Logbook Jurnal oleh Guru Pembimbing', 'Guru pembimbing sekolah memantau keteraturan pengisian jurnal siswa bimbingan per minggu, watermark Telah Diedit, dan kelengkapan paraf DUDI'),

    -- Modul 05: Bimbingan Laporan
    ('uc-bmb-01', 'ms-sprint-2', 'UC-BMB-01', 'Pencatatan Konsultasi Bimbingan Laporan oleh Siswa', 'Siswa mendokumentasikan resume arahan bimbingan laporan PKL dan paraf canvas digital pembimbing (migrasi total dari localStorage ke useForm Inertia)'),
    ('uc-bmb-02', 'ms-sprint-2', 'UC-BMB-02', 'Telaah & Catatan Arahan Bimbingan Guru Pembimbing', 'Guru menelaah riwayat konsultasi laporan siswa bimbingan dan memberikan catatan arahan perbaikan resmi dari pihak sekolah'),

    -- Modul 08: Informasi Jadwal
    ('uc-jdw-01', 'ms-sprint-2', 'UC-JDW-01', 'Pemantauan Agenda Jadwal Kegiatan PKL', 'Siswa melihat tabel linimasa agenda seluruh tahapan PKL (sosialisasi, pengantaran, monitoring, sidang) secara dinamis dari database (hapus data statis)'),
    ('uc-jdw-02', 'ms-sprint-2', 'UC-JDW-02', 'Pemantauan Jadwal Pembekalan PKL', 'Siswa memantau susunan sesi materi pembekalan, narasumber, ruangan, dan kartu ringkasan secara reaktif dari props Inertia')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    business_goal = EXCLUDED.business_goal;

-- ========================================================
-- DATA SEED: ATOMIC TASKS (Sprint 2 Action Items)
-- ========================================================
INSERT INTO tasks (id, use_case_id, title, type, endpoint_spec, assignee_id, status)
VALUES
    ('task-dsh-01-ui', 'uc-dsh-01', 'Slicing Dashboard.vue: Ganti dummy data Lebron/Steph dengan props auth & penempatan', 'UI_SLICING', NULL, 'user-ui-1', 'IN_PROGRESS'),
    ('task-dsh-01-be', 'uc-dsh-01', 'Endpoint GET /dashboard: Siapkan relasi PKL aktif & status presensi hari ini', 'ENDPOINT', '{"method": "GET", "route": "/dashboard"}'::jsonb, 'user-junior-1', 'IN_PROGRESS'),
    ('task-prf-01-be', 'uc-prf-01', 'Endpoint PATCH /profile: Kunci NIS/Kelas read-only & validasi format kontak', 'ENDPOINT', '{"method": "PATCH", "route": "/profile"}'::jsonb, 'user-junior-1', 'TODO'),
    ('task-abs-01-ui', 'uc-abs-01', 'Refactor AttendanceModal.vue: Integrasi kamera WebP & navigasi GPS navigator', 'UI_SLICING', NULL, 'user-ui-1', 'TODO'),
    ('task-abs-01-be', 'uc-abs-01', 'Endpoint POST /kehadiran/check-in: Haversine distance <=100m, foto WebP & server now()', 'ENDPOINT', '{"method": "POST", "route": "/kehadiran/check-in"}'::jsonb, 'user-smk-1', 'TODO'),
    ('task-abs-02-be', 'uc-abs-02', 'Endpoint POST /kehadiran/check-out: Rekam jam_pulang = now() & foto bukti selesai kerja', 'ENDPOINT', '{"method": "POST", "route": "/kehadiran/check-out"}'::jsonb, 'user-smk-1', 'TODO'),
    ('task-abs-03-be', 'uc-abs-03', 'Endpoint POST /kehadiran/pengajuan-izin: Form Izin/Sakit terpadu & upload surat ke S3', 'ENDPOINT', '{"method": "POST", "route": "/kehadiran/pengajuan-izin"}'::jsonb, 'user-junior-1', 'TODO'),
    ('task-jrn-01-ui', 'uc-jrn-01', 'Refactor Student/Jurnal/Index.vue: Kunci input tanggal (date.now) & hapus tombol delete', 'UI_SLICING', NULL, 'user-ui-1', 'TODO'),
    ('task-jrn-01-be', 'uc-jrn-01', 'Endpoint POST /jurnal: Kunci tanggal server now(), anti-backdating & unique tanggal per siswa', 'ENDPOINT', '{"method": "POST", "route": "/jurnal"}'::jsonb, 'user-smk-1', 'TODO'),
    ('task-jrn-02-be', 'uc-jrn-02', 'Endpoint PUT /jurnal/{id}: Proteksi tanggal/paraf & set is_edited = true (Watermark)', 'ENDPOINT', '{"method": "PUT", "route": "/jurnal/{id}"}'::jsonb, 'user-junior-1', 'TODO'),
    ('task-bmb-01-ui', 'uc-bmb-01', 'Migrasi Student/Bimbingan/Index.vue & Create.vue dari localStorage ke useForm Inertia', 'UI_SLICING', NULL, 'user-ui-1', 'TODO'),
    ('task-bmb-01-be', 'uc-bmb-01', 'Endpoint POST /bimbingan: Simpan catatan konsultasi & canvas tanda tangan digital', 'ENDPOINT', '{"method": "POST", "route": "/bimbingan"}'::jsonb, 'user-smk-1', 'TODO')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;
