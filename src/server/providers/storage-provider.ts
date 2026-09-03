import type {
  Incident,
  TimelineEvent,
  NotificationDraft,
} from "@/server/schemas/incident";
import { v4 as uuidv4 } from "uuid";

export interface StorageProvider {
  name: string;
  createIncident(partial: Partial<Incident> & { id?: string }): Promise<Incident>;
  findIncidentById(id: string): Promise<Incident | undefined>;
  findAllIncidents(): Promise<Incident[]>;
  updateIncident(id: string, patch: Partial<Incident>): Promise<Incident | undefined>;
  addTimelineEvent(incidentId: string, event: Partial<TimelineEvent> & { event: string }): Promise<TimelineEvent | undefined>;
  deleteIncident(id: string): Promise<boolean>;
}

// Global in-memory storage provider (survives hot reloads)
const globalStore = globalThis as typeof globalThis & {
  __resqlens_incidents?: Map<string, Incident>;
};

function getMap(): Map<string, Incident> {
  if (!globalStore.__resqlens_incidents) {
    globalStore.__resqlens_incidents = new Map();
  }
  return globalStore.__resqlens_incidents;
}

export class LocalStorageProvider implements StorageProvider {
  name = "local";

  async createIncident(partial: Partial<Incident> & { id?: string }): Promise<Incident> {
    const store = getMap();
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
  }

  async findIncidentById(id: string): Promise<Incident | undefined> {
    return getMap().get(id);
  }

  async findAllIncidents(): Promise<Incident[]> {
    return Array.from(getMap().values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateIncident(id: string, patch: Partial<Incident>): Promise<Incident | undefined> {
    const store = getMap();
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
  }

  async addTimelineEvent(
    incidentId: string,
    eventData: Partial<TimelineEvent> & { event: string }
  ): Promise<TimelineEvent | undefined> {
    const store = getMap();
    const incident = store.get(incidentId);
    if (!incident) return undefined;
    const te: TimelineEvent = {
      id: eventData.id ?? uuidv4(),
      incidentId,
      event: eventData.event,
      eventType: eventData.eventType,
      status: eventData.status ?? "success",
      message: eventData.message,
      detail: eventData.detail,
      metadata: eventData.metadata,
      timestamp: eventData.timestamp ?? new Date().toISOString(),
    };
    const updated: Incident = {
      ...incident,
      timeline: [...incident.timeline, te],
      updatedAt: new Date().toISOString(),
    };
    store.set(incidentId, updated);
    return te;
  }

  async deleteIncident(id: string): Promise<boolean> {
    return getMap().delete(id);
  }
}

export function getStorageProvider(): StorageProvider {
  // If Supabase credentials are configured in future, SupabaseStorageProvider would be selected
  return new LocalStorageProvider();
}
