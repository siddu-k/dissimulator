"use client";

import React from "react";
import { History, Play, Trash2, Calendar, MapPin, Sliders, ExternalLink } from "lucide-react";
import { SimulationResult } from "@/types";

interface ScenarioHistoryProps {
  history: SimulationResult[];
  onLoadScenario: (sim: SimulationResult) => void;
  onClearHistory: () => void;
}

export default function ScenarioHistory({
  history,
  onLoadScenario,
  onClearHistory,
}: ScenarioHistoryProps) {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto w-full">
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Scenario Simulation Archive</h1>
            <p className="text-xs text-slate-400">Review, reload, and audit prior disaster evaluations</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Archive
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-300">No previous simulations saved yet.</p>
          <p className="text-xs text-slate-500">Run simulations in Simulation Mode to build your audit trail.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{item.locationName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-blue-500/20 text-blue-300">
                    {item.params.disasterType}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                  <div>Precipitation: <strong className="text-white">{item.params.rainfallMm} mm</strong> ({item.params.durationHours}h)</div>
                  <div>Inundated Area: <strong className="text-blue-400">{item.maxAffectedAreaKm2} km²</strong></div>
                  <div>Population Exposed: <strong className="text-amber-400">{item.maxPeopleExposed.toLocaleString()}</strong></div>
                  <div>Blocked Roads: <strong className="text-red-400">{item.maxBlockedRoads}</strong></div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 pt-1 border-t border-slate-800/80">
                  {item.aiReport.situationSummary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button
                  onClick={() => onLoadScenario(item)}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                >
                  <Play className="w-3 h-3" />
                  Reopen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
