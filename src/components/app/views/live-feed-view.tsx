"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Video, CameraOff, ScanLine, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { identifyLicensePlate } from '@/ai/flows/identify-license-plate';
import { useAppStore } from '@/hooks/use-app-store';

export default function LiveFeedView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const { toast } = useToast();
  const { vehicles, handleEnterGate, requests } = useAppStore();

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
    if (!videoRef.current || !canvasRef.current) return;

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
        setIdentifiedPlate(result.licensePlate);

        // Check if the plate is valid and approved
        const vehicle = vehicles.find(v => v.plate === result.licensePlate);
        const request = requests.find(r => r.plate === result.licensePlate && r.status === 'approved');

        if (vehicle && request) {
            toast({
                title: 'Vehicle Approved',
                description: `License Plate ${result.licensePlate} recognized. Opening gate.`,
            });
            handleEnterGate(vehicle.id);
        } else if (vehicle) {
            toast({
                variant: 'destructive',
                title: 'Vehicle Not Approved',
                description: `Plate ${result.licensePlate} recognized, but has no approved request.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Vehicle Not Registered',
                description: `Plate ${result.licensePlate} is not registered in the system.`,
            });
        }
      } catch (error) {
        console.error('Error identifying license plate:', error);
        toast({
          variant: 'destructive',
          title: 'Scan Failed',
          description: 'Could not identify a license plate. Please try again.',
        });
      }
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Video />
          Gate Camera Live Feed
        </CardTitle>
        <CardDescription>Real-time video stream from the main entrance gate. Use the scan button to identify license plates.</CardDescription>
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
                    <AlertTitle>Plate Identified!</AlertTitle>
                    <AlertDescription>
                        <p>Scanned License Plate: <span className="font-bold text-lg text-primary">{identifiedPlate}</span></p>
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => window.location.reload()}>Refresh Feed</Button>
                <Button onClick={handleScanPlate} disabled={loading || !hasCameraPermission} className="bg-ats-green hover:bg-green-700">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                    {loading ? 'Scanning...' : 'Scan License Plate'}
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
