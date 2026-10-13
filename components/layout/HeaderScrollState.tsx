'use client';

import { useEffect } from 'react';

/** Toggles data-scrolled on the header so it can take a restrained sticky style. */
export function HeaderScrollState({ targetId }: { targetId: string }) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const update = () => {
      target.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [targetId]);
  return null;
}
