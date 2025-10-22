"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Video, CameraOff, ScanLine, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { identifyLicensePlate } from '@/ai/flows/identify-license-plate';
import { useAppStore } from '@/hooks/use-app-store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function LiveFeedView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const [isAutoScanOn, setIsAutoScanOn] = useState(false);
  const { toast } = useToast();
  const { vehicles, handleEnterGate, handleExitGate } = useAppStore();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsStreamActive(true);
          };
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the live feed.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleScanPlate = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) return;

    setLoading(true);
    setIdentifiedPlate(null);

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
        const scannedPlate = result.licensePlate;
        setIdentifiedPlate(scannedPlate);

        const vehicle = vehicles.find(v => v.plate === scannedPlate);
        
        if (vehicle) {
          toast({
              title: 'Vehicle Recognized',
              description: `License Plate ${scannedPlate} belongs to ${vehicle.driver}.`,
          });
          // Logic for entry/exit can be added here
        } else {
             toast({
                variant: 'destructive',
                title: 'Vehicle Not Registered',
                description: `Plate ${scannedPlate} is not registered in the system.`,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoScanOn, isStreamActive, loading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Video />
          Gate Camera Live Feed
        </CardTitle>
        <CardDescription>Using your local webcam for license plate scanning. Please grant camera permission when prompted.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!isStreamActive && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <CameraOff className="w-16 h-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Camera is offline</p>
                {!hasCameraPermission && <p className="text-sm text-muted-foreground">Camera permission was denied. Please enable it in your browser settings.</p>}
             </div>
          )}
        </div>

         <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             {identifiedPlate ? (
                <Alert className="w-full sm:max-w-md">
                    <ScanLine className="h-4 w-4" />
                    <AlertTitle>Last Scanned Plate</AlertTitle>
                    <AlertDescription>
                        <p className="font-bold text-lg text-primary">{identifiedPlate}</p>
                    </AlertDescription>
                </Alert>
            ) : <div className="hidden sm:block"></div>}
            
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
                <Button onClick={handleScanPlate} disabled={!isStreamActive || loading}>
                    {loading && !isAutoScanOn ? <Loader2 className="animate-spin"/> : <ScanLine />}
                    Manual Scan
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
