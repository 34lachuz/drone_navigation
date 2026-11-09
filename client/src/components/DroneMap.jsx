import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation2, Home, Crosshair, MapPin, PlaneLanding, AlertCircle, Compass } from 'lucide-react';

// Custom SVG Drone Icon with rotation
function createDroneIcon(headingDeg, mode) {
  const isAscent = mode === 'VERTICAL CLIMB';
  return L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="transform: rotate(${headingDeg}deg); transform-origin: center center;" class="relative w-10 h-10 flex items-center justify-center">
        ${isAscent ? '<div class="absolute inset-0 rounded-full bg-red-500/40 animate-ping"></div>' : ''}
        <div class="w-8 h-8 rounded-full bg-slate-950 border-2 border-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="rgba(56, 189, 248, 0.45)"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Custom Target Landing Marker Icon
function createTargetIcon(name) {
  return L.divIcon({
    className: 'custom-target-icon',
    html: `
      <div class="relative w-9 h-9 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="w-7 h-7 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="22" y1="12" x2="18" y2="12"/>
            <line x1="6" y1="12" x2="2" y2="12"/>
            <line x1="12" y1="6" x2="12" y2="2"/>
            <line x1="12" y1="22" x2="12" y2="18"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Custom Home Marker Icon
const homeIcon = L.divIcon({
  className: 'custom-home-icon',
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute inset-0 rounded-full bg-sky-500/20 animate-pulse"></div>
      <div class="w-6 h-6 rounded-full bg-slate-950 border-2 border-sky-400 flex items-center justify-center shadow-md">
        <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #38bdf8;">H</span>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map click listener to set landing target
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Map Auto-Follow controller
function MapController({ center, autoFollow }) {
  const map = useMap();
  useEffect(() => {
    if (autoFollow && center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 0.5 });
    }
  }, [center, autoFollow, map]);
  return null;
}

export default function DroneMap({ telemetry, onSetLandingTarget, onSetUserLocation }) {
  const {
    latitude = 8.1833,
    longitude = 77.4119,
    headingDeg = 0,
    altitudeAgl = 0,
    groundSpeedKmh = 0,
    mode = 'PRE-FLIGHT',
    targetDestination,
    distanceToTargetMeters = 0,
    distanceToHomeMeters = 0,
  } = telemetry || {};

  const currentCoords = [latitude, longitude];
  const [trail, setTrail] = useState([currentCoords]);
  const [autoFollow, setAutoFollow] = useState(true);
  const [tappedLocation, setTappedLocation] = useState(null);

  // Keep a history of positions for flight breadcrumb trail
  useEffect(() => {
    if (latitude && longitude) {
      setTrail((prev) => {
        const last = prev[prev.length - 1];
        if (!last || Math.abs(last[0] - latitude) > 0.00005 || Math.abs(last[1] - longitude) > 0.00005) {
          const newTrail = [...prev, [latitude, longitude]];
          return newTrail.slice(-180);
        }
        return prev;
      });
    }
  }, [latitude, longitude]);

  const handleMapClick = (lat, lng) => {
    setTappedLocation({ lat, lng });
  };

  const confirmLandingAtTapped = () => {
    if (tappedLocation && onSetLandingTarget) {
      onSetLandingTarget(
        tappedLocation.lat,
        tappedLocation.lng,
        `Tapped Target [${tappedLocation.lat.toFixed(4)}, ${tappedLocation.lng.toFixed(4)}]`
      );
      setTappedLocation(null);
    }
  };

  return (
    <div className="theme-panel border rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col h-full relative overflow-hidden font-sans">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 z-10 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded theme-card theme-accent-text border theme-border">
            <Navigation2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-xs sm:text-sm text-white">
              REAL-TIME MISSION GPS MAP
            </h3>
            <p className="text-[10px] font-mono theme-muted-text">
              Tap anywhere on map to set landing target or select Nagercoil
            </p>
          </div>
        </div>

        {/* Preset & View Controls */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSetLandingTarget(8.1833, 77.4119, 'Nagercoil Town Center')}
            className="px-2 py-1 rounded text-[11px] font-mono bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-sm transition-all"
          >
            <PlaneLanding className="w-3 h-3" />
            <span>Land at Nagercoil</span>
          </button>

          <button
            onClick={() => setAutoFollow(!autoFollow)}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-all ${
              autoFollow
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold'
                : 'theme-card text-slate-400 theme-border'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>{autoFollow ? 'LOCK DRONE' : 'FREE CAM'}</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[340px] sm:min-h-[420px] rounded-xl overflow-hidden border theme-border relative z-0">
        <MapContainer
          center={currentCoords}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Dark high-contrast carto tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapController center={currentCoords} autoFollow={autoFollow} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Home Base Launch Pad */}
          <Marker position={[8.1833, 77.4119]} icon={homeIcon}>
            <Popup className="font-mono text-xs">
              <strong>HOME LAUNCH PAD</strong><br />
              Coords: 8.183300° N, 77.411900° E
            </Popup>
          </Marker>

          {/* Active Target Destination Marker */}
          {targetDestination && (
            <>
              <Marker
                position={[targetDestination.lat, targetDestination.lng]}
                icon={createTargetIcon(targetDestination.name)}
              >
                <Popup className="font-mono text-xs">
                  <strong>TARGET LANDING ZONE</strong><br />
                  Name: {targetDestination.name}<br />
                  Coords: {targetDestination.lat.toFixed(6)}, {targetDestination.lng.toFixed(6)}<br />
                  Distance: {distanceToTargetMeters}m
                </Popup>
              </Marker>

              {/* Direct Flight Corridor Line to Target */}
              <Polyline
                positions={[currentCoords, [targetDestination.lat, targetDestination.lng]]}
                pathOptions={{ color: '#10b981', weight: 3, dashArray: '6, 8', opacity: 0.9 }}
              />
            </>
          )}

          {/* Tapped Location Marker (Pending Confirmation) */}
          {tappedLocation && (
            <Marker position={[tappedLocation.lat, tappedLocation.lng]} icon={createTargetIcon('New Target')}>
              <Popup className="font-mono text-xs">
                <strong>SELECTED LOCATION</strong><br />
                Lat: {tappedLocation.lat.toFixed(6)}<br />
                Lng: {tappedLocation.lng.toFixed(6)}<br />
                <button
                  onClick={confirmLandingAtTapped}
                  className="mt-2 w-full px-2 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-500"
                >
                  Confirm: Fly & Land Here
                </button>
              </Popup>
            </Marker>
          )}

          {/* Live Flight Breadcrumb Trail */}
          {trail.length > 1 && (
            <Polyline
              positions={trail}
              pathOptions={{ color: '#38bdf8', weight: 3.5, opacity: 0.85 }}
            />
          )}

          {/* Live Drone Marker */}
          <Marker
            position={currentCoords}
            icon={createDroneIcon(headingDeg, mode)}
          >
            <Popup className="font-mono text-xs">
              <strong>UAV LIVE POSITION</strong><br />
              Lat: {latitude.toFixed(6)}<br />
              Lng: {longitude.toFixed(6)}<br />
              Altitude: {altitudeAgl}m<br />
              Speed: {groundSpeedKmh} km/h
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Tapped Pin Banner */}
        {tappedLocation && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-emerald-500/50 shadow-2xl z-[400] font-mono text-xs animate-fadeIn">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-emerald-400 font-bold block">📍 TARGET PIN DROPPED:</span>
                <span className="text-slate-300">
                  {tappedLocation.lat.toFixed(6)}, {tappedLocation.lng.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={confirmLandingAtTapped}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Land Here
                </button>
                <button
                  onClick={() => setTappedLocation(null)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Telemetry Bar */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto bg-slate-950/85 backdrop-blur-md p-2.5 rounded-lg border theme-border text-xs font-mono shadow-lg z-[400] flex flex-wrap gap-x-4 gap-y-1">
          <div>
            <span className="theme-muted-text">LAT:</span> <span className="theme-accent-text font-bold">{latitude.toFixed(6)}°</span>
          </div>
          <div>
            <span className="theme-muted-text">LNG:</span> <span className="theme-accent-text font-bold">{longitude.toFixed(6)}°</span>
          </div>
          <div>
            <span className="theme-muted-text">ALT:</span> <span className="text-white font-bold">{altitudeAgl}m</span>
          </div>
          {targetDestination && (
            <div>
              <span className="theme-muted-text">TO {targetDestination.name}:</span> <span className="text-emerald-400 font-bold">{distanceToTargetMeters}m</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
