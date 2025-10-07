"use client";

import { useState } from 'react';
import { useAppStore } from '@/hooks/use-app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';

export default function PickupRequestView() {
  const { currentUser, submitRequest } = useAppStore();
  const [plate, setPlate] = useState('');
  const [excuse, setExcuse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 14 && !excuse.trim()) {
      setError("After 2:00 PM, you must provide a valid excuse for early pickup. Please explain the reason.");
      return;
    }
    
    setError('');

    const newRequest = {
      plate: plate.toUpperCase(),
      driver: currentUser.name,
      student: "Emma Smith", // Placeholder student
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "pending" as const,
      type: "car" as const,
      excuse: excuse,
      submittedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    submitRequest(newRequest);
    setPlate('');
    setExcuse('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Submit Pickup Request</CardTitle>
        <CardDescription>Request an early pickup for your child.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="plate">License Plate</Label>
            <Input 
              id="plate"
              type="text" 
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="ABC123"
              required
              className="focus:ring-2 focus:ring-ats-green"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excuse">Reason for Early Pickup (Required after 2:00 PM)</Label>
            <Textarea 
              id="excuse"
              value={excuse}
              onChange={(e) => setExcuse(e.target.value)}
              rows={4}
              placeholder="e.g., Doctor's appointment, family emergency..."
              className="focus:ring-2 focus:ring-ats-green"
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2"><Info className="h-5 w-5"/>Important Information</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Only parents can submit pickup requests.</li>
              <li>After 2:00 PM, an excuse is required for early pickup.</li>
              <li>All requests must be approved by reception before pickup.</li>
              <li>You will receive a notification when your request is approved.</li>
              <li>The automatic gate will recognize your vehicle when approved.</li>
            </ul>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-ats-green hover:bg-green-700 text-white"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
