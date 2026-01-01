'use client';

import { useEffect, useState } from 'react';
import { FaBolt, FaStar, FaCodeBranch, FaExclamationCircle } from 'react-icons/fa';

interface LiveEvent {
  type: 'commit' | 'star' | 'pr' | 'issue';
  repo: string;
  time: string;
  message: string;
}

export default function GitHubLiveFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveEvents() {
      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          'https://api.github.com/users/TrendySloth1001/events?per_page=10',
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          const liveEvents: LiveEvent[] = data.map((event: any) => {
            const time = new Date(event.created_at);
            const now = new Date();
            const diffMs = now.getTime() - time.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const timeStr = diffHours > 0 ? `${diffHours}h` : diffMins > 0 ? `${diffMins}m` : 'just now';

            switch (event.type) {
              case 'PushEvent':
                return {
                  type: 'commit' as const,
                  repo: event.repo.name.split('/')[1],
                  time: timeStr,
                  message: event.payload.commits?.[0]?.message || 'Pushed commits'
                };
              case 'WatchEvent':
                return {
                  type: 'star' as const,
                  repo: event.repo.name.split('/')[1],
                  time: timeStr,
                  message: 'Received a star'
                };
              case 'PullRequestEvent':
                return {
                  type: 'pr' as const,
                  repo: event.repo.name.split('/')[1],
                  time: timeStr,
                  message: event.payload.action + ' pull request'
                };
              case 'IssuesEvent':
                return {
                  type: 'issue' as const,
                  repo: event.repo.name.split('/')[1],
                  time: timeStr,
                  message: event.payload.action + ' issue'
                };
              default:
                return null;
            }
          }).filter(Boolean);

          setEvents(liveEvents);
        }
      } catch (error) {
        console.error('Failed to fetch live events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'commit': return <FaBolt className="text-emerald-400" />;
      case 'star': return <FaStar className="text-yellow-400" />;
      case 'pr': return <FaCodeBranch className="text-blue-400" />;
      case 'issue': return <FaExclamationCircle className="text-purple-400" />;
      default: return <FaBolt className="text-emerald-400" />;
    }
  };

  return (
    <section className="px-6 py-12 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-emerald-400">$ tail -f /var/log/github.log</h3>
          </div>

          {loading ? (
            <div className="text-zinc-500 text-sm">Loading live feed...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded border border-zinc-800 hover:border-emerald-500/30 transition"
                >
                  <div className="mt-0.5">{getIcon(event.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold">{event.repo}</span>
                      <span className="text-zinc-600 text-xs">• {event.time}</span>
                    </div>
                    <div className="text-zinc-400 text-sm truncate">{event.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-emerald-500/20">
            <div className="text-xs text-zinc-600">
              <span className="text-emerald-400">●</span> Real-time updates • Refreshes every 30s
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
