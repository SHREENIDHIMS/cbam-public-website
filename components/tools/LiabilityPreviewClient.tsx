'use client';

import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { track } from '@/lib/analytics';
import { Alert } from '@/components/shared/Alert';
import { Button } from '@/components/shared/Button';
import { ErrorState } from '@/components/shared/ErrorState';
import { ErrorSummary, type FieldIssue } from '@/components/shared/ErrorSummary';
import {
  apiErrorBodySchema,
  liabilityPreviewSchema,
  type CreateLiabilityPreviewInput,
  type LiabilityPreview,
} from '@/lib/api/schemas';
import { USER_MESSAGES } from '@/lib/api/errors';
import { getUploadField } from '@/lib/config/upload-fields';
import {
  applyManualChange,
  massUnitHint,
  missingRequiredFields,
  suggestMapping,
  type MappingSuggestion,
} from '@/lib/upload/column-matching';
import { rowBand, buildPreviewRequest } from '@/lib/upload/build-payload';
import { checkFile, type FileType } from '@/lib/upload/file-checks';
import {
  checkDataRows,
  discoverHeadings,
  pickSheet,
  type DiscoveredHeadings,
} from '@/lib/upload/headings';
import { sha256Hex } from '@/lib/upload/hash-file';
import { fileErrorMessage, type FileLevelError } from '@/lib/upload/issue-copy';
import type { ColumnChoice, MassUnit, ParsedSheet } from '@/lib/upload/types';
import { validateRows, type ValidationResult } from '@/lib/upload/validate-rows';
import { formatInteger } from '@/lib/utils/format';
import { ColumnDiscovery } from './ColumnDiscovery';
import { ColumnMapper, MAPPER_ID } from './ColumnMapper';
import { FileDropzone } from './FileDropzone';
import { FileRequirements } from './FileRequirements';
import { FlowSteps, type FlowStepKey } from './FlowSteps';
import { IssueList } from './IssueList';
import { ProcessingStatus } from './ProcessingStatus';
import { ScopeSummary } from './ScopeSummary';
import { SheetPicker } from './SheetPicker';
import { ValidationSummary } from './ValidationSummary';

export interface LiabilityPreviewClientProps {
  maxFileMb: string;
  maxRows: string;
  dataSource: 'fixture' | 'live';
}

const STEP_COPY: Record<Exclude<FlowStepKey, 'preview'>, { title: string; description: string }> = {
  upload: {
    title: 'Upload your customs export',
    description: 'A CSV or XLSX file with one line per import. We read it here, in your browser.',
  },
  headings: {
    title: 'Check what we found',
    description: 'We looked for your column headings and the first rows of data.',
  },
  mapping: {
    title: 'Map your columns',
    description:
      'Check each match and correct any that are wrong. Lower matches need a second look.',
  },
  validation: {
    title: 'Validate your rows',
    description:
      'Every row is checked before anything is sent. Problems are listed with their row.',
  },
  scope: {
    title: 'Resolve scope',
    description: 'The checked rows are sent to work out which lines are in scope.',
  },
};

interface Loaded {
  fileType: FileType;
  sha256: string;
  sheets: ParsedSheet[];
  sheetIndex: number;
  sheetNotice: string | null;
}

interface FlowState {
  step: Exclude<FlowStepKey, 'preview'>;
  loaded: Loaded | null;
  headings: DiscoveredHeadings | null;
  mapping: MappingSuggestion[];
  initialMapping: MappingSuggestion[];
  massUnit: MassUnit;
  validation: ValidationResult | null;
  request: CreateLiabilityPreviewInput | null;
}

const INITIAL: FlowState = {
  step: 'upload',
  loaded: null,
  headings: null,
  mapping: [],
  initialMapping: [],
  massUnit: 'kg',
  validation: null,
  request: null,
};

const WRAP_LABEL = { label: { whiteSpace: 'normal' as const, textAlign: 'center' as const } };

class ApiFailure extends Error {
  constructor(readonly userMessage: string) {
    super('api_failure');
  }
}

async function postPreview(request: CreateLiabilityPreviewInput): Promise<LiabilityPreview> {
  let response: Response;
  try {
    response = await fetch('/api/liability-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiFailure(USER_MESSAGES.unavailable);
  }
  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = apiErrorBodySchema.safeParse(json);
    throw new ApiFailure(parsed.success ? parsed.data.error.message : USER_MESSAGES.rejected);
  }
  const parsed = liabilityPreviewSchema.safeParse(json);
  if (!parsed.success) throw new ApiFailure(USER_MESSAGES.invalid_response);
  return parsed.data;
}

