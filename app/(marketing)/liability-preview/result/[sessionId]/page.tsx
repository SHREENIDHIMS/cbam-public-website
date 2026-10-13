import type { Route } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { WorkspaceCta } from '@/components/conversion/WorkspaceCta';
import { LiabilitySummary } from '@/components/results/LiabilitySummary';
import { LiabilityTable } from '@/components/results/LiabilityTable';
import { LineWorkings } from '@/components/results/LineWorkings';
import { MethodologyDrawerClient } from '@/components/results/MethodologyDrawerClient';
import { PreviewResultHeader } from '@/components/results/PreviewResultHeader';
import { PrintButton } from '@/components/results/PrintButton';
import { ResultNotice } from '@/components/results/ResultNotice';
import { SupplierExposureList } from '@/components/results/SupplierExposureList';
import { ThresholdPosition } from '@/components/results/ThresholdPosition';
import { TrackOnMount } from '@/components/results/TrackOnMount';
import { getAdapter } from '@/lib/api/client';
import { ApiError, toUserMessage } from '@/lib/api/errors';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Your liability preview',
  description: 'An indicative, line-by-line CBAM preview with its workings.',
  path: '/liability-preview',
  noindex: true,
});

export default async function LiabilityResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const adapter = getAdapter();

  let preview: Awaited<ReturnType<typeof adapter.getLiabilityPreview>>;
  try {
    preview = await adapter.getLiabilityPreview(sessionId);
  } catch (error) {
    if (error instanceof ApiError && error.code === 'not_found') {
      return (
        <PageContainer className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <EmptyState
              headingLevel={1}
              title="We could not find that preview"
              description="It may have expired, or the link may be incomplete. Upload a customs file or run the quick estimate to get a new result."
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/liability-preview">Upload a file</ButtonLink>
                  <ButtonLink href="/quick-estimate" variant="secondary">
                    Quick estimate
                  </ButtonLink>
                </div>
              }
            />
          </div>
        </PageContainer>
      );
    }
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            headingLevel={1}
            title="We could not show your preview"
            description={toUserMessage(error)}
            action={<ButtonLink href="/liability-preview">Start again</ButtonLink>}
          />
        </div>
      </PageContainer>
    );
  }

  if (preview.processingStatus === 'processing') {
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            headingLevel={1}
            title="Your preview is still being prepared"
            description="This usually takes a moment. Refresh the page to check again."
            action={
              <ButtonLink href={`/liability-preview/result/${preview.sessionId}` as Route}>
                Refresh
              </ButtonLink>
            }
          />
        </div>
      </PageContainer>
    );
  }
  if (preview.processingStatus === 'failed') {
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            headingLevel={1}
            title="We could not complete the preview"
            description="The calculation did not finish. Your uploaded file has not been changed. Please upload it again."
            action={<ButtonLink href="/liability-preview">Upload again</ButtonLink>}
          />
        </div>
      </PageContainer>
    );
  }

  const rulesSummary = await adapter.getPublicRulesSummary();

  return (
    <PageContainer className="py-12 md:py-16">
      <div className="mx-auto flex max-w-site flex-col gap-10">
        <PreviewResultHeader result={preview} />
        <LiabilitySummary result={preview} />
        <ThresholdPosition result={preview} />
        <LiabilityTable lines={preview.lines} sectors={rulesSummary.sectors} />
        <LineWorkings result={preview} />
        <SupplierExposureList suppliers={preview.suppliers} />
        <MethodologyDrawerClient
          methodology={preview.methodology}
          rulesVersion={preview.rulesVersion}
        />
        <WorkspaceCta />
        <ResultNotice rulesVersion={preview.rulesVersion} />
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
          <PrintButton label="Print this preview" />
          <ButtonLink href="/liability-preview" variant="secondary" className="w-full sm:w-auto">
            Check another file
          </ButtonLink>
        </div>
      </div>
      <TrackOnMount
        event={{
          name: 'preview_viewed',
          properties: { status: preview.status, isDemo: preview.isDemo },
        }}
      />
    </PageContainer>
  );
}
