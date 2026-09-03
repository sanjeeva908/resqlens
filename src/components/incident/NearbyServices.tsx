"use client";

import { ShieldCheck, Phone } from "lucide-react";
import type { NearbyService } from "@/server/schemas/incident";

interface NearbyServicesProps {
  services: NearbyService[];
  className?: string;
}

const CATEGORY_META: Record<string, { icon: string; text: string; bg: string; border: string }> = {
  hospital: { icon: "🏥", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  police: { icon: "🚔", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  fire: { icon: "🚒", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
};

export function NearbyServices({ services, className = "" }: NearbyServicesProps) {
  if (services.length === 0) {
    return (
      <div className={`rounded-xl border border-gray-800 bg-gray-900/40 p-5 text-center text-xs text-gray-500 ${className}`}>
        Nearby services could not be loaded.
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`} role="region" aria-label="Nearby Emergency Services">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Nearby Emergency Services ({services.length})
        </span>
        <span className="text-[10px] text-gray-500">
          Not notified · Public directory
        </span>
      </div>

      <div className="space-y-2">
        {services.map((svc) => {
          const meta = CATEGORY_META[svc.category] ?? CATEGORY_META.hospital;
          return (
            <div
              key={svc.id}
              className={`flex items-start justify-between gap-3 rounded-xl border ${meta.border} ${meta.bg} p-3.5 transition-colors`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-xl flex-shrink-0 leading-none select-none">
                  {meta.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-bold ${meta.text} truncate`}>
                      {svc.name}
                    </p>
                    {svc.isTrustedProvider && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        Directory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{svc.address}</p>
                  {svc.phone && (
                    <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{svc.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="inline-block text-xs font-mono font-bold text-white bg-gray-900/80 px-2 py-1 rounded-md border border-gray-700/60">
                  {svc.distance}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
