"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";

export default function ParentDashboard() {
  const { currentUser, currentCapacity, maxCapacity, setActiveTab, notifications } = useAppStore();

  const getStatusText = () => {
    if (currentCapacity >= maxCapacity * 0.8) return 'Very Busy';
    if (currentCapacity >= maxCapacity * 0.6) return 'Busy';
    return 'Normal';
  };

  const getStatusColor = () => {
    if (currentCapacity >= maxCapacity * 0.8) return 'text-red-600';
    if (currentCapacity >= maxCapacity * 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const getIconColor = (type: string) => {
    switch (type) {
      case 'entry': return 'bg-ats-green';
      case 'exit': return 'bg-ats-blue';
      case 'approval': return 'bg-green-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Welcome, {currentUser.name}</CardTitle>
              <CardDescription>Parent of: Emma Smith</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Status</p>
              <p className={`font-medium ${getStatusColor()}`}>{getStatusText()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentCapacity >= maxCapacity * 0.8 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-700 font-medium">High Traffic Alert</p>
                  <p className="text-sm text-red-600">The pickup area is very busy. Please expect delays.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Submit Pickup Request</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 mb-4">Need to pick up your child early? Submit a request here.</p>
                <Button onClick={() => setActiveTab('requests')} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Bell className="mr-2 h-4 w-4" /> Submit Request
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
               <CardHeader>
                <CardTitle className="text-lg text-green-800">Check-in Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-4">Your child is currently on campus and safe.</p>
                <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
                    <CheckCircle2 /> ON CAMPUS
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-secondary">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((note) => (
                  <div key={note.id} className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getIconColor(note.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{note.message}</p>
                      <p className="text-xs text-muted-foreground">{note.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
