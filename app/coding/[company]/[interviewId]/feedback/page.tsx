'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Home } from 'lucide-react';

const FeedbackPage = () => {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const interviewId = params.interviewId as string;
  
  const [interview, setInterview] = useState<CodingInterview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/coding/interviews/${interviewId}`);
        const data = await response.json();
        
        if (response.ok) {
          setInterview(data.interview);
        } else {
          console.error('Interview not found');
          router.push(`/coding/${company}`);
        }
      } catch (error) {
        console.error('Error fetching interview:', error);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId, company, router]);

  const downloadFeedback = () => {
    if (!interview?.feedback) return;
    
    const element = document.createElement('a');
    const file = new Blob([interview.feedback], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${company}-interview-${interviewId}-feedback.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Interview not found</p>
          <Button onClick={() => router.push(`/coding/${company}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {company} Coding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/coding/${company}/${interviewId}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Interview
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Interview Feedback
                </h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {company} • {interview.question.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadFeedback}
                disabled={!interview.feedback}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem Summary */}
          <div>
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Problem Summary
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {interview.question.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {interview.question.description.substring(0, 150)}...
                  </p>
                </div>
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="text-foreground">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {interview.completedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="text-foreground">
                        {new Date(interview.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="text-foreground capitalize">{company}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Feedback */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                AI Feedback
              </h2>
              {interview.feedback ? (
                <div className="prose prose-sm max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono bg-muted/50 p-4 rounded-lg">
                    {interview.feedback}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No feedback available yet. Complete the interview to receive feedback.
                  </p>
                </div>
              )}
            </Card>

            {/* Code Solution */}
            {interview.code && (
              <Card className="p-6 bg-card border-border mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Your Solution
                </h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="text-sm text-foreground font-mono overflow-x-auto">
                    {interview.code}
                  </pre>
                </div>
              </Card>
            )}

            {/* Transcript */}
            {interview.transcript && interview.transcript.length > 0 && (
              <Card className="p-6 bg-card border-border mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Interview Transcript
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {interview.transcript.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        entry.role === 'user'
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'bg-muted/50 border-l-4 border-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {entry.role === 'user' ? 'You' : 'AI Interviewer'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{entry.content}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
