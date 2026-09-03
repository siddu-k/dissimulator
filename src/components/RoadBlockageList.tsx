"use client";

import React from "react";
import { RoadSegment } from "@/types";
import { AlertOctagon, CheckCircle2, AlertTriangle, ArrowRight, CornerDownRight } from "lucide-react";

interface RoadBlockageListProps {
  roads: RoadSegment[];
}

export default function RoadBlockageList({ roads }: RoadBlockageListProps) {
  if (!roads || roads.length === 0) return null;

  const blockedCount = roads.filter((r) => r.status !== "clear").length;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Transit Corridors & Road Blockages
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
            blockedCount > 0
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {blockedCount} / {roads.length} Disrupted
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {roads.map((road) => {
          const isSubmerged = road.status === "submerged";
          const isBlocked = road.status === "partially_blocked";

          return (
            <div
              key={road.id}
              className={`p-2.5 rounded-xl border text-xs transition ${
                isSubmerged
                  ? "bg-red-950/30 border-red-500/40 text-red-200"
                  : isBlocked
                  ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                  : "bg-slate-900/40 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between font-medium">
                <span className="font-semibold text-white">{road.name}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSubmerged
                      ? "bg-red-500 text-white"
                      : isBlocked
                      ? "bg-amber-500 text-slate-950"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {isSubmerged ? "🚧 SUBMERGED" : isBlocked ? "⚠️ IMPASSABLE" : "CLEAR"}
                </span>
              </div>

              {road.waterDepthCm > 0 && (
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Water Inundation Level:</span>
                  <span className="font-mono font-bold text-red-400">{road.waterDepthCm} cm</span>
                </div>
              )}

              {road.detourName && (isSubmerged || isBlocked) && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-blue-300">
                  <CornerDownRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400">Reroute:</span>{" "}
                    <strong className="text-white">{road.detourName}</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
