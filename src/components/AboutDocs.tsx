"use client";

import React from "react";
import { Info, ShieldCheck, Database, Cpu, Activity, Sparkles, Navigation, Layers } from "lucide-react";

export default function AboutDocs() {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto w-full text-slate-300 text-sm">
      {/* Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white font-mono">DisasterLens — AI Architecture & Methodology</h1>
            <p className="text-xs text-slate-400">
              Next-Generation Hydro-Meteorological Intelligence, Spatial GIS Modeling & Gemini AI Synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Two-Mode Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold font-mono text-sm">
            <Activity className="w-4 h-4" />
            Mode 1: Real-World Risk Prediction
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acquires live meteorological atmospheric feeds from Open-Meteo API (24h forecasted rainfall, precipitation rate, soil moisture indices, atmospheric pressure) and digital elevation models (DEM) to compute a transparent, multi-factor weighted vulnerability index.
          </p>
          <ul className="text-xs space-y-1 text-slate-400 list-disc list-inside">
            <li>Precipitation Volume & Cloudburst Risk (30% weight)</li>
            <li>Digital Elevation & Valley Funneling (25% weight)</li>
            <li>Riparian & Water Body Proximity (20% weight)</li>
            <li>Soil Saturation Index (10% weight)</li>
            <li>Demographic Exposure Density (10% weight)</li>
          </ul>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm">
            <Layers className="w-4 h-4" />
            Mode 2: What-If Hydrodynamic Simulation
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Executes spatial flood physics modeling across time steps (0h to 24h+), computing progressive catchment overflow, roadway inundation (🚧 ROAD BLOCKED) with dynamic detour suggestions, and emergency high-ground shelter accessibility.
          </p>
          <ul className="text-xs space-y-1 text-slate-400 list-disc list-inside">
            <li>Natural language scenario extraction via Gemini</li>
            <li>Hydrodynamic S-curve flood expansion calculation</li>
            <li>Submerged road segment classification & rerouting</li>
            <li>Safe shelter elevation verification & capacity metrics</li>
          </ul>
        </div>
      </div>

      {/* Data Sources & Stack */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          Tech Stack & Public Open APIs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-white block mb-1">Open-Meteo & DEM:</strong>
            Real-time global weather forecast & elevation grid without API key restrictions.
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-white block mb-1">Google GenAI SDK:</strong>
            Powered by <code>@google/genai</code> with Gemini 2.5 Flash Lite & Gemini 3.7 Flash for low-latency disaster reasoning.
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-white block mb-1">Leaflet GIS & Recharts:</strong>
            High-performance hardware-accelerated interactive GIS mapping and telemetry charting.
          </div>
        </div>
      </div>

      {/* Important Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-1">
        <strong className="text-amber-400 font-bold block">Scientific & Prototype Disclaimer:</strong>
        DisasterLens is an AI-assisted decision-support prototype created for hackathon demonstration. Numerical hydrodynamic simulations and risk indices are intended for emergency preparedness modeling and must not replace statutory civil protection directives.
      </div>
    </div>
  );
}
