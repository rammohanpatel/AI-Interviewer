'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Code2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CodingInterviewCardProps {
  interview: CodingInterview;
  hasFeedback?: boolean;
}

const CodingInterviewCard = ({ interview, hasFeedback = false }: CodingInterviewCardProps) => {
  const completedDate = interview.completedAt ? new Date(interview.completedAt) : new Date(interview.createdAt);
  const isCompleted = !!interview.completedAt;

  return (
    <Card className="group overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {interview.question.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {interview.company}
                </Badge>
                <Badge 
                  variant={isCompleted ? "default" : "secondary"}
                  className={`text-xs ${
                    isCompleted 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {isCompleted ? "Completed" : "In Progress"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {interview.question.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CalendarDays className="w-4 h-4" />
              <span>{completedDate.toLocaleDateString()}</span>
            </div>
            {isCompleted && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{completedDate.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {isCompleted && hasFeedback ? (
            <Button asChild className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
              <Link href={`/coding/${interview.company}/${interview.id}/feedback`}>
                View Feedback
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : isCompleted ? (
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/coding/${interview.company}/${interview.id}`}>
                Review Interview
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              <Link href={`/coding/${interview.company}/${interview.id}`}>
                Continue Interview
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CodingInterviewCard;
