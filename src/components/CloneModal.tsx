'use client';

import { useState } from 'react';
import { FaClone, FaTimes, FaCopy, FaCheck, FaTerminal, FaGithub, FaDownload } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';

interface CloneModalProps {
  owner: string;
  repo: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CloneModal({ owner, repo, isOpen, onClose }: CloneModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const httpsUrl = `https://github.com/${owner}/${repo}.git`;
  const sshUrl = `git@github.com:${owner}/${repo}.git`;
  const ghUrl = `gh repo clone ${owner}/${repo}`;
  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-zinc-950 border-2 border-emerald-500/50 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-emerald-500/30">
          <div className="flex items-center gap-3">
            <FaClone className="text-emerald-400 text-xl" />
            <h2 className="text-xl font-bold text-emerald-400">Clone Repository</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* HTTPS */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaGithub className="text-emerald-400" />
              <h3 className="text-lg font-semibold text-zinc-300">HTTPS</h3>
            </div>
            <p className="text-zinc-500 text-sm mb-3">
              Clone with HTTPS (recommended for most users)
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black border-2 border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 overflow-x-auto">
                <code className="text-sm whitespace-nowrap">{httpsUrl}</code>
              </div>
              <button
                onClick={() => copyToClipboard(httpsUrl, 0)}
                className="px-4 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                {copiedIndex === 0 ? <FaCheck /> : <MdContentCopy />}
              </button>
            </div>
            <div className="mt-3 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
              <code className="text-xs text-zinc-400">
                git clone {httpsUrl}
              </code>
            </div>
          </div>

          {/* SSH */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaTerminal className="text-emerald-400" />
              <h3 className="text-lg font-semibold text-zinc-300">SSH</h3>
            </div>
            <p className="text-zinc-500 text-sm mb-3">
              Clone with SSH (requires SSH key setup)
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black border-2 border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 overflow-x-auto">
                <code className="text-sm whitespace-nowrap">{sshUrl}</code>
              </div>
              <button
                onClick={() => copyToClipboard(sshUrl, 1)}
                className="px-4 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                {copiedIndex === 1 ? <FaCheck /> : <MdContentCopy />}
              </button>
            </div>
            <div className="mt-3 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
              <code className="text-xs text-zinc-400">
                git clone {sshUrl}
              </code>
            </div>
          </div>

          {/* GitHub CLI */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaGithub className="text-emerald-400" />
              <h3 className="text-lg font-semibold text-zinc-300">GitHub CLI</h3>
            </div>
            <p className="text-zinc-500 text-sm mb-3">
              Clone using the GitHub CLI tool
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black border-2 border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 overflow-x-auto">
                <code className="text-sm whitespace-nowrap">{ghUrl}</code>
              </div>
              <button
                onClick={() => copyToClipboard(ghUrl, 2)}
                className="px-4 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                {copiedIndex === 2 ? <FaCheck /> : <MdContentCopy />}
              </button>
            </div>
          </div>

          {/* Download ZIP */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaDownload className="text-emerald-400" />
              <h3 className="text-lg font-semibold text-zinc-300">Download ZIP</h3>
            </div>
            <p className="text-zinc-500 text-sm mb-3">
              Download source code as a ZIP archive (no git history)
            </p>
            <a
              href={zipUrl}
              className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <FaDownload />
              Download ZIP
            </a>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              <strong>Tip:</strong> After cloning, navigate to the repository folder and run{' '}
              <code className="bg-blue-500/20 px-2 py-1 rounded">npm install</code> or{' '}
              <code className="bg-blue-500/20 px-2 py-1 rounded">yarn</code> to install dependencies.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t-2 border-emerald-500/30">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 border-2 border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 transition"
          >
            Close
          </button>
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            Open on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
