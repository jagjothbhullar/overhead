import { useState } from 'react';
import FlightMap from './components/FlightMap';
import FlightCard from './components/FlightCard';
import FlightList from './components/FlightList';
import StatusBar from './components/StatusBar';
import OverheadAlert from './components/OverheadAlert';
import useGeolocation from './hooks/useGeolocation';
import useFlights from './hooks/useFlights';
import useOverheadAlert from './hooks/useOverheadAlert';
import 'leaflet/dist/leaflet.css';
import './App.css';

export default function App() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const { flights, loading: flightsLoading, error: flightsError, lastUpdated } = useFlights(location);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alert, dismissAlert } = useOverheadAlert(flights, location);

  const activeFlight = selectedFlight
    ? flights.find((f) => f.icao24 === selectedFlight.icao24) || selectedFlight
    : null;

  if (geoLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-icon">◎</div>
        <div className="loading-text">Getting your location...</div>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="loading-screen">
        <div className="loading-icon error">✕</div>
        <div className="loading-text">Location access needed</div>
        <div className="loading-sub">{geoError}</div>
        <div className="loading-sub">Enable location permissions and reload.</div>
      </div>
    );
  }

  return (
    <div className="app">
      <StatusBar
        flightCount={flights.length}
        lastUpdated={lastUpdated}
        error={flightsError}
      />

      <FlightList
        flights={flights}
        userLocation={location}
        selectedFlight={activeFlight}
        onSelectFlight={(f) => { setSelectedFlight(f); if (f) setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <FlightMap
        flights={flights}
        userLocation={location}
        onSelectFlight={setSelectedFlight}
        selectedFlight={activeFlight}
      />

      <OverheadAlert
        alert={alert}
        onDismiss={dismissAlert}
        onSelect={setSelectedFlight}
      />

      {activeFlight && (
        <FlightCard
          flight={activeFlight}
          userLocation={location}
          onClose={() => setSelectedFlight(null)}
        />
      )}

      {flightsLoading && flights.length === 0 && (
        <div className="loading-overlay">
          <div className="loading-text">Scanning airspace...</div>
        </div>
      )}
    </div>
  );
}
