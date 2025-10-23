import { VapiMessage } from '@/types/vapi';
import { useState, useEffect } from 'react';
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
  const [transcript, setTranscript] = useState<string[]>([]);

  useEffect(() => {
    const vapiInstance = new Vapi(VAPI_WEB_TOKEN);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
      toast.success('Interview started');
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      toast.info('Interview ended');
      
      // Call the completion callback with transcript
      if (onInterviewComplete && transcript.length > 0) {
        const formattedTranscript = transcript.map((line, index) => ({
          role: line.startsWith('user:') ? 'user' : 'assistant',
          content: line.replace(/^(user:|assistant:)\s*/, ''),
          timestamp: new Date().toISOString()
        }));
        onInterviewComplete(formattedTranscript);
      }
    });

    vapiInstance.on('message', (message: VapiMessage) => {
      console.log('Message:', message);
      if (message.type === 'transcript' && message.transcript) {
        setTranscript(prev => [...prev, `${message.role}: ${message.transcript}`]);
      }
    });

    vapiInstance.on('error', (error: Error) => {
      console.error('Vapi error:', error);
      toast.error('Interview error occurred');
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const startInterview = async () => {
    if (!vapi) return;
    
    try {
      const questionText = typeof question === 'string' ? question : question?.title || '';
      await vapi.start(VAPI_WORKFLOW_ID, {
        variableValues: {
          questions: questionText,
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
                  onClick={endInterview}
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
            </>
          )}
        </div>
      </Card>

      {transcript.length > 0 && (
        <Card className="p-4 bg-card border-border max-h-[200px] overflow-y-auto">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Transcript</h4>
          <div className="space-y-2">
            {transcript.map((line, index) => (
              <p key={index} className="text-sm text-foreground">
                {line}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VapiControls;
