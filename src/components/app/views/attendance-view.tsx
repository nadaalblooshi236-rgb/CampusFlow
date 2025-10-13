"use client";

import { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teacherSchedules } from "@/lib/schedule";
import type { Attendance } from "@/lib/types";

export default function AttendanceView() {
  const { attendance } = useAppStore();
  const scheduleData = teacherSchedules.find(s => s.teacher === "Laila Zuaiter");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'early departure': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAttendance = (): Attendance[] => {
    if (selectedClass === "all" || !scheduleData) {
      return attendance;
    }
    const classInfo = scheduleData.classes.find(c => c.name === selectedClass);
    if (!classInfo) {
      return [];
    }
    const studentNames = classInfo.students.map(s => s.name);
    return attendance.filter(record => studentNames.includes(record.student));
  };
  
  const attendanceToDisplay = filteredAttendance();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Student Attendance Records</CardTitle>
        <CardDescription>View and filter student attendance history.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-foreground mb-1">Select Class</label>
            <Select onValueChange={setSelectedClass} value={selectedClass}>
              <SelectTrigger className="focus:ring-2 focus:ring-ats-green">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Classes</SelectItem>
                 {scheduleData?.classes.map(cls => <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-foreground mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <Input type="date" defaultValue="2025-09-09" className="focus:ring-2 focus:ring-ats-green" />
              <span>to</span>
              <Input type="date" defaultValue="2025-09-09" className="focus:ring-2 focus:ring-ats-green" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceToDisplay.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{record.student}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.entry || '-'}</TableCell>
                  <TableCell>{record.exit || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadge(record.status)}>{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {record.status === 'early departure' && 'Early pickup approved'}
                  </TableCell>
                </TableRow>
              ))}
               {attendanceToDisplay.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No attendance records found for the selected class.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-l-4 border-green-500">
                <CardHeader>
                    <CardTitle className="text-lg text-green-800">Present</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600">86%</p>
                    <p className="text-sm text-green-700">24 students</p>
                </CardContent>
            </Card>
             <Card className="bg-red-50 border-l-4 border-red-500">
                <CardHeader>
                    <CardTitle className="text-lg text-red-800">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-red-600">10%</p>
                    <p className="text-sm text-red-700">3 students</p>
                </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-l-4 border-yellow-500">
                <CardHeader>
                    <CardTitle className="text-lg text-yellow-800">Early Departure</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">4%</p>
                    <p className="text-sm text-yellow-700">1 student</p>
                </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}
