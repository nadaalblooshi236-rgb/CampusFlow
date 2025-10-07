"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function EarlyDeparturesView() {
  const { requests } = useAppStore();
  const approvedRequests = requests.filter(r => r.status === 'approved');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Recent Early Departures</CardTitle>
        <CardDescription>Approved early pickup requests for the day.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvedRequests.length > 0 ? approvedRequests.map((request) => (
            <div key={request.id} className="flex flex-col sm:flex-row items-start justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-500 p-3 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{request.student}</h3>
                  <p className="text-muted-foreground text-sm">Picked up by: {request.driver}</p>
                  <p className="text-sm text-muted-foreground">Vehicle: {request.plate} &bull; Approved at: {request.approvedAt}</p>
                </div>
              </div>
              <div className="text-left sm:text-right mt-2 sm:mt-0 sm:ml-4">
                <p className="font-medium text-foreground text-sm">Reason:</p>
                <p className="text-sm text-muted-foreground">{request.excuse}</p>
              </div>
            </div>
          )) : (
             <p className="text-center text-muted-foreground py-10">No early departures today.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
