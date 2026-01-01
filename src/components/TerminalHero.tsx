'use client';

import { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function TerminalHero() {
  const [displayedText, setDisplayedText] = useState('');
  const fullName = 'Nikhil Sohanlal Kumawat';
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullName.length) {
        setDisplayedText(fullName.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 font-mono">
      <div className="max-w-4xl w-full space-y-8">
        {/* Terminal Window */}
        <div className="border-2 border-emerald-500/30 rounded-lg bg-black/80 backdrop-blur-sm shadow-2xl shadow-emerald-500/10">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/30 bg-zinc-950">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-zinc-500 text-sm ml-4">~/portfolio</span>
          </div>

          {/* Terminal Content */}
          <div className="p-6 space-y-4 text-sm">
            <div className="space-y-2">
              <div className="text-zinc-400">
                <span className="text-emerald-400">nick@dev</span>
                <span className="text-zinc-500">:</span>
                <span className="text-blue-400">~/portfolio</span>
                <span className="text-zinc-400">$</span>
                <span className="ml-2">whoami</span>
              </div>
              
              <div className="pl-4 space-y-1">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-emerald-400">
                  {displayedText}
                  {!isTypingComplete && (
                    <span className={`inline-block w-2 h-6 ml-1 bg-emerald-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
                  )}
                </div>
                {isTypingComplete && (
                  <div className="text-zinc-400 space-y-1 animate-fadeIn">
                    <div>→ Engineering Student & Full-Stack Developer</div>
                    <div className="text-zinc-500">→ Building modern web & mobile applications</div>
                  </div>
                )}
              </div>
            </div>

            {isTypingComplete && (
              <>
                <div className="text-zinc-400 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                  <span className="text-emerald-400">nick@dev</span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-blue-400">~/portfolio</span>
                  <span className="text-zinc-400">$</span>
                  <span className="ml-2">cat status.txt</span>
                </div>
                
                <div className="pl-4 text-zinc-400 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span>Available for opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">●</span>
                    <span>Open to collaboration</span>
                  </div>
                </div>

                <div className="text-zinc-400 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                  <span className="text-emerald-400">nick@dev</span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-blue-400">~/portfolio</span>
                  <span className="text-zinc-400">$</span>
                  <span className="ml-2">ls ./social</span>
                </div>

                <div className="pl-4 flex flex-wrap gap-3 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
                  <a
                    href="https://github.com/TrendySloth1001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-emerald-500/30 text-emerald-400 rounded hover:bg-zinc-800 hover:border-emerald-500/50 transition"
                  >
                    <FaGithub className="text-lg" />
                    <span>github</span>
                  </a>
                  <a
                    href="https://linkedin.com/in/nikhil-kumawat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-blue-500/30 text-blue-400 rounded hover:bg-zinc-800 hover:border-blue-500/50 transition"
                  >
                    <FaLinkedin className="text-lg" />
                    <span>linkedin</span>
                  </a>
                  <a
                    href="mailto:your.email@example.com"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-600/30 text-zinc-400 rounded hover:bg-zinc-800 hover:border-zinc-500/50 transition"
                  >
                    <FaEnvelope className="text-lg" />
                    <span>email</span>
                  </a>
                </div>

                <div className="pt-2 animate-fadeIn" style={{ animationDelay: '1.1s' }}>
                  <span className="text-emerald-400">nick@dev</span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-blue-400">~/portfolio</span>
                  <span className="text-zinc-400">$</span>
                  <span className={`inline-block w-2 h-4 ml-1 bg-emerald-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
