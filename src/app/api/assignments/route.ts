import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assignment from '@/lib/models/Assignment';
import Editor from '@/lib/models/Editor';
import Lead from '@/lib/models/Lead';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const editorId = searchParams.get('editorId');
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (editorId) filter.editorId = editorId;
    if (leadId) filter.leadId = leadId;
    if (status) filter.status = status;

    // Ensure the referenced models are registered before populate
    void Editor;
    void Lead;

    const assignments = await Assignment.find(filter)
      .populate('editorId', 'name email stage')
      .populate('leadId', 'name company status ticketSize')
      .sort({ updatedAt: -1 })
      .lean();

    // Rename populated fields to editor/lead for frontend convenience
    const mapped = assignments.map((a: Record<string, unknown>) => ({
      ...a,
      editor: a.editorId,
      lead: a.leadId,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.editorId || !body.leadId) {
      return NextResponse.json({ error: 'editorId and leadId are required' }, { status: 400 });
    }

    const assignment = await Assignment.create({
      editorId: body.editorId,
      leadId: body.leadId,
      status: 'in_progress',
      notes: body.notes || '',
      assignedAt: new Date(),
    });

    // Update lead status to assigned
    await Lead.findByIdAndUpdate(body.leadId, { status: 'assigned' });

    return NextResponse.json(assignment, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create assignment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
