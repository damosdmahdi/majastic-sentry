-- ========================================================
-- MAJASTIC SENTRY - SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Proyek: Majastic E-PKL (Laravel 11 + Inertia.js + Vue 3)
-- Repositori: TefaMajastic/epkl-core
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

-- Nonaktifkan RLS agar Vercel dapat membaca & menulis data dengan lancar
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE use_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Pastikan role service_role memiliki hak akses penuh pada schema public (tanpa membuka anon ke publik)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- Pastikan use_case_id bersifat opsional (nullable) agar tugas umum / non-use-case dapat dibuat
ALTER TABLE tasks ALTER COLUMN use_case_id DROP NOT NULL;

-- ========================================================
-- DATA SEED: USERS (Tim Majastic TEFA)
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
-- DATA SEED: PROJECT
-- ========================================================
INSERT INTO projects (id, name, slug, description, github_repo, protected_files)
VALUES (
    'proj-1',
    'Majastic E-PKL (Laravel 11 + Inertia.js + Vue 3)',
    'majastic-e-pkl',
    'Sistem Informasi Manajemen Praktik Kerja Lapangan (PKL) SMK berbasis Laravel 11, Inertia.js, dan Vue 3',
    'TefaMajastic/epkl-core',
    '["app/Http/Middleware/HandleInertiaRequests.php", "vite.config.js", "vite.config.ts", "composer.json", "package.json", "docker-compose.yml", "compose.yaml", ".env.example", "bootstrap/app.php"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    github_repo = EXCLUDED.github_repo,
    protected_files = EXCLUDED.protected_files;

-- ========================================================
-- DATA SEED: MILESTONES (Sprints)
-- ========================================================
INSERT INTO milestones (id, project_id, title, sdlc_type, start_date, end_date, status)
VALUES
    ('ms-sprint-2', 'proj-1', 'Sprint 2 - Portal Siswa, Presensi & Jurnal Harian', 'AGILE_SPRINT', NOW(), NOW() + INTERVAL '14 days', 'ACTIVE'),
    ('ms-sprint-1', 'proj-1', 'Sprint 1 - Pra-PKL & Administrasi Berkas (Selesai)', 'AGILE_SPRINT', NOW() - INTERVAL '14 days', NOW(), 'COMPLETED'),
    ('ms-sprint-3', 'proj-1', 'Sprint 3 - Monitoring Visit, Penilaian & Sertifikat', 'AGILE_SPRINT', NOW() + INTERVAL '15 days', NOW() + INTERVAL '30 days', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;

-- ========================================================
-- DATA SEED: MASTER USE CASES (33 Use Cases Lengkap dari Obsidian Vault)
-- ========================================================
INSERT INTO use_cases (id, milestone_id, code, title, business_goal)
VALUES
    -- MODUL 01: PRA-PKL (SELESAI)
    ('uc-pra-01', 'ms-sprint-1', 'UC-PRA-01', 'Unggah Berkas Pendaftaran Awal (Fase 1)', 'Siswa mengunggah 2 berkas wajib: Surat Ketarunaan dan Nilai Rapor via Dropzone (PDF/JPG/PNG max 2MB) ke Cloud Storage S3'),
    ('uc-pra-02', 'ms-sprint-1', 'UC-PRA-02', 'Review Berkas Awal Siswa oleh Kaprodi / Guru (Fase 2)', 'Guru/Kaprodi menelaah berkas siswa pada antrean. Approved memajukan step_aktif=3, Rejected mengembalikan ke step 1 dengan catatan revisi'),
    ('uc-pra-03', 'ms-sprint-1', 'UC-PRA-03', 'Pemilihan Perusahaan Mitra & Cetak Surat Pengantar (Fase 3)', 'Siswa memilih 1 mitra industri dari katalog DUDI aktif berdasarkan sisa kuota, dan mencetak surat pengantar resmi fisik'),
    ('uc-pra-04', 'ms-sprint-1', 'UC-PRA-04', 'Unggah Berkas Lanjutan Pasca-Review DUDI (Fase 4)', 'Siswa mengunggah 2 berkas penentu: Surat Balasan Diterima PT (ACC PT) dan Surat Izin Orang Tua/Wali ke storage S3'),
    ('uc-pra-05', 'ms-sprint-1', 'UC-PRA-05', 'Review Berkas Lanjutan & Pengesahan Kesiapan PKL', 'Kaprodi memverifikasi keabsahan surat balasan industri dan surat izin orang tua untuk mengesahkan kelayakan siswa berangkat PKL'),
    ('uc-pra-06', 'ms-sprint-1', 'UC-PRA-06', 'Pembentukan Entitas PKL Aktif (Siap PKL)', 'Sistem secara otomatis mengunci step_aktif=5, menghubungkan relasi siswa-perusahaan-mentor DUDI, dan membuka akses modul PKL aktif'),

    -- MODUL 02: PORTAL & PROFIL SISWA
    ('uc-dsh-01', 'ms-sprint-2', 'UC-DSH-01', 'Dashboard Ringkasan PKL Siswa', 'Menampilkan ringkasan status penempatan magang, nama mitra industri, nama mentor DUDI, dan status presensi hari ini via Inertia props dinamis'),
    ('uc-prf-01', 'ms-sprint-2', 'UC-PRF-01', 'Pembaruan Profil & Biodata Siswa', 'Siswa dapat memperbarui data kontak (telepon, alamat) via PATCH /profile, dengan NIS, Kelas, dan Jurusan terkunci read-only'),
    ('uc-prf-02', 'ms-sprint-2', 'UC-PRF-02', 'Pengisian & Pemantauan Profil Perusahaan Tempat PKL', 'Migrasi total penyimpanan profil perusahaan dari localStorage browser ke tabel database melalui request Inertia'),

    -- MODUL 03: PRESENSI & KEHADIRAN
    ('uc-abs-01', 'ms-sprint-2', 'UC-ABS-01', 'Presensi Masuk (Check-In) Geofencing & Foto WebP', 'Presensi datang siswa dengan validasi radius geofencing Haversine <= 100m dari kantor mitra, selfie kamera WebP, dan perekaman jam server Laravel now(). Status Telat Masuk otomatis jika melewati jam kerja'),
    ('uc-abs-02', 'ms-sprint-2', 'UC-ABS-02', 'Presensi Pulang (Check-Out) & Foto Selesai Kerja', 'Presensi kepulangan kerja siswa dengan foto bukti situasi selesai kerja via kamera WebP dan merekam jam_pulang = now() di server'),
    ('uc-abs-03', 'ms-sprint-2', 'UC-ABS-03', 'Pengajuan Izin dan Sakit Siswa', 'Pengajuan permohonan izin/sakit terpadu (tanggal mulai s/d selesai, unggah surat dokter/izin ke S3). Kolom jam_datang dan jam_pulang wajib null, status_approval = pending'),
    ('uc-abs-04', 'ms-sprint-2', 'UC-ABS-04', 'Rekapitulasi Riwayat Presensi Siswa', 'Tabel logbook presensi bulanan dengan badge warna status dinamis dari database (hapus 15 baris dummy array statis di Vue)'),
    ('uc-abs-05', 'ms-sprint-2', 'UC-ABS-05', 'Verifikasi & Approval Izin/Sakit oleh Guru Pembimbing', 'Guru pembimbing sekolah memeriksa berkas bukti surat dan memberikan keputusan approval (approved = sah izin/sakit, rejected = otomatis Alpa)'),

    -- MODUL 04: JURNAL KEGIATAN HARIAN
    ('uc-jrn-01', 'ms-sprint-2', 'UC-JRN-01', 'Input Jurnal Harian (Anti-Backdate & date.now)', 'Pencatatan kegiatan harian dengan tanggal otomatis terkunci dari server now(). Aturan sakral anti-backdating: siswa lupa mengisi hari kemarin = baris kosong di cetak laporan (sanksi kedisiplinan). Unique 1 entri per hari'),
    ('uc-jrn-02', 'ms-sprint-2', 'UC-JRN-02', 'Koreksi Uraian Jurnal (Watermark & No Delete)', 'Perbaikan uraian kegiatan jurnal dengan proteksi: tanggal & paraf terkunci, tombol delete ditiadakan total, dan sistem menyematkan audit badge permanen Telah Diedit (is_edited = true)'),
    ('uc-jrn-03', 'ms-sprint-2', 'UC-JRN-03', 'Verifikasi & Paraf Digital Harian oleh Pembimbing DUDI', 'Pembimbing perusahaan mitra memvalidasi logbook kegiatan harian siswa magang dan membubuhkan tanda tangan/paraf digital canvas'),
    ('uc-jrn-04', 'ms-sprint-2', 'UC-JRN-04', 'Monitoring Logbook Jurnal oleh Guru Pembimbing', 'Guru pembimbing sekolah memantau keteraturan pengisian jurnal siswa bimbingan per minggu, watermark Telah Diedit, dan kelengkapan paraf DUDI'),
    ('uc-jrn-05', 'ms-sprint-2', 'UC-JRN-05', 'Cetak Dokumen Rekapitulasi Jurnal (Print View / Export PDF)', 'Mencetak dokumen rekapitulasi buku jurnal resmi sekolah untuk lampiran laporan fisik, hari tanpa entri tercetak baris kosong sesuai sanksi kedisiplinan'),

    -- MODUL 05: BIMBINGAN LAPORAN
    ('uc-bmb-01', 'ms-sprint-2', 'UC-BMB-01', 'Pencatatan Konsultasi Bimbingan Laporan oleh Siswa', 'Siswa mendokumentasikan resume arahan bimbingan laporan PKL dan paraf canvas digital pembimbing (migrasi total dari localStorage ke useForm Inertia)'),
    ('uc-bmb-02', 'ms-sprint-2', 'UC-BMB-02', 'Telaah & Catatan Arahan Bimbingan Guru Pembimbing', 'Guru menelaah riwayat konsultasi laporan siswa bimbingan dan memberikan catatan arahan perbaikan resmi dari pihak sekolah'),

    -- MODUL 06: MONITORING VISIT GURU
    ('uc-vst-01', 'ms-sprint-3', 'UC-VST-01', 'Input Laporan Kunjungan Fisik (Visit Offline) oleh Guru', 'Guru mendokumentasikan evaluasi monitoring tatap muka di industri dengan tanggal server now() terkunci, tanda tangan digital guru, tanpa fitur hapus'),
    ('uc-vst-02', 'ms-sprint-3', 'UC-VST-02', 'Pemantauan Riwayat Catatan Kunjungan Guru oleh DUDI (Read-Only)', 'Pembimbing industri memantau hasil catatan evaluasi dan saran kunjungan guru sekolah secara transparan dan read-only di portal DUDI'),

    -- MODUL 07: PENILAIAN & KELULUSAN AKHIR
    ('uc-nil-01', 'ms-sprint-3', 'UC-NIL-01', 'Sinkronisasi Capaian Pembelajaran (CP) Teknis', 'Menyelaraskan indikator capaian kurikulum kejuruan dengan pekerjaan aktual industri sebagai acuan butir penilaian keterampilan'),
    ('uc-nil-02', 'ms-sprint-3', 'UC-NIL-02', 'Input Nilai Sikap / Soft Skills oleh Pembimbing DUDI', 'Pembimbing DUDI memberikan skor evaluasi aspek sikap (kejujuran, disiplin, kerja sama) skala 0-100 dan catatan kepribadian siswa'),
    ('uc-nil-03', 'ms-sprint-3', 'UC-NIL-03', 'Input Nilai Keterampilan Teknis di Industri', 'Pembimbing DUDI & guru menilai kompetensi kejuruan siswa berdasarkan butir capaian pembelajaran yang telah disinkronisasi'),
    ('uc-nil-04', 'ms-sprint-3', 'UC-NIL-04', 'Unggah Dokumen Naskah Laporan PKL oleh Siswa', 'Siswa mengunggah berkas PDF draf naskah laporan PKL lengkap (max 10MB) ke S3 untuk ditelaah guru, tombol cetak terkunci'),
    ('uc-nil-05', 'ms-sprint-3', 'UC-NIL-05', 'Telaah & Persetujuan Naskah Laporan oleh Guru (Unlock Cetak)', 'Guru menelaah naskah laporan. Status approved membuka akses unduh & cetak resmi bagi siswa serta membuka form input nilai guru'),
    ('uc-nil-06', 'ms-sprint-3', 'UC-NIL-06', 'Input Nilai Naskah Laporan PKL oleh Guru', 'Guru menginput nilai naskah laporan bersyarat approved, sistem mengkalkulasi akumulasi nilai akhir total otomatis dengan bobot kurikulum'),
    ('uc-nil-07', 'ms-sprint-3', 'UC-NIL-07', 'Yudisium & Pengesahan Kelulusan Akhir oleh Kaprodi', 'Kaprodi mengevaluasi nilai akhir siswa terhadap KKM, menetapkan status remedial jika tidak tuntas, atau mengesahkan kelulusan resmi'),
    ('uc-nil-08', 'ms-sprint-3', 'UC-NIL-08', 'Penerbitan Sertifikat PKL Otomatis (QR Code)', 'Sistem otomatis mengenerate dokumen Sertifikat PKL resmi ber-QR Code verifikasi unik setelah pengesahan kelulusan oleh Kaprodi'),

    -- MODUL 08: INFORMASI JADWAL
    ('uc-jdw-01', 'ms-sprint-2', 'UC-JDW-01', 'Pemantauan Agenda Jadwal Kegiatan PKL', 'Siswa melihat tabel linimasa agenda seluruh tahapan PKL (sosialisasi, pengantaran, monitoring, sidang) secara dinamis dari database (hapus data statis)'),
    ('uc-jdw-02', 'ms-sprint-2', 'UC-JDW-02', 'Pemantauan Jadwal Pembekalan PKL', 'Siswa memantau susunan sesi materi pembekalan, narasumber, ruangan, dan kartu ringkasan secara reaktif dari props Inertia')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    business_goal = EXCLUDED.business_goal;

-- ========================================================
-- KOSONGKAN PAPAN TUGAS (Agar Anda dapat mengisinya sendiri)
-- ========================================================
DELETE FROM tasks;
