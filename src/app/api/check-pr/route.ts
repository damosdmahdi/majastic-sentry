import { NextResponse } from 'next/server';
import { inspectPullRequest } from '@/lib/github-checker';
import { db } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { taskId, repo, prNumber, prUrl } = await req.json();

    let targetPrNumber = prNumber;
    let targetRepo = repo;

    // Parse PR URL if provided (e.g. https://github.com/majastic/core-app/pull/18)
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
    const protectedFiles = project?.protectedFiles || ['docker-compose.yml', '.env.example', 'package.json'];

    const result = await inspectPullRequest({
      repo: targetRepo || project?.githubRepo || 'majastic/core-app',
      prNumber: targetPrNumber,
      protectedFiles,
    });

    // If taskId is provided, update task with result
    if (taskId) {
      await db.updateTask(taskId, {
        githubPrUrl: prUrl || `https://github.com/${targetRepo || project?.githubRepo}/pull/${targetPrNumber}`,
        prNumber: targetPrNumber,
        integrityCheck: result,
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
