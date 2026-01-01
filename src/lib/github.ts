export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

const GITHUB_USERNAME = 'TrendySloth1001';
const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function getGitHubHeaders() {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getGitHubUser(): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`, {
      headers: getGitHubHeaders(),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      if (res.status === 403) {
        console.warn('GitHub API rate limit exceeded');
      }
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch GitHub user:', error);
    return null;
  }
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  repository?: {
    name: string;
    full_name: string;
  };
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
    url: string;
  };
  payload: {
    commits?: Array<{
      message: string;
      sha: string;
    }>;
    ref?: string;
    ref_type?: string;
  };
}

export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      {
        headers: getGitHubHeaders(),
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );
    
    if (!res.ok) {
      if (res.status === 403) {
        console.warn('GitHub API rate limit exceeded');
      }
      return [];
    }
    
    const repos: GitHubRepo[] = await res.json();
    
    // Filter out forks and sort by stars/activity
    return repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => {
        // Prioritize repos with stars, then by recent updates
        const starDiff = b.stargazers_count - a.stargazers_count;
        if (starDiff !== 0) return starDiff;
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      });
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error);
    return [];
  }
}

export async function getRecentCommits(): Promise<GitHubEvent[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/events?per_page=100`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );
    
    if (!res.ok) return [];
    
    const events: GitHubEvent[] = await res.json();
    
    // Filter push events from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return events
      .filter((event) => {
        const eventDate = new Date(event.created_at);
        return event.type === 'PushEvent' && eventDate >= thirtyDaysAgo;
      })
      .slice(0, 30); // Limit to 30 most recent
  } catch (error) {
    console.error('Failed to fetch GitHub commits:', error);
    return [];
  }
}
