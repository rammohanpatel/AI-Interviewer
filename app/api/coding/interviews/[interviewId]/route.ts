import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { interviewId } = await params;
    
    const doc = await db.collection('coding-interviews').doc(interviewId).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interview = { id: doc.id, ...doc.data() };
    return NextResponse.json({ interview });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json({ error: 'Failed to fetch interview' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { interviewId } = await params;
    const updates = await request.json();

    await db.collection('coding-interviews').doc(interviewId).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
}
