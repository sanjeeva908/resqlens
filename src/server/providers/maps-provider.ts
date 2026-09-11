import type { Location, NearbyService } from "@/server/schemas/incident";
import { DEMO_SCENES } from "@/server/integrations/demo-data";
import { v4 as uuidv4 } from "uuid";

const NOMINATIM_USER_AGENT = "ResQLens-Emergency-Assistant/1.0 (https://github.com/sanjeeva908/resqlens)";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS_M = 4000;

export interface MapsProvider {
  name: string;
  resolveLocation(params: {
    lat?: number;
    lng?: number;
    demoLocationId?: string;
  }): Promise<Location>;
  getNearbyServices(location: Location): Promise<NearbyService[]>;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export class DemoMapsProvider implements MapsProvider {
  name = "demo";

  async resolveLocation(params: {
    lat?: number;
    lng?: number;
    demoLocationId?: string;
  }): Promise<Location> {
    if (params.demoLocationId) {
      const match = DEMO_SCENES.find((s) => s.id === params.demoLocationId);
      if (match) return match.location;
    }

    // If GPS was provided even in demo mode, honor real coordinates on the map
    if (params.lat != null && params.lng != null) {
      return {
        lat: params.lat,
        lng: params.lng,
        label: `Coordinates: ${params.lat.toFixed(4)}, ${params.lng.toFixed(4)}`,
        source: "gps",
      };
    }

    // Default demo location: Siddaganga Institute of Technology, Tumakuru
    return {
      lat: 13.3485,
      lng: 77.1007,
      label: "Siddaganga Institute of Technology, Tumakuru",
      source: "demo",
      city: "Tumakuru",
      state: "Karnataka",
    };
  }

  async getNearbyServices(location: Location): Promise<NearbyService[]> {
    const match = DEMO_SCENES.find(
      (s) =>
        Math.abs(s.location.lat - location.lat) < 0.05 &&
        Math.abs(s.location.lng - location.lng) < 0.05
    );
    if (match) return match.nearbyServices;

    // Fallback deterministic mock services around given coordinates
    return [
      {
        id: uuidv4(),
        name: "District Emergency Hospital",
        category: "hospital",
        distance: "1.4 km",
        address: `Near ${location.label}`,
        lat: location.lat + 0.008,
        lng: location.lng + 0.008,
        phone: "+91 816 2278000",
        isTrustedProvider: true,
      },
      {
        id: uuidv4(),
        name: "Local Police Station",
        category: "police",
        distance: "2.3 km",
        address: `Near ${location.label}`,
        lat: location.lat - 0.007,
        lng: location.lng + 0.012,
        phone: "+91 816 2272000",
        isTrustedProvider: true,
      },
      {
        id: uuidv4(),
        name: "Municipal Fire Station",
        category: "fire",
        distance: "3.1 km",
        address: `Near ${location.label}`,
        lat: location.lat - 0.015,
        lng: location.lng - 0.009,
        phone: "+91 816 2278100",
        isTrustedProvider: true,
      },
    ];
  }
}

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    amenity?: string;
    phone?: string;
    "contact:phone"?: string;
    "addr:full"?: string;
    "addr:street"?: string;
    "addr:city"?: string;
  };
};

export class RealMapsProvider implements MapsProvider {
  name = "openstreetmap";

  constructor(_apiKey?: string) {
    // Reserved for future paid map adapters (Mapbox/Google). OSM needs no key.
  }

  async resolveLocation(params: {
    lat?: number;
    lng?: number;
    demoLocationId?: string;
  }): Promise<Location> {
    if (params.demoLocationId) {
      const demo = new DemoMapsProvider();
      return demo.resolveLocation(params);
    }

    if (params.lat != null && params.lng != null) {
      try {
        // Reverse geocoding via OpenStreetMap Nominatim (free, no API key)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${params.lat}&lon=${params.lng}`,
          {
            headers: {
              "User-Agent": NOMINATIM_USER_AGENT,
              Accept: "application/json",
            },
            next: { revalidate: 0 },
          }
        );
        if (res.ok) {
          const data = (await res.json()) as {
            display_name?: string;
            address?: { city?: string; town?: string; village?: string; state?: string };
          };
          if (data.display_name) {
            return {
              lat: params.lat,
              lng: params.lng,
              label: data.display_name,
              source: "gps",
              city: data.address?.city || data.address?.town || data.address?.village,
              state: data.address?.state,
            };
          }
        }
      } catch {
        // Fallback below
      }

      return {
        lat: params.lat,
        lng: params.lng,
        label: `Coordinates: ${params.lat.toFixed(4)}, ${params.lng.toFixed(4)}`,
        source: "gps",
      };
    }

