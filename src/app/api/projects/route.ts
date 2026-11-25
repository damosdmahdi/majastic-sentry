import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { requireMentor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  try {
    const mentorAuth = await requireMentor();
    if (mentorAuth.error) return mentorAuth.error;

    const body = await req.json();
    const projectId = body.projectId || 'proj-1';

    if (!Array.isArray(body.protectedFiles)) {
      return NextResponse.json({ error: 'Daftar protectedFiles tidak valid' }, { status: 400 });
    }

    const cleanFiles = body.protectedFiles
      .map((f: unknown) => (typeof f === 'string' ? f.trim() : ''))
      .filter((f: string) => f.length > 0);

    const updated = await db.updateProjectProtectedFiles(projectId, cleanFiles);
    return NextResponse.json({ success: true, protectedFiles: cleanFiles, project: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
