import '@/lib/validation/zod-browser';
import { z } from 'zod';

/**
 * Content for /how-it-works (MASTER_PROMPT 13). Not regulatory, and no regulatory values are typed
 * here. Each step says whether the public site already does it or whether it belongs to the
 * workspace (the existing application) and is described as planned.
 */

export const stepSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  provide: z.array(z.string().min(1)).min(1),
  see: z.array(z.string().min(1)).min(1),
  availability: z.enum(['public', 'workspace']),
  link: z
    .object({ href: z.string().regex(/^\/[a-z0-9\-/]*$/), label: z.string().min(1) })
    .optional(),
});
export type HowItWorksStep = z.infer<typeof stepSchema>;

export const AVAILABILITY_COPY = {
  public: {
    label: 'In the public preview',
    detail: 'You can try this step on this site today, without an account.',
  },
  workspace: {
    label: 'In the workspace',
    detail: 'Planned for the CBAM workspace. This site describes it and does not run it.',
  },
} as const;

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = z.array(stepSchema).parse([
  {
    key: 'import',
    title: 'Import data',
    summary:
      'Start from the customs export you already have. The file is read in your browser, the heading row is found, and each column is matched to a field with a stated confidence.',
    provide: ['A CSV or XLSX customs export', 'Nothing else is needed to begin'],
    see: [
      'Suggested column mapping you can change',
      'Every row marked valid, normalised, needs review or rejected',
      'Row counts before anything is calculated',
    ],
    availability: 'public',
    link: { href: '/liability-preview', label: 'Upload a file' },
  },
  {
    key: 'scope',
    title: 'Resolve commodity scope',
    summary:
      'Lines are sorted by commodity code into sectors, lines that look outside the charge, and lines dated before the start date. The code, not the product label, decides.',
    provide: ['Commodity codes on each line', 'Import dates'],
    see: [
      'Which lines are treated as in scope in the preview',
      'The reason given for each line',
      'Lines that need a human decision',
    ],
    availability: 'public',
    link: { href: '/sectors', label: 'Explore the sectors' },
  },
  {
    key: 'threshold',
    title: 'Monitor threshold',
    summary:
      'The in-scope total is compared with the registration threshold using the look-back and forward-looking tests described in the official guidance.',
    provide: [
      'Customs value by line',
      'An expectation of imports over the next 30 days, if you have one',
    ],
    see: [
      'Both tests side by side',
      'Guidance bands for how close you are, labelled as product guidance',
      'The source and date of the threshold used',
    ],
    availability: 'public',
    link: { href: '/threshold-checker', label: 'Open the threshold checker' },
  },
  {
    key: 'liability',
    title: 'Calculate indicative liability',
    summary:
      'For each in-scope line the preview multiplies mass by an emissions intensity and a rate. Until an official rate is published, the rate is a scenario value and is labelled as one.',
    provide: ['Net mass by line', 'Supplier emissions data where you have it'],
    see: [
      'A line-by-line workings view',
      'Gross figure, relief assumption and indicative net position',
      'A badge on every input saying where it came from',
    ],
    availability: 'public',
    link: { href: '/worked-example', label: 'See a worked example' },
  },
  {
    key: 'suppliers',
    title: 'Request supplier emissions',
    summary:
      'Producer data can replace published defaults. The preview already ranks suppliers by how much of the position they drive. Sending requests and tracking replies is planned for the workspace.',
    provide: ['Supplier names on your lines', 'Producer contacts, in the workspace'],
    see: [
      'Suppliers ranked by exposure, with missing data flagged',
      'Requests and replies kept against the right supplier, in the workspace',
    ],
    availability: 'workspace',
    link: { href: '/guides/supplier-emissions-data', label: 'Read the guide' },
  },
  {
    key: 'relief',
    title: 'Apply carbon price relief',
    summary:
      'Where a qualifying carbon price has already been paid, relief may reduce the charge. The preview uses a scenario relief assumption and keeps it separate from official values.',
    provide: [
      'Evidence of a carbon price paid at origin',
      'A verification form, where relief is claimed',
    ],
    see: [
      'Relief shown as its own line in the workings',
      'The assumption named and badged as a scenario',
    ],
    availability: 'workspace',
    link: { href: '/carbon-price-relief', label: 'How relief works' },
  },
  {
    key: 'evidence',
    title: 'Track evidence',
    summary:
      'Supplier declarations, verification reports and customs records are kept against the lines they support, with the rules snapshot used for each result.',
    provide: ['Documents and declarations from suppliers', 'Customs entries'],
    see: [
      'What is held and what is still missing, per line',
      'The rules snapshot and source stored with each result',
    ],
    availability: 'workspace',
  },
  {
    key: 'return',
    title: 'Prepare return',
    summary:
      'Lines, supplier data and evidence come together into a position that is ready to review before a return is due. Filing itself stays with you and HMRC.',
    provide: ['Reviewed lines and evidence'],
    see: ['A return-ready position to review', 'Open questions that still need an answer'],
    availability: 'workspace',
    link: { href: '/rate-watch', label: 'Watch rates and rules' },
  },
]);

export const BROWSER_PROMISES = [
  'Your file is read in your browser. The file itself is never uploaded.',
  'When you run a preview, only the mapped columns of rows that passed the checks are sent.',
  'Raw rows are not stored in your browser, logged or sent to analytics.',
] as const;
