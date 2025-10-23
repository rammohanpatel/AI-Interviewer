import { VapiMessage } from '@/types/vapi';
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

const VAPI_WEB_TOKEN = 'be7bbfd8-7bb9-4738-9c38-c1057d092167';
const VAPI_WORKFLOW_ID = '16f36366-98ec-48f7-8e70-90549aae29b3';

interface VapiControlsProps {
  currentCode?: string;
  question?: Question | string;
  userName?: string;
  onInterviewComplete?: (transcript: any[]) => void;
}



const VapiControls = ({ currentCode = '', question = '', userName = 'there', onInterviewComplete }: VapiControlsProps) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, content: string, timestamp: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState<{role: string, content: string} | null>(null);
  const [lastCompleteMessage, setLastCompleteMessage] = useState<string>('');
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);

  // Create refs to avoid stale closures
  const transcriptRef = useRef(transcript);
  const currentMessageRef = useRef(currentMessage);
  const lastCompleteMessageRef = useRef(lastCompleteMessage);
  const messageTimeoutRef = useRef(messageTimeout);
  const onInterviewCompleteRef = useRef(onInterviewComplete);

  // Update refs when state changes
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    currentMessageRef.current = currentMessage;
  }, [currentMessage]);

  useEffect(() => {
    lastCompleteMessageRef.current = lastCompleteMessage;
  }, [lastCompleteMessage]);

  useEffect(() => {
    messageTimeoutRef.current = messageTimeout;
  }, [messageTimeout]);

  useEffect(() => {
    onInterviewCompleteRef.current = onInterviewComplete;
  }, [onInterviewComplete]);

  useEffect(() => {
    const vapiInstance = new Vapi(VAPI_WEB_TOKEN);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
      toast.success('Interview started');
      setTranscript([]); // Clear previous transcript
      setCurrentMessage(null);
      setLastCompleteMessage('');
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      toast.info('Interview ended');
      
      // Clear any timeouts
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      
      // Add any remaining current message to transcript if it's new
      const currentMsg = currentMessageRef.current;
      const lastComplete = lastCompleteMessageRef.current;
      const currentTranscript = transcriptRef.current;
      
      if (currentMsg && currentMsg.content !== lastComplete) {
        const finalEntry = {
          ...currentMsg,
          timestamp: new Date().toISOString()
        };
        const finalTranscript = [...currentTranscript, finalEntry];
        setTranscript(finalTranscript);
        
        // Call the completion callback with final transcript
        const completeCallback = onInterviewCompleteRef.current;
        if (completeCallback && finalTranscript.length > 0) {
          console.log('Sending final transcript to completion handler:', finalTranscript);
          setTimeout(() => completeCallback(finalTranscript), 500);
        }
      } else {
        const completeCallback = onInterviewCompleteRef.current;
        if (completeCallback && currentTranscript.length > 0) {
          console.log('Sending transcript to completion handler:', currentTranscript);
          setTimeout(() => completeCallback(currentTranscript), 500);
        }
      }
    });

    vapiInstance.on('message', (message: VapiMessage) => {
      console.log('Vapi Message received:', message);
      
      if (message.type === 'transcript' && message.transcript) {
        const messageRole = message.role || 'assistant';
        const messageContent = message.transcript.trim();
        
        // Clear any existing timeout
        const currentTimeout = messageTimeoutRef.current;
        if (currentTimeout) {
          clearTimeout(currentTimeout);
        }

        // Only process if this is a new/different message content
        const lastComplete = lastCompleteMessageRef.current;
        const currentMsg = currentMessageRef.current;
        
        if (messageContent && messageContent !== lastComplete) {
          // Check if this is a continuation of the current message or a new one
          if (currentMsg && currentMsg.role === messageRole) {
            // Update the current message with the latest content
            setCurrentMessage({
              role: messageRole,
              content: messageContent
            });
          } else {
            // New speaker - save previous message if it exists and is different
            if (currentMsg && currentMsg.content !== lastComplete) {
              const completedEntry = {
                ...currentMsg,
                timestamp: new Date().toISOString()
              };
              setTranscript(prev => [...prev, completedEntry]);
              setLastCompleteMessage(currentMsg.content);
            }
            
            setCurrentMessage({
              role: messageRole,
              content: messageContent
            });
          }

          // Set timeout to finalize message if no updates come within 2 seconds
          const timeout = setTimeout(() => {
            const current = currentMessageRef.current;
            const lastCompleteNow = lastCompleteMessageRef.current;
            
            if (current && current.content !== lastCompleteNow) {
              const completedEntry = {
                ...current,
                timestamp: new Date().toISOString()
              };
              setTranscript(prev => [...prev, completedEntry]);
              setLastCompleteMessage(current.content);
              setCurrentMessage(null);
            }
          }, 2000); // 2 seconds timeout

          setMessageTimeout(timeout);
        }
      }
      
      // Handle speech start/end events
      if (message.type === 'speech-start') {
        console.log('Speech started by:', message.role);
      }
      
      if (message.type === 'speech-end') {
        console.log('Speech ended by:', message.role);
        
        // Clear timeout since we got speech-end
        const currentTimeout = messageTimeoutRef.current;
        if (currentTimeout) {
          clearTimeout(currentTimeout);
          setMessageTimeout(null);
        }
        
        // When speech ends, finalize the current message if it's new
        const currentMsg = currentMessageRef.current;
        const lastComplete = lastCompleteMessageRef.current;
        
        if (currentMsg && currentMsg.content !== lastComplete) {
          const completedEntry = {
            ...currentMsg,
            timestamp: new Date().toISOString()
          };
          setTranscript(prev => [...prev, completedEntry]);
          setLastCompleteMessage(currentMsg.content);
          setCurrentMessage(null);
        }
      }
    });

    vapiInstance.on('error', (error: Error) => {
      console.error('Vapi error:', error);
      toast.error('Interview error occurred');
    });

    return () => {
      vapiInstance.stop();
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, []); // Empty dependencies - we use refs for all state access

  const startInterview = async () => {
    if (!vapi) return;
    
    try {
      const questionText = typeof question === 'string' ? question : question?.title || '';
      await vapi.start(VAPI_WORKFLOW_ID, {
        variableValues: {
          questions: questionText,
          user_name: userName
        }
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.error('Failed to start interview');
    }
  };

  const endInterview = () => {
    if (!vapi) return;
    vapi.stop();
  };

  const toggleMute = () => {
    if (!vapi) return;
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const requestCodeReview = () => {
    if (!vapi || !isConnected) {
      toast.error('Please start the interview first');
      return;
    }
    
    vapi.send({
      type: 'add-message',
      message: {
        role: 'user',
        content: `Here's my current code for the problem:\n\n${currentCode}\n\nCan you analyze it and give me feedback on my approach, any bugs, and hints if needed?`
      }
    });
    toast.success('Code sent for review');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">AI Interviewer</h3>
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs font-medium text-primary">Connected</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {!isConnected ? (
            <Button 
              onClick={startInterview}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!question}
            >
              <Phone className="w-4 h-4 mr-2" />
              {question ? 'Start Interview' : 'Loading Question...'}
            </Button>
          ) : (
            <>
              <div className="flex gap-2">
                <Button 
                  onClick={toggleMute}
                  variant="secondary"
                  className="flex-1"
                >
                  {isMuted ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Mute
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    // Finalize any current message before ending
                    if (currentMessage && currentMessage.content !== lastCompleteMessage) {
                      const finalEntry = {
                        ...currentMessage,
                        timestamp: new Date().toISOString()
                      };
                      setTranscript(prev => {
                        const updatedTranscript = [...prev, finalEntry];
                        setLastCompleteMessage(currentMessage.content);
                        
                        // End the interview and trigger completion
                        endInterview();
                        
                        // Trigger completion callback with updated transcript
                        if (onInterviewComplete && updatedTranscript.length > 0) {
                          setTimeout(() => {
                            onInterviewComplete(updatedTranscript);
                          }, 1000);
                        }
                        
                        return updatedTranscript;
                      });
                    } else {
                      // No current message, just end interview with existing transcript
                      endInterview();
                      if (onInterviewComplete && transcript.length > 0) {
                        setTimeout(() => {
                          onInterviewComplete(transcript);
                        }, 1000);
                      }
                    }
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Interview
                </Button>
              </div>
              <Button 
                onClick={requestCodeReview}
                variant="outline"
                className="w-full"
              >
                Ask AI to Review My Code
              </Button>
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                  <div>Transcript entries: {transcript.length}</div>
                  <div>Current message: {currentMessage ? 'Yes' : 'No'}</div>
                  <div>Last complete: {lastCompleteMessage.substring(0, 30)}...</div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {(transcript.length > 0 || currentMessage) && (
        <Card className="p-4 bg-card border-border max-h-[200px] overflow-y-auto">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Interview Transcript</h4>
          <div className="space-y-3">
            {/* Completed messages */}
            {transcript.map((entry, index) => (
              <div key={index} className="text-sm border-l-2 border-muted pl-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-primary text-xs">
                    {entry.role === 'user' ? 'You' : 'AI Interviewer'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-foreground">{entry.content}</p>
              </div>
            ))}
            
            {/* Current message being spoken */}
            {currentMessage && (
              <div className="text-sm border-l-2 border-primary pl-3 bg-primary/5 rounded-r-lg p-2">
                <div className="flex items-center mb-1">
                  <span className="font-medium text-primary text-xs">
                    {currentMessage.role === 'user' ? 'You' : 'AI Interviewer'}
                  </span>
                  <span className="ml-2 text-xs text-primary animate-pulse">
                    speaking...
                  </span>
                </div>
                <p className="text-foreground">{currentMessage.content}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VapiControls;
