"use client";

import { Shield, Sparkles } from "lucide-react";

interface DemoModeBadgeProps {
  compact?: boolean;
  className?: string;
}

export function DemoModeBadge({ compact = false, className = "" }: DemoModeBadgeProps) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 shadow-sm shadow-amber-950/20 ${className}`}
        title="Demo Mode: Simulated scene data with deterministic fallbacks. No external emergency dispatch is ever performed."
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
        DEMO MODE
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-sm ${className}`}
    >
      <Shield className="h-3.5 w-3.5 text-amber-400" />
      <span className="font-bold tracking-wider">DEMO MODE</span>
      <span className="hidden sm:inline text-amber-500/80">|</span>
      <span className="hidden sm:inline text-amber-200/80">Simulated Safe Environment</span>
      <Sparkles className="h-3 w-3 text-amber-400/70" />
    </div>
  );
}
