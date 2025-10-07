"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole, Vehicle, PickupRequest, Notification, Attendance } from '@/lib/types';
import { initialVehicles, initialRequests, initialNotifications, initialAttendance } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  requests: PickupRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PickupRequest[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  attendance: Attendance[];
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  gateStatus: 'open' | 'closed';
  setGateStatus: React.Dispatch<React.SetStateAction<'open' | 'closed'>>;
  currentCapacity: number;
  setCurrentCapacity: React.Dispatch<React.SetStateAction<number>>;
  maxCapacity: number;
  handleEnterGate: (vehicleId: number) => void;
  handleExitGate: (vehicleId: number) => void;
  changeRole: (role: UserRole) => void;
  approveRequest: (requestId: number) => void;
  denyRequest: (requestId: number) => void;
  submitRequest: (newRequest: Omit<PickupRequest, 'id' | 'lastUpdated'>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<User>({ type: "reception", name: "Staff Member" });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [requests, setRequests] = useState<PickupRequest[]>(initialRequests);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  
  const [gateStatus, setGateStatus] = useState<'open' | 'closed'>("closed");
  const [currentCapacity, setCurrentCapacity] = useState(vehicles.filter(v => v.status === 'inside').length);
  const [maxCapacity] = useState(5);

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    const newNotif = { ...notif, id: Date.now() };
    setNotifications(prev => [newNotif, ...prev]);
    toast({
      title: "New Activity",
      description: notif.message,
    });
  };

  const handleEnterGate = (vehicleId: number) => {
    if (currentCapacity >= maxCapacity) return;
    
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.status === 'inside') return;

    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, entryTime: now, status: "inside", lastUpdated: Date.now() } : v
    ));
    
    setCurrentCapacity(prev => prev + 1);
    setGateStatus("open");
    
    setTimeout(() => setGateStatus("closed"), 3000);
    
    addNotification({ message: `Vehicle ${vehicle.plate} has entered campus`, time: now, type: "entry" });
    
    setAttendance(prev => prev.map(record => 
      record.vehicleId === vehicleId ? { ...record, entry: now, status: "present" } : record
    ));
  };

  const handleExitGate = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
     if (!vehicle) return;

    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, exitTime: now, status: "exited", lastUpdated: Date.now() } : v
    ));
    
    setCurrentCapacity(prev => Math.max(0, prev - 1));
    setGateStatus("open");
    
    setTimeout(() => setGateStatus("closed"), 3000);
    
    addNotification({ message: `Vehicle ${vehicle.plate} has exited campus`, time: now, type: "exit" });
    
    setAttendance(prev => prev.map(record => 
      record.vehicleId === vehicleId ? { ...record, exit: now } : record
    ));
  };

  const changeRole = (role: UserRole) => {
    setCurrentUser({
      type: role,
      name: role === "parent" ? "Parent User" : 
            role === "teacher" ? "Teacher Name" : "Staff Member"
    });
    setActiveTab("dashboard");
  };

  const approveRequest = (requestId: number) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: "approved",
        approvedAt: now,
        approvedBy: currentUser.name,
        lastUpdated: Date.now()
      } : req
    ));
    addNotification({ message: `Pickup request approved for ${request.plate}`, time: now, type: "approval" });
  };

  const denyRequest = (requestId: number) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const reason = prompt("Reason for denial:");
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: "denied",
        deniedAt: now,
        deniedBy: currentUser.name,
        denialReason: reason || "Not specified",
        lastUpdated: Date.now()
      } : req
    ));
    addNotification({ message: `Pickup request denied for ${request.plate}`, time: now, type: "denial" });
  };

  const submitRequest = (newRequestData: Omit<PickupRequest, 'id' | 'lastUpdated'>) => {
    const newRequest = {
        ...newRequestData,
        id: Date.now(),
        lastUpdated: Date.now(),
    };
    setRequests(prev => [newRequest, ...prev]);
    addNotification({ 
        message: `New pickup request for ${newRequest.plate}`, 
        time: newRequest.time, 
        type: "request" 
    });
    setActiveTab('dashboard'); // Or some confirmation view
  }


  useEffect(() => {
    const interval = setInterval(() => {
      if(currentUser.type !== 'reception') return; // Only run simulation for reception view
      const randomEvent = Math.random();
      
      if (randomEvent < 0.1 && currentCapacity < maxCapacity) {
        const enteringVehicle = vehicles.find(v => v.status === "registered");
        if(enteringVehicle) handleEnterGate(enteringVehicle.id);
      } else if (randomEvent > 0.9) {
        const insideVehicles = vehicles.filter(v => v.status === "inside");
        if (insideVehicles.length > 0) {
          const randomVehicle = insideVehicles[Math.floor(Math.random() * insideVehicles.length)];
          handleExitGate(randomVehicle.id);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentCapacity, vehicles, currentUser.type]);


  const value = {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    vehicles,
    setVehicles,
    requests,
    setRequests,
    notifications,
    setNotifications,
    attendance,
    setAttendance,
    gateStatus,
    setGateStatus,
    currentCapacity,
    setCurrentCapacity,
    maxCapacity,
    handleEnterGate,
    handleExitGate,
    changeRole,
    approveRequest,
    denyRequest,
    submitRequest,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
