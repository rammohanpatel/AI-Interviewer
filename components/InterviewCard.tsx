import React from 'react'
import dayjs from 'dayjs';
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import DisplayTechIcons   from './DisplayTechIcons';
import { Button } from './ui/button';
import Link from 'next/link';
import { getFeedbackByInterviewId } from '@/lib/actions/general.action';

const InterviewCard = async({id, userId, role, type, techstack,createdAt}:InterviewCardProps) => {

    const feedback =   userId && id ? await getFeedbackByInterviewId({interviewId:id, userId}) : null;
    const normalizedType = /mix/gi.test(type) ? 'mixed':type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format("MMM D, YYYY");

  return (
    <div className='card-border w-[360px] max-sm:w-full'>
      <div className='card-interview'>
        <div>
            <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg'>
                <p>{normalizedType}</p>
            </div>
            <Image 
               src={getRandomInterviewCover()}
               alt="cover-image"
               width={90}
               height={90}
               className='rounded-full object-fit size-[90px]'
            />

            <h3 className='mt-5 capitalize'>{role} interview</h3>

            <div>
                <div>
                    <Image 
                       src="/calendar.svg"
                       alt = "calendar"
                       width={22}
                       height={22}
                    />
                    <p>{formattedDate}</p>
                </div>
                <div className="flex flex-grow gap-2 items-center">
                    <Image 
                       src="/star.svg"
                       alt = "star"
                       width={22}
                       height={22}
                    />
                    <p>{feedback?.totalScore || "---"}/10</p>
                </div>
            </div>

            <div className='flex flex-row justify-between mt-2'>
                <DisplayTechIcons techStack={techstack} />
                <Button >
                    <Link href={feedback 
                    ?`/interview/${id}/feedback`
                    :`/interview/${id}`}>
                        {feedback ? "Review" : "Start"}
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard
