import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import HomePage from '@/app/(marketing)/page';
import { FAQSection } from '@/components/conversion/FAQSection';
import { CalculationPreview } from '@/components/hero/CalculationPreview';
import { FactStrip } from '@/components/hero/FactStrip';
import { ProductPreview } from '@/components/hero/ProductPreview';
import { getFaqEntries } from '@/lib/config/faq';
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from '@/lib/config/navigation';

describe('homepage', () => {
  it('has one h1, the primary CTA and the secondary CTA', async () => {
    render(await HomePage());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const ctas = screen.getAllByRole('link', { name: new RegExp(PRIMARY_CTA_LABEL) });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    for (const cta of ctas) expect(cta).toHaveAttribute('href', PRIMARY_CTA_HREF);
    expect(screen.getByRole('link', { name: 'See how it works' })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
    expect(screen.getByRole('link', { name: /Explore the broker view/ })).toHaveAttribute(
      'href',
      '/for-brokers',
    );
    expect(screen.getByRole('heading', { name: 'Find out where you stand.' })).toBeInTheDocument();
  });

  it('renders four process stages, six features and four guides', async () => {
    const { container } = render(await HomePage());
    expect(
      screen.getAllByRole('heading', {
        level: 3,
        name: /^(Bring|Identify|Collect|Build)/,
      }),
    ).toHaveLength(4);
    expect(
      within(container.querySelector('#features-title')!.closest('section')!).getAllByRole(
        'heading',
        { level: 3 },
      ),
    ).toHaveLength(6);
    expect(
      within(container.querySelector('#guides-title')!.closest('section')!).getAllByRole(
        'heading',
        { level: 3 },
      ),
    ).toHaveLength(4);
  });

  it('emits FAQPage JSON-LD that matches the visible questions', async () => {
    const { container } = render(await HomePage());
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent ?? '{}') as {
      '@type': string;
      mainEntity: Array<{ name: string }>;
    };
    expect(data['@type']).toBe('FAQPage');
    const visible = Array.from(container.querySelectorAll('details summary')).map((summary) =>
      summary.textContent?.trim(),
    );
    expect(data.mainEntity.map((question) => question.name)).toEqual(visible);
    expect(visible).toHaveLength(7);
  });

  it('labels every product visual as sample or illustrative', async () => {
    const { container } = render(await HomePage());
    expect(screen.getAllByText('Sample, illustrative').length).toBeGreaterThanOrEqual(3);
    expect(container.textContent).toContain('Sample data · fictional importer');
  });

  it('does not use fear language or AI marketing', async () => {
    const { container } = render(await HomePage());
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bAI\b|artificial intelligence|penalt|crackdown|don't get caught/i);
  });
});

describe('FactStrip', () => {
  it('shows each fact with its provenance badge and source link', () => {
    render(<FactStrip />);
    // Every fact comes from a value that was checked against its primary page.
    expect(screen.getAllByText('Official')).toHaveLength(4);
    expect(screen.getByText('£50,000')).toBeInTheDocument();
    expect(screen.getByText('6 years')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Source/ })).toHaveLength(4);
  });
});

describe('ProductPreview', () => {
  it('shows threshold, liability, coverage, evidence and rules status with sample labels', () => {
    render(<ProductPreview />);
    for (const name of [
      'Registration threshold',
      'Indicative liability',
      'Supplier coverage',
      'Evidence readiness',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getByText('Rules snapshot')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Sample threshold gauge.*£50,000/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Approaching threshold')).toBeInTheDocument();
    expect(screen.getByText(/illustrative figures/)).toBeInTheDocument();
  });
});

describe('CalculationPreview', () => {
  it('walks from customs value to indicative net with provenance labels', () => {
    render(<CalculationPreview />);
    for (const label of [
      'Customs value',
      'Quantity',
      'Emissions basis',
      'Rate',
      'Gross charge',
      'Relief',
      'Indicative net position',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    for (const provenance of ['Default value', 'Scenario', 'Official', 'Supplier actual']) {
      expect(screen.getAllByText(provenance).length).toBeGreaterThan(0);
    }
  });
});

describe('FAQSection', () => {
  it('renders native disclosure elements with interpolated figures and source links', () => {
    const { container } = render(<FAQSection entries={getFaqEntries()} />);
    const items = container.querySelectorAll('details');
    expect(items).toHaveLength(7);
    expect(container.textContent).toContain('£50,000 over 12 months');
    expect(screen.getAllByRole('link', { name: /opens in new tab/ }).length).toBeGreaterThan(0);
  });
});

describe('no hard-coded regulatory values in homepage components', () => {
  const roots = [
    'components/hero',
    'components/content',
    'components/conversion',
    'app/(marketing)/page.tsx',
  ];
  const files: string[] = [];
  const walk = (path: string) => {
    if (statSync(path).isDirectory()) {
      for (const entry of readdirSync(path)) walk(join(path, entry));
    } else if (path.endsWith('.tsx')) {
      files.push(path);
    }
  };
  for (const root of roots) walk(join(process.cwd(), root));

  it.each(files)('%s has no typed threshold, start date or sector list', (file) => {
    const source = readFileSync(file, 'utf8');
    expect(source).not.toMatch(/50,000|50000|50k/i);
    expect(source).not.toMatch(/January 2027|1 Jan 2027|2027-01-01/);
    expect(source).not.toMatch(/Aluminium, Cement|iron and steel/i);
  });
});
