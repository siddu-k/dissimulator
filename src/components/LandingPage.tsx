"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { 
  Thermometer, 
  Search, 
  ArrowRight, 
  Wind, 
  Droplets, 
  ArrowDown, 
  Clock, 
  Sparkles, 
  Compass, 
  ChevronRight,
  Radio,
  Satellite
} from "lucide-react";
import { GeoPoint, BoundingBox } from "@/types";

interface LandingPageProps {
  onLaunchApp: (locationName?: string, center?: GeoPoint, bbox?: BoundingBox) => void;
  onReturnHome?: () => void;
}

export default function LandingPage({ onLaunchApp, onReturnHome }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [cityInput, setCityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [weatherData, setWeatherData] = useState<{
    name: string;
    lat: number;
    lon: number;
    temp: number;
    wind: number;
    elev: number;
    time: string;
    humidity: string;
  } | null>(null);

  // References for Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentMarkerRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  function focusLocation(lat: number, lon: number) {
    const controls = controlsRef.current;
    const globe = globeRef.current;
    const clouds = cloudsRef.current;
    const camera = cameraRef.current;

    if (!globe || !camera) return;

    // 1. Stop Auto-rotation
    if (controls) controls.autoRotate = false;

    // 2. Remove old marker
    if (currentMarkerRef.current) {
      globe.remove(currentMarkerRef.current);
      currentMarkerRef.current = null;
    }

    // 3. Add new Marker (Red Pin)
    const pos = latLonToVector3(lat, lon, 5.06);
    const geometry = new THREE.SphereGeometry(0.16, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const marker = new THREE.Mesh(geometry, material);
    marker.userData = { lat, lon };
    marker.position.copy(pos);
    globe.add(marker);
    currentMarkerRef.current = marker;

    // Reset globe rotation to 0 for coordinate alignment
    globe.rotation.y = 0;
    if (clouds) clouds.rotation.y = 0;

    // 4. Smoothly move camera
    const targetCamPos = latLonToVector3(lat, lon, 15);
    const startPos = camera.position.clone();
    const duration = 1000;
    let startTime: number | null = null;

    function animateCam(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      camera!.position.lerpVectors(startPos, targetCamPos, progress);
      camera!.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animateCam);
      } else if (controls) {
        controls.update();
      }
    }
    requestAnimationFrame(animateCam);
  }

  async function handleSearch(cityName?: string) {
    const query = cityName || cityInput;
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Geocode location via Open-Meteo
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Please try another place.");
      }

      const loc = geoData.results[0];
      const lat = loc.latitude;
      const lon = loc.longitude;
      const name = `${loc.name}${loc.country ? `, ${loc.country}` : ""}`;

      // 2. Weather Telemetry
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`
      );
      const wData = await wRes.json();
      const current = wData.current_weather;

      setWeatherData({
        name,
        lat,
        lon,
        temp: Math.round(current.temperature),
        wind: Math.round(current.windspeed),
        elev: Math.round(loc.elevation || 0),
        time: current.time.split("T")[1] || "--:--",
        humidity: "48 - 72%",
      });

      // 3. Move 3D Globe camera
      focusLocation(lat, lon);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to locate city.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }

  // Handle launch into main Satellite application
  function handleLaunch() {
    if (weatherData) {
      const delta = 0.035;
      const center: GeoPoint = { lat: weatherData.lat, lng: weatherData.lon };
      const bbox: BoundingBox = {
        north: weatherData.lat + delta,
        south: weatherData.lat - delta,
        east: weatherData.lon + delta,
        west: weatherData.lon - delta,
      };
      onLaunchApp(weatherData.name, center, bbox);
    } else {
      onLaunchApp();
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
    if (w > 768) camera.setViewOffset(w, h, -(w * 0.22), 0, w, h);
    camera.position.set(0, 0, 20);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const pl = new THREE.PointLight(0xffffff, 1.6);
    pl.position.set(25, 25, 25);
    scene.add(pl);

    // Globe Mesh
    const loader = new THREE.TextureLoader();
    const globeRadius = 5;
    const earthTex = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
    );
    earthTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 128, 128),
      new THREE.MeshPhongMaterial({
        map: earthTex,
        shininess: 20,
        specular: new THREE.Color(0x223344),
      })
    );
    scene.add(globe);
    globeRef.current = globe;

    // Cloud Layer
    const cloudsTex = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
    );
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 1.012, 128, 128),
      new THREE.MeshPhongMaterial({
        map: cloudsTex,
        transparent: true,
        opacity: 0.42,
      })
    );
    scene.add(clouds);
    cloudsRef.current = clouds;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    controlsRef.current = controls;

    // Raycaster for Marker Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const tooltip = tooltipRef.current;
      if (tooltip) {
        tooltip.style.left = `${event.clientX + 16}px`;
        tooltip.style.top = `${event.clientY + 16}px`;
      }

      if (!currentMarkerRef.current || !cameraRef.current) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObject(currentMarkerRef.current);

      if (intersects.length > 0 && tooltip) {
        const { lat, lon } = intersects[0].object.userData;
        tooltip.innerHTML = `<span class="text-white font-bold tracking-wide">Target Pinpoint</span><br/>Lat: ${lat.toFixed(4)}<br/>Lon: ${lon.toFixed(4)}`;
        tooltip.classList.remove("hidden");
        document.body.style.cursor = "pointer";
      } else if (tooltip) {
        tooltip.classList.add("hidden");
        document.body.style.cursor = "default";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize listener
    const handleResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.clearViewOffset();
      if (nw > 768) camera.setViewOffset(nw, nh, -(nw * 0.22), 0, nw, nh);
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    function animate() {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (controls && controls.autoRotate) {
        globe.rotation.y += 0.00015;
        clouds.rotation.y += 0.00035;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Default initial search: Mumbai
    handleSearch("Mumbai");

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Top Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between pointer-events-auto backdrop-blur-sm bg-slate-950/40 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Globe2 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">DisasterLens</h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PLANETARY 3D
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Real-Time Climate & Disaster Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition shadow"
            >
              <span>&larr; Return to Orbit</span>
            </button>
          )}

          <button
            onClick={() => handleLaunch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold tracking-wide shadow-lg shadow-cyan-600/30 transition transform hover:-translate-y-0.5"
          >
            <Satellite className="w-4 h-4" />
            <span>Open Satellite Command</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Left Glass Dashboard Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-start pl-4 md:pl-16 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md space-y-4 animate-enter pt-12">
          {/* Search Card */}
          <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-cyan-500 bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Global Climate & Threat Monitor</h2>
                <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                  Open-Meteo Live Planetary Telemetry
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative"
            >
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Enter City Name (e.g. Miami, Tokyo, London, Mumbai)..."
                className="w-full bg-slate-800/90 border border-white/10 rounded-xl py-3 px-4 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/60 transition shadow-inner placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg text-white transition shadow-md shadow-cyan-600/30"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* Quick city suggestions */}
            <div className="flex items-center gap-1.5 mt-3 text-[11px] font-mono text-slate-400 flex-wrap">
              <span className="text-slate-500">Quick:</span>
              {["Mumbai", "Miami", "Tokyo", "London", "Sydney"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setCityInput(city);
                    handleSearch(city);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 text-slate-300 transition"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Weather & Telemetry Card */}
          {weatherData && (
            <div className="glass-panel p-6 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/10 shadow-2xl animate-enter space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
                    {weatherData.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Lat: {weatherData.lat.toFixed(2)}&deg;, Lon: {weatherData.lon.toFixed(2)}&deg;
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-slate-400 font-mono">
                    {weatherData.temp}&deg;
                  </div>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mt-0.5">
                    Temperature
                  </p>
                </div>
              </div>

              {/* 4 Metric Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Wind Speed</p>
                    <p className="text-sm font-bold text-white font-mono">{weatherData.wind} km/h</p>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Humidity</p>
                    <p className="text-sm font-bold text-white font-mono">{weatherData.humidity}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Elevation</p>
                    <p className="text-sm font-bold text-white font-mono">{weatherData.elev} m</p>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Local Time</p>
                    <p className="text-sm font-bold text-white font-mono">{weatherData.time}</p>
                  </div>
                </div>
              </div>

              {/* Action Button: Launch into GIS Command Map */}
              <button
                onClick={() => handleLaunch()}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <Satellite className="w-4 h-4" />
                <span>Launch Satellite Analysis for {weatherData.name.split(",")[0]}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="inline-block mt-4 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              &larr; Return to Orbit
            </button>
          )}
        </div>
      </div>

      {/* 3D Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-black/80 backdrop-blur-md text-cyan-300 text-xs font-mono p-2.5 rounded-xl border border-cyan-500/50 pointer-events-none hidden z-50 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
      />
    </div>
  );
}

function Globe2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
