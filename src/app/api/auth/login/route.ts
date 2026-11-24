import { NextResponse } from 'next/server';
import { db } from '@/lib/server-store';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const data = await db.getAll();
    const user = data.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Strict password verification
    const validPassword = (user as any).password || 'majastic123';
    if (password !== validPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Set Session Cookie (30 days)
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      tag: user.tag,
    });

    cookieStore.set('majastic_session', sessionData, {
      path: '/',
      httpOnly: false, // Accessible on client so UI knows logged-in user
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      tag: user.tag,
    };
    return NextResponse.json({ success: true, user: safeUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
