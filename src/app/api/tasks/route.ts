import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { Task } from '@/types';
import { requireAuth, requireMentor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await req.json();

    // Action: Archive Completed Tasks (Sprint Cutoff - Mentor Only)
    if (body.action === 'ARCHIVE_COMPLETED') {
      const mentorAuth = await requireMentor();
      if (mentorAuth.error) return mentorAuth.error;
      await db.archiveCompletedTasks();
      return NextResponse.json({ success: true, message: 'Completed tasks archived successfully' });
    }

    // If updating an existing task
    if (body.id && body.isUpdate) {
      if (body.patch?.status === 'DONE') {
        const mentorAuth = await requireMentor();
        if (mentorAuth.error) return mentorAuth.error;
      }
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
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id, ...patch } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Protection: Only MENTOR can approve task to DONE
    if (patch.status === 'DONE') {
      const mentorAuth = await requireMentor();
      if (mentorAuth.error) return mentorAuth.error;
    }

    const updated = await db.updateTask(id, patch);
    if (!updated) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const mentorAuth = await requireMentor();
    if (mentorAuth.error) return mentorAuth.error;

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await db.deleteTask(id);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
