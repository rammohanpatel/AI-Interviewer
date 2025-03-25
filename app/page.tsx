import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import InterviewCard from '@/components/InterviewCard'
import { redirect } from 'next/navigation'
import { getCurrentUser, isAuthenticated } from '@/lib/actions/auth.action'
import { getCompletedInterviews} from "@/lib/actions/general.action";


const Home = async() => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect('/sign-in');

  const user = await getCurrentUser();

  const { interviewsWithFeedback, interviewsWithoutFeedback } = await getCompletedInterviews({userId:user?.id!});


  const hasInterviewsWithFeedback = interviewsWithFeedback?.length! > 0;
  const hasInterviewsWithoutFeedback = interviewsWithoutFeedback?.length! > 0;

  return (
    <div className='root-layout'>
      <nav>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
            <h2 className="text-primary-100">AI Interviewer</h2>
          </Link>
      </nav>
      <section className='card-cta'>
         <div className='flex flex-col gap-6 max-w-lg'>
           <h2>
            Get Interview-Ready with AI-Powered Practice
           </h2>
           <p>
            Practice real interview questions and get instant feedback
           </p>
           <Button asChild className='btn-primary max-sm:w-full'>
             <Link href="/interview">Create Your Interview</Link>
            </Button>
         </div>
        
        <Image 
           src="/robot.png"
           alt="robot"
           width={500}
           height={400}
           className = "max-sm:hidden"
         />
      </section>

      <section className = "flex flex-col gap-6 mt-8">
        <h2>
          Recently Prepared Interviews
        </h2>
        <div className='interviews-section'>
          { hasInterviewsWithoutFeedback?(
            interviewsWithoutFeedback?.map((interview)=>(
              <InterviewCard key={interview.id} {...interview} />
            ))
          ):(
            <Button asChild className='btn-primary max-sm:w-full'>
             <Link href="/interview">Prepare Your First Interview</Link>
            </Button>
          )}
        </div>
      </section>

      <section className = "flex flex-col gap-6 mt-8">
        <h2>
          Completed Interviews
        </h2>
        <div className='interviews-section'>
          { hasInterviewsWithFeedback?(
            interviewsWithFeedback?.map((interview)=>(
              <InterviewCard key={interview.id} {...interview} />
            ))
          ):(
            <p>You have&apos;t given any interviews</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
