import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { getAirlineFromCallsign } from '../utils/flightUtils';

function createPlaneIcon(heading, type, isSelected) {
  const color = type === 'commercial' ? '#00d4ff' : type === 'private' || type === 'private-charter' ? '#ff9f1c' : '#888';
  const rotation = heading || 0;
  const size = isSelected ? 28 : 20;
  const glow = isSelected ? `0 0 12px ${color}` : `0 0 6px ${color}80`;

  return L.divIcon({
    className: 'plane-icon',
    html: `<div style="transform: rotate(${rotation}deg); color: ${color}; font-size: ${size}px; text-shadow: ${glow}; transition: font-size 0.2s;">✈</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function UserMarker({ location }) {
  const icon = L.divIcon({
    className: 'user-icon',
    html: '<div style="width:14px;height:14px;background:#4ade80;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px #4ade80;"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  return (
    <>
      <Marker position={[location.lat, location.lng]} icon={icon} />
      <Circle
        center={[location.lat, location.lng]}
        radius={80467}
        pathOptions={{ color: '#4ade8040', fillColor: '#4ade8010', weight: 1 }}
      />
    </>
  );
}

function MapControls({ location }) {
  const map = useMap();

  return (
    <div className="map-controls">
      <button
        className="map-ctrl-btn"
        onClick={() => map.zoomIn()}
        title="Zoom in"
      >
        +
      </button>
      <button
        className="map-ctrl-btn"
        onClick={() => map.zoomOut()}
        title="Zoom out"
      >
        −
      </button>
      <button
        className="map-ctrl-btn recenter"
        onClick={() => map.setView([location.lat, location.lng], map.getZoom())}
        title="Re-center"
      >
        ◎
      </button>
    </div>
  );
}

function FlyToSelected({ selectedFlight }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFlight) {
      map.flyTo([selectedFlight.lat, selectedFlight.lng], Math.max(map.getZoom(), 11), {
        duration: 0.8,
      });
    }
  }, [selectedFlight?.icao24]);

  return null;
}

export default function FlightMap({ flights, userLocation, onSelectFlight, selectedFlight }) {
  if (!userLocation) return null;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={9}
      className="flight-map"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <UserMarker location={userLocation} />
      <MapControls location={userLocation} />
      <FlyToSelected selectedFlight={selectedFlight} />

      {flights.map((flight) => {
        const airline = getAirlineFromCallsign(flight.callsign);
        const isSelected = selectedFlight?.icao24 === flight.icao24;

        return (
          <Marker
            key={flight.icao24}
            position={[flight.lat, flight.lng]}
            icon={createPlaneIcon(flight.heading, airline.type, isSelected)}
            eventHandlers={{
              click: () => onSelectFlight(isSelected ? null : flight),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
