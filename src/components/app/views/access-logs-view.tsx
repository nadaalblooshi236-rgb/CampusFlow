"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function AccessLogsView() {
  const { notifications } = useAppStore();

  const getIconColor = (type: string) => {
    switch (type) {
      case 'entry': return 'bg-ats-green';
      case 'exit': return 'bg-ats-blue';
      case 'approval': return 'bg-green-500';
      case 'denial': return 'bg-red-500';
      case 'request': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'exit': return 'bg-blue-100 text-blue-800';
      case 'approval': return 'bg-green-100 text-green-800';
      case 'denial': return 'bg-red-100 text-red-800';
      case 'request': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Comprehensive Access Logs</CardTitle>
        <CardDescription>A complete, reverse-chronological log of all system activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] border rounded-lg p-2">
            <div className="space-y-2">
            {[...notifications].reverse().map((log) => (
                <div key={log.id} className="flex items-center space-x-4 p-3 bg-secondary rounded-md">
                <div className={cn("w-3 h-3 rounded-full flex-shrink-0", getIconColor(log.type))}></div>
                <div className="flex-1">
                    <p className="text-foreground text-sm">{log.message}</p>
                    <p className="text-sm text-muted-foreground">{log.time}</p>
                </div>
                <Badge variant="outline" className={getTypeBadge(log.type)}>
                    {log.type}
                </Badge>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
