"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Clock, AlertTriangle, Users, Car } from "lucide-react";
import { SimulationTimeStep } from "@/types";

interface TimelineScrubberProps {
  timeSteps: SimulationTimeStep[];
  currentStepIndex: number;
  onStepChange: React.Dispatch<React.SetStateAction<number>>;
}

export default function TimelineScrubber({
  timeSteps,
  currentStepIndex,
  onStepChange,
}: TimelineScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);

  const currentStep = timeSteps[currentStepIndex] || timeSteps[0];
  const maxIndex = Math.max(0, timeSteps.length - 1);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        onStepChange((prev: number) => {
          if (prev >= maxIndex) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxIndex, onStepChange, speed]);

  if (!timeSteps || timeSteps.length === 0) return null;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      {/* Top Telemetry at this exact time step */}
      <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-400">Inundated Area</div>
          <div className="text-base font-extrabold text-blue-400 font-mono">
            {currentStep?.affectedAreaKm2} <span className="text-xs font-normal">km²</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-400">People Impacted</div>
          <div className="text-base font-extrabold text-amber-400 font-mono">
            {currentStep?.peopleExposed.toLocaleString()}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-400">Blocked Roads</div>
          <div className="text-base font-extrabold text-red-400 font-mono">
            {currentStep?.blockedRoadsCount} <span className="text-xs font-normal">routes</span>
          </div>
        </div>
      </div>

      {/* Scrubber Controls */}
      <div className="flex items-center gap-3">
        {/* Play / Pause Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onStepChange(0)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Reset to 0h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (currentStepIndex >= maxIndex) onStepChange(0);
              setIsPlaying(!isPlaying);
            }}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => onStepChange(Math.min(maxIndex, currentStepIndex + 1))}
            disabled={currentStepIndex === maxIndex}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Range Slider Scrubber */}
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-white font-bold">
              <Clock className="w-3 h-3 text-blue-400" />
              Hour {currentStep?.hour}
            </span>
            <span>Max {timeSteps[timeSteps.length - 1]?.hour}h</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxIndex}
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              onStepChange(Number(e.target.value));
            }}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Speed Toggle */}
        <button
          onClick={() => setSpeed(speed === 1 ? 2 : 1)}
          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition"
        >
          {speed}x
        </button>
      </div>

      {/* Step Markers indicator */}
      <div className="flex justify-between px-1">
        {timeSteps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsPlaying(false);
              onStepChange(idx);
            }}
            className={`text-[10px] font-mono px-1 rounded transition ${
              currentStepIndex === idx
                ? "text-blue-400 font-bold bg-blue-500/20 border border-blue-500/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {step.hour}h
          </button>
        ))}
      </div>
    </div>
  );
}
