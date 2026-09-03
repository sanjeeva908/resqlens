"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Zap,
  Camera,
  AlertTriangle,
  Loader2,
  MapPin,
  Layers,
} from "lucide-react";
import { analyzeScene } from "@/lib/api-client";
import { useIncidentStore } from "@/store/incident-store";
import { getAllDemoScenes, getDemoScene } from "@/lib/demo-scenes";
import type { DemoScene } from "@/lib/demo-scenes";
import { DemoSceneSelector } from "@/components/analysis/DemoSceneSelector";
import { SceneUploader } from "@/components/analysis/SceneUploader";
import { ScenePreview } from "@/components/analysis/ScenePreview";
import { AnalysisSequence, SEQUENCE_STEPS } from "@/components/analysis/AnalysisSequence";
import { DemoModeBadge } from "@/components/ui/DemoModeBadge";
import { Disclaimer } from "@/components/ui/Disclaimer";

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo");

  const { setAnalyzing, setAnalysisError, addOrUpdateIncident, setCurrentIncidentId } =
    useIncidentStore();

  const allScenes = getAllDemoScenes();
  const [selectedDemo, setSelectedDemo] = useState<DemoScene | null>(() => {
    if (demoParam) {
      const match = getDemoScene(demoParam);
      if (match) return match;
    }
    return allScenes[0] || null;
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (demoParam) {
      const match = getDemoScene(demoParam);
      if (match) return match.imagePath;
    }
    return allScenes[0]?.imagePath || null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);

  // Device location state
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "available" | "denied">("idle");

  // Sync demoParam changes asynchronously if param updates
  useEffect(() => {
    if (demoParam) {
      const match = getDemoScene(demoParam);
      if (match && selectedDemo?.id !== match.id) {
        queueMicrotask(() => {
          setSelectedDemo(match);
          setPreviewUrl(match.imagePath);
        });
      }
    }
  }, [demoParam, selectedDemo?.id]);

  // Request browser location if available
  const requestLocation = useCallback(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setLocationStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus("available");
        },
        () => {
          setLocationStatus("denied");
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleDemoSelect = useCallback((scene: DemoScene) => {
    setSelectedDemo(scene);
    setUploadedFile(null);
    setPreviewUrl(scene.imagePath);
    setError(null);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    setSelectedDemo(null);
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
    requestLocation();
  }, [requestLocation]);

  const handleClear = useCallback(() => {
    setSelectedDemo(null);
    setUploadedFile(null);
    setPreviewUrl(null);
    setError(null);
    setActiveStepIndex(-1);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedDemo && !uploadedFile) {
      setError("Please select a demo scene or upload an image first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzing(true);
    setError(null);

    try {
      // 1. Fire the API request in parallel
      const analyzePromise = analyzeScene({
        demoSceneId: selectedDemo?.id,
        imageFile: uploadedFile ?? undefined,
        lat: deviceCoords?.lat,
        lng: deviceCoords?.lng,
      });

      // 2. Play the concise 10-step visual sequence (~280ms per step = ~2.8s)
      for (let i = 0; i < SEQUENCE_STEPS.length; i++) {
        setActiveStepIndex(i);
        await new Promise((r) => setTimeout(r, 280));
      }

      // Wait for server response
      const incident = await analyzePromise;
      addOrUpdateIncident(incident);
      setCurrentIncidentId(incident.id);

      if (incident.status === "error") {
        const lastEvent = incident.timeline[incident.timeline.length - 1];
        setError(lastEvent?.detail || "Scene analysis could not be completed. Please try another image.");
        setIsAnalyzing(false);
        setAnalyzing(false);
        return;
      }

      // Smooth transition to results page
      await new Promise((r) => setTimeout(r, 300));
      router.push(`/incident/${incident.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Scene analysis could not be completed. Please try another image.";
      setError(msg);
      setAnalysisError(msg);
      setIsAnalyzing(false);
      setAnalyzing(false);
    }
  };

  const hasSelection = Boolean(selectedDemo || uploadedFile);
  const currentSceneLabel = selectedDemo?.label || uploadedFile?.name || "Emergency Scene";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <Camera className="h-4 w-4" />
            <span>Step 1: Observe &amp; Analyze</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Scene Analysis
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Select a preloaded demo scenario or upload a simulated scene photo.
          </p>
        </div>
        <DemoModeBadge />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Demo Scenes & Upload */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preloaded Demo Scenes */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-red-400" />
                Preloaded Demo Scenes
              </h2>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Deterministic
              </span>
            </div>
            <DemoSceneSelector
              scenes={allScenes}
              selectedId={selectedDemo?.id ?? null}
              onSelect={handleDemoSelect}
              disabled={isAnalyzing}
            />
          </div>

          {/* Upload Custom Scene */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-400" />
              Or Upload Custom Scene
            </h2>
            <SceneUploader onFileSelect={handleFileUpload} disabled={isAnalyzing} />
            {locationStatus === "available" && (
              <p className="mt-2 text-xs text-green-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Browser location captured for this request</span>
              </p>
            )}
            {locationStatus === "denied" && (
              <p className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Location access unavailable — using selected demo location</span>
              </p>
            )}
          </div>

          <Disclaimer variant="card" />
        </div>

        {/* Right Column (7 cols): Preview & 10-Second Demo Execution */}
        <div className="lg:col-span-7 space-y-6">
          {/* Scene Preview */}
          {previewUrl ? (
            <ScenePreview
              previewUrl={previewUrl}
              isAnalyzing={isAnalyzing}
              onClear={handleClear}
              label={currentSceneLabel}
              isDemo={Boolean(selectedDemo)}
            />
          ) : (
            <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30 flex flex-col items-center justify-center text-center p-6">
              <Camera className="h-10 w-10 text-gray-600 mb-2" />
              <p className="text-sm font-medium text-gray-400">No scene selected</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Choose a preloaded demo scenario from the left or upload an image to begin.
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Analysis Notice</p>
                <p className="text-xs text-red-300 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Action Button & Sequence */}
          {!isAnalyzing ? (
            <div className="space-y-3">
              <button
                id="analyze-scene-btn"
                type="button"
                onClick={handleAnalyze}
                disabled={!hasSelection}
                className={`w-full py-4 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-[0.98] ${
                  hasSelection
                    ? "bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-red-950/50 cursor-pointer border border-red-400/30"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                }`}
              >
                <Zap className="h-5 w-5 text-amber-200 animate-pulse" />
                <span>ANALYZE SCENE</span>
                <span className="text-xs font-mono font-normal opacity-75 hidden sm:inline">
                  (10-Sec Demo Flow)
                </span>
              </button>

              <p className="text-center text-xs text-gray-500">
                AI observation only. Does not replace emergency services.
              </p>
            </div>
          ) : (
            <AnalysisSequence
              activeStepIndex={activeStepIndex}
              incidentTypeLabel={selectedDemo?.analysis.incidentType.replace(/_/g, " ") || "Incident"}
              locationLabel={selectedDemo?.location.label || "Demo location"}
              peopleLabel={selectedDemo?.analysis.peoplePotentiallyAffected?.label || selectedDemo?.analysis.peopleCountLabel || "People count estimated"}
              hazardLabel={selectedDemo?.analysis.visibleHazards[0] || "Scene hazard identified"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-red-400 animate-spin" />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
