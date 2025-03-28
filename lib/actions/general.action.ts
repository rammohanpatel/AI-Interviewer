"use server"

import {generateObject} from "ai";
import {google} from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";
import {db} from "@/firebase/admin";


export async function getInterviewById(id:string):Promise<Interview | null> {
    const interview = await db.collection("interviews").doc(id).get();
    return interview.data() as Interview | null;
}

export async function getCompletedInterviews(params: GetCompletedInterviewsParams): Promise<{ interviewsWithFeedback: Interview[]; interviewsWithoutFeedback: Interview[] }> {
    const { userId} = params;

    const interviewsSnapshot = await db.collection("interviews")
        .where("userId", "==", userId) 
        .where("finalized", "==", true) 
        .orderBy("createdAt", "desc")
        .get();

    const interviews = interviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];

    // Check if feedback exists for each interview
    const feedbackPromises = interviews.map(async (interview) => {
        const feedbackSnapshot = await db.collection("feedback")
            .where("interviewId", "==", interview.id)
            .get();

        return { interview, hasFeedback: !feedbackSnapshot.empty };
    });

    const results = await Promise.all(feedbackPromises);

    // Separate interviews based on feedback existence
    const interviewsWithFeedback = results.filter(({ hasFeedback }) => hasFeedback).map(({ interview }) => interview);
    const interviewsWithoutFeedback = results.filter(({ hasFeedback }) => !hasFeedback).map(({ interview }) => interview);

    return { interviewsWithFeedback, interviewsWithoutFeedback };
}

export async function createFeedback(params:CreateFeedbackParams){
    const {interviewId, userId, transcript} = params;

    try {
        const formattedTranscript = transcript.map((sentence:{role:string,content:string})=>(
            `-${sentence.role}: ${sentence.content}\n`
        )).join('');

        const {object} = await generateObject({
            model:google('gemini-2.0-flash-001',{
                structuredOutputs: false,
            }),
            schema : feedbackSchema,
            prompt:  `You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
            Transcript:
            ${formattedTranscript}
    
            Please score the candidate from 0 to 10 in the following areas. Do not add categories other than the ones provided:
            - **Communication Skills**: Clarity, articulation, structured responses.
            - **Technical Knowledge**: Understanding of key concepts for the role.
            - **Problem-Solving**: Ability to analyze problems and propose solutions.
            - **Cultural & Role Fit**: Alignment with company values and job role.
            - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.`,

            system:"You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories"
        });

        const feedback = {
            interviewId,
            userId,
            totalScore : object.totalScore,
            categoryScores : object.categoryScores,
            strengths : object.strengths,
            areasForImprovement : object.areasForImprovement,
            finalAssessment : object.finalAssessment,
            createdAt : new Date().toISOString(),
        }

        const feedbackQuery = await db.collection('feedback')
                                      .where("interviewId","==",interviewId)
                                      .where("userId","==",userId)
                                      .get();
        
        if(!feedbackQuery.empty){
            const feedbackDoc = feedbackQuery.docs[0];
            await db.collection('feedback').doc(feedbackDoc.id).update(feedback);
            return  {success:true, feedbackId:feedbackDoc.id, message:'Feedback Updated'};
        }
        else{
            const newFeedback = await db.collection('feedback').add(feedback);
            return {success:true, feedbackId:newFeedback.id,message:'Feedback Added'}
        }
        
    } catch (error) {
        console.log('Error saving feedback',error);
        return {success:false};
    }
}

export async function getFeedbackByInterviewId(params:GetFeedbackByInterviewIdParams):Promise<Feedback | null>{
    const {interviewId, userId} = params;

    const feedback = await db.collection('feedback')
                                .where('interviewId',"==",interviewId)
                                .where('userId',"==",userId)
                                .limit(1)
                                .get()

    if(feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];
    return {id:feedbackDoc.id,...feedbackDoc.data()} as Feedback;
}
