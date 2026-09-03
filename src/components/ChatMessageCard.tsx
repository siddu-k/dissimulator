"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  CloudRain, 
  Mountain, 
  Users, 
  Activity, 
  Navigation, 
  Waves, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Sparkles,
  Droplets
} from "lucide-react";

interface ChatMessageCardProps {
  message: {
    role: "user" | "assistant";
    content: string;
    data?: any;
  };
}

export default function ChatMessageCard({ message }: ChatMessageCardProps) {
  const [isRoadsExpanded, setIsRoadsExpanded] = useState(false);
  const [isActionsExpanded, setIsActionsExpanded] = useState(true);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-sky-600 text-white text-xs font-medium rounded-br-none shadow-lg shadow-sky-600/20 border border-sky-500/30">
          {message.content}
        </div>
      </div>
    );
  }

  const data = message.data;

  // Case 1: Standard Assistant Message without complex structured payload
  if (!data || (!data.aiAssessment && !data.aiReport)) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[95%] p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs rounded-bl-none shadow-xl backdrop-blur-md space-y-2 leading-relaxed whitespace-pre-line">
          <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[10px] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>DisasterLens AI Officer</span>
          </div>
          <div>{message.content}</div>
        </div>
      </div>
    );
  }

  // Case 2: Prediction Output (Real-World Analysis)
  if (data.aiAssessment) {
    const { aiAssessment, weather, terrain, overallRiskScore, riskLevel, roads = [], locationName, estimatedPopulation } = data;
    const closedRoads = roads.filter((r: any) => r.status === "submerged");
    const hazardRoads = roads.filter((r: any) => r.status === "partially_blocked");
    const openRoads = roads.filter((r: any) => r.status === "clear");

    const riskColors = {
      CRITICAL: { bg: "bg-red-500/15", border: "border-red-500/40", text: "text-red-400", bar: "from-red-600 to-rose-500", dot: "bg-red-500" },
      HIGH: { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400", bar: "from-amber-600 to-orange-500", dot: "bg-amber-500" },
      MODERATE: { bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-400", bar: "from-yellow-600 to-amber-500", dot: "bg-yellow-500" },
      LOW: { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400", bar: "from-emerald-600 to-teal-500", dot: "bg-emerald-500" },
    };
    const currentRisk = riskColors[riskLevel as keyof typeof riskColors] || riskColors.MODERATE;

    return (
      <div className="flex justify-start w-full">
        <div className="w-full max-w-[98%] rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800/90 text-slate-100 p-4 rounded-bl-none shadow-2xl backdrop-blur-xl space-y-3.5">
          {/* Header Card: Model Badge & Real Hazard Level */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                  {locationName}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Gemini 3.5 Flash Lite</span>
                  <span>&bull;</span>
                  <span className="text-sky-400 font-semibold">Live GIS Telemetry</span>
                </div>
              </div>
            </div>

            {/* Risk Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${currentRisk.bg} ${currentRisk.border} ${currentRisk.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentRisk.dot} animate-ping`} />
              <span>{riskLevel} THREAT</span>
            </div>
          </div>

          {/* Risk Level Progress Indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                Multi-Factor Threat Index
              </span>
              <span className="font-bold text-white">{overallRiskScore} / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div 
                className={`h-full bg-gradient-to-r ${currentRisk.bar} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(100, Math.max(5, overallRiskScore))}%` }}
              />
            </div>
          </div>

          {/* Real Telemetry Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>24h Rainfall</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {weather?.forecast24hRainfallMm ?? 0} <span className="text-[10px] text-slate-400 font-normal">mm</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Now: {weather?.currentRainfallMm ?? 0} mm/h
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                <span>Elevation</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {terrain?.elevationM ?? 0} <span className="text-[10px] text-slate-400 font-normal">m</span>
              </div>
              <div className="text-[9px] text-slate-400 capitalize truncate">
                {(terrain?.terrainType || "coastal").replace("_", " ")}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Soil Moisture</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {weather?.soilMoistureIndex ?? 70}%
              </div>
              <div className="text-[9px] text-slate-400">
                Ground saturation
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Population</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {(estimatedPopulation || 0).toLocaleString()}
              </div>
              <div className="text-[9px] text-slate-400">
                In monitored perimeter
              </div>
            </div>
          </div>

          {/* AI Assessment & Answer Card */}
          <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/30 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Assessment & Operational Response:</span>
            </div>
            <p className="text-slate-200">
              {aiAssessment.summary}
            </p>
            {aiAssessment.vulnerableZones && (
              <div className="text-[11px] text-slate-300 pt-1 border-t border-sky-900/30">
                <span className="font-semibold text-amber-300">Vulnerable Topography: </span>
                {aiAssessment.vulnerableZones}
              </div>
            )}
          </div>

          {/* Real Roads Status Section */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 overflow-hidden">
            <button
              onClick={() => setIsRoadsExpanded(!isRoadsExpanded)}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-white">Road Closures & Transit Routes</span>
                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-mono text-[10px] font-bold">
                  {closedRoads.length} Closed
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  {openRoads.length} Open
                </span>
              </div>
              {isRoadsExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isRoadsExpanded && (
              <div className="p-3 border-t border-slate-800 space-y-2 text-[11px]">
                {closedRoads.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-red-400 font-bold uppercase text-[10px] tracking-wider block">
                      🚧 Submerged & Impassable Roads:
                    </span>
                    <div className="space-y-1">
                      {closedRoads.map((road: any) => (
                        <div key={road.id} className="p-1.5 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center justify-between">
                          <span className="font-medium text-slate-200">{road.name}</span>
                          <span className="text-red-300 font-mono font-bold text-[10px]">
                            {road.waterDepthCm > 0 ? `${road.waterDepthCm}cm Submerged` : "Blocked"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-emerald-400 text-[11px]">
                    ✓ No arterial roads currently submerged under present rainfall.
                  </div>
                )}

                {openRoads.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block">
                      🟢 Verified Clear Transit Routes:
                    </span>
                    <div className="space-y-1">
                      {openRoads.slice(0, 3).map((road: any) => (
                        <div key={road.id} className="p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-between">
                          <span className="font-medium text-slate-200">{road.name}</span>
                          <span className="text-emerald-400 font-mono text-[10px]">Passable</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actionable Precautions & Directives */}
          {aiAssessment.precautions && aiAssessment.precautions.length > 0 && (
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 overflow-hidden">
              <button
                onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recommended Safety Directives ({aiAssessment.precautions.length})</span>
                </div>
                {isActionsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {isActionsExpanded && (
                <div className="p-3 border-t border-slate-800 space-y-1.5 text-[11px]">
                  {aiAssessment.precautions.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Case 3: Simulation Output
  if (data.aiReport) {
    const { aiReport, maxAffectedAreaKm2, maxPeopleExposed, timeSteps = [], params, locationName } = data;
    const lastStep = timeSteps[timeSteps.length - 1];
    const blockedCount = lastStep?.blockedRoadsCount || 0;
    const openShelters = lastStep?.accessibleShelters?.filter((s: any) => s.status === "open") || [];

    return (
      <div className="flex justify-start w-full">
        <div className="w-full max-w-[98%] rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-sky-900/50 text-slate-100 p-4 rounded-bl-none shadow-2xl backdrop-blur-xl space-y-3.5">
          {/* Header Card: Simulation Title */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-600/20 border border-sky-500/40 text-sky-400">
                <Waves className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Hydrodynamic Flood Simulation
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>{locationName}</span>
                  <span>&bull;</span>
                  <span className="text-sky-400 font-semibold">{params?.rainfallMm || 300}mm / {params?.durationHours || 12}h</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-[10px] font-bold font-mono text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>SIMULATED IMPACT</span>
            </div>
          </div>

          {/* Key Simulation Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                <span>Submerged Area</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {maxAffectedAreaKm2} <span className="text-[10px] text-slate-400 font-normal">km²</span>
              </div>
              <div className="text-[9px] text-slate-400">Peak flood footprint</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>Exposed Pop</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {(maxPeopleExposed || 0).toLocaleString()}
              </div>
              <div className="text-[9px] text-slate-400">In danger basin</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Road Closures</span>
              </div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-1">
                {blockedCount} <span className="text-[10px] text-slate-400 font-normal">routes</span>
              </div>
              <div className="text-[9px] text-slate-400">Impassable roads</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safe Shelters</span>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                {openShelters.length} <span className="text-[10px] text-slate-400 font-normal">open</span>
              </div>
              <div className="text-[9px] text-slate-400">High-ground centers</div>
            </div>
          </div>

          {/* AI Situation Overview Card */}
          <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/30 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Situation Summary & Deluge Crest:</span>
            </div>
            <p className="text-slate-200">
              {aiReport.situationSummary}
            </p>
            {aiReport.infrastructureImpactAnalysis && (
              <div className="text-[11px] text-slate-300 pt-1 border-t border-sky-900/30">
                <span className="font-semibold text-amber-300">Infrastructure Impact: </span>
                {aiReport.infrastructureImpactAnalysis}
              </div>
            )}
          </div>

          {/* Evacuation Directives */}
          {aiReport.evacuationPriorities && aiReport.evacuationPriorities.length > 0 && (
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Urgent Evacuation Directives:</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {aiReport.evacuationPriorities.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[94%] p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-bl-none shadow-md leading-relaxed whitespace-pre-line">
        {message.content}
      </div>
    </div>
  );
}
