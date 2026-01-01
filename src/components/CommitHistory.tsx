'use client';

import { useEffect, useState } from 'react';
import { FaCodeBranch, FaStar, FaCode, FaGithub, FaCircle, FaCodepen } from 'react-icons/fa';

interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

export default function CommitHistory() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllActivity() {
      try {
        // Fetch multiple pages to get comprehensive activity
        const pages = [1, 2, 3]; // Get 300 events total
        const promises = pages.map(page => 
          fetch(`https://api.github.com/users/TrendySloth1001/events?per_page=100&page=${page}`)
            .then(res => res.ok ? res.json() : [])
        );
        
        const results = await Promise.all(promises);
        const allEvents = results.flat();
        
        setEvents(allEvents.slice(0, 50)); // Show most recent 50 activities
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllActivity();
  }, []);

  function getEventIcon(type: string) {
    switch (type) {
      case 'PushEvent':
        return <FaCode className="text-blue-400" />;
      case 'CreateEvent':
        return <FaCodeBranch className="text-green-400" />;
      case 'WatchEvent':
        return <FaStar className="text-yellow-400" />;
      case 'ForkEvent':
        return <FaCodepen className="text-purple-400" />;
      case 'PullRequestEvent':
        return <FaCodeBranch className="text-pink-400" />;
      case 'IssuesEvent':
        return <FaCircle className="text-red-400" />;
      default:
        return <FaGithub className="text-emerald-400" />;
    }
  }

  function getEventDescription(event: GitHubEvent) {
    const repoName = event.repo.name;
    const [owner, repo] = repoName.split('/');
    
    switch (event.type) {
      case 'PushEvent':
        const branch = event.payload.ref?.replace('refs/heads/', '') || 'main';
        const commits = event.payload.commits || [];
        const commitCount = commits.length;
        const firstCommit = commits[0]?.message?.split('\n')[0] || '';
        return {
          main: `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to`,
          branch: branch,
          repo: repo,
          detail: firstCommit ? `"${firstCommit.substring(0, 60)}${firstCommit.length > 60 ? '...' : ''}"` : null
        };
      case 'CreateEvent':
        const refType = event.payload.ref_type;
        const refName = event.payload.ref || '';
        return {
          main: `Created ${refType}`,
          branch: refName || refType,
          repo: repo,
          detail: refType === 'repository' ? 'New repository' : null
        };
      case 'WatchEvent':
        return {
          main: 'Starred',
          branch: null,
          repo: repo,
          detail: event.payload.action === 'started' ? '⭐' : null
        };
      case 'ForkEvent':
        return {
          main: 'Forked',
          branch: null,
          repo: repo,
          detail: `to ${event.payload.forkee?.full_name || 'repository'}`
        };
      case 'PullRequestEvent':
        const prTitle = event.payload.pull_request?.title || '';
        const prNumber = event.payload.pull_request?.number || '';
        return {
          main: `${event.payload.action?.charAt(0).toUpperCase() + event.payload.action?.slice(1) || 'Updated'} pull request`,
          branch: `#${prNumber}`,
          repo: repo,
          detail: prTitle ? `"${prTitle.substring(0, 60)}${prTitle.length > 60 ? '...' : ''}"` : null
        };
      case 'IssuesEvent':
        const issueTitle = event.payload.issue?.title || '';
        const issueNumber = event.payload.issue?.number || '';
        return {
          main: `${event.payload.action?.charAt(0).toUpperCase() + event.payload.action?.slice(1) || 'Updated'} issue`,
          branch: `#${issueNumber}`,
          repo: repo,
          detail: issueTitle ? `"${issueTitle.substring(0, 60)}${issueTitle.length > 60 ? '...' : ''}"` : null
        };
      case 'PullRequestReviewEvent':
        return {
          main: 'Reviewed pull request',
          branch: `#${event.payload.pull_request?.number || ''}`,
          repo: repo,
          detail: event.payload.review?.state || null
        };
      case 'IssueCommentEvent':
        return {
          main: 'Commented on issue',
          branch: `#${event.payload.issue?.number || ''}`,
          repo: repo,
          detail: event.payload.comment?.body?.substring(0, 50) || null
        };
      default:
        return {
          main: event.type.replace('Event', ''),
          branch: null,
          repo: repo,
          detail: null
        };
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Recent Activity
          </h2>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No recent activity found</p>
          ) : (
            events.map((event) => {
              const desc = getEventDescription(event);
              const timeAgo = (() => {
                const now = new Date();
                const eventTime = new Date(event.created_at);
                const diff = Math.floor((now.getTime() - eventTime.getTime()) / 1000);
                if (diff < 60) return `${diff}s ago`;
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
                return eventTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              })();
              
              return (
                <a
                  key={event.id}
                  href={`https://github.com/${event.repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block bg-zinc-950/80 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-5 hover:border-emerald-500/40 hover:bg-zinc-900/60 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-xl flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-baseline flex-wrap gap-1.5">
                        <span className="text-zinc-300 font-medium">{desc.main}</span>
                        {desc.branch && (
                          <code className="px-2 py-0.5 text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                            {desc.branch}
                          </code>
                        )}
                        <span className="text-zinc-500">in</span>
                        <span className="text-emerald-400 font-mono text-sm hover:underline">
                          {event.repo.name}
                        </span>
                      </div>
                      {desc.detail && (
                        <p className="text-sm text-zinc-500 font-mono leading-relaxed">
                          {desc.detail}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-zinc-600">
                        <span className="font-mono">{timeAgo}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="group-hover:text-emerald-500 transition-colors">{event.type.replace('Event', '')}</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
