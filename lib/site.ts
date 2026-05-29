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
  headline: "Hi, I'm Ben 👋",
  tagline: "Software solopreneur. I run Good Robot Co and ship small products on the side.",
  // A short paragraph or two. Plain strings = separate paragraphs.
  bio: [
    "I'm a software solopreneur. I run Good Robot Co, where I build automation systems for local service businesses — responding to leads in minutes, following up on autopilot, getting more reviews.",
    "On the side I ship small products and learn in public. This page is where I keep them, and the numbers behind them. No team, no funding — just me and code.",
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
}[] = [
  {
    name: "Raincheck",
    description: "Hourly weather forecasts, right inside Google Calendar. Privacy-first Chrome extension, free forever.",
    href: "https://letsraincheck.com",
    metricLabel: "users",
    metricValue: "—",
    emoji: "🌦️",
  },
  {
    name: "PickleRadar",
    description: "Every upcoming Houston-area pickleball tournament, one search away. Browse by venue and skill level.",
    href: "https://pickleradar.app",
    metricLabel: "tournaments",
    metricValue: "—",
    emoji: "🏓",
  },
  {
    name: "ClusterDesk",
    description: "Weekly alerts when multiple insiders buy the same micro-cap within days — straight from SEC Form 4 filings.",
    href: "https://clusterdesk.io",
    metricLabel: "subscribers",
    metricValue: "—",
    emoji: "📈",
  },
  {
    name: "noyu",
    description: "A weekly question, forwarded to someone you've been meaning to reach out to. One question. Forward it. See what happens.",
    href: "https://noyu.love",
    metricLabel: "/mo",
    metricValue: "$2.99",
    emoji: "💌",
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
  // Optional: makes the entry expandable to reveal the breakdown.
  details?: string[];
}[] = [
  // ship:insert — `npm run ship` inserts new entries directly below this line
  {
    date: "May 29, 2026",
    what: "Launched 0xben.com",
    href: "https://0xben.com",
    details: [
      "Designed and built the whole site — empty folder to production in one session",
      "Registered the domain on Porkbun and shipped on Vercel (apex + www, SSL)",
      "Hero, bio, live project list, and this very Shipped ledger",
      "Explored 8 design directions before committing to this minimal one",
    ],
  },
  // TODO: these are seeded placeholders — fix the dates and add real ones.
  { date: "May 2026", what: "Launched noyu — weekly reconnect questions", href: "https://noyu.love" },
  { date: "Apr 2026", what: "Launched ClusterDesk — insider-buy stock signals", href: "https://clusterdesk.io" },
  { date: "Feb 2026", what: "Shipped Raincheck to the Chrome Web Store", href: "https://letsraincheck.com" },
  { date: "Dec 2025", what: "Launched PickleRadar for Houston pickleball", href: "https://pickleradar.app" },
  { date: "Oct 2025", what: "Opened Good Robot Co for business", href: "https://goodrobotco.com" },
];

