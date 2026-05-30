"use client";

import { useEffect, useState } from "react";

// A rotating "currently —" line that cross-fades through your status
// phrases. Pure personality; edit the list in lib/site.ts.
export function StatusLine({ items }: { items: string[] }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setI((p) => (p + 1) % items.length);
        setShow(true);
      }, 280);
    }, 3600);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <p className="text-sm text-black/50 dark:text-white/50">
      <span className="text-black/30 dark:text-white/30">currently </span>
      <span
        className={`transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
      >
        {items[i]}
      </span>
    </p>
  );
}
