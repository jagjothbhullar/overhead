import airlines from '../data/airlines.json';

/**
 * Extract airline info from a callsign.
 * Commercial flights use 3-letter ICAO prefix (e.g. SWA1432 → Southwest)
 * Private/GA flights use N-numbers (e.g. N172SP)
 */
export function getAirlineFromCallsign(callsign) {
  if (!callsign) return { name: 'Unknown', type: 'unknown' };

  // N-number = US private/GA registration
  if (/^N\d/.test(callsign)) {
    return { name: 'Private / GA', type: 'private' };
  }

  // C- prefix = Canadian registration
  if (/^C-/.test(callsign) || /^CF/.test(callsign)) {
    return { name: 'Private (Canada)', type: 'private' };
  }

  // Try 3-letter ICAO prefix
  const prefix = callsign.substring(0, 3);
  if (airlines[prefix]) {
    return { name: airlines[prefix], type: 'commercial' };
  }

  // Cargo / charter patterns
  if (/^EJA/.test(callsign)) return { name: 'NetJets', type: 'private-charter' };
  if (/^LXJ/.test(callsign)) return { name: 'Flexjet', type: 'private-charter' };

  return { name: 'Unknown', type: 'unknown' };
}

/**
 * Get a human-readable altitude description
 */
export function getAltitudeLabel(altFt) {
  if (!altFt) return 'Unknown';
  if (altFt < 1000) return `${altFt.toLocaleString()} ft (very low)`;
  if (altFt < 10000) return `${altFt.toLocaleString()} ft (climbing/descending)`;
  if (altFt < 30000) return `${altFt.toLocaleString()} ft`;
  return `${altFt.toLocaleString()} ft (cruising)`;
}

/**
 * Get compass direction from heading degrees
 */
export function getHeadingLabel(heading) {
  if (heading == null) return 'Unknown';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(heading / 45) % 8;
  return dirs[idx];
}

/**
 * Distance in miles between two lat/lng points (Haversine)
 */
export function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
