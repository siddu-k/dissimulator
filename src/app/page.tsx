"use client";

import React, { useState } from "react";
import DynamicSatelliteMap from "@/components/Map/DynamicSatelliteMap";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2, 
  MapPin, 
  ShieldAlert, 
  Sliders, 
  Search, 
  Activity, 
  Waves, 
  Key, 
  AlertTriangle,
  CheckCircle2,
  CornerDownRight,
  Home,
  Play,
  RotateCcw,
  Globe,
  Thermometer
} from "lucide-react";
import { BoundingBox, GeoPoint, InfrastructureItem, RoadSegment, SafeShelter } from "@/types";
import ApiKeyModal from "@/components/ApiKeyModal";
import ChatMessageCard from "@/components/ChatMessageCard";
import LandingPage from "@/components/LandingPage";
import CosmicLandingPage from "@/components/CosmicLandingPage";

export default function CleanSatelliteApp() {
  // View mode: "landing" (Cosmic Deep Space) | "climate" (Live 3D Climate Globe) | "command" (GIS Platform)
  const [currentView, setCurrentView] = useState<"landing" | "climate" | "command">("landing");

  // Target Area coordinates
  const [center, setCenter] = useState<GeoPoint>({ lat: 19.0760, lng: 72.8777 });
  const [bbox, setBbox] = useState<BoundingBox>({
    north: 19.111,
    south: 19.041,
    east: 72.919,
    west: 72.835,
  });
  const [locationName, setLocationName] = useState("Mumbai Coastal Basin");

  // Mode: "predict" | "simulate"
  const [mode, setMode] = useState<"predict" | "simulate">("predict");

  // Chat & AI state
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; data?: any }>>([
    {
      role: "assistant",
      content: "👋 **DisasterLens Satellite AI is active.**\n\nClick anywhere on the satellite map or enter a prompt below (e.g., *'Simulate 350mm rainfall over 12 hours'* or *'Predict real-world flood risk'*).",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Map Overlays
  const [heatPoints, setHeatPoints] = useState<[number, number, number][]>([]);
  const [floodZones, setFloodZones] = useState<any[]>([]);
  const [blockedRoads, setBlockedRoads] = useState<RoadSegment[]>([]);
  const [shelters, setShelters] = useState<SafeShelter[]>([]);
  const [facilities, setFacilities] = useState<InfrastructureItem[]>([]);

  // Settings
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Horizontal Resizer Slider State
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isDragging, setIsDragging] = useState(false);

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  React.useEffect(() => {
    if (!isDragging) return;

    const stopResizing = () => setIsDragging(false);
    const resize = (e: MouseEvent) => {
      const minWidth = 320;
      const maxWidth = Math.min(950, Math.round(window.innerWidth * 0.75));
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      setSidebarWidth(newWidth);
    };

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging]);

  // Load API key from local storage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("disasterlens_gemini_key") || "";
      if (storedKey) setApiKey(storedKey);
      setSelectedModel("gemini-3.5-flash-lite");
    }
  }, []);

  const handleSelectArea = async (newCenter: GeoPoint, newBbox: BoundingBox) => {
    setCenter(newCenter);
    setBbox(newBbox);
    setLocationName(`Locating place (${newCenter.lat.toFixed(3)}, ${newCenter.lng.toFixed(3)})...`);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCenter.lat}&lon=${newCenter.lng}&zoom=14&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const name = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.municipality;
        const state = addr.state || addr.region;
        const country = addr.country;

        if (name && country) {
          setLocationName(state ? `${name}, ${state}, ${country}` : `${name}, ${country}`);
          return;
        }
        if (data.display_name) {
          setLocationName(data.display_name.split(",").slice(0, 3).join(", "));
          return;
        }
      }
    } catch (err) {
      console.warn("Reverse geocode error:", err);
    }
    setLocationName(`Target Zone (${newCenter.lat.toFixed(4)}, ${newCenter.lng.toFixed(4)})`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const span = 0.035;
        const newBbox = {
          north: lat + span,
          south: lat - span,
          east: lng + span * 1.2,
          west: lng - span * 1.2,
        };
        setCenter({ lat, lng });
        setBbox(newBbox);
        setLocationName(item.display_name.split(",").slice(0, 3).join(", "));
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || input;
    if (!text.trim() || loading) return;

    // Real AI Check: Prompt user if API key is not configured
    if (!apiKey.trim()) {
      setIsSettingsOpen(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "🔑 **Google Gemini API Key Required**\n\nTo ensure authentic calculations without mock data, DisasterLens requires a real Gemini API Key. Please paste your key in the settings window (get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)).",
        },
      ]);
      return;
    }

    const userMessage = { role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const isSim = mode === "simulate" || /simulate|what if|deluge|surge|inundation/i.test(text);

      if (!isSim) {
        // Mode 1: Predict Real-World Risk & Answer User Question via Real AI
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            center,
            boundingBox: bbox,
            locationName,
            apiKey,
            model: selectedModel,
            userPrompt: text,
          }),
        });
        const data = await res.json();

        if (data && !data.error && data.aiAssessment) {
          setHeatPoints(data.heatPoints || []);
          setFloodZones([]);
          setBlockedRoads(data.roads || []);
          setFacilities(data.infrastructure?.criticalFacilities || []);
          setShelters(data.infrastructure?.criticalFacilities?.filter((f: any) => f.type === "shelter") || []);

          const closedRoads = (data.roads || []).filter((r: any) => r.status === "submerged");
          const openRoads = (data.roads || []).filter((r: any) => r.status === "clear");

          const aiText = `🛰️ **Real AI Assessment: ${data.locationName}**\n*Powered by Gemini 3.5 Flash Lite*\n\n**Direct AI Response & Threat Overview:**\n${data.aiAssessment.summary}\n\n**Measured Live Telemetry:**\n- 24h Rainfall Forecast: **${data.weather.forecast24hRainfallMm} mm** (Current: ${data.weather.currentRainfallMm} mm/h)\n- Elevation: **${data.terrain.elevationM} m** (${data.terrain.terrainType.replace('_', ' ')})\n- Soil Moisture: **${data.weather.soilMoistureIndex}%** | Population: **${data.estimatedPopulation.toLocaleString()}**\n- Threat Index: **${data.riskLevel} (${data.overallRiskScore}/100)**\n\n**Real Road Traffic & Closures (OSM Live):**\n- 🚧 **Closed / Submerged Roads (${closedRoads.length}):** ${closedRoads.slice(0, 3).map((r: any) => r.name).join(", ") || "None currently submerged"}\n- 🟢 **Open Safe Corridors (${openRoads.length}):** ${openRoads.slice(0, 3).map((r: any) => r.name).join(", ") || "Main ridge bypass"}\n\n**Vulnerable Sectors & People Impact:**\n• ${data.aiAssessment.vulnerableZones}\n• ${data.aiAssessment.peopleImpact}\n\n**Road & Infrastructure Hazards:**\n• ${data.aiAssessment.roadRisks}\n• ${data.aiAssessment.infrastructureImpact}\n\n**Actionable Safety Directives:**\n${data.aiAssessment.precautions.map((p: string) => `• ${p}`).join("\n")}`;

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: aiText, data },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠️ ${data.error || "Analysis request failed. Please verify API key."}` },
          ]);
        }
      } else {
        // Mode 2: Real AI Disaster Simulation
        // 1. Parse scenario parameters with Gemini Flash
        let simParams = {
          disasterType: "flood" as const,
          rainfallMm: 300,
          durationHours: 12,
          riverLevelIncreaseM: 2.4,
          soilSaturationPercent: 85,
          severity: "severe" as const,
          customPrompt: text,
        };

        try {
          const parseRes = await fetch("/api/parse-scenario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: text, apiKey, model: selectedModel }),
          });
          if (parseRes.ok) {
            const parsed = await parseRes.json();
            if (!parsed.error) {
              simParams = { ...simParams, ...parsed, customPrompt: text };
            }
          }
        } catch (e) {
          console.warn("Scenario parse warning, using defaults:", e);
        }

        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationName,
            center,
            boundingBox: bbox,
            params: simParams,
            apiKey,
            model: selectedModel,
          }),
        });

        const data = await res.json();
        if (data && !data.error && data.aiReport) {
          // Render overlays on satellite map
          const lastStep = data.timeSteps[data.timeSteps.length - 1];
          setFloodZones(lastStep?.floodZones || []);
          setHeatPoints(lastStep?.heatPoints || []);
          setBlockedRoads(lastStep?.blockedRoads || []);
          setShelters(lastStep?.accessibleShelters || []);
          setFacilities(data.criticalFacilities || []);

          const blockedCount = lastStep?.blockedRoadsCount || 0;
          const openShelterCount = lastStep?.accessibleShelters?.filter((s: any) => s.status === "open").length || 0;

          const simText = `🌊 **Simulation Rendered: ${simParams.rainfallMm}mm ${simParams.disasterType.replace('_', ' ')} (${simParams.durationHours}h)**\n*Simulated with Gemini 3.5 Flash Lite*\n\n**Situation Overview:**\n${data.aiReport.situationSummary}\n\n**Spatial Impact Telemetry:**\n- Inundated Hazard Area: **${data.maxAffectedAreaKm2} km²**\n- Population at Risk: **${data.maxPeopleExposed.toLocaleString()}**\n- Blocked Transit Corridors: **${blockedCount} roads closed (🚧)**\n- Open Safe Shelters: **${openShelterCount} high-ground facilities (🟢)**\n\n**Infrastructure & Transit Disruptions:**\n${data.aiReport.infrastructureImpactAnalysis}\n\n**Evacuation Directives:**\n${data.aiReport.evacuationPriorities.map((e: string) => `• ${e}`).join("\n")}\n\n**Recommended Response Actions:**\n${data.aiReport.recommendedActions.map((a: string) => `• ${a}`).join("\n")}`;

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: simText, data },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠️ ${data.error || "Simulation failed. Please verify API key."}` },
          ]);
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Request could not be completed. Please verify connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPills = [
    { label: "🛰️ Real-World Risk", prompt: `Predict real disaster risk and weather for ${locationName}`, mode: "predict" },
    { label: "🌊 300mm Deluge Simulation", prompt: `Simulate a severe flood with 300mm rainfall over 12 hours for ${locationName}`, mode: "simulate" },
    { label: "🚧 Check Blocked Roads", prompt: `Simulate a flood and identify which roads are blocked with detours in ${locationName}`, mode: "simulate" },
    { label: "🟢 Safe Shelters", prompt: `Locate open high-ground emergency shelters and safe access corridors in ${locationName}`, mode: "simulate" },
  ];

  const handleLaunchFromLanding = (name?: string, newCenter?: GeoPoint, newBbox?: BoundingBox) => {
    if (name && newCenter && newBbox) {
      setLocationName(name);
      setCenter(newCenter);
      setBbox(newBbox);
    }
    setCurrentView("command");
  };

  if (currentView === "landing") {
    return (
      <CosmicLandingPage
        onEnterDashboard={() => setCurrentView("command")}
        onOpenLiveClimate={() => setCurrentView("climate")}
      />
    );
  }

  if (currentView === "climate") {
    return (
      <LandingPage
        onLaunchApp={handleLaunchFromLanding}
        onReturnHome={() => setCurrentView("landing")}
      />
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden font-sans ${isDragging ? "select-none cursor-col-resize" : ""}`}>
      {/* LEFT SIDEBAR: Resizable Chat & Controls */}
      <aside
        style={{ width: typeof window !== "undefined" && window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined }}
        className="w-full lg:w-auto h-[45vh] lg:h-full flex flex-col bg-slate-900/95 border-b lg:border-b-0 border-slate-800 z-10 shadow-2xl shrink-0"
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white font-mono flex items-center gap-1.5">
                DISASTER<span className="text-sky-400">LENS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                  SATELLITE AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Hydro-Meteorological & Spatial Physics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Return to Orbit Home */}
            <button
              onClick={() => setCurrentView("landing")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] text-blue-300 font-mono transition"
              title="Return to Cosmic Orbit Landing"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Orbit</span>
            </button>

            {/* Live Climate Globe */}
            <button
              onClick={() => setCurrentView("climate")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono transition"
              title="Switch to Live Climate Globe"
            >
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Climate</span>
            </button>

            {apiKey.trim() ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real AI &middot; 3.5 Flash Lite
              </div>
            ) : (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] text-amber-300 font-mono transition"
                title="Enter Google Gemini API Key"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter Key</span>
              </button>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Configure Gemini API Key & Model"
            >
              <Key className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Selected Real Place Display Bar */}
        <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-300 truncate mr-2">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400 shrink-0">Place:</span>
            <strong className="text-sky-300 truncate" title={locationName}>
              {locationName}
            </strong>
          </div>
          <button
            onClick={() => {
              setMode("predict");
              handleSendMessage(`Predict real-world disaster risk and weather for ${locationName}`);
            }}
            disabled={loading}
            className="shrink-0 px-2.5 py-0.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-semibold tracking-wide transition shadow shadow-sky-600/30"
          >
            Predict Place
          </button>
        </div>

        {/* Location Search Bar & Mode Selector */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/50 space-y-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search city, river, or region..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium disabled:opacity-40 transition"
            >
              {searchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Locate"}
            </button>
          </form>

          {/* Mode Selector Pill */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setMode("predict")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === "predict"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Predict Mode</span>
            </button>
            <button
              onClick={() => setMode("simulate")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === "simulate"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Simulation Mode</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg, i) => (
            <ChatMessageCard key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span className="font-mono">Extracting GIS terrain & invoking Gemini AI...</span>
            </div>
          )}
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMode(pill.mode as any);
                handleSendMessage(pill.prompt);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-sky-600/30 border border-slate-800 text-[11px] text-slate-300 transition shrink-0"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Chat Input Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "predict"
                  ? "Predict flood risk for selected satellite area..."
                  : "Simulate disaster (e.g. '300mm rain in 12h')..."
              }
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-white shadow-lg shadow-sky-600/30 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Draggable Horizontal Resizer Slider Handle */}
      <div
        onMouseDown={startResizing}
        className={`hidden lg:flex w-2.5 hover:w-3 items-center justify-center cursor-col-resize z-20 select-none group relative transition-all duration-150 ${
          isDragging
            ? "bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.9)]"
            : "bg-slate-900 hover:bg-sky-500/80 border-x border-slate-800"
        }`}
        title="Click and drag horizontally to resize chat layout"
      >
        <div
          className={`w-1 rounded-full transition-all duration-200 ${
            isDragging
              ? "bg-white h-16 shadow"
              : "bg-slate-600 group-hover:bg-white h-10 group-hover:h-14"
          }`}
        />
      </div>

      {/* RIGHT MAIN AREA: Full-screen Satellite Map with Real-Time Inundation & Blockages */}
      <main className="flex-1 h-[55vh] lg:h-full relative">
        <DynamicSatelliteMap
          center={center}
          boundingBox={bbox}
          locationName={locationName}
          onSelectArea={handleSelectArea}
          floodZones={floodZones}
          heatPoints={heatPoints}
          blockedRoads={blockedRoads}
          shelters={shelters}
          facilities={facilities}
        />
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
}
