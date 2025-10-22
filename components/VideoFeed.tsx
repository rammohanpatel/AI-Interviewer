import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        toast.error('Failed to access webcam');
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden bg-card border-border shadow-lg">
      <div className="relative aspect-video bg-muted">
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
        <div className="absolute bottom-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-xs font-medium text-foreground">Live</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoFeed;
