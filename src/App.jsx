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
  const { location, error: geoError, loading: geoLoading, setManualLocation } = useGeolocation();
  const { flights, loading: flightsLoading, error: flightsError, lastUpdated } = useFlights(location);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alert, dismissAlert } = useOverheadAlert(flights, location);
  const [zipcode, setZipcode] = useState('');
  const [zipError, setZipError] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);

  const activeFlight = selectedFlight
    ? flights.find((f) => f.icao24 === selectedFlight.icao24) || selectedFlight
    : null;

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    const zip = zipcode.trim();
    if (!/^\d{5}$/.test(zip)) {
      setZipError('Enter a valid 5-digit zip code');
      return;
    }
    setZipLoading(true);
    setZipError(null);
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) throw new Error('Zip code not found');
      const data = await res.json();
      const place = data.places[0];
      setManualLocation(parseFloat(place.latitude), parseFloat(place.longitude));
    } catch {
      setZipError('Could not find that zip code. Try another.');
    } finally {
      setZipLoading(false);
    }
  };

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
        <div className="loading-sub">Enable location permissions and reload, or enter your zip code below.</div>
        <form className="zip-form" onSubmit={handleZipSubmit}>
          <input
            className="zip-input"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="Zip code"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            autoFocus
          />
          <button className="zip-btn" type="submit" disabled={zipLoading}>
            {zipLoading ? '...' : 'Go'}
          </button>
        </form>
        {zipError && <div className="loading-sub" style={{ color: '#ff6b6b' }}>{zipError}</div>}
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
