import Link from "next/link";
import { formatDate, type Post } from "@/lib/posts";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-black/50 dark:text-white/50">Nothing written yet.</p>;
  }
  return (
    <ol className="flex flex-col">
      {posts.map((p) => (
        <li
          key={p.slug}
          className="border-t border-black/[0.06] py-4 first:border-t-0 dark:border-white/[0.08]"
        >
          <Link href={`/${p.slug}`} className="group flex flex-col gap-1">
            <span className="text-[17px] font-semibold tracking-tight group-hover:underline">
              {p.title}
            </span>
            {p.summary && (
              <span className="text-sm leading-relaxed text-black/55 dark:text-white/55">{p.summary}</span>
            )}
            <time
              dateTime={p.date}
              className="font-mono text-xs tabular-nums text-black/40 dark:text-white/40"
            >
              {formatDate(p.date)}
            </time>
          </Link>
        </li>
      ))}
    </ol>
  );
}
