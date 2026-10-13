'use client';

import { useEffect } from 'react';

/** Opens the <details> element named in the address fragment, so "#line-L3" shows the workings. */
export function OpenOnHash() {
  useEffect(() => {
    function openTarget() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const element = id ? document.getElementById(id) : null;
      if (element instanceof HTMLDetailsElement) {
        element.open = true;
        element.scrollIntoView({ block: 'center' });
      }
    }
    openTarget();
    window.addEventListener('hashchange', openTarget);
    return () => window.removeEventListener('hashchange', openTarget);
  }, []);
  return null;
}
