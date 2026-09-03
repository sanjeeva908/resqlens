"use client";

import { Users, Info } from "lucide-react";
import type { PeoplePotentiallyAffected } from "@/server/schemas/incident";

interface PeopleAffectedCardProps {
  people: PeoplePotentiallyAffected | null | undefined;
  fallbackLabel?: string;
  className?: string;
}

export function PeopleAffectedCard({
  people,
  fallbackLabel,
  className = "",
}: PeopleAffectedCardProps) {
  const displayLabel = people?.label || fallbackLabel || "People count uncertain";

  return (
    <div
      className={`rounded-xl border border-gray-800 bg-gray-900/50 p-4 shadow-sm ${className}`}
      role="region"
      aria-label="Potentially Affected People Assessment"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Users className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Potentially Affected
          </span>
        </div>
        <span className="text-[10px] font-semibold text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded">
          Non-Medical
        </span>
      </div>

      <div className="mt-2">
        <p className="text-base font-bold text-orange-300">
          {displayLabel}
        </p>
        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
          <Info className="h-3 w-3 flex-shrink-0 text-gray-600" />
          <span>Visual estimate only — never confirmed casualties or injuries.</span>
        </p>
      </div>
    </div>
  );
}
