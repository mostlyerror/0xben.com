import Link from "next/link";
import { site, status, now as nowLine } from "@/lib/site";
import { ClickableAvatar } from "@/components/ClickableAvatar";
import { WavingHeadline } from "@/components/WavingHeadline";
import { StatusLine } from "@/components/StatusLine";
import { SocialIcons } from "@/components/SocialIcons";

const nav = [
  { label: "About", href: "/about" },
  { label: "Now", href: "/now" },
  { label: "Ships", href: "/ships" },
];

// Blog masthead: who this is, in a glance, then the nav.
export function SiteHeader() {
  return (
    <header className="toy-hero flex flex-col gap-4">
      <ClickableAvatar
        src={site.avatar}
        alt={site.name}
        size={112}
        className="toy-avatar size-20 rounded-full object-cover ring-1 ring-black/10 sm:size-24 dark:ring-white/15"
      />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        <WavingHeadline text={site.headline} />
      </h1>
      <p className="text-lg text-black/60 dark:text-white/60">{site.tagline}</p>
      <StatusLine items={status} />
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="font-medium text-black/70 underline-offset-4 hover:underline dark:text-white/70"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <SocialIcons />
      {nowLine && (
        <p className="flex items-baseline gap-2 text-[13px] leading-relaxed text-black/55 dark:text-white/55">
          <span className="metric-fresh mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span>
            <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
              Now
            </span>
            {nowLine.replace(/^Right now:\s*/i, "")}
          </span>
        </p>
      )}
    </header>
  );
}
