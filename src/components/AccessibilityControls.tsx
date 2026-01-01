'use client';

import { useState } from 'react';
import { FaFont, FaMinus, FaPlus } from 'react-icons/fa';

export default function AccessibilityControls() {
  const [fontSize, setFontSize] = useState(100);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(75, Math.min(150, fontSize + delta));
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const toggleDyslexiaFont = () => {
    setDyslexiaFont(!dyslexiaFont);
    document.documentElement.classList.toggle('dyslexia-font');
  };

  return (
    <div className="fixed bottom-4 left-4 bg-zinc-950 border-2 border-purple-500/30 rounded-lg p-3 z-50 font-mono">
      <div className="flex items-center gap-2 mb-2 text-purple-400 text-sm font-bold">
        <FaFont />
        <span>Accessibility</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustFontSize(-10)}
            className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded hover:bg-purple-500/20 transition"
          >
            <FaMinus className="text-purple-400 text-xs" />
          </button>
          <span className="text-zinc-400 text-xs min-w-12 text-center">{fontSize}%</span>
          <button
            onClick={() => adjustFontSize(10)}
            className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded hover:bg-purple-500/20 transition"
          >
            <FaPlus className="text-purple-400 text-xs" />
          </button>
        </div>

        <button
          onClick={toggleDyslexiaFont}
          className={`w-full px-3 py-1 rounded text-xs transition ${
            dyslexiaFont
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
          }`}
        >
          {dyslexiaFont ? '✓ ' : ''}Dyslexia Font
        </button>
      </div>
    </div>
  );
}
