'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown, FaGithub, FaArrowLeft, FaCode, FaStar, FaSearch, FaHistory, FaUser, FaClock, FaFileAlt, FaMarkdown } from 'react-icons/fa';
import { MdContentCopy, MdClose } from 'react-icons/md';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  size?: number;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface RepoInfo {
  name: string;
  description: string;
  stars: number;
  language: string;
  default_branch: string;
}

interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

type ViewMode = 'code' | 'rendered';

export default function ProjectBrowser({ owner, repo }: { owner: string; repo: string }) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [showCommitHistory, setShowCommitHistory] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('code');

  const getGitHubHeaders = () => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    async function init() {
      try {
        // First fetch repo info to get the default branch
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: getGitHubHeaders(),
        });
        if (repoResponse.ok) {
          const repoData = await repoResponse.json();
          setRepoInfo({
            name: repoData.name,
            description: repoData.description,
            stars: repoData.stargazers_count,
            language: repoData.language,
            default_branch: repoData.default_branch
          });
          
          // Then fetch file tree using the correct default branch
          await fetchFileTree(repoData.default_branch);
        } else {
          setError(`Repository not found or inaccessible (${repoResponse.status})`);
          setLoading(false);
        }
      } catch (error) {
        setError('Failed to connect to GitHub API. Please try again later.');
        console.error('Failed to initialize:', error);
        setLoading(false);
      }
    }
    
    init();
    
    // Keyboard shortcuts
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [owner, repo]);

  const fetchFileTree = async (branch: string = 'main') => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers: getGitHubHeaders() }
      );
      
      if (!response.ok) {
        setError(`Failed to fetch file tree: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      const tree = buildFileTree(data.tree);
      setFileTree(tree);
      setLoading(false);
    } catch (error) {
      setError('Failed to load repository files. Please try again later.');
      console.error('Failed to fetch file tree:', error);
      setLoading(false);
    }
  };

  const buildFileTree = (files: any[]): FileNode[] => {
    const root: { [key: string]: any } = {};
    
    files.forEach((file: any) => {
      const parts = file.path.split('/');
      let current = root;
      
      parts.forEach((part: string, index: number) => {
        if (!current[part]) {
          const isLast = index === parts.length - 1;
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: isLast && file.type === 'blob' ? 'file' : 'dir',
            sha: file.sha,
            size: file.size,
            children: {},
            isExpanded: false
          };
        }
        if (index < parts.length - 1) {
          current = current[part].children;
        }
      });
    });
    
    const convertToArray = (obj: any): FileNode[] => {
      return Object.values(obj).map((node: any) => ({
        ...node,
        children: node.children && Object.keys(node.children).length > 0 
          ? convertToArray(node.children).sort((a: FileNode, b: FileNode) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'dir' ? -1 : 1;
            })
          : undefined
      }));
    };
    
    return convertToArray(root).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });
  };

  const fetchFileContent = async (path: string, sha: string) => {
    setLoadingFile(true);
    setSelectedFile(path);
    setShowCommitHistory(false);
    
    try {
      // Try blob API first
      let response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`,
        { headers: getGitHubHeaders() }
      );
      
      let content = '';
      
      if (response.ok) {
        const data = await response.json();
        // Handle base64 encoded content
        try {
          content = atob(data.content);
        } catch (e) {
          // If atob fails, content might not be base64
          content = data.content;
        }
      } else {
        // Fallback: Try to fetch using contents API
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
          { headers: getGitHubHeaders() }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            try {
              content = atob(data.content.replace(/\n/g, ''));
            } catch (e) {
              content = data.content;
            }
          } else if (data.download_url) {
            // For very large files, use download_url
            const downloadResponse = await fetch(data.download_url);
            content = await downloadResponse.text();
          }
        } else {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
      }
      
      setFileContent(content || '// File is empty or could not be loaded');
      
      // Auto-switch to rendered view for markdown files
      if (path.endsWith('.md') || path.endsWith('.markdown')) {
        setViewMode('rendered');
      } else {
        setViewMode('code');
      }
      
      // Fetch commit history for the file
      fetchFileCommitHistory(path);
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      setFileContent(`// Error loading file content\n// ${error instanceof Error ? error.message : 'Unknown error'}\n// File: ${path}\n// This file may be too large, binary, or inaccessible.`);
    } finally {
      setLoadingFile(false);
    }
  };

  const fetchFileCommitHistory = async (path: string) => {
    setLoadingCommits(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=10`,
        { headers: getGitHubHeaders() }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCommits(data);
      }
    } catch (error) {
      console.error('Failed to fetch commit history:', error);
    } finally {
      setLoadingCommits(false);
    }
  };

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const colors: { [key: string]: string } = {
      'ts': 'text-blue-400',
      'tsx': 'text-blue-400',
      'js': 'text-yellow-400',
      'jsx': 'text-yellow-400',
      'py': 'text-blue-500',
      'css': 'text-pink-400',
      'scss': 'text-pink-400',
      'json': 'text-yellow-500',
      'md': 'text-blue-300',
      'markdown': 'text-blue-300',
      'html': 'text-orange-500',
      'vue': 'text-green-500',
      'go': 'text-cyan-500',
      'rs': 'text-orange-600',
      'java': 'text-red-500',
      'cpp': 'text-purple-500',
      'c': 'text-purple-400',
      'rb': 'text-red-400',
      'php': 'text-purple-300',
      'swift': 'text-orange-400',
      'kt': 'text-purple-500',
      'yaml': 'text-green-400',
      'yml': 'text-green-400',
      'xml': 'text-orange-400',
      'svg': 'text-yellow-400',
      'png': 'text-purple-400',
      'jpg': 'text-purple-400',
      'gif': 'text-purple-400',
    };
    return colors[ext || ''] || 'text-emerald-400';
  };

  const renderFileTree = (nodes: FileNode[], depth: number = 0) => {
    const filteredNodes = searchQuery 
      ? nodes.filter(node => {
          const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               node.path.toLowerCase().includes(searchQuery.toLowerCase());
          const hasMatchingChildren = node.children?.some(child => 
            child.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          return matchesSearch || hasMatchingChildren;
        })
      : nodes;

    return filteredNodes.map((node) => {
      const isExpanded = expandedDirs.has(node.path);
      const isSelected = selectedFile === node.path;
      
      return (
        <div key={node.path}>
          <button
            onClick={() => {
              if (node.type === 'dir') {
                toggleDirectory(node.path);
              } else {
                fetchFileContent(node.path, node.sha);
              }
            }}
            className={`
              w-full flex items-center gap-2 px-3 py-2 text-sm font-mono
              hover:bg-emerald-500/10 transition-all duration-200
              ${isSelected ? 'bg-emerald-500/20 border-l-2 border-emerald-500 shadow-lg shadow-emerald-500/10' : ''}
              ${node.type === 'dir' ? 'font-semibold' : ''}
            `}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            {node.type === 'dir' ? (
              <>
                {isExpanded ? (
                  <FaChevronDown className="text-emerald-500 flex-shrink-0 animate-pulse" size={10} />
                ) : (
                  <FaChevronRight className="text-emerald-500 flex-shrink-0" size={10} />
                )}
                {isExpanded ? (
                  <FaFolderOpen className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <FaFolder className="text-emerald-400 flex-shrink-0" />
                )}
              </>
            ) : (
              <>
                <span className="w-3" />
                <FaFile className={`${getFileIcon(node.name)} flex-shrink-0`} size={12} />
              </>
            )}
            <span className={`truncate ${node.type === 'dir' ? 'text-zinc-300' : 'text-zinc-400'}`}>
              {node.name}
            </span>
          </button>
          
          {node.type === 'dir' && isExpanded && node.children && (
            <div>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderBreadcrumb = (path: string) => {
    const parts = path.split('/');
    return (
      <div className="flex items-center gap-1 text-xs text-zinc-500">
        <span className="text-emerald-500">{repo}</span>
        {parts.map((part, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <span>/</span>
            <span className={idx === parts.length - 1 ? 'text-zinc-300' : ''}>
              {part}
            </span>
          </span>
        ))}
      </div>
    );
  };

  const getLanguageClass = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'html': 'html',
      'vue': 'vue',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const highlightCode = (code: string, language: string): string => {
    // Simple syntax highlighting with colors
    const keywords: { [key: string]: string[] } = {
      typescript: ['const', 'let', 'var', 'function', 'class', 'interface', 'type', 'import', 'export', 'from', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue'],
      javascript: ['const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue'],
      python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield'],
    };

    // Escape HTML first
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Apply highlighting in order from most specific to least specific
    // to avoid conflicts
    
    // 1. Highlight multi-line comments first (/* ... */)
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #71717a">$1</span>');
    
    // 2. Highlight strings (must come before single-line comments to handle // inside strings)
    highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span style="color: #4ade80">$1</span>');
    
    // 3. Highlight single-line comments
    highlighted = highlighted.replace(/(\/\/.*?)($|&lt;)/gm, '<span style="color: #71717a">$1</span>$2');
    highlighted = highlighted.replace(/(#.*?)$/gm, '<span style="color: #71717a">$1</span>');
    
    // 4. Highlight numbers (but not inside already highlighted sections)
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, (match) => {
      // Don't highlight if already inside a span
      return `<span style="color: #60a5fa">${match}</span>`;
    });
    
    // 5. Highlight keywords
    const langKeywords = keywords[language] || keywords.typescript;
    langKeywords.forEach(keyword => {
      // Use word boundaries and negative lookbehind/lookahead to avoid matching inside tags
      const regex = new RegExp(`\\b(${keyword})\\b(?![^<]*>)`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #c084fc">$1</span>');
    });
    
    // 6. Highlight function calls
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span style="color: #facc15">$1</span>(');

    return highlighted;
  };

  const renderMarkdown = (markdown: string): string => {
    let html = markdown
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-emerald-400 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-emerald-400 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-emerald-400 mt-10 mb-6">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-100 font-bold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="text-zinc-300 italic">$1</em>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-zinc-900 border border-emerald-500/30 rounded p-4 overflow-x-auto my-4"><code class="text-emerald-300 text-sm">$1</code></pre>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 text-zinc-300 list-disc mb-1">$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 text-zinc-300 list-disc mb-1">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-zinc-300 list-decimal mb-1">$1</li>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-zinc-400 leading-relaxed">');
    html = '<p class="mb-4 text-zinc-400 leading-relaxed">' + html + '</p>';
    
    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-4 italic text-zinc-500 my-4">$1</blockquote>');

    return html;
  };

  const renderCodeWithLineNumbers = (code: string, filename: string) => {
    const lines = code.split('\n');
    const lang = getLanguageClass(filename);
    
    return (
      <div className="flex">
        <div className="select-none bg-zinc-950 border-r border-zinc-800 px-4 py-4 text-right">
          {lines.map((_, idx) => (
            <div key={idx} className="text-zinc-600 text-xs leading-relaxed font-mono h-[21px]">
              {idx + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 overflow-x-auto p-4 text-xs leading-relaxed font-mono">
          <code 
            className="text-zinc-300"
            dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }}
          />
        </pre>
      </div>
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-emerald-400 flex items-center gap-3 mb-4 justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
            <span>$ git clone {owner}/{repo}</span>
          </div>
          <div className="text-zinc-600 text-sm">Fetching repository structure...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center font-mono">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h2 className="text-xl text-red-400 mb-2">$ error: {error}</h2>
          <p className="text-zinc-600 mb-6">
            The repository could not be loaded. It may be private, deleted, or the GitHub API rate limit has been reached.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/#projects"
              className="px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/30 rounded hover:bg-emerald-500/20 hover:border-emerald-500/50 transition"
            >
              ← Back to Portfolio
            </Link>
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-800/50 border-2 border-zinc-700 rounded hover:bg-zinc-800 hover:border-zinc-600 transition"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono">
      {/* Header */}
      <div className="border-b border-emerald-500/30 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link 
              href="/#projects"
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
            >
              <FaArrowLeft />
              <span>Back to Portfolio</span>
            </Link>
            
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/30 rounded hover:bg-emerald-500/20 hover:border-emerald-500/50 transition"
            >
              <FaGithub />
              <span>View on GitHub</span>
            </a>
          </div>
          
          {repoInfo && (
            <div>
              <h1 className="text-2xl font-bold text-emerald-400 mb-1 flex items-center gap-2">
                <span className="text-emerald-500">$</span>
                <span className="text-zinc-500">cd</span>
                {repoInfo.name}
              </h1>
              <p className="text-zinc-400 text-sm mb-3">{repoInfo.description}</p>
              <div className="flex items-center gap-6 text-xs">
                {repoInfo.language && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-emerald-400 font-medium">{repoInfo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <FaStar className="text-yellow-500" />
                  <span className="text-yellow-400 font-medium">{repoInfo.stars}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded">
                  <FaCode className="text-blue-400" />
                  <span className="text-blue-400 font-medium">{fileTree.length} files</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto flex h-[calc(100vh-200px)]">
        {/* File Explorer */}
        <div className="w-80 border-r border-emerald-500/30 bg-gradient-to-b from-zinc-950 to-black overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-emerald-500/30 bg-zinc-950/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <FaFolder />
                $ tree
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-900 border border-zinc-800 rounded text-zinc-600">
                ⌘K
              </kbd>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={12} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-emerald-500/30 rounded text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>
            <div className="text-zinc-600 text-xs mt-2 flex items-center gap-1">
              <FaFileAlt size={10} />
              {fileTree.length} items
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-black to-zinc-950">
          {selectedFile ? (
            <>
              <div className="px-6 py-3 border-b border-emerald-500/30 bg-zinc-950/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {selectedFile.endsWith('.md') || selectedFile.endsWith('.markdown') ? (
                      <FaMarkdown className="text-blue-400 flex-shrink-0" />
                    ) : (
                      <FaCode className="text-emerald-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {renderBreadcrumb(selectedFile)}
                      {fileContent && (
                        <span className="text-zinc-600 text-xs mt-1 block">
                          {fileContent.split('\n').length} lines · {formatFileSize(new Blob([fileContent]).size)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(selectedFile.endsWith('.md') || selectedFile.endsWith('.markdown')) && (
                      <div className="flex bg-zinc-900 border border-emerald-500/30 rounded overflow-hidden">
                        <button
                          onClick={() => setViewMode('code')}
                          className={`px-3 py-1.5 text-xs transition ${
                            viewMode === 'code'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <FaCode className="inline mr-1" />
                          Raw
                        </button>
                        <button
                          onClick={() => setViewMode('rendered')}
                          className={`px-3 py-1.5 text-xs transition ${
                            viewMode === 'rendered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <FaFileAlt className="inline mr-1" />
                          Preview
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setShowCommitHistory(!showCommitHistory)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded transition ${
                        showCommitHistory
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                          : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <FaHistory />
                      {loadingCommits ? 'Loading...' : `${commits.length} commits`}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 rounded hover:bg-emerald-500/20 transition"
                    >
                      <MdContentCopy />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar bg-zinc-950/50 relative">
                {/* Commit History Sidebar */}
                {showCommitHistory && (
                  <div className="absolute top-0 right-0 w-96 h-full bg-black border-l border-emerald-500/30 z-10 overflow-y-auto custom-scrollbar">
                    <div className="sticky top-0 bg-zinc-950 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <FaHistory />
                        Commit History
                      </div>
                      <button
                        onClick={() => setShowCommitHistory(false)}
                        className="text-zinc-500 hover:text-zinc-300 transition"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      {loadingCommits ? (
                        <div className="text-center text-zinc-500 py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
                          Loading commits...
                        </div>
                      ) : commits.length === 0 ? (
                        <div className="text-center text-zinc-500 py-8">No commits found</div>
                      ) : (
                        commits.map((commit) => (
                          <a
                            key={commit.sha}
                            href={commit.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-zinc-900/50 border border-emerald-500/20 rounded hover:border-emerald-500/40 hover:bg-zinc-900 transition group"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <FaUser className="text-emerald-400 mt-1 flex-shrink-0" size={12} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-zinc-300 font-medium truncate group-hover:text-emerald-300 transition">
                                  {commit.commit.author.name}
                                </div>
                                <div className="text-xs text-zinc-600 flex items-center gap-1 mt-1">
                                  <FaClock size={10} />
                                  {new Date(commit.commit.author.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
                              {commit.commit.message}
                            </p>
                            <div className="text-xs font-mono text-emerald-500/70">
                              {commit.sha.substring(0, 7)}
                            </div>
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {loadingFile ? (
                  <div className="flex items-center justify-center h-full text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                      Loading...
                    </div>
                  </div>
                ) : viewMode === 'rendered' && (selectedFile.endsWith('.md') || selectedFile.endsWith('.markdown')) ? (
                  <div className="p-8 max-w-4xl mx-auto">
                    <div 
                      className="prose prose-invert prose-emerald max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(fileContent) }}
                    />
                  </div>
                ) : (
                  renderCodeWithLineNumbers(fileContent, selectedFile)
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <div className="text-center">
                <FaFolder className="text-5xl mx-auto mb-4 text-emerald-500/30" />
                <p className="text-lg">Select a file to view its contents</p>
                <p className="text-sm mt-2">Click on any file in the explorer →</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
