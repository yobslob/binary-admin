import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assignment from '@/lib/models/Assignment';
import Lead from '@/lib/models/Lead';
import Editor from '@/lib/models/Editor';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    // Auto-set timestamps based on status transitions
    const updates: Record<string, unknown> = { ...body };
    if (body.status === 'trailer_delivered' && !body.trailerDeliveredAt) {
      updates.trailerDeliveredAt = new Date();
    }
    if (body.status === 'warm_approached' && !body.warmApproachedAt) {
      updates.warmApproachedAt = new Date();
    }
    if (body.status === 'replied' && !body.repliedAt) {
      updates.repliedAt = new Date();
    }
    if (body.status === 'closed' && !body.closedAt) {
      updates.closedAt = new Date();
    }

    // Auto-calculate commission when closed
    if (body.status === 'closed') {
      const existing = await Assignment.findById(id).lean() as Record<string, unknown> | null;
      if (existing) {
        const lead = await Lead.findById(existing.leadId).lean() as Record<string, unknown> | null;
        const editor = await Editor.findById(existing.editorId).lean() as Record<string, unknown> | null;
        if (lead && editor) {
          const ticketSize = (lead.ticketSize as number) || 0;
          const rate = (editor.commissionRate as number) || 5;
          updates.commissionEarned = (ticketSize * rate) / 100;
        }
      }
    }

    const assignment = await Assignment.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    // Sync lead status with assignment status
    const statusMap: Record<string, string> = {
      trailer_delivered: 'trailer_delivered',
      warm_approached: 'warm_approached',
      replied: 'replied',
      on_call: 'on_call',
      closed: 'closed',
      declined: 'declined',
    };
    if (body.status && statusMap[body.status]) {
      await Lead.findByIdAndUpdate((assignment as Record<string, unknown>).leadId, { status: statusMap[body.status] });
    }

    return NextResponse.json(assignment);
  } catch (err) {
    console.error('[PUT /api/assignments/[id]]', err);
    const message = err instanceof Error ? err.message : 'Failed to update assignment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    // Reset lead status back to unassigned
    await Lead.findByIdAndUpdate(assignment.leadId, { status: 'unassigned' });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/assignments/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
