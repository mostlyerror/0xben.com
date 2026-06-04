"use client";

import { useEffect, useState } from "react";

// A rotating closing-thought line for the footer. Same cross-fade
// approach as StatusLine, with an honest, low-key default set.
// Pass `items` to override. No emdashes in copy.
const DEFAULT_LINES = [
  "still shipping",
  "made at 2am",
  "no funding, just me",
  "counting launches, not commits",
  "built in Houston",
];

export function FooterRotator({ items = DEFAULT_LINES }: { items?: string[] }) {
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
    }, 4200);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <span
      className={`transition-opacity duration-300 text-black/30 dark:text-white/30 ${show ? "opacity-100" : "opacity-0"}`}
    >
      {items[i]}
    </span>
  );
}