    // Never invent a demo city for custom uploads — caller must supply coords or demoLocationId
    throw new Error("LOCATION_UNAVAILABLE");
  }

  async getNearbyServices(location: Location): Promise<NearbyService[]> {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${SEARCH_RADIUS_M},${location.lat},${location.lng});
          way["amenity"="hospital"](around:${SEARCH_RADIUS_M},${location.lat},${location.lng});
          node["amenity"="clinic"](around:${SEARCH_RADIUS_M},${location.lat},${location.lng});
          node["amenity"="police"](around:${SEARCH_RADIUS_M},${location.lat},${location.lng});
          way["amenity"="police"](around:${SEARCH_RADIUS_M},${location.lat},${location.lng});
          node["amenity"="fire_station"](around:${SEARCH_RADIUS_M},${location.lat},${location.lng});
          way["amenity"="fire_station"](around:${SEARCH_RADIUS_M},${location.lat},${location.lng});
        );
        out center 30;
      `;

      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": NOMINATIM_USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        throw new Error(`Overpass HTTP ${res.status}`);
      }

      const data = (await res.json()) as { elements?: OverpassElement[] };
      const elements = data.elements ?? [];

      const ranked: Array<NearbyService & { _km: number }> = [];
      const seen = new Set<string>();

      for (const el of elements) {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (lat == null || lng == null) continue;

        const amenity = el.tags?.amenity;
        let category: NearbyService["category"] | null = null;
        if (amenity === "hospital" || amenity === "clinic") category = "hospital";
        else if (amenity === "police") category = "police";
        else if (amenity === "fire_station") category = "fire";
        if (!category) continue;

        const name = el.tags?.name?.trim() || defaultServiceName(category);
        const key = `${category}:${name}:${lat.toFixed(4)}:${lng.toFixed(4)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const km = haversineKm(location.lat, location.lng, lat, lng);
        const street = el.tags?.["addr:street"];
        const city = el.tags?.["addr:city"];
        const address =
          el.tags?.["addr:full"] ||
          [street, city].filter(Boolean).join(", ") ||
          `Near ${location.city || location.label}`;

        ranked.push({
          id: uuidv4(),
          name,
          category,
          distance: formatDistance(km),
          address,
          lat,
          lng,
          phone: el.tags?.phone || el.tags?.["contact:phone"],
          isTrustedProvider: true,
          _km: km,
        });
      }

      // Prefer closest of each category, keep up to ~9 total
      ranked.sort((a, b) => a._km - b._km);
      const byCategory: Record<string, number> = {};
      const limited: NearbyService[] = [];
      for (const svc of ranked) {
        byCategory[svc.category] = (byCategory[svc.category] ?? 0) + 1;
        if (byCategory[svc.category] <= 3) {
          const { _km: _, ...rest } = svc;
          limited.push(rest);
        }
        if (limited.length >= 9) break;
      }

      if (limited.length > 0) {
        const hasHospital = limited.some((s) => s.category === "hospital");
        const hasPolice = limited.some((s) => s.category === "police");
        const hasFire = limited.some((s) => s.category === "fire");
        if (hasHospital && hasPolice && hasFire) return limited;

        // Fill missing categories from deterministic demo offsets
        const demo = await new DemoMapsProvider().getNearbyServices(location);
        for (const category of ["hospital", "police", "fire"] as const) {
          if (!limited.some((s) => s.category === category)) {
            const fill = demo.find((s) => s.category === category);
            if (fill) limited.push(fill);
          }
        }
        return limited;
      }
    } catch {
      // Fall through to demo fallback
    }

    // Reliable fallback if Overpass is unavailable
    const demo = new DemoMapsProvider();
    return demo.getNearbyServices(location);
  }
}

function defaultServiceName(category: NearbyService["category"]): string {
  if (category === "hospital") return "Hospital / Clinic";
  if (category === "police") return "Police Station";
  return "Fire Station";
}

/**
 * Real OpenStreetMap maps are the default (Nominatim reverse-geocode + Overpass POIs).
 * Set MAPS_PROVIDER=demo to force deterministic demo locations/services.
 * MAPS_API_KEY is optional and reserved for future paid map adapters.
 */
export function getMapsProvider(): MapsProvider {
  if (process.env.MAPS_PROVIDER === "demo") {
    return new DemoMapsProvider();
  }
  return new RealMapsProvider(process.env.MAPS_API_KEY);
}
