"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Car } from "lucide-react";

export default function TeacherDashboard() {
  const { setActiveTab } = useAppStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Teacher Dashboard</CardTitle>
        <CardDescription>View your schedule and monitor student attendance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">My Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-4">View your weekly teaching schedule and class rosters.</p>
              <Button onClick={() => setActiveTab('schedule')} className="bg-blue-500 hover:bg-blue-600 text-white">
                <CalendarDays className="mr-2 h-4 w-4" /> View Schedule
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">Live Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 mb-4">Check attendance for your currently scheduled class.</p>
              <Button onClick={() => setActiveTab('attendance')} className="bg-green-500 hover:bg-green-600 text-white">
                <Clock className="mr-2 h-4 w-4" /> View Live Attendance
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
