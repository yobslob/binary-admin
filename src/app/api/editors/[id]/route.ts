import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Editor from '@/lib/models/Editor';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const editor = await Editor.findById(id).lean();
    if (!editor) return NextResponse.json({ error: 'Editor not found' }, { status: 404 });
    return NextResponse.json(editor);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch editor' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const editor = await Editor.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!editor) return NextResponse.json({ error: 'Editor not found' }, { status: 404 });
    return NextResponse.json(editor);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update editor';
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
    const editor = await Editor.findByIdAndDelete(id);
    if (!editor) return NextResponse.json({ error: 'Editor not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete editor' }, { status: 500 });
  }
}
