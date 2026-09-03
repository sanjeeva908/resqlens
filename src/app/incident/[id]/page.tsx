"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  Loader2,
  RefreshCw,
  Eye,
  Camera,
} from "lucide-react";
import { getIncident, simulateNotification, updateNotification } from "@/lib/api-client";
import { useIncidentStore } from "@/store/incident-store";
import type { Incident } from "@/server/schemas/incident";
import { formatDateTime } from "@/lib/utils";

// Modular incident components
import { IncidentCard } from "@/components/incident/IncidentCard";
import { PeopleAffectedCard } from "@/components/incident/PeopleAffectedCard";
import { HazardList } from "@/components/incident/HazardList";
import { SafetyActions } from "@/components/incident/SafetyActions";
import { NearbyServices } from "@/components/incident/NearbyServices";
import { NotificationCard } from "@/components/incident/NotificationCard";
import { IncidentTimeline } from "@/components/incident/IncidentTimeline";
import { DemoModeBadge } from "@/components/ui/DemoModeBadge";
import { Disclaimer } from "@/components/ui/Disclaimer";

// Lazy-load Leaflet map to prevent SSR issues
const IncidentMap = dynamic(() => import("@/components/IncidentMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[260px] rounded-xl bg-gray-900/60 animate-pulse flex items-center justify-center border border-gray-800">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 text-red-400 animate-spin" />
        <span className="text-xs text-gray-500">Loading map tiles...</span>
      </div>
    </div>
  ),
});

export default function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const { addOrUpdateIncident } = useIncidentStore();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchIncident = useCallback(async () => {
    try {
      const data = await getIncident(id);
      setIncident(data);
      addOrUpdateIncident(data);
    } catch {
      setError("Could not load incident details. It may not exist or expired.");
    } finally {
      setLoading(false);
    }
  }, [id, addOrUpdateIncident]);

  useEffect(() => {
    let active = true;
    getIncident(id)
      .then((data) => {
        if (!active) return;
        setIncident(data);
        addOrUpdateIncident(data);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load incident details. It may not exist or expired.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, addOrUpdateIncident]);

  const handleSimulateNotification = async (editedDraftMessage?: string, userNotes?: string) => {
    if (!incident) return;
    setIsSimulating(true);
    try {
      if (userNotes !== undefined) {
        await updateNotification(incident.id, { userNotes, summary: editedDraftMessage });
      }
      await simulateNotification(incident.id);
      await fetchIncident();
    } catch {
      // Error handled gracefully
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl border-2 border-red-500/30 bg-red-500/10 flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-red-400 animate-spin" />
          </div>
          <p className="text-base font-bold text-white mb-1">ANALYZING SCENE</p>
          <p className="text-xs text-gray-400">Loading structured incident intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Incident Not Found</h2>
          <p className="text-xs text-gray-400 mb-6">{error || "This incident could not be found."}</p>
          <button
            onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  const { analysis, location, nearbyServices, notificationDraft, timeline } = incident;
  const isNotificationSimulated = notificationDraft?.status === "simulated";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>New Analysis</span>
          </Link>
          <div className="h-4 w-px bg-gray-800" />
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 py-1 text-xs font-extrabold text-red-400 shadow-sm shadow-red-950/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            INCIDENT DETECTED
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DemoModeBadge compact />
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span>{formatDateTime(incident.createdAt)}</span>
          </div>
          <button
            onClick={fetchIncident}
            className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Refresh incident"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: SCENE (Left) & INCIDENT CLASSIFICATION (Right) */}
      <section className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Scene Image (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden shadow-xl">
          <div className="border-b border-gray-800/80 px-4 py-3 flex items-center justify-between bg-gray-950/50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-red-400" />
              Scene Image
            </span>
            {incident.demoSceneId && (
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                SIMULATED SCENE
              </span>
            )}
          </div>
          <div className="aspect-video relative bg-black/60 overflow-hidden">
            {incident.demoSceneId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/demo-scenes/${incident.demoSceneId}.svg`}
                alt="Emergency scene"
                className="w-full h-full object-cover"
              />
            ) : incident.sceneImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={incident.sceneImageUrl}
                alt="Uploaded scene"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                <Eye className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-950/40 border-t border-gray-800/60 text-[11px] text-gray-500 text-center">
            Illustrative visual analysis · AI detected bounding cues
          </div>
        </div>

        {/* Right: Incident Classification, People & Hazards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysis && <IncidentCard analysis={analysis} />}

          {analysis && (
            <div className="grid sm:grid-cols-2 gap-4">
              <PeopleAffectedCard
                people={analysis.peoplePotentiallyAffected}
                fallbackLabel={analysis.peopleCountLabel}
              />
              <HazardList
                hazards={analysis.visibleHazards}
                urgencyIndicators={analysis.urgencyIndicators}
              />
            </div>
          )}
        </div>
      </section>

      {/* Row 2: LOCATION & MAP (Left) & SAFE NEXT STEPS (Right) */}
      <section className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Location & Map & Nearby Services (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Location Panel & Map */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Location Context
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                location?.source === "gps"
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}>
                {location?.source === "gps" ? "VERIFIED GPS" : "DEMO LOCATION"}
              </span>
            </div>

            {location ? (
              <div className="mb-4">
                <p className="text-base font-extrabold text-white">
                  {location.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  {location.source === "demo" && " · Demo fallback location"}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-4">
                Location not available — using selected demo location.
              </p>
            )}

            {/* Map viewport */}
            <div className="rounded-xl overflow-hidden border border-gray-800 min-h-[240px] mb-4">
              {location ? (
                <IncidentMap
                  center={[location.lat, location.lng]}
                  services={nearbyServices}
                  locationLabel={location.label}
                />
              ) : (
                <div className="h-[240px] flex items-center justify-center bg-gray-900 text-gray-500 text-xs">
                  Map coordinates unavailable
                </div>
              )}
            </div>

            {/* Nearby services */}
            <NearbyServices services={nearbyServices} />
          </div>
        </div>

        {/* Right: Safe Next Steps & Safety Caveat (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <SafetyActions customActions={analysis?.recommendedActions} />
          <Disclaimer variant="card" />
        </div>
      </section>

      {/* Row 3: NOTIFICATION READY & SIMULATION */}
      <section>
        {notificationDraft && (
          <NotificationCard
            draft={notificationDraft}
            onSimulate={handleSimulateNotification}
            isSimulating={isSimulating}
            isSimulated={isNotificationSimulated}
          />
        )}
      </section>

      {/* Row 4: ANALYSIS TIMELINE */}
      <section>
        <IncidentTimeline events={timeline} />
      </section>
    </div>
  );
}
