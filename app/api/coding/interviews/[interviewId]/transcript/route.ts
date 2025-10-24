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

    // Generate feedback synchronously to ensure it's ready
    console.log('Starting feedback generation...');
    try {
      const feedbackResult = await createCodingFeedback({
        interviewId,
        userId,
        transcript,
        code: code || '',
        question: interviewData.question,
      });
      console.log('Feedback generation completed:', feedbackResult);
      
      // Return success with feedback ready
      return NextResponse.json({ 
        success: true,
        message: 'Interview completed successfully. Feedback is ready.',
        interviewId,
        feedbackGenerated: true
      });
    } catch (feedbackError) {
      console.error('Error generating feedback:', feedbackError);
      // Still return success for interview save, but note feedback failed
      return NextResponse.json({ 
        success: true,
        message: 'Interview saved, but feedback generation failed.',
        interviewId,
        feedbackGenerated: false,
        feedbackError: feedbackError instanceof Error ? feedbackError.message : 'Unknown error'
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
