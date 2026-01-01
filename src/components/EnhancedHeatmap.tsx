'use client';

import { useEffect, useState } from 'react';
import { FaFire, FaCalendar } from 'react-icons/fa';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export default function EnhancedHeatmap() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [data, setData] = useState<ContributionDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0,
    averagePerDay: 0,
    bestDay: { date: '', count: 0 }
  });

  const years = [2026, 2025, 2024, 2023];

  useEffect(() => {
    fetchContributions(selectedYear);
  }, [selectedYear]);

  const fetchContributions = async (year: number) => {
    setLoading(true);
    try {
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch events for the selected year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      const contributions: ContributionDay[] = [];

      // Create all days for the year
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        contributions.push({
          date: new Date(d).toISOString().split('T')[0],
          count: 0,
          level: 0
        });
      }

      // Fetch user events - all public activity
      let page = 1;
      let hasMore = true;
      const commitsByDate: { [key: string]: number } = {};

      // Fetch all events for the year (up to 30 pages)
      while (hasMore && page <= 30) {
        const response = await fetch(
          `https://api.github.com/users/TrendySloth1001/events?per_page=100&page=${page}`,
          { headers }
        );

        if (!response.ok) break;

        const events = await response.json();
        if (events.length === 0) {
          hasMore = false;
          break;
        }

        events.forEach((event: any) => {
          const eventDate = new Date(event.created_at);
          if (eventDate.getFullYear() === year) {
            const dateKey = eventDate.toISOString().split('T')[0];
            
            if (event.type === 'PushEvent') {
              const commits = event.payload.commits?.length || 0;
              commitsByDate[dateKey] = (commitsByDate[dateKey] || 0) + commits;
            } else if (['PullRequestEvent', 'IssuesEvent', 'CreateEvent', 'PullRequestReviewEvent'].includes(event.type)) {
              commitsByDate[dateKey] = (commitsByDate[dateKey] || 0) + 1;
            }
          }
        });

        page++;
      }

      // Also try to fetch from GitHub search API for more comprehensive data
      try {
        const searchResponse = await fetch(
          `https://api.github.com/search/commits?q=author:TrendySloth1001+committer-date:${year}-01-01..${year}-12-31&per_page=100`,
          { 
            headers: {
              ...headers,
              'Accept': 'application/vnd.github.cloak-preview'
            }
          }
        );
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          searchData.items?.forEach((commit: any) => {
            const commitDate = new Date(commit.commit.committer.date);
            const dateKey = commitDate.toISOString().split('T')[0];
            if (!commitsByDate[dateKey]) {
              commitsByDate[dateKey] = 1;
            }
          });
        }
      } catch (e) {
        console.log('Search API not available, using events only');
      }

      // Update contributions with actual data
      contributions.forEach(day => {
        const count = commitsByDate[day.date] || 0;
        day.count = count;
        day.level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      });

      setData(contributions);
      calculateStats(contributions);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contributions: ContributionDay[]) => {
    const total = contributions.reduce((sum, day) => sum + day.count, 0);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = contributions.length - 1; i >= 0; i--) {
      if (contributions[i].count > 0) {
        tempStreak++;
        if (i === contributions.length - 1 || currentStreak === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak > 0 && i < contributions.length - 1) {
          tempStreak = 0;
        } else {
          tempStreak = 0;
        }
      }
    }

    const bestDay = contributions.reduce((max, day) => 
      day.count > max.count ? day : max, { date: '', count: 0, level: 0 as 0 }
    );

    setStats({
      totalContributions: total,
      currentStreak,
      longestStreak,
      averagePerDay: total > 0 ? Math.round((total / contributions.filter(d => d.count > 0).length) * 10) / 10 : 0,
      bestDay: { date: bestDay.date, count: bestDay.count }
    });
  };

  const getColor = (level: number, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-emerald-400 border-emerald-300 scale-125 shadow-lg shadow-emerald-500/50';
    }
    const colors = {
      0: 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:scale-110',
      1: 'bg-emerald-900/50 border-emerald-800/60 hover:border-emerald-700 hover:scale-110',
      2: 'bg-emerald-700/70 border-emerald-600/80 hover:border-emerald-500 hover:scale-110',
      3: 'bg-emerald-500/80 border-emerald-400/90 hover:border-emerald-300 hover:scale-110',
      4: 'bg-emerald-400 border-emerald-300 hover:border-emerald-200 hover:scale-110'
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  // Group data by weeks for better visualization
  const getWeeksData = () => {
    const weeks: ContributionDay[][] = [];
    let week: ContributionDay[] = [];
    // Add padding to start on Sunday
    const firstDay = new Date(data[0]?.date);
    const dayOfWeek = firstDay?.getDay() || 0;
    
    for (let i = 0; i < dayOfWeek; i++) {
      week.push({ date: '', count: 0, level: 0 });
    }

    data.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push([...week]);
        week = [];
      }
    });

    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ date: '', count: 0, level: 0 });
      }
      weeks.push(week);
    }

    return weeks;
  };

  const weeks = data.length > 0 ? getWeeksData() : [];

  return (
    <section className="px-6 py-20 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border-2 border-emerald-500/30 rounded-lg mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-emerald-400">
              Contribution Heatmap
            </h2>
          </div>
          <p className="text-zinc-400 text-lg">Daily coding activity visualization</p>
        </div>

        {/* Year Selector */}
        <div className="mb-8 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FaCalendar className="text-emerald-400" />
            <span className="text-zinc-400 font-semibold">Select Year:</span>
          </div>
          <div className="flex gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  selectedYear === year
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/50'
                    : 'bg-zinc-900 text-zinc-400 border-2 border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-4">
            <div className="text-xs text-zinc-500 mb-1">Total</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.totalContributions}</div>
            <div className="text-xs text-zinc-600">contributions</div>
          </div>
          <div className="border-2 border-orange-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-4">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <FaFire className="text-orange-400" /> Current
            </div>
            <div className="text-2xl font-bold text-orange-400">{stats.currentStreak}</div>
            <div className="text-xs text-zinc-600">day streak</div>
          </div>
          <div className="border-2 border-blue-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-4">
            <div className="text-xs text-zinc-500 mb-1">Longest</div>
            <div className="text-2xl font-bold text-blue-400">{stats.longestStreak}</div>
            <div className="text-xs text-zinc-600">day streak</div>
          </div>
          <div className="border-2 border-purple-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-4">
            <div className="text-xs text-zinc-500 mb-1">Average</div>
            <div className="text-2xl font-bold text-purple-400">{stats.averagePerDay}</div>
            <div className="text-xs text-zinc-600">per day</div>
          </div>
          <div className="border-2 border-yellow-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-4">
            <div className="text-xs text-zinc-500 mb-1">Best Day</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.bestDay.count}</div>
            <div className="text-xs text-zinc-600">contributions</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-emerald-400 animate-pulse">Loading {selectedYear} contributions...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 text-xs text-zinc-500 mr-2 justify-start pt-0">
                    <div className="h-3 text-[10px]">Sun</div>
                    <div className="h-3"></div>
                    <div className="h-3 text-[10px]">Tue</div>
                    <div className="h-3"></div>
                    <div className="h-3 text-[10px]">Thu</div>
                    <div className="h-3"></div>
                    <div className="h-3 text-[10px]">Sat</div>
                  </div>

                  {/* Heatmap grid */}
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            onClick={() => day.date && setSelectedDay(day)}
                            className={`w-3 h-3 rounded-sm border transition-all duration-200 cursor-pointer ${
                              day.date ? getColor(day.level, selectedDay?.date === day.date) : 'bg-transparent border-transparent'
                            }`}
                            title={day.date ? `${day.date}: ${day.count} contributions` : ''}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-sm border ${getColor(level, false)}`}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Details Card - Click to view */}
          {selectedDay && selectedDay.date && (
            <div className="mt-6 border-2 border-emerald-500/50 rounded-lg bg-gradient-to-br from-emerald-500/10 via-black to-black p-6 relative">
              <button
                onClick={() => setSelectedDay(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition"
              >
                ✕
              </button>
              
              <div className="space-y-4">
                {/* Date Header */}
                <div>
                  <div className="text-sm text-zinc-500 mb-1">Selected Date</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {new Date(selectedDay.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Contribution Count */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-2 border-emerald-500/30 rounded-lg p-4 bg-black/50">
                    <div className="text-xs text-zinc-500 mb-1">Contributions</div>
                    <div className="text-3xl font-bold text-emerald-400">{selectedDay.count}</div>
                  </div>
                  
                  <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-black/50">
                    <div className="text-xs text-zinc-500 mb-1">Activity Level</div>
                    <div className="text-3xl font-bold text-blue-400">{selectedDay.level}</div>
                    <div className="text-[10px] text-zinc-600">out of 4</div>
                  </div>

                  <div className="border-2 border-purple-500/30 rounded-lg p-4 bg-black/50">
                    <div className="text-xs text-zinc-500 mb-1">Day Type</div>
                    <div className="text-sm font-bold text-purple-400 mt-2">
                      {new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                </div>

                {/* Intensity Bars */}
                <div>
                  <div className="text-xs text-zinc-500 mb-2">Contribution Intensity</div>
                  <div className="flex gap-2 items-center">
                    {[0, 1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`h-8 flex-1 rounded border-2 transition ${
                          level <= selectedDay.level
                            ? 'border-emerald-400 bg-emerald-500/50'
                            : 'border-zinc-800 bg-zinc-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
