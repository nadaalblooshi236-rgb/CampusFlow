"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { teacherSchedules } from "@/lib/schedule";
import type { Attendance, ScheduleEntry } from "@/lib/types";
import { AlertCircle, Clock } from "lucide-react";

const getCurrentClass = (): ScheduleEntry | null => {
  const now = new Date();
  const dayOfWeek = now.toLocaleString('en-us', { weekday: 'long' });
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const scheduleData = teacherSchedules.find(s => s.teacher === "Laila Zuaiter");
  if (!scheduleData) return null;

  for (const entry of scheduleData.schedule) {
    if (entry.day === dayOfWeek) {
      const [startTime, endTime] = entry.time.split(' - ');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const entryStart = startHour * 60 + startMinute;
      const entryEnd = endHour * 60 + endMinute;

      if (currentTime >= entryStart && currentTime <= entryEnd) {
        return entry;
      }
    }
  }
  return null;
};


export default function AttendanceView() {
  const { attendance } = useAppStore();
  const [currentClass, setCurrentClass] = useState<ScheduleEntry | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setCurrentClass(getCurrentClass());
    const timer = setInterval(() => {
      setTime(new Date());
      setCurrentClass(getCurrentClass());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'early departure': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getFilteredAttendance = (): Attendance[] => {
    if (!currentClass) return [];
    
    const scheduleData = teacherSchedules.find(s => s.teacher === "Laila Zuaiter");
    const classInfo = scheduleData?.classes.find(c => c.name === currentClass.className);
    if (!classInfo) return [];

    const studentNames = classInfo.students.map(s => s.name);
    return attendance.filter(record => studentNames.includes(record.student));
  }

  const attendanceToDisplay = getFilteredAttendance();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Live Student Attendance</CardTitle>
        <div className="flex justify-between items-center">
            <CardDescription>
                Automatically showing attendance for the current class based on your schedule.
            </CardDescription>
            <div className="text-right text-sm text-muted-foreground">
                <p>Current Time</p>
                <p className="font-medium text-foreground">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentClass ? (
            <div className="space-y-6">
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                    <div className="flex items-center gap-4">
                        <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-blue-700">Currently scheduled class:</p>
                            <p className="font-bold text-lg text-blue-800">{currentClass.className} ({currentClass.time})</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Exit Time</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {attendanceToDisplay.map((record, index) => (
                        <TableRow key={index}>
                        <TableCell className="font-medium">{record.student}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={getStatusBadge(record.status)}>{record.status}</Badge>
                        </TableCell>
                        <TableCell>{record.entry || '-'}</TableCell>
                        <TableCell>{record.exit || '-'}</TableCell>
                        <TableCell>
                            {record.status === 'early departure' && 'Early pickup approved'}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">No class currently scheduled</h3>
            <p className="mt-1 text-sm">Please check your schedule for upcoming classes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
