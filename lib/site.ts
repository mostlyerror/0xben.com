// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to make the site yours. Everything the page
//  renders (bio, projects, stats, links) is driven from here.
// ─────────────────────────────────────────────────────────────

export const site = {
  // Used for SEO, the browser tab, and Open Graph tags.
  domain: "0xben.com",
  url: "https://0xben.com",
  name: "Ben",
  // Circular headshot at the top of the hero. Lives in /public.
  avatar: "/ben.jpg",
  // The big sentence at the top. Keep it short and human.
  headline: "sup nerds 👋",
  tagline: "Software solopreneur. I run Good Robot Co and ship small products on the side.",
  // A short paragraph or two. Plain strings = separate paragraphs.
  bio: [
    "I'm Ben. I run Good Robot Co, a one-person shop that builds automation for local service businesses. Think faster replies to new leads, follow-ups that happen on their own, and a steadier stream of reviews.",
    "On the side I build small products and share the work as I go. This page is where I keep them and the numbers behind them. No team, no funding, just me and code.",
  ],
  // Your GitHub handle. Stats are fetched live from the public API.
  // Set to null to hide the live GitHub card entirely.
  github: "mostlyerror",
} as const;

// Any of these phrases appearing in your bio get turned into links
// automatically. Add more as { "phrase": "https://..." }.
export const inlineLinks: Record<string, string> = {
  "Good Robot Co": "https://goodrobotco.com",
};

// Rotating "currently —" line in the hero. Pure personality — edit freely,
// keep them short. Set to [] to hide the line.
export const status: string[] = [
  "shipping noyu",
  "fueled by cold brew",
  "deep in a PickleRadar refactor",
  "building in public",
  "probably renaming a variable",
];

// TinyShip — the shipping-momentum system on this page, as the seed of a
// product. Pure copy; edit freely. (Future: its own home at tinyship.dev.)
export const tinyship = {
  wordmark: "TinyShip",
  manifesto:
    "You don't have a building problem. You have a shipping problem. " +
    "Last week: 353 commits, 1 launch. So I built a wall that counts " +
    "launches, not commits, and dares me to keep it alive. Ship tiny. " +
    "Ship ugly. Ship today.",
  seedLine: "A real product someday. For now, it's just mine.",
  followHref: "https://x.com/mostly_error",
};

// ── Social links (shown as buttons + drives the "following" stat) ──
// followers: a number shows a stat card; null hides the count.
export const socials: {
  label: string;
  href: string;
  followers: number | null;
}[] = [
  { label: "X / Twitter", href: "https://x.com/mostly_error", followers: null },
  { label: "GitHub", href: "https://github.com/mostlyerror", followers: null },
  { label: "Good Robot Co", href: "https://goodrobotco.com", followers: null },
  { label: "Email", href: "mailto:benjamintpoon@gmail.com", followers: null },
];

// ── Projects (Marc Lou's "startups" section) ──
// metricLabel/metricValue is the headline number for each project.
export const projects: {
  name: string;
  description: string;
  href: string;
  metricLabel: string;
  metricValue: string;
  emoji: string;
  // Optional weekly visitor counts, oldest to newest. Renders a sparkline
  // on the card. Set by hand, or auto-filled by `npm run traffic` from PostHog.
  traffic?: number[];
  // PostHog project ID for this product. If set, `npm run traffic` pulls
  // weekly unique visitors for it. Find it in PostHog → Settings → Project ID.
  posthogId?: string;
}[] = [
  // project:insert — `npm run project` inserts new entries directly below this line
  {
    name: "Hot Take",
    description: "Bets on tomorrow's NYC temperature using weather models.",
    href: "https://0xben.com",
    metricLabel: "edge bps",
    metricValue: "—",
    emoji: "🌡️",
  },
  {
    name: "GeoToMarket",
    description: "Turns geopolitical events into market trade ideas.",
    href: "https://x.com/GeoToMarket",
    metricLabel: "subscribers",
    metricValue: "—",
    emoji: "🌐",
  },
  {
    name: "Carte",
    description: "Turns a restaurant's messy menu into a clean QR web menu.",
    href: "https://site-bens-projects-1984.vercel.app",
    metricLabel: "menus rebuilt",
    metricValue: "—",
    emoji: "🍽️",
  },
  {
    name: "Raincheck",
    description: "Puts the weather forecast inside your Google Calendar.",
    href: "https://letsraincheck.com",
    metricLabel: "users",
    metricValue: "5",
    emoji: "🌦️",
  },
  {
    name: "PickleRadar",
    description: "Finds every pickleball tournament near Houston.",
    href: "https://pickleradar.app",
    metricLabel: "tournaments",
    metricValue: "—",
    emoji: "🏓",
    posthogId: "444689",
  },
  {
    name: "ClusterDesk",
    description: "Flags stocks where several insiders are buying at once.",
    href: "https://clusterdesk.io",
    metricLabel: "subscribers",
    metricValue: "—",
    emoji: "📈",
    posthogId: "446437",
  },
  {
    name: "noyu",
    description: "Sends you a weekly nudge to reconnect with someone.",
    href: "https://noyu.love",
    metricLabel: "/mo",
    metricValue: "$2.99",
    emoji: "💌",
    posthogId: "444905",
  },
];

