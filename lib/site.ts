// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to make the site yours. Everything the page
//  renders (bio, projects, stats, links) is driven from here.
// ─────────────────────────────────────────────────────────────

export const site = {
  // Used for SEO, the browser tab, and Open Graph tags.
  domain: "0xben.com",
  url: "https://0xben.com",
  name: "Ben",
  // The big sentence at the top. Keep it short and human.
  headline: "Hi, I'm Ben 👋",
  tagline: "Software solopreneur. I build small products on the internet.",
  // A short paragraph or two. Plain strings = separate paragraphs.
  bio: [
    "I'm an independent software builder. I like shipping small, useful products and learning in public.",
    "This page is where I keep my projects and the numbers behind them. No team, no funding — just me, code, and a few users who make it worth it.",
  ],
  // Your GitHub handle. Stats are fetched live from the public API.
  // Set to null to hide the live GitHub card entirely.
  github: "benjaminpoon",
} as const;

// ── Social links (shown as buttons + drives the "following" stat) ──
// followers: a number shows a stat card; null hides the count.
export const socials: {
  label: string;
  href: string;
  followers: number | null;
}[] = [
  { label: "X / Twitter", href: "https://twitter.com/", followers: null },
  { label: "GitHub", href: "https://github.com/benjaminpoon", followers: null },
  { label: "LinkedIn", href: "https://linkedin.com/in/", followers: null },
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
    name: "Project One",
    description: "A short, punchy description of what it does and who it's for.",
    href: "https://example.com",
    metricLabel: "users",
    metricValue: "0",
    emoji: "🚀",
  },
  {
    name: "Project Two",
    description: "Replace these with your real projects — or delete the ones you don't need.",
    href: "https://example.com",
    metricLabel: "MRR",
    metricValue: "$0",
    emoji: "🧪",
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

// ── Growth chart data (Marc Lou's revenue chart, but for any metric) ──
// Edit `label` to whatever you're tracking. Points are plotted in order.
export const growth = {
  label: "Total signups",
  unit: "", // e.g. "$" — prefixed to the latest value
  points: [
    { x: "Jan", y: 0 },
    { x: "Feb", y: 0 },
    { x: "Mar", y: 0 },
    { x: "Apr", y: 0 },
    { x: "May", y: 0 },
  ],
};
