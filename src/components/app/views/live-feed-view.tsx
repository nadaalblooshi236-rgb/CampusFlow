"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Video, CameraOff, ScanLine, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { identifyLicensePlate } from '@/ai/flows/identify-license-plate';
import { useAppStore } from '@/hooks/use-app-store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function LiveFeedView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const [isAutoScanOn, setIsAutoScanOn] = useState(false);
  const { toast } = useToast();
  const { vehicles, handleEnterGate, handleExitGate } = useAppStore();

  useEffect(() => {
    const getCameraPermission = async () => {
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

  const handleScanPlate = async () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.srcObject) return;

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
            // If car is inside, log an exit
            toast({
                title: 'Vehicle Exiting',
                description: `License Plate ${result.licensePlate} recognized. Recording exit.`,
            });
            handleExitGate(vehicle.id);
          } else {
            // If car is not inside, log an entry
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
        // Do not toast on every failed scan in auto mode to avoid spamming
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
    if (isAutoScanOn && hasCameraPermission && !loading) {
      intervalId = setInterval(() => {
        handleScanPlate();
      }, 5000); // Scan every 5 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoScanOn, hasCameraPermission, loading]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Video />
          Gate Camera Live Feed
        </CardTitle>
        <CardDescription>Real-time video stream from the main entrance gate. Enable automatic scanning to identify license plates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
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
                <Button variant="outline" onClick={() => window.location.reload()}>Refresh Feed</Button>
                 <div className="flex items-center space-x-2">
                    <Switch 
                        id="autoscan-mode" 
                        checked={isAutoScanOn} 
                        onCheckedChange={setIsAutoScanOn}
                        disabled={!hasCameraPermission}
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
