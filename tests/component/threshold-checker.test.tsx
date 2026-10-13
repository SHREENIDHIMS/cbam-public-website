import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThresholdCheckerClient } from '@/components/tools/ThresholdCheckerClient';
import { renderWithMantine } from '../utils/render';

const props = {
  thresholdAmount: 1000,
  sectors: [{ key: 'iron_steel', label: 'Iron and steel' }] as const,
  guidance: {
    watchFrom: 0.6,
    approachingFrom: 0.8,
    label: 'Product guidance, not a statutory value',
  },
  maxRatio: 1.25,
  tests: [
    { key: 'backward', title: 'Look-back', description: 'Back text' },
    { key: 'forward', title: 'Forward', description: 'Forward text' },
  ],
  testsSource: {
    provenance: 'unverified' as const,
    title: 'Src',
    url: 'https://www.gov.uk/x',
    date: null,
  },
  exclusionsSource: { title: 'Excl', url: 'https://www.gov.uk/y' },
  dataSource: 'fixture' as const,
  thresholdFact: <p>fact</p>,
  notices: <p>notices</p>,
};

describe('ThresholdCheckerClient', () => {
  it('shows an empty state before a value is entered', () => {
    renderWithMantine(<ThresholdCheckerClient {...props} />);
    expect(screen.getByText('Enter your yearly value to see both tests')).toBeInTheDocument();
  });

  it('classifies both views, labels the gauge and the guidance', async () => {
    const user = userEvent.setup();
    renderWithMantine(<ThresholdCheckerClient {...props} />);
    await user.type(screen.getByLabelText('Yearly value of covered goods'), '900');
    await waitFor(() =>
      expect(screen.getAllByText('Approaching threshold').length).toBeGreaterThan(0),
    );
    expect(screen.getAllByRole('img').length).toBe(2);
    expect(screen.getAllByText('Demo data')).toHaveLength(2);
    expect(screen.getByText(/Product guidance, not a statutory value/)).toBeInTheDocument();
  });

  it('does not assess the forward view for lumpy imports', async () => {
    const user = userEvent.setup();
    renderWithMantine(<ThresholdCheckerClient {...props} />);
    await user.type(screen.getByLabelText('Yearly value of covered goods'), '900');
    await user.click(screen.getByLabelText(/My imports are lumpy/));
    await waitFor(() => expect(screen.getAllByText('Not assessed').length).toBeGreaterThan(0));
    expect(screen.getByText(/Enter your largest expected 30-day amount/)).toBeInTheDocument();
  });

  it('says the threshold is to be confirmed when it is missing', () => {
    renderWithMantine(<ThresholdCheckerClient {...props} thresholdAmount={null} />);
    expect(screen.getByText('Threshold to be confirmed')).toBeInTheDocument();
  });
});
