import type { VisionAnalysis, Location, NearbyService } from "@/server/schemas/incident";
import { DEMO_SCENES } from "@/server/integrations/demo-data";

export interface DemoScene {
  id: string;
  label: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  analysis: VisionAnalysis;
  location: Location;
  nearbyServices: NearbyService[];
}

export function getDemoScene(id: string): DemoScene | undefined {
  return DEMO_SCENES.find((s) => s.id === id);
}

export function getAllDemoScenes(): DemoScene[] {
  return DEMO_SCENES;
}
