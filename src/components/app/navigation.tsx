"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { LayoutGrid, MapPin, Bell, UserPlus, Clock, Car, CalendarDays, Video } from "lucide-react";

type Tab = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const parentTabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'locations', label: 'Access Locations', icon: MapPin },
  { id: 'requests', label: 'Pickup Requests', icon: Bell },
  { id: 'register', label: 'Register Vehicle', icon: UserPlus }
];

const teacherTabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'schedule', label: 'My Schedule', icon: CalendarDays },
  { id: 'attendance', label: 'Student Attendance', icon: Clock },
  { id: 'early-departures', label: 'Early Departures', icon: Car },
  { id: 'register', label: 'Register Vehicle', icon: UserPlus }
];

const receptionTabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'requests', label: 'Pickup Requests', icon: Bell },
  { id: 'vehicles', label: 'Vehicle Access', icon: Car },
  { id: 'logs', label: 'Access Logs', icon: Clock },
  { id: 'live-feed', label: 'Live Feed', icon: Video }
];

const tabsByRole = {
  parent: parentTabs,
  teacher: teacherTabs,
  reception: receptionTabs
};

export default function Navigation() {
  const { currentUser, activeTab, setActiveTab } = useAppStore();
  const tabs = tabsByRole[currentUser.type];

  return (
    <nav className="flex space-x-2 sm:space-x-4">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          variant="ghost"
          className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-ats-green text-white shadow-lg transform scale-105 hover:bg-ats-green'
              : 'text-white hover:text-ats-light-blue hover:bg-ats-blue/30'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </nav>
  );
}
