"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { MapPin, Car, ParkingSquare, School } from "lucide-react";
import { cn } from "@/lib/utils";

const colorClasses = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text800: 'text-red-800',
    text700: 'text-red-700',
    pin: 'bg-red-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text800: 'text-green-800',
    text700: 'text-green-700',
    pin: 'bg-green-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text800: 'text-blue-800',
    text700: 'text-blue-700',
    pin: 'bg-blue-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    text800: 'text-purple-800',
    text700: 'text-purple-700',
    pin: 'bg-purple-500',
  },
};


export default function LocationMapView() {

  const locations = [
    {
      title: "Main Entrance & Security Gate",
      description: "All vehicles must enter through this gate for license plate verification.",
      details: [
        "Automated gate with license plate recognition",
        "Leads to drop-off zones and parking",
      ],
      color: "red" as keyof typeof colorClasses,
      icon: MapPin,
      position: { top: '80%', left: '15%' }
    },
    {
      title: "Pickup & Drop-off Zone",
      description: "Designated area for student drop-off and pickup, located near Admin buildings.",
      details: [
        "Follow the designated lane for smooth traffic flow",
        "Parents should not leave vehicles unattended",
      ],
      color: "green" as keyof typeof colorClasses,
      icon: Car,
      position: { top: '60%', left: '30%' }
    },
    {
      title: "Staff & Teacher Parking",
      description: "Dedicated parking area for school staff and faculty.",
      details: [
        "Parking pass may be required",
        "Located adjacent to Block D",
      ],
      color: "blue" as keyof typeof colorClasses,
      icon: ParkingSquare,
      position: { top: '55%', left: '10%' }
    },
    {
      title: "Academic Blocks",
      description: "Main student classroom and library buildings.",
      details: [
        "Blocks A, B, C, F",
        "Access via main campus walkways",
      ],
      color: "purple" as keyof typeof colorClasses,
      icon: School,
      position: { top: '35%', left: '50%' }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Campus Access Map</CardTitle>
        <CardDescription>Key locations for vehicle entry and student pickup.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative">
              <Image
                src="/campus-map.jpg"
                alt="Campus Access Map"
                width={800}
                height={600}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
              />
              {locations.map(loc => {
                const colors = colorClasses[loc.color];
                return (
                  <div key={loc.title} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={loc.position}>
                    <div className={cn("w-4 h-4 rounded-full border-2 border-white shadow-lg", colors.pin, loc.color === 'red' && 'animate-pulse')}></div>
                    <div className={cn("absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white px-2 py-0.5 rounded whitespace-nowrap", colors.pin)}>{loc.title}</div>
                  </div>
                );
              })}
            </div>
          
          <div className="space-y-6">
            {locations.map(loc => {
              const colors = colorClasses[loc.color];
              return (
                <div key={loc.title} className={cn("p-4 rounded-xl border-l-4", colors.bg, colors.border)}>
                  <h3 className={cn("text-lg font-semibold mb-2 flex items-center gap-2", colors.text800)}><loc.icon className="h-5 w-5"/>{loc.title}</h3>
                  <p className={cn("text-sm mb-3", colors.text700)}>{loc.description}</p>
                  <ul className={cn("space-y-1 text-xs list-disc list-inside", colors.text700)}>
                    {loc.details.map(detail => <li key={detail}>{detail}</li>)}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
