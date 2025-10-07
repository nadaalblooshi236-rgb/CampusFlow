"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MapPin, Car, Bus } from "lucide-react";

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
      color: "red",
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
      color: "green",
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
      color: "blue",
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
            {locations.map(loc => (
              <div key={loc.title} className={`bg-${loc.color}-50 p-4 rounded-xl border-l-4 border-${loc.color}-500`}>
                <h3 className={`text-lg font-semibold text-${loc.color}-800 mb-2 flex items-center gap-2`}><loc.icon className="h-5 w-5"/>{loc.title}</h3>
                <p className={`text-sm text-${loc.color}-700 mb-3`}>{loc.description}</p>
                <ul className={`space-y-1 text-xs list-disc list-inside text-${loc.color}-700`}>
                  {loc.details.map(detail => <li key={detail}>{detail}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
