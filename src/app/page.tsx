import Link from "next/link";
import {
  Eye,
  AlertTriangle,
  MapPin,
  Bell,
  ShieldCheck,
  ArrowRight,
  Zap,
  Users,
  Flame,
  Car,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { DemoModeBadge } from "@/components/ui/DemoModeBadge";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Ambience & Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 blur-[130px] rounded-full" />

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Status Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-300 backdrop-blur-sm shadow-sm shadow-red-950/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="font-semibold tracking-wide">Emergency Scene Assistant Prototype</span>
            <span className="text-red-400/60">•</span>
            <span className="text-xs text-amber-300 font-mono">10-SEC DEMO FLOW</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-5xl font-black tracking-tight sm:text-7xl">
            <span className="text-white">ResQ</span>
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Lens
            </span>
          </h1>

          {/* Positioning & Value Proposition */}
          <p className="mb-4 text-2xl font-bold text-gray-100 sm:text-3xl tracking-tight">
            Turn a chaotic scene into clear information — in seconds.
          </p>
          <p className="mb-8 text-base text-gray-400 max-w-2xl mx-auto leading-relaxed sm:text-lg">
            A bystander assistant that observes an emergency scene, estimates hazards &amp; people affected,
            resolves location context, suggests safe next steps, and drafts a structured notification.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/analyze"
              id="hero-try-demo-cta"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-red-900/50 transition-all hover:scale-105 hover:shadow-red-900/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-red-400 border border-red-400/30"
            >
              <Zap className="h-5 w-5 text-amber-200 group-hover:animate-pulse" />
              <span>TRY DEMO — 10 SECOND FLOW</span>
              <ArrowRight className="h-4 w-4 text-white/90 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/40 backdrop-blur-sm px-7 py-4 text-base font-medium text-gray-300 transition-all hover:border-gray-500 hover:text-white hover:bg-gray-800/70"
            >
              <Layers className="h-4 w-4 text-gray-400" />
              How It Works
            </a>
          </div>

          {/* Prominent Safety Notice */}
          <div className="mt-10 max-w-2xl mx-auto text-left">
            <Disclaimer variant="card" />
          </div>
        </div>
      </section>

      {/* Visual Pipeline Section: OBSERVE -> UNDERSTAND -> LOCATE -> PRIORITIZE -> COMMUNICATE */}
      <section id="how-it-works" className="px-4 py-16 border-y border-gray-800/60 bg-gray-900/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 tracking-wider uppercase mb-2">
              <Activity className="h-3.5 w-3.5" />
              Core Architecture Pipeline
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 sm:text-4xl">
              10-Second Judge Demo Experience
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              From an unstructured scene image to structured situation intelligence and simulated notification.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: "01", icon: Eye, title: "OBSERVE", desc: "Select or upload scene image", color: "text-blue-400", bg: "border-blue-500/30 bg-blue-500/10" },
              { step: "02", icon: Zap, title: "ANALYZE", desc: "Vision pipeline inspection", color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/10" },
              { step: "03", icon: AlertTriangle, title: "DETECT", desc: "Incident & hazards identified", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10" },
              { step: "04", icon: MapPin, title: "LOCATE", desc: "Resolve place & nearby services", color: "text-green-400", bg: "border-green-500/30 bg-green-500/10" },
              { step: "05", icon: ShieldCheck, title: "PRIORITIZE", desc: "Safe next steps & caveats", color: "text-cyan-400", bg: "border-cyan-500/30 bg-cyan-500/10" },
              { step: "06", icon: Bell, title: "COMMUNICATE", desc: "Notification draft & simulate", color: "text-purple-400", bg: "border-purple-500/30 bg-purple-500/10" },
            ].map(({ step, icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className={`relative flex flex-col justify-between rounded-xl border p-4 ${bg} transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-gray-500">{step}</span>
                  <div className={color}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-sm font-bold tracking-wide ${color} mb-1`}>{title}</h3>
                  <p className="text-xs text-gray-400 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preloaded Demo Scenarios */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Zero Setup · Deterministic Scenarios
              </div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Three Preloaded Demo Scenarios
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mt-1">
                Runs instantly from a clean installation with no API keys required.
              </p>
            </div>
            <DemoModeBadge />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Scenario 1: Road Accident */}
            <div className="group rounded-2xl border border-red-500/30 bg-gray-900/50 p-6 flex flex-col justify-between hover:border-red-500/60 hover:bg-gray-900 transition-all shadow-lg hover:shadow-red-950/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    <Car className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/40 bg-red-500/10 text-red-300">
                    91% LIKELY
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  Road Accident
                </h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  Possible two-vehicle collision on roadway. Traffic obstruction and vehicle damage identified.
                </p>

                <div className="space-y-2 border-t border-gray-800 pt-4 mb-6 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span><strong>3 people</strong> potentially affected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span>Traffic obstruction &amp; vehicle damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="truncate">Siddaganga Institute of Technology, Tumakuru</span>
                  </div>
                </div>
              </div>

              <Link
                href="/analyze?demo=road-accident"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600/90 py-3 text-sm font-bold text-white hover:bg-red-500 transition-all shadow-md shadow-red-950/40"
              >
                <span>Run 10-Sec Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Scenario 2: Fire / Smoke */}
            <div className="group rounded-2xl border border-orange-500/30 bg-gray-900/50 p-6 flex flex-col justify-between hover:border-orange-500/60 hover:bg-gray-900 transition-all shadow-lg hover:shadow-orange-950/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                    <Flame className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300">
                    88% MODERATE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  Fire / Smoke
                </h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  Visible smoke plume and flame activity near structural perimeter. Thermal hazards detected.
                </p>

                <div className="space-y-2 border-t border-gray-800 pt-4 mb-6 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span>People count <strong>uncertain</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span>Visible smoke/flames &amp; inhalation hazard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="truncate">Bengaluru, Karnataka (Demo Location)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/analyze?demo=fire-smoke"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600/90 py-3 text-sm font-bold text-white hover:bg-orange-500 transition-all shadow-md shadow-orange-950/40"
              >
                <span>Run 10-Sec Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Scenario 3: Crowd Incident */}
            <div className="group rounded-2xl border border-purple-500/30 bg-gray-900/50 p-6 flex flex-col justify-between hover:border-purple-500/60 hover:bg-gray-900 transition-all shadow-lg hover:shadow-purple-950/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300">
                    82% MODERATE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Crowd / Incident
                </h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  Dense crowd gathering in public plaza. Scene requires caution, perimeter safety, and clear egress.
                </p>

                <div className="space-y-2 border-t border-gray-800 pt-4 mb-6 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span><strong>Multiple people</strong> visible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span>Scene obstruction &amp; crowd surge risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="truncate">Chennai, Tamil Nadu (Demo Location)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/analyze?demo=crowd-disruption"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600/90 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-md shadow-purple-950/40"
              >
                <span>Run 10-Sec Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Responsible AI Architecture Banner */}
      <section className="px-4 py-16 border-t border-gray-800/60 bg-gray-950/60">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 mx-auto mb-4">
            <Shield className="h-6 w-6 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Safety-First Responsible AI Architecture
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            ResQLens enforces uncertainty-aware labeling, zero medical diagnoses, strict simulation boundaries,
            and deterministic offline fallbacks for guaranteed reliability in critical scenarios.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">No Real Dispatch</h4>
              <p className="text-xs text-gray-500">
                All notifications are strictly simulated in-memory and in demo logs. Real 112/911 dispatch is never performed.
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Uncertainty Aware</h4>
              <p className="text-xs text-gray-500">
                People counts and scene assessments are explicitly qualified as estimates rather than confirmed casualties.
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Zero Key Demo</h4>
              <p className="text-xs text-gray-500">
                Runs instantly on clean installation with preloaded scenario bundles. Optional Gemini &amp; OpenAI vision adapters.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
