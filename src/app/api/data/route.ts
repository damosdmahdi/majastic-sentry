import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';

export async function GET() {
  return NextResponse.json({
    projects: db.getProjects(),
    milestones: db.getMilestones(),
    useCases: db.getUseCases(),
    tasks: db.getTasks(),
    users: db.getUsers(),
  });
}
