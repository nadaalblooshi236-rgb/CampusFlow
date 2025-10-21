"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Video, CameraOff, ScanLine, Loader2, Link } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { identifyLicensePlate } from '@/ai/flows/identify-license-plate';
import { useAppStore } from '@/hooks/use-app-store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function LiveFeedView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const [isAutoScanOn, setIsAutoScanOn] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const { toast } = useToast();
  const { vehicles, handleEnterGate, handleExitGate } = useAppStore();
  
  const connectStream = () => {
    if (videoRef.current && streamUrl) {
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch(e => {
        console.error("Error playing stream:", e);
        toast({
          variant: 'destructive',
          title: 'Stream Error',
          description: 'Could not connect to the video stream. Check the URL and network.',
        });
        setIsStreamActive(false);
      });
    }
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
        const handlePlaying = () => setIsStreamActive(true);
        const handleError = () => {
            setIsStreamActive(false);
             toast({
                variant: 'destructive',
                title: 'Stream Failed',
                description: 'The video stream could not be loaded. Ensure the URL is correct and the stream is active.',
            });
        };

        video.addEventListener('playing', handlePlaying);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('error', handleError);
        };
    }
  }, [streamUrl, toast]);


  const handleScanPlate = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) return;

    setLoading(true);
    // Don't reset identified plate here to keep showing the last scanned one

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      try {
        const result = await identifyLicensePlate({ photoDataUri: dataUri });
        setIdentifiedPlate(result.licensePlate);

        const vehicle = vehicles.find(v => v.plate === result.licensePlate);
        
        if (vehicle) {
          if (vehicle.status === 'inside') {
            toast({
                title: 'Vehicle Exiting',
                description: `License Plate ${result.licensePlate} recognized. Recording exit.`,
            });
            handleExitGate(vehicle.id);
          } else {
            toast({
                title: 'Vehicle Entering',
                description: `License Plate ${result.licensePlate} recognized. Opening gate.`,
            });
            handleEnterGate(vehicle.id);
          }
        } else {
             toast({
                variant: 'destructive',
                title: 'Vehicle Not Registered',
                description: `Plate ${result.licensePlate} is not registered in the system.`,
            });
        }
      } catch (error) {
        console.error('Error identifying license plate:', error);
        if (!isAutoScanOn) {
            toast({
            variant: 'destructive',
            title: 'Scan Failed',
            description: 'Could not identify a license plate. Please try again.',
            });
        }
      }
    }
    setLoading(false);
  };
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isAutoScanOn && isStreamActive && !loading) {
      intervalId = setInterval(() => {
        handleScanPlate();
      }, 5000); // Scan every 5 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoScanOn, isStreamActive, loading]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Video />
          Gate Camera Live Feed
        </CardTitle>
        <CardDescription>Enter the network URL of your Raspberry Pi camera stream to begin monitoring and license plate scanning.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="e.g., http://192.168.1.100:8081"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
            />
            <Button onClick={connectStream}>Connect</Button>
        </div>

        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline crossOrigin="anonymous"/>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {!isStreamActive && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <CameraOff className="w-16 h-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Camera stream is offline</p>
                <p className="text-sm text-muted-foreground">Enter a stream URL and press Connect.</p>
             </div>
          )}
        </div>

         <div className="flex justify-between items-center">
             {identifiedPlate && (
                <Alert className="max-w-md">
                    <ScanLine className="h-4 w-4" />
                    <AlertTitle>Last Scanned Plate</AlertTitle>
                    <AlertDescription>
                        <p className="font-bold text-lg text-primary">{identifiedPlate}</p>
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex items-center gap-4 ml-auto">
                 <div className="flex items-center space-x-2">
                    <Switch 
                        id="autoscan-mode" 
                        checked={isAutoScanOn} 
                        onCheckedChange={setIsAutoScanOn}
                        disabled={!isStreamActive}
                    />
                    <Label htmlFor="autoscan-mode" className="flex flex-col">
                        <span>Automatic Scanning</span>
                        {loading && isAutoScanOn && <span className="text-xs text-primary animate-pulse">Scanning...</span>}
                    </Label>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    