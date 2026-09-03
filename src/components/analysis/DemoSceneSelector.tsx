"use client";

import { Car, Flame, Users, CheckCircle, AlertTriangle } from "lucide-react";
import type { DemoScene } from "@/lib/demo-scenes";

interface DemoSceneSelectorProps {
  scenes: DemoScene[];
  selectedId: string | null;
  onSelect: (scene: DemoScene) => void;
  disabled?: boolean;
}

const SCENE_ICONS: Record<string, React.ElementType> = {
  "road-accident": Car,
  "fire-smoke": Flame,
  "crowd-disruption": Users,
};

const SCENE_STYLES: Record<string, { border: string; activeBorder: string; bg: string; activeBg: string; text: string; badge: string }> = {
  "road-accident": {
    border: "border-red-500/30",
    activeBorder: "border-red-500 ring-2 ring-red-500/40",
    bg: "bg-red-500/5 hover:bg-red-500/10",
    activeBg: "bg-red-500/15",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  "fire-smoke": {
    border: "border-orange-500/30",
    activeBorder: "border-orange-500 ring-2 ring-orange-500/40",
    bg: "bg-orange-500/5 hover:bg-orange-500/10",
    activeBg: "bg-orange-500/15",
    text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  "crowd-disruption": {
    border: "border-purple-500/30",
    activeBorder: "border-purple-500 ring-2 ring-purple-500/40",
    bg: "bg-purple-500/5 hover:bg-purple-500/10",
    activeBg: "bg-purple-500/15",
    text: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
};

export function DemoSceneSelector({
  scenes,
  selectedId,
  onSelect,
  disabled = false,
}: DemoSceneSelectorProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Preloaded Demo Scenes">
      {scenes.map((scene) => {
        const Icon = SCENE_ICONS[scene.id] ?? AlertTriangle;
        const styles = SCENE_STYLES[scene.id] ?? {
          border: "border-gray-700",
          activeBorder: "border-blue-500 ring-2 ring-blue-500/40",
          bg: "bg-gray-800/40 hover:bg-gray-800/60",
          activeBg: "bg-gray-800",
          text: "text-gray-400",
          badge: "bg-gray-700 text-gray-300 border-gray-600",
        };
        const isSelected = selectedId === scene.id;

        return (
          <button
            key={scene.id}
            id={`demo-scene-${scene.id}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(scene)}
            className={`w-full text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
              isSelected ? `${styles.activeBorder} ${styles.activeBg}` : `${styles.border} ${styles.bg}`
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl border ${
                  isSelected ? "bg-gray-900 border-white/20" : "bg-gray-900/60 border-gray-800"
                } ${styles.text}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-white text-sm sm:text-base">{scene.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                      {Math.round(scene.analysis.confidence * 100)}% {scene.analysis.certaintyLabel?.toUpperCase() || "LIKELY"}
                    </span>
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-green-400 animate-fade-in" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                  {scene.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                  <span>👥 {scene.analysis.peoplePotentiallyAffected?.label || scene.analysis.peopleCountLabel}</span>
                  <span>•</span>
                  <span>📍 {scene.location.city || "Tumakuru"}</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
