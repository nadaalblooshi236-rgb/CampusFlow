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
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const [isAutoScanOn, setIsAutoScanOn] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [connectedUrl, setConnectedUrl] = useState('');
  const { toast } = useToast();
  const { vehicles, handleEnterGate, handleExitGate } = useAppStore();
  
  const connectStream = () => {
    if (!streamUrl) {
      toast({
        variant: 'destructive',
        title: 'No URL',
        description: 'Please enter a stream URL.',
      });
      return;
    }

    setIsStreamActive(false);
    setConnectedUrl(streamUrl);
    
    // For the visual feed, we use an <img> tag which is more reliable for MJPEG
    if (imageRef.current) {
        imageRef.current.src = streamUrl;
    }

    // For capturing, we still need a video element, but it can be hidden
    if (videoRef.current) {
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch(e => {
        console.error("Error playing video for capture:", e);
        // We don't toast here because the user sees the img feed
      });
    }
  };
  
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleLoad = () => setIsStreamActive(true);
    const handleError = () => {
      setIsStreamActive(false);
      if (connectedUrl) { // Only show error if a connection was attempted
        toast({
          variant: 'destructive',
          title: 'Stream Error',
          description: 'Could not connect. Check URL, network, and CORS policy on the stream.',
        });
      }
    };

    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);

    return () => {
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
    };
  }, [connectedUrl, toast]);


  const handleScanPlate = async () => {
    // We now capture from the <img> tag, not the <video> tag
    if (!imageRef.current || !canvasRef.current || !isStreamActive) return;

    setLoading(true);

    const img = imageRef.current;
    const canvas = canvasRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      try {
        const result = await identifyLicensePlate({ photoDataUri: dataUri });
        const scannedPlate = result.licensePlate;
        setIdentifiedPlate(scannedPlate);

        const vehicle = vehicles.find(v => v.plate === scannedPlate);
        
        if (vehicle) {
          if (vehicle.status === 'inside') {
             toast({
                title: 'Vehicle Exiting',
                description: `License Plate ${scannedPlate} recognized. Recording exit.`,
            });
            handleExitGate(vehicle.id);
          } else {
             toast({
                title: 'Vehicle Entering',
                description: `License Plate ${scannedPlate} recognized. Opening gate.`,
            });
            handleEnterGate(vehicle.id);
          }
        } else {
             toast({
                variant: 'destructive',
                title: 'Vehicle Not Registered',
                description: `Plate ${scannedPlate} is not registered in the system.`,
            });
        }
      } catch (error) {
        console.error('Error identifying license plate:', error);
         if (!isAutoScanOn) { // Only show error toast on manual scan
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
        <CardDescription>Enter the network URL of your Raspberry Pi camera stream to begin monitoring and license plate scanning.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="e.g., http://192.168.1.123:8081/?action=stream"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
            />
            <Button onClick={connectStream}>Connect</Button>
        </div>

        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          {/* Display stream in an img tag, which is more robust for MJPEG */}
          <img ref={imageRef} className="w-full h-full object-contain" crossOrigin="anonymous" alt="Live Stream" />
          
          {/* Hidden video and canvas for capturing frames */}
          <video ref={videoRef} className="hidden" muted playsInline crossOrigin="anonymous"/>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!isStreamActive && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <CameraOff className="w-16 h-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Camera stream is offline</p>
                <p className="text-sm text-muted-foreground">Enter a stream URL and press Connect.</p>
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
