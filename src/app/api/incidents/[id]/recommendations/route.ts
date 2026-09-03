import { NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/server/services/incident-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const recommendations = incidentService.generateRecommendations(id);
  if (!recommendations) {
    return NextResponse.json({ error: "Incident not found or no analysis available" }, { status: 404 });
  }
  return NextResponse.json({ recommendations });
}
