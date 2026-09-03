import { incidentRepository } from "@/server/repositories/incident-repository";
import { getVisionProvider, DemoVisionProvider } from "@/server/providers/vision-provider";
import { getMapsProvider } from "@/server/providers/maps-provider";
import { getCommunicationProvider } from "@/server/providers/communication-provider";
import { getDemoScene } from "@/lib/demo-scenes";
import type {
  Incident,
  VisionAnalysis,
  Location,
  NotificationDraft,
} from "@/server/schemas/incident";
import { v4 as uuidv4 } from "uuid";

function formatIncidentType(type: string): string {
  const map: Record<string, string> = {
    possible_road_accident: "Possible Road Accident",
    possible_fire_smoke: "Possible Fire / Smoke Incident",
    possible_crowd_incident: "Possible Crowd-Related Incident",
    possible_fall_injury_scene: "Possible Fall / Injury Scene",
    possible_fall_injury: "Possible Fall / Injury Scene",
    possible_hazardous_obstruction: "Hazardous Obstruction",
    hazardous_obstruction: "Hazardous Obstruction",
    other_uncertain: "Other / Uncertain Scene",
  };
  return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildNotificationDraft(
  incident: Incident,
  analysis: VisionAnalysis,
  location: Location | null
): NotificationDraft {
  const locationLabel = location?.label ?? "Location not identified";
  const peopleLabel =
    analysis.peoplePotentiallyAffected?.label ||
    analysis.peopleCountLabel ||
    "People count uncertain";
  const hazardsList = analysis.visibleHazards.length > 0
    ? analysis.visibleHazards
    : ["None immediately identified"];

  const formattedLines = [
    formatIncidentType(analysis.incidentType).toUpperCase(),
    "",
    "Location:",
    locationLabel,
    "",
    "Potentially affected:",
    peopleLabel,
    "",
    "Visible hazards:",
    ...hazardsList.map((h) => `• ${h}`),
    "",
    "Summary:",
    analysis.summary,
    "",
    "Note:",
    "AI-generated scene analysis. Verify details before sharing.",
  ];

  return {
    incidentType: formatIncidentType(analysis.incidentType),
    location: locationLabel,
    analysisTime: new Date().toISOString(),
    peoplePotentiallyAffected: peopleLabel,
    visibleHazards: analysis.visibleHazards,
    summary: analysis.summary,
    userNotes: "",
    uncertaintyNotice:
      "AI analysis can be wrong. ResQLens is an emergency-assistance prototype. Does not replace trained emergency responders or official emergency services.",
    status: "ready",
    notificationFacts: analysis.notificationFacts,
    formattedMessage: formattedLines.join("\n"),
  };
}

export const incidentService = {
  async analyzeScene(params: {
    demoSceneId?: string;
    imageBase64?: string;
    imageMimeType?: string;
    lat?: number;
    lng?: number;
  }): Promise<Incident> {
    const incidentId = uuidv4();
    const now = new Date().toISOString();
    const isDemo = Boolean(params.demoSceneId) || (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY);

    // 1. Initialize incident in analyzing state
    let incident = incidentRepository.create({
      id: incidentId,
      demoSceneId: params.demoSceneId,
      status: "analyzing",
      demoMode: isDemo,
      timeline: [
        {
          id: uuidv4(),
          incidentId,
          event: "Image selected",
          eventType: "IMAGE_SELECTED",
          status: "success",
          timestamp: now,
          detail: params.demoSceneId ? `Demo scene: ${params.demoSceneId}` : "Custom scene image uploaded",
        },
        {
          id: uuidv4(),
          incidentId,
          event: "Scene analysis started",
          eventType: "SCENE_ANALYSIS_STARTED",
          status: "processing",
          timestamp: now,
          detail: "Initiating AI visual inspection pipeline",
        },
      ],
    });

    let analysis: VisionAnalysis | null = null;
    const mapsProvider = getMapsProvider();

    // 2. Resolve vision analysis
    if (params.demoSceneId) {
      const demoScene = getDemoScene(params.demoSceneId);
      if (demoScene) {
        analysis = demoScene.analysis;
        incident = incidentRepository.setLocation(incidentId, demoScene.location) ?? incident;
        incident = incidentRepository.setNearbyServices(incidentId, demoScene.nearbyServices) ?? incident;

        incidentRepository.addTimelineEvent(
          incidentId,
          "Location resolved",
          `Demo location: ${demoScene.location.label}`,
          { source: "demo", location: demoScene.location }
        );
        incidentRepository.addTimelineEvent(
          incidentId,
          "Nearby services loaded",
          `${demoScene.nearbyServices.length} emergency services identified in vicinity`,
          { count: demoScene.nearbyServices.length }
        );
      }
    } else if (params.imageBase64 && params.imageMimeType) {
      let visionProvider = getVisionProvider();
      if (!visionProvider) {
        // Fallback to DemoVisionProvider so it works cleanly with no API keys
        visionProvider = new DemoVisionProvider();
      }

      try {
        analysis = await visionProvider.analyze(params.imageBase64, params.imageMimeType);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        incident = incidentRepository.update(incidentId, { status: "error" }) ?? incident;
        incidentRepository.addTimelineEvent(
          incidentId,
          "Vision analysis failed",
          message,
          undefined,
          "failed"
        );
        return incidentRepository.findById(incidentId) ?? incident;
      }

      // Resolve location
      const location = await mapsProvider.resolveLocation({
        lat: params.lat,
        lng: params.lng,
      });
      incident = incidentRepository.setLocation(incidentId, location) ?? incident;

      incidentRepository.addTimelineEvent(
        incidentId,
        "Location resolved",
        `${location.source === "gps" ? "Device GPS" : "Demo Location"}: ${location.label}`,
        { location }
      );

      // Resolve nearby services
      const services = await mapsProvider.getNearbyServices(location);
      incident = incidentRepository.setNearbyServices(incidentId, services) ?? incident;
      incidentRepository.addTimelineEvent(
        incidentId,
        "Nearby services loaded",
        `${services.length} services loaded in vicinity`
      );
    }

    if (!analysis) {
      incident = incidentRepository.update(incidentId, { status: "error" }) ?? incident;
      incidentRepository.addTimelineEvent(
        incidentId,
        "Vision analysis failed",
        "Scene analysis could not be completed. Please try another image.",
        undefined,
        "failed"
      );
      return incidentRepository.findById(incidentId) ?? incident;
    }

    // 3. Persist analysis & log completion
    incident = incidentRepository.setAnalysis(incidentId, analysis) ?? incident;
    incidentRepository.addTimelineEvent(
      incidentId,
      "Vision analysis completed",
      `AI analysis completed with ${Math.round(analysis.confidence * 100)}% confidence (${analysis.certaintyLabel})`
    );
    incidentRepository.addTimelineEvent(
      incidentId,
      "Incident classified",
      `Identified: ${formatIncidentType(analysis.incidentType)}`
    );

    // 4. Build notification draft
    const finalIncident = incidentRepository.findById(incidentId) ?? incident;
    const draft = buildNotificationDraft(finalIncident, analysis, finalIncident.location);
    incidentRepository.setNotificationDraft(incidentId, draft);
    incidentRepository.addTimelineEvent(
      incidentId,
      "Notification prepared",
      "Draft notification generated and ready for user review"
    );

    return incidentRepository.findById(incidentId) ?? incident;
  },

  getById(id: string): Incident | undefined {
    return incidentRepository.findById(id);
  },

  getAll(): Incident[] {
    return incidentRepository.findAll();
  },

  getTimeline(id: string) {
    const incident = incidentRepository.findById(id);
    return incident?.timeline ?? null;
  },

  updateNotification(
    id: string,
    patch: { userNotes?: string; summary?: string; formattedMessage?: string }
  ): Incident | undefined {
    const incident = incidentRepository.findById(id);
    if (!incident || !incident.notificationDraft) return undefined;

    const updatedDraft: NotificationDraft = {
      ...incident.notificationDraft,
      ...patch,
    };
    return incidentRepository.setNotificationDraft(id, updatedDraft);
  },

  async simulateNotification(id: string): Promise<Incident | undefined> {
    const incident = incidentRepository.findById(id);
    if (!incident || !incident.notificationDraft) return undefined;

    const commProvider = getCommunicationProvider();
    await commProvider.simulateNotification(incident.notificationDraft);

    const draft: NotificationDraft = {
      ...incident.notificationDraft,
      status: "simulated",
    };
    const updated = incidentRepository.setNotificationDraft(id, draft);
    incidentRepository.addTimelineEvent(
      id,
      "Demo notification simulated",
      "Simulated notification recorded (no emergency dispatch or real service contact performed)"
    );
    return updated;
  },

  generateRecommendations(id: string) {
    const incident = incidentRepository.findById(id);
    if (!incident || !incident.analysis) return null;

    const customFirst = incident.analysis.recommendedActions?.[0] ||
      incident.analysis.recommendedFirstActions?.[0] ||
      "Move to a safe location away from the active scene.";

    const customThen = incident.analysis.recommendedActions?.[1] ||
      incident.analysis.recommendedFirstActions?.[1] ||
      "Note the incident location and landmarks, then share concise factual information.";

    return {
      first: [
        "1. Move to a safe location.",
        "2. Avoid immediate hazards and active traffic.",
        customFirst,
      ],
      then: [
        "3. Note the exact incident location.",
        "4. Share concise factual information with official responders.",
        customThen,
      ],
      avoid: [
        "Entering unsafe or unstable areas.",
        "Taking unnecessary personal risks.",
        "Moving an injured person unless an immediate, life-threatening hazard requires urgent relocation.",
      ],
      disclaimer:
        "AI-generated guidance may be incorrect. ResQLens is an emergency-assistance prototype and does not replace trained emergency responders or official emergency services.",
      actions: incident.analysis.recommendedActions || incident.analysis.recommendedFirstActions || [],
    };
  },
};
