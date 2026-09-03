"use client";

import { AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";
import { getCertaintyLabel, isLowConfidence } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  certaintyLabel?: string;
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  certaintyLabel,
  className = "",
}: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);
  const label = certaintyLabel || getCertaintyLabel(confidence);
  const low = isLowConfidence(confidence);

  let badgeColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  let Icon = ShieldCheck;

  if (percentage >= 90) {
    badgeColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    Icon = ShieldCheck;
  } else if (percentage >= 70) {
    badgeColor = "bg-amber-500/15 text-amber-300 border-amber-500/30";
    Icon = CheckCircle;
  } else {
    badgeColor = "bg-purple-500/15 text-purple-300 border-purple-500/30";
    Icon = AlertTriangle;
  }

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badgeColor}`}>
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          {percentage}% Confidence · {label.toUpperCase()}
        </span>
      </div>

      {low && (
        <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
          ⚠ AI confidence is low. Verify the scene details before taking action.
        </p>
      )}
    </div>
  );
}
