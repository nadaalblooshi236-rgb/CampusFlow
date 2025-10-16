import type { Vehicle, PickupRequest, Notification, Attendance } from './types';

export const initialVehicles: Vehicle[] = [
    { id: 1, plate: "AUH 12345", driver: "Fatima Al Hammadi", student: "Dana Mohammed Alsayari", entryTime: "08:15", exitTime: null, status: "inside", capacity: 4, type: "car", lastUpdated: Date.now() },
    { id: 2, plate: "DXB 98765", driver: "Hessa Al Mulla", student: "Saif Al Mulla", entryTime: "08:20", exitTime: "15:25", status: "exited", capacity: 5, type: "car", lastUpdated: Date.now() },
    { id: 3, plate: "SHJ 1001", driver: "Rashid Al Mansoori", student: "Bus Route 1", entryTime: "08:05", exitTime: null, status: "inside", capacity: 50, type: "bus", lastUpdated: Date.now() },
    { id: 4, plate: "RAK 55555", driver: "Ahmed Al Kuwaiti", student: "Noor Al Kuwaiti", entryTime: null, exitTime: null, status: "registered", capacity: 4, type: "car", lastUpdated: Date.now() },
];

export const initialRequests: PickupRequest[] = [
    { 
      id: 1, 
      plate: "SHJ 34567", 
      driver: "Mariam Al Falahi", 
      student: "Zayed Al Falahi", 
      time: "14:10", 
      status: "approved", 
      type: "car",
      excuse: "Doctor's appointment at 2:30 PM",
      submittedAt: "13:45",
      approvedAt: "13:50",
      approvedBy: "Ayesha Al Marzooqi",
      lastUpdated: Date.now()
    },
    { 
      id: 2, 
      plate: "AJM 67890", 
      driver: "Noora Al Shehhi", 
      student: "Sultan Al Shehhi", 
      time: "14:05", 
      status: "denied", 
      type: "car",
      excuse: "Family emergency",
      submittedAt: "13:30",
      deniedAt: "13:35",
      deniedBy: "Ayesha Al Marzooqi",
      denialReason: "Not specified",
      lastUpdated: Date.now()
    },
     { 
      id: 3, 
      plate: "FUJ 91234", 
      driver: "Fatima Al Hammadi", 
      student: "Dana Mohammed Alsayari", 
      time: "13:55", 
      status: "pending", 
      type: "car",
      excuse: "Dentist appointment.",
      submittedAt: "13:55",
      lastUpdated: Date.now()
    }
];

export const initialNotifications: Notification[] = [
    { id: 1, message: "Vehicle AUH 12345 has entered campus", time: "08:15", type: "entry" },
    { id: 2, message: "Pickup request approved for SHJ 34567", time: "13:50", type: "approval" },
    { id: 3, message: "Vehicle DXB 98765 has exited campus", time: "15:25", type: "exit" }
];
  
export const initialAttendance: Attendance[] = [
    // 12 CAI 51
    { student: "Nada Khaled Alblooshi", date: "2025-09-09", entry: "8:05", exit: null, status: "present", vehicleId: null },
    { student: "Maitha Hazza Alhebsi", date: "2025-09-09", entry: "8:07", exit: null, status: "present", vehicleId: null },
    { student: "Meera Saleh Aljabri", date: "2025-09-09", entry: null, exit: null, status: "absent", vehicleId: null },
    // 11 CAI 51
    { student: "Dana Mohammed Alsayari", date: "2025-09-09", entry: "8:12", exit: "14:15", status: "early departure", vehicleId: 1 },
    { student: "Reem Mohammed Alsayari", date: "2025-09-09", entry: "8:10", exit: null, status: "present", vehicleId: null },
    { student: "Taif Said Alshamsi", date: "2025-09-09", entry: "8:11", exit: null, status: "present", vehicleId: null },
    // 10 CAI 51
    { student: "Maitha Saleh Alsayari", date: "2025-09-09", entry: null, exit: null, status: "absent", vehicleId: null },
    { student: "Shaikha Abdullah Alshamsi", date: "2025-09-09", entry: "8:01", exit: null, status: "present", vehicleId: null },
    { student: "Salama Mohammed Aljenibi", date: "2025-09-09", entry: "8:03", exit: null, status: "present", vehicleId: null },
    // 9 ADV 51
    { student: "Fatima Mohammed Al Jaberi", date: "2025-09-09", entry: "8:00", exit: null, status: "present", vehicleId: null },
    { student: "Mouza Ali Al Shamsi", date: "2025-09-09", entry: "7:55", exit: null, status: "present", vehicleId: null },
    { student: "Noura Hamdan Al Azmi", date: "2025-09-09", entry: "7:59", exit: null, status: "present", vehicleId: null },
    // 9 ADV 56
    { student: "Maha Rashid Albalooshi", date: "2025-09-09", entry: "8:02", exit: null, status: "present", vehicleId: null },
    { student: "Afra Khalifa Al Khulaifi", date: "2025-09-09", entry: null, exit: null, status: "absent", vehicleId: null },
    { student: "Shamsa Mansour Al Mansoori", date: "2025-09-09", entry: "8:04", exit: null, status: "present", vehicleId: null },
    // 9 ADV 57
    { student: "Salama Abdullah Al Marri", date: "2025-09-09", entry: "8:08", exit: null, status: "present", vehicleId: null },
    { student: "Amina Hamad Al Rashdi", date: "2025-09-09", entry: "8:09", exit: null, status: "present", vehicleId: null },
    { student: "Aisha Mohammed Al Shryani", date: "2025-09-09", entry: "8:10", exit: null, status: "present", vehicleId: null },
    // 9 ADV 58
    { student: "Shamma Mohammed Al Kaabi", date: "2025-09-09", entry: "8:01", exit: null, status: "present", vehicleId: null },
    { student: "Rouda Ali Al Risi", date: "2025-09-09", entry: "8:03", exit: null, status: "present", vehicleId: null },
    { student: "Reem Saad Al Nuaimi", date: "2025-09-09", entry: null, exit: null, status: "absent", vehicleId: null },
    // 8 ADV 51
    { student: "Alya Khalid Al Balushi", date: "2025-09-09", entry: "7:58", exit: null, status: "present", vehicleId: null },
    { student: "Wedema Mubarak Al Afari", date: "2025-09-09", entry: "7:59", exit: null, status: "present", vehicleId: null },
    { student: "Mazoon Saleh Al Amri", date: "2025-09-09", entry: "8:00", exit: null, status: "present", vehicleId: null },
    // 8 ADV 55
    { student: "Meera Abdullah Al Ajmi", date: "2025-09-09", entry: "8:05", exit: null, status: "present", vehicleId: null },
    { student: "Maryam Aref Al Khaldi", date: "2025-09-09", entry: "8:06", exit: "13:30", status: "early departure", vehicleId: null },
    { student: "Mahra Khalid Al Darmaki", date: "2025-09-09", entry: "8:07", exit: null, status: "present", vehicleId: null }
];
