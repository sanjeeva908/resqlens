/**
 * Extract GPS coordinates stamped as visible text on photos
 * (GPS Map Camera, EXIF overlays, etc.) when real EXIF was stripped (e.g. WhatsApp).
 */

export type StampedGps = {
  lat: number;
  lng: number;
  label?: string;
  source: "stamped_ocr";
};

type Candidate = { lat: number; lng: number; score: number };

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001)
  );
}

function applyHemisphere(value: number, hemi: string | undefined, kind: "lat" | "lng"): number {
  const h = (hemi || "").toUpperCase();
  if (kind === "lat") {
    if (h === "S") return -Math.abs(value);
    if (h === "N") return Math.abs(value);
  } else {
    if (h === "W") return -Math.abs(value);
    if (h === "E") return Math.abs(value);
  }
  return value;
}

function extractAddressLabel(text: string): string | undefined {
  const address =
    /Address\s*[:=]?\s*([A-Za-z0-9][^\n|]{8,160})/i.exec(text) ||
    /(?:^|\n)\s*Location\s*[:=]?\s*([A-Za-z][^\n|]{5,120})/i.exec(text);
  if (address) {
    const label = address[1].replace(/\s+/g, " ").trim();
    if (label.length >= 5 && label.length <= 180) return label;
  }
  const city = /\b([A-Za-z .]+,\s*Karnataka,\s*India)\b/i.exec(text);
  if (city) return city[1].replace(/\s+/g, " ").trim();
  return undefined;
}

/** Parse lat/lng from OCR / overlay text with scoring across multiple hits. */
export function parseStampedGpsFromText(text: string): StampedGps | null {
  const soft = text
    .replace(/\b1at\b/gi, "Lat")
    .replace(/\bIong\b/gi, "Long")
    .replace(/\s+/g, " ");

  const candidates: Candidate[] = [];

  const push = (lat: number, lng: number, score: number) => {
    if (!isValidCoord(lat, lng)) return;
    const existing = candidates.find(
      (c) => Math.abs(c.lat - lat) < 0.00005 && Math.abs(c.lng - lng) < 0.00005
    );
    if (existing) {
      existing.score = Math.max(existing.score, score);
      return;
    }
    candidates.push({ lat, lng, score });
  };

  // Pattern A: Lat … Long … in a nearby window (bottom GPS Map Camera stamp)
  const pairRe =
    /Lat(?:itude)?\s*[:=]?\s*([+-]?\d{1,2}(?:\.\d+)?)\s*°?\s*([NS])?[\s\S]{0,48}?Long(?:itude)?\s*[:=]?\s*([+-]?\d{1,3}(?:\.\d+)?)\s*°?\s*([EW])?/gi;
  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(soft)) !== null) {
    const lat = applyHemisphere(parseFloat(m[1]), m[2], "lat");
    const lng = applyHemisphere(parseFloat(m[3]), m[4], "lng");
    let score = 5;
    if (m[2]) score += 2;
    if (m[4]) score += 3; // E/W present → prefer over OCR-mangled top panel
    push(lat, lng, score);
  }

  // Pattern B: separate GPS Latitude / GPS Longitude lines
  const latMatches = [
    ...soft.matchAll(/(?:GPS\s*)?Lat(?:itude)?\s*[:=]?\s*([+-]?\d{1,2}(?:\.\d+)?)\s*°?\s*([NS])?/gi),
  ];
  const lngMatches = [
    ...soft.matchAll(/(?:GPS\s*)?Long(?:itude)?\s*[:=]?\s*([+-]?\d{1,3}(?:\.\d+)?)\s*°?\s*([EW])?/gi),
  ];

  for (const lm of latMatches) {
    for (const gm of lngMatches) {
      const lat = applyHemisphere(parseFloat(lm[1]), lm[2], "lat");
      const lng = applyHemisphere(parseFloat(gm[1]), gm[2], "lng");
      let score = 3;
      if (lm[2]) score += 1;
      if (gm[2]) score += 3;
      score += Math.min(4, (gm[1].split(".")[1] || "").length);
      push(lat, lng, score);
    }
  }

  // Pattern C: compact 12.9716° N 77.5946° E
  const compactRe =
    /([+-]?\d{1,2}\.\d{2,})\s*°?\s*([NS])\b[\s,;/|-]{0,12}([+-]?\d{1,3}\.\d{2,})\s*°?\s*([EW])\b/gi;
  while ((m = compactRe.exec(soft)) !== null) {
    const lat = applyHemisphere(parseFloat(m[1]), m[2], "lat");
    const lng = applyHemisphere(parseFloat(m[3]), m[4], "lng");
    push(lat, lng, 7);
  }

  if (candidates.length === 0) return null;

  const buckets = new Map<string, { lat: number; lng: number; score: number; count: number }>();
  for (const c of candidates) {
    const key = `${c.lat.toFixed(3)},${c.lng.toFixed(3)}`;
    const prev = buckets.get(key);
    if (!prev) {
      buckets.set(key, { ...c, count: 1 });
    } else {
      prev.score = Math.max(prev.score, c.score) + 1;
      prev.count += 1;
    }
  }

  const ranked = [...buckets.values()].sort((a, b) => b.score - a.score || b.count - a.count);
  const best = ranked[0];

  return {
    lat: best.lat,
    lng: best.lng,
    label: extractAddressLabel(text),
    source: "stamped_ocr",
  };
}

/**
 * OCR a JPEG/PNG (base64) and pull stamped GPS Map Camera / EXIF overlay coords.
 */
export async function extractStampedGpsFromBase64(
  base64: string,
  mimeType = "image/jpeg"
): Promise<StampedGps | null> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng", 1, {
      logger: () => undefined,
    });

    try {
      await worker.setParameters({
        tessedit_char_whitelist:
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .:°NSEW,/()-_",
        preserve_interword_spaces: "1",
      });

      const dataUrl = `data:${mimeType};base64,${base64}`;
      const {
        data: { text },
      } = await worker.recognize(dataUrl);

      return parseStampedGpsFromText(text);
    } finally {
      await worker.terminate();
    }
  } catch {
    return null;
  }
}

export async function extractStampedGpsFromFile(file: File): Promise<StampedGps | null> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const base64 = btoa(binary);
    return extractStampedGpsFromBase64(base64, file.type || "image/jpeg");
  } catch {
    return null;
  }
}
