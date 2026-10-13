import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { QuickEstimateWizard } from '@/components/tools/QuickEstimateWizard';
import { AdapterUnavailable } from '@/components/shared/AdapterUnavailable';
import { attempt } from '@/lib/api/attempt';
import { getAdapter } from '@/lib/api/client';
import { routeMetadata } from '@/lib/seo/metadata';
import { answersFromInput, parseQuickEstimateSearchParams } from '@/lib/validation/quick-estimate';

export const metadata = routeMetadata('/quick-estimate');

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function QuickEstimatePage({ searchParams }: { searchParams: SearchParams }) {
  const [params, loaded] = await Promise.all([
    searchParams,
    attempt(() => getAdapter().getPublicRulesSummary()),
  ]);
  if (!loaded.ok) {
    return <AdapterUnavailable title="The quick estimate is unavailable" error={loaded.error} />;
  }
  const summary = loaded.data;
  // "Change answers" links back here with the answer bands in the address.
  const parsed = parseQuickEstimateSearchParams(params);

  return (
    <>
      <PageHeader
        formLabel="Quick estimate"
        title="Five questions. About a minute."
        lead="Rough ranges are fine. You will get a likely status, the reasons behind it and how confident we are."
      />
      <section aria-label="Quick estimate" className="bg-canvas pb-20 md:pb-28">
        <PageContainer>
          <div className="mx-auto max-w-3xl">
            <noscript>
              <div className="mb-6 rounded-sm border border-line bg-surface p-5">
                <p className="font-semibold text-ink">This estimate needs JavaScript.</p>
                <p className="mt-1 text-ink-muted">
                  You can still read the sourced guides without it.
                </p>
                <div className="mt-4">
                  <ButtonLink href="/guides" variant="secondary">
                    Read the guides
                  </ButtonLink>
                </div>
              </div>
            </noscript>
            <QuickEstimateWizard
              sectors={summary.sectors}
              defaultAnswers={parsed.success ? answersFromInput(parsed.data) : undefined}
            />
            <p className="mt-6 text-sm text-ink-subtle">
              Your answers stay in your browser while you answer. Only the ranges you chose go into
              the result link. Not legal or tax advice.
            </p>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
