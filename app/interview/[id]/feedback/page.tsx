import React from 'react'
import {redirect} from "next/navigation";
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById, getFeedbackByInterviewId } from '@/lib/actions/general.action';

const page = async({params}:RouteParams) => {
    const {id } = params;
    const user = await getCurrentUser();

    const interview = await getInterviewById(id);
    if(!interview) return redirect("/");

    const feedback = await getFeedbackByInterviewId({interviewId:id,userId:user?.id!})

    console.log(feedback);

  return (
    <div>
        <h1>Feedback</h1>
        <h6>{JSON.stringify(feedback)}</h6>
    </div>
  )
}

export default page
