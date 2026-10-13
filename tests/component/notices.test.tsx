import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DemoDataIndicator } from '@/components/results/DemoDataIndicator';
import { ResultNotice } from '@/components/results/ResultNotice';
import { StaleRulesNotice, STALE_RULES_MESSAGE } from '@/components/results/StaleRulesNotice';
import { rules } from '@/lib/config/rules';

describe('result notices', () => {
  it('shows the demo indicator only for fixture data', () => {
    const { rerender } = render(<DemoDataIndicator dataSource="fixture" />);
    expect(screen.getByText('Demo data')).toBeInTheDocument();
    rerender(<DemoDataIndicator dataSource="live" />);
    expect(screen.queryByText('Demo data')).toBeNull();
  });

  it('names the rules snapshot in the result notice', () => {
    render(<ResultNotice />);
    expect(screen.getByText(rules.rulesVersion)).toBeInTheDocument();
  });

  it('shows the stale message only when the version differs', () => {
    const { rerender } = render(<StaleRulesNotice rulesVersion="public-rules-2020-01-01" />);
    expect(screen.getByText(STALE_RULES_MESSAGE)).toBeInTheDocument();
    rerender(<StaleRulesNotice rulesVersion={rules.rulesVersion} />);
    expect(screen.queryByText(STALE_RULES_MESSAGE)).toBeNull();
  });
});
