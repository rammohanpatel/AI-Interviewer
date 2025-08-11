import { getInterviewById } from "@/lib/actions/general.action";
import {redirect} from "next/navigation";
import Image from "next/image";
import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import Link from "next/link";


export default async function Page({params}:RouteParams){
    const { id } = await params;
    const user = await getCurrentUser();

    const interview = await getInterviewById(id);

    if(!interview) return redirect("/");

    return (
        <>
          {/* Interview Header */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Image
                    src={getRandomInterviewCover()}
                    alt="cover-image"
                    width={60}
                    height={60}
                    className="object-cover rounded-xl shadow-md" 
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {interview.role} Interview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {interview.questions.length} questions prepared
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DisplayTechIcons techStack={interview.techstack} />
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider ${
                    interview.type.toLowerCase() === 'technical' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : interview.type.toLowerCase() === 'behavioral'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  }`}>
                    {interview.type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Component */}
          <Agent
           userName={user?.name || ''}
           userId={user?.id}
           interviewId={id}
           type="interview"
           questions={interview.questions} 
          />
        </>
    )
}