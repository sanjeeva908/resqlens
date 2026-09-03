"use client";

import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

interface DisclaimerProps {
  variant?: "banner" | "card" | "inline";
  className?: string;
}

export function Disclaimer({ variant = "card", className = "" }: DisclaimerProps) {
  if (variant === "inline") {
    return (
      <p className={`text-xs text-amber-400/90 leading-relaxed flex items-start gap-1.5 ${className}`}>
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
        <span>
          <strong>Safety Notice:</strong> ResQLens is an emergency-assistance prototype. It does not replace trained emergency responders or official emergency services. AI analysis can be wrong.
        </span>
      </p>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`border-y border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-center text-xs text-amber-300/90 ${className}`}>
        <div className="mx-auto max-w-6xl flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Emergency Prototype Only:</strong> This tool never dispatches real responders or makes real emergency calls. For real emergencies, dial your local emergency number (112 / 911) immediately.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-300/90 shadow-sm ${className}`}
      role="note"
      aria-label="Safety Disclaimer"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20 flex-shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-200">
            Important Safety Notice & Limitations
          </h4>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            ResQLens is an AI emergency-assistance <strong>prototype</strong> designed for educational demonstration and scene structuring.
            It does <strong>not</strong> provide medical diagnoses, contact emergency services, or replace official dispatch channels.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-amber-400/80 font-medium">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3" /> AI analysis can be wrong — verify all details
            </span>
            <span>•</span>
            <span>Always prioritize personal safety</span>
            <span>•</span>
            <span>For real emergencies: call local emergency services</span>
          </div>
        </div>
      </div>
    </div>
  );
}
