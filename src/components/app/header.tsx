"use client";

import { ShieldCheck } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import type { UserRole } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Header() {
  const { currentUser, changeRole } = useAppStore();

  return (
    <header className="bg-ats-dark-blue/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-ats-green p-2 rounded-xl shadow-md">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ATS Smart Gate System</h1>
              <p className="text-sm text-ats-light-blue/80">Applied Technology School - Automated Access</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-ats-light-blue/80">User Role</p>
              <p className="font-medium text-white capitalize">{currentUser.type}</p>
            </div>
            
            <Select value={currentUser.type} onValueChange={(value: UserRole) => changeRole(value)}>
              <SelectTrigger className="w-[120px] bg-ats-blue text-white border-ats-green focus:ring-ats-green">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="reception">Reception</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
