import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { lat?: number; lng?: number; demoLocationId?: string };
    const { lat, lng, demoLocationId } = body;

    if (demoLocationId) {
      // Return a demo location label
      const demoLocations: Record<string, { lat: number; lng: number; label: string }> = {
        "road-accident": { lat: 13.3485, lng: 77.1007, label: "Siddaganga Institute of Technology, Tumakuru" },
        "fire-smoke": { lat: 12.9716, lng: 77.5946, label: "Bengaluru, Karnataka (Demo Location)" },
        "crowd-disruption": { lat: 13.0827, lng: 80.2707, label: "Chennai, Tamil Nadu (Demo Location)" },
      };
      const loc = demoLocations[demoLocationId];
      if (loc) {
        return NextResponse.json({ location: { ...loc, source: "demo" } });
      }
    }

    if (lat != null && lng != null) {
      return NextResponse.json({
        location: {
          lat,
          lng,
          label: "Location identified",
          source: "gps",
        },
      });
    }

    return NextResponse.json(
      { error: "No location data provided" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: "Location resolution failed" }, { status: 500 });
  }
}
