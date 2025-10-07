"use client";
import { useState } from 'react';
import { useAppStore } from '@/hooks/use-app-store';
import { predictTrafficVolume, PredictTrafficVolumeOutput } from '@/ai/flows/predict-traffic-volume';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TrafficPrediction() {
  const { vehicles } = useAppStore();
  const [prediction, setPrediction] = useState<PredictTrafficVolumeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const historicalData = `Recent vehicle activity: ${vehicles
        .slice(-10)
        .map(v => `${v.type} ${v.plate} ${v.status} at ${v.lastUpdated ? new Date(v.lastUpdated).toLocaleTimeString() : 'N/A'}`)
        .join(', ')}.`;
      
      const currentConditions = `Day of week: ${new Date().toLocaleString('en-us', { weekday: 'long' })}, Time: ${new Date().toLocaleTimeString()}. No special events reported.`;
      
      const result = await predictTrafficVolume({ historicalData, currentConditions });
      setPrediction(result);
    } catch (e) {
      setError('Failed to get prediction. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-primary" />
          AI Traffic Prediction
        </CardTitle>
        <CardDescription>
          Predict traffic volume and get suggestions to optimize vehicle flow during peak hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <Button onClick={handlePredict} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Analyzing...' : 'Predict Traffic Volume'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {prediction && (
            <div className="w-full space-y-4 mt-4">
               <Alert>
                 <Zap className="h-4 w-4" />
                 <AlertTitle>Prediction Results</AlertTitle>
                 <AlertDescription className="space-y-2">
                    <div>
                        <p className="font-semibold text-foreground">Predicted Volume:</p>
                        <p>{prediction.predictedVolume}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-foreground">Suggested Adjustments:</p>
                        <p>{prediction.suggestedAdjustments}</p>
                    </div>
                 </AlertDescription>
               </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
