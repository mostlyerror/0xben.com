// The blog: markdown files in content/posts, read at build time.
//
//   content/posts/<slug>.md
//   ---
//   title: "Why I took time off"
//   date: "2026-09-19"        (quote it; bare YAML dates parse as Date objects)
//   summary: "One line for the list and for link previews."   (optional)
//   tags: [art, love]                                            (optional)
//   ---
//   Body in markdown.
//
// The filename is the URL: /<slug>. Server-only: uses the filesystem.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary?: string;
  tags: string[];
  html: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function normalizeDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v ?? "").slice(0, 10);
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => readPost(f.replace(/\.md$/, "")))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return readPost(slug);
}

function readPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content, { gfm: true, async: false }) as string;
  return {
    slug,
    title: String(data.title ?? slug),
    date: normalizeDate(data.date),
    summary: data.summary ? String(data.summary) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    html,
  };
}

// "2026-09-19" -> "Sep 19, 2026", in UTC so the day never shifts by timezone.
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
