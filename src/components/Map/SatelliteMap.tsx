"use client";

import React, { useEffect } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Polyline, 
  CircleMarker, 
  Popup, 
  Tooltip, 
  useMap, 
  useMapEvents 
} from "react-leaflet";
import L from "leaflet";
import { BoundingBox, GeoPoint, InfrastructureItem, RoadSegment, SafeShelter } from "@/types";
import { AlertOctagon, Home, Hospital, AlertTriangle, ShieldCheck, Waves } from "lucide-react";

// Fix Leaflet default marker icon resolution in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface SatelliteMapProps {
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

function MapController({ center }: { center: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center.lat, center.lng, map]);

  return null;
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    const container = map.getContainer();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && container) {
      observer = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observer.observe(container);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, [map]);
  return null;
}

function MapClickHandler({ 
  onSelect 
}: { 
  onSelect?: (point: GeoPoint, bbox: BoundingBox) => void 
}) {
  useMapEvents({
    click(e) {
      if (!onSelect) return;
      const { lat, lng } = e.latlng;
      const span = 0.035;
      const bbox: BoundingBox = {
        north: lat + span,
        south: lat - span,
        east: lng + span * 1.2,
        west: lng - span * 1.2,
      };
      onSelect({ lat, lng }, bbox);
    },
  });
  return null;
}

