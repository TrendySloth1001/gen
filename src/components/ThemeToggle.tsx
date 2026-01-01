'use client';

import { useState } from 'react';
import { FaPalette, FaMoon, FaSun, FaAdjust, FaEye } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'terminal-dark', name: 'Terminal Dark', icon: FaMoon, color: 'emerald' },
    { id: 'terminal-light', name: 'Terminal Light', icon: FaSun, color: 'blue' },
    { id: 'high-contrast', name: 'High Contrast', icon: FaAdjust, color: 'purple' },
    { id: 'colorblind', name: 'Colorblind Mode', icon: FaEye, color: 'orange' }
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-zinc-900/50 border border-emerald-500/30 hover:border-emerald-500 transition text-sm"
      >
        <FaPalette className="text-emerald-400" />
        <span className="text-zinc-300">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-zinc-950 border-2 border-emerald-500/30 rounded-lg p-2 min-w-48 z-50">
          {themes.map(({ id, name, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => { setTheme(id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-900 transition text-left ${
                theme === id ? `bg-${color}-500/10 border border-${color}-500/30` : ''
              }`}
            >
              <Icon className={`text-${color}-400`} />
              <span className={`text-sm ${theme === id ? `text-${color}-400 font-bold` : 'text-zinc-300'}`}>
                {name}
              </span>
              {theme === id && <span className="ml-auto text-emerald-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
