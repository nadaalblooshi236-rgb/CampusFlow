"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, CameraOff, ScanLine, Loader2, Info, CheckCircle, RefreshCw, Wifi } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from '@/hooks/use-app-store';

export default function LiveFeedView() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [currentStream, setCurrentStream] = useState('');
  const [streamError, setStreamError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();
  const { vehicles } = useAppStore();

  useEffect(() => {
    if (!currentStream || !autoRefresh || streamError || loading) return;

    const interval = setInterval(() => {
      if (imageRef.current) {
        // The proxy handles caching, but a timestamp helps ensure the latest frame in some cases
        const finalUrl = `/api/camera-proxy?url=${encodeURIComponent(streamUrl)}&t=${Date.now()}`;
        imageRef.current.src = finalUrl;
      }
    }, 250); // Refresh every 250ms

    return () => clearInterval(interval);
  }, [currentStream, autoRefresh, streamError, streamUrl, loading]);

  const handleConnect = () => {
    setLoading(true);
    setStreamError(false);
    setErrorMessage('');
    setCurrentStream('');
    setIdentifiedPlate(null);

    if (streamUrl) {
      // Use the server-side proxy to fetch the stream
      const finalUrl = `/api/camera-proxy?url=${encodeURIComponent(streamUrl)}&t=${Date.now()}`;
      
      // We set the stream URL after a short delay to let the UI update
      setTimeout(() => setCurrentStream(finalUrl), 100);

      toast({
        title: 'Connecting to Camera',
        description: 'Using server proxy to establish a secure connection.',
      });
    } else {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'URL Required',
        description: 'Please enter a camera stream URL.',
      });
    }
  };

  const handleScanPlate = async () => {
    if (!imageRef.current?.src || streamError) {
       toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Cannot scan. The video stream is not available or has an error.',
      });
      return;
    }

    setScanLoading(true);
    setIdentifiedPlate(null);

    const canvas = document.createElement('canvas');
    const image = imageRef.current;
    
    if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        toast({ variant: 'destructive', title: 'Scan Failed', description: 'Image data is not available. Ensure the stream is active.' });
        setScanLoading(false);
        return;
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      toast({ variant: 'destructive', title: 'Scan Failed', description: 'Could not create canvas context.' });
      setScanLoading(false);
      return;
    }

    try {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.95);

      if (!dataUri || dataUri === 'data:,') {
        throw new Error('Failed to capture image from stream. The stream might be empty.');
      }

      toast({ title: 'Scanning...', description: 'AI is analyzing the license plate...' });

      const response = await fetch('/api/identify-plate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUri: dataUri }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to identify license plate');
      }

      const result = await response.json();
      const scannedPlate = result.licensePlate;

      if (!scannedPlate) {
        throw new Error('No license plate was detected in the image.');
      }

      setIdentifiedPlate(scannedPlate);
      const vehicle = vehicles.find(v => v.plate === scannedPlate);

      if (vehicle) {
        toast({
            title: 'Vehicle Recognized ✅',
            description: `License Plate ${scannedPlate} belongs to ${vehicle.driver}.`,
        });
      } else {
          toast({
              variant: 'destructive',
              title: 'Vehicle Not Registered',
              description: `Plate ${scannedPlate} is not registered in the system.`,
          });
      }
    } catch (error: any) {
      console.error('Error during plate identification:', error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message || 'An unknown error occurred during the scan.',
      });
    } finally {
      setScanLoading(false);
    }
  };

  const getStatusOverlay = () => {
    if (loading) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="mt-4 text-lg font-medium text-primary">Connecting...</p>
        </div>
      );
    }
    if (streamError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
            <CameraOff className="w-16 h-16 text-destructive" />
            <p className="mt-4 text-lg font-medium text-destructive">Connection Failed</p>
            {errorMessage && (
                <Alert variant="destructive" className="mt-4 max-w-md">
                    <AlertTitle>Stream Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}
        </div>
      );
    }
     if (!currentStream) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50 p-4 text-center">
          <Wifi className="w-16 h-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Camera is Offline</p>
          <p className="text-sm text-muted-foreground">Enter a valid stream URL and click Connect.</p>
        </div>
      );
    }
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2"><Video />Gate Camera Live Feed</CardTitle>
        <CardDescription>Connect to your Raspberry Pi camera to monitor the gate and scan license plates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
                placeholder="Enter ngrok or other public stream URL"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="flex-grow"
            />
            <div className="flex gap-2">
              <Button onClick={handleConnect} disabled={!streamUrl || loading}>Connect</Button>
              <Button onClick={handleConnect} disabled={!currentStream || loading || scanLoading} variant="outline" size="icon" title="Refresh stream">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Connection Instructions</AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>Run your camera stream on the Raspberry Pi (e.g., `mjpg_streamer ... -p 8081`).</li>
                <li>Expose the local port to the internet using `ngrok http 8081 ...` to get a public `https://...` URL.</li>
                <li>Paste the **full `ngrok` stream URL** (e.g., `https://...ngrok-free.app/?action=stream`) into the input field above and click Connect.</li>
                <li>A local IP address (like 192.168...) will not work. The server proxy requires a public URL.</li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>

        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          {currentStream && !streamError && (
             <img
                ref={imageRef}
                src={currentStream}
                alt="Live camera feed"
                className="w-full h-full object-contain"
                crossOrigin="anonymous" // Required for canvas operations with a proxy
                onLoad={() => {
                  setLoading(false);
                  setStreamError(false);
                }}
                onError={(e) => {
                  console.error("Stream failed to load:", e);
                  setLoading(false);
                  setStreamError(true);
                  setErrorMessage('Failed to load camera stream. Check the URL and ensure the camera is running and accessible from the server.');
                  setCurrentStream('');
                }}
              />
          )}
          {getStatusOverlay()}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             {identifiedPlate ? (
                <Alert className="w-full sm:max-w-md bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-700" />
                    <AlertTitle className="text-green-800">Last Scanned Plate</AlertTitle>
                    <AlertDescription><p className="font-bold text-lg text-primary">{identifiedPlate}</p></AlertDescription>
                </Alert>
            ) : <div className="hidden sm:block"></div>}
            
            <div className="flex items-center gap-4 ml-auto">
                <Button onClick={handleScanPlate} disabled={!currentStream || streamError || loading || scanLoading} className="w-40">
                    {scanLoading ? <Loader2 className="animate-spin"/> : <ScanLine />}
                    {scanLoading ? 'Scanning...' : 'Manual Scan'}
                </Button>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
