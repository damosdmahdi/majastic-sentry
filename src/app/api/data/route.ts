import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await db.getAll();
  // Strip password field before returning to public client
  const safeUsers = data.users.map(({ password, ...u }: any) => u);
  return NextResponse.json({
    ...data,
    users: safeUsers,
    _source: data.source,
    dbError: data.error || null,
  });
}
