"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The cue sheet handed to a score.
 *
 * Offsets are relative to the previous cue, not to the start of the cycle, so a
 * score reads as "…and 200ms later" and a beat can be retimed without
 * recomputing every number below it.
 */
export interface Timeline {
  /** Runs `cue` once `after` milliseconds have passed since the previous entry. */
  beat(after: number, cue: () => void): void;
  /** Advances the playhead without scheduling anything — a pause for reading. */
  hold(ms: number): void;
  /** Playhead position, in milliseconds from the top of the cycle. */
  readonly at: number;
}

export interface ChoreographyOptions {
  /** Replays the score from the top once the playhead passes the last cue. */
  loop?: boolean;
  /** When false the score never runs — reduced motion, off-screen, tests. */
  enabled?: boolean;
  /** Restarts the score whenever one of these changes. */
  deps?: readonly unknown[];
}

/**
 * Plays a timed score of state changes and cleans up after itself.
 *
 * A score is a plain function that receives a {@link Timeline} and calls
 * `beat()` in order; the hook turns those into timers and cancels every one of
 * them on unmount, on a dependency change, and before a loop restarts. That
 * cancellation is the whole point — a long demo loop that outlives its
 * component would otherwise keep writing state into a tree that has moved on.
 *
 * Returns the current cycle count, which doubles as a React `key` when a
 * looping score needs a subtree remounted rather than reset.
 *
 * ```ts
 * useChoreography(
 *   (timeline) => {
 *     setBeat(0);
 *     timeline.beat(520, () => setBeat(1));
 *     timeline.beat(280, () => setBeat(2));
 *     timeline.hold(4000);
 *   },
 *   { loop: true, enabled: !reduced },
 * );
 * ```
 */
export function useChoreography(
  score: (timeline: Timeline) => void,
  { loop = false, enabled = true, deps = [] }: ChoreographyOptions = {},
): number {
  const [cycle, setCycle] = useState(0);
  const scoreRef = useRef(score);

  // Held in a ref so that a score closing over fresh props does not restart the
  // cycle by itself — only `deps` decides when the demo starts over.
  useEffect(() => {
    scoreRef.current = score;
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 0;

    const schedule = (when: number, cue: () => void) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) cue();
        }, when),
      );
    };

    const timeline: Timeline = {
      get at() {
        return at;
      },
      hold(ms) {
        at += ms;
      },
      beat(after, cue) {
        at += after;
        schedule(at, cue);
      },
    };

    // Runs synchronously, so a score can reset its state at the top of the
    // cycle without the previous cycle's last frame flashing.
    scoreRef.current(timeline);

    if (loop) schedule(at, () => setCycle((count) => count + 1));

    return () => {
      cancelled = true;
      for (const timer of timers) clearTimeout(timer);
    };
    // `deps` is spread because callers decide what restarts a score; the lint
    // rule cannot see through the array to check it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loop, cycle, ...deps]);

  return cycle;
}
