import { ContainerArt } from '@/components/home/ContainerArt';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from '@/lib/config/navigation';

/**
 * Closing call to action on the full-orange ground (the reference's CTA band): one display line,
 * one action, one reassurance. data-tone="brand" turns the primary button navy with white text.
 */
export function CTASection({
  id = 'final-cta-title',
  title,
  body,
  note,
}: {
  id?: string;
  title: string;
  body: string;
  note?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      data-tone="brand"
      className="relative overflow-hidden bg-brand text-ink"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-[34rem] opacity-25 lg:block"
      >
        <ContainerArt variant="still" />
      </div>
      <PageContainer className="relative py-[var(--section-gap)]">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="t-eyebrow mb-6">Your UK CBAM position</p>
            <h2 id={id} className="t-display max-w-[14ch] text-white">
              {title}
            </h2>
            <p className="t-lead mt-6 text-ink">{body}</p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <ButtonLink
              href={PRIMARY_CTA_HREF}
              size="lg"
              className="w-full sm:w-auto"
              track={{ location: 'section', cta: 'check_exposure' }}
            >
              {PRIMARY_CTA_LABEL}
            </ButtonLink>
            {note ? <p className="mt-5 max-w-xs text-sm text-ink">{note}</p> : null}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
