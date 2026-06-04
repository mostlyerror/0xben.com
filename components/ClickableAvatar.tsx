"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";

// The hero's one dumb secret: click the avatar and it does a quick spin while
// a tiny emoji burst fans out. Transform/opacity only, so it stays cheap. The
// spin/burst classes only animate inside the prefers-reduced-motion:no-preference
// block in globals.css, so calm users just get a plain (still clickable) avatar.

// Glyphs that fan out on click. Kept tiny and on-brand (ship + sparks).
const BURST = ["🚀", "✨", "🔥", "⭐", "💥", "🛸"];

type Props = {
  src: string;
  alt: string;
  /** Rendered (CSS) size in px at the base breakpoint. Classes still own the
   *  responsive sizing; this only feeds next/image's intrinsic dimensions. */
  size?: number;
  className?: string;
};

export function ClickableAvatar({ src, alt, size = 112, className = "" }: Props) {
  // `spinKey` re-mounts the animation by changing the key; `bursting` toggles
  // the particle layer. A ref guards against spamming mid-animation.
  const [spinKey, setSpinKey] = useState(0);
  const [bursting, setBursting] = useState(false);
  const busy = useRef(false);

  function pop() {
    if (busy.current) return;
    busy.current = true;
    setSpinKey((k) => k + 1);
    setBursting(true);
    // Clear after the longest animation (spin 0.6s) so it can fire again.
    window.setTimeout(() => {
      setBursting(false);
      busy.current = false;
    }, 650);
  }

  return (
    <span className="relative inline-block w-fit">
      <button
        type="button"
        onClick={pop}
        aria-label={`${alt} (tap for a surprise)`}
        className="avatar-egg block cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
      >
        <Image
          key={spinKey}
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority
          className={`${className} ${spinKey > 0 ? "avatar-spin" : ""}`}
        />
      </button>

      {bursting && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {BURST.map((g, i) => (
            <span
              key={`${spinKey}-${i}`}
              className="avatar-burst absolute left-1/2 top-1/2 text-lg"
              style={{ "--a": `${(360 / BURST.length) * i}deg` } as CSSProperties}
            >
              {g}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
