import React, { useEffect, useState } from 'react';
import { X, History, Database, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function FlightHistoryModal({ isOpen, onClose }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      if (data.success) {
        setFlights(data.flights);
      }
    } catch (err) {
      console.error('Failed to load flights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFlights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-base sm:text-lg text-white">
                MONGODB FLIGHT MISSION LOGS
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Persistent Telemetry Sessions & Black-Box Records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flight list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="text-center py-8 font-mono text-xs text-slate-400">
              Fetching records from MongoDB...
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs text-slate-500">
              No flights recorded yet. Launch the drone to record flight sessions in MongoDB!
            </div>
          ) : (
            flights.map((f) => (
              <div
                key={f.flightId}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-cyan-300">{f.flightId}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                    {f.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 text-[11px] mb-2">
                  <div>
                    <span className="text-slate-500 block">DURATION:</span>
                    <span className="text-white font-bold">{Math.floor(f.durationSeconds / 60)}m {f.durationSeconds % 60}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PEAK ALTITUDE:</span>
                    <span className="text-cyan-300 font-bold">{f.maxAltitudeMeters || 0}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">MAX SPEED:</span>
                    <span className="text-white font-bold">{f.maxHorizontalSpeedKmh || 0} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DISTANCE:</span>
                    <span className="text-emerald-400 font-bold">{f.totalDistanceTraveledKm || 0} km</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between pt-2 border-t border-slate-800/80">
                  <span>Created: {new Date(f.createdAt).toLocaleString()}</span>
                  <span>Model: {f.droneModel}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
