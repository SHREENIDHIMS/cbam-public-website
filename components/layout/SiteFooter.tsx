import Link from 'next/link';
import { FOOTER_GROUPS } from '@/lib/config/navigation';
import { rules } from '@/lib/config/rules';
import { siteConfig } from '@/lib/config/site';
import { formatDateShort } from '@/lib/utils/format';
import { BrandMark } from './BrandMark';
import { PageContainer } from './PageContainer';

export function SiteFooter() {
  return (
    <footer data-tone="inverse" className="bg-inverse text-ink">
      <PageContainer className="pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="space-y-5">
            <BrandMark className="text-ink [&_svg]:text-ink" />
            <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
              {siteConfig.tagline} Indicative previews and plain-English guidance for UK CBAM. Not
              legal or tax advice.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="t-label border-b border-line pb-3">{group.title}</h2>
                <ul className="m-0 mt-4 list-none space-y-2.5 p-0">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[0.9375rem] text-ink-muted no-underline decoration-1 underline-offset-[0.3em] hover:text-ink hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <dl className="t-figure mt-16 grid gap-x-8 gap-y-3 border-t border-line pt-6 text-[0.8125rem] text-ink-muted sm:grid-cols-[auto_1fr]">
          <dt className="t-label">Rules snapshot</dt>
          <dd className="m-0">
            {rules.rulesVersion}, reviewed {formatDateShort(rules.reviewedAt)}
          </dd>
          <dt className="t-label">Entity</dt>
          <dd className="m-0">
            {siteConfig.legalEntity.name} · {siteConfig.legalEntity.companyNumber} ·{' '}
            {siteConfig.legalEntity.registeredAddress}
          </dd>
          <dt className="t-label">Contact</dt>
          <dd className="m-0">{siteConfig.contact.general}</dd>
        </dl>
      </PageContainer>
    </footer>
  );
}
