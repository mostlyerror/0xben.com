import { site, inlineLinks, shipped, status, now as nowLine, workWithMe } from "@/lib/site";
import { shipCadence } from "@/lib/cadence";
import { StatusLine } from "@/components/StatusLine";
import { SocialIcons } from "@/components/SocialIcons";
import { ClickableAvatar } from "@/components/ClickableAvatar";
import { ProjectCards } from "@/components/ships/ProjectCards";
import { TinyshipManifesto } from "@/components/ships/TinyshipManifesto";
import { ShipLedger } from "@/components/ships/ShipLedger";
import { SiteFooter } from "@/components/SiteFooter";

// Server component, statically prerendered: the clock below is frozen at
// build time, and every ship commits and redeploys, so it stays honest.
export default function Home() {
  const nowMs = Date.now();
  const cadence = shipCadence(shipped.map((s) => s.date), nowMs);

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

        {/* RIGHT — shipping activity */}
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-6">
            <ProjectCards />
            <TinyshipManifesto />
          </div>
          <ShipLedger cadence={cadence} nowMs={nowMs} />

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
