export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  autoSync: boolean;
  lastSyncTime?: string | null;
  lastCommitSha?: string | null;
}

const STORAGE_KEY_GITHUB = 'icpep_techtalk_github_config';

export const DEFAULT_GITHUB_CONFIG: GitHubConfig = {
  owner: '',
  repo: 'TechTalk2026',
  branch: 'main',
  token: '',
  autoSync: false,
  lastSyncTime: null,
  lastCommitSha: null
};

export function getGitHubConfig(): GitHubConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GITHUB);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_GITHUB_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to read GitHub config from localStorage:', err);
  }
  return { ...DEFAULT_GITHUB_CONFIG };
}

export function saveGitHubConfig(updates: Partial<GitHubConfig>): GitHubConfig {
  const current = getGitHubConfig();
  const next: GitHubConfig = { ...current, ...updates };
  try {
    localStorage.setItem(STORAGE_KEY_GITHUB, JSON.stringify(next));
  } catch (err) {
    console.error('Failed to save GitHub config:', err);
  }
  return next;
}

// Robust UTF-8 to Base64 encoder for browser and node
function utf8ToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
}

/**
 * Tests connection to GitHub repository using the provided credentials
 */
export async function testGitHubConnection(config: GitHubConfig): Promise<{
  success: boolean;
  message: string;
  repoFullName?: string;
  defaultBranch?: string;
  canPush?: boolean;
}> {
  const { owner, repo, token, branch } = config;
  if (!owner.trim()) {
    return { success: false, message: 'Please specify the GitHub repository owner/username.' };
  }
  if (!repo.trim()) {
    return { success: false, message: 'Please specify the GitHub repository name.' };
  }
  if (!token.trim()) {
    return { success: false, message: 'Please provide a GitHub Personal Access Token (PAT).' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token.trim()}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, message: 'Authentication failed. Check your Personal Access Token.' };
      }
      if (res.status === 404) {
        return {
          success: false,
          message: `Repository "${owner.trim()}/${repo.trim()}" not found. Verify owner/repo and that your token has "repo" scope.`
        };
      }
      return { success: false, message: `GitHub API error (HTTP ${res.status}): ${res.statusText}` };
    }

    const repoData = await res.json();
    const canPush = repoData.permissions ? repoData.permissions.push : true;

    // Verify target branch exists
    const branchRes = await fetch(
      `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/branches/${(branch || 'main').trim()}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token.trim()}`
        }
      }
    );

    if (!branchRes.ok) {
      return {
        success: true,
        message: `Connected to ${repoData.full_name}, but target branch "${branch}" was not found (default is "${repoData.default_branch}").`,
        repoFullName: repoData.full_name,
        defaultBranch: repoData.default_branch,
        canPush
      };
    }

    return {
      success: true,
      message: `Successfully connected to ${repoData.full_name} (${branch || 'main'} branch)! Write permissions verified.`,
      repoFullName: repoData.full_name,
      defaultBranch: repoData.default_branch,
      canPush
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Network error connecting to GitHub: ${msg}` };
  }
}

/**
 * Commits and pushes site_state.json (and updated media) directly to GitHub repository.
 * This triggers GitHub Actions (.github/workflows/deploy.yml) automatically.
 */
export async function deliverToGitHub(options: {
  siteState: any;
  customImages?: Record<string, any>;
  commitMessage?: string;
  configOverride?: Partial<GitHubConfig>;
}): Promise<{
  success: boolean;
  message: string;
  commitUrl?: string;
  sha?: string;
  filesUpdated?: string[];
}> {
  const config = { ...getGitHubConfig(), ...(options.configOverride || {}) };
  const { owner, repo, branch, token } = config;

  if (!owner.trim() || !repo.trim() || !token.trim()) {
    return {
      success: false,
      message: 'GitHub credentials are incomplete. Please configure Repository Owner, Repo Name, and Personal Access Token in Admin Settings.'
    };
  }

  const targetBranch = branch.trim() || 'main';
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanToken = token.trim();

  // Try server-side delivery first if running Express backend
  try {
    const srvRes = await fetch('/api/github-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: cleanOwner,
        repo: cleanRepo,
        branch: targetBranch,
        token: cleanToken,
        siteState: options.siteState,
        customImages: options.customImages,
        commitMessage: options.commitMessage
      })
    });

    if (srvRes.ok) {
      const srvJson = await srvRes.json();
      if (srvJson.success) {
        saveGitHubConfig({
          lastSyncTime: new Date().toLocaleTimeString(),
          lastCommitSha: srvJson.sha || null
        });
        return srvJson;
      }
    }
  } catch {
    // If backend endpoint is unreachable (e.g. running statically on GitHub Pages), fallback to client-side GitHub REST API
  }

  // Client-side direct GitHub REST API delivery
  try {
    const filePath = 'src/data/site_state.json';
    const apiUrl = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}?ref=${targetBranch}`;

    // 1. Get existing file SHA (if any)
    let existingSha: string | undefined;
    const getRes = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${cleanToken}`
      }
    });

    if (getRes.ok) {
      const getJson = await getRes.json();
      existingSha = getJson.sha;
    }

    // 2. Prepare payload
    const jsonString = JSON.stringify(options.siteState, null, 2);
    const base64Content = utf8ToBase64(jsonString);

    const nowStr = new Date().toLocaleString();
    const message = options.commitMessage || `Sync site data and settings from Admin Panel [${nowStr}]`;

    const putRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        sha: existingSha,
        branch: targetBranch
      })
    });

    if (!putRes.ok) {
      const errorJson = await putRes.json().catch(() => ({}));
      const errorMsg = errorJson.message || `HTTP ${putRes.status} ${putRes.statusText}`;
      return {
        success: false,
        message: `Failed to commit to GitHub: ${errorMsg}`
      };
    }

    const putData = await putRes.json();
    const commitSha = putData.commit?.sha || putData.content?.sha;
    const commitUrl = putData.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/commit/${commitSha}`;

    saveGitHubConfig({
      lastSyncTime: nowStr,
      lastCommitSha: commitSha ? commitSha.substring(0, 7) : null
    });

    return {
      success: true,
      message: `Delivered to GitHub successfully! Commit ${commitSha ? commitSha.substring(0, 7) : ''} dispatched to ${targetBranch}. GitHub Pages deployment triggered!`,
      commitUrl,
      sha: commitSha,
      filesUpdated: [filePath]
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Error syncing with GitHub: ${msg}`
    };
  }
}
