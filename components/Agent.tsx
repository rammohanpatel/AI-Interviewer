"use client"

import Image from "next/image";
import { cn } from "@/lib/utils";
import {vapi} from "@/lib/vapi.sdk";
import {useRouter} from 'next/navigation';
import { useState,useEffect } from "react";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { toast } from "sonner";


enum CallStatus {
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
    CONNECTING = 'CONNECTING'
}

interface SavedMessages {
    role: 'user' | 'system' | 'assistant';
    content : string;
}

const Agent = ({userName,userId,type,interviewId,questions}:AgentProps)=>{
    const router = useRouter();
    const [callStatus,setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking,setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState<SavedMessages[]>([]);
    const [lastMessage, setLastMessage] = useState<string>('');
    
    useEffect(()=>{
        const callStart = ()=>{
            setCallStatus(CallStatus.ACTIVE);
        }
        const callEnd = ()=>{
            setCallStatus(CallStatus.FINISHED);
        }
        const onMessage = (message:Message)=>{
            if(message.type === "transcript" && message.transcriptType === "final"){
                const newMessage = {role:message.role, content:message.transcript};
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        }

        const onSpeechStart = ()=>{
            console.log("SpeechStart");
            setIsSpeaking(true);
        }

        const onSpeechEnd = ()=>{
            console.log("SpeechEnd");
            setIsSpeaking(false);
        }

        const onError = (error:Error)=>{
            console.log("Error",error);
            toast.error(`Error : ${error.message}`);
        }

        vapi.on("call-start",callStart);
        vapi.on("call-end",callEnd);
        vapi.on("message",onMessage);
        vapi.on("speech-start",onSpeechStart);
        vapi.on("speech-end",onSpeechEnd);
        vapi.on("error",onError);

        return ()=>{
            vapi.off("call-start",callStart);
            vapi.off("call-end",callEnd);
            vapi.off("message",onMessage);
            vapi.off("speech-start",onSpeechStart);
            vapi.off("speech-end",onSpeechEnd);
            vapi.off("error",onError);
        }

    },[]);

    const handleGenerateFeedback = async(messages:SavedMessages[])=>{
        console.log("generate feedback here");

        const{success, feedbackId:id} = await createFeedback({
            interviewId : interviewId!,
            userId : userId!,
            transcript : messages
        })

        if(success && id){
            router.push(`/interview/${interviewId}/feedback`)
        }else{
            console.log("Failed to generate feedback");
            router.push('/');
        }
    }

    const handleGenerateInterview = async(messages:SavedMessages[])=>{
        console.log("generate interview here");
        
        try {
            // Extract interview details from the conversation
            const conversationText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            
            // Use AI to extract structured data from the conversation
            const response = await fetch('/api/vapi/extract-interview-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation: conversationText,
                    userId: userId
                })
            });
            
            if (response.ok) {
                const { success, interviewId } = await response.json();
                if (success && interviewId) {
                    router.push(`/interview/${interviewId}`);
                } else {
                    console.log("Failed to create interview");
                    router.push('/');
                }
            } else {
                console.log("Failed to extract interview details");
                router.push('/');
            }
        } catch (error) {
            console.error("Error creating interview:", error);
            router.push('/');
        }
    }

    useEffect(()=>{
        if(messages.length > 0){
            setLastMessage(messages[messages.length - 1].content);
        }

        if(callStatus === CallStatus.FINISHED){
            if(type=="generate"){
                handleGenerateInterview(messages);
            }
            else{
                handleGenerateFeedback(messages);
            }
        }
    },[messages,callStatus,type,userId]);



    const handleCall = async()=>{
        if(callStatus === CallStatus.INACTIVE){
            setCallStatus(CallStatus.CONNECTING);
            if(type==="generate"){
                await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,{
                    variableValues : {
                        username : userName,
                        userid : userId
                    }
                });
            } 
            else{
                let formattedQuestions = '';

                if(questions){
                    formattedQuestions = questions.map((question)=>`-${question}`).join('\n');
                }

                await vapi.start(interviewer,{
                    variableValues : {
                        questions:formattedQuestions
                    }
                });              
            }      
        }
    }

    const handleEndCall = ()=>{
        if(callStatus === CallStatus.ACTIVE){
             vapi.stop();
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* AI Interviewer Card */}
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="relative mb-4">
                        <Image 
                          src = "/interviewer.png"
                          alt = "AI Interviewer"
                          width = {80}
                          height={80}
                          className="object-cover rounded-full shadow-lg"
                        />
                        {isSpeaking && (
                          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse opacity-75"></div>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Interviewer</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      Ready to conduct your interview
                    </p>
                </div>

                {/* User Card */}
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <Image 
                      src="/candidate.png"
                      alt="user"
                      width={80}
                      height={80}
                      className="object-cover rounded-full shadow-lg mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{userName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      Candidate
                    </p>
                </div>
              </div>

              {/* Transcript Section */}
              {messages.length > 0 && (
                <div className="mb-8">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Live Transcript
                        </h4>
                        <p 
                            key={lastMessage} 
                            className="text-gray-800 dark:text-gray-200 leading-relaxed animate-fadeIn"
                            > 
                            {lastMessage}
                        </p>
                    </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex justify-center">
                {callStatus !== 'ACTIVE' ?(
                    <button 
                      className={`relative px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                        callStatus === 'CONNECTING' 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                      }`}
                      onClick={handleCall}
                      disabled={callStatus === 'CONNECTING'}
                    >
                        {callStatus === 'CONNECTING' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl animate-pulse"></div>
                        )}
                        <span className="relative flex items-center space-x-2">
                          {callStatus === 'CONNECTING' ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{callStatus === 'INACTIVE' || callStatus === 'FINISHED' ? 'Start Interview':'End Interview'}</span>
                            </>
                          )}
                        </span>
                    </button>
                ):(
                    <button 
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick = {handleEndCall}
                    >
                        <span className="flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>End Interview</span>
                        </span>
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
    )
}

export default Agent;