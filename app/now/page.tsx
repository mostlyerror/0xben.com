import type { Metadata } from "next";
import Link from "next/link";
import { nowPage } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm doing, making, and looking forward to right now.",
};

export default function NowPage() {

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm text-black/50 underline-offset-2 hover:underline dark:text-white/50"
        >
          ← Ben
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Now</h1>
        <p className="text-sm text-black/45 dark:text-white/45">Updated {nowPage.updated}</p>
      </header>

      {nowPage.items.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">Nothing here yet. Check back soon.</p>
      ) : (
        <ul className="flex flex-col">
          {nowPage.items.map((item, i) => (
            <li
              key={i}
              className="flex items-baseline gap-4 border-t border-black/[0.06] py-4 first:border-t-0 dark:border-white/[0.08]"
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="leading-relaxed text-black/80 dark:text-white/80">{item.text}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-black/45 dark:text-white/45">
        This is a{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          now page
        </a>
        . It changes when my life does.
      </p>

      <SiteFooter />
    </main>
  );
}
