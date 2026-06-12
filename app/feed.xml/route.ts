import { site, shipped } from "@/lib/site";
import { buildRssXml } from "@/lib/rss";

// The ledger is static data baked at build time, so the feed is too.
export const dynamic = "force-static";

export function GET() {
  const xml = buildRssXml({
    title: `${site.domain} shipping log`,
    link: site.url,
    description: "Everything Ben ships, newest first.",
    entries: shipped,
  });
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
