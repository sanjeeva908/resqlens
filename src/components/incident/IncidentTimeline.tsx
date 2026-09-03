"use client";

import { CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import type { TimelineEvent } from "@/server/schemas/incident";
import { formatTimestamp } from "@/lib/utils";

interface IncidentTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function IncidentTimeline({ events, className = "" }: IncidentTimelineProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl ${className}`}
      role="region"
      aria-label="Incident Analysis Timeline"
    >
      <div className="flex items-center justify-between mb-5 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Analysis Timeline ({events.length} Events)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-gray-500">Chronological</span>
      </div>

      <div className="space-y-4">
        {events.map((event, i) => {
          const isLast = i === events.length - 1;

          let icon = <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
          let dotColor = "border-emerald-500/50 bg-emerald-500/10";

          if (event.status === "processing") {
            icon = <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
            dotColor = "border-blue-500/50 bg-blue-500/10";
          } else if (event.status === "warning") {
            icon = <AlertTriangle className="h-4 w-4 text-amber-400" />;
            dotColor = "border-amber-500/50 bg-amber-500/10";
          } else if (event.status === "failed") {
            icon = <AlertTriangle className="h-4 w-4 text-red-400" />;
            dotColor = "border-red-500/50 bg-red-500/10";
          }

          return (
            <div key={event.id || i} className="relative flex items-start gap-3.5">
              {/* Vertical connector line */}
              {!isLast && (
                <div className="absolute left-3.5 top-7 bottom-[-16px] w-0.5 bg-gray-800" />
              )}

              {/* Status Circle */}
              <div className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border ${dotColor}`}>
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-white">{event.event}</p>
                  <time className="text-[11px] font-mono text-gray-500 flex-shrink-0">
                    {formatTimestamp(event.timestamp)}
                  </time>
                </div>
                {event.detail && (
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{event.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
