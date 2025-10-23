
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'utils', 'AmazonInterviewQuestions.txt');
    const data = await fs.readFile(filePath, 'utf8');
    const questions = data.split('// Question').filter(q => q.trim() !== '');
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return NextResponse.json({ question: randomQuestion.trim() });
  } catch (error) {
    console.error('Error reading interview questions:', error);
    return NextResponse.json({ error: 'Failed to read interview questions' }, { status: 500 });
  }
}
