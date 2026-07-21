import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Editor from '@/lib/models/Editor';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');

    const filter: Record<string, string> = {};
    if (stage) filter.stage = stage;

    const editors = await Editor.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json(editors);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch editors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const editor = await Editor.create({
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      discordUsername: body.discordUsername || '',
      stage: body.stage || 'qualified',
      meetLink: body.meetLink || '',
      commissionRate: body.commissionRate ?? 5,
      notes: body.notes || '',
    });
    return NextResponse.json(editor, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create editor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
