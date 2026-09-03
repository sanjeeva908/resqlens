"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Car,
  Flame,
  Users,
  AlertTriangle,
  Eye,
  Clock,
  ChevronRight,
  Plus,
  MapPin,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getIncidents } from "@/lib/api-client";
import { useIncidentStore } from "@/store/incident-store";
import type { Incident } from "@/server/schemas/incident";
import { formatDateTime, formatIncidentType, formatConfidence, getConfidenceColor } from "@/lib/utils";
import { DemoModeBadge } from "@/components/ui/DemoModeBadge";

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

export default function HistoryPage() {
  const { incidents: storeIncidents } = useIncidentStore();
  const [serverIncidents, setServerIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIncidents()
      .then(setServerIncidents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Merge server + client store incidents, deduplicated by id
  const allIncidents = (() => {
    const map = new Map<string, Incident>();
    serverIncidents.forEach((i) => map.set(i.id, i));
    storeIncidents.forEach((i) => {
      if (!map.has(i.id)) map.set(i.id, i);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  })();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <History className="h-4 w-4" />
            <span>Analysis Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Incident History
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {allIncidents.length} incident analysis record{allIncidents.length !== 1 ? "s" : ""} saved in this session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoModeBadge compact />
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-bold text-white hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-950/40"
          >
            <Plus className="h-4 w-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-gray-800 bg-gray-900/50 animate-pulse"
            />
          ))}
        </div>
      ) : allIncidents.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-12 sm:p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-800 text-gray-500 mx-auto mb-4">
            <History className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Incident Records Yet</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            Run the 10-second scene analysis demo to inspect detected hazards, location context, and notification history.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-500 transition-all shadow-lg shadow-red-950/40"
          >
            <Zap className="h-4 w-4" />
            <span>Try 10-Sec Demo Analysis</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {allIncidents.map((incident) => {
            const Icon = incident.analysis
              ? INCIDENT_ICONS[incident.analysis.incidentType] ?? AlertTriangle
              : AlertTriangle;
            const isSimulated = incident.notificationDraft?.status === "simulated";
            const peopleLabel =
              incident.analysis?.peoplePotentiallyAffected?.label ||
              incident.analysis?.peopleCountLabel ||
              "People count uncertain";

            return (
              <Link
                key={incident.id}
                href={`/incident/${incident.id}`}
                className="group block rounded-2xl border border-gray-800 bg-gray-900/50 p-5 hover:border-red-500/50 hover:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Icon & Title */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <span className="font-extrabold text-white text-base group-hover:text-red-400 transition-colors truncate">
                          {incident.analysis
                            ? formatIncidentType(incident.analysis.incidentType)
                            : "Analysis Incomplete"}
                        </span>

                        {incident.demoMode && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
                            DEMO
                          </span>
                        )}

                        {isSimulated && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            SIMULATED
                          </span>
                        )}
                      </div>

                      {/* Details row: Location, People, Confidence */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1.5">
                        {incident.analysis && (
                          <span className={`font-bold ${getConfidenceColor(incident.analysis.confidence)}`}>
                            {formatConfidence(incident.analysis.confidence)} confidence
                          </span>
                        )}
                        <span>•</span>
                        <span>👥 {peopleLabel}</span>
                        {incident.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-gray-300 truncate max-w-xs">
                              <MapPin className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">{incident.location.label}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Date, Time & Arrow */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-800/80 pt-3 sm:pt-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(incident.createdAt)}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 group-hover:translate-x-1 transition-transform">
                      <span>Open Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
