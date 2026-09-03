"use client";

import React, { useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Map, 
  Thermometer, 
  Activity, 
  CloudRain, 
  ArrowDown, 
  Radio, 
  Layers, 
  Globe2,
  Play,
  Satellite
} from "lucide-react";

interface CosmicLandingPageProps {
  onEnterDashboard: () => void;
  onOpenLiveClimate: () => void;
}

export default function CosmicLandingPage({
  onEnterDashboard,
  onOpenLiveClimate,
}: CosmicLandingPageProps) {
  const videoBgRef = useRef<HTMLVideoElement>(null);
  const videoCardRef = useRef<HTMLVideoElement>(null);

  // Guarantee autoplay across all modern browsers by calling play() programmatically on mount
  useEffect(() => {
    if (videoBgRef.current) {
      videoBgRef.current.play().catch((e) => {
        console.warn("Video background autoplay failed:", e);
      });
    }
    if (videoCardRef.current) {
      videoCardRef.current.play().catch((e) => {
        console.warn("Video card autoplay failed:", e);
      });
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* ========================================================
          HERO SECTION (1st Fold with Autoplay Video Scene)
      ======================================================== */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Background Autoplaying Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoBgRef}
            src="/i_want_to_generate_a_scene_s.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
          />
          {/* Deep Cinematic Vignette & Radial Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/40 z-10" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/90 z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-10" />
        </div>

        {/* Top Floating Glass Navigation */}
        <nav className="relative z-30 px-6 md:px-12 py-5 flex items-center justify-between pointer-events-auto backdrop-blur-md bg-slate-950/40 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">
                  DISASTER<span className="text-blue-400">LENS</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wider">
                  GALACTIC AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Geospatial Risk & Planetary Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Climate Option */}
            <button
              onClick={onOpenLiveClimate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide transition shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95"
            >
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <span>Live Climate</span>
            </button>

            {/* Launch Command */}
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold tracking-wide shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Launch Command</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Center Hero Content (Two Columns on Desktop) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 py-12 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left Hero Card */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900/85 backdrop-blur-2xl border-l-4 border-blue-500 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
                {/* System Online Badge */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-1 w-12 bg-blue-500 rounded-full" />
                  <span className="flex items-center gap-2 text-[11px] text-blue-400 font-semibold tracking-wider uppercase font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    System Online &bull; Gemini 3.5 Flash Lite
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-5">
                  GALACTIC<br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    DISASTERLENS
                  </span>
                </h1>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 border-l-2 border-blue-500/40 pl-4">
                  Your intelligent command center for real-time geospatial disaster physics, digital elevation hydrodynamic modeling, and planetary climate exploration.
                  <br />
                  <span className="text-slate-400 font-mono text-xs mt-1 block">
                    Integrated with real OpenStreetMap road corridors & live Open-Meteo telemetry.
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Enter Dashboard */}
                  <button
                    onClick={onEnterDashboard}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-7 rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2.5 text-xs tracking-wider uppercase active:scale-95"
                  >
                    <span>Enter Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Live Climate Option */}
                  <button
                    onClick={onOpenLiveClimate}
                    className="border border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 text-xs tracking-wider uppercase active:scale-95"
                  >
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                    <span>Live Climate Monitor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Hero Video Display Frame */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] bg-slate-900/80 backdrop-blur-xl p-2 group">
                {/* HUD Header */}
                <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono text-cyan-300 border-b border-cyan-500/20 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold uppercase tracking-wider text-red-400">LIVE SCENE RECONSTRUCTION</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-200">
                    4K SPATIAL
                  </span>
                </div>

                {/* Autoplaying Video Preview Screen */}
                <div className="relative rounded-2xl overflow-hidden aspect-video">
                  <video
                    ref={videoCardRef}
                    src="/i_want_to_generate_a_scene_s.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Subtle Telemetry Overlay on Video */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/80 pointer-events-none">
                    <span>GEOSPATIAL TERRAIN FEED</span>
                    <span className="text-emerald-400">ACTIVE &bull; 60 FPS</span>
                  </div>
                </div>

                {/* HUD Footer */}
                <div className="flex items-center justify-between px-3 pt-2 text-[10px] font-mono text-slate-400">
                  <span>AI HYDROLOGIC MODEL</span>
                  <span className="text-cyan-400 font-bold">GEMINI 3.5 FLASH LITE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-20 pb-8 text-center pointer-events-none">
          <p className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-widest mb-1.5 animate-pulse">
            Scroll for More
          </p>
          <ArrowDown className="w-4 h-4 text-blue-400 mx-auto animate-bounce" />
        </div>
      </section>

      {/* ========================================================
          SCROLLING CONTENT LAYER (Below 100vh fold)
      ======================================================== */}
      <section className="relative z-20 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-white space-y-16">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Explore. Predict. Protect.
            </h2>
            <div className="h-1 w-24 bg-blue-500 rounded-full mx-auto" />
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              DisasterLens fuses high-resolution satellite imagery, Google Gemini 3.5 Flash Lite intelligence, real OpenStreetMap road corridors, and live Open-Meteo atmospheric telemetry into a unified command platform.
            </p>
          </div>

          {/* 4-Grid Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Mapping */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-5 text-blue-400 group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Interactive 3D Satellite GIS</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click or search any coordinate on Earth. Instantly calculate multi-factor risk, low-lying river proximity, and digital elevation models (DEM).
              </p>
            </div>

            {/* Card 2: AI Intelligence */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
              <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-5 text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Gemini 3.5 Flash Lite</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ultra-fast next-gen AI reasoning provides real-time disaster summaries, vulnerable infrastructure alerts, and actionable evacuation directives.
              </p>
            </div>

            {/* Card 3: Live Climate & Weather */}
            <div 
              onClick={onOpenLiveClimate}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 group hover:-translate-y-1 shadow-xl cursor-pointer"
            >
              <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-5 text-cyan-400 group-hover:scale-110 transition-transform">
                <Thermometer className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg mb-2 text-cyan-200">Live Climate Monitor</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Click &rarr;</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track live temperature, wind speed, elevation, and 3D globe coordinates for any city worldwide with instant camera fly-to.
              </p>
            </div>

            {/* Card 4: Road Closures & Shelters */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
              <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-5 text-emerald-400 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-emerald-200">Real OSM Road Corridors</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Queries OpenStreetMap Overpass for genuine road geometries, highlighting submerged impassable routes and clear high-ground evacuation paths.
              </p>
            </div>
          </div>

          {/* Bottom Command Deck CTA */}
          <div className="text-center pt-8">
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:to-cyan-500 text-white px-9 py-4 rounded-2xl font-bold text-sm tracking-wide transition shadow-2xl shadow-blue-600/30 transform hover:-translate-y-1 active:scale-95"
            >
              <span>Launch Tactical Command Deck</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
