# 🛡️ Majastic Sentry

**Platform Pengendali Tugas, Guardrail Arsitektur & Pipeline Knowledge Base untuk Tim Developer Majastic & Siswa SMK.**

Dirancang khusus untuk alur kerja **Mentor/Lead Fullstack & Project Manager** yang mengelola 2 Fullstack Junior (termasuk siswa magang SMK) dan 1 UI/Frontend Developer, dengan jembatan data langsung ke **Obsidian**.

---

## 🚀 Fitur Utama

1. **Model Tugas: Use-Case & Endpoint-Driven**
   - Fleksibel untuk **Scrum/Agile Sprint** maupun **Waterfall Phase**.
   - Setiap Use Case menghubungkan 3 pilar:
     - 🎯 **Target Bisnis** (kenapa fitur ini dibuat, agar developer paham konteksnya).
     - 🎨 **Link Frame Figma UI** (panduan desain untuk UI/Frontend).
     - 🛠️ **Kontrak Endpoint API & Slicing** (spesifikasi method `POST /api/...` untuk Fullstack).

2. **AI-Diff Alert & Guardrail Integritas (GitHub Integration)**
   - Mendeteksi secara otomatis jika ada Pull Request (PR) yang tidak sengaja memodifikasi file arsitektur terproteksi (seperti `docker-compose.yml`, `.env`, `package.json`, `tsconfig.json`) akibat halusinasi atau auto-accept AI oleh anak SMK.
   - Siap membaca repositori private di GitHub Organization Majastic menggunakan `GITHUB_PAT`.

3. **Pendeteksi Tugas Menggantung (Stale Task Detector > 48 Jam)**
   - Memberi peringatan visual jika ada tugas berstatus `IN_PROGRESS` yang tidak ada pembaruan lebih dari 48 jam untuk mendeteksi *silent blocker* (anak SMK yang malu/takut bertanya).

4. **Jembatan Otomatis ke Obsidian (Second Brain)**
   - Tombol sekali klik: **"Tarik ke Obsidian (.md)"**.
   - Menghasilkan file Markdown terstruktur mingguan lengkap dengan:
     - YAML Frontmatter (`type: weekly-sprint-review`, tags, week number).
     - Rekap progres per Use Case & Endpoint.
     - Laporan kendala (*blockers*) dan peringatan guardrail.
     - **Prompt AI Siap Pakai** untuk meminta asisten AI (seperti Antigravity) di Obsidian menganalisis evaluasi tim dan menyusun rencana materi mentoring minggu depan.

5. **Role-Based Simulation Switcher**
   - Di bagian header, kamu bisa berpindah pandangan peran secara instan (Mentor, Ari - Junior Fullstack, Budi - SMK Intern, Clara - UI/FE, Hendra - Business) untuk mengecek UX dan hak akses masing-masing.

---

## 🛠️ Panduan Menjalankan di Lokal

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Setup Environment Variables (Opsional)
Salin `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Isi `GITHUB_PAT` dengan GitHub Personal Access Token jika ingin integrasi live ke repo private Majastic. Jika dikosongkan, sistem otomatis berjalan dalam mode simulasi cerdas.

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Panduan Deploy ke Vercel (Gratis & Cepat)

1. Push repository ini ke GitHub Organisasi Majastic.
2. Buka [Vercel](https://vercel.com) dan klik **"Add New Project"**.
3. Import repository ini.
4. (Opsional) Masukkan Environment Variable di dashboard Vercel:
   - `GITHUB_PAT`: `ghp_xxxxxxxxxxxx`
5. Klik **Deploy**. Selesai! Web app siap digunakan seluruh tim tanpa biaya langganan bulanan.

---

## 🧠 Alur Kerja Mingguan dengan Obsidian

1. Setiap akhir minggu (Jumat sore / akhir sprint), buka web app Majastic Sentry.
2. Klik tombol ungu **"Tarik ke Obsidian (.md)"**.
3. Klik **"Download File .md"**.
4. Pindahkan file tersebut ke vault Obsidian kamu (misalnya ke folder `03_Weekly-Reviews/`).
5. Buka file tersebut di Obsidian, lalu gunakan prompt yang sudah tertera di bagian bawah catatan bersama asisten AI untuk menghasilkan rencana mentoring minggu berikutnya.
