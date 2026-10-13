import type { Route } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { ErrorState } from '@/components/shared/ErrorState';
import { QuickEstimateResult } from '@/components/results/QuickEstimateResult';
import { ResultNotice } from '@/components/results/ResultNotice';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TrackOnMount } from '@/components/results/TrackOnMount';
import { getAdapter } from '@/lib/api/client';
import type { QuickEstimateInput } from '@/lib/api/schemas';
import { toUserMessage } from '@/lib/api/errors';
import { getStatus } from '@/lib/config/status';
import { buildMetadata } from '@/lib/seo/metadata';
import { parseQuickEstimateSearchParams, toSearchParams } from '@/lib/validation/quick-estimate';

export const metadata = buildMetadata({
  title: 'Your quick estimate',
  description: 'An indicative position from the ranges you chose.',
  path: '/quick-estimate/result',
  noindex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function QuickEstimateResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const parsed = parseQuickEstimateSearchParams(params);

  if (!parsed.success) {
    const status = getStatus('needs_data');
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <StatusBadge status="needs_data" />
            <h1 className="t-chapter mt-5">{status.resultHeadline}</h1>
            <p className="mt-4 max-w-prose text-lg text-ink-muted">
              We could not read the answers in this link, so there is nothing to estimate. Start the
              quick estimate again, or upload customs data for a reliable view.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/quick-estimate" className="w-full sm:w-auto">
              Start the quick estimate
            </ButtonLink>
            <ButtonLink href="/liability-preview" variant="secondary" className="w-full sm:w-auto">
              Upload customs data
            </ButtonLink>
          </div>
          <ResultNotice />
        </div>
      </PageContainer>
    );
  }

  const input = parsed.data;
  const retryHref = `/quick-estimate/result?${toSearchParams(input)}` as Route;

  let loaded: Awaited<ReturnType<typeof loadEstimate>>;
  try {
    loaded = await loadEstimate(input);
  } catch (error) {
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            headingLevel={1}
            title="We could not prepare your estimate"
            description={toUserMessage(error)}
            action={
              <ButtonLink href={retryHref} variant="secondary">
                Try again
              </ButtonLink>
            }
          />
        </div>
      </PageContainer>
    );
  }

  const { result, summary } = loaded;
  return (
    <PageContainer className="py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <QuickEstimateResult
          result={result}
          input={input}
          sectors={summary.sectors}
          changeHref={`/quick-estimate?${toSearchParams(input)}` as Route}
        />
      </div>
      <TrackOnMount event={{ name: 'wizard_complete', properties: { status: result.status } }} />
    </PageContainer>
  );
}

async function loadEstimate(input: QuickEstimateInput) {
  const adapter = getAdapter();
  const [result, summary] = await Promise.all([
    adapter.runQuickEstimate(input),
    adapter.getPublicRulesSummary(),
  ]);
  return { result, summary };
}
