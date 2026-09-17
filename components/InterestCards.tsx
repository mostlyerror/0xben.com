import type { CSSProperties } from "react";
import Image from "next/image";
import { interests } from "@/lib/site";
import { emojiClass } from "@/lib/emojiClass";

type Interest = (typeof interests)[number];

// Photo slot. A real photo always renders. With no photo: development shows
// a labeled dashed box so the missing asset is an obvious checklist item;
// production renders nothing, so visitors never see an empty frame.
function PhotoSlot({ interest: it }: { interest: Interest }) {
  if (it.photo) {
    return (
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={it.photo}
          alt={it.name}
          fill
          sizes="(min-width: 1280px) 18rem, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
      </div>
    );
  }
  if (process.env.NODE_ENV === "production" || !it.photoHint) return null;
  return (
    <div className="mb-3 flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 bg-black/[0.02] text-center dark:border-white/20 dark:bg-white/[0.03]">
      <span className="font-mono text-xs text-black/60 dark:text-white/60">photo-{it.id}</span>
      <span className="text-[11px] text-black/40 dark:text-white/40">{it.photoHint}</span>
      <span className="text-[10px] text-black/30 dark:text-white/30">dev only</span>
    </div>
  );
}

export function InterestCards() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
        Outside of work
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {interests.map((it, i) => (
          <div
            key={it.id}
            style={{ "--i": i } as CSSProperties}
            className="toy-card toy-still rise flex flex-col rounded-xl border border-black/[0.08] p-3 sm:p-4 dark:border-white/[0.08]"
          >
            <PhotoSlot interest={it} />
            <div className="flex items-center gap-2.5">
              <span className={`toy-emoji text-lg leading-none ${emojiClass[it.emoji] ?? ""}`}>
                {it.emoji}
              </span>
              <h3 className="text-[15px] font-semibold tracking-tight">{it.name}</h3>
            </div>
            {it.line && (
              <p className="mt-2 text-[13px] leading-relaxed text-black/55 dark:text-white/55">
                {it.line}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
