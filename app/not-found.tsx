import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Page not found',
  description: 'The page you were looking for does not exist.',
  path: '/',
  noindex: true,
});

export default function NotFound() {
  return (
    <PageContainer className="py-[var(--section-gap)]">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b-2 border-ink pb-6">
        <h1 className="t-chapter">We could not find that page</h1>
        <span className="stamp stamp-tilt text-primary">Error 404</span>
      </div>
      <p className="t-lead mt-6">
        The link may be out of date or the page may have moved. You can check your exposure or read
        our guides instead.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/exposure-check">Check my exposure</ButtonLink>
        <ButtonLink href="/guides" variant="secondary">
          Read the guides
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
