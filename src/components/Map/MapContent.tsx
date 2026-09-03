"use client";

import React, { useEffect, useState } from "react";
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
import { 
  BoundingBox, 
  FloodZonePolygon, 
  GeoPoint, 
  InfrastructureItem, 
  RoadSegment, 
  SafeShelter 
} from "@/types";
import { Layers, ShieldAlert, Navigation, Hospital, Home, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface MapContentProps {
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

// Controller component to smoothly pan/zoom when center or bounding box changes
function MapController({ center, bbox }: { center: GeoPoint; bbox: BoundingBox }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center.lat, center.lng, map]);

  return null;
}

// Map Click Handler for selecting custom locations on the map
function MapClickHandler({ 
  onLocationSelected 
}: { 
  onLocationSelected?: (point: GeoPoint, bbox: BoundingBox) => void 
}) {
  useMapEvents({
    click(e) {
      if (!onLocationSelected) return;
      const { lat, lng } = e.latlng;
      const span = 0.045; // ~5km radius
      const bbox: BoundingBox = {
        north: lat + span,
        south: lat - span,
        east: lng + span * 1.2,
        west: lng - span * 1.2,
      };
      onLocationSelected({ lat, lng }, bbox);
    },
  });
  return null;
}

export default function MapContent({
  center,
  boundingBox,
  onCenterChange,
  floodZones = [],
  blockedRoads = [],
  shelters = [],
  facilities = [],
  heatPoints = [],
  activeHour,
  interactiveMode = true,
}: MapContentProps) {
  // Layer toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite" | "streets">("dark");

  const tileUrls = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  };

  // Selection Bounding Box Polygon coords
  const selectionBounds: [number, number][] = [
    [boundingBox.north, boundingBox.west],
    [boundingBox.north, boundingBox.east],
    [boundingBox.south, boundingBox.east],
    [boundingBox.south, boundingBox.west],
  ];

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map Layer Controls Bar */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="glass-panel p-2 rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-1.5 text-xs text-slate-300">
          <button
            onClick={() => setMapStyle("dark")}
            className={`px-2 py-1 rounded-lg transition ${
              mapStyle === "dark" ? "bg-blue-600 text-white" : "hover:bg-slate-800"
            }`}
          >
            Dark Vector
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-2 py-1 rounded-lg transition ${
              mapStyle === "satellite" ? "bg-blue-600 text-white" : "hover:bg-slate-800"
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Layer Checkboxes */}
        <div className="glass-panel p-2.5 rounded-xl border border-slate-700/80 shadow-xl space-y-1.5 text-[11px] text-slate-300">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Map Overlays
          </div>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showFloodZones}
              onChange={(e) => setShowFloodZones(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/80" /> Inundation Zones
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Road Blockages (🚧)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Safe Shelters (🟢)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showFacilities}
              onChange={(e) => setShowFacilities(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Hospitals / Grids
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="accent-purple-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/80" /> Risk Heatmap Grid
            </span>
          </label>
        </div>
      </div>

      {/* Instructions Overlay */}
      {interactiveMode && (
        <div className="absolute top-4 left-4 z-[1000] glass-panel px-3 py-1.5 rounded-xl border border-slate-700/80 text-slate-300 text-xs flex items-center gap-2 shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Click anywhere on map to reposition target perimeter</span>
        </div>
      )}

      {/* Simulation Timeline Watermark */}
      {activeHour !== undefined && (
        <div className="absolute bottom-4 left-4 z-[1000] glass-panel-elevated px-4 py-2 rounded-xl border border-blue-500/40 text-white flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          <div>
            <div className="text-[10px] uppercase font-mono text-blue-400 font-bold">Hydrodynamic Progression</div>
            <div className="text-sm font-extrabold font-mono text-white">T + {activeHour} Hours</div>
          </div>
        </div>
      )}

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrls[mapStyle]}
          maxZoom={19}
        />

        <MapController center={center} bbox={boundingBox} />
        <MapClickHandler onLocationSelected={onCenterChange} />

        {/* Selected Area Perimeter Box */}
        <Polygon
          positions={selectionBounds}
          pathOptions={{
            color: "#3b82f6",
            weight: 2,
            dashArray: "6, 8",
            fillColor: "#3b82f6",
            fillOpacity: 0.04,
          }}
        >
          <Popup>
            <div className="text-xs space-y-1 p-1">
              <strong className="text-blue-400 font-mono">Active Target Perimeter</strong>
              <div className="text-slate-300 text-[11px]">
                Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Polygon>

        {/* Heatmap Grid Points */}
        {showHeatmap && heatPoints.map((pt, idx) => {
          const intensity = pt[2];
          const color =
            intensity > 0.75
              ? "#ef4444"
              : intensity > 0.5
              ? "#f97316"
              : intensity > 0.3
              ? "#eab308"
              : "#3b82f6";

          return (
            <CircleMarker
              key={`heat-${idx}`}
              center={[pt[0], pt[1]]}
              radius={14 + intensity * 16}
              pathOptions={{
                color: "transparent",
                fillColor: color,
                fillOpacity: intensity * 0.38,
              }}
            />
          );
        })}

        {/* Dynamic Inundation Flood Polygons */}
        {showFloodZones && floodZones.map((zone) => {
          const colors = {
            critical: { stroke: "#dc2626", fill: "#ef4444", opacity: 0.55 },
            high: { stroke: "#ea580c", fill: "#f97316", opacity: 0.45 },
            moderate: { stroke: "#0284c7", fill: "#38bdf8", opacity: 0.35 },
            low: { stroke: "#0d9488", fill: "#14b8a6", opacity: 0.25 },
          };
          const style = colors[zone.severity] || colors.moderate;

          return (
            <Polygon
              key={zone.id}
              positions={zone.coords}
              pathOptions={{
                color: style.stroke,
                weight: 2,
                fillColor: style.fill,
                fillOpacity: style.opacity,
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {zone.severity.toUpperCase()} Inundation Zone
                  </div>
                  <div className="text-slate-300">
                    Estimated Flood Depth: <strong className="text-white">{zone.depthM} m</strong>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Road Network & Blockages */}
        {showRoads && blockedRoads.map((road) => {
          const isSubmerged = road.status === "submerged";
          const isBlocked = road.status === "partially_blocked";
          const isOpen = road.status === "clear";
          
          const strokeColor = isSubmerged ? "#ef4444" : isBlocked ? "#f59e0b" : "#10b981";
          const roadWeight = isSubmerged ? 6 : isBlocked ? 5 : 4;
          const roadOpacity = isSubmerged ? 1 : isBlocked ? 0.9 : 0.85;

          return (
            <React.Fragment key={road.id}>
              {/* Outer halo for closed roads */}
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

              {/* Hazard Barrier Marker */}
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

        {/* Shelters */}
        {showShelters && shelters.map((shelter) => {
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
                    Elevation: <strong className="text-emerald-300">{shelter.elevationM} m</strong>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Capacity: <strong>{shelter.capacity.toLocaleString()} persons</strong>
                  </div>
                  <div className="text-[11px] font-mono">
                    Status: <strong className={isFlooded ? "text-red-400" : "text-emerald-400"}>{shelter.status.toUpperCase()}</strong>
                  </div>
                  <div className="text-[11px] text-blue-300">
                    Safe Access: {shelter.recommendedRoute}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Critical Infrastructure */}
        {showFacilities && facilities.map((fac) => (
          <CircleMarker
            key={fac.id}
            center={[fac.lat, fac.lng]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 1.5,
              fillColor: "#3b82f6",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-xs p-1 space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1">
                  <Hospital className="w-3.5 h-3.5 text-blue-400" />
                  {fac.name}
                </div>
                <div className="text-[11px] text-slate-300 uppercase font-mono">Type: {fac.type}</div>
                <div className="text-[11px] text-slate-300">Elevation: {fac.elevationM} m</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
