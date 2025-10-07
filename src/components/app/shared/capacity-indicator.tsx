"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

export default function CapacityIndicator() {
  const { currentCapacity, maxCapacity } = useAppStore();
  const percentage = (currentCapacity / maxCapacity) * 100;

  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getStatusText = () => {
    if (currentCapacity >= maxCapacity) return 'Capacity full - gate closed';
    if (currentCapacity >= maxCapacity * 0.8) return 'Capacity nearly full';
    return 'Capacity available';
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Campus Capacity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Current / Max</span>
          <span className="text-sm font-medium">{currentCapacity} / {maxCapacity}</span>
        </div>
        <Progress value={percentage} indicatorClassName={getProgressColor()} />
        <p className="text-xs text-muted-foreground mt-2">
          {getStatusText()}
        </p>
        
        {currentCapacity >= maxCapacity * 0.8 && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700 font-medium">High Traffic Alert</p>
                <p className="text-xs text-red-600">The pickup area is busy. Please expect delays.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
