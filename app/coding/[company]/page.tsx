'use client';

import { useState, useEffect } from 'react';
import VideoFeed from '@/components/VideoFeed';
import CodeEditor from '@/components/CodeEditor';
import VapiControls from '@/components/VapiControls';
import ProblemStatement from '@/components/ProblemStatement';
import { Code2 } from 'lucide-react';

const Index = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch('/api/coding/random-question');
        const data = await response.json();
        setQuestion(data.question);
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    };

    fetchQuestion();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Video & Controls */}
          <div className="lg:col-span-2 space-y-4 flex flex-col overflow-y-auto">
            <ProblemStatement question={question} />
            <VideoFeed />
            <VapiControls currentCode={currentCode} question={question} userName="Rammohan" />
          </div>

          {/* Right Panel - Code Editor */}
          <div className="lg:col-span-3 h-full">
            <CodeEditor onCodeChange={setCurrentCode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
