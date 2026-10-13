import { HeroTabs } from '@/components/home/HeroTabs';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { HERO_TABS } from '@/lib/config/home-content';
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from '@/lib/config/navigation';
import { rules } from '@/lib/config/rules';
import { formatDateShort } from '@/lib/utils/format';
import { formatStartEyebrow } from '@/lib/utils/rules-dates';
import { JourneyArt } from './GoodsJourney';

/**
 * Full-height navy hero (the header floats transparent over it, marked by data-hero). The goods
 * journey drawing runs along the bottom; the three tool tabs and the rules snapshot sit under it.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      data-hero=""
      data-tone="inverse"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-inverse text-ink"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_78%_28%,rgb(255_93_24/0.3),transparent_70%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[46%] opacity-90">
        <JourneyArt />
      </div>

      <PageContainer className="relative z-10 flex flex-1 flex-col justify-center pt-36 pb-[24vh]">
        <p className="mb-8 inline-flex w-fit items-center gap-2 rounded-xs bg-white px-3 py-1.5 text-[0.75rem] font-medium tracking-wide text-[#060517] uppercase">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {formatStartEyebrow()}
        </p>
        <h1 id="hero-title" className="t-display max-w-[15ch]">
          Know what is covered, what is owed and what is missing.
        </h1>
        <p className="t-lead mt-8 max-w-[46ch]">
          Bring in customs and supplier emissions data. Get an indicative exposure, a threshold
          position and a readiness checklist, with every figure labelled by where it came from.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonLink
            href={PRIMARY_CTA_HREF}
            size="lg"
            track={{ location: 'hero', cta: 'check_exposure' }}
          >
            {PRIMARY_CTA_LABEL}
          </ButtonLink>
          <ButtonLink href="/how-it-works" variant="ghost" size="lg">
            See how it works
          </ButtonLink>
        </div>
        <p className="mt-8 max-w-md text-sm text-ink-muted">
          Indicative previews based on the information you provide. Not legal or tax advice.
        </p>
      </PageContainer>

      <div className="relative z-10 border-t border-line bg-inverse/85 backdrop-blur-sm">
        <PageContainer className="flex flex-col gap-3 py-3">
          <HeroTabs tabs={HERO_TABS} />
          <p className="t-figure border-t border-line pt-3 text-[0.8125rem] text-ink-muted">
            Rules snapshot {formatDateShort(rules.reviewedAt)}
            <span className="hidden sm:inline"> · {rules.rulesVersion}</span>
          </p>
        </PageContainer>
      </div>
    </section>
  );
}
