import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { company, userId, question } = await request.json();

    if (!company || !userId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const interviewId = nanoid();
    const codingInterview: CodingInterview = {
      id: interviewId,
      company: company.toLowerCase(),
      userId,
      question,
      transcript: [],
      code: '',
      createdAt: new Date().toISOString(),
    };

    await db.collection('coding-interviews').doc(interviewId).set(codingInterview);

    return NextResponse.json({ interviewId, question });
  } catch (error) {
    console.error('Error creating coding interview:', error);
    return NextResponse.json({ error: 'Failed to create interview' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const snapshot = await db
      .collection('coding-interviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const interviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error('Error fetching coding interviews:', error);
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}
