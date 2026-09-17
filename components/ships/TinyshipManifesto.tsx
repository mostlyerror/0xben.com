import { tinyship } from "@/lib/site";

export function TinyshipManifesto() {
  return (
    <div className="mt-1 flex flex-col gap-2 rounded-2xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
        <span className="font-semibold text-black dark:text-white">
          🚀 {tinyship.wordmark}
        </span>{" "}
        {tinyship.manifesto}
      </p>
      <p className="text-xs text-black/40 dark:text-white/40">{tinyship.seedLine}</p>
    </div>
  );
}
