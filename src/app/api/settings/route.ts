import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import { DEFAULT_EMAIL_TEMPLATES } from '@/lib/constants';

export async function GET() {
  try {
    await dbConnect();

    let settings = await Settings.findOne({ key: 'email_templates' }).lean();

    // Seed default templates if none exist
    if (!settings) {
      const created = await Settings.create({
        key: 'email_templates',
        value: DEFAULT_EMAIL_TEMPLATES,
      });
      settings = created.toObject();
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const settings = await Settings.findOneAndUpdate(
      { key: 'email_templates' },
      { value: body.value },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json(settings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
