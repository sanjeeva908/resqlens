import type { VisionAnalysis } from "@/server/schemas/incident";
import { VisionAnalysisSchema } from "@/server/schemas/incident";
import { DEMO_SCENES } from "@/server/integrations/demo-data";

export interface VisionProvider {
  name: string;
  analyze(imageBase64: string, mimeType: string): Promise<VisionAnalysis>;
}

export class DemoVisionProvider implements VisionProvider {
  name = "demo";

  async analyze(_imageBase64: string, _mimeType: string): Promise<VisionAnalysis> {
    // Deterministic fallback for uploaded images when no AI API key is configured
    const defaultScene = DEMO_SCENES[0];
    return defaultScene.analysis;
  }
}

export class GeminiVisionProvider implements VisionProvider {
  name = "gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(imageBase64: string, mimeType: string): Promise<VisionAnalysis> {
    const prompt = `You are ResQLens, an AI emergency scene assistant.
Analyze this emergency scene image and respond ONLY with a valid JSON object matching this schema:
{
  "incidentType": one of ["possible_road_accident", "possible_fire_smoke", "possible_crowd_incident", "possible_fall_injury_scene", "possible_hazardous_obstruction", "other_uncertain"],
  "confidence": number between 0 and 1,
  "certaintyLabel": "likely" (if >=0.9), "moderate confidence" (if 0.7-0.89), or "low confidence" (if <0.7),
  "summary": "1-2 sentence concise factual summary of the visible scene",
  "peoplePotentiallyAffected": {
    "count": number or null if uncertain,
    "certainty": "estimated" | "uncertain" | "multiple_visible" | "none_visible",
    "label": "e.g. 3 people potentially affected, or People count uncertain"
  },
  "visibleHazards": ["list", "of", "hazards"],
  "visibleObjects": ["list", "of", "visible", "objects"],
  "environmentalClues": ["roadway", "weather", "landmarks", "etc"],
  "urgencyIndicators": ["immediate", "factors"],
  "recommendedActions": ["action 1", "action 2"],
  "notificationFacts": ["factual line 1", "factual line 2"],
  "limitations": ["AI observation disclaimer"]
}

STRICT SAFETY RULES:
- Never provide medical diagnosis or label casualties as confirmed injuries.
- Use uncertainty-aware language: "potentially", "visible", "possible".
- If uncertain, classify as "other_uncertain" and low confidence.
- Return ONLY the raw JSON object, without markdown backticks or commentary.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned empty response");

    const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    return VisionAnalysisSchema.parse(parsed);
  }
}

export class OpenAIVisionProvider implements VisionProvider {
  name = "openai";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(imageBase64: string, mimeType: string): Promise<VisionAnalysis> {
    const systemPrompt = `You are ResQLens, an AI emergency scene analysis prototype.
Analyze the image and return ONLY a valid JSON object matching this schema:
{
  "incidentType": one of ["possible_road_accident","possible_fire_smoke","possible_crowd_incident","possible_fall_injury_scene","possible_hazardous_obstruction","other_uncertain"],
  "confidence": number between 0 and 1,
  "certaintyLabel": "likely" (if >=0.9), "moderate confidence" (if 0.7-0.89), or "low confidence" (if <0.7),
  "summary": "1-2 sentence concise factual summary",
  "peoplePotentiallyAffected": {
    "count": number or null if uncertain,
    "certainty": "estimated" | "uncertain" | "multiple_visible" | "none_visible",
    "label": "e.g. 3 people potentially affected, or People count uncertain"
  },
  "visibleHazards": ["array", "of", "hazards"],
  "visibleObjects": ["array", "of", "objects"],
  "environmentalClues": ["array", "of", "clues"],
  "urgencyIndicators": ["array", "of", "indicators"],
  "recommendedActions": ["array", "of", "actions"],
  "notificationFacts": ["concise facts for emergency summary"],
  "limitations": ["AI image analysis may be incorrect."]
}

CRITICAL RULES:
- NEVER diagnose injuries or medical conditions.
- Use uncertainty-aware language: "potentially affected", "visible".
- Do not claim verified facts. Distinguish visible facts from AI estimates.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: "Analyze this simulated emergency scene image and return the schema JSON.",
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content) as unknown;
    return VisionAnalysisSchema.parse(parsed);
  }
}

export function getVisionProvider(): VisionProvider | null {
  const preferred = (process.env.AI_PROVIDER || "").toLowerCase();

  if (preferred === "gemini" && process.env.GEMINI_API_KEY) {
    return new GeminiVisionProvider(process.env.GEMINI_API_KEY);
  }
  if (preferred === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAIVisionProvider(process.env.OPENAI_API_KEY);
  }

  // Automatic detection
  if (process.env.GEMINI_API_KEY) {
    return new GeminiVisionProvider(process.env.GEMINI_API_KEY);
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIVisionProvider(process.env.OPENAI_API_KEY);
  }

  return null;
}
