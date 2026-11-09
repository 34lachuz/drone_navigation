import React from 'react';
import { Rocket, Radio, ShieldAlert, Newspaper, History, Compass, Wifi, Satellite, Bluetooth, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({
  telemetry,
  connected,
  bleStatus,
  onOpenBluetooth,
  onOpenTheme,
  onOpenNews,
  onOpenHistory,
  onEmergencyStop
}) {
  const { theme, themes } = useTheme();
  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0];

  const getStatusColor = (mode) => {
    switch (mode) {
      case 'NAVIGATING_TO_TARGET':
        return 'bg-sky-500/20 text-sky-300 border-sky-400 animate-pulse';
      case 'PRECISION_LANDING':
        return 'bg-amber-500/20 text-amber-300 border-amber-400 animate-bounce';
      case 'LANDED_AT_TARGET':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold';
      case 'VERTICAL CLIMB':
        return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse';
      case 'TRANSITION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'CRUISE':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      case 'RTH':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 animate-pulse';
      case 'LANDED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'ABORTED':
        return 'bg-rose-600/30 text-rose-300 border-rose-500 animate-bounce';
      default:
        return 'theme-card text-slate-300 theme-border';
    }
  };

  const isBleConnected = bleStatus?.isConnected;

  return (
    <header className="w-full theme-panel backdrop-blur-md border-b theme-border px-3 py-2.5 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Brand & Drone Info */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/40">
          <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white transform -rotate-45" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold tracking-wider text-sm sm:text-base text-white flex items-center gap-1.5 font-mono">
              AEROROCKET <span className="theme-accent-text font-semibold text-xs px-1.5 py-0.5 rounded theme-card border theme-border">GCS v2.5</span>
            </h1>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${connected ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${connected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
              {connected ? 'WS LIVE' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-[11px] theme-muted-text font-mono hidden sm:block">
            UAV: <span className="text-white font-bold">{isBleConnected ? bleStatus.deviceName : 'AeroGlide VTOL X-1'}</span> | ID: <span className="theme-accent-text">{telemetry?.flightId || 'FLIGHT-ACTIVE'}</span>
          </p>
        </div>
      </div>

      {/* Center status indicators */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Flight Mode Indicator */}
        <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border tracking-wider flex items-center gap-1.5 ${getStatusColor(telemetry?.mode)}`}>
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span>{telemetry?.mode || 'STANDBY'}</span>
        </div>

        {/* GPS Satellites & RSSI */}
        <div className="hidden md:flex items-center space-x-3 text-xs font-mono text-slate-300 theme-card px-3 py-1 rounded-md border theme-border">
          <span className="flex items-center gap-1 theme-accent-text">
            <Satellite className="w-3.5 h-3.5" />
            {telemetry?.satellites || 22} SATS
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
            {telemetry?.signalStrengthPercent || 97}% RSSI
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* THEME SELECTOR BUTTON */}
        <button
          onClick={onOpenTheme}
          className="px-2.5 py-1.5 rounded-lg theme-card hover:opacity-90 text-slate-200 border theme-border transition-all text-xs flex items-center gap-1.5 font-mono shadow-sm"
          title="Change App Theme Color"
        >
          <Palette className="w-3.5 h-3.5 theme-accent-text" />
          <span className="hidden sm:inline">{currentThemeObj.name.split('&')[0].trim()}</span>
          <span className="sm:hidden">Theme</span>
        </button>

        {/* BLUETOOTH CONNECT BUTTON */}
        <button
          onClick={onOpenBluetooth}
          className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm ${
            isBleConnected
              ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sky-500/20 animate-pulse font-bold'
              : 'theme-card hover:opacity-90 text-slate-200 border theme-border'
          }`}
          title="Connect Drone via Bluetooth"
        >
          <Bluetooth className={`w-3.5 h-3.5 ${isBleConnected ? 'text-sky-300' : 'text-blue-400'}`} />
          <span className="hidden sm:inline">
            {isBleConnected ? `BLE: ${bleStatus.deviceName}` : 'Connect BLE'}
          </span>
          <span className="sm:hidden">BLE</span>
        </button>

        <button
          onClick={onOpenNews}
          className="px-2.5 py-1.5 rounded-lg theme-card hover:opacity-90 text-slate-200 border theme-border transition-all text-xs flex items-center gap-1.5 font-mono shadow-sm"
          title="Google Drone Tech News & Airspace Weather"
        >
          <Newspaper className="w-3.5 h-3.5 theme-accent-text" />
          <span className="hidden md:inline">Drone News</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="px-2.5 py-1.5 rounded-lg theme-card hover:opacity-90 text-slate-200 border theme-border transition-all text-xs flex items-center gap-1.5 font-mono shadow-sm"
          title="MongoDB Mission Logs"
        >
          <History className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Logs</span>
        </button>

        <button
          onClick={onEmergencyStop}
          className="px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center gap-1 shadow-lg shadow-rose-900/40 border border-rose-400/50 transition-all active:scale-95"
          title="Emergency Motor Cutoff"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>E-STOP</span>
        </button>
      </div>
    </header>
  );
}
