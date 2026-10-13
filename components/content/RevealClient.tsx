'use client';

import { useEffect } from 'react';

/**
 * Section-entry motion. Elements marked with `data-reveal` are visible without JavaScript.
 * Once hydrated, those below the fold fade and rise into place as they scroll into view.
 * Nothing moves when the visitor prefers reduced motion.
 */
export function RevealClient() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          element.dataset.reveal = 'in';
          observer.unobserve(element);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    for (const element of targets) {
      const { top } = element.getBoundingClientRect();
      if (top < window.innerHeight * 0.92) continue;
      const delay = element.dataset.revealDelay;
      if (delay) element.style.setProperty('--reveal-delay', `${delay}ms`);
      element.dataset.reveal = 'pending';
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
