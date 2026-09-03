import { NextResponse } from "next/server";
import { getVisionProvider } from "@/server/providers/vision-provider";
import { getMapsProvider } from "@/server/providers/maps-provider";
import { getCommunicationProvider } from "@/server/providers/communication-provider";
import { getStorageProvider } from "@/server/providers/storage-provider";

export async function GET() {
  const vision = getVisionProvider();
  const maps = getMapsProvider();
  const comm = getCommunicationProvider();
  const storage = getStorageProvider();

  const isDemo = !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY;

  return NextResponse.json({
    status: "healthy",
    service: "ResQLens Emergency Assistant API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    demo_mode: isDemo,
    providers: {
      ai_vision: {
        provider: vision ? vision.name : "demo",
        active: Boolean(vision),
        configured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
        model: process.env.GEMINI_API_KEY
          ? "Gemini 1.5 Flash"
          : process.env.OPENAI_API_KEY
          ? "GPT-4o Vision"
          : "Deterministic Demo Engine",
      },
      maps: {
        provider: maps.name,
        source: process.env.MAPS_API_KEY ? "External Maps API" : "OpenStreetMap + Demo Fallback",
      },
      communication: {
        provider: comm.name,
        mode: "Strict Simulation Only",
        dispatch_enabled: false,
      },
      database: {
        provider: storage.name,
        persistence: "In-Memory Session + Local Fallback",
      },
    },
    safety_compliance: {
      medical_diagnosis: "disabled",
      emergency_dispatch: "disabled",
      uncertainty_aware_labeling: "enforced",
    },
  });
}
