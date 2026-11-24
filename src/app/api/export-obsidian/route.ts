import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { generateObsidianWeeklyMarkdown } from '@/lib/obsidian-exporter';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Enforce server-side role check: Mentor only
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('majastic_session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized: Harap login terlebih dahulu' }, { status: 401 });
  }

  try {
    const sessionUser = JSON.parse(sessionCookie.value);
    if (sessionUser.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Forbidden: Ekspor Obsidian hanya dapat diakses oleh Lead & Mentor' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized: Sesi tidak valid' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format'); // 'json' or 'download'

  const data = await db.getAll();
  const { projects, milestones, useCases, tasks, users } = data;

  const project = projects[0];
  const milestone = milestones[0];

  const markdownContent = generateObsidianWeeklyMarkdown({
    project,
    milestone,
    useCases,
    tasks,
    users,
  });

  if (format === 'json') {
    return NextResponse.json({ markdown: markdownContent });
  }

  // Format filename e.g. majastic-review-2026-11-24.md
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const filename = `majastic-review-${year}-${month}-${day}.md`;

  return new NextResponse(markdownContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
