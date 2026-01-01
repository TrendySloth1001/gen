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
    
    switch (event.type) {
      case 'PushEvent':
        const commits = event.payload.commits?.length || 0;
        return `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${repoName}`;
      case 'CreateEvent':
        return `Created ${event.payload.ref_type} in ${repoName}`;
      case 'WatchEvent':
        return `Starred ${repoName}`;
      case 'ForkEvent':
        return `Forked ${repoName}`;
      case 'PullRequestEvent':
        return `${event.payload.action} pull request in ${repoName}`;
      case 'IssuesEvent':
        return `${event.payload.action} issue in ${repoName}`;
      default:
        return `Activity in ${repoName}`;
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
            events.map((event) => (
              <div
                key={event.id}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 hover:border-emerald-400/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-xl">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 mb-1">
                      {getEventDescription(event)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
