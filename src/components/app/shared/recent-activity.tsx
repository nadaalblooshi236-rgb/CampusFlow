"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function RecentActivity() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {notifications.slice(0, 10).map((note) => (
              <div key={note.id} className="flex items-start space-x-3 p-3 bg-secondary rounded-lg">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getIconColor(note.type))}></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{note.message}</p>
                  <p className="text-xs text-muted-foreground">{note.time}</p>
                </div>
              </div>
            ))}
             {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No recent activity.</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
