import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Editor from '@/lib/models/Editor';
import Lead from '@/lib/models/Lead';
import Assignment from '@/lib/models/Assignment';
import Settings from '@/lib/models/Settings';
import { DEFAULT_EMAIL_TEMPLATES } from '@/lib/constants';

/**
 * Single endpoint that returns ALL dashboard data in one request.
 * This avoids 4 separate cold starts on Vercel's free tier.
 */
export async function GET() {
  try {
    await dbConnect();

    const [editors, leads, rawAssignments, settingsDoc] = await Promise.all([
      Editor.find({}).sort({ updatedAt: -1 }).lean(),
      Lead.find({}).sort({ updatedAt: -1 }).lean(),
      Assignment.find({})
        .populate('editorId', 'name email stage commissionRate')
        .populate('leadId', 'name company status ticketSize')
        .sort({ updatedAt: -1 })
        .lean(),
      Settings.findOne({ key: 'email_templates' }).lean(),
    ]);

    // Map assignment populated fields
    const assignments = rawAssignments.map((a: Record<string, unknown>) => ({
      ...a,
      editor: a.editorId,
      lead: a.leadId,
    }));

    // Seed default templates if none exist
    let templates = settingsDoc;
    if (!templates) {
      const created = await Settings.create({
        key: 'email_templates',
        value: DEFAULT_EMAIL_TEMPLATES,
      });
      templates = created.toObject();
    }

    return NextResponse.json({
      editors,
      leads,
      assignments,
      settings: templates,
    });
  } catch (err) {
    console.error('[GET /api/dashboard]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Database connection failed: ${message}` },
      { status: 500 }
    );
  }
}
