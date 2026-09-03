import { NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/server/services/incident-service";
import { AnalyzeRequestSchema } from "@/server/schemas/incident";

export async function GET() {
  try {
    const incidents = incidentService.getAll();
    return NextResponse.json({ incidents });
  } catch {
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    let demoSceneId: string | undefined;
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    let lat: number | undefined;
    let lng: number | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const demoId = formData.get("demoSceneId");
      if (demoId && typeof demoId === "string") {
        demoSceneId = demoId;
      }
      const latVal = formData.get("lat");
      const lngVal = formData.get("lng");
      if (latVal) lat = parseFloat(String(latVal));
      if (lngVal) lng = parseFloat(String(lngVal));

      const file = formData.get("image");
      if (file && file instanceof Blob) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" },
            { status: 400 }
          );
        }
        if (file.size > maxSize) {
          return NextResponse.json(
            { error: "Image too large. Maximum 10MB." },
            { status: 400 }
          );
        }
        const buffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString("base64");
        imageMimeType = file.type;
      }
    } else {
      const body = (await request.json()) as unknown;
      const parsed = AnalyzeRequestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request body", details: parsed.error.format() }, { status: 400 });
      }
      demoSceneId = parsed.data.demoSceneId;
      imageBase64 = parsed.data.imageBase64;
      imageMimeType = parsed.data.imageMimeType;
      lat = parsed.data.lat;
      lng = parsed.data.lng;
    }

    const incident = await incidentService.analyzeScene({
      demoSceneId,
      imageBase64,
      imageMimeType,
      lat,
      lng,
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
