import { v4 as uuidv4 } from "uuid";
import type {
  Incident,
  TimelineEvent,
  NotificationDraft,
  VisionAnalysis,
  Location,
  NearbyService,
} from "@/server/schemas/incident";

// In-memory store (survives hot reloads in dev via global singleton)
const globalStore = globalThis as typeof globalThis & {
  __resqlens_incidents?: Map<string, Incident>;
};

function getStore(): Map<string, Incident> {
  if (!globalStore.__resqlens_incidents) {
    globalStore.__resqlens_incidents = new Map();
  }
  return globalStore.__resqlens_incidents;
}

export const incidentRepository = {
  create(partial: Partial<Incident> & { id?: string }): Incident {
    const store = getStore();
    const now = new Date().toISOString();
    const incident: Incident = {
      id: partial.id ?? uuidv4(),
      sceneImageUrl: partial.sceneImageUrl,
      demoSceneId: partial.demoSceneId,
      status: partial.status ?? "analyzing",
      analysis: partial.analysis ?? null,
      location: partial.location ?? null,
      nearbyServices: partial.nearbyServices ?? [],
      notificationDraft: partial.notificationDraft ?? null,
      timeline: partial.timeline ?? [],
      createdAt: partial.createdAt ?? now,
      updatedAt: now,
      demoMode: partial.demoMode ?? true,
    };
    store.set(incident.id, incident);
    return incident;
  },

  findById(id: string): Incident | undefined {
    return getStore().get(id);
  },

  findAll(): Incident[] {
    return Array.from(getStore().values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  update(id: string, patch: Partial<Incident>): Incident | undefined {
    const store = getStore();
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated: Incident = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return updated;
  },

  addTimelineEvent(
    incidentId: string,
    event: string,
    detail?: string,
    metadata?: Record<string, unknown>,
    status: "success" | "processing" | "warning" | "failed" = "success"
  ): TimelineEvent | undefined {
    const store = getStore();
    const incident = store.get(incidentId);
    if (!incident) return undefined;
    const te: TimelineEvent = {
      id: uuidv4(),
      incidentId,
      event,
      eventType: event.toUpperCase().replace(/\s+/g, "_"),
      status,
      message: detail ?? event,
      detail,
      metadata,
      timestamp: new Date().toISOString(),
    };
    const updated: Incident = {
      ...incident,
      timeline: [...incident.timeline, te],
      updatedAt: new Date().toISOString(),
    };
    store.set(incidentId, updated);
    return te;
  },

  setAnalysis(incidentId: string, analysis: VisionAnalysis): Incident | undefined {
    return this.update(incidentId, { analysis, status: "detected" });
  },

  setLocation(incidentId: string, location: Location): Incident | undefined {
    return this.update(incidentId, { location });
  },

  setNearbyServices(incidentId: string, services: NearbyService[]): Incident | undefined {
    return this.update(incidentId, { nearbyServices: services });
  },

  setNotificationDraft(
    incidentId: string,
    draft: NotificationDraft
  ): Incident | undefined {
    return this.update(incidentId, { notificationDraft: draft });
  },

  delete(id: string): boolean {
    return getStore().delete(id);
  },
};
