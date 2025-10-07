"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AttendanceView() {
  const { attendance } = useAppStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'early departure': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const studentNames = [...new Set(attendance.map(a => a.student))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Student Attendance Records</CardTitle>
        <CardDescription>View and filter student attendance history.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-foreground mb-1">Select Student</label>
            <Select>
              <SelectTrigger className="focus:ring-2 focus:ring-ats-green">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                 {studentNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-foreground mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <Input type="date" defaultValue="2023-11-01" className="focus:ring-2 focus:ring-ats-green" />
              <span>to</span>
              <Input type="date" defaultValue="2023-12-01" className="focus:ring-2 focus:ring-ats-green" />
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
              {attendance.map((record, index) => (
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
