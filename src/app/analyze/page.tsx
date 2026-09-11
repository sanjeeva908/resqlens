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
import { extractGpsFromFile } from "@/lib/exif-gps";
import { extractStampedGpsFromFile } from "@/lib/stamped-gps";
import { useIncidentStore } from "@/store/incident-store";
import { getAllDemoScenes, getDemoScene } from "@/lib/demo-scenes";
import type { DemoScene } from "@/lib/demo-scenes";
import { DemoSceneSelector } from "@/components/analysis/DemoSceneSelector";
import { SceneUploader } from "@/components/analysis/SceneUploader";
import { ScenePreview } from "@/components/analysis/ScenePreview";
import { AnalysisSequence, SEQUENCE_STEPS } from "@/components/analysis/AnalysisSequence";
import { DemoModeBadge } from "@/components/ui/DemoModeBadge";
import { Disclaimer } from "@/components/ui/Disclaimer";

function getBrowserLocation(timeoutMs = 8000): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 }
    );
  });
}

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo");

  const { setAnalyzing, setAnalysisError, addOrUpdateIncident, setCurrentIncidentId } =
    useIncidentStore();

  const allScenes = getAllDemoScenes();
  // Only pre-select a demo when ?demo= is in the URL — never force Tumakuru for uploads
  const [selectedDemo, setSelectedDemo] = useState<DemoScene | null>(() => {
    if (demoParam) {
      const match = getDemoScene(demoParam);
      if (match) return match;
    }
    return null;
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (demoParam) {
      const match = getDemoScene(demoParam);
      if (match) return match.imagePath;
    }
    return null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);

  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoCoords, setPhotoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "available" | "photo" | "denied"
  >("idle");

  useEffect(() => {
    if (demoParam) {
      const match = getDemoScene(demoParam);
      if (match && selectedDemo?.id !== match.id) {
        queueMicrotask(() => {
          setSelectedDemo(match);
          setPreviewUrl(match.imagePath);
          setUploadedFile(null);
          setPhotoCoords(null);
        });
      }
    }
  }, [demoParam, selectedDemo?.id]);

  const requestLocation = useCallback(async () => {
    setLocationStatus("requesting");
    const coords = await getBrowserLocation();
    if (coords) {
      setDeviceCoords(coords);
      setLocationStatus("available");
      return coords;
    }
    setLocationStatus((prev) => (prev === "photo" ? "photo" : "denied"));
    return null;
  }, []);

  const handleDemoSelect = useCallback((scene: DemoScene) => {
    setSelectedDemo(scene);
    setUploadedFile(null);
    setPreviewUrl(scene.imagePath);
    setPhotoCoords(null);
    setError(null);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setSelectedDemo(null);
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
    setPhotoCoords(null);
    setLocationStatus("requesting");

    // 1) Real EXIF (often stripped by WhatsApp)
    const exif = await extractGpsFromFile(file);
    if (exif) {
      setPhotoCoords(exif);
      setLocationStatus("photo");
    } else {
      // 2) OCR GPS Map Camera / EXIF overlays burned into the pixels
      const stamped = await extractStampedGpsFromFile(file);
      if (stamped) {
        setPhotoCoords({ lat: stamped.lat, lng: stamped.lng });
        setLocationStatus("photo");
      }
    }

    // Browser GPS is a last-resort fallback (scene may not be where you are now)
    void requestLocation();
  }, [requestLocation]);

  const handleClear = useCallback(() => {
    setSelectedDemo(null);
    setUploadedFile(null);
    setPreviewUrl(null);
    setPhotoCoords(null);
    setError(null);
    setActiveStepIndex(-1);
    setLocationStatus("idle");
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
      // Prefer photo geotag/stamp over browser GPS for uploaded scenes
      let lat = photoCoords?.lat;
      let lng = photoCoords?.lng;

      if (uploadedFile && (lat == null || lng == null)) {
        setLocationStatus("requesting");
        // Retry OCR once more on analyze if upload-time OCR missed it
        const stamped = await extractStampedGpsFromFile(uploadedFile);
        if (stamped) {
          lat = stamped.lat;
          lng = stamped.lng;
          setPhotoCoords({ lat: stamped.lat, lng: stamped.lng });
          setLocationStatus("photo");
        } else {
          const fresh = await getBrowserLocation(10000);
          if (fresh) {
            lat = fresh.lat;
            lng = fresh.lng;
            setDeviceCoords(fresh);
            setLocationStatus("available");
          } else {
            setLocationStatus("denied");
          }
        }
      }

      const analyzePromise = analyzeScene({
        demoSceneId: selectedDemo?.id,
        imageFile: uploadedFile ?? undefined,
        lat,
        lng,
      });

      for (let i = 0; i < SEQUENCE_STEPS.length; i++) {
        setActiveStepIndex(i);
        await new Promise((r) => setTimeout(r, 280));
      }

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
            Select a preloaded demo scenario or upload a scene photo. Uploads use GPS / photo geotags — not the demo hub.
          </p>
        </div>
        <DemoModeBadge />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
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

          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-400" />
              Or Upload Custom Scene
            </h2>
            <SceneUploader onFileSelect={handleFileUpload} disabled={isAnalyzing} />
            {locationStatus === "requesting" && (
              <p className="mt-2 text-xs text-blue-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Requesting your location…</span>
              </p>
            )}
            {locationStatus === "photo" && photoCoords && (
              <p className="mt-2 text-xs text-green-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  Photo location ready ({photoCoords.lat.toFixed(4)}, {photoCoords.lng.toFixed(4)})
                </span>
              </p>
            )}
            {locationStatus === "available" && deviceCoords && !photoCoords && (
              <p className="mt-2 text-xs text-green-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  Browser GPS ready ({deviceCoords.lat.toFixed(4)}, {deviceCoords.lng.toFixed(4)})
                </span>
              </p>
            )}
            {locationStatus === "denied" && uploadedFile && (
              <p className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  No photo GPS stamp or browser location found yet. Server will also try OCR on analyze.
                </span>
              </p>
            )}
          </div>

          <Disclaimer variant="card" />
        </div>

        <div className="lg:col-span-7 space-y-6">
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

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Analysis Notice</p>
                <p className="text-xs text-red-300 mt-0.5">{error}</p>
              </div>
            </div>
          )}

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
              locationLabel={
                selectedDemo?.location.label ||
                (deviceCoords || photoCoords
                  ? "Resolving GPS location…"
                  : "Waiting for location…")
              }
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
