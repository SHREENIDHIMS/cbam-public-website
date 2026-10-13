'use client';

import { useEffect, useRef } from 'react';
import { useMotionOk } from './useMotionOk';

/**
 * A paragraph whose words go from grey to ink as it scrolls through the viewport. Without
 * JavaScript, or with reduced motion, every word is already ink.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const motionOk = useMotionOk();
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const element = ref.current;
    if (!motionOk || !element) return;
    const spans = Array.from(element.querySelectorAll<HTMLElement>('[data-w]'));
    element.dataset.live = 'true';
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (viewport * 0.85 - top) / (height + viewport * 0.3)),
      );
      spans.forEach((span, index) => {
        span.dataset.on = index / spans.length <= progress ? 'true' : 'false';
      });
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
      delete element.dataset.live;
    };
  }, [motionOk]);

  return (
    <p ref={ref} className={`scroll-words ${className ?? ''}`}>
      {words.map((word, index) => (
        <span key={index} data-w="">
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
