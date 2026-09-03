/**
 * Comprehensive Verification & Test Suite for ResQLens
 * Tests functional requirements, failure modes, schemas, providers, and safety rules.
 */

import { incidentService } from "../src/server/services/incident-service";
import { incidentRepository } from "../src/server/repositories/incident-repository";
import { getDemoScene, getAllDemoScenes } from "../src/lib/demo-scenes";
import { DemoVisionProvider, GeminiVisionProvider, OpenAIVisionProvider, getVisionProvider } from "../src/server/providers/vision-provider";
import { DemoMapsProvider, RealMapsProvider, getMapsProvider } from "../src/server/providers/maps-provider";
import { DemoCommunicationProvider, TwilioProvider, getCommunicationProvider } from "../src/server/providers/communication-provider";
import { LocalStorageProvider, getStorageProvider } from "../src/server/providers/storage-provider";
import {
  IncidentTypeSchema,
  VisionAnalysisSchema,
  NotificationDraftSchema,
  PeoplePotentiallyAffectedSchema,
} from "../src/server/schemas/incident";
import { formatConfidence, getCertaintyLabel, isLowConfidence } from "../src/lib/utils";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failed++;
  }
}

async function runSuite() {
  console.log("=================================================");
  console.log("  RESQLENS AUTOMATED TEST SUITE (SPEC & MASTER)  ");
  console.log("=================================================\n");

  // --- SUITE 1: SCHEMA & VALIDATION TESTS ---
  console.log("1. Schema & Validation Tests");

  const validRoadAnalysis = {
    incidentType: "possible_road_accident",
    confidence: 0.91,
    certaintyLabel: "likely",
    summary: "Possible road accident involving two vehicles.",
    peoplePotentiallyAffected: {
      count: 3,
      certainty: "estimated",
      label: "3 people potentially affected",
    },
    visibleHazards: ["Traffic obstruction", "Vehicle damage"],
    visibleObjects: ["Two vehicles"],
    environmentalClues: ["Roadway"],
    urgencyIndicators: ["Traffic obstruction"],
    recommendedActions: ["Move to safety"],
    notificationFacts: ["Fact 1"],
    limitations: ["AI image analysis may be incorrect."],
  };

  const parsedValid = VisionAnalysisSchema.safeParse(validRoadAnalysis);
  assert(parsedValid.success, "Valid analysis payload passes schema validation");

  const malformedAnalysis = {
    incidentType: "car_crash", // Invalid type
    confidence: 1.5, // Exceeds max 1.0
    summary: 12345, // Invalid type
  };
  const parsedMalformed = VisionAnalysisSchema.safeParse(malformedAnalysis);
  assert(!parsedMalformed.success, "Malformed AI response is rejected by schema validator");

  const peopleEstimate = PeoplePotentiallyAffectedSchema.safeParse({
    count: 3,
    certainty: "estimated",
    label: "3 people potentially affected",
  });
  assert(peopleEstimate.success, "People count schema enforces uncertainty-aware structure");

  // --- SUITE 2: DEMO SCENES & DETERMINISTIC DATA ---
  console.log("\n2. Demo Scenes & Deterministic Fallback");
  const scenes = getAllDemoScenes();
  assert(scenes.length === 3, "All 3 preloaded demo scenes are present");

  const roadScene = getDemoScene("road-accident");
  assert(roadScene !== undefined, "Road Accident demo scene exists");
  assert(roadScene?.analysis.confidence === 0.91, "Road Accident confidence is 91%");
  assert(
    roadScene?.analysis.peoplePotentiallyAffected.label === "3 people potentially affected",
    "People count label is '3 people potentially affected'"
  );
  assert(
    Boolean(roadScene?.analysis.visibleHazards.includes("Traffic obstruction")),
    "Hazards include Traffic obstruction"
  );
  assert(
    Boolean(roadScene?.analysis.visibleHazards.includes("Vehicle damage")),
    "Hazards include Vehicle damage"
  );
  assert(
    Boolean(roadScene?.location.label.includes("Siddaganga Institute of Technology, Tumakuru")),
    "Road accident location is SIT Tumakuru"
  );

  const fireScene = getDemoScene("fire-smoke");
  assert(
    fireScene?.analysis.peoplePotentiallyAffected.label === "People count uncertain",
    "Fire/Smoke scene people count is uncertain"
  );

  const crowdScene = getDemoScene("crowd-disruption");
  assert(
    Boolean(crowdScene?.analysis.visibleHazards.includes("Scene obstruction")),
    "Crowd incident includes Scene obstruction hazard"
  );

  // --- SUITE 3: PROVIDER ABSTRACTIONS ---
  console.log("\n3. Provider Abstractions");

  const demoVision = new DemoVisionProvider();
  const demoAnalysis = await demoVision.analyze("", "image/jpeg");
  assert(demoAnalysis.incidentType === "possible_road_accident", "DemoVisionProvider returns deterministic fallback");

  const mapsProvider = getMapsProvider();
  const resolvedLoc = await mapsProvider.resolveLocation({ demoLocationId: "road-accident" });
  assert(resolvedLoc.label.includes("Siddaganga"), "MapsProvider resolves demo location");

  const nearbyServices = await mapsProvider.getNearbyServices(resolvedLoc);
  assert(nearbyServices.length >= 3, "MapsProvider returns nearby hospital, police, fire station data");
  assert(
    nearbyServices.some((s) => s.category === "hospital"),
    "Nearby services include hospital"
  );
  assert(
    nearbyServices.some((s) => s.category === "police"),
    "Nearby services include police station"
  );
  assert(
    nearbyServices.some((s) => s.category === "fire"),
    "Nearby services include fire station"
  );

  const commProvider = getCommunicationProvider();
  assert(commProvider.name === "demo" || commProvider.name === "twilio", "CommunicationProvider initialized");

  const storageProvider = getStorageProvider();
  assert(storageProvider.name === "local", "StorageProvider initialized as LocalStorageProvider");

  // --- SUITE 4: END-TO-END INCIDENT ANALYSIS FLOW ---
  console.log("\n4. End-to-End Incident Analysis Flow");

  const incident = await incidentService.analyzeScene({
    demoSceneId: "road-accident",
  });

  assert(incident.id !== undefined, "Incident created with unique ID");
  assert(incident.status === "detected", "Incident status set to detected");
  assert(incident.analysis !== null, "Analysis persisted in incident record");
  assert(incident.location !== null, "Location context persisted in incident record");
  assert(incident.nearbyServices.length > 0, "Nearby services persisted in incident record");
  assert(incident.notificationDraft !== null, "Notification draft automatically prepared");
  assert(incident.timeline.length >= 6, "Timeline contains all execution events");

  // Verify timeline contents
  const eventTypes = incident.timeline.map((t) => t.event);
  assert(eventTypes.includes("Image selected"), "Timeline has Image selected");
  assert(eventTypes.includes("Scene analysis started"), "Timeline has Scene analysis started");
  assert(eventTypes.includes("Vision analysis completed"), "Timeline has Vision analysis completed");
  assert(eventTypes.includes("Incident classified"), "Timeline has Incident classified");
  assert(eventTypes.includes("Location resolved"), "Timeline has Location resolved");
  assert(eventTypes.includes("Nearby services loaded"), "Timeline has Nearby services loaded");
  assert(eventTypes.includes("Notification prepared"), "Timeline has Notification prepared");

  // --- SUITE 5: NOTIFICATION WORKFLOW & SIMULATION ---
  console.log("\n5. Notification Workflow & Simulation");

  const draft = incident.notificationDraft!;
  assert(draft.status === "ready", "Initial notification draft status is ready");
  assert(draft.formattedMessage !== undefined, "Structured notification formatted message exists");

  // Edit notification
  const updatedIncident = incidentService.updateNotification(incident.id, {
    userNotes: "Bystanders on sidewalk; road blocked northbound.",
  });
  assert(
    updatedIncident?.notificationDraft?.userNotes === "Bystanders on sidewalk; road blocked northbound.",
    "Notification draft user notes successfully edited"
  );

  // Simulate notification
  const simulatedIncident = await incidentService.simulateNotification(incident.id);
  assert(
    simulatedIncident?.notificationDraft?.status === "simulated",
    "Notification status transitioned to simulated"
  );

  const finalTimeline = incidentService.getTimeline(incident.id);
  assert(
    Boolean(finalTimeline?.some((e) => e.event === "Demo notification simulated")),
    "Timeline recorded 'Demo notification simulated' event"
  );

  // --- SUITE 6: SAFETY & COMPLIANCE GUARDRAILS ---
  console.log("\n6. Safety & Compliance Guardrails");

  // Verify safety recommendations
  const recs = incidentService.generateRecommendations(incident.id);
  assert(recs !== null, "Recommendations generated");
  assert(Boolean(recs?.first.some((s) => s.toLowerCase().includes("safe"))), "FIRST emphasizes safety");
  assert(Boolean(recs?.avoid.some((s) => s.toLowerCase().includes("injured"))), "AVOID cautions against moving injured persons");
  assert(Boolean(recs?.disclaimer.includes("prototype")), "Safety disclaimer is explicitly present");

  // Verify uncertainty helpers
  assert(getCertaintyLabel(0.95) === "Likely", "Confidence 95% -> Likely");
  assert(getCertaintyLabel(0.85) === "Moderate confidence", "Confidence 85% -> Moderate confidence");
  assert(getCertaintyLabel(0.55) === "Low confidence", "Confidence 55% -> Low confidence");
  assert(isLowConfidence(0.55) === true, "Low confidence flag correctly triggers");

  // Verify history repository
  const allIncidents = incidentService.getAll();
  assert(allIncidents.some((i) => i.id === incident.id), "Incident persists in history query");

  console.log("\n=================================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test runner encountered an error:", err);
  process.exit(1);
});
