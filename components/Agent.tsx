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
        <>
          <div className="call-view">
            <div className="card-interviewer">
                <div className="avatar">
                    <Image 
                      src = "/ai-avatar.png"
                      alt = "vapi"
                      width = {65}
                      height={54}
                      className="object-cover"
                    />
                    {isSpeaking && <span className="animate-speak"></span>}
                </div>
                <h3>AI Interviewer</h3>
            </div>

            <div className="card-border">
                <div className="card-content">
                    <Image 
                      src="/user-avatar.png"
                      alt="user"
                      width={540}
                      height={540}
                      className="object-cover rounded-full size-[120px]"
                    />
                    <h3>{userName}</h3>
                </div>
            </div>
          </div>
          {messages.length > 0 && (
            <div className="transcript-border">
                <div className = "transcript">
                    <p 
                        key={lastMessage} 
                        className={cn('transition-opacity duration-500 opacity-100','animate-fadeIn opacity-100' )}
                        > 
                        {lastMessage}
                    </p>
                </div>
            </div>
          )}

          <div className="w-full flex justify-center">
            {callStatus !== 'ACTIVE' ?(
                <button className="relative btn-call" onClick={handleCall}>
                    <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus!=='CONNECTING' && 'hidden')} />
                    <span>
                        {callStatus === 'INACTIVE' || callStatus === 'FINISHED' ? 'Start Interview':'End Interview'}
                    </span>
                </button>
            ):(
                <button 
                className="btn-disconnect"
                onClick = {handleEndCall}
                >
                    End Interview
                </button>
            )}
          </div>
        </>
    )
}

export default Agent;