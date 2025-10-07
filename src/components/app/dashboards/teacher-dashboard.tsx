"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Car } from "lucide-react";

export default function TeacherDashboard() {
  const { setActiveTab } = useAppStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Teacher Dashboard</CardTitle>
        <CardDescription>Monitor student attendance and departures.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Student Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-4">Monitor daily attendance and check-in times for your class.</p>
              <Button onClick={() => setActiveTab('attendance')} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Clock className="mr-2 h-4 w-4" /> View Attendance
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">Early Departures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 mb-4">Track students who have approved requests to leave early.</p>
              <Button onClick={() => setActiveTab('early-departures')} className="bg-green-500 hover:bg-green-600 text-white">
                <Car className="mr-2 h-4 w-4" /> View Early Departures
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
