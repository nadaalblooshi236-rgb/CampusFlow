"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";

export default function VehicleRegistrationView() {
  const { currentUser } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit data to the backend
    alert("Vehicle registration submitted for approval.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Register New Vehicle</CardTitle>
        <CardDescription>Add a vehicle to be used for student pickup.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select defaultValue="car">
                <SelectTrigger id="vehicleType" className="focus:ring-2 focus:ring-ats-green">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">License Plate</Label>
              <Input id="plate" placeholder="ABC123" className="focus:ring-2 focus:ring-ats-green" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Driver Name</Label>
              <Input id="driver" defaultValue={currentUser.name} className="focus:ring-2 focus:ring-ats-green" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Student Name</Label>
              <Input id="student" value={currentUser.studentName || ''} readOnly className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentClass">Class of Student</Label>
              <Input id="studentClass" placeholder="e.g., Grade 5B" className="focus:ring-2 focus:ring-ats-green" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+971 5X XXX XXXX" className="focus:ring-2 focus:ring-ats-green" />
            </div>
          </div>
           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2"><Info className="h-5 w-5"/>Important Information</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Only parents can register vehicles for their children.</li>
              <li>Vehicle registration must be approved by school administration.</li>
              <li>Registered vehicles will have access to the automated pickup system.</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-ats-green hover:bg-green-700 text-white">
              Register Vehicle
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
