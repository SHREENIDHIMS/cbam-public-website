import { FlaskConical } from 'lucide-react';
import { Alert } from '@/components/shared/Alert';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { LiabilityPreview } from '@/lib/api/schemas';
import { getStatus } from '@/lib/config/status';
import { DemoDataIndicator } from './DemoDataIndicator';
import { StaleRulesNotice } from './StaleRulesNotice';

/** Title, status, demo markers and notices for the preview result. */
export function PreviewResultHeader({ result }: { result: LiabilityPreview }) {
  const status = getStatus(result.status);
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
        <h1 id="preview-title" className="t-chapter">
          Indicative CBAM preview
        </h1>
        <p className="t-figure text-[0.8125rem] text-ink-subtle">Step 6 of 6 · Preview</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={result.status} />
        <DemoDataIndicator dataSource={result.dataSource} />
      </div>
      <p className="t-lead">{status.resultHeadline}.</p>

      {result.isDemo ? (
        <Alert tone="watch" title="Demo result: not calculated from your file">
          <span className="flex items-start gap-2">
            <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              {result.sampleNote} The lines below are a worked sample, so you can see the full
              layout. Every amount uses scenario assumptions, not official figures.
            </span>
          </span>
        </Alert>
      ) : result.sampleNote ? (
        <Alert tone="info">{result.sampleNote}</Alert>
      ) : null}
      <StaleRulesNotice rulesVersion={result.rulesVersion} />
    </header>
  );
}
