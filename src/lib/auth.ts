import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_NAME = 'ba_session';
const SESSION_SECRET = process.env.ADMIN_PASSWORD || 'fallback-secret';

function generateToken(): string {
  const payload = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  return `${payload}.${hmac.digest('hex')}`;
}

function verifyToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length < 2) return false;
  const signature = parts.pop()!;
  const payload = parts.join('.');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  return hmac.digest('hex') === signature;
}

export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return input === password;
}

export async function createSession(): Promise<string> {
  const token = generateToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/editors',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}
