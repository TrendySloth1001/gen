'use client';

import { useEffect, useState } from 'react';
import { FaExternalLinkAlt, FaClock, FaHeart, FaComment } from 'react-icons/fa';

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  reading_time_minutes: number;
  public_reactions_count: number;
  comments_count: number;
  tag_list: string[];
  cover_image?: string;
}

export default function BlogSection() {
  const [articles, setArticles] = useState<DevToArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      try {
        // Try Dev.to first
        const response = await fetch('https://dev.to/api/articles?username=trendysloth1001', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setArticles(data.slice(0, 6)); // Show 6 most recent
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <section className="px-6 py-20 font-mono" id="blog">
        <div className="max-w-7xl mx-auto">
          <div className="text-emerald-400 animate-pulse">$ cat ~/blog/*.md</div>
        </div>
      </section>
    );
  }

  if (error || articles.length === 0) {
    return (
      <section className="px-6 py-20 font-mono" id="blog">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">
              $ cat ~/blog/*.md
            </h2>
            <p className="text-zinc-500">Technical articles and tutorials</p>
          </div>
          <div className="border-2 border-zinc-800 rounded-lg bg-black/80 backdrop-blur-sm p-8 text-center">
            <p className="text-zinc-500">
              No articles found. Connect your dev.to, Medium, or Hashnode profile to display your writings.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-20 font-mono" id="blog">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/5 border-2 border-blue-500/30 rounded-lg mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-blue-400">
              Blog & Articles
            </h2>
          </div>
          <p className="text-zinc-400 text-lg">Technical writings and tutorials</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black to-zinc-950 overflow-hidden hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition h-full flex flex-col">
                {/* Cover Image */}
                {article.cover_image && (
                  <div className="h-48 overflow-hidden bg-zinc-900">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-emerald-400 group-hover:text-emerald-300 transition mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-3 flex-grow">
                    {article.description}
                  </p>

                  {/* Tags */}
                  {article.tag_list.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tag_list.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded border border-blue-500/30 text-blue-400 bg-blue-500/5"
                        >
                          #{tag}
                        </span>
                      ))}
                      {article.tag_list.length > 3 && (
                        <span className="px-2 py-1 text-xs text-zinc-600">
                          +{article.tag_list.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-emerald-500/20 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FaClock />
                        <span>{article.reading_time_minutes} min read</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaHeart className="text-red-500/80" />
                        <span>{article.public_reactions_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaComment className="text-blue-500/80" />
                        <span>{article.comments_count}</span>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="text-emerald-400/60 group-hover:text-emerald-400 transition" />
                  </div>

                  {/* Published Date */}
                  <div className="text-xs text-zinc-600 mt-2">
                    {formatDate(article.published_at)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-8 text-center">
          <a
            href="https://dev.to/trendysloth1001"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition"
          >
            View All Articles
            <FaExternalLinkAlt size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
