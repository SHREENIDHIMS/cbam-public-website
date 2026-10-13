import { PageContainer } from '@/components/layout/PageContainer';
import { toPageMessage } from '@/lib/api/errors';
import { ButtonLink } from './ButtonLink';
import { ErrorState } from './ErrorState';

/**
 * Shown in place of a page when the service it needs fails in live mode. It says what happened and
 * what was not calculated; nothing is replaced with demo data.
 */
export function AdapterUnavailable({
  title = 'This page could not load its data',
  error,
}: {
  title?: string;
  error: unknown;
}) {
  return (
    <PageContainer className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <ErrorState
          headingLevel={1}
          title={title}
          description={toPageMessage(error)}
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/">Back to home</ButtonLink>
              <ButtonLink href="/guides" variant="secondary">
                Read the guides
              </ButtonLink>
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
