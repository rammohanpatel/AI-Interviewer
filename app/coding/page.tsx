'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, Building, Users, TrendingUp } from 'lucide-react';

const companies = [
  {
    name: 'Amazon',
    slug: 'amazon',
    description: 'Practice with Amazon-style coding questions focusing on algorithms and data structures',
    color: 'from-orange-500 to-yellow-500',
    icon: '📦',
    difficulty: 'Medium-Hard',
    questionCount: 5,
  },
  {
    name: 'Google',
    slug: 'google',
    description: 'Challenge yourself with Google-style problems emphasizing optimization and efficiency',
    color: 'from-blue-500 to-green-500',
    icon: '🔍',
    difficulty: 'Hard',
    questionCount: 4,
  },
  {
    name: 'Meta',
    slug: 'meta',
    description: 'Solve Meta (Facebook) interview questions with focus on system design thinking',
    color: 'from-blue-600 to-purple-600',
    icon: '👥',
    difficulty: 'Medium-Hard',
    questionCount: 4,
  },
];

const CodingMainPage = () => {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
          <Code2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Coding Interview Practice
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Practice coding interviews with our AI interviewer. Choose a company to get started 
          with questions tailored to their interview style.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="p-6 bg-card border-border text-center">
          <Building className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">
            {companies.length}
          </div>
          <div className="text-sm text-muted-foreground">Companies</div>
        </Card>
        
        <Card className="p-6 bg-card border-border text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">
            {companies.reduce((acc, company) => acc + company.questionCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Questions</div>
        </Card>
        
        <Card className="p-6 bg-card border-border text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">AI</div>
          <div className="text-sm text-muted-foreground">Powered</div>
        </Card>
      </div>

      {/* Company Selection */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
          Choose a Company
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card 
              key={company.slug}
              className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => router.push(`/coding/${company.slug}`)}
            >
              <div className={`h-3 bg-gradient-to-r ${company.color}`}></div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{company.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {company.name}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {company.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-muted-foreground">Difficulty: </span>
                      <span className="font-medium text-foreground">{company.difficulty}</span>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {company.questionCount} questions
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/coding/${company.slug}`);
                  }}
                >
                  Start Interview
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Choose Company
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a company to practice with their specific interview style and question types.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start Interview
            </h3>
            <p className="text-sm text-muted-foreground">
              Get a random coding question and start your interview with our AI interviewer.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Get Feedback
            </h3>
            <p className="text-sm text-muted-foreground">
              Receive detailed feedback on your solution, approach, and areas for improvement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingMainPage;