// ── Manual stats you control by hand ──
// Vercel Web Analytics tracks traffic automatically, but the live
// number isn't available without an API token — so set it here and
// bump it when you check your dashboard. Set to null to hide a card.
export const manualStats: { label: string; value: string | null }[] = [
  { label: "Monthly visitors", value: null },
  { label: "Total revenue", value: null },
];

// ── Shipped log — the ledger that actually matters ──
// This is the anti-procrastination wall: every time you ship something
// to the real world (a feature, a launch, a fix, a post), add ONE line
// at the TOP. Newest first. The point isn't perfection — it's momentum.
// Keep it honest and keep it growing.
export const shipped: {
  date: string;
  what: string;
  href?: string;
  // Optional kind label shown as a small chip: "post" | "wrote" | "build" | "launch" …
  tag?: string;
  // Optional project this relates to (matches a project `name` below). Lets
  // distribution effort (tag "post") roll up per project.
  project?: string;
  // Optional: makes the entry expandable to reveal the breakdown.
  details?: string[];
}[] = [
  // ship:insert — `npm run ship` inserts new entries directly below this line
  { date: "May 31, 2026", what: "Ran the reply-graph on builder accounts", tag: "post" },
  { date: "May 31, 2026", what: "Ran the reply-graph: 10 replies on builder accounts", tag: "post" },
  { date: "May 31, 2026", what: "Rewrote X bio + pinned the build-vs-ship thread", tag: "post", project: "PickleRadar" },
  { date: "May 30, 2026", what: "Launched GeoToMarket", href: "https://x.com/GeoToMarket", tag: "launch", project: "GeoToMarket" },
  { date: "May 30, 2026", what: "Built @GeoToMarket autopilot: 3 cloud routines (morning/midday/close) drafting Jiang-lens tweet candidates and pushing to Discord for phone notifications" },
  { date: "May 30, 2026", what: "ClusterDesk product + analytics pass: wired PostHog conversion-funnel analytics, added price sparklines + interactive insider-buy chart markers across the site/email/cards, and shipped 3 research blog posts with a design pass, per-post OG share cards, and share buttons", project: "ClusterDesk" },
  { date: "May 30, 2026", what: "Fixed ClusterDesk's automated X posting engine (it was silently never firing, cron sat outside the posting window), retimed it for the retail audience, and built the content + reply-graph engine around it: weekly leaderboard, thread mode, evergreen floor, and a leverage-ranked reply scout with intra-day fast scans", project: "ClusterDesk" },
  { date: "May 30, 2026", what: "Launched the Carte landing page: live editorial site with real Houston menu demos embedded as scannable iframes", href: "https://site-bens-projects-1984.vercel.app", tag: "launch", project: "Carte" },
  { date: "May 30, 2026", what: "Launched Raincheck on Product Hunt", href: "https://www.producthunt.com/products/raincheck-4", tag: "post", project: "Raincheck" },
  { date: "May 30, 2026", what: "Promoted ClusterDesk on X (@clusterdesk)", href: "https://x.com/clusterdesk", tag: "post", project: "ClusterDesk" },
  { date: "May 30, 2026", what: "Built Hot Take, an automated Kalshi weather-markets engine on Cloudflare Workers + D1: twice-daily X posts (NYC daily high, GFS ensemble vs market odds), in-Worker chart + OG generation, and a live quant terminal (edge/EV/Kelly, calibration, simulated P&L)", tag: "build", project: "Hot Take" },
  { date: "May 30, 2026", what: "Built Carte pilot end-to-end: live brand/palette extraction, vision-based menu transcription, 9:16 brand-matched renderer, scannable QR + live hosted menus, and a batch scorecard. Validated on 8 real Houston restaurants.", href: "https://site-bens-projects-1984.vercel.app", tag: "build", project: "Carte" },
  { date: "May 30, 2026", what: "Launched Carte", href: "https://site-bens-projects-1984.vercel.app", tag: "launch", project: "Carte" },
  { date: "May 30, 2026", what: "Posted PickleRadar to Houston pickleball FB groups", tag: "post", project: "PickleRadar" },
  { date: "May 30, 2026", what: "Posted about PickleRadar's new ratings histogram", href: "https://x.com/mostly_error/status/2060719470939615536", tag: "post", project: "PickleRadar" },
  { date: "May 30, 2026", what: "Locked ClusterDesk's funnel priorities: an 8-week falsification gate", href: "https://clusterdesk.io", project: "ClusterDesk" },
  { date: "May 30, 2026", what: "Shipped TinyShip rollup + auto-draft: build-vs-ship effort per project", href: "https://0xben.com" },
  { date: "May 30, 2026", what: "Redesigned PickleRadar's ratings distribution as a unit-square histogram", href: "https://pickleradar.app", project: "PickleRadar" },
  {
    date: "May 29, 2026",
    what: "Launched 0xben.com",
    href: "https://0xben.com",
    tag: "launch",
    details: [
      "Designed and built the whole site, empty folder to production in one session",
      "Registered the domain on Porkbun and shipped on Vercel (apex + www, SSL)",
      "Hero, bio, live project list, and this very Shipped ledger",
      "Explored 8 design directions before committing to this minimal one",
    ],
  },
  { date: "May 2026", what: "Launched PickleRadar for Houston pickleball", href: "https://pickleradar.app" },
  { date: "Feb 2026", what: "Shipped Raincheck to the Chrome Web Store", href: "https://letsraincheck.com" },
  { date: "2022", what: "Opened Good Robot Co for business", href: "https://goodrobotco.com" },
];

