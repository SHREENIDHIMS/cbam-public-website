import { expect, test } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './helpers/axe';

const KNOWLEDGE_ROUTES = [
  '/how-it-works',
  '/sectors',
  '/carbon-price-relief',
  '/rate-watch',
  '/rules-changelog',
  '/worked-example',
  '/guides',
  '/guides/what-is-uk-cbam',
  '/guides/how-the-registration-threshold-works',
  '/guides/commodity-codes-and-scope',
  '/guides/supplier-emissions-data',
  '/guides/carbon-price-relief-explained',
] as const;

test.describe('knowledge routes', () => {
  for (const route of KNOWLEDGE_ROUTES) {
    test(`${route} returns 200, has one h1 and no serious accessibility violations`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expectNoSeriousA11yViolations(page);
    });
  }

  test('no knowledge route scrolls horizontally', async ({ page }) => {
    for (const route of KNOWLEDGE_ROUTES) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, route).toBe(0);
    }
  });
});

test.describe('guides', () => {
  test('lists the guides and searches by words from the title, summary and tags', async ({
    page,
  }) => {
    await page.goto('/guides');
    const results = page.getByRole('status').filter({ hasText: /guides?/ });
    await expect(results).toHaveText('5 guides');

    const search = page.getByRole('searchbox', { name: 'Search guides' });
    await search.fill('supplier');
    await expect(results).toContainText('matches your search');
    await expect(
      page.getByRole('link', { name: /Asking suppliers for emissions data/ }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Carbon price relief explained/ })).toHaveCount(0);

    await search.fill('zzzz nothing');
    await expect(page.getByText('No guides match that search.')).toBeVisible();

    await page.getByRole('button', { name: 'Clear search and filters' }).click();
    await expect(results).toHaveText('5 guides');
  });

  test('filters by topic, by sector and by recently reviewed', async ({ page }) => {
    await page.goto('/guides');
    const results = page.getByRole('status').filter({ hasText: /guides?/ });

    await page.getByLabel('Topic').selectOption('relief');
    await expect(results).toHaveText('1 guide matches your search');
    await expect(page.getByRole('link', { name: /Carbon price relief explained/ })).toBeVisible();

    await page.getByLabel('Topic').selectOption('all');
    await page.getByLabel('Sector').selectOption('hydrogen');
    await expect(results).toContainText('5 guides');

    await page.getByLabel(/Reviewed in the last/).check();
    await expect(results).toContainText('5 guides');
  });

  test('opens a guide with key facts, an official source panel and Article JSON-LD', async ({
    page,
  }) => {
    await page.goto('/guides');
    await page.getByRole('link', { name: /How the registration threshold tests work/ }).click();
    await expect(page).toHaveURL(/\/guides\/how-the-registration-threshold-works$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('registration threshold');

    const aside = page.getByRole('complementary', { name: 'Key facts and sources' });
    await expect(aside.getByRole('heading', { name: 'Key facts' })).toBeVisible();
    await expect(aside.getByText('£50,000')).toBeVisible();
    await expect(
      aside.getByRole('link', { name: /Work out the date you will need to register/ }),
    ).toHaveAttribute('href', /^https:\/\/www\.gov\.uk\//);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((block) => (JSON.parse(block) as { '@type': string })['@type']);
    expect(types).toContain('Article');
    expect(types).toContain('BreadcrumbList');
    await expect(page.getByRole('heading', { name: 'Related guides' })).toBeVisible();
  });

  test('the homepage features real guides that link to their pages', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('section[aria-labelledby="guides-title"]');
    await expect(section.getByText('Coming soon')).toHaveCount(0);
    await section.getByRole('link', { name: /What UK CBAM is/ }).click();
    await expect(page).toHaveURL(/\/guides\/what-is-uk-cbam$/);
  });

  test('an unknown guide is a 404', async ({ page }) => {
    const response = await page.goto('/guides/not-a-guide');
    expect(response?.status()).toBe(404);
  });
});

