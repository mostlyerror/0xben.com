// Minimal RSS 2.0 builder for the shipped ledger. Pure functions only:
// no Next.js or path-alias imports, so `node --test lib/rss.test.ts` works.

export type FeedEntry = {
  date: string; // "Jun 10, 2026" style, as logged in lib/site.ts
  what: string;
  href?: string;
  gloss?: string;
};

export function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildRssXml(opts: {
  title: string;
  link: string;
  description: string;
  entries: FeedEntry[];
}): string {
  const items = opts.entries
    .map((e) => {
      const title = escapeXml(e.gloss ?? e.what);
      const link = escapeXml(e.href ?? opts.link);
      const pubDate = new Date(e.date).toUTCString();
      return [
        "    <item>",
        `      <title>${title}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="false">${escapeXml(`${e.date}:${e.gloss ?? e.what}`)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0">`,
    "  <channel>",
    `    <title>${escapeXml(opts.title)}</title>`,
    `    <link>${escapeXml(opts.link)}</link>`,
    `    <description>${escapeXml(opts.description)}</description>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}
