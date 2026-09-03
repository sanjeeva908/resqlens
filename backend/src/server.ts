import cors from "cors";
import express, { type Request, type Response } from "express";
import multer from "multer";
import { AnalyzeRequestSchema } from "../../src/server/schemas/incident.js";
import { incidentService } from "../../src/server/services/incident-service.js";
import { getCommunicationProvider } from "../../src/server/providers/communication-provider.js";
import { getMapsProvider } from "../../src/server/providers/maps-provider.js";
import { getStorageProvider } from "../../src/server/providers/storage-provider.js";
import { getVisionProvider } from "../../src/server/providers/vision-provider.js";
import { getDemoScene } from "../../src/lib/demo-scenes.js";

const app = express();
const port = Number(process.env.PORT ?? 10000);
const allowedOrigins = (process.env.CORS_ORIGINS ?? "https://resqlens.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    callback(null, ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype));
  },
});

app.use(cors({ origin: allowedOrigins, methods: ["GET", "POST", "OPTIONS"], credentials: false }));
app.use(express.json({ limit: "12mb" }));

const sendError = (response: Response, status: number, error: string) => response.status(status).json({ error });

app.get("/api/health", (_request, response) => {
  const vision = getVisionProvider();
  const maps = getMapsProvider();
  const comm = getCommunicationProvider();
  const storage = getStorageProvider();
  const configured = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  response.json({
    status: "healthy",
    service: "ResQLens Emergency Assistant API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    demo_mode: !configured,
    providers: {
      ai_vision: { provider: vision?.name ?? "demo", active: Boolean(vision), configured, model: process.env.GEMINI_API_KEY ? "Gemini 1.5 Flash" : process.env.OPENAI_API_KEY ? "GPT-4o Vision" : "Deterministic Demo Engine" },
      maps: { provider: maps.name, source: process.env.MAPS_API_KEY ? "External Maps API" : "OpenStreetMap + Demo Fallback" },
      communication: { provider: comm.name, mode: "Strict Simulation Only", dispatch_enabled: false },
      database: { provider: storage.name, persistence: "In-Memory Session + Local Fallback" }
    },
    safety_compliance: { medical_diagnosis: "disabled", emergency_dispatch: "disabled", uncertainty_aware_labeling: "enforced" }
  });
});

async function analyze(request: Request, response: Response) {
  try {
    const contentType = request.headers["content-type"] ?? "";
    let input: { demoSceneId?: string; imageBase64?: string; imageMimeType?: string; lat?: number; lng?: number };
    if (contentType.includes("multipart/form-data")) {
      const file = request.file;
      input = {
        demoSceneId: typeof request.body.demoSceneId === "string" ? request.body.demoSceneId : undefined,
        imageBase64: file?.buffer.toString("base64"),
        imageMimeType: file?.mimetype,
        lat: request.body.lat ? Number(request.body.lat) : undefined,
        lng: request.body.lng ? Number(request.body.lng) : undefined
      };
    } else {
      const parsed = AnalyzeRequestSchema.safeParse(request.body);
      if (!parsed.success) return sendError(response, 400, "Invalid request body");
      input = parsed.data;
    }
    const incident = await incidentService.analyzeScene(input);
    return response.status(201).json({ incident });
  } catch (error) {
    return sendError(response, 500, error instanceof Error ? error.message : "Analysis failed");
  }
}

app.get("/api/incidents", (_request, response) => response.json({ incidents: incidentService.getAll() }));
app.post("/api/incidents", upload.single("image"), analyze);
app.post("/api/incidents/analyze", upload.single("image"), analyze);

app.get("/api/incidents/:id", (request, response) => {
  const incident = incidentService.getById(request.params.id);
  return incident ? response.json({ incident }) : sendError(response, 404, "Incident not found");
});
app.get("/api/incidents/:id/timeline", (request, response) => {
  const timeline = incidentService.getTimeline(request.params.id);
  return timeline ? response.json({ timeline }) : sendError(response, 404, "Incident not found");
});
app.post("/api/incidents/:id/recommendations", (request, response) => {
  const recommendations = incidentService.generateRecommendations(request.params.id);
  return recommendations ? response.json({ recommendations }) : sendError(response, 404, "Incident not found or no analysis available");
});
app.post("/api/incidents/:id/notification", (request, response) => {
  const incident = incidentService.updateNotification(request.params.id, request.body);
  return incident ? response.json({ notificationDraft: incident.notificationDraft }) : sendError(response, 404, "Incident not found or no notification draft");
});
app.post("/api/incidents/:id/notification/simulate", async (request, response) => {
  const incident = await incidentService.simulateNotification(request.params.id);
  return incident ? response.json({ success: true, message: "Notification sent (simulated)", status: "NOTIFICATION SENT (SIMULATED)", notificationDraft: incident.notificationDraft, disclaimer: "This is a simulated notification only. No real emergency service was contacted." }) : sendError(response, 404, "Incident not found or no notification draft");
});

app.post("/api/location/resolve", (request, response) => {
  const { lat, lng, demoLocationId } = request.body as { lat?: number; lng?: number; demoLocationId?: string };
  if (demoLocationId) {
    const scene = getDemoScene(demoLocationId);
    if (scene) return response.json({ location: scene.location });
  }
  if (lat != null && lng != null) return response.json({ location: { lat, lng, label: "Location identified", source: "gps" } });
  return sendError(response, 400, "No location data provided");
});
app.get("/api/location/services", async (request, response) => {
  try {
    const demoSceneId = String(request.query.demoSceneId ?? "");
    const scene = demoSceneId ? getDemoScene(demoSceneId) : undefined;
    if (scene) return response.json({ services: scene.nearbyServices });
    const lat = Number(request.query.lat);
    const lng = Number(request.query.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return response.json({ services: await getMapsProvider().getNearbyServices({ lat, lng, label: "User Location", source: "unknown" }) });
    return response.json({ services: [], message: "Provide demoSceneId or lat/lng to retrieve nearby services." });
  } catch {
    return sendError(response, 500, "Failed to retrieve nearby services.");
  }
});

app.listen(port, "0.0.0.0", () => console.log(`ResQLens backend listening on port ${port}`));