test.describe('rate watch', () => {
  test('keeps official and scenario information apart and shows sources and dates', async ({
    page,
  }) => {
    await page.goto('/rate-watch');
    const official = page.getByRole('article', { name: 'Official' });
    const scenario = page.getByRole('article', { name: /Scenario or illustrative/ });
    await expect(official.getByText('Not yet published')).toBeVisible();
    await expect(official.getByText('Official', { exact: true }).first()).toBeVisible();
    await expect(scenario.getByText('Scenario', { exact: true }).first()).toBeVisible();
    await expect(scenario.getByText(/per tCO2e/)).toBeVisible();
    await expect(page.getByRole('list', { name: 'Rate timeline' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Where each statement comes from.' }),
    ).toBeVisible();
    await expect(page.getByRole('list', { name: 'Recent rules changes' })).toBeVisible();
    await expect(page.getByText('Demo data')).toBeVisible();
  });

  test('the alert form validates before sending', async ({ page }) => {
    await page.goto('/rate-watch');
    const form = page.getByRole('form', { name: 'Rate and rules alerts' });
    await form.getByRole('button', { name: 'Get alerts' }).click();

    const summary = page.getByRole('alert').filter({ hasText: 'Check these details' });
    await expect(summary).toBeVisible();
    await expect(summary.getByRole('link', { name: /Enter your email address/ })).toBeVisible();
    await expect(summary.getByRole('link', { name: /Tick the box/ })).toBeVisible();

    await form.getByLabel('Email address').fill('not-an-email');
    await form.getByLabel(/Email me when an official rate/).check();
    await form.getByRole('button', { name: 'Get alerts' }).click();
    await expect(
      page.getByText('Enter a valid email address, such as name@example.com.').first(),
    ).toBeVisible();
  });

  test('marketing consent is separate and unticked by default', async ({ page }) => {
    await page.goto('/rate-watch');
    const form = page.getByRole('form', { name: 'Rate and rules alerts' });
    await expect(form.getByLabel(/Email me when an official rate/)).not.toBeChecked();
    await expect(form.getByLabel(/Also send me occasional product news/)).not.toBeChecked();
  });

  test('a valid request is acknowledged and says nothing was sent in demo mode', async ({
    page,
  }) => {
    await page.goto('/rate-watch');
    const form = page.getByRole('form', { name: 'Rate and rules alerts' });
    await form.getByLabel('Email address').fill('reader@example.com');
    await form.getByLabel(/Email me when an official rate/).check();
    await form.getByRole('button', { name: 'Get alerts' }).click();
    const done = page.getByRole('status').filter({ hasText: 'Request received' });
    await expect(done).toBeVisible();
    await expect(done).toContainText('Demo mode: no email was sent');
  });
});

test.describe('worked example', () => {
  test('shows five tabs and switches between them with the mouse and keyboard', async ({
    page,
  }) => {
    await page.goto('/worked-example');
    const tabs = page.getByRole('tablist', { name: 'Worked example steps' });
    await expect(tabs.getByRole('tab')).toHaveText([
      'Import ledger',
      'Supplier A',
      'Supplier B',
      'Engine decisions',
      'Preview output',
    ]);
    await expect(page.getByRole('tabpanel')).toContainText('Four outcomes');

    await tabs.getByRole('tab', { name: 'Supplier B' }).click();
    const panel = page.getByRole('tabpanel');
    await expect(panel).toContainText('Comodity code');
    await expect(panel).toContainText('Read as 12500 kg');
    await expect(panel).toContainText('Total');

    await tabs.getByRole('tab', { name: 'Supplier B' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.getByRole('tab', { name: 'Engine decisions' })).toBeFocused();
    await expect(tabs.getByRole('tab', { name: 'Engine decisions' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    for (const outcome of ['Detected', 'Normalised', 'Needs review', 'Rejected']) {
      await expect(page.getByRole('heading', { name: new RegExp(`^${outcome}`) })).toBeVisible();
    }

    await page.keyboard.press('End');
    await expect(page.getByRole('tabpanel')).toContainText('Indicative liability');
    await expect(page.getByRole('tabpanel')).toContainText('Scenario');
  });

  test('has no serious accessibility violations on any tab', async ({ page }) => {
    await page.goto('/worked-example');
    for (const name of ['Supplier A', 'Supplier B', 'Engine decisions', 'Preview output']) {
      await page.getByRole('tab', { name }).click();
      await expectNoSeriousA11yViolations(page);
    }
  });
});

test.describe('carbon price relief calculator', () => {
  test('recalculates from editable scenario values and removes relief without evidence', async ({
    page,
  }) => {
    await page.goto('/carbon-price-relief');
    const position = page
      .getByText('Illustrative position')
      .locator('xpath=ancestor::div[@aria-live]');
    await expect(position).toContainText('Indicative net position');
    const before = await position.textContent();

    await page.getByLabel(/Net mass/).fill('200');
    await expect(position).not.toHaveText(before ?? '');

    await page.getByLabel(/verification form and supporting evidence/).uncheck();
    await expect(position).toContainText('No relief claimed without evidence');

    await page.getByLabel(/Net mass/).fill('-1');
    await expect(page.getByText('Enter a number that is zero or more.')).toBeVisible();
  });
});

test.describe('sectors, how it works and rules changelog', () => {
  test('lists the five sectors from the rules config and links each to the exposure check', async ({
    page,
  }) => {
    await page.goto('/sectors');
    for (const name of ['Aluminium', 'Cement', 'Fertilisers', 'Hydrogen', 'Iron and steel']) {
      await expect(page.getByRole('heading', { level: 3, name })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Check my exposure' }).first()).toHaveAttribute(
      'href',
      '/exposure-check',
    );
    await expect(
      page.getByText('The exact code matters more than the product name.'),
    ).toBeVisible();
  });

  test('how it works labels what is available now and what is planned', async ({ page }) => {
    await page.goto('/how-it-works');
    await expect(page.getByText('In the public preview').first()).toBeVisible();
    await expect(page.getByText('In the workspace').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(8);
  });

  test('the rules changelog shows the snapshot and its change log from the rules config', async ({
    page,
  }) => {
    await page.goto('/rules-changelog');
    const table = page.getByRole('table', { name: /Every value in the rules snapshot/ });
    await expect(table.getByRole('row')).toHaveCount(14);
    await expect(table.getByText('Unverified').first()).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Rules changelog' }).getByRole('listitem'),
    ).toHaveCount(2);
  });
});
