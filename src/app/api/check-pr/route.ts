import { NextResponse } from 'next/server';
import { inspectPullRequest } from '@/lib/github-checker';
import { db } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { taskId, repo, prNumber, prUrl } = await req.json();

    let targetPrNumber = prNumber;
    let targetRepo = repo;

    // Parse PR URL if provided (e.g. https://github.com/TefaMajastic/epkl-core/pull/7)
    if (prUrl) {
      const match = prUrl.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
      if (match) {
        targetRepo = match[1];
        targetPrNumber = parseInt(match[2], 10);
      }
    }

    if (!targetPrNumber) {
      return NextResponse.json({ error: 'Nomor PR atau URL PR GitHub tidak valid' }, { status: 400 });
    }

    const data = await db.getAll();
    const project = data.projects[0]; // Active project
    const defaultRepo = project?.githubRepo || process.env.GITHUB_REPO || 'TefaMajastic/epkl-core';
    const protectedFiles = project?.protectedFiles || [
      'app/Http/Middleware/HandleInertiaRequests.php',
      'vite.config.js',
      'vite.config.ts',
      'composer.json',
      'package.json',
      'docker-compose.yml',
      'compose.yaml',
      '.env.example',
      'bootstrap/app.php'
    ];

    const effectiveRepo = targetRepo || defaultRepo;

    const result = await inspectPullRequest({
      repo: effectiveRepo,
      prNumber: targetPrNumber,
      protectedFiles,
    });

    // If taskId is provided, update task with result
    if (taskId) {
      await db.updateTask(taskId, {
        githubPrUrl: prUrl || `https://github.com/${effectiveRepo}/pull/${targetPrNumber}`,
        prNumber: targetPrNumber,
        integrityCheck: result,
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
