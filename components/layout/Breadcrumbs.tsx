import type { Route } from 'next';
import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: Route;
}

export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="underline underline-offset-2 hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span {...(last ? { 'aria-current': 'page' as const } : {})}>{item.label}</span>
              )}
              {last ? null : <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
