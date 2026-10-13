import { TrackedLinkClient } from '@/components/conversion/TrackedLinkClient';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { toolsConfig } from '@/lib/config/tools';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatInteger } from '@/lib/utils/format';

export const metadata = routeMetadata('/exposure-check');

const MEGABYTE = 1024 * 1024;

const pathClass =
  'box group relative flex flex-col transition-colors duration-150 hover:border-ink';

export default function ExposureCheckPage() {
  const { maxFileBytes, maxDataRows } = toolsConfig.upload;
  const limits = `Up to ${formatInteger(maxFileBytes / MEGABYTE)} MB and ${formatInteger(maxDataRows)} rows`;

  return (
    <>
      <PageHeader
        formLabel="Check exposure"
        title="Choose the fastest path for the data you have."
        lead="Two ways to see where you stand. Neither needs an account, and both show their working."
      />
      <section
        aria-label="Ways to check your exposure"
        className="bg-canvas pt-12 pb-[var(--section-gap)] md:pt-16"
      >
        <PageContainer>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className={pathClass}>
              <div className="box-head">
                <span className="t-label text-ink">Path A · No file needed</span>
                <span className="t-figure text-[0.8125rem]">About 60 seconds</span>
              </div>
              <div className="box-body flex flex-1 flex-col">
                <h2 className="t-chapter">Quick estimate</h2>
                <p className="t-lead mt-4">For when you do not have a customs export ready.</p>
                <ul className="ledger m-0 mt-6 list-none p-0 text-ink-muted">
                  <li className="py-2.5">Five short questions with rough ranges.</li>
                  <li className="py-2.5">A likely status, the reasons and how confident we are.</li>
                  <li className="py-2.5">A print-friendly result you can keep.</li>
                </ul>
                <div className="mt-auto pt-8">
                  <TrackedLinkClient
                    href="/quick-estimate"
                    location="exposure_check"
                    cta="quick_estimate"
                    className="btn btn-primary btn-lg w-full after:absolute after:inset-0 after:content-[''] sm:w-auto"
                  >
                    Start the quick estimate
                  </TrackedLinkClient>
                </div>
              </div>
            </article>

            <article className={pathClass}>
              <div className="box-head">
                <span className="t-label text-ink">Path B · Your own ledger</span>
                <span className="t-figure text-[0.8125rem]">CSV or XLSX</span>
              </div>
              <div className="box-body flex flex-1 flex-col">
                <h2 className="t-chapter">Upload customs data</h2>
                <p className="t-lead mt-4">For a data-backed preview.</p>
                <ul className="ledger m-0 mt-6 list-none p-0 text-ink-muted">
                  <li className="py-2.5">
                    A line-by-line indicative preview from your own ledger.
                  </li>
                  <li className="py-2.5">
                    Your suppliers ranked by exposure, with missing data flagged.
                  </li>
                  <li className="py-2.5">{limits}.</li>
                </ul>
                <div className="mt-auto pt-8">
                  <TrackedLinkClient
                    href="/liability-preview"
                    location="exposure_check"
                    cta="upload"
                    className="btn btn-secondary btn-lg w-full after:absolute after:inset-0 after:content-[''] sm:w-auto"
                  >
                    Upload a file
                  </TrackedLinkClient>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-y border-line py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="t-title">Just want to test the threshold?</p>
              <p className="mt-1 text-ink-muted">
                Try two simple numbers and see both threshold tests at a glance.
              </p>
            </div>
            <TrackedLinkClient
              href="/threshold-checker"
              location="exposure_check"
              cta="threshold_checker"
              className="btn btn-secondary btn-md shrink-0"
            >
              Open the threshold checker
            </TrackedLinkClient>
          </div>

          <p className="mt-6 max-w-2xl text-sm text-ink-subtle">
            Your file is read in your browser. When you run the preview, only the mapped columns of
            the rows that passed the checks are sent, never the file itself. Results are indicative
            and not legal or tax advice.
          </p>
        </PageContainer>
      </section>
    </>
  );
}
