import { useState, useEffect, useCallback } from 'react';

const OPENSKY_BASE = 'https://opensky-network.org/api';
const POLL_INTERVAL = 15000; // 15 seconds
const BOX_SIZE = 0.5; // ~30 miles in each direction

export default function useFlights(location) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFlights = useCallback(async () => {
    if (!location) return;

    const { lat, lng } = location;
    const bounds = {
      lamin: lat - BOX_SIZE,
      lamax: lat + BOX_SIZE,
      lomin: lng - BOX_SIZE,
      lomax: lng + BOX_SIZE,
    };

    const url = `${OPENSKY_BASE}/states/all?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 429) {
          setError('Rate limited — retrying soon');
          return;
        }
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const states = data.states || [];

      const parsed = states.map((s) => ({
        icao24: s[0],
        callsign: (s[1] || '').trim(),
        originCountry: s[2],
        lng: s[5],
        lat: s[6],
        altitudeM: s[7], // geometric altitude in meters
        onGround: s[8],
        velocityMs: s[9],
        heading: s[10],
        verticalRate: s[11],
        altitudeFt: s[7] ? Math.round(s[7] * 3.28084) : null,
        speedMph: s[9] ? Math.round(s[9] * 2.23694) : null,
        squawk: s[14],
      }));

      // Filter out grounded aircraft and those without position
      const airborne = parsed.filter((f) => !f.onGround && f.lat && f.lng);
      setFlights(airborne);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  return { flights, loading, error, lastUpdated, refetch: fetchFlights };
}
