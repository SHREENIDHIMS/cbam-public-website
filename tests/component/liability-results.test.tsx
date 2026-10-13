// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WorkspaceCta } from '@/components/conversion/WorkspaceCta';
import { LiabilityTable } from '@/components/results/LiabilityTable';
import { LiabilitySummary } from '@/components/results/LiabilitySummary';
import { SupplierExposureList } from '@/components/results/SupplierExposureList';
import { ValidationSummary } from '@/components/tools/ValidationSummary';
import { buildFixturePreview } from '@/lib/api/fixtures/liability-previews';

const sectors = [
  { key: 'iron_steel', label: 'Iron and steel' },
  { key: 'cement', label: 'Cement' },
];
const northstar = buildFixturePreview('northstar');

describe('LiabilityTable', () => {
  const html = renderToStaticMarkup(<LiabilityTable lines={northstar.lines} sectors={sectors} />);

  it('has a caption, a focusable labelled region and column headers', () => {
    expect(html).toContain('Line-level preview, 7 lines');
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-labelledby="table-caption"');
    expect(html).toContain('tabindex="0"');
    expect((html.match(/scope="col"/g) ?? []).length).toBe(11);
  });

  it('groups lines and shows dashes with hidden text where nothing is calculated', () => {
    for (const label of ['In scope', 'Out of scope', 'Before start date']) {
      expect(html).toContain(label);
    }
    expect((html.match(/scope="rowgroup"/g) ?? []).length).toBe(3);
    expect(html).toContain('not calculated');
  });

  it('marks assumptions with a Scenario badge and shows exact pence', () => {
    expect(html).toContain('Scenario');
    expect(html).toContain('Supplier actual');
    expect(html).toContain('£3,588.48');
  });
});

describe('LiabilitySummary', () => {
  it('shows the headline figures with a Scenario badge', () => {
    const html = renderToStaticMarkup(<LiabilitySummary result={northstar} />);
    expect(html).toContain('£9,073.48');
    expect(html).toContain('Scenario');
    expect(html).toContain('Triggered');
  });
});

describe('SupplierExposureList', () => {
  it('ranks suppliers and flags missing data', () => {
    const html = renderToStaticMarkup(<SupplierExposureList suppliers={northstar.suppliers} />);
    expect(html.indexOf('Atlas Metals')).toBeLessThan(html.indexOf('North Channel Materials'));
    expect(html).toContain('Supplier data missing: default values used');
  });
});

describe('ValidationSummary', () => {
  it('words the headline and counts', () => {
    const html = renderToStaticMarkup(
      <ValidationSummary
        counts={{
          rowsFound: 8,
          included: 4,
          normalised: 0,
          needsReview: 1,
          duplicates: 1,
          rejected: 2,
          totalRowsExcluded: 0,
        }}
        notes={[]}
      />,
    );
    expect(html).toContain('We found 4 rows that need review.');
    expect(html).toContain('Rows found');
  });
});

describe('WorkspaceCta', () => {
  it('says the file must be uploaded again and never carries a session id', () => {
    const html = renderToStaticMarkup(<WorkspaceCta />);
    expect(html).toContain('Save this position in');
    expect(html).toContain('upload the file again there');
    expect(html).not.toContain('fx_');
    // Without a configured app URL the link is plain text.
    expect(html).toContain('Workspace link to be confirmed');
  });
});
