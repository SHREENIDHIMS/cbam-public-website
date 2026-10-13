'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface WorkedTab {
  id: string;
  label: string;
  panel: ReactNode;
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern). The panels are rendered on the server and passed in, so
 * this island only switches which one is visible. With JavaScript off every panel stays visible.
 */
export function WorkedExampleTabs({ tabs, label }: { tabs: readonly WorkedTab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const baseId = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (id: string) => {
    setActive(id);
    refs.current[id]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    const target = tabs[next];
    if (target) focusTab(target.id);
  };

  return (
    <div>
      <noscript>
        <style>{'[data-worked-panel][hidden]{display:block!important}'}</style>
      </noscript>
      <div
        role="tablist"
        aria-label={label}
        className="-mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 md:mx-0 md:px-0"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                refs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                '-mb-px min-h-12 shrink-0 cursor-pointer border-b-2 px-4 text-base font-semibold whitespace-nowrap',
                selected
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          data-worked-panel=""
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="pt-10"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
