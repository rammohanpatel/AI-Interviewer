import { Button } from '@/components/ui/button'
import { dummyInterviews } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import InterviewCard from '@/components/InterviewCard'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/actions/auth.action'


const Home = async() => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect('/sign-in');
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
          {dummyInterviews.map((interview)=>(
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </div>
      </section>

      <section className = "flex flex-col gap-6 mt-8">
        <h2>
          Your Interviews
        </h2>
        <div className='interviews-section'>
          {dummyInterviews.map((interview)=>(
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
