import TerminalHero from '@/components/TerminalHero';
import Skills from '@/components/Skills';
import GitHubActivity from '@/components/GitHubActivity';
import EnhancedHeatmap from '@/components/EnhancedHeatmap';
import ProjectsSection from '@/components/ProjectsSection';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';
import TerminalBackground from '@/components/TerminalBackground';
import FloatingNav from '@/components/FloatingNav';
import LiveCodingStatus from '@/components/LiveCodingStatus';
import WorldMapVisitors from '@/components/WorldMapVisitors';
import GitHubLiveFeed from '@/components/GitHubLiveFeed';
import SyntaxCodeBackground from '@/components/SyntaxCodeBackground';


export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 relative">
      
      <SyntaxCodeBackground />
      <TerminalBackground />
      <FloatingNav />
      <div className="relative z-10">
        <div id="home">
          <TerminalHero />
        </div>
        <WorldMapVisitors />
        <div id="skills">
          <Skills />
        </div>
        <LiveCodingStatus />
        <div id="activity">
          <GitHubActivity />
        </div>
        <EnhancedHeatmap />
        <GitHubLiveFeed />
        <div id="projects">
          <ProjectsSection />
        </div>
        <div id="blog">
          <BlogSection />
        </div>
        <Footer />
      </div>
    </div>
  );
}

