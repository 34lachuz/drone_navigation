import React, { useState } from 'react';
import { Rocket, Play, Pause, RotateCcw, Home, Shield, FastForward, Sliders, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FlightControls({ telemetry, onSendCommand }) {
  const { mode = 'PRE-FLIGHT', armed = false, speedMultiplier = 1 } = telemetry || {};
  const [feedback, setFeedback] = useState(null);
  const [customCeiling, setCustomCeiling] = useState(160);

  const handleAction = (action, payload = null) => {
    onSendCommand(action, payload, (res) => {
      if (res) {
        setFeedback(res);
        setTimeout(() => setFeedback(null), 4000);
      }
    });
  };

  const speeds = [1, 2, 5, 15, 30];

  return (
    <div className="bg-[#0a101f]/95 rounded-2xl border border-cyan-500/25 p-4 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-slate-100">
              MISSION COMMAND & GUIDANCE
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              Autopilot Flight Director & Launch Sequences
            </p>
          </div>
        </div>

        {/* Speed multiplier selector */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 px-1 flex items-center gap-0.5">
            <FastForward className="w-3 h-3 text-cyan-400" /> SIM:
          </span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => handleAction('set_speed_multiplier', { multiplier: s })}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                speedMultiplier === s
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        {/* Arm Drone */}
        <button
          onClick={() => handleAction('arm')}
          disabled={armed}
          className={`p-3 rounded-xl border font-mono font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
            armed
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500'
          }`}
        >
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>{armed ? 'DRONE ARMED ✓' : '1. ARM MOTORS'}</span>
        </button>

        {/* Rocket Vertical Climb */}
        <button
          onClick={() => handleAction('launch_rocket_climb')}
          className={`p-3 rounded-xl border font-mono font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
            mode === 'VERTICAL CLIMB'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-orange-400 animate-pulse'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/80 shadow-cyan-500/20'
          }`}
        >
          <Rocket className="w-5 h-5" />
          <span>2. ROCKET LAUNCH</span>
        </button>

        {/* Hold / Hover */}
        <button
          onClick={() => handleAction('hold')}
          disabled={mode === 'PRE-FLIGHT' || mode === 'LANDED'}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-200 border border-slate-700 hover:border-cyan-500 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Pause className="w-5 h-5 text-amber-400" />
          <span>HOLD HOVER</span>
        </button>

        {/* Resume Waypoints */}
        <button
          onClick={() => handleAction('resume_mission')}
          disabled={mode === 'PRE-FLIGHT' || mode === 'LANDED'}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-200 border border-slate-700 hover:border-cyan-500 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Play className="w-5 h-5 text-cyan-400" />
          <span>RESUME SURVEY</span>
        </button>

        {/* Return To Home (RTH) */}
        <button
          onClick={() => handleAction('rth')}
          disabled={mode === 'PRE-FLIGHT' || mode === 'LANDED'}
          className="p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 disabled:opacity-50 text-purple-300 border border-purple-500/50 hover:border-purple-400 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Home className="w-5 h-5 text-purple-400" />
          <span>RETURN HOME (RTH)</span>
        </button>

        {/* Reset Mission */}
        <button
          onClick={() => handleAction('reset')}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <RotateCcw className="w-5 h-5 text-slate-400" />
          <span>RESET FLIGHT</span>
        </button>
      </div>

      {/* Target Climb Altitude Setting */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">ROCKET CEILING TARGET:</span>
        <div className="flex items-center space-x-2">
          {[120, 160, 200, 250].map((alt) => (
            <button
              key={alt}
              onClick={() => {
                setCustomCeiling(alt);
                handleAction('set_target_altitude', { altitude: alt });
              }}
              className={`px-2 py-1 rounded border text-[11px] transition-all ${
                customCeiling === alt
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {alt}m
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`mt-2 p-2.5 rounded-lg border font-mono text-xs flex items-center gap-2 animate-fadeIn ${
          feedback.success
            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
            : 'bg-rose-950/70 text-rose-300 border-rose-500/50'
        }`}>
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
