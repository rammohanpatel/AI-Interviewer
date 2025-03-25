// import React from 'react'
// import {redirect} from "next/navigation";
// import { getCurrentUser } from '@/lib/actions/auth.action';
// import { getInterviewById, getFeedbackByInterviewId } from '@/lib/actions/general.action';

// const page = async({params}:RouteParams) => {
//     const { id } = params;
//     const user = await getCurrentUser();

//     const interview = await getInterviewById(id);
//     if(!interview) return redirect("/");

//     const feedback = await getFeedbackByInterviewId({interviewId:id,userId:user?.id!})

//     console.log(feedback);

//   return (
//     <div>

//     </div>
//   )
// }

// export default page


import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth.action"
import { getInterviewById, getFeedbackByInterviewId } from "@/lib/actions/general.action"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, Star, TrendingUp, TrendingDown, Calendar, Award, AlertTriangle } from "lucide-react"
import DownloadFeedback from "@/components/DownloadFeeback"



const FeedbackPage = async ({ params }: RouteParams) => {
  const { id } = params
  const user = await getCurrentUser()

  const interview = await getInterviewById(id)
  if (!interview) return redirect("/")

  const feedback = (await getFeedbackByInterviewId({ interviewId: id, userId: user?.id! })) as Feedback

  if (!feedback)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Card className="p-8 bg-zinc-900 border-zinc-800">
          <h1 className="text-2xl font-bold mb-4">No feedback available</h1>
          <p>There is no feedback available for this interview yet.</p>
        </Card>
      </div>
    )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500"
    if (score >= 6) return "bg-amber-500"
    return "bg-rose-500"
  }

  const getScoreText = (score: number) => {
    if (score >= 8) return "text-emerald-500"
    if (score >= 6) return "text-amber-500"
    return "text-rose-500"
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 py-8 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center text-zinc-400 text-sm mb-2">
            <span>Interviews</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>Feedback</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Feedback - <span className="capitalize">{interview?.role}</span></h1>
          <div className="flex items-center mt-2 text-zinc-400">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(feedback.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left column - Overall score and strengths/improvements */}
        <div className="lg:col-span-1 space-y-6">
          {/* Overall Score */}
          <Card className="p-6 bg-zinc-900 border-zinc-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-bl-full" />
            <h2 className="text-lg font-medium mb-4">Overall Performance</h2>
            <div className="flex items-center justify-center mb-4">
              <div className={`text-6xl font-bold ${getScoreText(feedback.totalScore)}`}>{feedback.totalScore}</div>
              <div className="text-xl text-zinc-400 ml-2">/10</div>
            </div>
            <Progress value={feedback.totalScore * 10} className="h-2 bg-zinc-800" />
          </Card>

          {/* Strengths */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 mr-2 text-emerald-500" />
              <h2 className="text-lg font-medium">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Areas for Improvement */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              <h2 className="text-lg font-medium">Areas for Improvement</h2>
            </div>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start">
                  <TrendingDown className="h-5 w-5 mr-2 text-amber-500 shrink-0 mt-0.5" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right column - Category scores and final assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Scores */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h2 className="text-lg font-medium mb-6">Category Scores</h2>
            <div className="space-y-6">
              {feedback.categoryScores.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-purple-500" />
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <Badge className={`${getScoreColor(category.score)} text-white`}>{category.score}/10</Badge>
                  </div>
                  <Progress value={category.score * 10} className="h-1.5 mb-3 bg-zinc-800" />
                  <p className="text-zinc-400 text-sm">{category.comment}</p>
                  {index < feedback.categoryScores.length - 1 && <Separator className="my-4 bg-zinc-800" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Final Assessment */}
          <Card className="p-6 bg-zinc-900 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <h2 className="text-lg font-medium mb-4">Final Assessment</h2>
            <p className="text-zinc-300 leading-relaxed">{feedback.finalAssessment}</p>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors flex-1 flex justify-center items-center">
              Download Report
            </button> */}
            <DownloadFeedback feedback={feedback} interviewId={id} user={user} />

            <button className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-md transition-colors flex-1 flex justify-center items-center">
              Retake Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPage

