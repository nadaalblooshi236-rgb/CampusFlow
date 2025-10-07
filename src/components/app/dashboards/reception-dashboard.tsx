"use client";

import GateStatus from "@/components/app/shared/gate-status";
import StatsCard from "@/components/app/shared/stats-card";
import RecentActivity from "@/components/app/shared/recent-activity";
import PickupRequestsList from "@/components/app/shared/pickup-requests-list";
import VehiclesOnCampus from "@/components/app/shared/vehicles-on-campus";
import TrafficPrediction from "@/components/app/shared/traffic-prediction";

export default function ReceptionDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GateStatus />
        </div>
        <div className="space-y-6">
          <StatsCard />
          <RecentActivity />
        </div>
      </div>
      
      <TrafficPrediction />

      <PickupRequestsList />
      
      <VehiclesOnCampus />
    </div>
  );
}
