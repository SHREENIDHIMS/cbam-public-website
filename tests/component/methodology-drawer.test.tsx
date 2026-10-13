import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MethodologyDrawerClient } from '@/components/results/MethodologyDrawerClient';
import { buildFixturePreview } from '@/lib/api/fixtures/liability-previews';
import { renderWithMantine } from '../utils/render';

const preview = buildFixturePreview('northstar');

describe('MethodologyDrawerClient', () => {
  it('opens with all five sections and lists the scenario rate', async () => {
    renderWithMantine(
      <MethodologyDrawerClient
        methodology={preview.methodology}
        rulesVersion={preview.rulesVersion}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'How these numbers are worked out' }));
    const dialog = await screen.findByRole('dialog');
    for (const heading of [
      'Inputs',
      'Formula concept',
      'Ruleset and sources',
      'Official vs scenario',
      'Missing information',
    ]) {
      expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(dialog).toHaveTextContent('Scenario carbon rate');
    expect(dialog).toHaveTextContent('No official CBAM rate');
  });

  it('closes on Escape', async () => {
    renderWithMantine(
      <MethodologyDrawerClient
        methodology={preview.methodology}
        rulesVersion={preview.rulesVersion}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'How these numbers are worked out' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
