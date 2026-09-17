import Link from "next/link";
import { site, inlineLinks, shipped, status, now as nowLine, workWithMe, nowPage, beliefs } from "@/lib/site";
import { shipCadence } from "@/lib/cadence";
import { StatusLine } from "@/components/StatusLine";
import { SocialIcons } from "@/components/SocialIcons";
import { ClickableAvatar } from "@/components/ClickableAvatar";
import { InterestCards } from "@/components/InterestCards";
import { SiteFooter } from "@/components/SiteFooter";

// Server component. The clock below is read at render time; the root layout's
// `revalidate` regenerates the page hourly so day-based labels stay true.
export default function Home() {
  const cadence = shipCadence(shipped.map((s) => s.date), Date.now());

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-6 py-16 sm:py-24">
      <div className="flex flex-1 flex-col gap-14 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-14 lg:sticky lg:top-16">
      {/* Hero */}
      <section className="toy-hero flex flex-col gap-4">
        <ClickableAvatar
          src={site.avatar}
          alt={site.name}
          size={112}
          className="toy-avatar size-24 rounded-full object-cover ring-1 ring-black/10 sm:size-28 dark:ring-white/15"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <WavingHeadline text={site.headline} />
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60">
          {site.tagline}
        </p>
        <StatusLine items={status} />
        <SocialIcons />
        {nowLine && (
          <p className="mt-1 flex items-baseline gap-2 text-[13px] leading-relaxed text-black/55 dark:text-white/55">
            <span className="metric-fresh mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                Now
              </span>
              {nowLine.replace(/^Right now:\s*/i, "")}
            </span>
          </p>
        )}
      </section>

      {/* Bio */}
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
        </div>

        {/* RIGHT: the person, then one door to the wall */}
        <div className="flex flex-col gap-14">
          <InterestCards />

          {/* Now teaser: the first three items of the now page. */}
          {nowPage.items.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
                Now
              </h2>
              <ul className="flex flex-col">
                {nowPage.items.slice(0, 3).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-baseline gap-3 border-t border-black/[0.06] py-3 text-sm first:border-t-0 dark:border-white/[0.08]"
                  >
                    <span className="leading-none">{item.emoji}</span>
                    <span className="text-black/80 dark:text-white/80">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/now"
                className="text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
              >
                More on the now page
              </Link>
            </section>
          )}

          {/* Beliefs: renders nothing until the list has content. */}
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

          {/* The one door to the wall. Recency shows only when it is fresh. */}
          <p className="text-sm leading-relaxed text-black/60 dark:text-white/60">
            I also build a lot of small products. {cadence.total} ships
            {cadence.freshLabel
              ? cadence.freshLabel === "shipped today"
                ? ", the last one today"
                : `, the last one ${cadence.freshLabel}`
              : ""}
            .{" "}
            <Link
              href="/ships"
              className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
            >
              See the wall
            </Link>
          </p>
        </div>
      </div>

      <SiteFooter freshLabel={cadence.freshLabel} />
    </main>
  );
}

// Splits a string on any phrase in `inlineLinks` and renders those
// phrases as links, leaving the rest as plain text.
function Linkified({ text }: { text: string }) {
  const phrases = Object.keys(inlineLinks);
  if (phrases.length === 0) return <>{text}</>;

  const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));

  return (
    <>
      {parts.map((part, i) =>
        inlineLinks[part] ? (
          <a
            key={i}
            href={inlineLinks[part]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}

// Wraps any emoji in the headline so it waves on its own — the signature toy.
// Splits on the wave-able glyphs and animates just those, leaving text still.
function WavingHeadline({ text }: { text: string }) {
  const parts = text.split(/(👋)/);
  return (
    <>
      {parts.map((part, i) =>
        part === "👋" ? (
          <span key={i} className="wave">
            👋
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
