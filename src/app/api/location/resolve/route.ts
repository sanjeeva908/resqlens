import { NextRequest, NextResponse } from "next/server";
import { getMapsProvider } from "@/server/providers/maps-provider";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { lat?: number; lng?: number; demoLocationId?: string };
    const { lat, lng, demoLocationId } = body;

    const mapsProvider = getMapsProvider();
    const location = await mapsProvider.resolveLocation({ lat, lng, demoLocationId });

    return NextResponse.json({ location });
  } catch {
    return NextResponse.json({ error: "Location resolution failed" }, { status: 500 });
  }
}
