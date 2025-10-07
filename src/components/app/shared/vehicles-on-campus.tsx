"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VehiclesOnCampus() {
  const { vehicles, handleExitGate } = useAppStore();
  const insideVehicles = vehicles.filter(v => v.status === 'inside');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicles Currently on Campus ({insideVehicles.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insideVehicles.length > 0 ? insideVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.driver}</TableCell>
                  <TableCell>{vehicle.student}</TableCell>
                  <TableCell>
                    <Badge variant={vehicle.type === 'car' ? 'default' : 'secondary'} className={vehicle.type === 'car' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {vehicle.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.entryTime}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleExitGate(vehicle.id)}
                      size="sm"
                      className="bg-ats-green hover:bg-green-700 text-white"
                    >
                      Record Exit
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No vehicles currently on campus.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
