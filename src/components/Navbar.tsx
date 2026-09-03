"use client";

import React from "react";
import { 
  Activity, 
  Layers, 
  Sliders, 
  GitCompare, 
  History, 
  Bot, 
  Key, 
  Info, 
  MapPin, 
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { PRESET_LOCATIONS } from "@/lib/presetLocations";
import { PresetLocation } from "@/types";

interface NavbarProps {
  activeTab: "predict" | "simulate" | "compare" | "history" | "about";
  setActiveTab: (tab: "predict" | "simulate" | "compare" | "history" | "about") => void;
  selectedPreset: PresetLocation | null;
  onSelectPreset: (preset: PresetLocation) => void;
  onOpenSettings: () => void;
  onToggleChat: () => void;
  selectedModel: string;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedPreset,
  onSelectPreset,
  onOpenSettings,
  onToggleChat,
  selectedModel,
}: NavbarProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">
                DISASTER<span className="text-blue-400">LENS</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AI COMMAND
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Hydro-Meteorological Intelligence</p>
          </div>
        </div>

        {/* Hotspot Presets Dropdown */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400 text-[11px]">Hotspot:</span>
          <select
            value={selectedPreset?.id || ""}
            onChange={(e) => {
              const preset = PRESET_LOCATIONS.find((p) => p.id === e.target.value);
              if (preset) onSelectPreset(preset);
            }}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
          >
            {PRESET_LOCATIONS.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-slate-900 text-white">
                {preset.name} ({preset.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Navigation Modes */}
      <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab("predict")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "predict"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Predict Mode</span>
        </button>

        <button
          onClick={() => setActiveTab("simulate")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "simulate"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Simulation Mode</span>
        </button>

        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "compare"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <GitCompare className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">What-If Compare</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "history"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden md:inline">History</span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "about"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Docs</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Active Model Indicator */}
        <button
          onClick={onOpenSettings}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:border-slate-700 transition"
          title="Click to configure Gemini API & Model"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-xs">{selectedModel.replace("gemini-", "Gemini ")}</span>
          <Key className="w-3 h-3 text-slate-400 ml-1" />
        </button>

        {/* AI Commander Chat Button */}
        <button
          onClick={onToggleChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 hover:brightness-110 active:scale-95 transition"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Commander</span>
        </button>
      </div>
    </header>
  );
}
