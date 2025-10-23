'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Code2, Plus, History, ArrowLeft } from 'lucide-react';

const CompanyCodingPage = () => {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  
  const [loading, setLoading] = useState(false);
  const [recentInterviews, setRecentInterviews] = useState<CodingInterview[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch recent interviews for this user
    // For now, we'll just show a placeholder
    setRecentInterviews([]);
  }, []);

  const startNewInterview = async () => {
    setLoading(true);
    try {
      // Fetch a random question for the company
      const questionResponse = await fetch(`/api/coding/${company}/question`);
      const questionData = await questionResponse.json();

      if (!questionResponse.ok) {
        throw new Error(questionData.error || 'Failed to fetch question');
      }

      // Create a new interview
      const interviewResponse = await fetch('/api/coding/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          userId: 'user123', // Replace with actual user ID
          question: questionData.question,
        }),
      });

      const interviewData = await interviewResponse.json();

      if (!interviewResponse.ok) {
        throw new Error(interviewData.error || 'Failed to create interview');
      }

      // Navigate to the interview page
      router.push(`/coding/${company}/${interviewData.interviewId}`);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                onClick={() => router.push('/coding')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Coding
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground capitalize">
                  {company} Coding Interview
                </h1>
                <p className="text-sm text-muted-foreground">
                  Practice coding interviews with AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Start New Interview Section */}
          <Card className="p-8 bg-card border-border mb-8">
            <div className="text-center">
              <Code2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Ready for Your {company.charAt(0).toUpperCase() + company.slice(1)} Interview?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start a new coding interview session with our AI interviewer. You'll get a random 
                coding problem and receive real-time feedback on your approach and solution.
              </p>
              <Button
                onClick={startNewInterview}
                disabled={loading}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Interview
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card border-border">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Company-Specific Questions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Practice with questions commonly asked in {company} interviews
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Real-time Feedback
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get instant feedback on your code and problem-solving approach
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Interview Transcripts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review your performance with detailed transcripts and feedback
                </p>
              </div>
            </Card>
          </div>

          {/* Recent Interviews */}
          {recentInterviews.length > 0 && (
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Recent Interviews
              </h3>
              <div className="space-y-3">
                {recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => router.push(`/coding/${company}/${interview.id}/feedback`)}
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        {interview.question.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyCodingPage;
