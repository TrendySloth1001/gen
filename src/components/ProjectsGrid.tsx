'use client';

import { useEffect, useState } from 'react';
import { getGitHubRepos, GitHubRepo } from '@/lib/github';
import { FaStar, FaCodeBranch, FaExternalLinkAlt } from 'react-icons/fa';

export default function ProjectsGrid() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      const data = await getGitHubRepos();
      setRepos(data);
      setLoading(false);
    }
    fetchRepos();
  }, []);

  const topRepos = repos.slice(0, 6);

  return (
    <section className="px-6 py-20 font-mono" id="projects">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">
            $ cat projects.json
          </h2>
          <p className="text-zinc-500">Featured repositories from GitHub</p>
        </div>

        {loading ? (
          <div className="text-emerald-400 animate-pulse">Fetching repositories...</div>
        ) : topRepos.length === 0 ? (
          <div className="text-zinc-500">No public repositories found</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="border-2 border-emerald-500/30 rounded-lg bg-black/50 backdrop-blur-sm p-6 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition h-full">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-emerald-400 group-hover:text-emerald-300 transition flex items-center gap-2">
                        {repo.name}
                        <FaExternalLinkAlt className="text-xs opacity-0 group-hover:opacity-100 transition" />
                      </h3>
                    </div>

                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {repo.description || 'No description'}
                    </p>

                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-1 text-xs rounded border border-emerald-500/30 text-emerald-400"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      {repo.language && (
                        <span className="text-emerald-400">{repo.language}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-500/80" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCodeBranch />
                        <span>{repo.forks_count}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 text-center">
              <a
                href="https://github.com/TrendySloth1001?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition"
              >
                → View all repositories
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
