import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ company: string }> }
) {
  try {
    const { company } = await params;
    const filePath = path.join(process.cwd(), 'data', 'questions', `${company.toLowerCase()}.json`);
    
    // Check if company-specific file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'Company questions not found' }, { status: 404 });
    }

    const data = await fs.readFile(filePath, 'utf8');
    const questions: Question[] = JSON.parse(data);
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    return NextResponse.json({ question: randomQuestion });
  } catch (error) {
    console.error('Error reading company questions:', error);
    return NextResponse.json({ error: 'Failed to read company questions' }, { status: 500 });
  }
}
