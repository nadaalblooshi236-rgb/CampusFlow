"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Video, CameraOff, ScanLine, Loader2, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from '@/hooks/use-app-store';

export default function LiveFeedView() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [streamUrl, setStreamUrl] = useState('http://172.20.10.3:8081/?action=stream');
  const [currentStream, setCurrentStream] = useState('');
  const [streamError, setStreamError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();
  const { vehicles } = useAppStore();

  // Auto-refresh stream only for proxy mode (MJPEG streams don't need refresh in direct mode)
  useEffect(() => {
    if (!currentStream || !autoRefresh || streamError || !useProxy) return;

    const interval = setInterval(() => {
      if (imageRef.current && streamUrl) {
        const finalUrl = `/api/camera-proxy?url=${encodeURIComponent(streamUrl)}&t=${Date.now()}`;
        imageRef.current.src = finalUrl;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStream, autoRefresh, streamError, streamUrl, useProxy]);

  const testConnection = async () => {
    if (!streamUrl) return;

    setLoading(true);
    try {
      const response = await fetch(streamUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      toast({
        title: 'Testing Connection',
        description: 'Attempting to connect to camera...',
      });
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    setStreamError(false);
    setErrorMessage('');
    setCurrentStream('');
    if (streamUrl) {
      // Use proxy for CORS bypass
      const finalUrl = useProxy
        ? `/api/camera-proxy?url=${encodeURIComponent(streamUrl)}&t=${Date.now()}`
        : streamUrl;

      // Add a small delay to force re-requesting the image
      setTimeout(() => setCurrentStream(finalUrl), 100);

      toast({
        title: 'Connecting to Camera',
        description: useProxy ? 'Using proxy to bypass CORS restrictions' : 'Direct connection',
      });
    }
  };

  const handleScanPlate = async () => {
    if (!imageRef.current) {
       toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Cannot scan. Video stream is not available.',
      });
      return;
    }

    setLoading(true);
    setIdentifiedPlate(null);

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.clientWidth;
    canvas.height = image.naturalHeight || image.clientHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Could not create canvas context.',
      });
      setLoading(false);
      return;
    }

    try {
      // Draw the image to canvas
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.95);

      // Validate data URI
      if (!dataUri || dataUri === 'data:,') {
        throw new Error('Failed to capture image from stream');
      }

      toast({
        title: 'Scanning...',
        description: 'AI is analyzing the license plate...',
      });

      // Call the API route
      const response = await fetch('/api/identify-plate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoDataUri: dataUri }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to identify license plate');
      }

      const result = await response.json();
      const scannedPlate = result.licensePlate;

      if (!scannedPlate) {
        throw new Error('No license plate detected in the image');
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
      console.error('Error identifying license plate:', error);

      // Check if it's a CORS/tainted canvas error
      if (error.name === 'SecurityError' || error.message?.includes('tainted') || error.message?.includes('cross-origin')) {
        toast({
          variant: 'destructive',
          title: 'CORS Error',
          description: 'Cannot scan due to browser security. Enable "Use server proxy" mode and try again.',
        });
      } else if (error.message?.includes('Failed to capture')) {
        toast({
          variant: 'destructive',
          title: 'Capture Failed',
          description: 'Could not capture image from stream. Ensure the camera is connected and streaming.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Scan Failed',
          description: error.message || 'The AI model could not identify a license plate. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
                placeholder="Enter stream URL (e.g., http://172.20.10.3:8081/?action=stream)"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="flex-grow"
            />
            <div className="flex gap-2">
              <Button onClick={handleConnect} disabled={!streamUrl}>Connect</Button>
              <Button
                onClick={handleConnect}
                disabled={!currentStream}
                variant="outline"
                size="icon"
                title="Refresh stream"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="proxy-mode"
              checked={useProxy}
              onCheckedChange={setUseProxy}
            />
            <Label htmlFor="proxy-mode" className="text-sm text-muted-foreground">
              Use server proxy (only if camera is accessible from server network)
            </Label>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Connection & Scanning Tips</AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <div>
                <p><strong>Direct mode:</strong> Browser connects directly to camera. Faster for viewing.</p>
                <p className="text-muted-foreground text-[10px]">⚠️ License plate scanning may fail due to CORS restrictions</p>
              </div>
              <div>
                <p><strong>Proxy mode (recommended for scanning):</strong> Server fetches camera stream.</p>
                <p className="text-muted-foreground text-[10px]">✅ Enables license plate scanning by adding CORS headers</p>
              </div>
              <p className="mt-2 text-amber-600 dark:text-amber-400 font-semibold">
                💡 If scanning fails, enable "Use server proxy" and reconnect
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          {currentStream && !streamError ? (
             <img
                ref={imageRef}
                src={currentStream}
                alt="Live camera feed"
                className="w-full h-full object-contain"
                crossOrigin={useProxy ? "anonymous" : undefined}
                onError={(e) => {
                  console.error("Stream failed to load:", e);
                  setStreamError(true);
                  setErrorMessage('Failed to load camera stream. Check if the camera is accessible at the provided URL.');
                  setCurrentStream('');
                }}
                onLoad={() => {
                  console.log("Stream loaded successfully");
                  setStreamError(false);
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
                            {errorMessage || 'Could not connect to the stream. Please verify the URL and ensure your camera is accessible.'}
                            <div className="mt-3 text-xs space-y-2">
                              <p className="font-semibold">Troubleshooting Steps:</p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>
                                  <strong>Test camera directly:</strong> Open{' '}
                                  <a
                                    href={streamUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-400 hover:text-blue-300"
                                  >
                                    {streamUrl}
                                  </a>
                                  {' '}in a new browser tab
                                </li>
                                <li>If camera loads in browser, disable "Use server proxy" and try again</li>
                                <li>Check if your computer is on network: 172.20.10.x</li>
                                <li>Verify camera device is powered on and connected</li>
                                <li>Check firewall/antivirus isn't blocking port 8081</li>
                                <li>Try using ngrok HTTPS URL if available</li>
                              </ol>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
             </div>
          )}
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
