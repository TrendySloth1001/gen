'use client';

import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function Typewriter({ text, delay = 100, className = '' }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse ml-1 text-emerald-400">▊</span>
      )}
    </span>
  );
}
