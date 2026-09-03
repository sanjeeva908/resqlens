import type { Location, NearbyService } from "@/server/schemas/incident";
import { DEMO_SCENES } from "@/server/integrations/demo-data";
import { v4 as uuidv4 } from "uuid";

export interface MapsProvider {
  name: string;
  resolveLocation(params: {
    lat?: number;
    lng?: number;
    demoLocationId?: string;
  }): Promise<Location>;
  getNearbyServices(location: Location): Promise<NearbyService[]>;
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

export class RealMapsProvider implements MapsProvider {
  name = "real";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async resolveLocation(params: {
    lat?: number;
    lng?: number;
    demoLocationId?: string;
  }): Promise<Location> {
    if (params.lat != null && params.lng != null) {
      try {
        // Reverse geocoding via OpenStreetMap Nominatim with safe fallback
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${params.lat}&lon=${params.lng}`,
          {
            headers: {
              "User-Agent": "ResQLens-Emergency-Assistant/1.0",
            },
          }
        );
        if (res.ok) {
          const data = (await res.json()) as {
            display_name?: string;
            address?: { city?: string; town?: string; state?: string };
          };
          if (data.display_name) {
            return {
              lat: params.lat,
              lng: params.lng,
              label: data.display_name,
              source: "gps",
              city: data.address?.city || data.address?.town,
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

    const demo = new DemoMapsProvider();
    return demo.resolveLocation(params);
  }

  async getNearbyServices(location: Location): Promise<NearbyService[]> {
    // For MVP reliability & safe demonstration, nearby services return deterministic local service records
    const demo = new DemoMapsProvider();
    return demo.getNearbyServices(location);
  }
}

export function getMapsProvider(): MapsProvider {
  if (process.env.MAPS_API_KEY) {
    return new RealMapsProvider(process.env.MAPS_API_KEY);
  }
  return new DemoMapsProvider();
}
