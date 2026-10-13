/**
 * Homepage copy that is not regulatory. British English, calm and precise.
 * Regulatory values are never typed here; they come from lib/config/rules.ts.
 */

export const HOME_METADATA = {
  title: 'Understand your UK CBAM exposure',
  description:
    'Turn customs and supplier emissions data into a clear UK CBAM position: threshold, indicative liability, supplier coverage and evidence, with every figure labelled by source.',
} as const;

export const PROCESS_STAGES = [
  {
    key: 'import',
    number: '01',
    title: 'Bring in your import data',
    body: 'Start from the customs ledger you already have. Columns are matched for you and every line is checked before anything is calculated.',
  },
  {
    key: 'scope',
    number: '02',
    title: 'Identify scope and threshold position',
    body: 'See which lines look in scope, which fall outside it and how the in-scope total sits against the registration tests.',
  },
  {
    key: 'suppliers',
    number: '03',
    title: 'Collect supplier information',
    body: 'Request emissions data from each producer, track what has arrived and see which missing answers move the number most.',
  },
  {
    key: 'return',
    number: '04',
    title: 'Build a return-ready position',
    body: 'Bring lines, supplier data and evidence together so the position is ready to review before it is needed.',
  },
] as const;

export const FEATURES = [
  {
    key: 'visibility',
    icon: 'Gauge',
    title: 'Exposure visibility',
    body: 'One indicative figure for the period, with the range it could fall in.',
  },
  {
    key: 'lines',
    icon: 'ListTree',
    title: 'Line-level liability',
    body: 'Every import line shows how its number was built, from value to net position.',
  },
  {
    key: 'evidence',
    icon: 'FileStack',
    title: 'Supplier evidence collection',
    body: 'Requests, reminders and received data kept against the right supplier and line.',
  },
  {
    key: 'threshold',
    icon: 'Radar',
    title: 'Threshold monitoring',
    body: 'The look-back and forward-looking positions side by side, updated as imports change.',
  },
  {
    key: 'relief',
    icon: 'Scale',
    title: 'Carbon price relief',
    body: 'Where relief may apply, the assumption is named and kept apart from official values.',
  },
  {
    key: 'records',
    icon: 'ArchiveRestore',
    title: 'Audit-ready records',
    body: 'Rules snapshot, source and calculation history stored with every result.',
  },
] as const;

export const BROKER_POINTS = [
  'One view across every client portfolio',
  'Supplier requests and evidence kept per importer',
  'Consistent, source-labelled reporting for each client',
] as const;

/** Hero tabs: the three ways into the public tools. Not statutory content. */
export const HERO_TABS = [
  {
    key: 'quick',
    label: 'Quick estimate',
    line: 'Answer five questions and see an indicative range. No file needed.',
    href: '/quick-estimate',
  },
  {
    key: 'threshold',
    label: 'Threshold check',
    line: 'Test your imports against the registration tests and see where you sit.',
    href: '/threshold-checker',
  },
  {
    key: 'upload',
    label: 'Upload customs file',
    line: 'Read a CSV or XLSX in your browser and preview liability line by line.',
    href: '/liability-preview',
  },
] as const;

export const ABOUT_TEXT =
  'UK CBAM puts a carbon charge on certain imported goods. We turn the customs and supplier data you already hold into a position you can explain, with the working shown and every figure labelled by where it came from.';

export const TOOL_CARDS = [
  {
    key: 'exposure',
    tag: 'Start here',
    title: 'Exposure check',
    body: 'Choose a quick estimate or bring your customs data, and see where you stand.',
    href: '/exposure-check',
  },
  {
    key: 'quick',
    tag: 'No file needed',
    title: 'Quick estimate',
    body: 'Five questions about your imports give an indicative range and what would sharpen it.',
    href: '/quick-estimate',
  },
  {
    key: 'threshold',
    tag: 'Registration',
    title: 'Threshold checker',
    body: 'Test your import values against the look-back and forward-looking registration tests.',
    href: '/threshold-checker',
  },
  {
    key: 'preview',
    tag: 'Upload',
    title: 'Liability preview',
    body: 'Read a customs export in your browser and see each line explained from value to net position.',
    href: '/liability-preview',
  },
] as const;
