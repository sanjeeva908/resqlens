"use client";

import { AlertTriangle, Car, Flame, Users, Eye, CheckCircle2 } from "lucide-react";
import type { VisionAnalysis } from "@/server/schemas/incident";
import { formatIncidentType } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/incident/ConfidenceBadge";

interface IncidentCardProps {
  analysis: VisionAnalysis;
  className?: string;
}

const INCIDENT_ICONS: Record<string, React.ElementType> = {
  possible_road_accident: Car,
  possible_fire_smoke: Flame,
  possible_crowd_incident: Users,
  possible_fall_injury_scene: Users,
  possible_fall_injury: Users,
  possible_hazardous_obstruction: AlertTriangle,
  hazardous_obstruction: AlertTriangle,
  other_uncertain: Eye,
};

export function IncidentCard({ analysis, className = "" }: IncidentCardProps) {
  const Icon = INCIDENT_ICONS[analysis.incidentType] ?? AlertTriangle;
  const title = formatIncidentType(analysis.incidentType);

  return (
    <div
      className={`rounded-2xl border border-red-500/30 bg-gray-900/60 p-6 shadow-xl ${className}`}
      role="region"
      aria-label="Incident Detection Summary"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex-shrink-0 shadow-inner">
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {title}
            </h2>
            <ConfidenceBadge
              confidence={analysis.confidence}
              certaintyLabel={analysis.certaintyLabel}
            />
          </div>

          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {analysis.summary}
          </p>

          {/* Observed vs AI Estimates breakdown */}
          <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-gray-800/80 text-xs">
            <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                Observed (Visible Facts)
              </span>
              <ul className="space-y-1 text-gray-300">
                {(analysis.visibleObjects || analysis.visibleElements || ["Scene visual elements"]).slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-3">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1.5">
                AI Interpretation
              </span>
              <ul className="space-y-1 text-gray-300">
                {(analysis.environmentalClues || analysis.contextualClues || ["Visual context markers"]).slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Eye className="h-3 w-3 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Uncertainty disclaimer line */}
          <p className="mt-3 text-[11px] text-gray-500 italic">
            Note: {analysis.uncertaintyNote || "AI observation only. Scene details may differ from ground truth."}
          </p>
        </div>
      </div>
    </div>
  );
}
