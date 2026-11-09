import React from 'react';
import { Rocket, Navigation, BatteryCharging, Sliders, LayoutDashboard, Crosshair } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'all', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'target', label: 'TARGET GPS', icon: Crosshair },
    { id: 'hud', label: 'ROCKET HUD', icon: Rocket },
    { id: 'map', label: 'MAP', icon: Navigation },
    { id: 'endurance', label: 'POWER', icon: BatteryCharging },
    { id: 'controls', label: 'COMMAND', icon: Sliders },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 theme-panel backdrop-blur-lg border-t theme-border px-2 py-1.5 flex items-center justify-around sm:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg font-mono text-[9px] transition-all ${
              isActive
                ? 'theme-accent-text font-bold theme-card border theme-border shadow-sm'
                : 'theme-muted-text hover:text-white'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'theme-accent-text animate-pulse' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
