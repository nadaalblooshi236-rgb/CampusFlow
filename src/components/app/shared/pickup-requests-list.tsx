"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Check, X, CheckCircle2 } from "lucide-react";

export default function PickupRequestsList() {
  const { requests, approveRequest, denyRequest } = useAppStore();
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Pickup Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="p-4 bg-secondary rounded-xl border">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="bg-ats-green p-3 rounded-lg flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{request.driver}</h3>
                      <p className="text-muted-foreground">Vehicle: {request.plate} &bull; Student: {request.student}</p>
                      <p className="text-sm text-muted-foreground">Requested at: {request.submittedAt}</p>
                    </div>
                  </div>
                  <Card className="bg-background">
                    <CardHeader className="p-3">
                      <h4 className="font-medium text-foreground text-sm">Reason for Early Pickup:</h4>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-muted-foreground text-sm">{request.excuse}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 ml-auto sm:ml-4">
                  <Button
                    onClick={() => approveRequest(request.id)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="mr-2 h-4 w-4"/> Approve
                  </Button>
                  <Button
                    onClick={() => denyRequest(request.id)}
                    variant="destructive"
                  >
                    <X className="mr-2 h-4 w-4"/> Deny
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {pendingRequests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="mx-auto h-12 w-12" />
              <h3 className="mt-2 text-sm font-medium">No pending requests</h3>
              <p className="mt-1 text-sm">All pickup requests have been processed.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
