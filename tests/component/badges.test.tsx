import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROVENANCE, PROVENANCE_KEYS } from '@/lib/config/provenance';
import { RESULT_STATUSES, RESULT_STATUS_KEYS } from '@/lib/config/status';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';

describe('StatusBadge', () => {
  it.each(RESULT_STATUS_KEYS)('renders label text and an icon for %s', (key) => {
    const { container } = render(<StatusBadge status={key} />);
    expect(screen.getByText(RESULT_STATUSES[key].label)).toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('ProvenanceBadge', () => {
  it.each(PROVENANCE_KEYS)('renders label text and an icon for %s', (key) => {
    const { container } = render(<ProvenanceBadge provenance={key} />);
    expect(screen.getByText(PROVENANCE[key].label)).toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
