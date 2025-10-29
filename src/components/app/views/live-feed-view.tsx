"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Camera, CameraOff, ScanLine, Loader2, Info, CheckCircle, RefreshCw, Wifi } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from '@/hooks/use-app-store';

type CameraSource = 'pi' | 'local';

export default function LiveFeedView() {
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [cameraSource, setCameraSource] = useState<CameraSource>('pi');
  
  // Pi Camera State
  const [streamUrl, setStreamUrl] = useState('');
  const [currentStream, setCurrentStream] = useState('');
  const [streamError, setStreamError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Local Camera State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [localCameras, setLocalCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  // Shared State
  const [scanLoading, setScanLoading] = useState(false);
  const [identifiedPlate, setIdentifiedPlate] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { vehicles, handleEnterGate } = useAppStore();

  const cleanupLocalStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const getLocalCameraStream = useCallback(async (deviceId?: string) => {
    cleanupLocalStream();
    setHasCameraPermission(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [cleanupLocalStream, toast]);

  useEffect(() => {
    if (cameraSource === 'local') {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setLocalCameras(videoDevices);
          if (videoDevices.length > 0) {
            const currentCameraId = selectedCamera || videoDevices[0].deviceId;
            setSelectedCamera(currentCameraId);
            getLocalCameraStream(currentCameraId);
          } else {
            getLocalCameraStream();
          }
        });
    } else {
      cleanupLocalStream();
    }
    // Cleanup on unmount
    return () => cleanupLocalStream();
  }, [cameraSource, getLocalCameraStream, selectedCamera]);


  const handleConnect = () => {
    setLoading(true);
    setStreamError(false);
    setErrorMessage('');
    setCurrentStream('');
    setIdentifiedPlate(null);

    if (streamUrl) {
      const finalUrl = `/api/camera-proxy?url=${encodeURIComponent(streamUrl)}&t=${Date.now()}`;
      setTimeout(() => setCurrentStream(finalUrl), 100);
      toast({
        title: 'Connecting to Camera',
        description: 'Using server proxy to establish connection.',
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
    setScanLoading(true);
    setIdentifiedPlate(null);

    const canvas = document.createElement('canvas');
    let imageElement: HTMLImageElement | HTMLVideoElement | null = null;
    
    if (cameraSource === 'pi') {
      if (!imageRef.current?.src || streamError) {
        toast({ variant: 'destructive', title: 'Scan Failed', description: 'Pi Camera stream is not available.' });
        setScanLoading(false);
        return;
      }
      imageElement = imageRef.current;
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
    } else { // local camera
      if (!videoRef.current || videoRef.current.readyState < 2) {
        toast({ variant: 'destructive', title: 'Scan Failed', description: 'Local camera is not ready.' });
        setScanLoading(false);
        return;
      }
      imageElement = videoRef.current;
      canvas.width = imageElement.videoWidth;
      canvas.height = imageElement.videoHeight;
    }

    const context = canvas.getContext('2d');
    if (!context || !imageElement) {
      toast({ variant: 'destructive', title: 'Scan Failed', description: 'Could not create canvas context.' });
      setScanLoading(false);
      return;
    }

    try {
      context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.95);

      if (!dataUri || dataUri === 'data:,') {
        throw new Error('Failed to capture image from stream.');
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
            description: `License Plate ${scannedPlate} belongs to ${vehicle.driver}. Opening gate...`,
        });
        handleEnterGate(vehicle.id);
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

  const renderPiCameraStatus = () => {
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
  
  const renderLocalCameraStatus = () => {
    if (hasCameraPermission === false) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
          <CameraOff className="w-16 h-16 text-destructive" />
          <p className="mt-4 text-lg font-medium text-destructive">Camera Access Denied</p>
          <p className="text-sm text-muted-foreground">Please grant camera permissions in your browser settings.</p>
        </div>
      );
    }
    if (hasCameraPermission === null) {
      return (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="mt-4 text-lg font-medium text-primary">Accessing Camera...</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2"><Video />Gate Camera Live Feed</CardTitle>
        <CardDescription>Connect to a camera to monitor the gate and scan license plates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <RadioGroup value={cameraSource} onValueChange={(value: CameraSource) => setCameraSource(value)} className="flex gap-4">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="pi" id="pi-cam" />
                <Label htmlFor="pi-cam">Raspberry Pi Camera</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="local-cam" />
                <Label htmlFor="local-cam">Local PC Camera</Label>
            </div>
        </RadioGroup>

        {cameraSource === 'pi' && (
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
                    <li>Run your camera stream on the Raspberry Pi (e.g., `mjpg_streamer ...`).</li>
                    <li>Expose the local port to the internet using `ngrok http ...` to get a public URL.</li>
                    <li>Paste the **full `ngrok` stream URL** (e.g., `https://...ngrok-free.app/?action=stream`) into the input field above.</li>
                </ol>
                </AlertDescription>
            </Alert>
            </div>
        )}

        {cameraSource === 'local' && hasCameraPermission && localCameras.length > 1 && (
            <div className="max-w-xs">
                <Label htmlFor="camera-select">Select Camera</Label>
                <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                    <SelectTrigger id="camera-select">
                        <SelectValue placeholder="Select a camera" />
                    </SelectTrigger>
                    <SelectContent>
                        {localCameras.map(camera => (
                            <SelectItem key={camera.deviceId} value={camera.deviceId}>
                                {camera.label || `Camera ${localCameras.indexOf(camera) + 1}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}

        <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden relative border">
          {cameraSource === 'pi' ? (
            <>
              {currentStream && !streamError && (
                <img
                    ref={imageRef}
                    src={currentStream}
                    alt="Live camera feed"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous" // Required for canvas operations with a proxy
                    onLoad={() => { setLoading(false); setStreamError(false); }}
                    onError={(e) => {
                      console.error("Stream failed to load:", e);
                      setLoading(false);
                      setStreamError(true);
                      setErrorMessage('Failed to load camera stream. Check the URL and ensure the camera is running and accessible from the server.');
                      setCurrentStream('');
                    }}
                />
              )}
              {renderPiCameraStatus()}
            </>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
              {renderLocalCameraStatus()}
            </>
          )}
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
                <Button onClick={handleScanPlate} disabled={scanLoading || (cameraSource === 'pi' && (!currentStream || streamError || loading)) || (cameraSource === 'local' && !hasCameraPermission) } className="w-40">
                    {scanLoading ? <Loader2 className="animate-spin"/> : <ScanLine />}
                    {scanLoading ? 'Scanning...' : 'Manual Scan'}
                </Button>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
