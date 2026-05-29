import Image from "next/image";
import { site, socials, projects, manualStats } from "@/lib/site";
import { getGitHubStats } from "@/lib/github";
import { GrowthChart } from "@/components/GrowthChart";

// Server component: GitHub stats are fetched here (cached 1h) so the
// page arrives fully rendered with no client-side loading flash.
export default async function Home() {
  const gh = await getGitHubStats(site.github);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-14 px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="flex flex-col gap-4">
        <Image
          src={site.avatar}
          alt={site.name}
          width={112}
          height={112}
          priority
          className="size-24 rounded-full object-cover ring-1 ring-black/10 sm:size-28 dark:ring-white/15"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {site.headline}
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60">
          {site.tagline}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              {s.label}
            </a>
          ))}
        </div>
      </section>

      {/* Bio */}
      <section className="flex flex-col gap-4 leading-relaxed text-black/80 dark:text-white/80">
        {site.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      {/* Stats */}
      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
          The numbers
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gh && (
            <>
              <StatCard label="GitHub stars" value={gh.stars.toLocaleString()} />
              <StatCard label="Followers" value={gh.followers.toLocaleString()} />
              <StatCard label="Public repos" value={gh.publicRepos.toLocaleString()} />
            </>
          )}
          {socials
            .filter((s) => s.followers != null)
            .map((s) => (
              <StatCard
                key={s.label}
                label={`${s.label} followers`}
                value={s.followers!.toLocaleString()}
              />
            ))}
          {manualStats
            .filter((s) => s.value != null)
            .map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value!} />
            ))}
        </div>

        <GrowthChart />
      </section>

      {/* Projects */}
      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
          What I'm building
        </h2>
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-black/10 p-4 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:underline">{p.name}</h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {p.description}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">{p.metricValue}</p>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {p.metricLabel}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="mt-auto pt-8 text-sm text-black/40 dark:text-white/40">
        © {new Date().getFullYear()} {site.name} · {site.domain}
      </footer>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-black/50 dark:text-white/50">{label}</span>
    </div>
  );
}
