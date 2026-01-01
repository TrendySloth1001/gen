import ProjectBrowser from '@/components/ProjectBrowser';

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ owner: string; repo: string }> 
}) {
  const { owner, repo } = await params;
  return <ProjectBrowser owner={owner} repo={repo} />;
}
