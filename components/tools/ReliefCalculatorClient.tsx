'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import { calculateRelief } from '@/lib/tools/relief';
import { formatEmissions, formatGBP, formatPercent } from '@/lib/utils/format';

export interface ReliefDefaults {
  massTonnes: number;
  intensity: number;
  rate: number;
  /** Fraction from 0 to 1. */
  coveredShare: number;
  effectivePrice: number;
}

interface FieldProps {
  id: string;
  label: string;
  unit: string;
  hint: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  step: string;
  badgeSmall: ReactNode;
}

function Field({ id, label, unit, hint, value, error, onChange, step, badgeSmall }: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex flex-wrap items-center gap-2 font-semibold text-ink"
      >
        {label}
        {badgeSmall}
      </label>
      <div className="flex items-stretch">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? true : undefined}
          className="h-11 min-w-0 flex-1 rounded-l-sm border border-line-strong bg-surface px-3 text-base text-ink"
        />
        <span className="flex items-center rounded-r-sm border border-l-0 border-line-strong bg-surface-alt px-3 text-sm text-ink-muted">
          {unit}
        </span>
      </div>
      <p id={hintId} className="mt-1.5 text-sm text-ink-subtle">
        {hint}
      </p>
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-critical-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function toNumber(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Illustrative carbon price relief calculator. Every figure is an editable scenario value and the
 * result is labelled as an illustration. It never decides whether relief is available.
 */
export function ReliefCalculatorClient({
  defaults,
  notice,
  badge,
  badgeSmall,
}: {
  defaults: ReliefDefaults;
  notice: ReactNode;
  /** Server-rendered scenario badges, passed in so this island does not load the provenance config. */
  badge: ReactNode;
  badgeSmall: ReactNode;
}) {
  const baseId = useId();
  const [mass, setMass] = useState(String(defaults.massTonnes));
  const [intensity, setIntensity] = useState(String(defaults.intensity));
  const [rate, setRate] = useState(String(defaults.rate));
  const [share, setShare] = useState(String(Math.round(defaults.coveredShare * 100)));
  const [price, setPrice] = useState(String(defaults.effectivePrice));
  const [evidence, setEvidence] = useState(true);

  const values = {
    mass: toNumber(mass),
    intensity: toNumber(intensity),
    rate: toNumber(rate),
    share: toNumber(share),
    price: toNumber(price),
  };
  const shareError =
    values.share !== null && values.share > 100 ? 'Enter a share from 0 to 100.' : null;
  const errorFor = (value: number | null, raw: string): string | null =>
    value === null && raw !== '' ? 'Enter a number that is zero or more.' : null;

  const result = useMemo(() => {
    if (
      values.mass === null ||
      values.intensity === null ||
      values.rate === null ||
      values.share === null ||
      values.price === null ||
      shareError
    ) {
      return null;
    }
    return calculateRelief({
      massTonnes: values.mass,
      intensity: values.intensity,
      rate: values.rate,
      coveredShare: values.share / 100,
      effectivePrice: values.price,
      evidenceInPlace: evidence,
    });
  }, [
    values.mass,
    values.intensity,
    values.rate,
    values.share,
    values.price,
    shareError,
    evidence,
  ]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <form
        noValidate
        aria-label="Relief illustration inputs"
        onSubmit={(event) => event.preventDefault()}
        className="flex min-w-0 flex-col gap-6 rounded-sm border border-line bg-surface p-5 shadow-sm md:p-6 lg:col-span-5"
      >
        <div>
          <h3 className="t-title">Sample import line</h3>
          <p className="mt-1 text-sm text-ink-muted">
            All values are scenario values for illustration. Change them to see how the arithmetic
            responds. Nothing leaves your browser.
          </p>
        </div>
        <Field
          badgeSmall={badgeSmall}
          id={`${baseId}-mass`}
          label="Net mass"
          unit="tonnes"
          hint="The weight of the goods on the line."
          value={mass}
          error={errorFor(values.mass, mass)}
          onChange={setMass}
          step="any"
        />
        <Field
          badgeSmall={badgeSmall}
          id={`${baseId}-intensity`}
          label="Embodied emissions intensity"
          unit="tCO2e per tonne"
          hint="How much carbon dioxide equivalent is built into each tonne."
          value={intensity}
          error={errorFor(values.intensity, intensity)}
          onChange={setIntensity}
          step="any"
        />
        <Field
          badgeSmall={badgeSmall}
          id={`${baseId}-rate`}
          label="CBAM rate"
          unit="£ per tCO2e"
          hint="No official rate is published on this site, so this is an invented illustration."
          value={rate}
          error={errorFor(values.rate, rate)}
          onChange={setRate}
          step="any"
        />
        <Field
          badgeSmall={badgeSmall}
          id={`${baseId}-share`}
          label="Emissions covered by a carbon price"
          unit="%"
          hint="The share of the embodied emissions that a qualifying scheme priced at origin."
          value={share}
          error={shareError ?? errorFor(values.share, share)}
          onChange={setShare}
          step="1"
        />
        <Field
          badgeSmall={badgeSmall}
          id={`${baseId}-price`}
          label="Effective carbon price paid at origin"
          unit="£ per tCO2e"
          hint="What was paid per tonne on the covered emissions, once verified."
          value={price}
          error={errorFor(values.price, price)}
          onChange={setPrice}
          step="any"
        />
        <label
          htmlFor={`${baseId}-evidence`}
          className="flex min-h-11 cursor-pointer items-start gap-3 text-base text-ink"
        >
          <input
            id={`${baseId}-evidence`}
            type="checkbox"
            checked={evidence}
            onChange={(event) => setEvidence(event.target.checked)}
            className="mt-1 size-5 accent-[var(--cc-primary)]"
          />
          <span>
            The verification form and supporting evidence are in place
            <span className="block text-sm text-ink-subtle">
              Untick to see the position with no relief claimed.
            </span>
          </span>
        </label>
      </form>

      <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
        <div
          aria-live="polite"
          className="rounded-sm border border-line-strong/60 bg-surface p-5 shadow-sm md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="t-title">Illustrative position</h3>
            {badge}
          </div>
          {result ? (
            <>
              <dl className="m-0 mt-5 divide-y divide-line">
                <Row label="Embodied emissions" detail="Mass multiplied by intensity">
                  {formatEmissions(result.embodiedEmissions)}
                </Row>
                <Row label="Gross charge" detail="Embodied emissions multiplied by the rate">
                  {formatGBP(result.gross)}
                </Row>
                <Row
                  label="Emissions covered by a carbon price"
                  detail={`${formatPercent(values.share! / 100)} of the embodied emissions`}
                >
                  {formatEmissions(result.coveredEmissions)}
                </Row>
                <Row
                  label="Relief"
                  detail={
                    evidence
                      ? 'Covered emissions multiplied by the effective carbon price'
                      : 'No relief claimed without evidence'
                  }
                >
                  {result.relief > 0 ? `− ${formatGBP(result.relief)}` : formatGBP(0)}
                </Row>
                <Row label="Indicative net position" detail="Gross charge less relief" strong>
                  {formatGBP(result.net)}
                </Row>
              </dl>
              {result.reliefExceedsGross ? (
                <p className="mt-4 rounded-md bg-watch-bg p-3 text-sm text-watch-fg">
                  In this illustration the relief is larger than the gross charge. How the official
                  rules treat that case is not modelled here.
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-5 text-ink-muted">
              Enter every value as a number to see the illustration.
            </p>
          )}
        </div>
        {notice}
        <p className="text-sm text-ink-subtle">
          This is an illustration of the arithmetic only. It does not say whether any goods qualify
          for relief. Eligibility depends on the qualifying scheme, the verification form and the
          official rules.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  detail,
  strong = false,
  children,
}: {
  label: string;
  detail: string;
  strong?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="min-w-0">
        <span className={strong ? 'font-semibold text-ink' : 'text-ink'}>{label}</span>
        <span className="block text-sm text-ink-subtle">{detail}</span>
      </dt>
      <dd
        className={
          strong ? 't-figure-lg m-0 shrink-0' : 'm-0 shrink-0 font-semibold text-ink tabular-nums'
        }
      >
        {children}
      </dd>
    </div>
  );
}
