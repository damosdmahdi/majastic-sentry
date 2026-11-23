import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await db.getAll();
  return NextResponse.json(data);
}
