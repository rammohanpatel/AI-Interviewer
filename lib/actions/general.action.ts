"use server"

import {generateObject} from "ai";
import {google} from "@ai-sdk/google";
import { feedbackSchema, codingFeedbackSchema } from "@/constants";
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

export async function createCodingFeedback(params: {
    interviewId: string;
    userId: string;
    transcript: Array<{role: string, content: string, timestamp: string}>;
    code: string;
    question: Question;
}){
    const {interviewId, userId, transcript, code, question} = params;

    try {
        const formattedTranscript = transcript.map((entry) => (
            `- ${entry.role}: ${entry.content}\n`
        )).join('');

        const {object} = await generateObject({
            model: google('gemini-2.0-flash-001', {
                structuredOutputs: false,
            }),
            schema: codingFeedbackSchema,
            prompt: `You are an expert technical interviewer analyzing a coding interview. Your task is to evaluate the candidate's performance in a coding interview session. Be thorough and provide constructive feedback.

            Problem Statement:
            Title: ${question.title}
            Description: ${question.description}
            
            Candidate's Code Solution:
            ${code || 'No code provided'}
            
            Interview Transcript:
            ${formattedTranscript}
    
            Please score the candidate from 0 to 10 in the following areas:
            - **Problem Understanding**: How well did they understand the problem requirements and constraints?
            - **Algorithm & Logic**: Quality of their algorithmic approach and logical thinking.
            - **Code Quality**: Clean, readable, and well-structured code with proper naming conventions.
            - **Communication**: How well they explained their thought process and approach.
            - **Testing & Edge Cases**: Consideration of edge cases and testing approach.
            
            Also provide:
            - A detailed code review analyzing their solution
            - Key strengths demonstrated
            - Areas for improvement
            - Final assessment of their coding interview performance`,

            system: "You are a senior software engineer and technical interviewer with expertise in evaluating coding interviews. Provide detailed, constructive feedback."
        });

        const feedback = {
            interviewId,
            userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            codeReview: object.codeReview,
            createdAt: new Date().toISOString(),
        }

        // Check if feedback already exists for this interview
        const feedbackQuery = await db.collection('coding-feedback')
                                      .where("interviewId", "==", interviewId)
                                      .where("userId", "==", userId)
                                      .get();
        
        if (!feedbackQuery.empty) {
            const feedbackDoc = feedbackQuery.docs[0];
            await db.collection('coding-feedback').doc(feedbackDoc.id).update(feedback);
            return { success: true, feedbackId: feedbackDoc.id, message: 'Coding Feedback Updated' };
        } else {
            const newFeedback = await db.collection('coding-feedback').add(feedback);
            return { success: true, feedbackId: newFeedback.id, message: 'Coding Feedback Added' };
        }
        
    } catch (error) {
        console.log('Error saving coding feedback', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getCodingFeedbackByInterviewId(params: {interviewId: string, userId: string}) {
    const {interviewId, userId} = params;

    const feedback = await db.collection('coding-feedback')
                                .where('interviewId', "==", interviewId)
                                .where('userId', "==", userId)
                                .limit(1)
                                .get()

    if (feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() };
}

export async function getCompletedCodingInterviews(params: { userId: string, limit?: number }) {
    const { userId, limit = 10 } = params;

    const interviewsSnapshot = await db.collection("coding-interviews")
        .where("userId", "==", userId) 
        .where("completedAt", "!=", null)
        .orderBy("completedAt", "desc")
        .limit(limit)
        .get();

    const interviews = interviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as CodingInterview[];

    // Check if feedback exists for each interview
    const feedbackPromises = interviews.map(async (interview) => {
        const feedbackSnapshot = await db.collection("coding-feedback")
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
