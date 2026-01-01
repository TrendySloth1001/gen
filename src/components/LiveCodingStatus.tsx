'use client';

import { useEffect, useState } from 'react';
import { FaCode, FaClock, FaGithub, FaFire } from 'react-icons/fa';

interface LiveStatus {
  currentLanguage: string;
  lastCommit: string;
  activeProject: string;
  linesWritten: number;
}

export default function LiveCodingStatus() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch recent events
        const response = await fetch(
          'https://api.github.com/users/TrendySloth1001/events?per_page=50',
          { headers }
        );

        if (response.ok) {
          const events = await response.json();
          const pushEvents = events.filter((e: any) => e.type === 'PushEvent');
          
          if (pushEvents.length > 0) {
            const lastPush = pushEvents[0];
            const lastCommitTime = new Date(lastPush.created_at);
            const now = new Date();
            const diffMs = now.getTime() - lastCommitTime.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            // Get repo details
            const repoResponse = await fetch(
              `https://api.github.com/repos/${lastPush.repo.name}`,
              { headers }
            );
            const repo = repoResponse.ok ? await repoResponse.json() : null;

            // Count lines from today
            const today = new Date().toDateString();
            const todayEvents = events.filter((e: any) => 
              e.type === 'PushEvent' && new Date(e.created_at).toDateString() === today
            );
            const linesCount = todayEvents.reduce((sum: number, e: any) => 
              sum + (e.payload.commits?.length || 0) * 50, 0
            ); // Estimate 50 lines per commit

            setStatus({
              currentLanguage: repo?.language || 'TypeScript',
              lastCommit: diffHours > 0 ? `${diffHours}h ago` : `${diffMins}m ago`,
              activeProject: lastPush.repo.name.split('/')[1],
              linesWritten: linesCount
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch live status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading || !status) return null;

  return (
    <section className="px-6 py-12 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-r from-black via-zinc-950 to-black p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-emerald-400">$ systemctl status developer.service</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <FaCode />
                <span>Currently Writing</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">{status.currentLanguage}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <FaClock />
                <span>Last Commit</span>
              </div>
              <div className="text-xl font-bold text-blue-400">{status.lastCommit}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <FaGithub />
                <span>Active Project</span>
              </div>
              <div className="text-xl font-bold text-purple-400 truncate">{status.activeProject}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <FaFire />
                <span>Lines Today</span>
              </div>
              <div className="text-xl font-bold text-orange-400">{status.linesWritten}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/20">
            <div className="text-xs text-zinc-600">
              <span className="text-emerald-400">●</span> Active • Updates every 60s • 
              <span className="text-emerald-400"> Status: Coding</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
