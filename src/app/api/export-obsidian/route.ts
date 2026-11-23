import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { generateObsidianWeeklyMarkdown } from '@/lib/obsidian-exporter';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format'); // 'json' or 'download'

  const projects = db.getProjects();
  const milestones = db.getMilestones();
  const useCases = db.getUseCases();
  const tasks = db.getTasks();
  const users = db.getUsers();

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

  // Format filename e.g. majastic-review-2026-W47.md
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const filename = `majastic-review-${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}.md`;

  return new NextResponse(markdownContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
