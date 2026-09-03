import { z } from "zod";

export const IncidentTypeSchema = z.enum([
  "possible_road_accident",
  "possible_fire_smoke",
  "possible_crowd_incident",
  "possible_fall_injury_scene",
  "possible_hazardous_obstruction",
  "other_uncertain",
  // Backward compatibility aliases
  "possible_fall_injury",
  "hazardous_obstruction",
]);

export type IncidentType = z.infer<typeof IncidentTypeSchema>;

export const IncidentStatusSchema = z.enum([
  "analyzing",
  "detected",
  "uncertain",
  "error",
]);

export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const PeoplePotentiallyAffectedSchema = z.object({
  count: z.number().nullable(),
  certainty: z.enum(["estimated", "uncertain", "multiple_visible", "none_visible", "unknown"]).or(z.string()),
  label: z.string(),
});

export type PeoplePotentiallyAffected = z.infer<typeof PeoplePotentiallyAffectedSchema>;

export const VisionAnalysisSchema = z.object({
  incidentType: IncidentTypeSchema,
  confidence: z.number().min(0).max(1),
  certaintyLabel: z.enum(["likely", "moderate confidence", "low confidence"]).or(z.string()),
  summary: z.string(),
  peoplePotentiallyAffected: PeoplePotentiallyAffectedSchema,
  visibleHazards: z.array(z.string()),
  visibleObjects: z.array(z.string()).default([]),
  environmentalClues: z.array(z.string()).default([]),
  urgencyIndicators: z.array(z.string()).default([]),
  recommendedActions: z.array(z.string()).default([]),
  notificationFacts: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([
    "AI image analysis may be incorrect. ResQLens is an emergency-assistance prototype and does not replace trained emergency responders.",
  ]),
  // Backward-compatible getters / aliases
  peopleCountLabel: z.string().optional(),
  recommendedFirstActions: z.array(z.string()).optional(),
  visibleElements: z.array(z.string()).optional(),
  contextualClues: z.array(z.string()).optional(),
  uncertaintyNote: z.string().optional(),
});

export type VisionAnalysis = z.infer<typeof VisionAnalysisSchema>;

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  label: z.string(),
  source: z.enum(["gps", "demo", "unknown"]),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

export const NearbyServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["hospital", "police", "fire"]),
  distance: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  phone: z.string().optional(),
  isTrustedProvider: z.boolean().default(false),
});

export type NearbyService = z.infer<typeof NearbyServiceSchema>;

export const TimelineEventSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  event: z.string(), // e.g. "Image selected", "Incident classified"
  eventType: z.string().optional(), // canonical type e.g. "IMAGE_SELECTED"
  status: z.enum(["success", "processing", "warning", "failed"]).default("success"),
  message: z.string().optional(),
  detail: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const NotificationDraftSchema = z.object({
  incidentType: z.string(),
  location: z.string(),
  analysisTime: z.string(),
  peoplePotentiallyAffected: z.string(),
  visibleHazards: z.array(z.string()),
  summary: z.string(),
  userNotes: z.string().optional(),
  uncertaintyNotice: z.string(),
  status: z.enum(["draft", "ready", "simulating", "simulated"]),
  notificationFacts: z.array(z.string()).optional(),
  formattedMessage: z.string().optional(),
});

export type NotificationDraft = z.infer<typeof NotificationDraftSchema>;

export const IncidentSchema = z.object({
  id: z.string(),
  sceneImageUrl: z.string().optional(),
  demoSceneId: z.string().optional(),
  status: IncidentStatusSchema,
  analysis: VisionAnalysisSchema.nullable(),
  location: LocationSchema.nullable(),
  nearbyServices: z.array(NearbyServiceSchema),
  notificationDraft: NotificationDraftSchema.nullable(),
  timeline: z.array(TimelineEventSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  demoMode: z.boolean().default(true),
});

export type Incident = z.infer<typeof IncidentSchema>;

export const AnalyzeRequestSchema = z.object({
  demoSceneId: z.string().optional(),
  imageBase64: z.string().optional(),
  imageMimeType: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
