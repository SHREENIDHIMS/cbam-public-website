import { ButtonLink } from '@/components/shared/ButtonLink';
import { getRoute, type PublicPath } from '@/lib/config/routes';
import { PageContainer } from './PageContainer';

/** Placeholder for routes whose content ships in a later phase. Noindex, not in the sitemap. */
export function HoldingPage({ path }: { path: PublicPath }) {
  const route = getRoute(path);
  return (
    <PageContainer className="py-20 md:py-28">
      <p className="t-label text-ink-subtle">Coming soon</p>
      <h1 className="t-chapter mt-3">{route.title}</h1>
      <p className="mt-4 max-w-prose text-lg text-ink-muted">{route.description}</p>
      <p className="mt-4 max-w-prose text-ink-muted">
        This page is still being built. In the meantime you can start from the exposure check.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </PageContainer>
  );
}
