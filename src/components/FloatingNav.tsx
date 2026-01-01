'use client';

import { useState, useEffect } from 'react';
import { FaHome, FaCode, FaChartBar, FaGithub, FaBook, FaBars, FaTimes, FaRocket } from 'react-icons/fa';import ThemeToggle from './ThemeToggle';
export default function FloatingNav() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      // Minimize after scrolling one viewport height
      setIsMinimized(window.scrollY > window.innerHeight);
    };

    const handleSectionIntersection = () => {
      const sections = ['home', 'skills', 'stats', 'activity', 'projects', 'blog'];
      let current = 'home';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = section;
            break;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleSectionIntersection);
    handleScroll();
    handleSectionIntersection();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleSectionIntersection);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsExpanded(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'skills', label: 'Skills', icon: FaCode },
    { id: 'stats', label: 'Stats', icon: FaChartBar },
    { id: 'activity', label: 'Activity', icon: FaGithub },
    { id: 'projects', label: 'Projects', icon: FaRocket },
    { id: 'blog', label: 'Blog', icon: FaBook },
  ];

  // Full navbar at top
  if (!isMinimized) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b-2 border-emerald-500/30 font-mono">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-bold">$ whoami</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded transition ${
                    activeSection === item.id
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/5'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden text-emerald-400 p-2 hover:bg-emerald-500/10 rounded transition"
            >
              {isExpanded ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isExpanded && (
            <div className="md:hidden mt-4 space-y-2 border-t-2 border-emerald-500/30 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${
                    activeSection === item.id
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/5'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Minimized floating button
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/50 flex items-center justify-center text-white hover:scale-110 transition-transform border-2 border-emerald-400/50"
      >
        {isExpanded ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Expanded Menu */}
      {isExpanded && (
        <div className="fixed bottom-24 right-8 z-50 bg-black/95 backdrop-blur-md border-2 border-emerald-500/50 rounded-lg shadow-xl shadow-emerald-500/20 font-mono overflow-hidden animate-in slide-in-from-bottom-2">
          <div className="p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                  activeSection === item.id
                    ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/50'
                    : 'text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="border-t-2 border-emerald-500/30 p-2">
            <a
              href="https://github.com/TrendySloth1001"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
            >
              <FaGithub size={18} />
              <span className="font-medium">GitHub Profile</span>
            </a>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        />
      )}
    </>
  );
}
