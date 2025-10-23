import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { createCodingFeedback } from '@/lib/actions/general.action';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { interviewId } = await params;
    const { transcript, code, userId } = await request.json();

    if (!transcript || !userId) {
      return NextResponse.json({ error: 'Transcript and userId are required' }, { status: 400 });
    }

    console.log('Saving transcript for interview:', interviewId);
    console.log('Transcript data:', transcript);

    // Get the interview to get the question and user details
    const interviewDoc = await db.collection('coding-interviews').doc(interviewId).get();
    
    if (!interviewDoc.exists) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interviewData = interviewDoc.data() as CodingInterview;

    // Update the interview with transcript and code
    await db.collection('coding-interviews').doc(interviewId).update({
      transcript,
      code: code || '',
      completedAt: new Date().toISOString(),
    });

    console.log('Updated interview with transcript and code');

    // Generate feedback with timeout
    const feedbackPromise = createCodingFeedback({
      interviewId,
      userId,
      transcript,
      code: code || '',
      question: interviewData.question,
    });

    // Wait for feedback with 50 second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Feedback generation timeout')), 50000)
    );

    try {
      const feedbackResult = await Promise.race([feedbackPromise, timeoutPromise]) as any;
      console.log('Feedback generation completed:', feedbackResult);
      
      if (!feedbackResult.success) {
        console.error('Failed to generate feedback:', feedbackResult.error);
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Interview completed and feedback generated.',
        interviewId,
        feedbackId: feedbackResult.feedbackId
      });
    } catch (error) {
      console.error('Error generating feedback (but interview saved):', error);
      // Return success anyway since interview was saved
      // Feedback can be regenerated later if needed
      return NextResponse.json({ 
        success: true,
        message: 'Interview completed. Feedback generation in progress.',
        interviewId,
        warning: 'Feedback may take a moment to appear'
      });
    }
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json({ 
      error: 'Failed to save transcript', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
