import { DecisionBadge } from '@/components/content/DecisionBadge';
import { DecisionList } from '@/components/content/DecisionList';
import { WorkedExampleTabs, type WorkedTab } from '@/components/content/WorkedExampleTabs';
import { WorkedFileView } from '@/components/content/WorkedFileView';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { DemoDataIndicator } from '@/components/results/DemoDataIndicator';
import { ResultNotice } from '@/components/results/ResultNotice';
import { pence } from '@/components/results/money';
import { Alert } from '@/components/shared/Alert';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ScenarioBadge } from '@/components/tools/ScenarioBadge';
import { AdapterUnavailable } from '@/components/shared/AdapterUnavailable';
import { attempt } from '@/lib/api/attempt';
import { getAdapter } from '@/lib/api/client';
import type { LiabilityPreview } from '@/lib/api/schemas';
import {
  DECISION_COPY,
  DECISION_KINDS,
  buildWorkedExample,
  countDecisions,
  type WorkedFile,
} from '@/lib/content/worked-example';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatGBPExact, formatInteger, formatPercent, formatTonnes } from '@/lib/utils/format';

export const metadata = routeMetadata('/worked-example');

function LedgerPanel({ files }: { files: readonly WorkedFile[] }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-3xl">
        <p className="text-lg text-ink-muted">
          A fictional importer holds a customs ledger and gets shipment files from two suppliers.
          One is tidy. The other is the kind of spreadsheet that really arrives. Both are run
          through the same checks the liability preview uses in your browser, and every decision is
          shown rather than hidden.
        </p>
        <p className="mt-4 text-ink-muted">
          Use the tabs to look at each file, at the decisions made, and at the preview that results.
          Nothing here is typed by hand: the outcomes come from running the checks.
        </p>
      </div>

      <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
        {files.map((file) => (
          <li key={file.id} className="rounded-sm border border-line bg-surface p-6 shadow-sm">
            <h3 className="t-title">{file.title}</h3>
            <p className="mt-1 text-sm text-ink-subtle">{file.format}</p>
            <p className="mt-4 text-ink-muted">{file.blurb}</p>
            <p className="mt-5 text-sm text-ink-muted tabular-nums">
              {formatInteger(file.counts.rowsFound)} rows found,{' '}
              {formatInteger(file.counts.included)} ready to use
              {file.counts.needsReview + file.counts.duplicates > 0
                ? `, ${formatInteger(file.counts.needsReview + file.counts.duplicates)} needing review`
                : ''}
              {file.counts.rejected > 0 ? `, ${formatInteger(file.counts.rejected)} rejected` : ''}.
            </p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="legend-title">
        <h3 id="legend-title" className="t-title">
          Four outcomes
        </h3>
        <ul className="m-0 mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {DECISION_KINDS.map((kind) => (
            <li key={kind} className="rounded-sm border border-line bg-surface p-4">
              <DecisionBadge kind={kind} />
              <p className="mt-3 text-sm text-ink-muted">{DECISION_COPY[kind].meaning}</p>
            </li>
          ))}
        </ul>
      </section>

      <Alert tone="info" title="What the engine does not do">
        It does not decide what is in scope, and it does not make up values. A line it is unsure
        about stays held until a person looks at it. Rows added to this example for illustration are
        named as such.
      </Alert>
    </div>
  );
}

function PreviewCard({ title, preview }: { title: string; preview: LiabilityPreview }) {
  const { summary, threshold } = preview;
  return (
    <article className="rounded-sm border border-line bg-surface p-6 shadow-sm">
      <h3 className="t-title">{title}</h3>
      <p className="mt-1 text-sm text-ink-subtle">
        {formatInteger(preview.rowCounts.received)} lines sent for the preview
      </p>
      <dl className="m-0 mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-ink-subtle">Covered lines</dt>
          <dd className="t-figure-lg m-0">{formatInteger(summary.coveredLines)}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-subtle">Covered tonnes</dt>
          <dd className="t-figure-lg m-0">{formatTonnes(summary.coveredMassTonnes)}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-subtle">Covered import value</dt>
          <dd className="t-figure-lg m-0">{formatGBPExact(summary.coveredValueGbp)}</dd>
        </div>
        <div>
          <dt className="flex flex-wrap items-center gap-2 text-sm text-ink-subtle">
            Indicative liability <ScenarioBadge className="text-xs" />
          </dt>
          <dd className="t-figure-lg m-0">{pence(summary.netGbp)}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4 text-sm text-ink-muted">
        <StatusBadge status={preview.status} />
        {threshold.ratio !== null ? (
          <span className="tabular-nums">{formatPercent(threshold.ratio)} of the threshold</span>
        ) : null}
      </div>
    </article>
  );
}

function PreviewPanel({ a, b }: { a: LiabilityPreview; b: LiabilityPreview }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-3xl">
        <p className="text-lg text-ink-muted">
          Only rows that passed the checks go into the preview. Rows that needed review or were
          rejected are not in these figures, so nothing is counted that nobody has looked at.
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-subtle">
          <DemoDataIndicator dataSource={a.dataSource} />
          <span>
            Pre-computed for the sample files. The rate, relief and intensities are scenario values.
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PreviewCard title="Supplier A file" preview={a} />
        <PreviewCard title="Supplier B file" preview={b} />
      </div>
      <ResultNotice />
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/liability-preview" size="lg">
          Try it with your own file
        </ButtonLink>
        <ButtonLink href="/how-it-works" variant="secondary" size="lg">
          How it works
        </ButtonLink>
      </div>
    </div>
  );
}

export default async function WorkedExamplePage() {
  const { files } = buildWorkedExample();
  const [fileA, fileB] = files;
  const counts = countDecisions(files);
  const adapter = getAdapter();
  const loaded = await attempt(() =>
    Promise.all([
      adapter.getLiabilityPreview('fx_northstar'),
      adapter.getLiabilityPreview('fx_supplier_b'),
    ]),
  );
  if (!loaded.ok) {
    return <AdapterUnavailable title="The worked example could not load" error={loaded.error} />;
  }
  const [previewA, previewB] = loaded.data;

  const tabs: WorkedTab[] = [
    { id: 'ledger', label: 'Import ledger', panel: <LedgerPanel files={files} /> },
    { id: 'supplier-a', label: 'Supplier A', panel: <WorkedFileView file={fileA} /> },
    { id: 'supplier-b', label: 'Supplier B', panel: <WorkedFileView file={fileB} /> },
    {
      id: 'decisions',
      label: 'Engine decisions',
      panel: <DecisionList files={files} counts={counts} />,
    },
    { id: 'preview', label: 'Preview output', panel: <PreviewPanel a={previewA} b={previewB} /> },
  ];

  return (
    <>
      <PageHeader
        formLabel="Worked example"
        title="What happens to a messy file."
        lead="A fictional importer, two supplier files and every decision the engine makes along the way. It shows what was detected, normalised, held for review or rejected."
      />
      <Section spacing="compact" labelledBy="example-title" className="pt-4">
        <h2 id="example-title" className="sr-only">
          The worked example
        </h2>
        <WorkedExampleTabs tabs={tabs} label="Worked example steps" />
      </Section>
      <PageContainer className="pb-20 md:pb-28">
        <p className="max-w-2xl text-sm text-ink-subtle">
          Supplier A is the Northstar sample file with one extra row (row 9, no commodity code)
          added so a rejection can be shown. Supplier B is the messy sample workbook. All companies
          and figures are fictional.
        </p>
      </PageContainer>
    </>
  );
}
