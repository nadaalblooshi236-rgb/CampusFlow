"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MapPin, Car, Bus } from "lucide-react";
import { cn } from "@/lib/utils";

const colorClasses = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text800: 'text-red-800',
    text700: 'text-red-700',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text800: 'text-green-800',
    text700: 'text-green-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text800: 'text-blue-800',
    text700: 'text-blue-700',
  },
};


export default function LocationMapView() {
  const mapImage = PlaceHolderImages.find(img => img.id === 'campus-map');

  const locations = [
    {
      title: "Main Entrance Gate",
      description: "All vehicles must enter through the main gate for license plate verification.",
      details: [
        "Open: 2:30 PM - 5:00 PM (Weekdays)",
        "License plate recognition system in place",
        "Maximum 5 vehicles allowed on campus at once"
      ],
      color: "red" as keyof typeof colorClasses,
      icon: MapPin
    },
    {
      title: "Car Pickup Zone",
      description: "Designated area for parent vehicles to pick up students.",
      details: [
        "Located near the main building entrance",
        "First-come, first-served basis",
        "Maximum 10-minute wait time",
        "Use designated lanes only"
      ],
      color: "green" as keyof typeof colorClasses,
      icon: Car
    },
    {
      title: "Bus Pickup Zone",
      description: "Dedicated area for school buses with multiple loading zones.",
      details: [
        "Separate from car pickup area",
        "Multiple bus bays available",
        "Supervised by staff members",
        "Buses follow scheduled routes"
      ],
      color: "blue" as keyof typeof colorClasses,
      icon: Bus
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
          {mapImage && (
            <div className="relative">
              <Image
                src={mapImage.imageUrl}
                alt={mapImage.description}
                data-ai-hint={mapImage.imageHint}
                width={600}
                height={400}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
              />
              <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-red-500 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-red-500 text-white px-2 py-0.5 rounded whitespace-nowrap">Main Gate</div>
              </div>
              <div className="absolute top-3/4 left-1/3 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-0.5 rounded whitespace-nowrap">Car Zone</div>
              </div>
              <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded whitespace-nowrap">Bus Zone</div>
              </div>
            </div>
          )}
          
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
