import { Project, Milestone, UseCase, Task, User } from '@/types';

export interface GenerateMarkdownParams {
  project: Project;
  milestone: Milestone;
  useCases: UseCase[];
  tasks: Task[];
  users: User[];
  weekLabel?: string;
}

export function generateObsidianWeeklyMarkdown(params: GenerateMarkdownParams): string {
  const { project, milestone, useCases, tasks, users, weekLabel } = params;

  const now = new Date();
  const currentWeek = weekLabel || getWeekNumberString(now);
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const reviewTasks = tasks.filter((t) => t.status === 'REVIEW');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const staleTasks = tasks.filter((t) => {
    if (t.status !== 'IN_PROGRESS') return false;
    const diffHours = (now.getTime() - new Date(t.lastUpdatedAt).getTime()) / (1000 * 3600);
    return diffHours >= 48;
  });
  const guardrailAlerts = tasks.filter(
    (t) => t.integrityCheck?.status === 'WARNING' || t.integrityCheck?.status === 'FAILED'
  );

  let md = `---
type: weekly-sprint-review
project: "${project.name}"
github_repo: "${project.githubRepo}"
milestone: "${milestone.title}"
sdlc_model: "${milestone.sdlcType}"
week: "${currentWeek}"
generated_at: "${now.toISOString().slice(0, 10)}"
tags:
  - mentoring
  - majastic
  - weekly-review
  - sprint-review
---

# 📊 Laporan Mingguan & Evaluasi Mentoring (${currentWeek})
**Proyek:** [[${project.name}]] | **Repositori:** \`${project.githubRepo}\`  
**Milestone:** ${milestone.title} (${milestone.sdlcType === 'AGILE_SPRINT' ? 'Scrum Sprint' : 'Waterfall Phase'})  
**Tanggal Ekspor:** ${now.toLocaleDateString('id-ID', { dateStyle: 'full' })}

---

## 📈 Ringkasan Metrik
| Kategori | Jumlah | Keterangan |
| :--- | :--- | :--- |
| **Total Tugas** | ${totalTasks} | Tersebar di ${useCases.length} Use Case |
| **Selesai (Done)** | ${doneTasks.length} (${Math.round((doneTasks.length / (totalTasks || 1)) * 100)}%) | Siap release / merge |
| **Menunggu Review Mentor** | ${reviewTasks.length} | Butuh review kode |
| **Dalam Pengerjaan** | ${inProgressTasks.length} | Sedang dikerjakan tim |
| **Terkendala (Blocked)** | ${blockedTasks.length} | Memerlukan intervensi mentor |
| **Stale Tasks (>48 jam)** | ${staleTasks.length} | Potensi silent blocker pada junior |
| **Peringatan AI-Diff/Guardrail** | ${guardrailAlerts.length} | Perubahan tidak sengaja pada file config |

---

## 🎯 Detail per Use Case & Endpoint

`;

  useCases.forEach((uc) => {
    const ucTasks = tasks.filter((t) => t.useCaseId === uc.id);
    const ucDoneCount = ucTasks.filter((t) => t.status === 'DONE').length;
    const isUcComplete = ucTasks.length > 0 && ucDoneCount === ucTasks.length;

    md += `### ${isUcComplete ? '✅' : '📌'} [[${uc.code}]]: ${uc.title}
* **Tujuan Bisnis:** ${uc.businessGoal}
${uc.figmaUrl ? `* **Desain Figma:** [Buka Desain di Figma](${uc.figmaUrl})\n` : ''}
* **Progres Tugas (${ucDoneCount}/${ucTasks.length} selesai):**

`;

    ucTasks.forEach((task) => {
      const assignee = userMap.get(task.assigneeId);
      const assigneeName = assignee ? `[[${assignee.name}]] (${assignee.tag || assignee.role})` : 'Unassigned';
      const isChecked = task.status === 'DONE' ? 'x' : ' ';
      
      let badge = '';
      if (task.type === 'ENDPOINT' && task.endpointSpec) {
        badge = `\`${task.endpointSpec.method} ${task.endpointSpec.route}\``;
      } else if (task.type === 'UI_SLICING') {
        badge = `🎨 UI Slicing`;
      } else {
        badge = `📋 Tugas Umum`;
      }

      md += `- [${isChecked}] **${task.title}** (${badge})
  - **Assignee:** ${assigneeName}
  - **Status:** \`${task.status}\` | **Update Terakhir:** ${new Date(task.lastUpdatedAt).toLocaleDateString('id-ID')}
`;

      if (task.githubPrUrl) {
        md += `  - **Pull Request:** [PR #${task.prNumber || 'Link'}](${task.githubPrUrl})\n`;
      }

      if (task.blockerNote) {
        md += `  - 🚨 **Kendala/Blocker:** ${task.blockerNote}\n`;
      }

      if (task.integrityCheck?.status === 'WARNING') {
        md += `  - ⚠️ **Peringatan Guardrail:** ${task.integrityCheck.message}\n`;
      }
    });

    md += '\n';
  });

  md += `---

## 🚨 Catatan Kritis Mentor

### 1. Daftar Kendala (Blockers) Aktif
`;

  if (blockedTasks.length === 0) {
    md += `*Tidak ada tugas yang ter-block minggu ini.* 🎉\n\n`;
  } else {
    blockedTasks.forEach((t) => {
      const assignee = userMap.get(t.assigneeId);
      md += `* **${t.title}** (PIC: [[${assignee?.name || 'Dev'}]])\n  - *Masalah:* ${t.blockerNote || 'Tidak ada catatan detail'}\n`;
    });
    md += '\n';
  }

  md += `### 2. Tugas Menggantung / Potensi Silent Blocker (>48 jam tanpa aktivitas)
`;

  if (staleTasks.length === 0) {
    md += `*Semua tugas bergerak aktif dalam 48 jam terakhir.* ✅\n\n`;
  } else {
    staleTasks.forEach((t) => {
      const assignee = userMap.get(t.assigneeId);
      const hours = Math.round((now.getTime() - new Date(t.lastUpdatedAt).getTime()) / (1000 * 3600));
      md += `* ⚠️ **${t.title}** (PIC: [[${assignee?.name || 'Dev'}]]) - Terhenti selama ${hours} jam. Disarankan 1-on-1 check-in.\n`;
    });
    md += '\n';
  }

  md += `### 3. Peringatan File Arsitektur (AI Overwrite Guardrail)
`;

  if (guardrailAlerts.length === 0) {
    md += `*Semua commit/PR patuh pada daftar protected files.* ✅\n\n`;
  } else {
    guardrailAlerts.forEach((t) => {
      md += `* ⚠️ **PR #${t.prNumber || ''} (${t.title}):** ${t.integrityCheck?.message}\n  - File terdampak: \`${t.integrityCheck?.violatedFiles.join(', ')}\`\n`;
    });
    md += '\n';
  }

  md += `---

## 🤖 Prompt untuk AI Assistant di Obsidian

> [!TIP] Jalankan prompt di bawah ini bersama AI di Obsidian untuk menganalisis data minggu ini:
\`\`\`markdown
Bertindaklah sebagai Senior Engineering Mentor & Project Advisor.
Analisis data rekap sprint mingguan di atas (${currentWeek}):
1. Berikan evaluasi objektif untuk masing-masing developer (Junior Fullstack, Anak SMK, dan UI/FE).
2. Temukan akar masalah dari blocker dan tugas yang menggantung (stale tasks).
3. Buatkan rencana bimbingan teknis (coaching topics) 1-on-1 untuk anak SMK dan junior agar mereka tidak mengulangi kesalahan AI diff pada file arsitektur.
4. Susun prioritas backlog dan target sprint untuk minggu berikutnya.
\`\`\`
`;

  return md;
}

function getWeekNumberString(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
