"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { teacherSchedules } from "@/lib/schedule";
import { useAppStore } from "@/hooks/use-app-store";
import { Calendar, Users, BookOpen } from "lucide-react";

export default function ScheduleView() {
  const { currentUser } = useAppStore();
  const scheduleData = teacherSchedules.find(s => s.teacher === "Laila Zuaiter"); // Placeholder for current teacher

  if (!scheduleData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No schedule has been assigned to this teacher account.</p>
        </CardContent>
      </Card>
    );
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Weekly Schedule</CardTitle>
          <CardDescription>Schedule and class lists for {scheduleData.teacher}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {daysOfWeek.map(day => {
              const daySchedule = scheduleData.schedule.filter(s => s.day === day);
              if (daySchedule.length === 0) return null;

              return (
                <div key={day} className="border-l-4 border-ats-blue bg-secondary/50 rounded-r-lg p-4">
                  <h3 className="text-xl font-semibold text-ats-dark-blue mb-3 flex items-center gap-2"><Calendar className="h-5 w-5" /> {day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySchedule.map(entry => (
                      <Card key={entry.time} className="bg-background shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-primary">{entry.time}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{entry.className}</p>
                          <p className="text-sm text-muted-foreground">Room: {entry.room}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Class Rosters</CardTitle>
          <CardDescription>Student lists for your assigned classes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {scheduleData.classes.map(cls => (
              <AccordionItem value={cls.name} key={cls.name}>
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-ats-green" />
                    <span>{cls.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Student Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cls.students.map((student, index) => (
                          <TableRow key={student.name}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
