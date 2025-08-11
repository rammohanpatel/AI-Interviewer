import { Button } from '@/components/ui/button'
import React from 'react'
import InterviewCard from '@/components/InterviewCard'
import { redirect } from 'next/navigation'
import { getCurrentUser, isAuthenticated } from '@/lib/actions/auth.action'
import { getCompletedInterviews} from "@/lib/actions/general.action";
import Logo from '@/components/Logo'
import Link from 'next/link'


const Home = async() => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect('/sign-in');

  const user = await getCurrentUser();

  const { interviewsWithFeedback, interviewsWithoutFeedback } = await getCompletedInterviews({userId:user?.id!});


  const hasInterviewsWithFeedback = interviewsWithFeedback?.length! > 0;
  const hasInterviewsWithoutFeedback = interviewsWithoutFeedback?.length! > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <Logo size="md" className="group-hover:scale-105 transition-transform" />
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user?.name}
              </span>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg">
                <Link href="/interview">New Interview</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <Logo size="2xl" showText={false} className="justify-center mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Master Your Next Interview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Practice with AI-powered interviews tailored to your role and get instant, actionable feedback
          </p>
          
          {!hasInterviewsWithoutFeedback && !hasInterviewsWithFeedback && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create your first AI interview in just 3 simple steps
              </p>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fill in your job role and skills</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Practice with AI interviewer</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Get detailed feedback & improve</span>
                </div>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                <Link href="/interview">Start Your First Interview</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Recent Interviews Section */}
        {hasInterviewsWithoutFeedback && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Continue Your Practice
              </h2>
              <Button asChild variant="outline" className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <Link href="/interview">Create New</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviewsWithoutFeedback?.map((interview) => (
                <InterviewCard key={interview.id} {...interview} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Interviews Section */}
        {hasInterviewsWithFeedback && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Completed Interviews
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {interviewsWithFeedback.length} completed
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviewsWithFeedback?.map((interview) => (
                <InterviewCard key={interview.id} {...interview} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State for Completed Interviews */}
        {!hasInterviewsWithFeedback && hasInterviewsWithoutFeedback && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed Interviews
            </h2>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No completed interviews yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete your practice interviews to see feedback and track your progress
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Home
