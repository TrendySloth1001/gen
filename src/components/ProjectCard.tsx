'use client';

import { motion } from 'framer-motion';
import { FaStar, FaCodeBranch, FaExternalLinkAlt } from 'react-icons/fa';
import { GitHubRepo } from '@/lib/github';

const languageColors: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Dart: '#0175C2',
  Java: '#007396',
  Go: '#00ADD8',
  Rust: '#CE422B',
  HTML: '#E34F26',
  CSS: '#1572B6',
  C: '#A8B9CC',
  'C++': '#00599C',
  'C#': '#239120',
};

interface ProjectCardProps {
  repo: GitHubRepo;
  index: number;
}

export default function ProjectCard({ repo, index }: ProjectCardProps) {
  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.6, 0.05, 0.01, 0.9],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated gradient border on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-blue-500/0 opacity-0 blur"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        {/* Header with language */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2 flex items-center gap-2 group-hover:text-white transition">
              {repo.name}
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                whileHover={{ opacity: 1, x: 0 }}
              >
                <FaExternalLinkAlt className="text-xs text-zinc-500" />
              </motion.span>
            </h3>
            {repo.language && (
              <div className="flex items-center gap-2 text-sm">
                <motion.span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: languageColors[repo.language] || '#8B949E',
                  }}
                  whileHover={{ scale: 1.2 }}
                />
                <span className="text-zinc-400">{repo.language}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {repo.description || 'No description provided'}
        </p>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {repo.topics.slice(0, 3).map((topic, i) => (
              <motion.span
                key={topic}
                className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.05, borderColor: '#52525b' }}
              >
                {topic}
              </motion.span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.1 }}
          >
            <FaStar className="text-yellow-500/80" />
            <span>{repo.stargazers_count}</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.1 }}
          >
            <FaCodeBranch />
            <span>{repo.forks_count}</span>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}
