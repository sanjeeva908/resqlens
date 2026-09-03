import { NextRequest, NextResponse } from "next/server";
import { getMapsProvider } from "@/server/providers/maps-provider";
import { getDemoScene } from "@/lib/demo-scenes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const demoSceneId = searchParams.get("demoSceneId");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  try {
    const mapsProvider = getMapsProvider();

    // Demo scene shortcut — use deterministic data
    if (demoSceneId) {
      const scene = getDemoScene(demoSceneId);
      if (scene) {
        return NextResponse.json({ services: scene.nearbyServices });
      }
    }

    // Lat/lng based lookup via provider
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        const location = { lat, lng, label: "User Location", accuracy: 10 };
        const services = await mapsProvider.getNearbyServices(location);
        return NextResponse.json({ services });
      }
    }

    return NextResponse.json({
      services: [],
      message: "Provide demoSceneId or lat/lng to retrieve nearby services.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve nearby services." }, { status: 500 });
  }
}
