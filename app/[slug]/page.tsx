import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { shipped } from "@/lib/site";
import { shipCadence } from "@/lib/cadence";
import { getAllPosts, getPost, formatDate } from "@/lib/posts";
import { SiteFooter } from "@/components/SiteFooter";

// One post per markdown file in content/posts. Unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.summary };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const cadence = shipCadence(shipped.map((s) => s.date), Date.now());

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-black/50 underline-offset-2 hover:underline dark:text-white/50"
      >
        ← Ben
      </Link>

      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
          <time dateTime={post.date} className="font-mono text-xs tabular-nums text-black/40 dark:text-white/40">
            {formatDate(post.date)}
          </time>
        </header>
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      <SiteFooter freshLabel={cadence.freshLabel} />
    </main>
  );
}
