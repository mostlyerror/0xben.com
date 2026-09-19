import { site } from "@/lib/site";
import { FooterRotator } from "@/components/FooterRotator";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-sm text-black/40 dark:text-white/40">
      <span>
        © {new Date().getFullYear()} {site.name} · {site.domain}
      </span>
      <span className="w-full" />
      <FooterRotator />
    </footer>
  );
}
