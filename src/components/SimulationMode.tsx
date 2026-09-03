"use client";

import React, { useState } from "react";
import { 
  BoundingBox, 
  DisasterType, 
  GeoPoint, 
  SimulationParams, 
  SimulationResult 
} from "@/types";
import DisasterMap from "./Map/DisasterMap";
import TimelineScrubber from "./TimelineScrubber";
import RoadBlockageList from "./RoadBlockageList";
import ShelterList from "./ShelterList";
import { 
  Sliders, 
  Play, 
  Sparkles, 
  Loader2, 
  CloudRain, 
  Clock, 
  Waves, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Wand2,
  Layers,
  ArrowRight
} from "lucide-react";

interface SimulationModeProps {
  currentCenter: GeoPoint;
  currentBbox: BoundingBox;
  onCenterChange: (center: GeoPoint, bbox: BoundingBox) => void;
  simulation: SimulationResult | null;
  loading: boolean;
  onRunSimulation: (params: SimulationParams) => void;
  locationName: string;
  apiKey: string;
  selectedModel: string;
}

export default function SimulationMode({
  currentCenter,
  currentBbox,
  onCenterChange,
  simulation,
  loading,
  onRunSimulation,
  locationName,
  apiKey,
  selectedModel,
}: SimulationModeProps) {
  // Scenario Builder State
  const [disasterType, setDisasterType] = useState<DisasterType>("flood");
  const [rainfallMm, setRainfallMm] = useState(300);
  const [durationHours, setDurationHours] = useState(12);
  const [riverLevelIncreaseM, setRiverLevelIncreaseM] = useState(2.5);
  const [soilSaturationPercent, setSoilSaturationPercent] = useState(85);
  const [severity, setSeverity] = useState<SimulationParams["severity"]>("severe");

  // Natural Language Prompt
  const [nlPrompt, setNlPrompt] = useState("");
  const [parsingPrompt, setParsingPrompt] = useState(false);

  // Time step scrubber index
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Natural language scenario parsing with Gemini
  const handleParseNlPrompt = async () => {
    if (!nlPrompt.trim()) return;
    setParsingPrompt(true);
    try {
      const res = await fetch("/api/parse-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nlPrompt, apiKey, model: selectedModel }),
      });
      const data = await res.json();
      if (data && !data.error) {
        if (data.disasterType) setDisasterType(data.disasterType);
        if (data.rainfallMm) setRainfallMm(data.rainfallMm);
        if (data.durationHours) setDurationHours(data.durationHours);
        if (data.riverLevelIncreaseM) setRiverLevelIncreaseM(data.riverLevelIncreaseM);
        if (data.soilSaturationPercent) setSoilSaturationPercent(data.soilSaturationPercent);
        if (data.severity) setSeverity(data.severity);
      }
    } catch (err) {
      console.warn("Failed to parse NL prompt:", err);
    } finally {
      setParsingPrompt(false);
    }
  };

  const handleExecuteSimulation = () => {
    onRunSimulation({
      disasterType,
      rainfallMm,
      durationHours,
      riverLevelIncreaseM,
      soilSaturationPercent,
      severity,
      customPrompt: nlPrompt || undefined,
    });
    setCurrentStepIndex(0);
  };

  // Active step data
  const activeStep = simulation?.timeSteps[currentStepIndex] || simulation?.timeSteps[0];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1700px] mx-auto w-full">
      {/* Header Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Disaster Scenario Simulation & What-If Engine
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                HYDRODYNAMIC SPATIAL PROPAGATION
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Model severe deluge impact, progressive road network blockages, and shelter accessibility over time
            </p>
          </div>
        </div>

        <button
          onClick={handleExecuteSimulation}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Computing Spatial Physics...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              Run Disaster Simulation
            </>
          )}
        </button>
      </div>

      {/* Scenario Builder Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        {/* Natural Language Prompt Assistant */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pb-3 border-b border-slate-800/80">
          <div className="relative flex-1">
            <Wand2 className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nlPrompt}
              onChange={(e) => setNlPrompt(e.target.value)}
              placeholder="E.g., 'Simulate a severe cloudburst of 320mm rain in 12h over low-lying riverbanks'"
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full"
            />
          </div>
          <button
            onClick={handleParseNlPrompt}
            disabled={parsingPrompt || !nlPrompt.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold disabled:opacity-40 transition"
          >
            {parsingPrompt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            Auto-Configure Parameters
          </button>
        </div>

        {/* Structured Parameter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Disaster Type */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-slate-400">Disaster Category</label>
            <select
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value as DisasterType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="flood">Flood (Hydrological)</option>
              <option value="heavy_rainfall">Extreme Cloudburst</option>
              <option value="dam_break">Dam / Reservoir Breach</option>
              <option value="cyclone_surge">Cyclone Coastal Surge</option>
              <option value="landslide">Landslide & Mudflow</option>
            </select>
          </div>

          {/* Rainfall Amount */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Simulated Rainfall</span>
              <span className="text-white font-bold">{rainfallMm} mm</span>
            </div>
            <input
              type="range"
              min={50}
              max={600}
              step={10}
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Event Duration</span>
              <span className="text-white font-bold">{durationHours} hours</span>
            </div>
            <input
              type="range"
              min={3}
              max={48}
              step={1}
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* River Water Surge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>River Crest Increase</span>
              <span className="text-white font-bold">+{riverLevelIncreaseM} m</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.1}
              value={riverLevelIncreaseM}
              onChange={(e) => setRiverLevelIncreaseM(Number(e.target.value))}
              className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Severity Presets */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-slate-400">Severity Preset</label>
            <div className="grid grid-cols-4 gap-1">
              {(["minor", "moderate", "severe", "catastrophic"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  className={`py-1.5 rounded-lg text-[10px] uppercase font-bold transition ${
                    severity === lvl
                      ? lvl === "catastrophic"
                        ? "bg-red-600 text-white shadow"
                        : lvl === "severe"
                        ? "bg-orange-500 text-white shadow"
                        : "bg-blue-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulation View Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Column: Map & Timeline Scrubber */}
        <div className="xl:col-span-7 space-y-4">
          <div className="h-[480px] lg:h-[540px] w-full">
            <DisasterMap
              center={currentCenter}
              boundingBox={currentBbox}
              onCenterChange={onCenterChange}
              floodZones={activeStep?.floodZones || []}
              blockedRoads={activeStep?.blockedRoads || simulation?.allRoads || []}
              shelters={activeStep?.accessibleShelters || simulation?.allShelters || []}
              facilities={simulation?.criticalFacilities || []}
              heatPoints={activeStep?.heatPoints || []}
              activeHour={activeStep?.hour}
              interactiveMode={true}
            />
          </div>

          {/* Animated Timeline Scrubber */}
          {simulation && (
            <TimelineScrubber
              timeSteps={simulation.timeSteps}
              currentStepIndex={currentStepIndex}
              onStepChange={setCurrentStepIndex}
            />
          )}
        </div>

        {/* Right Column: Road Blockages, Shelters & AI Briefing */}
        <div className="xl:col-span-5 space-y-4">
          {simulation ? (
            <>
              {/* Road Blockages & Detours */}
              <RoadBlockageList roads={activeStep?.blockedRoads || []} />

              {/* Safe High-Ground Shelters */}
              <ShelterList shelters={activeStep?.accessibleShelters || []} />

              {/* Gemini AI Simulation Operational Briefing */}
              <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      AI Tactical Emergency Briefing
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">
                    Gemini Coordinator
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-slate-200">
                    <strong className="text-cyan-400 block mb-1">Operational Summary:</strong>
                    {simulation.aiReport.situationSummary}
                  </div>

                  <div>
                    <strong className="text-white block mb-1">🌊 Inundation Hotspots:</strong>
                    <p className="text-slate-300">{simulation.aiReport.mostVulnerableAreas}</p>
                  </div>

                  <div>
                    <strong className="text-white block mb-1">👥 Population Threat:</strong>
                    <p className="text-slate-300">{simulation.aiReport.humanImpactAnalysis}</p>
                  </div>

                  <div>
                    <strong className="text-white block mb-1">🚧 Road Transit Disruptions:</strong>
                    <p className="text-slate-300">{simulation.aiReport.infrastructureImpactAnalysis}</p>
                  </div>

                  {/* Evacuation Priorities */}
                  <div>
                    <strong className="text-amber-400 block mb-1.5">🚨 Evacuation Directives:</strong>
                    <ul className="space-y-1">
                      {simulation.aiReport.evacuationPriorities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Operational Actions */}
                  <div>
                    <strong className="text-emerald-400 block mb-1.5">🛡️ Response Units Action Plan:</strong>
                    <ul className="space-y-1">
                      {simulation.aiReport.recommendedActions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    <span>{simulation.aiReport.importantLimitations}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="p-4 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400">
                <Waves className="w-10 h-10" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-white">Scenario Ready to Execute</h3>
                <p className="text-xs text-slate-400">
                  Adjust rainfall, duration, and river crest sliders above, then click <strong>&quot;Run Disaster Simulation&quot;</strong> to compute hydrodynamic time steps and road blockages.
                </p>
              </div>
              <button
                onClick={handleExecuteSimulation}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
              >
                Run Disaster Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
