export interface GPSPoint {
  lat: number;
  lon: number;
}

/**
 * Strictly parses GPS string.
 * Accepts only: "8.123456,125.123456"
 * Rejects ANY corrupted characters.
 */
export function parseStrictGPSString(raw: string): GPSPoint | null {
  if (typeof raw !== "string") return null;

  // Strict regex:
  // - optional minus
  // - 1–2 digits before decimal
  // - decimal required
  // - 4–8 digits precision
  const gpsRegex = /^-?\d{1,2}\.\d{4,8},-?\d{1,3}\.\d{4,8}$/;

  if (!gpsRegex.test(raw)) {
    return null; // Reject corrupted data entirely
  }

  const [latStr, lonStr] = raw.split(",");

  const lat = Number(latStr);
  const lon = Number(lonStr);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return { lat, lon };
}

export function isValidGPS(point: GPSPoint): boolean {
  if (!point) return false;

  const { lat, lon } = point;

  if (lat === 0 || lon === 0) return false;
  if (lat < 4 || lat > 22) return false;
  if (lon < 116 || lon > 127) return false;

  return true;
}

// haversine distance formula for two gps points
export function haversineDistance(a: GPSPoint, b: GPSPoint): number {
  const R = 6371e3; // meters

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * c; // meters
}
