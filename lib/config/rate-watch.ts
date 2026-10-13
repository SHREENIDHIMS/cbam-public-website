import '@/lib/validation/zod-browser';
import { z } from 'zod';
import { isPrimarySourceUrl } from './rules-schema';

/**
 * Sources and dated events shown on /rate-watch, beyond the rules snapshot itself.
 * Each entry was read on its page on the review date (see docs/PROGRESS.md). Dates are the dates
 * printed on the pages. Nothing here is a rate: no official rate was found on the pages read.
 */

const isoDate = z.iso.date();

export const rateSourceSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  url: z.url().refine(isPrimarySourceUrl, 'Rate sources must be primary sources.'),
  publisher: z.string().min(1),
  /** Date printed on the page, with a short label for what it is. */
  date: isoDate,
  dateLabel: z.string().min(1),
  summary: z.string().min(1),
});
export type RateSource = z.infer<typeof rateSourceSchema>;

export const RATE_SOURCES: readonly RateSource[] = z.array(rateSourceSchema).parse([
  {
    key: 'policy-summary',
    title: 'Carbon Border Adjustment Mechanism (CBAM): Policy summary',
    url: 'https://www.gov.uk/government/publications/carbon-border-adjustment-mechanism-cbam-policy-summary/carbon-border-adjustment-mechanism-cbam-policy-summary',
    publisher: 'HM Revenue & Customs and HM Treasury, GOV.UK',
    date: '2026-09-09',
    dateLabel: 'Updated',
    summary:
      'Says rates are calculated and published at the beginning of each quarter from the start date, with one rate per sector, and that an illustrative example rate would be set out in autumn 2026.',
  },
  {
    key: 'rate-regulations',
    title:
      'The Carbon Border Adjustment Mechanism (Calculation of CBAM Rate and Determination of Carbon Price Relief) Regulations 2026',
    url: 'https://www.legislation.gov.uk/uksi/2026/809/made',
    publisher: 'legislation.gov.uk',
    date: '2026-07-13',
    dateLabel: 'Made',
    summary:
      'Sets out how the rate is calculated: the mean of UK ETS auction clearing prices in the previous quarter, adjusted for free allowances.',
  },
  {
    key: 'finance-act',
    title: 'Finance Act 2026, Part 5: Carbon Border Adjustment Mechanism',
    url: 'https://www.legislation.gov.uk/ukpga/2026/11/part/5/enacted',
    publisher: 'legislation.gov.uk',
    date: '2026-10-06',
    dateLabel: 'Read on',
    summary:
      'Section 149 sets the charge as the sectoral domestic price multiplied by the tonnes of carbon dioxide equivalent embodied in the good.',
  },
]);

export interface RateEventSeed {
  id: string;
  date?: string;
  dateLabel?: string;
  title: string;
  body: string;
  tag: string;
}

/** Dated events. `date` entries after today are shown as upcoming at render time. */
export const RATE_EVENT_SEEDS: readonly RateEventSeed[] = [
  {
    id: 'regs-made',
    date: '2026-07-13',
    title: 'Rate calculation regulations made',
    body: 'The regulations that set how the CBAM rate is calculated were made.',
    tag: 'Official',
  },
  {
    id: 'policy-summary-updated',
    date: '2026-09-09',
    title: 'Policy summary updated',
    body: 'GOV.UK updated the policy summary to reflect the Emissions and Verification Regulations 2026. It still describes the rate as to be published.',
    tag: 'Official',
  },
  {
    id: 'illustrative-rate',
    dateLabel: 'Autumn 2026',
    title: 'Illustrative example rate expected',
    body: 'The policy summary says an illustrative example rate will be set out. We had not found it on the pages we read, so none is shown here.',
    tag: 'Expected, per policy summary',
  },
];
