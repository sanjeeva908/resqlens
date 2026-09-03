import { NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/server/services/incident-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const timeline = incidentService.getTimeline(id);
  if (timeline === null) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }
  return NextResponse.json({ timeline });
}
