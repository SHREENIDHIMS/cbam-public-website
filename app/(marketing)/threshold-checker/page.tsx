import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ResultNotice } from '@/components/results/ResultNotice';
import { StaleRulesNotice } from '@/components/results/StaleRulesNotice';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { ThresholdCheckerClient } from '@/components/tools/ThresholdCheckerClient';
import { AdapterUnavailable } from '@/components/shared/AdapterUnavailable';
import { attempt } from '@/lib/api/attempt';
import { getAdapter } from '@/lib/api/client';
import { rules } from '@/lib/config/rules';
import { toolsConfig } from '@/lib/config/tools';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatGBP } from '@/lib/utils/format';

export const metadata = routeMetadata('/threshold-checker');

export default async function ThresholdCheckerPage() {
  const loaded = await attempt(() => getAdapter().getPublicRulesSummary());
  if (!loaded.ok) {
    return <AdapterUnavailable title="The threshold checker is unavailable" error={loaded.error} />;
  }
  const summary = loaded.data;
  const { registrationThreshold, thresholdTests, thresholdExclusions } = rules;

  return (
    <>
      <PageHeader
        formLabel="Threshold checker"
        title="See both registration tests at a glance."
        lead="Enter a yearly value and, if you like, what you expect in the next 30 days. The look-back and forward-looking views update as you type."
      />
      <section aria-label="Threshold checker" className="bg-canvas pb-20 md:pb-28">
        <PageContainer>
          <ThresholdCheckerClient
            thresholdAmount={summary.thresholdAmount}
            sectors={summary.sectors}
            guidance={toolsConfig.thresholdGuidanceBands}
            maxRatio={toolsConfig.thresholdChecker.gaugeMaxRatio}
            tests={thresholdTests.value ?? []}
            testsSource={{
              provenance: thresholdTests.status,
              title: thresholdTests.sourceTitle,
              url: thresholdTests.sourceUrl,
              date: thresholdTests.sourceDate,
            }}
            exclusionsSource={{
              title: thresholdExclusions.sourceTitle,
              url: thresholdExclusions.sourceUrl,
            }}
            dataSource={summary.dataSource}
            thresholdFact={
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  Registration threshold used:{' '}
                  <span className="font-semibold text-ink">
                    {summary.thresholdAmount === null
                      ? 'to be confirmed'
                      : formatGBP(summary.thresholdAmount)}
                  </span>
                </span>
                <ProvenanceBadge provenance={registrationThreshold.status} />
                <ExternalLink href={registrationThreshold.sourceUrl}>
                  {registrationThreshold.sourceTitle}
                </ExternalLink>
              </p>
            }
            notices={
              <div className="flex flex-col gap-4">
                <StaleRulesNotice rulesVersion={summary.rulesVersion} />
                <ResultNotice rulesVersion={summary.rulesVersion} />
              </div>
            }
          />
        </PageContainer>
      </section>
    </>
  );
}
