'use client';

import { useEffect, useState } from 'react';
import { FaCode, FaCodeBranch, FaCheckCircle, FaFire, FaStar, FaGithub, FaTrophy, FaAward } from 'react-icons/fa';

interface GitHubStats {
  totalCommits: number;
  pullRequests: number;
  issuesClosed: number;
  currentStreak: number;
  longestStreak: number;
  totalStars: number;
  totalForks: number;
  publicRepos: number;
  languages: { [key: string]: number };
}

export default function EnhancedGitHubStats() {
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

        // Fetch events
        const eventsRes = await fetch(
          'https://api.github.com/users/TrendySloth1001/events?per_page=100',
          { headers }
        );
        const events = eventsRes.ok ? await eventsRes.json() : [];

        // Fetch repos
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

        // Count languages and repo stats
        const languages: { [key: string]: number } = {};
        let totalStars = 0;
        let totalForks = 0;

        repos.forEach((repo: any) => {
          if (!repo.fork) {
            if (repo.language) {
              languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
          }
        });

        setStats({
          totalCommits: commitsThisYear,
          pullRequests: prEvents.length,
          issuesClosed: issueEvents.length,
          currentStreak,
          longestStreak,
          totalStars,
          totalForks,
          publicRepos: repos.filter((r: any) => !r.fork).length,
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
            <div className="text-emerald-400 animate-pulse">Loading statistics...</div>
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
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border-2 border-emerald-500/30 rounded-lg mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-emerald-400">
              GitHub Statistics
            </h2>
          </div>
          <p className="text-zinc-400 text-lg">Contributions, achievements, and coding activity</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Commits Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-6 hover:border-emerald-500/60 transition-all hover:scale-105 duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <FaCode className="text-emerald-400 text-2xl" />
                </div>
                <FaAward className="text-emerald-400/30 text-xl" />
              </div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">{stats.totalCommits.toLocaleString()}</div>
              <div className="text-zinc-500 text-sm font-medium">Total Commits</div>
              <div className="text-zinc-600 text-xs mt-1">This year</div>
            </div>
          </div>

          {/* Pull Requests Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/0 rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative border-2 border-blue-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-6 hover:border-blue-500/60 transition-all hover:scale-105 duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <FaCodeBranch className="text-blue-400 text-2xl" />
                </div>
                <FaStar className="text-blue-400/30 text-xl" />
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.pullRequests}</div>
              <div className="text-zinc-500 text-sm font-medium">Pull Requests</div>
              <div className="text-zinc-600 text-xs mt-1">Contributed</div>
            </div>
          </div>

          {/* Issues Closed Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-500/0 rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative border-2 border-purple-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-6 hover:border-purple-500/60 transition-all hover:scale-105 duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <FaCheckCircle className="text-purple-400 text-2xl" />
                </div>
                <FaTrophy className="text-purple-400/30 text-xl" />
              </div>
              <div className="text-4xl font-bold text-purple-400 mb-2">{stats.issuesClosed}</div>
              <div className="text-zinc-500 text-sm font-medium">Issues Closed</div>
              <div className="text-zinc-600 text-xs mt-1">Resolved</div>
            </div>
          </div>

          {/* Current Streak Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-500/0 rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative border-2 border-orange-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-6 hover:border-orange-500/60 transition-all hover:scale-105 duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30">
                  <FaFire className="text-orange-400 text-2xl" />
                </div>
                <FaFire className="text-orange-400/30 text-xl" />
              </div>
              <div className="text-4xl font-bold text-orange-400 mb-2">{stats.currentStreak}</div>
              <div className="text-zinc-500 text-sm font-medium">Day Streak</div>
              <div className="text-zinc-600 text-xs mt-1">Best: {stats.longestStreak} days</div>
            </div>
          </div>
        </div>

        {/* Repository Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="border-2 border-yellow-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-yellow-500/50 transition">
            <div className="flex items-center gap-3 mb-2">
              <FaStar className="text-yellow-400 text-xl" />
              <span className="text-zinc-400 text-sm font-medium">Total Stars</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.totalStars}</div>
          </div>

          <div className="border-2 border-cyan-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-cyan-500/50 transition">
            <div className="flex items-center gap-3 mb-2">
              <FaCodeBranch className="text-cyan-400 text-xl" />
              <span className="text-zinc-400 text-sm font-medium">Total Forks</span>
            </div>
            <div className="text-3xl font-bold text-cyan-400">{stats.totalForks}</div>
          </div>

          <div className="border-2 border-pink-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-pink-500/50 transition">
            <div className="flex items-center gap-3 mb-2">
              <FaGithub className="text-pink-400 text-xl" />
              <span className="text-zinc-400 text-sm font-medium">Public Repos</span>
            </div>
            <div className="text-3xl font-bold text-pink-400">{stats.publicRepos}</div>
          </div>
        </div>

        {/* Top Languages */}
        <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-8">
          <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
            <FaCode />
            Most Used Languages
          </h3>
          <div className="space-y-4">
            {topLanguages.map(([lang, count], index) => {
              const percentage = (count / maxLangCount) * 100;
              const colors = [
                'from-emerald-500 to-green-500',
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-orange-500 to-yellow-500',
                'from-red-500 to-rose-500'
              ];

              return (
                <div key={lang} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">{lang}</span>
                    <span className="text-zinc-500 text-sm">{count} repos</span>
                  </div>
                  <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-full bg-gradient-to-r ${colors[index]} transition-all duration-1000 ease-out shadow-lg`}
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
