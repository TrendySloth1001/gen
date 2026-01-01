'use client';

import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import Typewriter from './Typewriter';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full relative z-10">
        <div className="space-y-8">
          {/* Terminal prompt */}
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
            <span>{'>'}</span>
            <span className="text-zinc-500">whoami</span>
          </div>

          {/* Main heading with typewriter */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-mono text-zinc-100">
              <Typewriter text="Nikhil Sohanlal Kumawat" delay={80} />
            </h1>
            <p className="text-xl sm:text-2xl text-emerald-400 font-mono">
              {'$ Engineering Student & Full-Stack Developer'}
            </p>
          </div>

          {/* Bio */}
          <div className="border-l-2 border-emerald-500/50 pl-4 space-y-2 text-zinc-400 font-mono text-sm">
            <p>Currently pursuing engineering degree</p>
            <p>Building modern web and mobile applications</p>
            <p className="text-emerald-400">Status: Available for opportunities</p>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href="https://github.com/TrendySloth1001"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded font-mono text-sm hover:border-emerald-500 hover:text-emerald-400 transition"
            >
              <FaGithub />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/nikhil-kumawat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded font-mono text-sm hover:border-emerald-500 hover:text-emerald-400 transition"
            >
              <FaLinkedin />
              LinkedIn
            </a>
            <a
              href="mailto:your.email@example.com"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded font-mono text-sm hover:border-emerald-500 hover:text-emerald-400 transition"
            >
              <FaEnvelope />
              Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
