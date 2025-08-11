import React from 'react'
import dayjs from 'dayjs';
import InterviewIcon from './InterviewIcon';
import DisplayTechIcons   from './DisplayTechIcons';
import { Button } from './ui/button';
import Link from 'next/link';
import { getFeedbackByInterviewId } from '@/lib/actions/general.action';

const InterviewCard = async({id, userId, role, type, techstack,createdAt}:InterviewCardProps) => {

    const feedback =   userId && id ? await getFeedbackByInterviewId({interviewId:id, userId}) : null;
    const normalizedType = /mix/gi.test(type) ? 'mixed':type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format("MMM D, YYYY");

  return (
    <div className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-gray-800/90'>
      {/* Header with type badge */}
      <div className='flex justify-between items-start mb-4'>
        <div className='flex items-center space-x-3'>
          <InterviewIcon type={type} size="md" />
          <div>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
              {role}
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>Interview</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
          normalizedType === 'technical' 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
            : normalizedType === 'behavioral'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
        }`}>
          {normalizedType}
        </span>
      </div>

      {/* Date and Score */}
      <div className='flex justify-between items-center mb-4 text-sm'>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className={`font-semibold ${
            feedback?.totalScore ? 
              feedback.totalScore >= 8 ? 'text-green-600 dark:text-green-400' :
              feedback.totalScore >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400'
          }`}>
            {feedback?.totalScore || "---"}/10
          </span>
        </div>
      </div>

      {/* Tech Stack */}
      <div className='mb-6'>
        <DisplayTechIcons techStack={techstack} />
      </div>

      {/* Action Button */}
      <div className='flex justify-center'>
        <Button 
          asChild 
          className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            feedback 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <Link href={feedback 
            ?`/interview/${id}/feedback`
            :`/interview/${id}`}
            className="flex items-center justify-center space-x-2"
          >
            {feedback ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>View Feedback</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start Interview</span>
              </>
            )}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default InterviewCard
