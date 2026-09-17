import { site } from "@/lib/site";
import { FooterRotator } from "@/components/FooterRotator";

export function SiteFooter({ freshLabel }: { freshLabel: string | null }) {
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-sm text-black/40 dark:text-white/40">
      <span>
        © {new Date().getFullYear()} {site.name} · {site.domain}
      </span>
      <BuildStamp />
      <a href="/feed.xml" className="underline-offset-2 hover:underline" title="RSS feed of the shipping log">
        · RSS
      </a>
      {freshLabel && (
        <span title="Newest entry on the shipping wall">
          · {freshLabel === "shipped today" ? "last shipped today" : `last shipped ${freshLabel}`}
        </span>
      )}
      <span className="w-full" />
      <FooterRotator />
    </footer>
  );
}

// Footer build stamp: the exact git SHA Vercel built from, so what's "live"
// is always verifiable at a glance. Links to the commit on GitHub.
function BuildStamp() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (!sha) {
    return <span className="font-mono text-xs opacity-70">· dev</span>;
  }
  const short = sha.slice(0, 7);
  return (
    <a
      href={`https://github.com/${site.github}/${site.domain}/commit/${sha}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs underline-offset-2 hover:underline"
      title="Deployed commit"
    >
      · {short}
    </a>
  );
}
