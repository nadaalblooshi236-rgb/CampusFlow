"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Video, CameraOff, ScanLine, Loader2, Link, ShieldAlert } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { identifyLicensePlate } from '@/ai/flows/identify-license-plate';
import { useAppStore } from '@/hooks/use-app-store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function LiveFeedView() {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const [isAutoScanOn, setIsAutoScanOn] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [connectedUrl, setConnectedUrl] = useState('');
  const [streamError, setStreamError] = useState<string | null>(null);
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

    setStreamError(null);
    setIsStreamActive(false);
    
    // Append the stream action if it's not already there for mjpg-streamer URLs
    let finalUrl = streamUrl;
    if (streamUrl.includes('ngrok') && !streamUrl.endsWith('?action=stream')) {
        finalUrl = streamUrl.endsWith('/') ? `${streamUrl}?action=stream` : `${streamUrl}/?action=stream`;
    }
    
    setConnectedUrl(finalUrl);
  };
  
  useEffect(() => {
    const image = imageRef.current;
    if (!image || !connectedUrl) return;

    const handleLoad = () => {
      setIsStreamActive(true);
      setStreamError(null);
    };

    const handleError = () => {
      setIsStreamActive(false);
      if (connectedUrl) {
         if (connectedUrl.includes('ngrok')) {
            setStreamError("ngrok's free plan shows a warning page before the stream. To bypass it, you must add a special header when starting ngrok. Stop your current ngrok process (Ctrl+C) and run this exact command on your Pi: ngrok http 8081 --request-header-add \"ngrok-skip-browser-warning:true\"");
        } else if (connectedUrl.startsWith('http://192.168') || connectedUrl.startsWith('http://10.') || connectedUrl.startsWith('http://172.')) {
          setStreamError("A direct connection to a local IP address from a secure website is often blocked by browser security. You must use a secure tunnel like ngrok.");
        } else {
          setStreamError('Could not connect. Check URL, network, and ensure the streamer is running with CORS enabled.');
        }
      }
    };

    image.src = connectedUrl;
    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);

    return () => {
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
      image.src = ""; // Clean up src
    };
  }, [connectedUrl]);


  const handleScanPlate = async () => {
    if (!imageRef.current || !canvasRef.current || !isStreamActive) return;

    setLoading(true);
    setIdentifiedPlate(null);

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
        <CardDescription>Enter the network URL of your camera stream to begin monitoring and license plate scanning.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="e.g., https://unique-id.ngrok-free.app"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
            />
            <Button onClick={connectStream}>Connect</Button>
        </div>
        
        {streamError && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Stream Connection Error</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{streamError}</p>
              <a href="https://ngrok.com/docs/guides/bypassing-browser-warning-with-a-custom-header/" target="_blank" rel="noopener noreferrer" className="underline text-sm font-medium mt-2 inline-block">
                Click here to learn more about this `ngrok` feature.
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          <img ref={imageRef} className="w-full h-full object-contain" crossOrigin="anonymous" alt={isStreamActive ? "Live Stream" : "Stream offline"} />
          
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
