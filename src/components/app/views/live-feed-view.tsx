"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Video, CameraOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LiveFeedView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      // Prevent asking for permission on server or if already determined
      if (typeof window === 'undefined' || hasCameraPermission !== null) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to view the live feed.',
        });
      }
    };

    getCameraPermission();
  }, [hasCameraPermission, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Video />
          Gate Camera Live Feed
        </CardTitle>
        <CardDescription>Real-time video stream from the main entrance gate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          {hasCameraPermission === false && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <CameraOff className="w-16 h-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Camera access is required</p>
             </div>
          )}
           {hasCameraPermission === null && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <p className="text-lg font-medium text-muted-foreground">Connecting to camera...</p>
             </div>
          )}
        </div>

        {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                This feature requires access to a camera. Please enable camera permissions in your browser settings and refresh the page.
              </AlertDescription>
            </Alert>
        )}
         <div className="flex justify-end">
            <Button variant="outline" onClick={() => window.location.reload()}>Refresh Feed</Button>
        </div>
      </CardContent>
    </Card>
  );
}
