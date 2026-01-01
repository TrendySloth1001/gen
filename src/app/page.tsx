import TerminalHero from '@/components/TerminalHero';
import Skills from '@/components/Skills';
import GitHubHeatmap from '@/components/GitHubHeatmap';
import CommitHistory from '@/components/CommitHistory';
import ProjectsGrid from '@/components/ProjectsGrid';
import Footer from '@/components/Footer';
import TerminalBackground from '@/components/TerminalBackground';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 relative">
      <TerminalBackground />
      <div className="relative z-10">
        <TerminalHero />
        <Skills />
        <CommitHistory />
        <GitHubHeatmap />
        <ProjectsGrid />
        <Footer />
      </div>
    </div>
  );
}