export default function SatelliteMap({
  center,
  boundingBox,
  onSelectArea,
  floodZones = [],
  heatPoints = [],
  blockedRoads = [],
  facilities = [],
  shelters = [],
  locationName = "Selected Target Area",
}: SatelliteMapProps) {
  const selectionBounds: [number, number][] = [
    [boundingBox.north, boundingBox.west],
    [boundingBox.north, boundingBox.east],
    [boundingBox.south, boundingBox.east],
    [boundingBox.south, boundingBox.west],
  ];

  return (
    <div className="relative w-full h-full bg-slate-950">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.8}
        />

        <MapResizeHandler />
        <MapController center={center} />
        <MapClickHandler onSelect={onSelectArea} />

        {/* Selected Area Perimeter Box */}
        <Polygon
          positions={selectionBounds}
          pathOptions={{
            color: "#38bdf8",
            weight: 2,
            dashArray: "6, 6",
            fillColor: "#0284c7",
            fillOpacity: 0.1,
          }}
        >
          <Popup>
            <div className="text-xs p-1 space-y-0.5">
              <strong className="text-sky-400 font-mono">Selected Target Zone</strong>
              <div className="text-slate-300 font-mono text-[11px]">
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Polygon>

        {/* Heat Points Overlay */}
        {heatPoints.map((pt, idx) => (
          <CircleMarker
            key={`heat-${idx}`}
            center={[pt[0], pt[1]]}
            radius={18}
            pathOptions={{
              color: "transparent",
              fillColor: pt[2] > 0.65 ? "#ef4444" : pt[2] > 0.35 ? "#f97316" : "#38bdf8",
              fillOpacity: pt[2] * 0.45,
            }}
          />
        ))}

        {/* Dynamic Inundation Flood Polygons */}
        {floodZones.map((zone: any, i: number) => {
          const isCritical = zone.severity === "critical";
          const isHigh = zone.severity === "high";
          const fillColor = isCritical ? "#ef4444" : isHigh ? "#f97316" : "#0284c7";

          return (
            <Polygon
              key={`flood-${i}`}
              positions={zone.coords}
              pathOptions={{
                color: isCritical ? "#dc2626" : "#38bdf8",
                weight: 2.5,
                fillColor,
                fillOpacity: 0.45,
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5" />
                    Inundation Zone: {zone.severity || "Flood"}
                  </div>
                  {zone.depthM && (
                    <div className="text-slate-300">
                      Water Depth: <strong className="text-white">{zone.depthM} m</strong>
                    </div>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Blocked & Open Real Road Segments */}
        {blockedRoads.map((road) => {
          const isSubmerged = road.status === "submerged";
          const isBlocked = road.status === "partially_blocked";
          const isOpen = road.status === "clear";
          
          const strokeColor = isSubmerged ? "#ef4444" : isBlocked ? "#f59e0b" : "#10b981";
          const roadWeight = isSubmerged ? 6 : isBlocked ? 5 : 4;
          const roadOpacity = isSubmerged ? 1 : isBlocked ? 0.9 : 0.85;

          return (
            <React.Fragment key={road.id}>
              {/* Outer glow/halo for closed roads */}
              {isSubmerged && (
                <Polyline
                  positions={road.coords}
                  pathOptions={{
                    color: "#991b1b",
                    weight: 10,
                    opacity: 0.6,
                  }}
                />
              )}

              {/* Main Road Corridor */}
              <Polyline
                positions={road.coords}
                pathOptions={{
                  color: strokeColor,
                  weight: roadWeight,
                  opacity: roadOpacity,
                  dashArray: isSubmerged ? "12, 8" : isBlocked ? "6, 6" : undefined,
                }}
              >
                <Popup>
                  <div className="text-xs p-1.5 space-y-1.5 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <strong className="text-white font-semibold text-sm">{road.name}</strong>
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        isSubmerged ? "bg-red-600 text-white" : isBlocked ? "bg-amber-600 text-white" : "bg-emerald-600 text-white"
                      }`}>
                        {isSubmerged ? "ROAD CLOSED" : isBlocked ? "WATER HAZARD" : "ROAD OPEN"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Type: <span className="capitalize text-slate-100 font-medium">{road.type} Corridor</span>
                    </div>
                    {isSubmerged && (
                      <div className="text-[11px] text-red-400 font-mono">
                        Flood Inundation Depth: <strong>{road.waterDepthCm} cm</strong>
                      </div>
                    )}
                    {isBlocked && (
                      <div className="text-[11px] text-amber-300 font-mono">
                        Caution: Water Pooling <strong>{road.waterDepthCm} cm</strong>
                      </div>
                    )}
                    {isOpen && (
                      <div className="text-[11px] text-emerald-400 font-mono">
                        ✓ Clear Passable Route (Safe for Evacuation)
                      </div>
                    )}
                    {road.detourName && (
                      <div className="text-[11px] text-sky-300 pt-1 border-t border-slate-700">
                        Alternative Bypass: <strong>{road.detourName}</strong>
                      </div>
                    )}
                  </div>
                </Popup>
              </Polyline>

              {/* Road Closed Hazard Barrier Marker */}
              {isSubmerged && road.coords.length > 0 && (
                <CircleMarker
                  center={road.coords[Math.floor(road.coords.length / 2)]}
                  radius={7}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2,
                    fillColor: "#ef4444",
                    fillOpacity: 1,
                  }}
                >
                  <Tooltip permanent direction="top">
                    <span className="text-[9px] font-extrabold font-mono bg-red-600 text-white px-1.5 py-0.5 rounded shadow-lg border border-white/40">
                      🚧 CLOSED: {road.name}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}
            </React.Fragment>
          );
        })}

        {/* High-Ground Safe Shelters */}
        {shelters.map((shelter) => {
          const isFlooded = shelter.status === "flooded";
          const color = isFlooded ? "#ef4444" : shelter.status === "risk_adjacent" ? "#f59e0b" : "#10b981";

          return (
            <CircleMarker
              key={shelter.id}
              center={[shelter.lat, shelter.lng]}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: color,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-emerald-400" />
                    {shelter.name}
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Elevation: <strong className="text-emerald-400">{shelter.elevationM} m</strong>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Capacity: <strong>{shelter.capacity.toLocaleString()} people</strong>
                  </div>
                  <div className="text-[11px] text-sky-300">
                    Safe Access: {shelter.recommendedRoute}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Critical Facilities */}
        {facilities.map((fac) => (
          <CircleMarker
            key={fac.id}
            center={[fac.lat, fac.lng]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 1.5,
              fillColor: "#38bdf8",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-white block">{fac.name}</strong>
                <span className="text-[11px] text-slate-300 uppercase font-mono">{fac.type} ({fac.elevationM}m)</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Floating Target Coordinates & Place Badge */}
      <div className="absolute top-4 left-4 z-[1000] glass-panel px-3.5 py-2 rounded-xl text-xs text-white border border-white/10 shadow-xl flex items-center gap-2 max-w-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <div className="font-mono text-slate-300 truncate">
          {locationName && (
            <span className="text-sky-300 font-semibold block truncate max-w-[260px]">
              {locationName}
            </span>
          )}
          <span className="text-slate-400 text-[10px]">
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Live Map Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] glass-panel px-3 py-2 rounded-xl text-[11px] text-slate-300 border border-white/10 shadow-xl hidden md:flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Inundation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Blocked Road (🚧)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe Shelter (🟢)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Risk Heat
        </span>
      </div>
    </div>
  );
}
