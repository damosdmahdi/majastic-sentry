import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';

export async function GET() {
  const data = await db.getAll();
  return NextResponse.json(data);
}
