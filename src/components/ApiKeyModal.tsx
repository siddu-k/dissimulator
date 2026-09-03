"use client";

import React, { useState, useEffect } from "react";
import { Key, Sparkles, X, Check, ShieldCheck } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const AVAILABLE_MODELS = [
  { 
    id: "gemini-3.5-flash-lite", 
    name: "Gemini 3.5 Flash Lite (Exclusive Model)", 
    desc: "Next-gen ultra-fast flash reasoning engine for real-time disaster intelligence & prediction" 
  }
];

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
}: ApiKeyModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState("gemini-3.5-flash-lite");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTempKey(apiKey);
    setTempModel("gemini-3.5-flash-lite");
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey.trim());
    setSelectedModel(tempModel);
    if (typeof window !== "undefined") {
      localStorage.setItem("disasterlens_gemini_key", tempKey.trim());
      localStorage.setItem("disasterlens_gemini_model", tempModel);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl glass-panel-elevated p-6 border border-slate-700/80 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Real AI Settings &middot; Gemini Flash
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">Strictly powered by Real Google Gemini Flash AI (No mock data)</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Gemini API Key <span className="text-red-400">*Required</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 underline font-medium flex items-center gap-1"
              >
                Get Free API Key &rarr;
              </a>
            </div>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Enter your Gemini API key (AIzaSy...)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Stored securely in your local browser session for authentic live predictions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Active Model (Locked to Flash)
            </label>
            <div className="space-y-2">
              {AVAILABLE_MODELS.map((model) => (
                <label
                  key={model.id}
                  onClick={() => setTempModel(model.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    tempModel === model.id
                      ? "bg-sky-600/20 border-sky-500/60 text-white"
                      : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    checked={tempModel === model.id}
                    onChange={() => setTempModel(model.id)}
                    className="mt-1 accent-sky-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-xs text-white">{model.name}</div>
                    <div className="text-[11px] text-slate-400">{model.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Saved!
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
