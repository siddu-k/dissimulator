"use client";

import dynamic from "next/dynamic";
import React from "react";
import { BoundingBox, GeoPoint, InfrastructureItem, RoadSegment, SafeShelter } from "@/types";
import { Loader2 } from "lucide-react";

interface Props {
  center: GeoPoint;
  boundingBox: BoundingBox;
  onSelectArea?: (center: GeoPoint, bbox: BoundingBox) => void;
  floodZones?: any[];
  heatPoints?: [number, number, number][];
  blockedRoads?: RoadSegment[];
  shelters?: SafeShelter[];
  facilities?: InfrastructureItem[];
  locationName?: string;
}

const SatelliteMapComponent = dynamic(() => import("./SatelliteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading Satellite GIS Imagery...</span>
    </div>
  ),
});

export default function DynamicSatelliteMap(props: Props) {
  return <SatelliteMapComponent {...props} />;
}
