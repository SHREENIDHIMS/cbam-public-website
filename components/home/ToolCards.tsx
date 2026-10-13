import { Calculator, FileUp, Gauge, Radar, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from '@/lib/config/navigation';
import { TOOL_CARDS } from '@/lib/config/home-content';

const ICONS: Record<(typeof TOOL_CARDS)[number]['key'], LucideIcon> = {
  exposure: Gauge,
  quick: Calculator,
  threshold: Radar,
  preview: FileUp,
};

const PLACE = [
  'md:col-start-1 md:row-start-1',
  'md:col-start-1 md:row-start-2',
  'md:col-start-3 md:row-start-1',
  'md:col-start-3 md:row-start-2',
];

/**
 * Orange band with four white tool cards around one taller call-to-action card (the reference's
 * "Our services"). White cards use data-tone="paper" so they keep their normal ink on orange.
 */
export function ToolCards() {
  return (
    <section
      aria-labelledby="tools-title"
      data-tone="brand"
      className="bg-brand py-[var(--section-gap)] text-ink"
    >
      <PageContainer>
        <p className="t-eyebrow justify-center">Free public tools</p>
        <h2 id="tools-title" className="t-display mt-6 text-center text-white">
          Start without signing in
        </h2>
        <ul className="m-0 mt-16 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3 md:grid-rows-2">
          {TOOL_CARDS.map((tool, index) => {
            const Icon = ICONS[tool.key];
            return (
              <li key={tool.key} className={PLACE[index]}>
                <article
                  data-tone="paper"
                  className="relative flex h-full min-h-64 flex-col justify-between gap-10 rounded-xs bg-surface p-6 text-ink"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon aria-hidden="true" className="size-9 text-ink" strokeWidth={1.5} />
                    <span className="t-label text-primary">{tool.tag}</span>
                  </div>
                  <div>
                    <h3 className="t-title">
                      <Link
                        href={tool.href}
                        className="no-underline after:absolute after:inset-0 after:content-[''] hover:text-primary"
                      >
                        {tool.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-ink-muted">{tool.body}</p>
                  </div>
                </article>
              </li>
            );
          })}
          <li className="md:col-start-2 md:row-span-2 md:row-start-1">
            <div
              data-tone="paper"
              className="flex h-full min-h-72 flex-col items-center justify-center gap-6 rounded-xs bg-surface p-8 text-center text-ink"
            >
              <span className="t-label rounded-xs border border-line px-3 py-1.5">Our tools</span>
              <h3 className="t-title">Discover where you stand</h3>
              <p className="max-w-[28ch] text-ink-muted">
                Four ways in, all free and all labelled with where each figure came from.
              </p>
              <ButtonLink
                href={PRIMARY_CTA_HREF}
                track={{ location: 'section', cta: 'check_exposure' }}
              >
                {PRIMARY_CTA_LABEL}
              </ButtonLink>
            </div>
          </li>
        </ul>
      </PageContainer>
    </section>
  );
}
