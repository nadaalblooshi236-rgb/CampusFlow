"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function VehicleAccessView() {
  const { vehicles } = useAppStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'inside': return 'bg-green-100 text-green-800';
      case 'exited': return 'bg-gray-200 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'registered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Registered Vehicles</CardTitle>
        <CardDescription>A log of all vehicles registered in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.driver}</TableCell>
                  <TableCell>{vehicle.student}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={vehicle.type === 'car' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {vehicle.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadge(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.capacity} seats</TableCell>
                  <TableCell>{new Date(vehicle.lastUpdated).toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
