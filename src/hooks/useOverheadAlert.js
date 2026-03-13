import { useState, useEffect, useRef } from 'react';
import { distanceMiles } from '../utils/flightUtils';

const OVERHEAD_RADIUS_MI = 2; // "directly overhead" threshold
const APPROACHING_RADIUS_MI = 5; // "incoming" alert threshold
const ALERT_COOLDOWN_MS = 60000; // don't re-alert same plane within 60s

export default function useOverheadAlert(flights, userLocation) {
  const [alert, setAlert] = useState(null);
  const alertedRef = useRef(new Map()); // icao24 → timestamp

  useEffect(() => {
    if (!userLocation || flights.length === 0) return;

    const now = Date.now();

    // Clean up old cooldowns
    for (const [id, time] of alertedRef.current) {
      if (now - time > ALERT_COOLDOWN_MS) alertedRef.current.delete(id);
    }

    for (const flight of flights) {
      if (alertedRef.current.has(flight.icao24)) continue;

      const dist = distanceMiles(userLocation.lat, userLocation.lng, flight.lat, flight.lng);

      if (dist <= OVERHEAD_RADIUS_MI) {
        setAlert({ type: 'overhead', flight, distance: dist });
        alertedRef.current.set(flight.icao24, now);
        playAlertSound('overhead');
        // Auto-dismiss after 5s
        setTimeout(() => setAlert((a) => a?.flight.icao24 === flight.icao24 ? null : a), 5000);
        break;
      }

      if (dist <= APPROACHING_RADIUS_MI && isApproaching(flight, userLocation)) {
        setAlert({ type: 'approaching', flight, distance: dist });
        alertedRef.current.set(flight.icao24, now);
        playAlertSound('approaching');
        setTimeout(() => setAlert((a) => a?.flight.icao24 === flight.icao24 ? null : a), 4000);
        break;
      }
    }
  }, [flights, userLocation]);

  return { alert, dismissAlert: () => setAlert(null) };
}

function isApproaching(flight, userLocation) {
  if (flight.heading == null || flight.velocityMs == null) return false;

  // Calculate bearing from flight to user
  const dLng = ((userLocation.lng - flight.lng) * Math.PI) / 180;
  const lat1 = (flight.lat * Math.PI) / 180;
  const lat2 = (userLocation.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearingToUser = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  // Check if heading is within ~45° of bearing to user
  const diff = Math.abs(flight.heading - bearingToUser);
  const angleDiff = Math.min(diff, 360 - diff);
  return angleDiff < 45;
}

function playAlertSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'overhead') {
      // Two-tone ping for directly overhead
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Single soft ping for approaching
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // AudioContext not available
  }
}
