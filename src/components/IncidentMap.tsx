"use client";

import { useEffect, useRef } from "react";
import type { NearbyService } from "@/server/schemas/incident";

interface IncidentMapProps {
  center: [number, number];
  services: NearbyService[];
  locationLabel: string;
}

const SERVICE_MARKER_COLORS: Record<string, string> = {
  hospital: "#ef4444",
  police: "#3b82f6",
  fire: "#f59e0b",
};

export default function IncidentMap({ center, services, locationLabel }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (leafletMapRef.current) return; // Already initialized

    let mounted = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        // Fix default icon paths for Next.js
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (!mounted || !mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current, {
          center,
          zoom: 14,
          zoomControl: true,
          attributionControl: true,
        });

        leafletMapRef.current = map;

        // Tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Incident marker (red pulsing)
        const incidentIcon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:24px;height:24px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:#ef4444;opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative;width:24px;height:24px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 0 0 2px #ef4444;display:flex;align-items:center;justify-content:center;font-size:12px;">⚠</div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker(center, { icon: incidentIcon })
          .addTo(map)
          .bindPopup(`<strong>⚠ Incident Location</strong><br/>${locationLabel}<br/><small>Demo — not a real incident</small>`)
          .openPopup();

        // Service markers
        services.forEach((svc) => {
          const color = SERVICE_MARKER_COLORS[svc.category] ?? "#6b7280";
          const emoji = svc.category === "hospital" ? "🏥" : svc.category === "police" ? "🚔" : "🚒";
          const svcIcon = L.divIcon({
            className: "",
            html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:14px;">${emoji}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          L.marker([svc.lat, svc.lng], { icon: svcIcon })
            .addTo(map)
            .bindPopup(
              `<strong>${svc.name}</strong><br/>${svc.address}<br/><small>${svc.distance}</small>`
            );
        });
      } catch {
        // Map failed to load — the parent component handles the fallback gracefully
        console.warn("Leaflet map failed to initialize");
      }
    };

    // Add Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    initMap();

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [center, services, locationLabel]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-b-xl"
      style={{ minHeight: "220px" }}
      aria-label={`Map showing incident location: ${locationLabel}`}
    />
  );
}
