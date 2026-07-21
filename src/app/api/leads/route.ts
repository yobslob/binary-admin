import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/lib/models/Lead';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (status) filter.status = status;

    const leads = await Lead.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const lead = await Lead.create({
      name: body.name,
      email: body.email || '',
      company: body.company || '',
      files: body.files || [],
      status: body.status || 'unassigned',
      ticketSize: body.ticketSize || 0,
      notes: body.notes || '',
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create lead';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
