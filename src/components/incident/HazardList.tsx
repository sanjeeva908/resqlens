"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";

interface HazardListProps {
  hazards: string[];
  urgencyIndicators?: string[];
  className?: string;
}

export function HazardList({ hazards, urgencyIndicators = [], className = "" }: HazardListProps) {
  return (
    <div
      className={`rounded-xl border border-gray-800 bg-gray-900/50 p-4 shadow-sm ${className}`}
      role="region"
      aria-label="Visible Hazards List"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Visible Hazards
          </span>
        </div>
        <span className="text-[10px] font-semibold text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded">
          {hazards.length} Identified
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {hazards.length > 0 ? (
          hazards.map((hazard, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-xs text-amber-200 font-medium"
            >
              <span className="text-amber-400 font-bold">•</span>
              <span className="truncate">{hazard}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 italic">No prominent hazards detected.</p>
        )}
      </div>

      {urgencyIndicators.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-1">
            Urgency Factors:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {urgencyIndicators.map((u, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] rounded-md bg-red-500/15 border border-red-500/30 text-red-300 px-2 py-0.5"
              >
                <AlertCircle className="h-3 w-3 text-red-400" />
                {u}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
