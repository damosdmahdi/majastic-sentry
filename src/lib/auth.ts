import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Role } from '@/types';

export const SESSION_COOKIE_NAME = 'majastic_session';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  tag?: string;
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.MENTOR_PASSWORD ||
    'majastic-sentry-dev-session-secret'
  );
}

export function signSessionCookie(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionCookie(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!payload || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(payload)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded || !decoded.id || !decoded.role) return null;
    return decoded as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionCookie(token);
}

export async function requireAuth(): Promise<
  { user: SessionUser; error?: never } | { user?: never; error: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: Sesi berakhir atau tidak valid. Silakan login kembali.' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export async function requireMentor(): Promise<
  { user: SessionUser; error?: never } | { user?: never; error: NextResponse }
> {
  const auth = await requireAuth();
  if (auth.error) return auth;
  if (auth.user.role !== 'MENTOR') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: Tindakan ini hanya diizinkan untuk Mentor (Lead & PM).' },
        { status: 403 }
      ),
    };
  }
  return auth;
}
