import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { LiabilityPreviewLoader } from '@/components/tools/LiabilityPreviewLoader';
import { AdapterUnavailable } from '@/components/shared/AdapterUnavailable';
import { attempt } from '@/lib/api/attempt';
import { getAdapter } from '@/lib/api/client';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatInteger } from '@/lib/utils/format';

export const metadata = routeMetadata('/liability-preview');

const MEGABYTE = 1024 * 1024;

export default async function LiabilityPreviewPage() {
  const loaded = await attempt(() => getAdapter().getPublicProductConfig());
  if (!loaded.ok) {
    return <AdapterUnavailable title="The liability preview is unavailable" error={loaded.error} />;
  }
  const config = loaded.data;
  const { maxFileBytes, maxDataRows } = config.uploadLimits;

  return (
    <>
      <PageHeader
        formLabel="Liability preview"
        title="See your position, line by line."
        lead="Upload a customs export. We check the headings, map the columns with you, validate every row and show where each figure comes from."
      />
      <section aria-label="Liability preview" className="bg-canvas pb-20 md:pb-28">
        <PageContainer>
          <div className="mx-auto max-w-4xl">
            <noscript>
              <div className="mb-6 rounded-sm border border-line bg-surface p-5">
                <p className="font-semibold text-ink">This tool needs JavaScript.</p>
                <p className="mt-1 text-ink-muted">
                  Your file is read in your browser, so it cannot be checked without it. The
                  threshold checker also works without a file.
                </p>
                <div className="mt-4">
                  <ButtonLink href="/threshold-checker" variant="secondary">
                    Open the threshold checker
                  </ButtonLink>
                </div>
              </div>
            </noscript>
            <LiabilityPreviewLoader
              maxFileMb={formatInteger(maxFileBytes / MEGABYTE)}
              maxRows={formatInteger(maxDataRows)}
              dataSource={config.dataSource}
            />
            <p className="mt-6 text-sm text-ink-subtle">
              Results are indicative and not legal or tax advice. Amounts use scenario assumptions,
              not official rates.
            </p>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
