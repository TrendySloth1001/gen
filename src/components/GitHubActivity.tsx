'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaCodeBranch, FaStar, FaCode, FaGithub, FaCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdAdd, MdRemove, MdCallSplit } from 'react-icons/md';

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

interface FileDiff {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

interface CommitDetails {
  files: FileDiff[];
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
}

export default function GitHubActivity() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [commitDetails, setCommitDetails] = useState<Map<string, CommitDetails>>(new Map());
  const [loadingDiffs, setLoadingDiffs] = useState<Set<string>>(new Set());
  const [showCount, setShowCount] = useState(6);
  const [error, setError] = useState<string | null>(null);

  // Define fetchCommitDiff first
  const fetchCommitDiff = useCallback(async (eventId: string, owner: string, repo: string, commitSha: string) => {
    try {
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch commit');
      }
      
      const data = await response.json();
      
      const details: CommitDetails = {
        files: data.files || [],
        stats: {
          total: data.files?.length || 0,
          additions: data.stats?.additions || 0,
          deletions: data.stats?.deletions || 0,
        }
      };
      
      setCommitDetails(prev => new Map(prev).set(eventId, details));
    } catch (error) {
      console.error('Failed to fetch commit diff:', error);
      setCommitDetails(prev => new Map(prev).set(eventId, {
        files: [],
        stats: { total: 0, additions: 0, deletions: 0 }
      }));
    }
  }, []);

  // Then define fetchCommitDetails that uses fetchCommitDiff
  const fetchCommitDetails = useCallback(async (eventId: string, event: GitHubEvent) => {
    setLoadingDiffs(prev => new Set(prev).add(eventId));
    
    try {
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const [owner, repo] = event.repo.name.split('/');
      
      if (event.type === 'PushEvent') {
        const commits = event.payload.commits || [];
        
        if (commits.length === 0) {
          const branch = event.payload.ref?.replace('refs/heads/', '') || 'main';
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=1`,
            { headers }
          );
          
          if (commitsResponse.ok) {
            const recentCommits = await commitsResponse.json();
            if (recentCommits.length > 0) {
              const commitSha = recentCommits[0].sha;
              await fetchCommitDiff(eventId, owner, repo, commitSha);
              return;
            }
          }
          throw new Error('No commits found');
        }
        
        const commitSha = commits[0].sha;
        await fetchCommitDiff(eventId, owner, repo, commitSha);
      }
    } catch (error) {
      console.error('Failed to fetch commit details:', error);
      setCommitDetails(prev => new Map(prev).set(eventId, {
        files: [],
        stats: { total: 0, additions: 0, deletions: 0 }
      }));
    } finally {
      setLoadingDiffs(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  }, [fetchCommitDiff]);

  useEffect(() => {
    async function fetchAllActivity() {
      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const pages = [1, 2, 3];
        const promises = pages.map(page => 
          fetch(`https://api.github.com/users/TrendySloth1001/events?per_page=100&page=${page}`, {
            headers,
          })
            .then(async res => {
              if (res.status === 403) {
                console.warn('GitHub API rate limit exceeded');
                return [];
              }
              return res.ok ? res.json() : [];
            })
        );
        
        const results = await Promise.all(promises);
        const allEvents = results.flat();
        
        if (allEvents.length === 0) {
          setError('GitHub API rate limit exceeded. Please try again later or add a GitHub token.');
          setLoading(false);
          return;
        }
        
        setEvents(allEvents);
        const initialEvents = allEvents.slice(0, showCount);
        setDisplayedEvents(initialEvents);
        
        // Auto-fetch commit details for push events
        initialEvents.forEach(event => {
          if (event.type === 'PushEvent') {
            fetchCommitDetails(event.id, event);
          }
        });
      } catch (error) {
        console.error('Failed to fetch activity:', error);
        setError('Failed to load GitHub activity. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllActivity();
  }, [fetchCommitDetails]);

  const loadMore = () => {
    const newCount = showCount + 6;
    setShowCount(newCount);
    const newEvents = events.slice(0, newCount);
    setDisplayedEvents(newEvents);
    
    // Fetch details for newly loaded push events
    const previousCount = displayedEvents.length;
    newEvents.slice(previousCount).forEach(event => {
      if (event.type === 'PushEvent' && !commitDetails.has(event.id)) {
        fetchCommitDetails(event.id, event);
      }
    });
  };

  const toggleExpand = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    
    setExpandedEvents(newExpanded);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent': return <FaCode className="text-blue-400" />;
      case 'CreateEvent': return <FaCodeBranch className="text-green-400" />;
      case 'WatchEvent': return <FaStar className="text-yellow-400" />;
      case 'ForkEvent': return <MdCallSplit className="text-purple-400" />;
      case 'PullRequestEvent': return <FaCodeBranch className="text-pink-400" />;
      case 'IssuesEvent': return <FaCircle className="text-red-400" />;
      default: return <FaGithub className="text-emerald-400" />;
    }
  };

  const getEventDescription = (event: GitHubEvent) => {
    const [owner, repo] = event.repo.name.split('/');
    
    switch (event.type) {
      case 'PushEvent':
        const branch = event.payload.ref?.replace('refs/heads/', '') || 'main';
        const commits = event.payload.commits || [];
        const commitCount = commits.length;
        const firstCommit = commits[0]?.message?.split('\n')[0] || '';
        const size = event.payload.size || commitCount; // Use size if available
        return {
          action: 'Pushed',
          count: size > 0 ? `${size} commit${size !== 1 ? 's' : ''}` : 'commits',
          branch: branch,
          repo: repo,
          detail: firstCommit || (size > 0 ? `${size} commits to ${branch}` : 'Recent changes')
        };
      case 'CreateEvent':
        return {
          action: 'Created',
          count: event.payload.ref_type,
          branch: event.payload.ref || event.payload.ref_type,
          repo: repo,
          detail: null
        };
      case 'WatchEvent':
        return {
          action: 'Starred',
          count: null,
          branch: null,
          repo: repo,
          detail: '⭐'
        };
      case 'ForkEvent':
        return {
          action: 'Forked',
          count: null,
          branch: null,
          repo: repo,
          detail: `to ${event.payload.forkee?.full_name || 'repository'}`
        };
      case 'PullRequestEvent':
        return {
          action: event.payload.action?.charAt(0).toUpperCase() + event.payload.action?.slice(1),
          count: 'pull request',
          branch: `#${event.payload.pull_request?.number}`,
          repo: repo,
          detail: event.payload.pull_request?.title
        };
      case 'IssuesEvent':
        return {
          action: event.payload.action?.charAt(0).toUpperCase() + event.payload.action?.slice(1),
          count: 'issue',
          branch: `#${event.payload.issue?.number}`,
          repo: repo,
          detail: event.payload.issue?.title
        };
      default:
        return {
          action: event.type.replace('Event', ''),
          count: null,
          branch: null,
          repo: repo,
          detail: null
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const eventTime = new Date(dateString);
    const diff = Math.floor((now.getTime() - eventTime.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
    return eventTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      'ts': 'text-blue-400',
      'tsx': 'text-blue-400',
      'js': 'text-yellow-400',
      'jsx': 'text-yellow-400',
      'py': 'text-blue-500',
      'css': 'text-pink-400',
      'json': 'text-yellow-500',
      'md': 'text-gray-400',
    };
    return colors[ext || ''] || 'text-emerald-400';
  };

  const renderDiff = (patch: string, filename: string) => {
    const lines = patch.split('\n');
    const getLanguage = (fname: string) => {
      const ext = fname.split('.').pop()?.toLowerCase();
      return ext || 'text';
    };
    
    return lines.map((line, idx) => {
      // Handle tab spacing - convert tabs to 4 spaces
      const processedLine = line.replace(/\t/g, '    ');
      
      if (line.startsWith('+') && !line.startsWith('+++')) {
        // Addition line - blue background
        return (
          <div key={idx} className="flex font-mono text-xs leading-relaxed hover:bg-blue-500/10">
            <span className="text-blue-400 w-8 flex-shrink-0 text-center select-none bg-blue-500/5">+</span>
            <pre className="flex-1 text-blue-300 bg-blue-500/5 px-3 py-0.5 overflow-x-auto">
              <code>{processedLine.substring(1)}</code>
            </pre>
          </div>
        );
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        // Deletion line - red background
        return (
          <div key={idx} className="flex font-mono text-xs leading-relaxed hover:bg-red-500/10">
            <span className="text-red-400 w-8 flex-shrink-0 text-center select-none bg-red-500/5">-</span>
            <pre className="flex-1 text-red-300 bg-red-500/5 px-3 py-0.5 overflow-x-auto">
              <code>{processedLine.substring(1)}</code>
            </pre>
          </div>
        );
      } else if (line.startsWith('@@')) {
        // Diff section header - cyan
        return (
          <div key={idx} className="flex font-mono text-xs text-cyan-400 bg-cyan-500/10 py-1.5 border-y border-cyan-500/20">
            <span className="w-8 flex-shrink-0 text-center select-none">•</span>
            <pre className="flex-1 px-3">
              <code>{processedLine}</code>
            </pre>
          </div>
        );
      } else if (line.startsWith('+++') || line.startsWith('---')) {
        // File markers - gray
        return (
          <div key={idx} className="flex font-mono text-xs text-zinc-600 bg-zinc-900/30 py-0.5">
            <span className="w-8 flex-shrink-0"></span>
            <pre className="flex-1 px-3">
              <code>{processedLine}</code>
            </pre>
          </div>
        );
      } else if (line.trim()) {
        // Context line - normal
        return (
          <div key={idx} className="flex font-mono text-xs leading-relaxed hover:bg-zinc-800/30">
            <span className="text-zinc-600 w-8 flex-shrink-0 text-center select-none"> </span>
            <pre className="flex-1 text-zinc-400 px-3 py-0.5 overflow-x-auto">
              <code>{processedLine}</code>
            </pre>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <section className="px-6 py-20 font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="border-2 border-emerald-500/30 rounded-lg bg-black/80 backdrop-blur-sm p-8">
            <div className="text-emerald-400 mb-4 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
              $ gh api /users/TrendySloth1001/events --paginate
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 py-20 font-mono" id="activity">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">
              $ gh activity --user=TrendySloth1001
            </h2>
            <p className="text-zinc-500">Recent GitHub activity and contributions</p>
          </div>
          <div className="border-2 border-red-500/30 rounded-lg bg-black/80 backdrop-blur-sm p-8">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-xl text-red-400 mb-2">Rate Limit Exceeded</h3>
              <p className="text-zinc-400 mb-4">{error}</p>
              <div className="text-sm text-zinc-600 bg-zinc-900 border border-zinc-800 rounded p-4 text-left">
                <p className="mb-2"><strong className="text-zinc-400">GitHub API Limits:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>60 requests/hour without authentication</li>
                  <li>5,000 requests/hour with a GitHub token</li>
                </ul>
                <p className="mt-3 text-emerald-400">
                  💡 To increase limits, add a GitHub Personal Access Token to your .env.local file:
                </p>
                <code className="block mt-2 bg-black px-3 py-2 rounded text-emerald-500">
                  NEXT_PUBLIC_GITHUB_TOKEN=your_token_here
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-20 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-emerald-400 mb-2">
            $ git log --all --graph --decorate
          </h2>
          <p className="text-zinc-500">Recent development activity • {events.length} events tracked</p>
        </div>

        <div className="space-y-4">
          {displayedEvents.map((event) => {
            const desc = getEventDescription(event);
            const isExpanded = expandedEvents.has(event.id);
            const details = commitDetails.get(event.id);
            const isLoadingDiff = loadingDiffs.has(event.id);
            const canExpand = event.type === 'PushEvent';

            return (
              <div
                key={event.id}
                className="border-2 border-emerald-500/20 rounded-lg bg-black/80 backdrop-blur-sm hover:border-emerald-500/40 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-xl flex-shrink-0 mt-0.5">
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="text-zinc-300 font-medium">{desc.action}</span>
                            {desc.count && (
                              <span className="text-zinc-400">{desc.count}</span>
                            )}
                            {desc.branch && (
                              <code className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                {desc.branch}
                              </code>
                            )}
                            <span className="text-zinc-500">in</span>
                            <a
                              href={`https://github.com/${event.repo.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline"
                            >
                              {desc.repo}
                            </a>
                          </div>
                          
                          {desc.detail && (
                            <p className="text-sm text-zinc-500 mb-2">
                              {desc.detail}
                            </p>
                          )}

                          {/* Always show stats for push events */}
                          {event.type === 'PushEvent' && (
                            <div className="flex items-center gap-4 text-xs mt-2">
                              {isLoadingDiff ? (
                                <span className="flex items-center gap-2 text-zinc-600">
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-500 border-t-transparent"></div>
                                  Fetching changes...
                                </span>
                              ) : details ? (
                                <>
                                  <span className="flex items-center gap-1 text-zinc-400">
                                    <FaCode className="text-emerald-500" />
                                    {details.stats.total} {details.stats.total === 1 ? 'file' : 'files'}
                                  </span>
                                  <span className="flex items-center gap-1 text-blue-400">
                                    <MdAdd />
                                    {details.stats.additions}
                                  </span>
                                  <span className="flex items-center gap-1 text-red-400">
                                    <MdRemove />
                                    {details.stats.deletions}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-600">
                            {formatTimeAgo(event.created_at)}
                          </span>
                          {canExpand && (
                            <button
                              onClick={() => toggleExpand(event.id)}
                              className="text-emerald-400 hover:text-emerald-300 transition p-1"
                              title={isExpanded ? 'Collapse diff' : 'Expand diff'}
                            >
                              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/20">
                      {isLoadingDiff ? (
                        <div className="text-zinc-500 text-sm flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-500 border-t-transparent"></div>
                          Loading diff...
                        </div>
                      ) : details ? (
                        <div className="space-y-3">
                          {details.files.length > 0 ? (
                            details.files.map((file, idx) => (
                              <div
                                key={idx}
                                className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50"
                              >
                                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                                  <span className={`text-sm font-mono ${getFileIcon(file.filename)}`}>
                                    {file.filename}
                                  </span>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-green-400">+{file.additions}</span>
                                    <span className="text-red-400">-{file.deletions}</span>
                                  </div>
                                </div>
                                {file.patch && (
                                  <div className="overflow-hidden">
                                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar bg-black/40">
                                      {renderDiff(file.patch, file.filename)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-zinc-600 text-sm bg-zinc-950/30 border border-zinc-800 rounded p-4">
                              <p>No files changed in this commit or diff unavailable.</p>
                              <a
                                href={`https://github.com/${event.repo.name}/commit/${event.payload.commits?.[0]?.sha || event.payload.head}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline text-xs mt-2 inline-block"
                              >
                                → View on GitHub
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-zinc-600 text-sm bg-zinc-950/30 border border-zinc-800 rounded p-4">
                          <p>Unable to fetch commit details. This may be due to:</p>
                          <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                            <li>Private repository</li>
                            <li>Deleted commit or repository</li>
                            <li>API rate limit reached</li>
                          </ul>
                          <a
                            href={`https://github.com/${event.repo.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline text-xs mt-3 inline-block"
                          >
                            → View repository on GitHub
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {displayedEvents.length < events.length && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all font-mono"
            >
              $ load --more ({displayedEvents.length} / {events.length})
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="https://github.com/TrendySloth1001?tab=activity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition text-sm"
          >
            → View complete activity on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
