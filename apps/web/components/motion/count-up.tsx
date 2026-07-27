"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// A layout effect is what keeps the reset below off-screen; on the server there
// is no layout to run it against.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** `--ease-forming` as a function: the curve the design system counts on. */
function forming(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts up to `value` on its own frame loop.
 *
 * Written against `requestAnimationFrame` rather than an animation library on
 * purpose: `check:budgets` fails the build if a bundle pulls one in, and a
 * single interpolated number is not worth the exception.
 *
 * The rendered value *starts* at its destination and is pulled back to zero in
 * a layout effect. That ordering is deliberate — the server, and any browser
 * whose bundle never runs, renders the real number instead of a permanent `0`,
 * and because the reset happens before paint nobody sees the destination first.
 *
 * `active` hands the timing to a caller, so a number can land on the beat of a
 * sequence instead of the moment it happens to mount.
 */
export function CountUp({
  value,
  locale = "pt-PT",
  decimals = 0,
  suffix = "",
  durationMs = 900,
  active = true,
  className,
}: {
  value: number;
  locale?: string;
  decimals?: number;
  suffix?: string;
  durationMs?: number;
  active?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const frame = useRef<number | undefined>(undefined);

  useIsomorphicLayoutEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(value);
      return;
    }

    const started = performance.now();
    setShown(0);

    const tick = (now: number) => {
      const progress = Math.min((now - started) / durationMs, 1);
      setShown(value * forming(progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [active, value, durationMs]);

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(shown);

  return (
    <span className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
