export type UserRole = "parent" | "teacher" | "reception";

export interface User {
  type: UserRole;
  name: string;
}

export interface Vehicle {
  id: number;
  plate: string;
  driver: string;
  student: string;
  entryTime: string | null;
  exitTime: string | null;
  status: "inside" | "exited" | "pending" | "registered";
  capacity: number;
  type: "car" | "bus";
  lastUpdated: number;
}

export interface PickupRequest {
  id: number;
  plate: string;
  driver: string;
  student: string;
  time: string;
  status: "approved" | "denied" | "pending";
  type: "car";
  excuse: string;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  deniedAt?: string;
  deniedBy?: string;
  denialReason?: string;
  lastUpdated: number;
}

export interface Notification {
  id: number;
  message: string;
  time: string;
  type: "entry" | "exit" | "approval" | "denial" | "request";
}

export interface Attendance {
  student: string;
  date: string;
  entry: string | null;
  exit: string | null;
  status: "present" | "absent" | "early departure";
  vehicleId: number | null;
}

export interface Student {
  name: string;
}

export interface Class {
  name: string;
  students: Student[];
}

export interface ScheduleEntry {
  day: string;
  time: string;
  className: string;
  room: string;
}

export interface TeacherSchedule {
  teacher: string;
  schedule: ScheduleEntry[];
  classes: Class[];
}