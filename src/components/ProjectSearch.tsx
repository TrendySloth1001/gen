'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getGitHubRepos, GitHubRepo } from '@/lib/github';
import { FaStar, FaCodeBranch, FaExternalLinkAlt, FaCode, FaSearch, FaFilter } from 'react-icons/fa';

export default function ProjectSearch() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated'>('stars');

  useEffect(() => {
    async function fetchRepos() {
      const data = await getGitHubRepos();
      setRepos(data);
      setFilteredRepos(data);
      setLoading(false);
    }
    fetchRepos();
  }, []);

  useEffect(() => {
    let filtered = [...repos];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(repo => repo.language === selectedLanguage);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredRepos(filtered);
  }, [searchQuery, selectedLanguage, sortBy, repos]);

  const languages = ['all', ...Array.from(new Set(repos.map(r => r.language).filter((lang): lang is string => lang !== null)))];

  if (loading) {
    return (
      <div className="text-emerald-400 animate-pulse">Loading repositories...</div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
          <span className="text-zinc-600">{'{'}</span>
          <span>"repositories":</span>
          <span className="text-yellow-400">{repos.length}</span>
          <span className="text-zinc-600">{'}'}</span>
        </h3>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search projects by name, description, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border-2 border-emerald-500/30 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-zinc-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 bg-zinc-900 border-2 border-emerald-500/30 rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All Languages' : lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm">Sort:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('stars')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    sortBy === 'stars'
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50'
                      : 'bg-zinc-900 text-zinc-500 border-2 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <FaStar className="inline mr-1" size={12} />
                  Stars
                </button>
                <button
                  onClick={() => setSortBy('forks')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    sortBy === 'forks'
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50'
                      : 'bg-zinc-900 text-zinc-500 border-2 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <FaCodeBranch className="inline mr-1" size={12} />
                  Forks
                </button>
                <button
                  onClick={() => setSortBy('updated')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    sortBy === 'updated'
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50'
                      : 'bg-zinc-900 text-zinc-500 border-2 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="ml-auto text-zinc-500 text-sm">
              {filteredRepos.length} {filteredRepos.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
        </div>

      {/* Projects Grid */}
      {filteredRepos.length === 0 ? (
        <div className="border-2 border-zinc-800 rounded-lg bg-black/80 backdrop-blur-sm p-8 text-center">
          <p className="text-zinc-500">No projects found matching your criteria</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo) => (
              <div key={repo.id} className="block group">
                <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 p-6 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-emerald-400 group-hover:text-emerald-300 transition flex items-center gap-2">
                      {repo.name}
                    </h3>
                  </div>

                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-grow">
                    {repo.description || 'No description'}
                  </p>

                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 text-xs rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                        >
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span className="px-2 py-1 text-xs text-zinc-600">
                          +{repo.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto pt-4 border-t border-emerald-500/20">
                    <Link
                      href={`/project/${repo.full_name}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-sm text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition"
                    >
                      <FaCode />
                      Browse Code
                    </Link>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded text-sm text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaExternalLinkAlt />
                    </a>
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}
    </>
  );
}
