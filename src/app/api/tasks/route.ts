import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { Task } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // If updating an existing task
    if (body.id && body.isUpdate) {
      const updated = db.updateTask(body.id, body.patch);
      if (!updated) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, task: updated });
    }

    // Creating a new task
    const newTask: Task = {
      id: `task-${Date.now()}`,
      useCaseId: body.useCaseId,
      title: body.title,
      type: body.type || 'GENERAL',
      endpointSpec: body.endpointSpec,
      assigneeId: body.assigneeId,
      status: 'TODO',
      githubPrUrl: body.githubPrUrl,
      prNumber: body.prNumber,
      lastUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const saved = db.addTask(newTask);
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
    const updated = db.updateTask(id, patch);
    return NextResponse.json({ success: true, task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
