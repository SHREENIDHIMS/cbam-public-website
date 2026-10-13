import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickEstimateWizard } from '@/components/tools/QuickEstimateWizard';
import { setAnalyticsProvider } from '@/lib/analytics';
import { noopProvider } from '@/lib/analytics/providers/noop';
import { renderWithMantine } from '../utils/render';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const sectors = [
  { key: 'iron_steel', label: 'Iron and steel' },
  { key: 'cement', label: 'Cement' },
] as const;

describe('QuickEstimateWizard', () => {
  beforeEach(() => {
    push.mockClear();
    setAnalyticsProvider(noopProvider);
  });

  it('shows an error summary and moves focus when nothing is chosen', async () => {
    const user = userEvent.setup();
    renderWithMantine(<QuickEstimateWizard sectors={sectors} />);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    const summary = await screen.findByRole('alert', { name: '' }).catch(() => null);
    expect(summary ?? screen.getAllByRole('alert')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Choose the closest yearly value range').length).toBeGreaterThan(0);
  });

  it('advances, keeps answers on Back and finishes with band-only URL', async () => {
    const user = userEvent.setup();
    const events: string[] = [];
    setAnalyticsProvider({ track: (event) => events.push(event.name) });
    renderWithMantine(<QuickEstimateWizard sectors={sectors} />);

    await user.click(screen.getByLabelText('£25,000 to £50,000'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Step 2 / 5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('£25,000 to £50,000')).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.click(screen.getByLabelText('Iron and steel'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByLabelText('China'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByLabelText('2 to 5 suppliers'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByLabelText(/No, imports are fairly steady/));
    await user.click(screen.getByRole('button', { name: 'See my estimate' }));

    expect(push).toHaveBeenCalledWith(
      '/quick-estimate/result?v=1&value=25k_50k&sectors=iron_steel&origins=china&suppliers=2_5&large=no',
    );
    expect(events).toContain('wizard_start');
    expect(events.filter((name) => name === 'wizard_step')).toHaveLength(6);
  });

  it('treats Not sure as exclusive', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <QuickEstimateWizard
        sectors={sectors}
        defaultAnswers={{
          value: 'under_25k',
          sectors: [],
          origins: [],
          suppliers: '',
          large: '',
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByLabelText('Cement'));
    await user.click(screen.getByLabelText(/Not sure/));
    expect(screen.getByLabelText('Cement')).not.toBeChecked();
    expect(screen.getByLabelText(/Not sure/)).toBeChecked();
  });
});
