"use client";

import React, { useState } from "react";
import { 
  BoundingBox, 
  GeoPoint, 
  PredictionResult, 
  PresetLocation 
} from "@/types";
import DisasterMap from "./Map/DisasterMap";
import AnalyticsPanel from "./AnalyticsPanel";
import RoadBlockageList from "./RoadBlockageList";
import ShelterList from "./ShelterList";
import { 
  Activity, 
  Sparkles, 
  Loader2, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Info,
  Layers,
  Search,
  ExternalLink
} from "lucide-react";

interface PredictModeProps {
  currentCenter: GeoPoint;
  currentBbox: BoundingBox;
  onCenterChange: (center: GeoPoint, bbox: BoundingBox) => void;
  prediction: PredictionResult | null;
  loading: boolean;
  onRunPrediction: () => void;
  locationName: string;
  setLocationName: (name: string) => void;
}

export default function PredictMode({
  currentCenter,
  currentBbox,
  onCenterChange,
  prediction,
  loading,
  onRunPrediction,
  locationName,
  setLocationName,
}: PredictModeProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Search geocoding using free OpenStreetMap Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const span = 0.045;
        const bbox: BoundingBox = {
          north: lat + span,
          south: lat - span,
          east: lng + span * 1.2,
          west: lng - span * 1.2,
        };
        setLocationName(item.display_name.split(",")[0]);
        onCenterChange({ lat, lng }, bbox);
      }
    } catch (err) {
      console.warn("Geocoding failed:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1700px] mx-auto w-full">
      {/* Action Header & Location Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Real-World Disaster Risk Prediction
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE METEOROLOGICAL TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Select any global coordinate to evaluate hydrological vulnerability & multi-factor risk
            </p>
          </div>
        </div>

        {/* Search & Analyze Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search city, river, or region..."
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-60"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchInput.trim()}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 transition"
            >
              {searchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Locate"}
            </button>
          </form>

          <button
            onClick={onRunPrediction}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Analyzing Region...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Analyze Target Area
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Map (60%) vs Right Analytics (40%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Column: Interactive GIS Map */}
        <div className="xl:col-span-7 space-y-4">
          <div className="h-[520px] lg:h-[620px] w-full">
            <DisasterMap
              center={currentCenter}
              boundingBox={currentBbox}
              onCenterChange={onCenterChange}
              heatPoints={prediction?.heatPoints || []}
              shelters={prediction?.infrastructure?.criticalFacilities?.filter(f => f.type === "shelter") as any}
              facilities={prediction?.infrastructure?.criticalFacilities}
              interactiveMode={true}
            />
          </div>

          {/* Area Coordinates and Scope Details */}
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Target: <strong className="text-white">{locationName}</strong></span>
            </div>
            <div>
              Perimeter: [{currentBbox.north.toFixed(3)}, {currentBbox.west.toFixed(3)}] to [{currentBbox.south.toFixed(3)}, {currentBbox.east.toFixed(3)}]
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Metrics & AI Assessment */}
        <div className="xl:col-span-5 space-y-4">
          {prediction ? (
            <>
              {/* Analytics & Risk Gauges */}
              <AnalyticsPanel prediction={prediction} />

              {/* GenAI Assessment Card */}
              <div className="glass-panel p-4 rounded-2xl border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      AI Disaster Risk Assessment
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-blue-300">
                    Gemini Intelligence
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-slate-200">
                    <strong className="text-blue-400 block mb-1">Executive Summary:</strong>
                    {prediction.aiAssessment.summary}
                  </div>

                  <div>
                    <strong className="text-white block mb-1">🌊 Vulnerable Lowland Sectors:</strong>
                    <p className="text-slate-300">{prediction.aiAssessment.vulnerableZones}</p>
                  </div>

                  <div>
                    <strong className="text-white block mb-1">👥 Human & Population Impact:</strong>
                    <p className="text-slate-300">{prediction.aiAssessment.peopleImpact}</p>
                  </div>

                  <div>
                    <strong className="text-white block mb-1">🚧 Road Transit & Infrastructure:</strong>
                    <p className="text-slate-300">{prediction.aiAssessment.roadRisks}</p>
                  </div>

                  {/* Actionable Precautions */}
                  <div>
                    <strong className="text-emerald-400 block mb-1.5">🛡️ Recommended Mitigation Actions:</strong>
                    <ul className="space-y-1">
                      {prediction.aiAssessment.precautions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evacuation Priorities */}
                  <div>
                    <strong className="text-amber-400 block mb-1.5">🚨 Evacuation Tiers:</strong>
                    <ul className="space-y-1">
                      {prediction.aiAssessment.evacuationPriorities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Scientific Disclaimer */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    <span>{prediction.aiAssessment.limitations}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-white">Target Area Ready for Analysis</h3>
                <p className="text-xs text-slate-400">
                  Click <strong>&quot;Analyze Target Area&quot;</strong> to gather live Open-Meteo precipitation, digital elevation models, and Gemini AI multi-factor threat synthesis.
                </p>
              </div>
              <button
                onClick={onRunPrediction}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
              >
                Analyze Target Area
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
