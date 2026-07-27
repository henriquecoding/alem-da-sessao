"use client";

import { useEffect } from "react";

/**
 * Drives the `.reveal` entrance used across the product.
 *
 * Elements marked `.reveal` start hidden in CSS and are un-hidden the first
 * time they intersect the viewport, then released from observation — the
 * animation plays once and never re-runs on scroll-back.
 *
 * Two guarantees keep this from ever stranding content invisible:
 * `prefers-reduced-motion` short-circuits the whole thing in CSS, and the
 * `<noscript>` block in the layout un-hides everything when scripting is off.
 * A `MutationObserver` picks up nodes added later by the interactive engines.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      // Fires slightly before the element reaches the bottom edge, so the
      // motion reads as "already arriving" rather than "triggered on contact".
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );

    const scan = () => {
      document
        .querySelectorAll(".reveal:not(.is-revealed)")
        .forEach((element) => observer.observe(element));
    };

    scan();

    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
