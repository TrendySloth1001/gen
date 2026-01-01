'use client';

import { useEffect, useState } from 'react';
import { FaCode, FaCodeBranch, FaCheckCircle, FaFire, FaChartBar } from 'react-icons/fa';

interface GitHubStats {
  totalCommits: number;
  pullRequests: number;
  issuesClosed: number;
  currentStreak: number;
  longestStreak: number;
  languages: { [key: string]: number };
}

export default function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch events to calculate commits and streaks
        const eventsRes = await fetch(
          'https://api.github.com/users/TrendySloth1001/events?per_page=100',
          { headers }
        );
        const events = eventsRes.ok ? await eventsRes.json() : [];

        // Fetch repos for language stats
        const reposRes = await fetch(
          'https://api.github.com/users/TrendySloth1001/repos?per_page=100',
          { headers }
        );
        const repos = reposRes.ok ? await reposRes.json() : [];

        // Calculate stats
        const pushEvents = events.filter((e: any) => e.type === 'PushEvent');
        const prEvents = events.filter((e: any) => e.type === 'PullRequestEvent');
        const issueEvents = events.filter((e: any) => 
          e.type === 'IssuesEvent' && e.payload.action === 'closed'
        );

        // Count commits from this year
        const thisYear = new Date().getFullYear();
        const commitsThisYear = pushEvents
          .filter((e: any) => new Date(e.created_at).getFullYear() === thisYear)
          .reduce((total: number, e: any) => total + (e.payload.commits?.length || 0), 0);

        // Calculate streaks
        const dates = events
          .map((e: any) => new Date(e.created_at).toDateString())
          .filter((date: string, index: number, arr: string[]) => arr.indexOf(date) === index)
          .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let prevDate: Date | null = null;

        dates.forEach((dateStr: string, index: number) => {
          const date = new Date(dateStr);
          if (index === 0) {
            const today = new Date();
            const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 1) currentStreak = 1;
          }

          if (prevDate) {
            const daysDiff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
              tempStreak++;
              if (index <= currentStreak) currentStreak = tempStreak + 1;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak + 1);
              tempStreak = 0;
            }
          }
          prevDate = date;
        });
        longestStreak = Math.max(longestStreak, tempStreak + 1, currentStreak);

        // Count languages
        const languages: { [key: string]: number } = {};
        repos.forEach((repo: any) => {
          if (repo.language && !repo.fork) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });

        setStats({
          totalCommits: commitsThisYear,
          pullRequests: prEvents.length,
          issuesClosed: issueEvents.length,
          currentStreak,
          longestStreak,
          languages,
        });
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="px-6 py-20 font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="border-2 border-emerald-500/30 rounded-lg bg-black/80 backdrop-blur-sm p-8">
            <div className="text-emerald-400 animate-pulse">$ gh stats --year=2026</div>
          </div>
        </div>
      </section>
    );
  }

  if (!stats) return null;

  const topLanguages = Object.entries(stats.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxLangCount = topLanguages[0]?.[1] || 1;

  return (
    <section className="px-6 py-20 font-mono" id="stats">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border-2 border-emerald-500/30 rounded-lg mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-emerald-400">
              GitHub Statistics
            </h2>
          </div>
          <p className="text-zinc-400 text-lg">Contributions and coding activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Commits */}
          <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-emerald-500/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <FaCode className="text-emerald-400 text-xl" />
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">{stats.totalCommits}</div>
                <div className="text-xs text-zinc-500">Commits (2026)</div>
              </div>
            </div>
          </div>

          {/* Pull Requests */}
          <div className="border-2 border-blue-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-blue-500/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FaCodeBranch className="text-blue-400 text-xl" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">{stats.pullRequests}</div>
                <div className="text-xs text-zinc-500">Pull Requests</div>
              </div>
            </div>
          </div>

          {/* Issues Closed */}
          <div className="border-2 border-purple-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-purple-500/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <FaCheckCircle className="text-purple-400 text-xl" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">{stats.issuesClosed}</div>
                <div className="text-xs text-zinc-500">Issues Closed</div>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="border-2 border-orange-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-orange-500/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <FaFire className="text-orange-400 text-xl" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">{stats.currentStreak}</div>
                <div className="text-xs text-zinc-500">Day Streak</div>
                {stats.longestStreak > stats.currentStreak && (
                  <div className="text-[10px] text-zinc-600">Best: {stats.longestStreak}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Languages */}
        <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-8">
          <div className="flex items-center gap-2 mb-6">
            <FaChartBar className="text-emerald-400" />
            <h3 className="text-xl font-bold text-emerald-400">$ languages --top=5</h3>
          </div>
          <div className="space-y-4">
            {topLanguages.map(([lang, count]) => {
              const percentage = (count / maxLangCount) * 100;
              return (
                <div key={lang}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300 font-medium">{lang}</span>
                    <span className="text-zinc-500 text-sm">{count} repos</span>
                  </div>
                  <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
