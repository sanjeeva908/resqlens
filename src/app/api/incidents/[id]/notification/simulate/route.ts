import { NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/server/services/incident-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const incident = await incidentService.simulateNotification(id);
  if (!incident) {
    return NextResponse.json({ error: "Incident not found or no notification draft" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    message: "Notification sent (simulated)",
    status: "NOTIFICATION SENT (SIMULATED)",
    notificationDraft: incident.notificationDraft,
    disclaimer:
      "This is a simulated notification only. No real emergency service was contacted.",
  });
}
