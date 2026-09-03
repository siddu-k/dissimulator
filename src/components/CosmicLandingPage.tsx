"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Map, 
  Thermometer, 
  Activity, 
  CloudRain, 
  FileText, 
  ArrowDown, 
  Radio, 
  Layers, 
  Globe2,
  Compass
} from "lucide-react";

interface CosmicLandingPageProps {
  onEnterDashboard: () => void;
  onOpenLiveClimate: () => void;
}

export default function CosmicLandingPage({
  onEnterDashboard,
  onOpenLiveClimate,
}: CosmicLandingPageProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [uiVisible, setUiVisible] = useState(false);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let globe: THREE.Mesh;
    let clouds: THREE.Mesh;
    let stars: THREE.Points;
    let time = 0;
    let introComplete = false;
    let animFrameId: number;

    const targetPos = new THREE.Vector3(0, 0, 20);

    const w = window.innerWidth;
    const h = window.innerHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
    if (w > 768) {
      camera.setViewOffset(w, h, -(w * 0.25), 0, w, h);
    }
    // Start very far away in space for dramatic cinematic zoom
    camera.position.set(0, 0, 1200);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.6);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    // Globe
    const loader = new THREE.TextureLoader();
    const globeSize = 5;
    const earthTex = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
    );
    earthTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    globe = new THREE.Mesh(
      new THREE.SphereGeometry(globeSize, 128, 128),
      new THREE.MeshPhongMaterial({
        map: earthTex,
        shininess: 18,
        specular: new THREE.Color(0x334455),
      })
    );
    scene.add(globe);

    // Clouds
    const cloudTex = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
    );
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(globeSize * 1.012, 128, 128),
      new THREE.MeshPhongMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.42,
      })
    );
    scene.add(clouds);

    // Starfield (15,000 cosmic stars)
    const starCount = 15000;
    const starGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 2000;
      if (i % 3 === 0) sizes[i / 3] = Math.random();
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });

    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.clearViewOffset();
      if (nw > 768) {
        camera.setViewOffset(nw, nh, -(nw * 0.25), 0, nw, nh);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener("resize", onResize);

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      time += 0.005;

      if (clouds) clouds.rotation.y += 0.0003;
      if (globe) globe.rotation.y += 0.0001;
      if (stars) stars.rotation.y -= 0.0002;

      if (!introComplete) {
        // Smooth cinematic zoom in
        camera.position.lerp(targetPos, 0.035);

        if (camera.position.distanceTo(targetPos) < 0.6) {
          introComplete = true;
          setUiVisible(true);
        }
      } else {
        // Gentle manual orbit
        const dist = 20;
        camera.position.x = dist * Math.sin(time * 0.16);
        camera.position.z = dist * Math.cos(time * 0.16);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 3D Fixed Background */}
      <div
        ref={canvasContainerRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Top Floating Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-auto backdrop-blur-md bg-slate-950/40 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
            <Globe2 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white font-mono">
                DISASTER<span className="text-blue-400">LENS</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                GALACTIC AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Geospatial Risk & Planetary Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Option: Live Climate */}
          <button
            onClick={onOpenLiveClimate}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide transition shadow-lg shadow-cyan-500/10"
          >
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <span>Live Climate</span>
          </button>

          {/* Option: Enter Dashboard */}
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <span>Launch Command</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* First Fold UI Overlay (Hero Card) */}
      <div
        className={`relative z-10 w-full min-h-screen flex items-center pl-6 md:pl-20 pointer-events-none transition-opacity duration-1000 ${
          uiVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto max-w-xl pt-16">
          <div className="bg-slate-900/90 backdrop-blur-2xl border-l-4 border-blue-500 p-8 rounded-r-3xl shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-12 bg-blue-500 rounded-full" />
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase font-mono">
                System Online &bull; Gemini 3.5 Flash Lite
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-4">
              GALACTIC<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                DISASTERLENS
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed mb-8 border-l-2 border-blue-500/40 pl-4">
              Your intelligent command center for real-time geospatial disaster physics, digital elevation hydrodynamic modeling, and planetary climate exploration.
              <br />
              <span className="text-slate-400 font-mono text-xs">
                Powered by Google Gemini 3.5 Flash Lite & OpenStreetMap GIS.
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

        {/* Scroll for More Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-widest mb-1.5 animate-pulse">
            Scroll for More
          </p>
          <ArrowDown className="w-4 h-4 text-blue-400 mx-auto animate-bounce" />
        </div>
      </div>

      {/* Scrolling Content Layer (Folds down below 100vh) */}
      <div className="relative z-20 bg-gradient-to-b from-transparent via-slate-900/95 to-slate-950 min-h-screen py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-white space-y-16">
          {/* Hero Section */}
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

          {/* Bottom Command CTA */}
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
      </div>
    </div>
  );
}
