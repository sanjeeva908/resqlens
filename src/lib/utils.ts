export function clsx(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function getCertaintyLabel(confidence: number): string {
  if (confidence >= 0.9) return "Likely";
  if (confidence >= 0.7) return "Moderate confidence";
  return "Low confidence";
}

export function isLowConfidence(confidence: number): boolean {
  return confidence < 0.7;
}

export function formatIncidentType(type: string): string {
  const map: Record<string, string> = {
    possible_road_accident: "Possible Road Accident",
    possible_fire_smoke: "Possible Fire / Smoke",
    possible_crowd_incident: "Possible Crowd Incident",
    possible_fall_injury_scene: "Possible Fall / Injury Scene",
    possible_fall_injury: "Possible Fall / Injury Scene",
    possible_hazardous_obstruction: "Hazardous Obstruction",
    hazardous_obstruction: "Hazardous Obstruction",
    other_uncertain: "Other / Uncertain Incident",
  };
  return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return "text-emerald-400";
  if (confidence >= 0.7) return "text-amber-400";
  return "text-purple-400";
}

export function getConfidenceBg(confidence: number): string {
  if (confidence >= 0.9) return "bg-emerald-500/20 border-emerald-500/40";
  if (confidence >= 0.7) return "bg-amber-500/20 border-amber-500/40";
  return "bg-purple-500/20 border-purple-500/40";
}
