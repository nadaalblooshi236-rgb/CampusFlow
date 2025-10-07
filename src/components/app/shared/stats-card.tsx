"use client";

import * as React from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function StatsCard() {
  const { vehicles, requests } = useAppStore();

  const stats = [
    { label: "Total Entries", value: vehicles.filter(v => v.entryTime).length, color: "text-ats-blue" },
    { label: "Active Vehicles", value: vehicles.filter(v => v.status === 'inside').length, color: "text-ats-green" },
    { label: "Pending Requests", value: requests.filter(r => r.status === 'pending').length, color: "text-yellow-600" },
    { label: "Approved Requests", value: requests.filter(r => r.status === 'approved').length, color: "text-green-600" },
    { label: "Denied Requests", value: requests.filter(r => r.status === 'denied').length, color: "text-red-600" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              {index < stats.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
