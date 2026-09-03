"use client";

import dynamic from "next/dynamic";
import React from "react";
import { 
  BoundingBox, 
  FloodZonePolygon, 
  GeoPoint, 
  InfrastructureItem, 
  RoadSegment, 
  SafeShelter 
} from "@/types";
import { Loader2 } from "lucide-react";

interface DisasterMapProps {
  center: GeoPoint;
  boundingBox: BoundingBox;
  onCenterChange?: (center: GeoPoint, bbox: BoundingBox) => void;
  floodZones?: FloodZonePolygon[];
  blockedRoads?: RoadSegment[];
  shelters?: SafeShelter[];
  facilities?: InfrastructureItem[];
  heatPoints?: [number, number, number][];
  activeHour?: number;
  interactiveMode?: boolean;
}

const DynamicMap = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        <Loader2 className="w-6 h-6 text-blue-400 absolute" />
      </div>
      <p className="text-xs font-mono text-slate-400">Loading High-Resolution GIS Map Engine...</p>
    </div>
  ),
});

export default function DisasterMap(props: DisasterMapProps) {
  return <DynamicMap {...props} />;
}
