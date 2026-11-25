import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { UseCase } from '@/types';
import { requireAuth, requireMentor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await req.json();

    const allData = await db.getAll();
    const existingCount = allData.useCases.filter((u) => u.milestoneId === body.milestoneId).length;
    const nextCode = `UC-${String(existingCount + 1).padStart(2, '0')}`;

    const newUseCase: UseCase = {
      id: `uc-${Date.now()}`,
      milestoneId: body.milestoneId,
      code: body.code || nextCode,
      title: body.title,
      businessGoal: body.businessGoal,
      figmaUrl: body.figmaUrl,
      createdAt: new Date().toISOString(),
    };

    const saved = await db.addUseCase(newUseCase);
    return NextResponse.json({ success: true, useCase: saved });
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
      return NextResponse.json({ error: 'Use Case ID is required' }, { status: 400 });
    }

    const updated = await db.updateUseCase(id, patch);
    if (!updated) {
      return NextResponse.json({ error: 'Use Case tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, useCase: updated });
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
      return NextResponse.json({ error: 'Use Case ID is required' }, { status: 400 });
    }

    await db.deleteUseCase(id);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
