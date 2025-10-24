'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoFeed from '@/components/VideoFeed';
import CodeEditor from '@/components/CodeEditor';
import VapiControls from '@/components/VapiControls';
import ProblemStatement from '@/components/ProblemStatement';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';

const CodingInterviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const interviewId = params.interviewId as string;
  const { user, loading: userLoading } = useCurrentUser();
  
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
    if (!interviewId || !user?.id) return;
    
    toast.loading('Saving interview and generating feedback...', { id: 'save-interview' });
    
    try {
      console.log('Completing interview with transcript:', transcript);
      const response = await fetch(`/api/coding/interviews/${interviewId}/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript, 
          code: currentCode,
          userId: user.id
        }),
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('Transcript save response:', data);
      
      if (response.ok) {
        if (data.feedbackGenerated) {
          toast.success('Interview completed! Feedback is ready.', { id: 'save-interview' });
        } else {
          toast.success('Interview saved! Please wait for feedback...', { id: 'save-interview' });
        }
        // Small delay to let user see the success message
        setTimeout(() => {
          router.push(`/coding/${company}/${interviewId}/feedback`);
        }, 1000);
      } else {
        toast.error(`Failed: ${data.error || 'Unknown error'}`, { id: 'save-interview' });
        console.error('Failed to save transcript:', data);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error: ${errorMessage}`, { id: 'save-interview' });
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access the interview</p>
          <Button onClick={() => router.push('/sign-in')}>
            Sign In
          </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Left Panel - Problem Statement (Full Width on Mobile) */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full">
            {/* Problem Statement - Fixed height with scroll */}
            <div className="flex-shrink-0 max-h-[45%] overflow-y-auto">
              <ProblemStatement question={question} />
            </div>
            
            {/* Video & Controls - Remaining space */}
            <div className="flex-1 flex-col gap-3 overflow-y-auto">
              <div className="w-full max-w-sm mx-auto lg:max-w-full flex-shrink-0">
                <VideoFeed />
              <div className="flex-shrink-0 mt-1">
                <VapiControls 
                  currentCode={currentCode} 
                  question={question} 
                  userName={user?.name || 'User'}
                  onInterviewComplete={handleCompleteInterview}
                  autoStart={true}
                />
              </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor (Larger) */}
          <div className="lg:col-span-2 h-full">
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
