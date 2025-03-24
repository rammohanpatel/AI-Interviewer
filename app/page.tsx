import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import InterviewCard from '@/components/InterviewCard'
import { redirect } from 'next/navigation'
import { getCurrentUser, isAuthenticated } from '@/lib/actions/auth.action'
import { getInterviewsByUserId,getLatestInterviews } from "@/lib/actions/general.action";


const Home = async() => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect('/sign-in');

  const user = await getCurrentUser();

  const [userInterviews,allInterviews] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({userId:user?.id!})
  ])


  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterviews?.length! > 0;

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
             <Link href="/sign-in">Sign In</Link>
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
          Your Interviews
        </h2>
        <div className='interviews-section'>
          { hasPastInterviews?(
            userInterviews?.map((interview)=>(
              <InterviewCard key={interview.id} {...interview} />
            ))
          ):(
            <p> 
              You don&apos;t have any past interviews
            </p>
          )}
        </div>
      </section>

      <section className = "flex flex-col gap-6 mt-8">
        <h2>
          Take Interviews
        </h2>
        <div className='interviews-section'>
          { hasUpcomingInterviews?(
            allInterviews?.map((interview)=>(
              <InterviewCard key={interview.id} {...interview} />
            ))
          ):(
            <p>No available interviews</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
