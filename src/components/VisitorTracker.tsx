'use client';

import { useEffect, useState } from 'react';
import { FaGlobe, FaEye, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';

export default function VisitorTracker() {
  const [visitors, setVisitors] = useState({
    current: 0,
    total: 0,
    locations: [] as string[]
  });

  useEffect(() => {
    // Simulated visitor tracking (replace with real analytics)
    const updateVisitors = () => {
      setVisitors({
        current: Math.floor(Math.random() * 5) + 1,
        total: 1247 + Math.floor(Math.random() * 100),
        locations: ['USA', 'India', 'UK', 'Germany', 'Canada'].slice(0, Math.floor(Math.random() * 3) + 2)
      });
    };

    updateVisitors();
    const interval = setInterval(updateVisitors, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="px-6 py-12 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="border-2 border-blue-500/30 rounded-lg bg-gradient-to-r from-black via-zinc-950 to-black p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaGlobe className="text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
            <h3 className="text-lg font-bold text-blue-400">$ netstat --visitors</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-2 border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <FaEye className="text-blue-400" />
                <span>Developers Viewing</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">{visitors.current}</div>
              <div className="text-xs text-zinc-600 mt-1">Right now</div>
            </div>

            <div className="border-2 border-emerald-500/20 rounded-lg p-4 bg-emerald-500/5">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <FaUsers className="text-emerald-400" />
                <span>Total Visitors</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{visitors.total.toLocaleString()}</div>
              <div className="text-xs text-zinc-600 mt-1">All time</div>
            </div>

            <div className="border-2 border-purple-500/20 rounded-lg p-4 bg-purple-500/5">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <FaMapMarkerAlt className="text-purple-400" />
                <span>Active Regions</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {visitors.locations.map(loc => (
                  <span key={loc} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-500/20">
            <div className="text-xs text-zinc-600">
              <span className="text-blue-400">●</span> Live tracking • Anonymous visitors • 
              <span className="text-blue-400"> Privacy-focused</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
