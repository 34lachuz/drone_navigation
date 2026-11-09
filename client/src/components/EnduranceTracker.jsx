import React from 'react';
import { BatteryCharging, BatteryWarning, Clock, Zap, Gauge, Navigation, ShieldCheck } from 'lucide-react';

export default function EnduranceTracker({ telemetry }) {
  const {
    batteryPercent = 100,
    batteryVoltage = 50.4,
    powerWatts = 15,
    currentDrawAmps = 0.3,
    elapsedFlightSeconds = 0,
    estimatedRemainingMinutes = 85,
    distanceToHomeMeters = 0,
    totalDistanceTraveledKm = 0,
  } = telemetry || {};

  // Nominal mission endurance is 85 minutes (5100s)
  const nominalMinutes = 85;
  const elapsedMinutes = Math.floor(elapsedFlightSeconds / 60);
  const elapsedSecondsRemainder = elapsedFlightSeconds % 60;
  
  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowBattery = batteryPercent <= 25;
  const isCriticalBattery = batteryPercent <= 15;

  return (
    <div className="bg-[#0a101f]/95 rounded-2xl border border-cyan-500/25 p-4 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-1.5">
              1-HOUR+ ENDURANCE MONITOR
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              32Ah High-Density Semi-Solid State Cell (380 Wh/kg)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${
            isCriticalBattery
              ? 'bg-rose-950/80 text-rose-400 border-rose-500 animate-pulse'
              : isLowBattery
              ? 'bg-amber-950/80 text-amber-400 border-amber-500'
              : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
          }`}>
            {batteryPercent.toFixed(1)}% REMAINING
          </span>
        </div>
      </div>

      {/* Main Clock & Duration Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
        {/* Elapsed Flight Clock */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> ELAPSED TIME
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-wider">
            {formatTime(elapsedFlightSeconds)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Active Mission Duration
          </div>
        </div>

        {/* Estimated Remaining Flight Time */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> EST. FLIGHT TIME
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300 tracking-wider">
            {estimatedRemainingMinutes} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Target: ~{nominalMinutes} min endurance
          </div>
        </div>

        {/* Total Distance & Power */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-400" /> DISTANCE COVERED
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 tracking-wider">
            {totalDistanceTraveledKm.toFixed(2)} <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Home Range: {distanceToHomeMeters}m
          </div>
        </div>
      </div>

      {/* Endurance Timeline Bar (0 to 85 minutes) */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-3">
        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
          <span className="text-slate-400">MISSION ENDURANCE TIMELINE</span>
          <span className="text-cyan-400 font-bold">
            {elapsedMinutes}m / {nominalMinutes}m ({((elapsedFlightSeconds / (nominalMinutes * 60)) * 100).toFixed(0)}%)
          </span>
        </div>

        {/* Progress bar with 1-hour marker and 20% RTH mark */}
        <div className="relative w-full h-4 bg-slate-900 rounded-full border border-slate-700 overflow-hidden">
          {/* 1-Hour milestone marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
            style={{ left: `${(60 / nominalMinutes) * 100}%` }}
            title="1 Hour Flight Milestone"
          ></div>

          {/* RTH reserve threshold line (at 80% used / 20% remaining) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
            style={{ left: '80%' }}
            title="Safe Return-to-Home boundary"
          ></div>

          {/* Filled elapsed progress */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (elapsedFlightSeconds / (nominalMinutes * 60)) * 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
          <span>0 min</span>
          <span className="text-amber-400">★ 60 min (1-Hour Mark)</span>
          <span className="text-rose-400">RTH Reserve (80%)</span>
          <span>85+ min</span>
        </div>
      </div>

      {/* Electrical Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">PACK VOLTAGE</div>
          <div className="text-base font-bold text-white">{batteryVoltage.toFixed(1)}V</div>
          <div className="text-[9px] text-slate-500">12S Nominal 50.4V</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">POWER DRAW</div>
          <div className="text-base font-bold text-amber-300">{powerWatts}W</div>
          <div className="text-[9px] text-slate-500">{currentDrawAmps.toFixed(1)}A current</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">FAILSAFE MARGIN</div>
          <div className="text-base font-bold text-emerald-400">
            {distanceToHomeMeters < 500 ? 'EXCELLENT' : 'NOMINAL'}
          </div>
          <div className="text-[9px] text-slate-500">Auto RTH armed</div>
        </div>
      </div>
    </div>
  );
}
