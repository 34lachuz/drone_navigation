import React from 'react';
import { Navigation, MapPin, Clock, Gauge, Compass, ArrowUpRight, Crosshair, CheckCircle2, Flame, PlaneTakeoff, PlaneLanding } from 'lucide-react';

export default function PrecisionNavCard({ telemetry, onFlyToTarget, onSetPhoneLocation }) {
  const {
    latitude = 8.1833,
    longitude = 77.4119,
    altitudeAgl = 0,
    altitudeMsl = 28,
    groundSpeedKmh = 0,
    headingDeg = 0,
    verticalSpeedMs = 0,
    mode = 'PRE-FLIGHT',
    targetDestination,
    distanceToTargetMeters = 0,
    etaSeconds = 0,
    distanceToHomeMeters = 0,
    elapsedFlightSeconds = 0,
  } = telemetry || {};

  const formatEta = (sec) => {
    if (!sec || sec <= 0) return '00m 00s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const isNavigatingToTarget = mode === 'NAVIGATING_TO_TARGET';
  const isLanding = mode === 'PRECISION_LANDING';
  const isLandedAtTarget = mode === 'LANDED_AT_TARGET';

  // Nagercoil exact coordinates
  const NAGERCOIL_COORDS = {
    name: 'Nagercoil Town Center Zone',
    lat: 8.183300,
    lng: 77.411900,
  };

  return (
    <div className="theme-panel border rounded-2xl p-4 shadow-xl font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b theme-border gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg theme-card border theme-border theme-accent-text">
            <Crosshair className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-white flex items-center gap-2">
              PRECISION GPS & TARGET NAVIGATION
              {targetDestination && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  TARGET LOCKED
                </span>
              )}
            </h3>
            <p className="text-[10px] font-mono theme-muted-text">
              Real-Time RTK Guidance & Precision Landing Director
            </p>
          </div>
        </div>

        {/* Quick Location Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onFlyToTarget(NAGERCOIL_COORDS.lat, NAGERCOIL_COORDS.lng, NAGERCOIL_COORDS.name)}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
            title="Send drone to land at Nagercoil"
          >
            <PlaneLanding className="w-3.5 h-3.5" />
            <span>Land in Nagercoil</span>
          </button>

          <button
            onClick={onSetPhoneLocation}
            className="px-2.5 py-1.5 rounded-lg theme-card hover:opacity-90 text-slate-200 border theme-border font-mono text-xs flex items-center gap-1 transition-all"
            title="Sync drone launch coordinates to your phone GPS"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Use My Phone GPS</span>
            <span className="sm:hidden">Phone GPS</span>
          </button>
        </div>
      </div>

      {/* Main Coordinate & Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 font-mono">
        {/* Exact Latitude */}
        <div className="theme-card p-3 rounded-xl border theme-border">
          <div className="text-[10px] theme-muted-text flex items-center justify-between">
            <span>EXACT LATITUDE</span>
            <span className="text-emerald-400">● RTK</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white mt-0.5">
            {latitude.toFixed(6)}°
          </div>
          <div className="text-[10px] theme-muted-text mt-0.5">
            {latitude >= 0 ? 'North' : 'South'} Coordinate
          </div>
        </div>

        {/* Exact Longitude */}
        <div className="theme-card p-3 rounded-xl border theme-border">
          <div className="text-[10px] theme-muted-text flex items-center justify-between">
            <span>EXACT LONGITUDE</span>
            <span className="text-emerald-400">● RTK</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white mt-0.5">
            {longitude.toFixed(6)}°
          </div>
          <div className="text-[10px] theme-muted-text mt-0.5">
            {longitude >= 0 ? 'East' : 'West'} Coordinate
          </div>
        </div>

        {/* Exact Altitude */}
        <div className="theme-card p-3 rounded-xl border theme-border">
          <div className="text-[10px] theme-muted-text flex items-center justify-between">
            <span>ALTITUDE (AGL)</span>
            <span className="theme-accent-text">{verticalSpeedMs > 0 ? `+${verticalSpeedMs}` : verticalSpeedMs} m/s</span>
          </div>
          <div className="text-base sm:text-lg font-black text-sky-300 mt-0.5">
            {altitudeAgl.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
          <div className="text-[10px] theme-muted-text mt-0.5">
            MSL: {altitudeMsl}m above sea
          </div>
        </div>

        {/* Heading & Speed */}
        <div className="theme-card p-3 rounded-xl border theme-border">
          <div className="text-[10px] theme-muted-text flex items-center justify-between">
            <span>SPEED & HEADING</span>
            <span className="text-slate-400">{getCardinal(headingDeg)}</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white mt-0.5">
            {groundSpeedKmh.toFixed(0)} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] theme-muted-text mt-0.5">
            Bearing: {headingDeg}°
          </div>
        </div>
      </div>

      {/* Target Destination & ETA Live Banner */}
      <div className={`p-3.5 rounded-xl border transition-all ${
        isLandedAtTarget
          ? 'bg-emerald-950/40 border-emerald-500/60'
          : isLanding
          ? 'bg-amber-950/40 border-amber-500/60 animate-pulse'
          : isNavigatingToTarget
          ? 'bg-sky-950/40 border-sky-500/60'
          : 'theme-card border theme-border'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              isLandedAtTarget ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'theme-card border theme-border theme-accent-text'
            }`}>
              <Navigation className="w-5 h-5 transform rotate-45" />
            </div>
            <div>
              <div className="text-[10px] font-mono theme-muted-text uppercase">
                {targetDestination ? 'ACTIVE DESTINATION / LANDING TARGET' : 'DESTINATION NOT SET (CLICK MAP OR PRESET)'}
              </div>
              <div className="font-mono font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>{targetDestination ? targetDestination.name : 'Ready for flight instructions'}</span>
                {isLanding && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-bounce">
                    FINAL TOUCHDOWN DESCENT
                  </span>
                )}
                {isLandedAtTarget && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                    TOUCHDOWN VERIFIED ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Distance and ETA Counter */}
          {targetDestination && (
            <div className="flex items-center space-x-4 font-mono text-xs">
              <div className="text-right">
                <span className="text-[10px] theme-muted-text block">DISTANCE REMAINING:</span>
                <span className="font-black text-white text-sm">
                  {distanceToTargetMeters > 1000 ? `${(distanceToTargetMeters / 1000).toFixed(2)} km` : `${distanceToTargetMeters} m`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] theme-muted-text block">ESTIMATED TIME (ETA):</span>
                <span className="font-black theme-accent-text text-sm flex items-center gap-1 justify-end">
                  <Clock className="w-3.5 h-3.5" />
                  {formatEta(etaSeconds)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCardinal(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
  return directions[index];
}
