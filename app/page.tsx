import { getAllPosts } from "@/lib/posts";
import { SiteHeader } from "@/components/SiteHeader";
import { PostList } from "@/components/blog/PostList";
import { SiteFooter } from "@/components/SiteFooter";

// The blog. Masthead, then posts, newest first. The root layout's `revalidate`
// regenerates the page hourly so day-based labels stay true.
export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-12 px-6 py-16 sm:py-24">
      <SiteHeader />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
          Writing
        </h2>
        <PostList posts={posts} />
      </section>

      <SiteFooter />
    </main>
  );
}
