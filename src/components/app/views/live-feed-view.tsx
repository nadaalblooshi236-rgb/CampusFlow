"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, CameraOff, ScanLine, Loader2, Info, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { identifyLicensePlate } from '@/ai/flows/identify-license-plate';
import { useAppStore } from '@/hooks/use-app-store';

export default function LiveFeedView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [streamUrl, setStreamUrl] = useState('');
  const [currentStream, setCurrentStream] = useState('');
  const [streamError, setStreamError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const { toast } = useToast();
  const { vehicles } = useAppStore();

  const handleConnect = () => {
    setStreamError(false);
    setCurrentStream('');
    if (streamUrl) {
      // We set the stream URL after a short delay to allow the UI to update
      setTimeout(() => setCurrentStream(streamUrl), 100);
    }
  };

  const handleScanPlate = async () => {
    if (!imageRef.current || !canvasRef.current || streamError || !currentStream) {
       toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Cannot scan. Please connect to a valid video stream first.',
      });
      return;
    }

    setLoading(true);
    setIdentifiedPlate(null);

    const image = imageRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match the image's displayed size
    canvas.width = image.clientWidth;
    canvas.height = image.clientHeight;
    
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(image, 0, 0, image.clientWidth, image.clientHeight);
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
        } else {
             toast({
                variant: 'destructive',
                title: 'Vehicle Not Registered',
                description: `Plate ${scannedPlate} is not registered in the system.`,
            });
        }
      } catch (error) {
        console.error('Error identifying license plate:', error);
        toast({
            variant: 'destructive',
            title: 'Scan Failed',
            description: 'The AI model could not identify a license plate. Please try again with a clearer view.',
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
        <CardDescription>Connect to your Raspberry Pi camera stream to monitor the gate and scan license plates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
            <Input 
                placeholder="Enter stream URL from ngrok..."
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="flex-grow"
            />
            <Button onClick={handleConnect} disabled={!streamUrl}>Connect</Button>
        </div>

        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          {currentStream && !streamError ? (
             <Image
                ref={imageRef}
                src={currentStream}
                alt="Live camera feed"
                layout="fill"
                objectFit="contain"
                unoptimized // Important for network streams
                crossOrigin="anonymous" // Fix for tainted canvas error
                onError={() => {
                  console.error("Stream failed to load.");
                  setStreamError(true);
                  setCurrentStream('');
                }}
              />
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4">
                <CameraOff className="w-16 h-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Camera is offline</p>
                {streamError && (
                    <Alert variant="destructive" className="mt-4 max-w-md">
                        <AlertTitle>Stream Error</AlertTitle>
                        <AlertDescription>
                            Could not connect to the stream. Please verify the URL and ensure your Raspberry Pi and ngrok tunnel are running correctly.
                        </AlertDescription>
                    </Alert>
                )}
             </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             {identifiedPlate ? (
                <Alert className="w-full sm:max-w-md bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-700" />
                    <AlertTitle className="text-green-800">Last Scanned Plate</AlertTitle>
                    <AlertDescription>
                        <p className="font-bold text-lg text-primary">{identifiedPlate}</p>
                    </AlertDescription>
                </Alert>
            ) : <div className="hidden sm:block"></div>}
            
            <div className="flex items-center gap-4 ml-auto">
                <Button onClick={handleScanPlate} disabled={!currentStream || streamError || loading} className="w-40">
                    {loading ? <Loader2 className="animate-spin"/> : <ScanLine />}
                    {loading ? 'Scanning...' : 'Manual Scan'}
                </Button>
            </div>
        </div>

        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How to Connect Your Pi Camera</AlertTitle>
            <AlertDescription>
                <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                    <li>
                        On your Raspberry Pi, start the camera stream using the command:<br />
                        <code className="bg-muted p-1 rounded-md text-xs">mjpg_streamer -i "input_uvc.so -d /dev/video0" -o "output_http.so -w /usr/local/share/mjpg-streamer/www -p 8081"</code>
                    </li>
                    <li>
                        In a new Pi terminal, start a secure tunnel with ngrok using the corrected command:<br />
                        <code className="bg-muted p-1 rounded-md text-xs">ngrok http 8081 --request-header-add "ngrok-skip-browser-warning:true"</code>
                    </li>
                    <li>
                        Copy the <code className="bg-muted p-1 rounded-md text-xs">https://...</code> URL from ngrok, append <code className="bg-muted p-1 rounded-md text-xs">/?action=stream</code>, and paste it into the input field above.
                    </li>
                </ol>
            </AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  );
}
