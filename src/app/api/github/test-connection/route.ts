import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await req.json().catch(() => ({}));
    const data = await db.getAll();
    const project = data.projects[0];

    const token = body.token || process.env.GITHUB_PAT;
    const targetRepo = body.repo || project?.githubRepo || process.env.GITHUB_REPO || 'TefaMajastic/epkl-core';

    if (!token) {
      return NextResponse.json({
        success: false,
        isSimulated: true,
        message: '⚠️ Mode Simulasi Aktif: Token GITHUB_PAT belum diatur di .env.local atau Vercel. Pengecekan PR saat ini menggunakan simulasi aturan lokal.',
      });
    }

    // Call GitHub API to test connection
    const response = await fetch(`https://api.github.com/repos/${targetRepo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Majastic-Sentry-Diagnostic',
      },
      signal: AbortSignal.timeout(6000),
    });

    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitTotal = response.headers.get('x-ratelimit-limit');

    if (response.status === 200) {
      const repoData = await response.json();
      return NextResponse.json({
        success: true,
        isPrivate: repoData.private,
        repoFullName: repoData.full_name,
        defaultBranch: repoData.default_branch,
        rateLimitRemaining,
        rateLimitTotal,
        message: `✅ Terhubung secara live ke private repository "${repoData.full_name}". Izin akses repositori valid. Sisa kuota API: ${rateLimitRemaining || '5000'}/${rateLimitTotal || '5000'}.`,
      });
    }

    if (response.status === 401) {
      return NextResponse.json({
        success: false,
        error: '❌ Token GitHub tidak valid atau telah kedaluwarsa (HTTP 401 Unauthorized). Harap perbarui Personal Access Token kamu.',
      });
    }

    if (response.status === 404) {
      return NextResponse.json({
        success: false,
        error: `❌ Repositori "${targetRepo}" tidak ditemukan atau Token kamu tidak memiliki izin akses (scope 'repo') ke organisasi private Majastic (HTTP 404 Not Found).`,
      });
    }

    return NextResponse.json({
      success: false,
      error: `Koneksi GitHub menghasilkan status ${response.status}: ${response.statusText}`,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Gagal menghubungi server GitHub: ${err.message || 'Network Timeout'}`,
    });
  }
}
