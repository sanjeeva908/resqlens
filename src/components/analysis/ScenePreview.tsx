"use client";

import { X, Sparkles } from "lucide-react";

interface ScenePreviewProps {
  previewUrl: string;
  isAnalyzing: boolean;
  onClear: () => void;
  label?: string;
  isDemo?: boolean;
}

export function ScenePreview({
  previewUrl,
  isAnalyzing,
  onClear,
  label = "Scene Preview",
  isDemo = false,
}: ScenePreviewProps) {
  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-800/80 px-4 py-3 bg-gray-950/70">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-bold text-white tracking-wider uppercase">
            IMAGE SELECTED
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
              DEMO SCENE
            </span>
          )}
          {!isAnalyzing && (
            <button
              onClick={onClear}
              type="button"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-gray-800 transition-colors"
              title="Replace or clear selection"
            >
              <X className="h-3.5 w-3.5" />
              <span>Replace</span>
            </button>
          )}
        </div>
      </div>

      {/* Image container */}
      <div className="relative aspect-video w-full bg-black/50 overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Selected emergency scene"
          className="w-full h-full object-cover transition-transform duration-500"
        />

        {/* Scan line effect during analysis */}
        {isAnalyzing && (
          <div className="pointer-events-none absolute inset-0">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(239, 68, 68, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Laser scanning beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] animate-scan" />
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-red-950/80 border border-red-500/50 px-3 py-1 text-xs font-bold text-red-300 backdrop-blur-md animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-red-400" />
              <span>VISION SCANNER ACTIVE</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2.5 bg-gray-950/40 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
        <span className="truncate font-medium">{label}</span>
        <span className="text-[11px] text-gray-500">Ready for inspection</span>
      </div>
    </div>
  );
}
