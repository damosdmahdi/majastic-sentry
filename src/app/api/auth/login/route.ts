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

    const cleanEmail = email.toLowerCase().trim();
    const customMentorEmail = process.env.MENTOR_EMAIL?.toLowerCase().trim();

    const data = await db.getAll();
    let user = data.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // Support custom Gmail / Email for Mentor configured in Vercel (MENTOR_EMAIL)
    if (!user && customMentorEmail && cleanEmail === customMentorEmail) {
      user = data.users.find((u) => u.role === 'MENTOR');
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Strict password verification (Supports Vercel Environment Variables & Dynamic Config)
    let validPassword = (user as any).password;
    if (user.role === 'MENTOR') {
      validPassword = process.env.MENTOR_PASSWORD || validPassword || 'Adrigodri123';
    } else {
      validPassword = process.env.TEAM_PASSWORD || validPassword || 'majastic123';
    }

    if (password !== validPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const activeEmail = (user.role === 'MENTOR' && customMentorEmail) ? customMentorEmail : user.email;

    // Set Session Cookie (30 days)
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      id: user.id,
      name: user.name,
      email: activeEmail,
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
      email: activeEmail,
      role: user.role,
      avatar: user.avatar,
      tag: user.tag,
    };
    return NextResponse.json({ success: true, user: safeUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
