import React from 'react';
import { Rocket, ArrowUp, Gauge, Compass, Zap, Flame, ShieldCheck, ChevronUp } from 'lucide-react';

export default function RocketHUD({ telemetry }) {
  const {
    mode = 'PRE-FLIGHT',
    altitudeAgl = 0,
    verticalSpeedMs = 0,
    groundSpeedKmh = 0,
    pitchDeg = 0,
    rollDeg = 0,
    headingDeg = 0,
    thrustPercent = 0,
    gForce = 1.0,
    armed = false,
  } = telemetry || {};

  const targetAltitude = 160;
  const climbProgress = Math.min(100, Math.max(0, (altitudeAgl / targetAltitude) * 100));

  // Stages
  const stages = [
    { key: 'PRE-FLIGHT', label: 'PRE-LAUNCH' },
    { key: 'VERTICAL CLIMB', label: 'ROCKET CLIMB' },
    { key: 'TRANSITION', label: 'TRANSITION' },
    { key: 'CRUISE', label: 'CRUISE PATROL' },
    { key: 'RTH', label: 'RTH / DESCENT' },
    { key: 'LANDED', label: 'TOUCHDOWN' },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === mode);

  return (
    <div className="flex flex-col h-full bg-[#0a101f]/95 rounded-2xl border border-cyan-500/25 p-3 sm:p-4 shadow-2xl relative overflow-hidden">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      {/* Top Heading Tape */}
      <div className="relative z-10 w-full mb-3 bg-slate-900/80 rounded-lg border border-cyan-500/30 px-3 py-1.5 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Compass className="w-4 h-4 animate-spin-slow" />
          <span className="font-bold">HEADING</span>
        </div>
        <div className="flex items-center space-x-4 overflow-hidden text-slate-400">
          <span>{((headingDeg - 30 + 360) % 360).toFixed(0)}°</span>
          <span className="text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/50">
            {headingDeg.toFixed(0)}° {getCardinal(headingDeg)}
          </span>
          <span>{((headingDeg + 30) % 360).toFixed(0)}°</span>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          VSI: <span className={`font-bold ${verticalSpeedMs > 0 ? 'text-emerald-400' : verticalSpeedMs < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {verticalSpeedMs > 0 ? `+${verticalSpeedMs}` : verticalSpeedMs} m/s
          </span>
        </div>
      </div>

      {/* Main HUD Display: Split Left Altimeter/Rocket Ascent Ladder, Center Attitude Indicator, Right Thrust & VSI */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 items-center">
        
        {/* Left: Rocket Climb Altimeter Tape */}
        <div className="md:col-span-3 bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex flex-col justify-between h-64 md:h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
              <Rocket className="w-3.5 h-3.5" /> ASCENT TAPE
            </span>
            <span className="text-[10px] font-mono text-slate-400">CEILING: {targetAltitude}m</span>
          </div>

          {/* Vertical Tape with altitude markers */}
          <div className="relative flex-1 bg-slate-900/90 rounded-lg p-2 border border-cyan-500/20 flex flex-col justify-between overflow-hidden">
            {/* Target indicator line */}
            <div className="absolute top-2 left-0 right-0 border-b border-dashed border-cyan-400/80 px-2 flex justify-between text-[10px] text-cyan-300 font-mono">
              <span>TARGET</span>
              <span>{targetAltitude}m</span>
            </div>

            {/* Rising climb progress fill */}
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
                mode === 'VERTICAL CLIMB'
                  ? 'bg-gradient-to-t from-red-600/40 via-orange-500/30 to-cyan-500/40 border-t-2 border-cyan-300'
                  : 'bg-gradient-to-t from-cyan-900/30 to-cyan-500/20 border-t-2 border-cyan-400'
              }`}
              style={{ height: `${climbProgress}%` }}
            >
              {mode === 'VERTICAL CLIMB' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-orange-400 animate-bounce">
                  <Flame className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Scale numbers */}
            <div className="relative z-10 flex flex-col justify-between h-full font-mono text-[11px] text-slate-400 pointer-events-none">
              <div className="flex justify-between"><span>200m</span><span className="text-slate-600">---</span></div>
              <div className="flex justify-between"><span>150m</span><span className="text-slate-600">---</span></div>
              <div className="flex justify-between"><span>100m</span><span className="text-slate-600">---</span></div>
              <div className="flex justify-between"><span>50m</span><span className="text-slate-600">---</span></div>
              <div className="flex justify-between"><span>0m</span><span className="text-slate-600">---</span></div>
            </div>
          </div>

          {/* Current Altitude Box */}
          <div className="mt-2 bg-slate-900 px-3 py-2 rounded-lg border border-cyan-500/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">ALTITUDE AGL</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-tight">
                {altitudeAgl.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">MSL</div>
              <div className="text-xs font-mono text-slate-300 font-semibold">
                {(920 + altitudeAgl).toFixed(0)}m
              </div>
            </div>
          </div>
        </div>

        {/* Center: Artificial Horizon & Attitude Indicator */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-cyan-500/50 relative overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.2)] bg-[#070e1c]">
            {/* Horizon Disc with Pitch and Roll transform */}
            <div
              className="absolute inset-[-50%] transition-transform duration-100 ease-out flex flex-col"
              style={{
                transform: `rotate(${-rollDeg}deg) translateY(${pitchDeg * 2.5}px)`,
              }}
            >
              {/* Sky half */}
              <div className="w-full h-1/2 bg-gradient-to-b from-sky-800 to-sky-600/90 relative flex items-end justify-center">
                {/* Pitch positive ladder lines */}
                <div className="w-full pb-4 space-y-4 font-mono text-[9px] text-sky-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-6 border-b border-sky-300"></span>
                    <span>+20°</span>
                    <span className="w-6 border-b border-sky-300"></span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-10 border-b-2 border-sky-200"></span>
                    <span>+10°</span>
                    <span className="w-10 border-b-2 border-sky-200"></span>
                  </div>
                </div>
              </div>

              {/* Ground half */}
              <div className="w-full h-1/2 bg-gradient-to-t from-[#2c1d11] to-[#4a2e18] border-t-2 border-amber-400/80 relative flex items-start justify-center">
                {/* Pitch negative ladder lines */}
                <div className="w-full pt-4 space-y-4 font-mono text-[9px] text-amber-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-10 border-b-2 border-dashed border-amber-300"></span>
                    <span>-10°</span>
                    <span className="w-10 border-b-2 border-dashed border-amber-300"></span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-6 border-b border-dashed border-amber-400"></span>
                    <span>-20°</span>
                    <span className="w-6 border-b border-dashed border-amber-400"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Static Aircraft Fixed Reticle / Crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                {/* Center dot */}
                <circle cx="50" cy="50" r="3" fill="#ff4d4d" />
                <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
                {/* Left wing marker */}
                <path d="M 20 50 L 38 50 L 38 56" stroke="#ffeb3b" strokeWidth="2.5" strokeLinecap="round" />
                {/* Right wing marker */}
                <path d="M 80 50 L 62 50 L 62 56" stroke="#ffeb3b" strokeWidth="2.5" strokeLinecap="round" />
                {/* Center pip */}
                <path d="M 46 50 L 54 50" stroke="#ffeb3b" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Roll Angle Arc & Pointer */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-cyan-400 pointer-events-none">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-cyan-400"></div>
            </div>

            {/* Rocket Launch Pulse Glow */}
            {mode === 'VERTICAL CLIMB' && (
              <div className="absolute inset-0 rounded-full border-2 border-red-500/60 animate-ping pointer-events-none"></div>
            )}
          </div>

          {/* Attitude Readouts */}
          <div className="flex items-center space-x-6 mt-3 font-mono text-xs text-slate-300">
            <span className="bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
              PITCH: <strong className="text-cyan-300">{pitchDeg.toFixed(1)}°</strong>
            </span>
            <span className="bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
              ROLL: <strong className="text-cyan-300">{rollDeg.toFixed(1)}°</strong>
            </span>
          </div>
        </div>

        {/* Right: Thrust, G-Force & Rocket Guidance Diagnostics */}
        <div className="md:col-span-3 bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex flex-col justify-between h-64 md:h-full">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" /> THRUST & DYNAMICS
              </span>
              <span className="text-[10px] font-mono text-slate-400">{gForce.toFixed(2)}G</span>
            </div>

            {/* Thrust Meter */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> MOTOR THRUST
                </span>
                <span className={`font-bold ${thrustPercent > 80 ? 'text-red-400' : 'text-cyan-300'}`}>
                  {thrustPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    thrustPercent > 80
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                  }`}
                  style={{ width: `${thrustPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Ground Speed & G-Force readout */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">GROUND SPEED</div>
                <div className="text-lg font-bold text-white">
                  {groundSpeedKmh.toFixed(0)} <span className="text-[10px] text-slate-400">km/h</span>
                </div>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">LOAD FACTOR</div>
                <div className="text-lg font-bold text-emerald-400">
                  {gForce.toFixed(2)} <span className="text-[10px] text-slate-400">G</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guidance Status Notice */}
          <div className="bg-cyan-950/40 border border-cyan-500/30 p-2.5 rounded-lg mt-2">
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GUIDANCE COMPUTER</span>
            </div>
            <p className="text-[10px] font-mono text-slate-300 mt-1 leading-relaxed">
              {mode === 'VERTICAL CLIMB'
                ? '🚀 HIGH-THRUST VERTICAL ASCENT IN PROGRESS. Holding pitch level until 160m ceiling.'
                : mode === 'TRANSITION'
                ? '⚡ TRANSITION: Aerodynamic pitch angle converting climb momentum to horizontal cruise.'
                : mode === 'CRUISE'
                ? '🧭 AUTONOMOUS SURVEY: Tracking waypoint corridor. Long endurance power optimization active.'
                : mode === 'RTH'
                ? '🔄 RETURN-TO-HOME: Direct vector to launch pad. Safe descent initiated.'
                : mode === 'LANDED'
                ? '✅ TOUCHDOWN COMPLETE. Motors disarmed. Flight data persisted.'
                : 'WAITING FOR ARM & VERTICAL LAUNCH INITIATION.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Mission Stage Progression */}
      <div className="relative z-10 mt-3 pt-2 border-t border-slate-800/80">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-mono text-[10px]">
          {stages.map((st, idx) => {
            const isCurrent = st.key === mode;
            const isCompleted = currentStageIndex > idx;
            return (
              <div
                key={st.key}
                className={`px-2 py-1.5 rounded-md border text-center transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                    : isCompleted
                    ? 'bg-emerald-950/40 text-emerald-400/80 border-emerald-900/60'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800/60'
                }`}
              >
                <div className="truncate">{idx + 1}. {st.label}</div>
              </div>
            );
          })}
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
