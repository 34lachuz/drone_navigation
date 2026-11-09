import React from 'react';
import { Palette, X, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeModal({ isOpen, onClose }) {
  const { theme, setTheme, themes } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="theme-panel border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b theme-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl theme-card border theme-border theme-accent-text">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-base sm:text-lg text-white">
                SELECT APP COLOR THEME
              </h2>
              <p className="text-xs theme-muted-text font-mono">
                Choose attractive mobile APK appearance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg theme-card hover:opacity-80 text-slate-300 border theme-border transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Options */}
        <div className="p-4 sm:p-6 space-y-3">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  onClose();
                }}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'theme-card border-2 ring-2 ring-sky-400/50 shadow-lg'
                    : 'theme-card hover:border-slate-500 border opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {/* Swatch gradient preview */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.preview} shadow-md border border-white/20 flex items-center justify-center`}>
                    {isSelected && <Check className="w-6 h-6 text-white drop-shadow" />}
                  </div>

                  <div>
                    <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
                      <span>{t.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-xs theme-muted-text mt-0.5 font-sans">
                      {t.description}
                    </div>
                  </div>
                </div>

                <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${t.badge}`}>
                  SAMPLE
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
