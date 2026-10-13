'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useMotionOk } from './useMotionOk';

/**
 * A tall scroll track with a pinned stage. Writes the scroll progress (0 to 1) to the --p custom
 * property so CSS can move things with it. Until JavaScript runs, and for reduced motion, it
 * stays a plain stacked layout (data-scene is only "on" when the pinned mode is active).
 */
export function ScrollScene({ className, children }: { className?: string; children: ReactNode }) {
  const motionOk = useMotionOk();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!motionOk || !element) return;
    element.dataset.scene = 'on';
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      const travel = height - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -top / travel)) : 0;
      element.style.setProperty('--p', progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
      element.removeAttribute('data-scene');
      element.style.removeProperty('--p');
    };
  }, [motionOk]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
