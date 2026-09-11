/**
 * Minimal JPEG EXIF GPS reader (no dependencies).
 * Returns WGS84 coordinates when the image contains GPS IFD data.
 */

function readUint16(view: DataView, offset: number, le: boolean): number {
  return le ? view.getUint16(offset, true) : view.getUint16(offset, false);
}

function readUint32(view: DataView, offset: number, le: boolean): number {
  return le ? view.getUint32(offset, true) : view.getUint32(offset, false);
}

function readRational(view: DataView, offset: number, le: boolean): number {
  const num = readUint32(view, offset, le);
  const den = readUint32(view, offset + 4, le);
  if (!den) return 0;
  return num / den;
}

function dmsToDecimal(view: DataView, offset: number, le: boolean, ref: string): number {
  const d = readRational(view, offset, le);
  const m = readRational(view, offset + 8, le);
  const s = readRational(view, offset + 16, le);
  let dec = d + m / 60 + s / 3600;
  if (ref === "S" || ref === "W") dec = -dec;
  return dec;
}

function readAscii(view: DataView, offset: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    const c = view.getUint8(offset + i);
    if (c === 0) break;
    out += String.fromCharCode(c);
  }
  return out;
}

/**
 * Parse GPS coordinates from a JPEG ArrayBuffer.
 * Returns null for non-JPEG images or images without GPS EXIF.
 */
export function extractGpsFromJpeg(buffer: ArrayBuffer): { lat: number; lng: number } | null {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null; // not JPEG
  }

  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3];

    // APP1
    if (marker === 0xe1) {
      const start = offset + 4;
      if (start + 6 < bytes.length) {
        const header = String.fromCharCode(
          bytes[start],
          bytes[start + 1],
          bytes[start + 2],
          bytes[start + 3]
        );
        if (header === "Exif") {
          const tiffStart = start + 6;
          const view = new DataView(buffer);
          const le = view.getUint16(tiffStart, false) === 0x4949; // II = little-endian
          const ifd0 = tiffStart + readUint32(view, tiffStart + 4, le);
          const gpsPtr = findTagOffset(view, ifd0, tiffStart, le, 0x8825);
          if (gpsPtr != null) {
            const gpsIfd = tiffStart + gpsPtr;
            return readGpsIfd(view, gpsIfd, tiffStart, le);
          }
        }
      }
    }

    if (marker === 0xda) break; // SOS — image data begins
    offset += 2 + size;
  }

  return null;
}

function findTagOffset(
  view: DataView,
  ifdOffset: number,
  tiffStart: number,
  le: boolean,
  tagId: number
): number | null {
  if (ifdOffset + 2 > view.byteLength) return null;
  const entries = readUint16(view, ifdOffset, le);
  for (let i = 0; i < entries; i++) {
    const entry = ifdOffset + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = readUint16(view, entry, le);
    if (tag === tagId) {
      const type = readUint16(view, entry + 2, le);
      const count = readUint32(view, entry + 4, le);
      const valueOffset = entry + 8;
      // LONG pointing to GPS IFD
      if (type === 4 && count === 1) {
        return readUint32(view, valueOffset, le);
      }
      // Inline value
      if (type === 3 && count === 1) {
        return readUint16(view, valueOffset, le);
      }
      void tiffStart;
      return readUint32(view, valueOffset, le);
    }
  }
  return null;
}

function readGpsIfd(
  view: DataView,
  ifdOffset: number,
  tiffStart: number,
  le: boolean
): { lat: number; lng: number } | null {
  if (ifdOffset + 2 > view.byteLength) return null;
  const entries = readUint16(view, ifdOffset, le);

  let latRef = "N";
  let lngRef = "E";
  let latOffset: number | null = null;
  let lngOffset: number | null = null;

  for (let i = 0; i < entries; i++) {
    const entry = ifdOffset + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = readUint16(view, entry, le);
    const type = readUint16(view, entry + 2, le);
    const count = readUint32(view, entry + 4, le);
    const valueOffset = entry + 8;

    if (tag === 0x0001 && type === 2) {
      // GPSLatitudeRef
      const ptr = count > 4 ? tiffStart + readUint32(view, valueOffset, le) : valueOffset;
      latRef = readAscii(view, ptr, Math.min(count, 2)) || "N";
    } else if (tag === 0x0002 && type === 5 && count === 3) {
      latOffset = tiffStart + readUint32(view, valueOffset, le);
    } else if (tag === 0x0003 && type === 2) {
      const ptr = count > 4 ? tiffStart + readUint32(view, valueOffset, le) : valueOffset;
      lngRef = readAscii(view, ptr, Math.min(count, 2)) || "E";
    } else if (tag === 0x0004 && type === 5 && count === 3) {
      lngOffset = tiffStart + readUint32(view, valueOffset, le);
    }
  }

  if (latOffset == null || lngOffset == null) return null;
  if (latOffset + 24 > view.byteLength || lngOffset + 24 > view.byteLength) return null;

  const lat = dmsToDecimal(view, latOffset, le, latRef);
  const lng = dmsToDecimal(view, lngOffset, le, lngRef);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  // Reject null-island style zeros unless explicitly tagged (still valid but rare)
  return { lat, lng };
}

export function extractGpsFromBase64(base64: string): { lat: number; lng: number } | null {
  try {
    const binary =
      typeof Buffer !== "undefined"
        ? Buffer.from(base64, "base64")
        : Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const buffer = binary.buffer.slice(
      binary.byteOffset,
      binary.byteOffset + binary.byteLength
    );
    return extractGpsFromJpeg(buffer);
  } catch {
    return null;
  }
}

export async function extractGpsFromFile(file: File): Promise<{ lat: number; lng: number } | null> {
  try {
    const buffer = await file.arrayBuffer();
    return extractGpsFromJpeg(buffer);
  } catch {
    return null;
  }
}
