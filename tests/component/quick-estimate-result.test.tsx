import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { QuickEstimateResult } from '@/components/results/QuickEstimateResult';
import { fixtureAdapter } from '@/lib/api/fixture-adapter';
import type { QuickEstimateInput } from '@/lib/api/schemas';
import { getStatus } from '@/lib/config/status';
import { STALE_RULES_MESSAGE } from '@/components/results/StaleRulesNotice';
import { renderWithMantine } from '../utils/render';

const input: QuickEstimateInput = {
  value: '50k_100k',
  sectors: ['cement'],
  origins: ['turkey'],
  suppliers: '6_20',
  large: 'no',
};
const sectors = [{ key: 'cement', label: 'Cement' }];

describe('QuickEstimateResult', () => {
  it('renders the headline, demo indicator, notice and actions', async () => {
    const result = await fixtureAdapter.runQuickEstimate(input);
    renderWithMantine(
      <QuickEstimateResult
        result={result}
        input={input}
        sectors={sectors}
        changeHref="/quick-estimate"
      />,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: getStatus('likely_triggered').resultHeadline }),
    ).toBeInTheDocument();
    expect(screen.getByText('Demo data')).toBeInTheDocument();
    expect(screen.getByText('Indicative result')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change answers' })).toBeInTheDocument();
    expect(screen.queryByText(STALE_RULES_MESSAGE)).toBeNull();
  });

  it('shows the stale notice when the snapshot differs', async () => {
    const result = await fixtureAdapter.runQuickEstimate(input);
    renderWithMantine(
      <QuickEstimateResult
        result={{ ...result, rulesVersion: 'public-rules-2020-01-01' }}
        input={input}
        sectors={sectors}
        changeHref="/quick-estimate"
      />,
    );
    expect(screen.getByText(STALE_RULES_MESSAGE)).toBeInTheDocument();
  });
});
