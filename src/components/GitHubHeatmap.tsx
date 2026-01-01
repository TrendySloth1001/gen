'use client';

import { GitHubCalendar } from 'react-github-calendar';

export default function GitHubHeatmap() {
  return (
    <section className="px-6 py-20 font-mono" id="activity">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">
            $ git log --graph --all
          </h2>
          <p className="text-zinc-500">Contribution activity over the past year • Hover for details</p>
        </div>

        <div className="border-2 border-emerald-500/30 rounded-lg bg-black/80 backdrop-blur-sm p-6 sm:p-8 overflow-x-auto hover:border-emerald-500/50 transition-colors">
          <GitHubCalendar
            username="TrendySloth1001"
            colorScheme="dark"
            theme={{
              dark: ['#0a0a0a', '#0d3d2a', '#158558', '#1fb87f', '#2de0a8'],
            }}
            blockSize={14}
            blockMargin={5}
            fontSize={14}
            showWeekdayLabels
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0d3d2a] rounded"></div>
            <span>Less</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#158558] rounded"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#1fb87f] rounded"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#2de0a8] rounded"></div>
            <span>Very Active</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://github.com/TrendySloth1001"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition font-mono text-sm"
          >
            → View full profile on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
