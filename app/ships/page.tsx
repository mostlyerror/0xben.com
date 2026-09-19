import type { Metadata } from "next";
import Link from "next/link";
import { shipped } from "@/lib/site";
import { shipCadence } from "@/lib/cadence";
import { ProjectCards } from "@/components/ships/ProjectCards";
import { TinyshipManifesto } from "@/components/ships/TinyshipManifesto";
import { ShipLedger } from "@/components/ships/ShipLedger";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Ships",
  description: "Everything I've built and shipped, with the numbers behind it.",
};

export default function ShipsPage() {
  const nowMs = Date.now();
  const cadence = shipCadence(shipped.map((s) => s.date), nowMs);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm text-black/50 underline-offset-2 hover:underline dark:text-white/50"
        >
          ← Ben
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ships</h1>
        <p className="max-w-xl text-black/60 dark:text-white/60">
          The small products I build on the side, and a log of every time one of them met the real world.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <ProjectCards />
        <TinyshipManifesto />
      </div>

      <ShipLedger cadence={cadence} nowMs={nowMs} />

      <SiteFooter />
    </main>
  );
}
