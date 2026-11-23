import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { UseCase } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const existingCount = db.getUseCases().filter((u) => u.milestoneId === body.milestoneId).length;
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

    const saved = db.addUseCase(newUseCase);
    return NextResponse.json({ success: true, useCase: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
