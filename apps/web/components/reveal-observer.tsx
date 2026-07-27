"use client";

import { useEffect } from "react";

/**
 * Drives the `.reveal` entrance used across the product.
 *
 * Elements marked `.reveal` start hidden in CSS and are un-hidden the first
 * time they intersect the viewport, then released from observation — the
 * animation plays once and never re-runs on scroll-back.
 *
 * Nothing is ever stranded invisible: `prefers-reduced-motion` short-circuits
 * the whole thing in CSS, and the hidden state itself is scoped to the
 * `.js-reveal` class this component adds — so a browser that never runs it
 * (scripting off, hydration failed, bundle refused by the CSP) simply renders
 * the page as written.
 * A `MutationObserver` picks up nodes added later by the interactive engines.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Assume o contrato antes de o cumprir: a partir daqui há quem volte a
    // mostrar o que a folha de estilos esconde. Enquanto esta classe não
    // existir, `.reveal` não esconde nada — é o que impede a página de ficar em
    // branco quando este ficheiro nunca chega a correr.
    document.documentElement.classList.add("js-reveal");

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
