import { NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/server/services/incident-service";
import { z } from "zod";

const UpdateNotificationSchema = z.object({
  userNotes: z.string().optional(),
  summary: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = (await request.json()) as unknown;
    const parsed = UpdateNotificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const incident = incidentService.updateNotification(id, parsed.data);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found or no notification draft" }, { status: 404 });
    }
    return NextResponse.json({ notificationDraft: incident.notificationDraft });
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
