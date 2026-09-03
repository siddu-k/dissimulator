"use client";

import React, { useState } from "react";
import { 
  GitCompare, 
  ArrowRight, 
  TrendingUp, 
  AlertOctagon, 
  Users, 
  Layers, 
  Sparkles, 
  Play, 
  Loader2 
} from "lucide-react";
import { BoundingBox, GeoPoint, SimulationParams, SimulationResult } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ScenarioCompareProps {
  currentCenter: GeoPoint;
  currentBbox: BoundingBox;
  locationName: string;
  onRunSimulation: (params: SimulationParams) => Promise<SimulationResult | null>;
  apiKey: string;
  selectedModel: string;
}

export default function ScenarioCompare({
  currentCenter,
  currentBbox,
  locationName,
  onRunSimulation,
  apiKey,
  selectedModel,
}: ScenarioCompareProps) {
  // Scenario A
  const [rainA, setRainA] = useState(180);
  const [durA, setDurA] = useState(12);
  const [resultA, setResultA] = useState<SimulationResult | null>(null);

  // Scenario B
  const [rainB, setRainB] = useState(380);
  const [durB, setDurB] = useState(12);
  const [resultB, setResultB] = useState<SimulationResult | null>(null);

  const [loading, setLoading] = useState(false);

  const handleRunComparison = async () => {
    setLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        onRunSimulation({
          disasterType: "flood",
          rainfallMm: rainA,
          durationHours: durA,
          riverLevelIncreaseM: Math.round((rainA / 100) * 0.8 * 10) / 10,
          soilSaturationPercent: 75,
          severity: "moderate",
        }),
        onRunSimulation({
          disasterType: "flood",
          rainfallMm: rainB,
          durationHours: durB,
          riverLevelIncreaseM: Math.round((rainB / 100) * 0.8 * 10) / 10,
          soilSaturationPercent: 95,
          severity: "catastrophic",
        }),
      ]);

      if (resA) setResultA(resA);
      if (resB) setResultB(resB);
    } catch (err) {
      console.warn("Comparison execution failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const areaA = resultA?.maxAffectedAreaKm2 || Math.round((rainA / 300) * 14 * 10) / 10;
  const areaB = resultB?.maxAffectedAreaKm2 || Math.round((rainB / 300) * 14 * 10) / 10;
  const peopleA = resultA?.maxPeopleExposed || Math.round(areaA * 2800);
  const peopleB = resultB?.maxPeopleExposed || Math.round(areaB * 2800);
  const roadsA = resultA?.maxBlockedRoads || 2;
  const roadsB = resultB?.maxBlockedRoads || 4;

  const comparisonData = [
    { metric: "Area (km²)", ScenarioA: areaA, ScenarioB: areaB },
    { metric: "People (k)", ScenarioA: Math.round(peopleA / 100) / 10, ScenarioB: Math.round(peopleB / 100) / 10 },
    { metric: "Blocked Roads", ScenarioA: roadsA, ScenarioB: roadsB },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1700px] mx-auto w-full">
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              &quot;What-If?&quot; Scenario Comparative Engine
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                DUAL HYPOTHETICAL STRESS-TEST
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Directly contrast mild vs severe deluge parameters to quantify escalation deltas
            </p>
          </div>
        </div>

        <button
          onClick={handleRunComparison}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Simulating Both Scenarios...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Run Dual Comparison
            </>
          )}
        </button>
      </div>

      {/* Scenario Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A Card */}
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-sm font-bold text-white uppercase font-mono">Scenario A (Baseline)</h2>
            </div>
            <span className="text-xs font-mono text-blue-400">{rainA} mm / {durA}h</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Rainfall Intensity</span>
                <span className="text-white font-bold">{rainA} mm</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={rainA}
                onChange={(e) => setRainA(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Duration</span>
                <span className="text-white font-bold">{durA} hours</span>
              </div>
              <input
                type="range"
                min={3}
                max={48}
                value={durA}
                onChange={(e) => setDurA(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] text-slate-400 font-mono">Area</div>
              <div className="text-sm font-bold text-white font-mono">{areaA} km²</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] text-slate-400 font-mono">People</div>
              <div className="text-sm font-bold text-white font-mono">{peopleA.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] text-slate-400 font-mono">Roads Blocked</div>
              <div className="text-sm font-bold text-white font-mono">{roadsA}</div>
            </div>
          </div>
        </div>

        {/* Scenario B Card */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <h2 className="text-sm font-bold text-white uppercase font-mono">Scenario B (Escalated Stress Test)</h2>
            </div>
            <span className="text-xs font-mono text-purple-400">{rainB} mm / {durB}h</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Rainfall Intensity</span>
                <span className="text-white font-bold">{rainB} mm</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={rainB}
                onChange={(e) => setRainB(Number(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Duration</span>
                <span className="text-white font-bold">{durB} hours</span>
              </div>
              <input
                type="range"
                min={3}
                max={48}
                value={durB}
                onChange={(e) => setDurB(Number(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] text-slate-400 font-mono">Area</div>
              <div className="text-sm font-bold text-purple-400 font-mono">{areaB} km²</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] text-slate-400 font-mono">People</div>
              <div className="text-sm font-bold text-purple-400 font-mono">{peopleB.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] text-slate-400 font-mono">Roads Blocked</div>
              <div className="text-sm font-bold text-purple-400 font-mono">{roadsB}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Impact Comparison Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            Escalation Impact Delta (Scenario B vs Scenario A)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Additional Inundated Area</div>
            <div className="text-xl font-black text-red-400 font-mono mt-1">
              +{(Math.max(0, areaB - areaA)).toFixed(1)} km²
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              +{Math.round(((areaB - areaA) / Math.max(1, areaA)) * 100)}% spatial expansion
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Additional Population Exposed</div>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              +{(Math.max(0, peopleB - peopleA)).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              High vulnerability surge
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Additional Road Severances</div>
            <div className="text-xl font-black text-orange-400 font-mono mt-1">
              +{(Math.max(0, roadsB - roadsA))} Corridors
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Critical evacuation routes cut off
            </div>
          </div>
        </div>

        {/* Side-by-side Chart */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-300 mb-2">Comparative Metrics Visualization</div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="ScenarioA" fill="#3b82f6" name="Scenario A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ScenarioB" fill="#a855f7" name="Scenario B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
