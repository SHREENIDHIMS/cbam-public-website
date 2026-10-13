'use client';

import { useEffect, useRef, useState } from 'react';
import { formatInteger } from '@/lib/utils/format';
import { useMotionOk } from './useMotionOk';

/**
 * Counts from 0 to `to` once, when the number scrolls into view (ease-out). The server and
 * no-JS render show the final value, and so does reduced motion.
 */
export function CountUp({
  to,
  prefix = '',
  suffix = '',
  duration = 2400,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const motionOk = useMotionOk();
  const [value, setValue] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!motionOk || !element || !('IntersectionObserver' in window)) return;
    setValue(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setValue(Math.round(to * (1 - Math.pow(1 - t, 4))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [motionOk, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatInteger(value)}
      {suffix}
    </span>
  );
}
