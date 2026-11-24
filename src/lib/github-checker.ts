import { IntegrityCheckResult } from '@/types';

export interface CheckPrParams {
  repo: string; // e.g. "TefaMajastic/epkl-core"
  prNumber: number;
  protectedFiles: string[];
}

export async function inspectPullRequest(params: CheckPrParams): Promise<IntegrityCheckResult> {
  const { repo, prNumber, protectedFiles } = params;
  const token = process.env.GITHUB_PAT;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Majastic-Sentry-Guardrail',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`, {
      headers,
      // Timeout 8 seconds to prevent serverless function hanging
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          status: 'FAILED',
          violatedFiles: [],
          checkedAt: new Date().toISOString(),
          message: `PR #${prNumber} tidak ditemukan di repositori "${repo}". Jika ini repositori private, pastikan environment variable GITHUB_PAT (dengan izin scope 'repo') telah dipasang di Vercel.`,
        };
      }
      if (response.status === 401 || response.status === 403) {
        return {
          status: 'FAILED',
          violatedFiles: [],
          checkedAt: new Date().toISOString(),
          message: 'Akses GitHub ditolak (HTTP 401/403). Pastikan GITHUB_PAT valid dan memiliki hak akses ke repositori organisasi/private ini.',
        };
      }
      return {
        status: 'FAILED',
        violatedFiles: [],
        checkedAt: new Date().toISOString(),
        message: `Gagal memanggil GitHub API (Status: ${response.status} ${response.statusText}).`,
      };
    }

    const files: Array<{ filename: string; status: string; additions: number; deletions: number }> = await response.json();
    const changedFileNames = files.map((f) => f.filename);

    // Check critical violations (accidental sensitive files pushed)
    const sensitiveFiles = changedFileNames.filter((name) => 
      name === '.env' || (name.startsWith('.env.') && !name.endsWith('.example')) || name.includes('node_modules/')
    );

    if (sensitiveFiles.length > 0) {
      return {
        status: 'FAILED',
        violatedFiles: sensitiveFiles,
        checkedAt: new Date().toISOString(),
        message: `🚨 KRITIKAL: PR memuat file sensitif/terlarang (${sensitiveFiles.join(', ')}). Tolong minta developer untuk menghapus file tersebut dari commit dan gunakan .gitignore!`,
      };
    }

    // Check protected architecture files (e.g. docker-compose.yml, package.json, HandleInertiaRequests.php, etc.)
    const violated = changedFileNames.filter((name) =>
      protectedFiles.some((protectedName) => name === protectedName || name.endsWith(`/${protectedName}`))
    );

    if (violated.length > 0) {
      return {
        status: 'WARNING',
        violatedFiles: violated,
        checkedAt: new Date().toISOString(),
        message: `⚠️ AI-Diff Alert: File arsitektur terproteksi (${violated.join(', ')}) dimodifikasi pada PR #${prNumber}. Pastikan perubahan ini disengaja dan bukan hasil halusinasi AI!`,
      };
    }

    return {
      status: 'PASSED',
      violatedFiles: [],
      checkedAt: new Date().toISOString(),
      message: `✅ PR #${prNumber} lolos verifikasi integritas (${changedFileNames.length} file diubah, tidak ada file arsitektur yang dilanggar).`,
    };
  } catch (err: any) {
    return {
      status: 'FAILED',
      violatedFiles: [],
      checkedAt: new Date().toISOString(),
      message: `Koneksi ke GitHub API gagal/timeout: ${err.message || 'Network error'}.`,
    };
  }
}
