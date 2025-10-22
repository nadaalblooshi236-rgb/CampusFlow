"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff, Loader } from "lucide-react";

export default function HardwareStatus() {
  const { mqttStatus } = useAppStore();

  const getStatusInfo = () => {
    switch (mqttStatus) {
      case "connected":
        return {
          icon: <Wifi className="w-6 h-6 text-green-500" />,
          text: "Hardware Connected",
          textColor: "text-green-600",
          description: "Receiving signals from Raspberry Pi.",
        };
      case "disconnected":
        return {
          icon: <WifiOff className="w-6 h-6 text-red-500" />,
          text: "Hardware Disconnected",
          textColor: "text-red-600",
          description: "Check Pi script and network.",
        };
      case "connecting":
        return {
          icon: <Loader className="w-6 h-6 text-yellow-500 animate-spin" />,
          text: "Connecting...",
          textColor: "text-yellow-600",
          description: "Attempting to reach controller.",
        };
      case "error":
        return {
          icon: <WifiOff className="w-6 h-6 text-red-500" />,
          text: "Connection Error",
          textColor: "text-red-600",
          description: "Could not connect to MQTT broker.",
        };
      default:
        return {
          icon: <WifiOff className="w-6 h-6 text-gray-500" />,
          text: "Unknown Status",
          textColor: "text-gray-500",
          description: "The hardware state is unknown.",
        };
    }
  };
  
  const { icon, text, textColor, description } = getStatusInfo();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Hardware Control</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {icon}
          <div>
            <p className={`font-semibold ${textColor}`}>{text}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
