// Fetches public GitHub stats on the server. No auth token needed for
// public data; we cache for an hour so we never hit rate limits on traffic.

export type GitHubStats = {
  followers: number;
  publicRepos: number;
  stars: number;
};

export async function getGitHubStats(
  username: string | null,
): Promise<GitHubStats | null> {
  if (!username) return null;

  try {
    const headers = { Accept: "application/vnd.github+json" };
    const revalidate = 60 * 60; // 1 hour

    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate },
    });
    if (!userRes.ok) return null;
    const user = await userRes.json();

    // Sum stars across owned public repos (up to 100 — plenty for a solo dev).
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&type=owner`,
      { headers, next: { revalidate } },
    );
    const repos = reposRes.ok ? await reposRes.json() : [];
    const stars = Array.isArray(repos)
      ? repos.reduce(
          (sum: number, r: { stargazers_count?: number }) =>
            sum + (r.stargazers_count ?? 0),
          0,
        )
      : 0;

    return {
      followers: user.followers ?? 0,
      publicRepos: user.public_repos ?? 0,
      stars,
    };
  } catch {
    // Network/API hiccup — render the rest of the page without the card.
    return null;
  }
}
