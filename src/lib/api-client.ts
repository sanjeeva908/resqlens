import axios from "axios";
import type { Incident, NotificationDraft } from "@/server/schemas/incident";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const api = axios.create({
  baseURL: configuredApiUrl ? `${configuredApiUrl}/api` : "/api",
  timeout: 30000,
});

export interface AnalyzeParams {
  demoSceneId?: string;
  imageFile?: File;
  lat?: number;
  lng?: number;
}

export async function analyzeScene(params: AnalyzeParams): Promise<Incident> {
  const formData = new FormData();
  if (params.demoSceneId) {
    formData.append("demoSceneId", params.demoSceneId);
  }
  if (params.imageFile) {
    formData.append("image", params.imageFile);
  }
  if (params.lat != null) formData.append("lat", String(params.lat));
  if (params.lng != null) formData.append("lng", String(params.lng));

  const res = await api.post<{ incident: Incident }>("/incidents", formData);
  return res.data.incident;
}

export async function getIncident(id: string): Promise<Incident> {
  const res = await api.get<{ incident: Incident }>(`/incidents/${id}`);
  return res.data.incident;
}

export async function getIncidents(): Promise<Incident[]> {
  const res = await api.get<{ incidents: Incident[] }>("/incidents");
  return res.data.incidents;
}

export async function updateNotification(
  incidentId: string,
  patch: { userNotes?: string; summary?: string }
): Promise<NotificationDraft> {
  const res = await api.post<{ notificationDraft: NotificationDraft }>(
    `/incidents/${incidentId}/notification`,
    patch
  );
  return res.data.notificationDraft;
}

export async function simulateNotification(incidentId: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(
    `/incidents/${incidentId}/notification/simulate`
  );
  return res.data;
}

export async function getHealthStatus(): Promise<{
  status: string;
  providers: { vision: string };
  demo_mode: boolean;
}> {
  const res = await api.get("/health");
  return res.data as { status: string; providers: { vision: string }; demo_mode: boolean };
}
