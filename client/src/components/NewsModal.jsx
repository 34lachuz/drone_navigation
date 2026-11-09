import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Newspaper, ShieldAlert, CloudRain, Sun, Wind, Compass, RefreshCw } from 'lucide-react';

export default function NewsModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-base sm:text-lg text-white">
                GOOGLE DRONE INTELLIGENCE & AIRSPACE NEWS
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Curated 2026 UAV Tech, BVLOS Regulations & Long-Endurance Reports
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchNews}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Refresh News"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Airspace Advisory Banner */}
          {data?.advisory && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sun className="w-4 h-4" /> LIVE AIRSPACE STATUS: {data.advisory.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{data.advisory.zone}</span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed mb-3">
                {data.advisory.recommendation}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">VISIBILITY:</span>
                  <span className="font-bold text-white">{data.advisory.visibilityKm} km</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">WIND SPEED:</span>
                  <span className="font-bold text-cyan-300">{data.advisory.surfaceWindKmh} km/h</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">CEILING:</span>
                  <span className="font-bold text-white">{data.advisory.cloudCeilingM}m</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">KP INDEX (GPS):</span>
                  <span className="font-bold text-emerald-400">{data.advisory.kpIndex} (Nominal)</span>
                </div>
              </div>
            </div>
          )}

          {/* News Articles */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
              Gathered Drone Industry Reports
            </h3>

            {data?.articles?.map((article) => (
              <div
                key={article.id}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {article.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(article.publishedAt).toLocaleDateString()} • {article.readTime}
                  </span>
                </div>

                <h4 className="font-semibold text-slate-100 text-sm sm:text-base leading-snug mb-1.5">
                  {article.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed mb-3 font-sans">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                  <span className="text-slate-500">Source: <strong className="text-slate-400">{article.source}</strong></span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline font-semibold"
                  >
                    <span>Read Report</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
