import { IntegrityCheckResult } from '@/types';

export interface CheckPrParams {
  repo: string; // e.g. "majastic/core-app"
  prNumber: number;
  protectedFiles: string[];
}

export async function inspectPullRequest(params: CheckPrParams): Promise<IntegrityCheckResult> {
  const { repo, prNumber, protectedFiles } = params;
  const token = process.env.GITHUB_PAT;

  // Real GitHub API call if token is provided
  if (token) {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Majastic-Sentry-Guardrail',
        },
        // Timeout 8 seconds to prevent serverless function hanging
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            status: 'FAILED',
            violatedFiles: [],
            checkedAt: new Date().toISOString(),
            message: `PR #${prNumber} tidak ditemukan di repository ${repo}. Pastikan nomor PR dan akses repositori sudah sesuai.`,
          };
        }
        if (response.status === 401 || response.status === 403) {
          return {
            status: 'FAILED',
            violatedFiles: [],
            checkedAt: new Date().toISOString(),
            message: 'Akses GitHub ditolak (Token tidak valid atau tidak memiliki izin ke repo private).',
          };
        }
        return {
          status: 'FAILED',
          violatedFiles: [],
          checkedAt: new Date().toISOString(),
          message: `Gagal memanggil GitHub API (Status: ${response.status}).`,
        };
      }

      const files: Array<{ filename: string; status: string; additions: number; deletions: number }> = await response.json();
      const changedFileNames = files.map((f) => f.filename);

      // Check critical violations (accidental sensitive files pushed)
      const sensitiveFiles = changedFileNames.filter((name) => 
        name === '.env' || name.startsWith('.env.') && !name.endsWith('.example') || name.includes('node_modules/')
      );

      if (sensitiveFiles.length > 0) {
        return {
          status: 'FAILED',
          violatedFiles: sensitiveFiles,
          checkedAt: new Date().toISOString(),
          message: `🚨 KRITIKAL: PR memuat file sensitif/terlarang (${sensitiveFiles.join(', ')}). Tolong minta developer untuk menghapus file tersebut dari commit dan gunakan .gitignore!`,
        };
      }

      // Check protected architecture files (e.g. docker-compose.yml, package.json, etc.)
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
        message: `✅ PR #${prNumber} lolos verifikasi integritas (${changedFileNames.length} file diubah, tidak ada file arsitektur yang terlanggar).`,
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        violatedFiles: [],
        checkedAt: new Date().toISOString(),
        message: `Koneksi ke GitHub API gagal/timeout: ${err.message || 'Unknown network error'}.`,
      };
    }
  }

  // Fallback demo/simulation mode if GITHUB_PAT is not yet configured in .env
  // This allows instant testing without having to setup GitHub token immediately!
  const isSimulationWarning = prNumber % 2 === 0; // even PRs trigger demo warning for testing
  if (isSimulationWarning) {
    return {
      status: 'WARNING',
      violatedFiles: ['docker-compose.yml'],
      checkedAt: new Date().toISOString(),
      message: `⚠️ [Mode Uji/Simulasi] File dilindungi "docker-compose.yml" terdeteksi dimodifikasi pada PR #${prNumber}. (Masukkan GITHUB_PAT di .env untuk live sync langsung ke repo private Majastic)`,
    };
  }

  return {
    status: 'PASSED',
    violatedFiles: [],
    checkedAt: new Date().toISOString(),
    message: `✅ [Mode Uji/Simulasi] PR #${prNumber} lolos verifikasi kepatuhan arsitektur.`,
  };
}
