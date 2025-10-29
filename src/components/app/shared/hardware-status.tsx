"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Loader, Zap } from "lucide-react";

export default function HardwareStatus() {
  const { mqttStatus, testGate, mqttBrokerUrl } = useAppStore();

  const getStatusInfo = () => {
    switch (mqttStatus) {
      case "connected":
        return {
          icon: <Wifi className="w-8 h-8 text-green-500" />,
          text: "Hardware Connected",
          textColor: "text-green-600",
          description: "Receiving real-time signals from the Raspberry Pi controller.",
        };
      case "disconnected":
        return {
          icon: <WifiOff className="w-8 h-8 text-red-500" />,
          text: "Hardware Disconnected",
          textColor: "text-red-600",
          description: "Not connected. Check Pi script, network, and MQTT broker status.",
        };
      case "connecting":
        return {
          icon: <Loader className="w-8 h-8 text-yellow-500 animate-spin" />,
          text: "Connecting to Hardware...",
          textColor: "text-yellow-600",
          description: "Attempting to establish a connection with the controller.",
        };
      case "error":
        return {
          icon: <WifiOff className="w-8 h-8 text-red-500" />,
          text: "Connection Error",
          textColor: "text-red-600",
          description: "Could not connect. Verify broker URL and internet connection.",
        };
      default:
        return {
          icon: <WifiOff className="w-8 h-8 text-gray-500" />,
          text: "Unknown Status",
          textColor: "text-gray-500",
          description: "The hardware connection state is currently unknown.",
        };
    }
  };
  
  const { icon, text, textColor, description } = getStatusInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hardware Control Status</CardTitle>
        <CardDescription>Real-time status of the connection to the gate controller.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-6">
          {icon}
          <div>
            <p className={`text-xl font-bold ${textColor}`}>{text}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">Broker: {mqttBrokerUrl}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1 bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="text-primary"/> Manual Gate Test
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Use these buttons to test the servo connection directly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                     <Button 
                        onClick={() => testGate('open')} 
                        disabled={mqttStatus !== 'connected'}
                        className="bg-green-500 hover:bg-green-600 text-white"
                     >
                        Test Open (90°)
                    </Button>
                    <Button 
                        onClick={() => testGate('close')} 
                        disabled={mqttStatus !== 'connected'}
                        variant="destructive"
                    >
                        Test Close (0°)
                    </Button>
                </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}
