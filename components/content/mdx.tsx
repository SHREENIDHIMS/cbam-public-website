import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { Info, TriangleAlert } from 'lucide-react';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { getRuleDisplay, isRuleDisplayKey } from '@/lib/utils/rules-display';
import { cn } from '@/lib/utils/cn';

/**
 * Components available inside guide MDX. Regulatory figures are written as <Rule k="..." /> so they
 * come from lib/config/rules.ts and carry a badge unless they are official (DECISIONS 10).
 */

export function Rule({ k }: { k: string }) {
  if (!isRuleDisplayKey(k)) throw new Error(`Unknown rule key in guide: ${k}`);
  const display = getRuleDisplay(k);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 font-semibold text-ink">
      {display.text}
      {display.status === 'official' ? null : (
        <ProvenanceBadge provenance={display.status} className="align-middle text-xs" />
      )}
    </span>
  );
}

export function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: 'note' | 'caution';
  title?: string;
  children: ReactNode;
}) {
  const Icon = tone === 'caution' ? TriangleAlert : Info;
  return (
    <aside
      className={cn(
        'not-prose my-8 flex gap-4 rounded-sm border p-5',
        tone === 'caution'
          ? 'border-watch-fg/30 bg-watch-bg text-watch-fg'
          : 'border-info-fg/25 bg-info-bg text-info-fg',
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 text-base leading-relaxed [&>p+p]:mt-3">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children}
      </div>
    </aside>
  );
}

export function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div
      className="relative my-8 overflow-x-auto rounded-sm border border-line"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="w-full min-w-[32rem] border-collapse text-left text-base">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-alt text-sm text-ink">
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col" className="px-4 py-3 font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')} className="border-t border-line align-top">
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${index}`}
                  className={cn('px-4 py-3', index === 0 && 'font-medium text-ink')}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Anchor({ href = '', children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  if (/^https?:\/\//.test(href)) {
    return <ExternalLink href={href}>{children}</ExternalLink>;
  }
  if (href.startsWith('/')) {
    return (
      <Link href={href as Route} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export const guideMdxComponents = { Rule, Callout, DataTable, a: Anchor };
