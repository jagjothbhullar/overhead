import { getAirlineFromCallsign, getHeadingLabel, distanceMiles } from '../utils/flightUtils';

export default function FlightList({ flights, userLocation, selectedFlight, onSelectFlight, isOpen, onToggle }) {
  const sorted = [...flights].sort((a, b) => {
    if (!userLocation) return 0;
    const distA = distanceMiles(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = distanceMiles(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return distA - distB;
  });

  return (
    <div className={`flight-list ${isOpen ? 'open' : ''}`}>
      <button className="flight-list-toggle" onClick={onToggle}>
        <span className="flight-list-toggle-icon">{isOpen ? '◂' : '▸'}</span>
        <span className="flight-list-toggle-count">{flights.length}</span>
      </button>

      <div className="flight-list-content">
        <div className="flight-list-header">
          <span>NEARBY AIRCRAFT</span>
          <span className="flight-list-count">{flights.length}</span>
        </div>

        <div className="flight-list-items">
          {sorted.map((flight) => {
            const airline = getAirlineFromCallsign(flight.callsign);
            const dist = userLocation
              ? distanceMiles(userLocation.lat, userLocation.lng, flight.lat, flight.lng).toFixed(1)
              : null;
            const isSelected = selectedFlight?.icao24 === flight.icao24;
            const typeColor = airline.type === 'commercial' ? '#00d4ff' : airline.type === 'private' || airline.type === 'private-charter' ? '#ff9f1c' : '#888';

            return (
              <button
                key={flight.icao24}
                className={`flight-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectFlight(isSelected ? null : flight)}
              >
                <div className="fli-left">
                  <span className="fli-dot" style={{ background: typeColor }} />
                  <div className="fli-info">
                    <span className="fli-callsign">{flight.callsign || '—'}</span>
                    <span className="fli-airline">{airline.name}</span>
                  </div>
                </div>
                <div className="fli-right">
                  <span className="fli-alt">
                    {flight.altitudeFt ? `${(flight.altitudeFt / 1000).toFixed(1)}k ft` : '—'}
                  </span>
                  <span className="fli-dist">
                    {dist ? `${dist} mi` : '—'}
                  </span>
                  <span className="fli-heading">
                    {getHeadingLabel(flight.heading)}
                  </span>
                </div>
              </button>
            );
          })}

          {flights.length === 0 && (
            <div className="flight-list-empty">No aircraft detected</div>
          )}
        </div>
      </div>
    </div>
  );
}
