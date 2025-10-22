'use client';

import { useState } from 'react';
import VideoFeed from '@/components/VideoFeed';
import CodeEditor from '@/components/CodeEditor';
import VapiControls from '@/components/VapiControls';
import ProblemStatement from '@/components/ProblemStatement';
import { Code2 } from 'lucide-react';

const Index = () => {
  const [currentCode, setCurrentCode] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Coding Interview</h1>
                <p className="text-xs text-muted-foreground">Live technical assessment</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Video & Controls */}
          <div className="lg:col-span-1 space-y-4 flex flex-col overflow-y-auto">
            <ProblemStatement />
            <VideoFeed />
            <VapiControls currentCode={currentCode} />
          </div>

          {/* Right Panel - Code Editor */}
          <div className="lg:col-span-2 h-full">
            <CodeEditor onCodeChange={setCurrentCode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
