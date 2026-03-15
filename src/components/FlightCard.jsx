import { getAirlineFromCallsign, getAltitudeLabel, getHeadingLabel, distanceMiles } from '../utils/flightUtils';

export default function FlightCard({ flight, userLocation, onClose }) {
  const airline = getAirlineFromCallsign(flight.callsign);
  const distance = userLocation
    ? distanceMiles(userLocation.lat, userLocation.lng, flight.lat, flight.lng).toFixed(1)
    : null;

  const typeIcon = airline.type === 'commercial' ? '✈' : airline.type === 'private' || airline.type === 'private-charter' ? '🛩' : '✈';

  return (
    <div className="flight-card">
      <button className="flight-card-close" onClick={onClose}>&times;</button>

      <div className="flight-card-header">
        <span className="flight-card-icon">{typeIcon}</span>
        <div>
          {flight.callsign ? (
            <a
              className="flight-card-callsign"
              href={`https://www.flightaware.com/live/flight/${flight.callsign}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {flight.callsign}
            </a>
          ) : (
            <div className="flight-card-callsign">NO CALLSIGN</div>
          )}
          <div className="flight-card-airline">{airline.name}</div>
        </div>
      </div>

      <div className="flight-card-stats">
        <div className="flight-stat">
          <span className="stat-label">Altitude</span>
          <span className="stat-value">{getAltitudeLabel(flight.altitudeFt)}</span>
        </div>
        <div className="flight-stat">
          <span className="stat-label">Speed</span>
          <span className="stat-value">{flight.speedMph ? `${flight.speedMph} mph` : 'N/A'}</span>
        </div>
        <div className="flight-stat">
          <span className="stat-label">Heading</span>
          <span className="stat-value">{getHeadingLabel(flight.heading)} ({Math.round(flight.heading || 0)}°)</span>
        </div>
        {flight.verticalRate != null && (
          <div className="flight-stat">
            <span className="stat-label">Vertical</span>
            <span className="stat-value">
              {flight.verticalRate > 0 ? '↑' : flight.verticalRate < 0 ? '↓' : '—'}{' '}
              {Math.abs(Math.round(flight.verticalRate * 196.85))} ft/min
            </span>
          </div>
        )}
        {distance && (
          <div className="flight-stat">
            <span className="stat-label">Distance</span>
            <span className="stat-value">{distance} mi from you</span>
          </div>
        )}
        <div className="flight-stat">
          <span className="stat-label">ICAO24</span>
          <span className="stat-value mono">{flight.icao24}</span>
        </div>
        <div className="flight-stat">
          <span className="stat-label">Origin</span>
          <span className="stat-value">{flight.originCountry}</span>
        </div>
      </div>
    </div>
  );
}
