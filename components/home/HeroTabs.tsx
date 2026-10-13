'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMotionOk } from '@/components/motion/useMotionOk';
import type { HERO_TABS } from '@/lib/config/home-content';

const AUTOPLAY_MS = 6000;

/**
 * Hero tabs (the reference's Air / Road / Sea): the three ways into the public tools. They
 * advance on their own every few seconds, stop while hovered or focused, and never advance for
 * reduced motion. Each tab shows one line and a link to that tool.
 */
export function HeroTabs({ tabs }: { tabs: typeof HERO_TABS }) {
  const motionOk = useMotionOk();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!motionOk || paused) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % tabs.length), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [motionOk, paused, active, tabs.length]);

  const tab = tabs[active]!;

  return (
    <div
      data-paused={paused ? 'true' : 'false'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-10"
    >
      <div role="group" aria-label="Ways to start" className="flex flex-wrap items-center gap-x-2">
        {tabs.map((item, index) => (
          <span key={item.key} className="flex items-center gap-x-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
            ) : null}
            <button
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className="tab-progress relative min-h-11 cursor-pointer border-0 bg-transparent px-1 py-2 text-[0.9375rem] tracking-wide text-ink-muted uppercase transition-colors duration-300 hover:text-ink aria-pressed:text-ink"
              style={{ '--tab-seconds': `${AUTOPLAY_MS / 1000}s` } as React.CSSProperties}
            >
              {item.label}
            </button>
          </span>
        ))}
      </div>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9375rem] text-ink-muted">
        <span>{tab.line}</span>
        <Link
          href={tab.href as Route}
          className="font-medium text-primary underline underline-offset-4 hover:text-ink"
        >
          Open {tab.label.toLowerCase()}
        </Link>
      </p>
    </div>
  );
}
