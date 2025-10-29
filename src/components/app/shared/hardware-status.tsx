"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, WifiOff, Loader } from "lucide-react";

export default function HardwareStatus() {
  const { mqttStatus } = useAppStore();

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
      <CardContent>
        <div className="flex items-center space-x-6">
          {icon}
          <div>
            <p className={`text-xl font-bold ${textColor}`}>{text}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
