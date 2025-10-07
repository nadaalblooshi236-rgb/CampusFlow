"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CapacityIndicator from "./capacity-indicator";

const GateLight = ({ status }: { status: 'open' | 'closed' }) => (
  <div className="flex flex-col items-center space-y-2">
    <div className="relative">
      <div className={`w-16 h-16 rounded-full ${status === 'open' ? 'bg-green-500' : 'bg-red-500'} shadow-lg transition-all duration-300 transform ${status === 'open' ? 'scale-105' : ''}`}>
        <div className={`absolute inset-0 rounded-full ${status === 'open' ? 'shadow-green-500/50' : 'shadow-red-500/50'} shadow-lg blur-sm animate-pulse`}></div>
      </div>
    </div>
    <span className={`text-sm font-medium ${status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
      {status.toUpperCase()}
    </span>
  </div>
);

export default function GateStatus() {
  const { gateStatus } = useAppStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatic Gate Control System</CardTitle>
        <CardDescription>Real-time status of the main campus gate.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-8">
              <GateLight status={gateStatus} />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Gate Status</h3>
                <p className="text-muted-foreground">Current: <span className={`font-medium ${gateStatus === 'open' ? 'text-green-600' : 'text-red-600'}`}>{gateStatus.toUpperCase()}</span></p>
                <p className="text-muted-foreground text-sm">Last operation: Real-time monitoring</p>
              </div>
            </div>
          <div className="w-full md:w-64">
             <CapacityIndicator />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
