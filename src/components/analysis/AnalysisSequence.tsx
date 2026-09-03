"use client";

import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  MapPin,
  Users,
  Bell,
  Sparkles,
} from "lucide-react";

export interface AnalysisSequenceProps {
  activeStepIndex: number;
  incidentTypeLabel: string;
  locationLabel: string;
  peopleLabel: string;
  hazardLabel: string;
}

export const SEQUENCE_STEPS = [
  { id: 1, label: "ANALYZING SCENE", type: "status" },
  { id: 2, label: "INCIDENT DETECTED", type: "header" },
  { id: 3, label: "Possible road accident", type: "data", icon: AlertTriangle, color: "text-red-400" },
  { id: 4, label: "LOCATION IDENTIFIED", type: "header" },
  { id: 5, label: "Location identified", type: "data", icon: MapPin, color: "text-green-400" },
  { id: 6, label: "POTENTIALLY AFFECTED", type: "header" },
  { id: 7, label: "3 people potentially affected", type: "data", icon: Users, color: "text-orange-400" },
  { id: 8, label: "HAZARDS IDENTIFIED", type: "header" },
  { id: 9, label: "Traffic obstruction", type: "data", icon: AlertTriangle, color: "text-amber-400" },
  { id: 10, label: "NOTIFICATION READY", type: "success", icon: Bell, color: "text-purple-400" },
];

export function AnalysisSequence({
  activeStepIndex,
  incidentTypeLabel,
  locationLabel,
  peopleLabel,
  hazardLabel,
}: AnalysisSequenceProps) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-gray-950/80 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-red-400 animate-spin" />
          <h3 className="text-xs font-bold text-white tracking-wider uppercase">
            10-Second Vision Pipeline Sequence
          </h3>
        </div>
        <span className="text-xs font-mono text-gray-400">
          Step {Math.min(activeStepIndex + 1, 10)} of 10
        </span>
      </div>

      <div className="space-y-2.5">
        {SEQUENCE_STEPS.map((step, idx) => {
          const isCurrent = activeStepIndex === idx;
          const isPending = activeStepIndex < idx;

          let displayLabel = step.label;
          if (step.id === 3 && incidentTypeLabel) displayLabel = `⚠ ${incidentTypeLabel}`;
          if (step.id === 5 && locationLabel) displayLabel = `📍 ${locationLabel}`;
          if (step.id === 7 && peopleLabel) displayLabel = `👥 ${peopleLabel}`;
          if (step.id === 9 && hazardLabel) displayLabel = `⚠ ${hazardLabel}`;

          if (isPending) {
            return (
              <div
                key={step.id}
                className="flex items-center gap-3 px-3 py-1.5 rounded-lg opacity-25 text-xs text-gray-500"
              >
                <div className="h-2 w-2 rounded-full bg-gray-700" />
                <span>{step.label}</span>
              </div>
            );
          }

          if (isCurrent) {
            return (
              <div
                key={step.id}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-white font-bold text-sm shadow-md animate-pulse"
              >
                <Loader2 className="h-4 w-4 text-red-400 animate-spin flex-shrink-0" />
                <span className="truncate">{displayLabel}</span>
              </div>
            );
          }

          // isDone
          return (
            <div
              key={step.id}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800/80 text-xs font-medium text-gray-200 transition-all duration-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span className={`truncate ${step.color || "text-gray-300"}`}>
                {displayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
