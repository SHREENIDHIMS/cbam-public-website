'use client';

import { useEffect, useState } from 'react';

/** True once mounted and only when the visitor has not asked for reduced motion. */
export function useMotionOk(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setOk(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return ok;
}
