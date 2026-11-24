import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { Task } from '@/types';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Action: Archive Completed Tasks (Sprint Cutoff - Mentor Only)
    if (body.action === 'ARCHIVE_COMPLETED') {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('majastic_session');
      if (sessionCookie?.value) {
        try {
          const user = JSON.parse(sessionCookie.value);
          if (user.role !== 'MENTOR') {
            return NextResponse.json({ error: 'Hanya Mentor yang dapat mengarsipkan sprint tugas' }, { status: 403 });
          }
        } catch {}
      }
      await db.archiveCompletedTasks();
      return NextResponse.json({ success: true, message: 'Completed tasks archived successfully' });
    }

    // If updating an existing task
    if (body.id && body.isUpdate) {
      const updated = await db.updateTask(body.id, body.patch);
      if (!updated) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, task: updated });
    }

    // Creating a new task
    const newTask: Task = {
      id: `task-${Date.now()}`,
      useCaseId: body.useCaseId || null,
      title: body.title,
      type: body.type || 'GENERAL',
      endpointSpec: body.endpointSpec,
      assigneeId: body.assigneeId,
      status: 'TODO',
      githubPrUrl: body.githubPrUrl,
      prNumber: body.prNumber,
      isArchived: false,
      lastUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const saved = await db.addTask(newTask);
    return NextResponse.json({ success: true, task: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Protection: Only MENTOR can approve task to DONE
    if (patch.status === 'DONE') {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('majastic_session');
      if (sessionCookie?.value) {
        try {
          const user = JSON.parse(sessionCookie.value);
          if (user.role !== 'MENTOR') {
            return NextResponse.json(
              { error: 'Otorisasi ditolak: Hanya Mentor yang dapat menyetujui tugas menjadi DONE' },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 });
        }
      }
    }

    const updated = await db.updateTask(id, patch);
    return NextResponse.json({ success: true, task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
