"use client";

import React from "react";
import { SafeShelter } from "@/types";
import { Home, ShieldCheck, AlertTriangle, Users, Navigation } from "lucide-react";

interface ShelterListProps {
  shelters: SafeShelter[];
}

export default function ShelterList({ shelters }: ShelterListProps) {
  if (!shelters || shelters.length === 0) return null;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            High-Ground Safe Shelters & Evacuation Points
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {shelters.filter((s) => s.status === "open").length} / {shelters.length} Available
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {shelters.map((shelter) => {
          const isFlooded = shelter.status === "flooded";
          const isRisk = shelter.status === "risk_adjacent";
          const isCapacity = shelter.status === "at_capacity";

          return (
            <div
              key={shelter.id}
              className={`p-2.5 rounded-xl border text-xs transition ${
                isFlooded
                  ? "bg-red-950/30 border-red-500/40 text-red-300"
                  : isRisk
                  ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                  : isCapacity
                  ? "bg-purple-950/20 border-purple-500/30 text-purple-200"
                  : "bg-slate-900/50 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{shelter.name}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isFlooded
                      ? "bg-red-500 text-white"
                      : isRisk
                      ? "bg-amber-500 text-slate-950"
                      : isCapacity
                      ? "bg-purple-500 text-white"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {shelter.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span>Elevation: <strong className="text-emerald-400">{shelter.elevationM}m</strong></span>
                <span>Capacity: <strong className="text-white">{shelter.capacity.toLocaleString()}</strong></span>
              </div>

              <div className="mt-1.5 pt-1 border-t border-slate-800/60 text-[11px] text-blue-300 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{shelter.recommendedRoute}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