async function fetchPreview(sessionId: string): Promise<LiabilityPreview> {
  const response = await fetch(`/api/liability-preview/${encodeURIComponent(sessionId)}`, {
    cache: 'no-store',
  });
  const json: unknown = await response.json().catch(() => null);
  const parsed = liabilityPreviewSchema.safeParse(json);
  if (!response.ok || !parsed.success) throw new ApiFailure(USER_MESSAGES.unavailable);
  return parsed.data;
}

function StepFrame({
  step,
  children,
}: {
  step: Exclude<FlowStepKey, 'preview'>;
  children: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);
  const copy = STEP_COPY[step];
  return (
    <div className="rounded-sm border border-line bg-surface shadow-md">
      <div className="border-b border-line px-5 pt-5 pb-5 md:px-8 md:pt-6">
        <FlowSteps current={step} />
      </div>
      <div className="px-5 py-6 md:px-8 md:py-8">
        <h2 ref={headingRef} tabIndex={-1} className="t-title outline-none">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-prose text-ink-muted">{copy.description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

function Flow({ maxFileMb, maxRows, dataSource }: LiabilityPreviewClientProps) {
  const [state, setState] = useState<FlowState>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [mappingIssues, setMappingIssues] = useState<FieldIssue[]>([]);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: postPreview,
    onSuccess: (result) => {
      track({
        name: 'upload_complete',
        properties: { rowBand: rowBand(state.validation?.counts.included ?? 0) },
      });
      track({ name: 'upload_step', properties: { step: 'scope' } });
      void result;
    },
    onError: () => track({ name: 'upload_failed', properties: { reason: 'service_error' } }),
  });

  // A result that is still processing is polled until it is complete.
  const created = mutation.data;
  const poll = useQuery({
    queryKey: ['preview', created?.sessionId],
    queryFn: () => fetchPreview(created!.sessionId),
    enabled: created?.processingStatus === 'processing',
    refetchInterval: 2000,
  });
  const result = poll.data ?? created;

  const sheetNames = state.loaded?.sheets.map((sheet) => sheet.name) ?? [];

  const mappingMissing = useMemo(() => missingRequiredFields(state.mapping), [state.mapping]);
  const hint = massUnitHint(state.mapping);

  function go(step: FlowState['step']) {
    setState((current) => ({ ...current, step }));
    if (step !== 'upload' && step !== 'scope') {
      track({ name: 'upload_step', properties: { step } });
    }
  }

  function reject(
    error: FileLevelError,
    analytics: 'row_limit' | 'parse_error' | 'no_headings' | 'no_data_rows',
    count?: number,
  ) {
    setFileError(fileErrorMessage(error, count));
    track({ name: 'upload_failed', properties: { reason: analytics } });
  }

  async function handleFile(file: File) {
    setFileError(null);
    const check = checkFile(file);
    if (!check.ok) {
      setFileError(check.message);
      track({ name: 'upload_failed', properties: { reason: check.reason } });
      return;
    }
    track({ name: 'upload_start', properties: { fileType: check.fileType } });
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      // The parsers are separate chunks, fetched now if they were not already preloaded.
      const { parseWorkbook } = await import('@/lib/upload/parse-file');
      const [sha256, sheets] = await Promise.all([
        sha256Hex(buffer),
        parseWorkbook(buffer, check.fileType),
      ]);
      const picked = pickSheet(sheets);
      if (!picked.ok) return reject('no_headings', 'no_headings');
      const { headings, sheetIndex, switchedFrom } = picked.value;
      const rows = checkDataRows(headings);
      if (!rows.ok) {
        return rows.error === 'row_limit'
          ? reject('row_limit', 'row_limit', rows.count)
          : reject('no_data_rows', 'no_data_rows');
      }
      const mapping = suggestMapping(headings.headers, headings.dataRows);
      const unit = massUnitHint(mapping);
      setSheetError(null);
      setState({
        ...INITIAL,
        step: 'headings',
        loaded: {
          fileType: check.fileType,
          sha256,
          sheets,
          sheetIndex,
          sheetNotice: switchedFrom
            ? `We used sheet "${switchedFrom.to}" because "${switchedFrom.from}" has no column headings.`
            : null,
        },
        headings,
        mapping,
        initialMapping: mapping,
        massUnit: unit === 't' ? 'tonnes' : 'kg',
      });
      track({ name: 'upload_step', properties: { step: 'headings' } });
    } catch {
      reject('parse_error', 'parse_error');
    } finally {
      setBusy(false);
    }
  }

  function changeSheet(index: number) {
    const loaded = state.loaded;
    const sheet = loaded?.sheets[index];
    if (!loaded || !sheet) return;
    const found = discoverHeadings(sheet.rows);
    if (!found.ok) {
      setSheetError(
        `Sheet "${sheet.name}" has no column headings we recognise. Choose another sheet.`,
      );
      setState((current) => ({
        ...current,
        loaded: current.loaded && { ...current.loaded, sheetIndex: index, sheetNotice: null },
        headings: null,
        mapping: [],
        initialMapping: [],
      }));
      return;
    }
    const rows = checkDataRows(found.value);
    if (!rows.ok) {
      setSheetError(
        rows.error === 'row_limit'
          ? fileErrorMessage('row_limit', rows.count)
          : `Sheet "${sheet.name}" has headings but no data rows. Choose another sheet.`,
      );
      setState((current) => ({
        ...current,
        loaded: current.loaded && { ...current.loaded, sheetIndex: index, sheetNotice: null },
        headings: null,
        mapping: [],
        initialMapping: [],
      }));
      return;
    }
    setSheetError(null);
    const mapping = suggestMapping(found.value.headers, found.value.dataRows);
    const unit = massUnitHint(mapping);
    setState((current) => ({
      ...current,
      loaded: current.loaded && { ...current.loaded, sheetIndex: index, sheetNotice: null },
      headings: found.value,
      mapping,
      initialMapping: mapping,
      massUnit: unit === 't' ? 'tonnes' : 'kg',
      validation: null,
    }));
  }

  function changeMapping(columnIndex: number, choice: ColumnChoice) {
    const before = state.mapping[columnIndex];
    const change = applyManualChange(state.mapping, columnIndex, choice);
    setState((current) => ({ ...current, mapping: change.mapping, validation: null }));
    setMappingIssues([]);
    setAnnouncement(
      change.moved
        ? `${getUploadField(change.moved.field).label} moved from column "${change.moved.fromHeader}" to column "${change.moved.toHeader}".`
        : choice === 'ignore'
          ? `Column "${before?.header ?? ''}" will not be used.`
          : `Column "${before?.header ?? ''}" will be read as ${getUploadField(choice).label}.`,
    );
    const was = before?.confidence ?? 'none';
    track({
      name: 'mapping_changed',
      properties: { field: choice, confidence: was === 'manual' ? 'none' : was },
    });
  }

  function continueFromMapping() {
    if (mappingMissing.length > 0) {
      setMappingIssues(
        mappingMissing.map((key) => ({
          fieldId: MAPPER_ID,
          message: `Choose a column for ${getUploadField(key).label}`,
        })),
      );
      requestAnimationFrame(() =>
        summaryRef.current?.querySelector<HTMLElement>('[role=alert]')?.focus(),
      );
      return;
    }
    setMappingIssues([]);
    const headings = state.headings;
    if (!headings) return;
    const validation = validateRows(headings.dataRows, state.mapping, {
      massUnit: state.massUnit,
      massUnitFromHeading: hint !== null,
    });
    setState((current) => ({ ...current, validation, step: 'validation' }));
    track({ name: 'upload_step', properties: { step: 'validation' } });
  }

  function run() {
    const validation = state.validation;
    const loaded = state.loaded;
    if (!validation || !loaded || validation.payloadRows.length === 0) {
      track({ name: 'upload_failed', properties: { reason: 'no_valid_rows' } });
      return;
    }
    const request = buildPreviewRequest({
      fileSha256: loaded.sha256,
      fileType: loaded.fileType,
      sheetName:
        loaded.fileType === 'csv' ? null : (loaded.sheets[loaded.sheetIndex]?.name ?? null),
      validation,
    });
    setState((current) => ({ ...current, request, step: 'scope' }));
    mutation.reset();
    mutation.mutate(request);
  }

  function startAgain() {
    mutation.reset();
    setState(INITIAL);
    setFileError(null);
    setSheetError(null);
    setMappingIssues([]);
    setAnnouncement('');
  }

  const backButton = (to: FlowState['step'], label = 'Back') => (
    <Button
      type="button"
      variant="subtle"
      size="lg"
      className="w-full sm:w-auto"
      leftSection={<ArrowLeft aria-hidden="true" className="size-5" />}
      onClick={() => go(to)}
    >
      {label}
    </Button>
  );

  const includedCount = state.validation?.counts.included ?? 0;

  return (
    <StepFrame step={state.step}>
      {state.step === 'upload' ? (
        <div className="flex flex-col gap-8">
          {fileError ? (
            <Alert tone="critical" role="alert" title="We could not use this file">
              <span id="upload-error">{fileError}</span>
            </Alert>
          ) : null}
          <FileDropzone
            onFile={(file) => void handleFile(file)}
            busy={busy}
            describedBy={fileError ? 'upload-error' : undefined}
          />
          <FileRequirements maxFileMb={maxFileMb} maxRows={maxRows} dataSource={dataSource} />
        </div>
      ) : null}

      {state.step === 'headings' && state.loaded ? (
        <div className="flex flex-col gap-8">
          {state.headings ? (
            <ColumnDiscovery
              headings={state.headings}
              mapping={state.mapping}
              sheetNotice={state.loaded.sheetNotice}
              sheetPicker={
                <SheetPicker
                  sheets={sheetNames}
                  value={state.loaded.sheetIndex}
                  onChange={changeSheet}
                />
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              <SheetPicker
                sheets={sheetNames}
                value={state.loaded.sheetIndex}
                onChange={changeSheet}
              />
              {sheetError ? (
                <Alert tone="critical" role="alert">
                  {sheetError}
                </Alert>
              ) : null}
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {backButton('upload', 'Choose a different file')}
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!state.headings}
              rightSection={<ArrowRight aria-hidden="true" className="size-5" />}
              onClick={() => go('mapping')}
            >
              Continue to mapping
            </Button>
          </div>
        </div>
      ) : null}

      {state.step === 'mapping' && state.headings ? (
        <div className="flex flex-col gap-6">
          <div ref={summaryRef}>
            <ErrorSummary
              id="mapping-error-summary"
              title="Some columns still need choosing"
              issues={mappingIssues}
            />
          </div>
          <ColumnMapper
            mapping={state.mapping}
            rows={state.headings.dataRows}
            onChange={changeMapping}
            onReset={() => {
              setState((current) => ({
                ...current,
                mapping: current.initialMapping,
                validation: null,
              }));
              setMappingIssues([]);
              setAnnouncement('Column choices reset to our suggestions.');
            }}
            massUnit={state.massUnit}
            onMassUnit={(unit) =>
              setState((current) => ({ ...current, massUnit: unit, validation: null }))
            }
            askMassUnit={hint === null && state.mapping.some((entry) => entry.field === 'netMass')}
            announcement={announcement}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {backButton('headings')}
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              rightSection={<ArrowRight aria-hidden="true" className="size-5" />}
              onClick={continueFromMapping}
            >
              Continue to validation
            </Button>
          </div>
        </div>
      ) : null}

      {state.step === 'validation' && state.validation ? (
        <div className="flex flex-col gap-8">
          <ValidationSummary
            counts={state.validation.counts}
            notes={state.validation.columnNotes}
          />
          <IssueList issues={state.validation.issues} />
          <div className="rounded-md border border-line bg-surface-alt p-4 text-sm text-ink-muted">
            {includedCount > 0 ? (
              <p>
                <strong className="text-ink">{formatInteger(includedCount)}</strong>{' '}
                {includedCount === 1 ? 'row will be' : 'rows will be'} included. Rows that need
                review are left out of this preview. Fix them in your file and upload it again.
              </p>
            ) : (
              <p>{fileErrorMessage('no_valid_rows')}</p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {backButton('mapping', 'Back to mapping')}
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              disabled={includedCount === 0}
              styles={WRAP_LABEL}
              style={{ height: 'auto', minHeight: 'var(--button-height)', paddingBlock: 8 }}
              rightSection={<ArrowRight aria-hidden="true" className="size-5" />}
              onClick={run}
            >
              Run the preview with {formatInteger(includedCount)}{' '}
              {includedCount === 1 ? 'row' : 'rows'}
            </Button>
          </div>
        </div>
      ) : null}

      {state.step === 'scope' ? (
        <div className="flex flex-col gap-8">
          {mutation.isError || poll.isError ? (
            <ErrorState
              title="We could not complete the preview"
              description={
                mutation.error instanceof ApiFailure
                  ? mutation.error.userMessage
                  : USER_MESSAGES.unavailable
              }
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => state.request && mutation.mutate(state.request)}
                  >
                    Try again
                  </Button>
                  <Button type="button" variant="default" onClick={() => go('validation')}>
                    Back to validation
                  </Button>
                </div>
              }
            />
          ) : result && result.processingStatus === 'complete' ? (
            <ScopeSummary result={result} />
          ) : result?.processingStatus === 'failed' ? (
            <ErrorState
              title="We could not complete the preview"
              description={USER_MESSAGES.unavailable}
              action={<Button onClick={() => go('validation')}>Back to validation</Button>}
            />
          ) : (
            <ProcessingStatus rows={state.request?.rows.length ?? includedCount} phase="sending" />
          )}
        </div>
      ) : null}

      {state.step !== 'upload' ? (
        <div className="mt-8 border-t border-line pt-4">
          <button
            type="button"
            onClick={startAgain}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 font-medium text-primary underline underline-offset-4 hover:bg-primary-tint"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Start again with a different file
          </button>
        </div>
      ) : null}
    </StepFrame>
  );
}

/** The upload flow. Everything is held in this component's state; nothing is stored. */
export function LiabilityPreviewClient(props: LiabilityPreviewClientProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Flow {...props} />
    </QueryClientProvider>
  );
}
