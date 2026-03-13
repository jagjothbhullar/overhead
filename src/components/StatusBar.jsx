export default function StatusBar({ flightCount, lastUpdated, error }) {
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-logo">OVERHEAD</span>
        <span className="status-count">{flightCount} aircraft</span>
      </div>
      <div className="status-right">
        {error && <span className="status-error">{error}</span>}
        <span className="status-time">Updated {timeStr}</span>
        <span className="status-dot" />
      </div>
    </div>
  );
}
