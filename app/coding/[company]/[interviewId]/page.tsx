'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoFeed from '@/components/VideoFeed';
import CodeEditor from '@/components/CodeEditor';
import VapiControls from '@/components/VapiControls';
import ProblemStatement from '@/components/ProblemStatement';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CodingInterviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const interviewId = params.interviewId as string;
  
  const [currentCode, setCurrentCode] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [interview, setInterview] = useState<CodingInterview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/coding/interviews/${interviewId}`);
        const data = await response.json();
        
        if (response.ok) {
          setInterview(data.interview);
          setQuestion(data.interview.question);
          setCurrentCode(data.interview.code || '');
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

  const handleSaveCode = async (code: string) => {
    if (!interviewId) return;
    
    try {
      await fetch(`/api/coding/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  const handleCompleteInterview = async (transcript: any[]) => {
    if (!interviewId) return;
    
    try {
      const response = await fetch(`/api/coding/interviews/${interviewId}/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, code: currentCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push(`/coding/${company}/${interviewId}/feedback`);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview || !question) {
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
                onClick={() => router.push(`/coding/${company}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground capitalize">
                  {company} Coding Interview
                </h1>
                <p className="text-sm text-muted-foreground">
                  Interview ID: {interviewId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-180px)]">
          {/* Left Panel - Video & Controls */}
          <div className="lg:col-span-2 space-y-4 flex flex-col overflow-y-auto">
            <ProblemStatement question={question} />
            <VideoFeed />
            <VapiControls 
              currentCode={currentCode} 
              question={question} 
              userName="Rammohan"
              onInterviewComplete={handleCompleteInterview}
            />
          </div>

          {/* Right Panel - Code Editor */}
          <div className="lg:col-span-3 h-full">
            <CodeEditor 
              onCodeChange={(code) => {
                setCurrentCode(code);
                handleSaveCode(code);
              }}
              initialCode={currentCode}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingInterviewPage;
