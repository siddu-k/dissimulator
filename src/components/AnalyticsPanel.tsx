"use client";

import React from "react";
import { PredictionResult, RiskLevel } from "@/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  RadialBarChart,
  RadialBar
} from "recharts";
import { 
  CloudRain, 
  Mountain, 
  Waves, 
  Users, 
  Building2, 
  Compass, 
  Droplets, 
  Wind, 
  Gauge, 
  AlertOctagon,
  ShieldCheck
} from "lucide-react";

interface AnalyticsPanelProps {
  prediction: PredictionResult;
}

export default function AnalyticsPanel({ prediction }: AnalyticsPanelProps) {
  const { overallRiskScore, riskLevel, categoryScores, weather, terrain, estimatedPopulation, areaKm2 } = prediction;

  const chartData = [
    { name: "Precipitation", score: categoryScores.rainfall, color: "#3b82f6" },
    { name: "Elevation", score: categoryScores.elevation, color: "#8b5cf6" },
    { name: "Water Body", score: categoryScores.waterProximity, color: "#06b6d4" },
    { name: "Soil Saturation", score: categoryScores.historical, color: "#f59e0b" },
    { name: "Population", score: categoryScores.populationExposure, color: "#ec4899" },
    { name: "Infrastructure", score: categoryScores.infrastructureVulnerability, color: "#f97316" },
  ];

  const radialData = [
    {
      name: "Risk Score",
      value: overallRiskScore,
      fill: overallRiskScore >= 75 ? "#ef4444" : overallRiskScore >= 55 ? "#f97316" : overallRiskScore >= 35 ? "#eab308" : "#10b981",
    },
  ];

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/40 glow-danger";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40 glow-warning";
      case "MODERATE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "LOW":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Level Risk Badge Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={8}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <span className="absolute text-sm font-black font-mono text-white">
              {overallRiskScore}
            </span>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Assessed Threat Index
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide border ${getRiskBadge(riskLevel)}`}>
                {riskLevel} RISK
              </span>
              <span className="text-xs text-slate-400 font-mono">({overallRiskScore}/100)</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-mono text-slate-400">Perimeter Scope</div>
          <div className="text-sm font-bold text-white font-mono">{areaKm2} km²</div>
          <div className="text-[11px] text-slate-400">~{estimatedPopulation.toLocaleString()} Residents</div>
        </div>
      </div>

      {/* Atmospheric Real-Time Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="glass-panel p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            24h Rain Forecast
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {weather.forecast24hRainfallMm} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[10px] text-blue-300">Rate: {weather.currentRainfallMm} mm/h</div>
        </div>

        <div className="glass-panel p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
            <Mountain className="w-3.5 h-3.5 text-purple-400" />
            Terrain Elevation
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {terrain.elevationM} <span className="text-xs font-normal text-slate-400">m avg</span>
          </div>
          <div className="text-[10px] text-purple-300">Min: {terrain.minElevationM}m | Max: {terrain.maxElevationM}m</div>
        </div>

        <div className="glass-panel p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            Soil Saturation
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {weather.soilMoistureIndex}%
          </div>
          <div className="text-[10px] text-cyan-300">Humidity: {weather.humidityPercent}%</div>
        </div>

        <div className="glass-panel p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            Atmosphere
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {weather.windSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-emerald-300">{weather.temperatureC}°C | {weather.pressureHpa} hPa</div>
        </div>
      </div>

      {/* Multi-Factor Risk Breakdown Bar Chart */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
          <span>Multi-Factor Risk Breakdown</span>
          <span className="text-[10px] font-mono text-slate-400">Calculated Weighted Weights</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
