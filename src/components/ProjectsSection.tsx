'use client';

import { useState } from 'react';
import { FaTerminal, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ProjectsGrid from './ProjectsGrid';
import ProjectSearch from './ProjectSearch';

export default function ProjectsSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="px-6 py-20 font-mono" id="projects">
      <div className="max-w-7xl mx-auto">
        {/* Top 6 Projects */}
        <ProjectsGrid />

        {/* Expandable All Projects Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group relative"
          >
            <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-r from-black via-zinc-950 to-black p-6 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="flex items-center gap-4">
                <FaTerminal className="text-emerald-400 text-2xl" />
                <div className="text-left">
                  <div className="text-emerald-400 font-bold text-lg mb-1">
                    $ cat projects.json
                  </div>
                  <div className="text-zinc-500 text-sm">
                    {isExpanded ? 'Hide' : 'View'} all repositories with search & filters
                  </div>
                </div>
                <div className="ml-8">
                  {isExpanded ? (
                    <FaChevronUp className="text-emerald-400 text-xl animate-bounce" />
                  ) : (
                    <FaChevronDown className="text-emerald-400 text-xl animate-bounce" />
                  )}
                </div>
              </div>
            </div>

            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 blur transition-opacity -z-10"></div>
          </button>
        </div>

        {/* Expandable Project Search Section */}
        {isExpanded && (
          <div className="mt-8 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-8">
              <ProjectSearch />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
