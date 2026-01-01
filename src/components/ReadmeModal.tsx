'use client';

import { useEffect, useState } from 'react';
import { FaTimes, FaBook, FaSpinner } from 'react-icons/fa';

interface ReadmeModalProps {
  owner: string;
  repo: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReadmeModal({ owner, repo, isOpen, onClose }: ReadmeModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchReadme() {
      setLoading(true);
      setError(null);

      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/readme`,
          { headers }
        );

        if (!response.ok) {
          setError('README not found');
          setLoading(false);
          return;
        }

        const data = await response.json();
        const decoded = atob(data.content);
        setContent(decoded);
      } catch (err) {
        setError('Failed to fetch README');
        console.error('Error fetching README:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReadme();
  }, [isOpen, owner, repo]);

  const renderMarkdown = (text: string) => {
    // Basic markdown rendering
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-emerald-400 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-emerald-400 mt-8 mb-4 pb-2 border-b border-emerald-500/20">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-emerald-400 mb-4 pb-2 border-b-2 border-emerald-500/30">$1</h1>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-black border-2 border-emerald-500/30 rounded-lg p-4 overflow-x-auto mb-4"><code class="text-sm text-emerald-400">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-sm">$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-emerald-300">$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="italic text-zinc-300">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-4">$1</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-emerald-500/50 pl-4 italic text-zinc-400 mb-4">$1</blockquote>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-4 leading-7">');
    html = '<p class="mb-4 leading-7">' + html + '</p>';

    return html;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-zinc-950 border-2 border-emerald-500/50 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-emerald-500/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FaBook className="text-emerald-400 text-xl" />
            <h2 className="text-xl font-bold text-emerald-400">README.md</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full text-emerald-400">
              <FaSpinner className="animate-spin text-3xl" />
            </div>
          ) : error ? (
            <div className="text-center text-zinc-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-emerald max-w-none">
              <div 
                className="markdown-body text-zinc-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t-2 border-emerald-500/30 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 border-2 border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
