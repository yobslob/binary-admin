import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession, verifySession, destroySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password, action } = await req.json();

    if (action === 'logout') {
      await destroySession();
      return NextResponse.json({ success: true });
    }

    if (action === 'verify') {
      const isValid = await verifySession();
      return NextResponse.json({ authenticated: isValid });
    }

    // Login
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await createSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
