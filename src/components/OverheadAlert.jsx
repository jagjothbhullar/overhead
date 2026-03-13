import { getAirlineFromCallsign } from '../utils/flightUtils';

export default function OverheadAlert({ alert, onDismiss, onSelect }) {
  if (!alert) return null;

  const { type, flight, distance } = alert;
  const airline = getAirlineFromCallsign(flight.callsign);
  const isOverhead = type === 'overhead';

  return (
    <div
      className={`overhead-alert ${isOverhead ? 'alert-overhead' : 'alert-approaching'}`}
      onClick={() => { onSelect(flight); onDismiss(); }}
    >
      <div className="alert-icon">{isOverhead ? '◉' : '◎'}</div>
      <div className="alert-content">
        <div className="alert-title">
          {isOverhead ? 'DIRECTLY OVERHEAD' : 'INCOMING'}
        </div>
        <div className="alert-detail">
          {flight.callsign || 'Unknown'} — {airline.name}
          {' · '}
          {flight.altitudeFt ? `${(flight.altitudeFt / 1000).toFixed(1)}k ft` : ''}
          {' · '}
          {distance.toFixed(1)} mi
        </div>
      </div>
    </div>
  );
}
