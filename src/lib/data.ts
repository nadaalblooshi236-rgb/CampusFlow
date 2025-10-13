import type { Vehicle, PickupRequest, Notification, Attendance } from './types';

export const initialVehicles: Vehicle[] = [
    { id: 1, plate: "ABC123", driver: "John Smith", student: "Emma Smith", entryTime: "08:15", exitTime: null, status: "inside", capacity: 4, type: "car", lastUpdated: Date.now() },
    { id: 2, plate: "XYZ789", driver: "Lisa Johnson", student: "Michael Johnson", entryTime: "08:20", exitTime: "15:25", status: "exited", capacity: 5, type: "car", lastUpdated: Date.now() },
    { id: 3, plate: "BUS001", driver: "Robert Chen", student: "Bus Route 1", entryTime: "08:05", exitTime: null, status: "inside", capacity: 50, type: "bus", lastUpdated: Date.now() },
    { id: 4, plate: "NEW001", driver: "New Driver", student: "New Student", entryTime: null, exitTime: null, status: "registered", capacity: 4, type: "car", lastUpdated: Date.now() },

];

export const initialRequests: PickupRequest[] = [
    { 
      id: 1, 
      plate: "JKL345", 
      driver: "David Wilson", 
      student: "Olivia Wilson", 
      time: "14:10", 
      status: "approved", 
      type: "car",
      excuse: "Doctor's appointment at 2:30 PM",
      submittedAt: "13:45",
      approvedAt: "13:50",
      approvedBy: "Receptionist",
      lastUpdated: Date.now()
    },
    { 
      id: 2, 
      plate: "MNO678", 
      driver: "Sarah Brown", 
      student: "James Brown", 
      time: "14:05", 
      status: "denied", 
      type: "car",
      excuse: "Family emergency",
      submittedAt: "13:30",
      deniedAt: "13:35",
      deniedBy: "Receptionist",
      denialReason: "No valid reason provided",
      lastUpdated: Date.now()
    },
     { 
      id: 3, 
      plate: "PQR912", 
      driver: "Parent User", 
      student: "Student Name", 
      time: "13:55", 
      status: "pending", 
      type: "car",
      excuse: "Dentist appointment.",
      submittedAt: "13:55",
      lastUpdated: Date.now()
    }
];

export const initialNotifications: Notification[] = [
    { id: 1, message: "Vehicle ABC123 has entered campus", time: "08:15", type: "entry" },
    { id: 2, message: "Pickup request approved for JKL345", time: "13:50", type: "approval" },
    { id: 3, message: "Vehicle XYZ789 has exited campus", time: "15:25", type: "exit" }
];
  
export const initialAttendance: Attendance[] = [
    { student: "Nada Khaled Alblooshi", date: "2025-09-09", entry: "8:05", exit: null, status: "present", vehicleId: 1 },
    { student: "Dana Mohammed Alsayari", date: "2025-09-09", entry: "8:12", exit: null, status: "present", vehicleId: 2 },
    { student: "Maitha Saleh Alsayari", date: "2025-09-09", entry: null, exit: null, status: "absent", vehicleId: null },
];
