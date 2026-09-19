import { interests } from "@/lib/site";
import { emojiClass } from "@/lib/emojiClass";

// "Outside of work" as a plain list. No descriptions: the names carry it, and
// anything more reads like bragging. Pills are not links, so no hover lift.
export function InterestCards() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
        Outside of work
      </h2>
      <ul className="flex flex-wrap gap-2">
        {interests.map((it) => (
          <li
            key={it.id}
            className="toy-card toy-still flex items-center gap-2 rounded-full border border-black/[0.08] py-1.5 pl-2.5 pr-3.5 text-sm dark:border-white/[0.08]"
          >
            <span className={`toy-emoji text-base leading-none ${emojiClass[it.emoji] ?? ""}`}>{it.emoji}</span>
            <span className="text-black/80 dark:text-white/80">{it.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
