"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Check, X, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PickupRequestsManagementView() {
  const { requests, approveRequest, denyRequest } = useAppStore();
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const deniedRequests = requests.filter(r => r.status === 'denied');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Pickup Requests</CardTitle>
          <CardDescription>Review and process incoming requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 bg-secondary rounded-xl border">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-ats-green p-3 rounded-lg flex-shrink-0"><ShieldCheck className="w-6 h-6 text-white" /></div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{request.driver}</h3>
                        <p className="text-muted-foreground text-sm">Vehicle: {request.plate} &bull; Student: {request.student}</p>
                      </div>
                    </div>
                    <Card className="bg-background"><CardContent className="p-3"><p className="text-muted-foreground text-sm">{request.excuse}</p></CardContent></Card>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 ml-auto sm:ml-4">
                    <Button onClick={() => approveRequest(request.id)} className="bg-green-500 hover:bg-green-600 text-white"><Check className="mr-2 h-4 w-4"/>Approve</Button>
                    <Button onClick={() => denyRequest(request.id)} variant="destructive"><X className="mr-2 h-4 w-4"/>Deny</Button>
                  </div>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="mx-auto h-12 w-12" />
                <h3 className="mt-2 text-sm font-medium">No pending requests</h3>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Separator />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Approved Requests</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {approvedRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-md border border-green-200">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="font-medium text-sm text-green-800">{req.driver} - {req.plate}</p>
                            <p className="text-xs text-green-700">Approved by {req.approvedBy} at {req.approvedAt}</p>
                        </div>
                    </div>
                ))}
                {approvedRequests.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No requests approved yet.</p>}
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Denied Requests</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {deniedRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-4 p-3 bg-red-50 rounded-md border border-red-200">
                        <ThumbsDown className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="font-medium text-sm text-red-800">{req.driver} - {req.plate}</p>
                            <p className="text-xs text-red-700">Denied by {req.deniedBy} at {req.deniedAt}</p>
                            <p className="text-xs text-red-700">Reason: {req.denialReason}</p>
                        </div>
                    </div>
                ))}
                 {deniedRequests.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No requests denied yet.</p>}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
