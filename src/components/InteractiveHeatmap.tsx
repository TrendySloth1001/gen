'use client';

import { useEffect, useState } from 'react';
import { FaGithub, FaFire, FaStar, FaCode } from 'react-icons/fa';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface MonthData {
  name: string;
  weeks: ContributionDay[][];
}

export default function InteractiveHeatmap() {
  const [data, setData] = useState<ContributionDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [stats, setStats] = useState({
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0,
    averagePerDay: 0,
    mostActiveDay: '',
    mostActiveCount: 0
  });
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      // Fetch contribution data from GitHub
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/TrendySloth1001?y=last`
      );
      const result = await response.json();
      
      // Process the data
      const contributions: ContributionDay[] = [];
      result.contributions.forEach((contrib: any) => {
        contributions.push({
          date: contrib.date,
          count: contrib.count,
          level: contrib.level
        });
      });
      
      setData(contributions);
      calculateStats(contributions);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
    }
  };

  const calculateStats = (contributions: ContributionDay[]) => {
    const total = contributions.reduce((sum, day) => sum + day.count, 0);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate streaks
    for (let i = contributions.length - 1; i >= 0; i--) {
      if (contributions[i].count > 0) {
        tempStreak++;
        if (i === contributions.length - 1 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak === 0) tempStreak = 0;
      }
    }
    
    // Find most active day
    const mostActive = contributions.reduce((max, day) => 
      day.count > max.count ? day : max
    , { date: '', count: 0, level: 0 as 0 });
    
    setStats({
      totalContributions: total,
      currentStreak,
      longestStreak,
      averagePerDay: Math.round(total / contributions.length * 10) / 10,
      mostActiveDay: new Date(mostActive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mostActiveCount: mostActive.count
    });
  };

  const getColor = (level: number) => {
    const colors = {
      0: 'bg-zinc-900 border-zinc-800',
      1: 'bg-emerald-900/40 border-emerald-800/50',
      2: 'bg-emerald-700/60 border-emerald-600/70',
      3: 'bg-emerald-500/70 border-emerald-400/80',
      4: 'bg-emerald-400 border-emerald-300'
    };
    return colors[level as keyof typeof colors];
  };

  const getGlowColor = (level: number) => {
    const glows = {
      0: '',
      1: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      2: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
      3: 'shadow-[0_0_20px_rgba(16,185,129,0.7)]',
      4: 'shadow-[0_0_25px_rgba(16,185,129,0.9)]'
    };
    return glows[level as keyof typeof glows];
  };

  const filterData = (day: ContributionDay) => {
    if (filter === 'all') return true;
    if (filter === 'high') return day.level >= 3;
    if (filter === 'medium') return day.level === 2;
    if (filter === 'low') return day.level === 1;
    return true;
  };

  const organizeByWeeks = () => {
    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];
    
    data.forEach((day, idx) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = organizeByWeeks();
  const displayDay = hoveredDay || selectedDay;

  return (
    <section className="px-6 py-20 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-emerald-400 mb-2 flex items-center gap-3">
              <FaFire className="text-orange-500" />
              $ git activity --year=2025
            </h2>
            <p className="text-zinc-500">Interactive contribution heatmap with real-time insights</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setAnimate(!animate)}
              className={`px-4 py-2 rounded border-2 transition-all ${
                animate 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500'
              }`}
            >
              {animate ? '⚡ Live' : '💤 Static'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/60 border-2 border-emerald-500/30 rounded-lg p-4 hover:border-emerald-500/50 transition-all">
            <div className="text-3xl font-bold text-emerald-400">{stats.totalContributions}</div>
            <div className="text-xs text-zinc-500 mt-1">Total Contributions</div>
          </div>
          <div className="bg-black/60 border-2 border-blue-500/30 rounded-lg p-4 hover:border-blue-500/50 transition-all">
            <div className="text-3xl font-bold text-blue-400">{stats.currentStreak}</div>
            <div className="text-xs text-zinc-500 mt-1">Current Streak 🔥</div>
          </div>
          <div className="bg-black/60 border-2 border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition-all">
            <div className="text-3xl font-bold text-purple-400">{stats.longestStreak}</div>
            <div className="text-xs text-zinc-500 mt-1">Longest Streak 🏆</div>
          </div>
          <div className="bg-black/60 border-2 border-orange-500/30 rounded-lg p-4 hover:border-orange-500/50 transition-all">
            <div className="text-3xl font-bold text-orange-400">{stats.averagePerDay}</div>
            <div className="text-xs text-zinc-500 mt-1">Average Per Day</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-zinc-500 text-sm">Filter:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded border-2 transition-all text-sm ${
                filter === f
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Heatmap */}
        <div className="bg-black/80 border-2 border-emerald-500/30 rounded-lg p-6 backdrop-blur-sm overflow-x-auto">
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => {
                  const isFiltered = filterData(day);
                  const isHovered = hoveredDay?.date === day.date;
                  const isSelected = selectedDay?.date === day.date;
                  
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`
                        w-3 h-3 rounded-sm border transition-all duration-200
                        ${getColor(day.level)}
                        ${isHovered || isSelected ? getGlowColor(day.level) : ''}
                        ${isHovered ? 'scale-150 z-10' : ''}
                        ${isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-black scale-125' : ''}
                        ${!isFiltered ? 'opacity-20' : ''}
                        ${animate && day.count > 0 ? 'animate-pulse' : ''}
                      `}
                      style={{
                        animationDelay: `${(weekIdx * 7 + dayIdx) * 20}ms`,
                        animationDuration: day.count > 0 ? `${2000 + day.count * 100}ms` : '2000ms'
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Day Labels */}
          <div className="flex gap-1 mt-3 text-[10px] text-zinc-600">
            <div className="w-3">Mon</div>
            <div className="w-3"></div>
            <div className="w-3">Wed</div>
            <div className="w-3"></div>
            <div className="w-3">Fri</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-4 h-4 rounded-sm border ${getColor(level)}`}
              />
            ))}
            <span>More</span>
          </div>
          
          <a
            href="https://github.com/TrendySloth1001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition text-sm"
          >
            <FaGithub />
            View on GitHub →
          </a>
        </div>

        {/* Selected Day Details */}
        {displayDay && (
          <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold text-emerald-400 mb-2">
                  {new Date(displayDay.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaCode className="text-emerald-500" />
                    <span className="text-zinc-300">
                      {displayDay.count} {displayDay.count === 1 ? 'contribution' : 'contributions'}
                    </span>
                  </div>
                  {displayDay.count > 10 && (
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span className="text-zinc-300">High Activity Day!</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`text-6xl font-bold ${getColor(displayDay.level)} px-6 py-3 rounded-lg border-2`}>
                {displayDay.count}
              </div>
            </div>
            
            {/* Activity Bar */}
            <div className="mt-4 h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min((displayDay.count / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Best Day Highlight */}
        {stats.mostActiveDay && (
          <div className="mt-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500 mb-1">🏆 Most Productive Day</div>
                <div className="text-lg font-bold text-orange-400">{stats.mostActiveDay}</div>
              </div>
              <div className="text-4xl font-bold text-orange-400">{stats.mostActiveCount}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
