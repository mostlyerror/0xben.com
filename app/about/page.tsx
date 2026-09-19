import type { Metadata } from "next";
import Link from "next/link";
import { site, shipped, workWithMe, beliefs } from "@/lib/site";
import { shipCadence } from "@/lib/cadence";
import { Linkified } from "@/components/Linkified";
import { InterestCards } from "@/components/InterestCards";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About",
  description: site.bio[0],
};

export default function AboutPage() {
  const cadence = shipCadence(shipped.map((s) => s.date), Date.now());

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-black/50 underline-offset-2 hover:underline dark:text-white/50"
      >
        ← Ben
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About</h1>
      </header>

      <section className="flex flex-col gap-4 leading-relaxed text-black/80 dark:text-white/80">
        {site.bio.map((p, i) => (
          <p key={i}>
            <Linkified text={p} />
          </p>
        ))}
        <p className="text-sm leading-relaxed text-black/60 dark:text-white/60">
          {workWithMe.lead}{" "}
          <a
            href={workWithMe.href}
            className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
          >
            {workWithMe.cta}
          </a>
        </p>
      </section>

      <InterestCards />

      {beliefs.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
            Things I believe
          </h2>
          <ul className="flex flex-col gap-3">
            {beliefs.map((b, i) => (
              <li key={i} className="leading-relaxed text-black/80 dark:text-white/80">
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}

      <SiteFooter freshLabel={cadence.freshLabel} />
    </main>
  );
}
