"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  Map,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  RefreshCw,
} from "lucide-react";
import { DemoModeBadge } from "@/components/ui/DemoModeBadge";
import { Disclaimer } from "@/components/ui/Disclaimer";

interface HealthData {
  status: string;
  demo_mode: boolean;
  providers: {
    ai_vision: {
      provider: string;
      active: boolean;
      configured: boolean;
      model: string;
    };
    maps: {
      provider: string;
      source: string;
    };
    communication: {
      provider: string;
      mode: string;
      dispatch_enabled: boolean;
    };
    database: {
      provider: string;
      persistence: string;
    };
  };
  safety_compliance: {
    medical_diagnosis: string;
    emergency_dispatch: string;
    uncertainty_aware_labeling: string;
  };
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      })
      .then((data) => setHealth(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      })
      .then((data) => {
        if (active) setHealth(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Settings className="h-4 w-4" />
            <span>System Configuration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Settings &amp; Architecture Status
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time health of AI, maps, communication, and storage provider abstractions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoModeBadge />
          <button
            onClick={fetchStatus}
            className="p-2 rounded-xl border border-gray-800 bg-gray-900/60 text-gray-400 hover:text-white transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Vision Provider */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Vision Engine</h3>
                <p className="text-xs text-gray-400">Provider Abstraction</p>
              </div>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
              health?.providers.ai_vision.configured
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}>
              {health?.providers.ai_vision.configured ? "LIVE API" : "DEMO ENGINE"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Selected Provider:</span>
              <span className="text-white font-mono uppercase font-bold">
                {health?.providers.ai_vision.provider || "Demo Provider"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Active Model:</span>
              <span className="text-gray-300 font-medium">
                {health?.providers.ai_vision.model || "Deterministic Fallback"}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Supported Adapters:</span>
              <span className="text-gray-400">Gemini 1.5/2.0 · OpenAI GPT-4o · Demo</span>
            </div>
          </div>
        </div>

        {/* Maps & Geocoding Provider */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Map className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Location &amp; Maps</h3>
                <p className="text-xs text-gray-400">Cartography &amp; Services</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Maps Adapter:</span>
              <span className="text-white font-mono font-bold">
                {health?.providers.maps.provider.toUpperCase() || "DEMO"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Tile Layer:</span>
              <span className="text-gray-300">OpenStreetMap Nominatim</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Default Demo Hub:</span>
              <span className="text-emerald-300 font-semibold truncate max-w-[200px]">
                Siddaganga Institute of Technology, Tumakuru
              </span>
            </div>
          </div>
        </div>

        {/* Communication Provider */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Emergency Communication</h3>
                <p className="text-xs text-gray-400">Delivery Adapter</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300">
              SIMULATED ONLY
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Channel Mode:</span>
              <span className="text-purple-300 font-bold">Deterministic Simulation</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Dispatch Status:</span>
              <span className="text-red-400 font-semibold">Strictly Disabled (Safety Policy)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Supported Adapters:</span>
              <span className="text-gray-400">Twilio Demo Adapter · In-Memory Simulation</span>
            </div>
          </div>
        </div>

        {/* Database & Storage Provider */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Persistence &amp; Storage</h3>
                <p className="text-xs text-gray-400">Repository Store</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              LOCAL / READY
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Storage Provider:</span>
              <span className="text-white font-mono font-bold">
                {health?.providers.database.provider.toUpperCase() || "LOCAL"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800/80">
              <span className="text-gray-400">Persistence Engine:</span>
              <span className="text-gray-300">In-Memory Singleton + Zustand Client Store</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Cloud Target:</span>
              <span className="text-gray-400">Supabase Adapter Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Compliance Guardrails */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Safety &amp; Compliance Guardrails
        </h2>

        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
            <span className="font-bold text-gray-200 block mb-1">Zero Real Dispatch</span>
            <p className="text-gray-400 leading-snug">
              Notifications are strictly simulated. Real emergency services (112 / 911) are never contacted autonomously.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
            <span className="font-bold text-gray-200 block mb-1">No Medical Diagnosis</span>
            <p className="text-gray-400 leading-snug">
              Casualties or injuries are never inferred. The system uses uncertainty-aware &quot;potentially affected&quot; phrasing.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
            <span className="font-bold text-gray-200 block mb-1">Deterministic Demo Guard</span>
            <p className="text-gray-400 leading-snug">
              If external API keys are unavailable, deterministic mock scenes guarantee a seamless 10-second demo experience.
            </p>
          </div>
        </div>
      </div>

      {/* Optional Environment Variables Guide (No Secrets Exposed) */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Environment Variables Configuration
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          ResQLens runs out of the box with zero keys in Demo Mode. To connect real providers, configure your server-side environment variables in <code className="text-amber-300 bg-gray-800 px-1.5 py-0.5 rounded">.env.local</code>:
        </p>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs text-gray-300 overflow-x-auto space-y-1">
          <p className="text-gray-500"># Optional Real AI Vision Provider (Gemini or OpenAI)</p>
          <p><span className="text-red-400">GEMINI_API_KEY</span>=<span className="text-gray-600">AIzaSy...</span></p>
          <p><span className="text-red-400">OPENAI_API_KEY</span>=<span className="text-gray-600">sk-...</span></p>
          <p><span className="text-blue-400">AI_PROVIDER</span>=<span className="text-gray-400">gemini</span> <span className="text-gray-600"># or openai</span></p>
          <p className="text-gray-500 pt-2"># Optional Maps &amp; Notification Adapters</p>
          <p><span className="text-emerald-400">MAPS_API_KEY</span>=<span className="text-gray-600">...</span></p>
          <p><span className="text-purple-400">TWILIO_ACCOUNT_SID</span>=<span className="text-gray-600">...</span></p>
          <p><span className="text-purple-400">TWILIO_AUTH_TOKEN</span>=<span className="text-gray-600">...</span></p>
        </div>
        <p className="text-[11px] text-gray-500 mt-2">
          Note: Keys are used strictly on the server side and are never exposed to client browsers.
        </p>
      </div>

      <Disclaimer variant="card" />
    </div>
  );
}
