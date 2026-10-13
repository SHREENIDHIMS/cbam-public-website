'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FEATURES } from '@/lib/config/home-content';
import { cn } from '@/lib/utils/cn';

/**
 * The six capabilities as an accordion with one item open at a time (the reference's
 * "Intelligent logistics" block). Each title is a real h3 around its toggle button.
 */
export function FeatureAccordion({ items }: { items: typeof FEATURES }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="border-t border-line">
      {items.map((feature, index) => {
        const isOpen = index === open;
        return (
          <div key={feature.key} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`feature-panel-${feature.key}`}
                id={`feature-toggle-${feature.key}`}
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-4 text-left font-display text-xl font-medium tracking-[-0.02em] text-ink hover:text-primary"
              >
                {feature.title}
                {isOpen ? (
                  <Minus aria-hidden="true" className="size-5 shrink-0" />
                ) : (
                  <Plus aria-hidden="true" className="size-5 shrink-0" />
                )}
              </button>
            </h3>
            <div
              id={`feature-panel-${feature.key}`}
              role="region"
              aria-labelledby={`feature-toggle-${feature.key}`}
              data-open={isOpen}
              className={cn('acc-panel')}
            >
              <div>
                <p className="max-w-md pb-6 text-ink-muted">{feature.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
