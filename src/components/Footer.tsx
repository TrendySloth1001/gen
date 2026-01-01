import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-emerald-500/30 bg-black/50 font-mono">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-emerald-400 mb-1">
              Nikhil Sohanlal Kumawat
            </h3>
            <p className="text-sm text-zinc-500">
              $ echo "Building the future, one commit at a time"
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/TrendySloth1001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition"
              aria-label="GitHub"
            >
              <FaGithub className="text-2xl" />
            </a>
            <a
              href="https://linkedin.com/in/nikhil-kumawat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="text-2xl" />
            </a>
            <a
              href="mailto:your.email@example.com"
              className="text-emerald-400 hover:text-emerald-300 transition"
              aria-label="Email"
            >
              <FaEnvelope className="text-2xl" />
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-zinc-500">
              © {currentYear} • Built with Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
