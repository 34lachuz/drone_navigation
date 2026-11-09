import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'dark-blue',
    name: 'White & Dark Blue',
    description: 'Executive Naval Aviation: Deep Navy with crisp White & Electric Azure',
    preview: 'from-blue-950 via-slate-900 to-sky-400',
    badge: 'bg-blue-600 text-white',
  },
  {
    id: 'sandal-brown',
    name: 'Brown & Sandal',
    description: 'Tactical Desert & Sandalwood: Warm Espresso with Sandal Gold & Cream',
    preview: 'from-[#1c120c] via-[#2d1c14] to-[#dfc299]',
    badge: 'bg-[#d4a373] text-[#1a100a]',
  },
  {
    id: 'emerald-green',
    name: 'Light Green & Dark Green',
    description: 'High-Vis Radar Military: Deep Obsidian Forest with Neon Mint Green',
    preview: 'from-[#04140d] via-[#092618] to-[#34d399]',
    badge: 'bg-emerald-500 text-black',
  },
  {
    id: 'cyber-cyan',
    name: 'Cyber Dark Cyan',
    description: 'Aerospace Spaceflight: Deep Space with Neon Holographic Cyan',
    preview: 'from-slate-950 via-slate-900 to-cyan-400',
    badge: 'bg-cyan-500 text-black',
  },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aerorocket_theme') || 'dark-blue';
  });

  useEffect(() => {
    localStorage.setItem('aerorocket_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-dark-blue', 'theme-sandal-brown', 'theme-emerald-green', 'theme-cyber-cyan');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
