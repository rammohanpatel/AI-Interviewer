import { getInterviewById } from "@/lib/actions/general.action";
import {redirect} from "next/navigation";
import Image from "next/image";
import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import Link from "next/link";


export default async function Page({params}:RouteParams){
    const { id } = params;
    const user = await getCurrentUser();

    const interview = await getInterviewById(id);

    if(!interview) return redirect("/");

    return (
        
        <>
          <div className="flex flex-row gap-4 justify-between">
            <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                <div className="flex flex-row gap-4 items-center">
                    <Image
                     src={getRandomInterviewCover()}
                     alt="cover-image"
                     width={40}
                     height={40}
                     className="object-cover rounded-full size-[40px]" />

                     <h3 className="text-2xl font-semibold capitalize">{interview.role} Interview</h3>
                </div>
                <DisplayTechIcons techStack={interview.techstack} />
            </div>
            <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">{interview.type}</p>
          </div>
          <Agent
           userName={user?.name || ''}
           userId={user?.id}
           interviewId={id}
           type="interview"
           questions={interview.questions} />
        </>
    )
}