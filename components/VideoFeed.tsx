import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mic, MicOff } from 'lucide-react';

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1
          }
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }

        // Set up audio level monitoring
        setupAudioMonitoring(stream);

      } catch (error: any) {
        console.error('Error accessing webcam:', error);
        if (error.name === 'NotAllowedError') {
          toast.error('Camera/microphone permission denied. Please allow access and refresh.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera/microphone found. Please check your devices.');
        } else {
          toast.error('Failed to access webcam/microphone');
        }
      }
    };

    const setupAudioMonitoring = (stream: MediaStream) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        microphone.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        
        // Start monitoring audio levels
        monitorAudioLevel();
      } catch (error) {
        console.error('Error setting up audio monitoring:', error);
      }
    };

    const monitorAudioLevel = () => {
      if (!analyserRef.current) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average);
        
        requestAnimationFrame(checkLevel);
      };
      
      checkLevel();
    };

    startVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  return (
    <Card className="bg-card border-border shadow-lg">
      <div className="relative aspect-video bg-muted min-h-[200px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Starting camera...</p>
          </div>
        )}
        {/* Live indicator and audio level */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-xs font-medium text-foreground">Live</span>
            </div>
          </div>
          
          {/* Audio level indicator */}
          <div className="px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full flex items-center gap-1" title={`Audio Level: ${Math.round(audioLevel)}`}>
            <div className={`w-1 h-2 rounded-full transition-colors ${audioLevel > 10 ? 'bg-green-500' : 'bg-gray-400'}`} />
            <div className={`w-1 h-3 rounded-full transition-colors ${audioLevel > 25 ? 'bg-green-500' : 'bg-gray-400'}`} />
            <div className={`w-1 h-4 rounded-full transition-colors ${audioLevel > 50 ? 'bg-yellow-500' : 'bg-gray-400'}`} />
            <div className={`w-1 h-5 rounded-full transition-colors ${audioLevel > 75 ? 'bg-red-500' : 'bg-gray-400'}`} />
          </div>
        </div>

        {/* Mute button */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isMuted 
                ? 'bg-red-500/80 hover:bg-red-500' 
                : 'bg-background/80 hover:bg-background'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default VideoFeed;
