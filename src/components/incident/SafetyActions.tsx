"use client";

import { ShieldCheck, ArrowRight, Ban, Info, CheckCircle2 } from "lucide-react";

interface SafetyActionsProps {
  customActions?: string[];
  className?: string;
}

export function SafetyActions({ className = "" }: SafetyActionsProps) {
  return (
    <div
      className={`rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 shadow-xl ${className}`}
      role="region"
      aria-label="Safe Next Steps Guidance"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Safe Next Steps</h3>
            <p className="text-xs text-gray-400">Prioritized safety guidance for bystanders</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          Non-Medical
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        {/* FIRST */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col justify-between">
          <div>
            <span className="inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider mb-2.5">
              1. FIRST
            </span>
            <ul className="space-y-2 text-xs text-gray-200">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Move to a safe location away from the active scene.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Avoid immediate traffic and visible roadway hazards.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* THEN */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex flex-col justify-between">
          <div>
            <span className="inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wider mb-2.5">
              2. THEN
            </span>
            <ul className="space-y-2 text-xs text-gray-200">
              <li className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Note the exact incident location and prominent landmarks.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Share concise factual information with official responders.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* AVOID */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex flex-col justify-between">
          <div>
            <span className="inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 tracking-wider mb-2.5">
              3. AVOID
            </span>
            <ul className="space-y-2 text-xs text-gray-200">
              <li className="flex items-start gap-1.5">
                <Ban className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Never enter unsafe, unstable, or smoke-filled areas.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Do not move an injured person unless an immediate life-threatening hazard requires urgent action.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Safety Caveat */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300 flex items-start gap-2">
        <Info className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Safety Caveat:</strong> AI-generated guidance may be incorrect. Always verify important details before taking action and prioritize personal safety and official responder instructions.
        </span>
      </div>
    </div>
  );
}
