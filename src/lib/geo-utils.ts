/**
 * Haversine formula to compute distance in km between two coordinate pairs
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const TASHKENT_CENTER_COORDS = { lat: 41.311081, lng: 69.240562 };
export const TASHKENT_MAX_RADIUS_KM = 45; // Covers Tashkent city districts & immediate borders

/**
 * Checks whether user coordinates are detected to be outside Tashkent city limits.
 */
export function isLocationOutsideTashkent(coords?: { lat: number; lng: number } | null): boolean {
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return false;
  }
  const dist = calculateDistanceKm(
    coords.lat,
    coords.lng,
    TASHKENT_CENTER_COORDS.lat,
    TASHKENT_CENTER_COORDS.lng
  );
  return dist > TASHKENT_MAX_RADIUS_KM;
}

export function getDistanceFromUserKm(
  userLat: number,
  userLng: number,
  bookLat: number,
  bookLng: number
): number {
  return calculateDistanceKm(userLat, userLng, bookLat, bookLng);
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
