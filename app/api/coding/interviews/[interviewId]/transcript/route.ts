import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { interviewId } = await params;
    const { transcript, code } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Update the interview with transcript and code
    await db.collection('coding-interviews').doc(interviewId).update({
      transcript,
      code: code || '',
      completedAt: new Date().toISOString(),
    });

    // Generate feedback using AI (you can integrate with OpenAI or other AI services)
    const feedback = await generateFeedback(transcript, code);

    // Save feedback
    await db.collection('coding-interviews').doc(interviewId).update({
      feedback,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json({ error: 'Failed to save transcript' }, { status: 500 });
  }
}

async function generateFeedback(transcript: any[], code: string): Promise<string> {
  // This is a simple placeholder. You can integrate with OpenAI API here
  // to generate more sophisticated feedback based on the transcript and code
  
  const transcriptText = transcript
    .map(entry => `${entry.role}: ${entry.content}`)
    .join('\n');

  // Simple feedback generation (replace with actual AI integration)
  const codeQuality = code.length > 50 ? 'Good' : 'Needs improvement';
  const communicationQuality = transcript.length > 5 ? 'Good' : 'Could be better';

  return `
Feedback Summary:
- Code Quality: ${codeQuality}
- Communication: ${communicationQuality}
- Total Responses: ${transcript.filter(t => t.role === 'user').length}

Areas for Improvement:
- Practice explaining your thought process more clearly
- Consider edge cases in your solution
- Optimize for time and space complexity

Strengths:
- Showed understanding of the problem
- Attempted to solve the coding challenge
`;
}
