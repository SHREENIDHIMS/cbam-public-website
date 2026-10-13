import { z } from 'zod';
import { SECTOR_KEYS, type SectorKey } from './sector-keys';

export const RULE_STATUSES = ['official', 'proposed', 'scenario', 'unverified'] as const;
export type RuleStatus = (typeof RULE_STATUSES)[number];

const PRIMARY_HOSTS = ['gov.uk', 'legislation.gov.uk', 'assets.publishing.service.gov.uk'];

export function isPrimarySourceUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'https:') return false;
    return PRIMARY_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

const isoDate = z.iso.date();

/** Builds the schema for a single regulatory value with its provenance. */
export function ruleValueSchema<T extends z.ZodType>(valueSchema: T) {
  return z
    .object({
      value: valueSchema.nullable(),
      status: z.enum(RULE_STATUSES),
      sourceTitle: z.string().min(1),
      sourceUrl: z.url(),
      sourceDate: isoDate.nullable(),
      effectiveFrom: isoDate.optional(),
      reviewedAt: isoDate,
      note: z.string().optional(),
    })
    .refine((rule) => rule.status === 'scenario' || isPrimarySourceUrl(rule.sourceUrl), {
      path: ['sourceUrl'],
      message:
        'sourceUrl must be on gov.uk, legislation.gov.uk or assets.publishing.service.gov.uk.',
    })
    .refine((rule) => rule.status !== 'official' || rule.sourceDate !== null, {
      path: ['sourceDate'],
      message: 'An official value needs the source page date.',
    });
}

export { SECTOR_KEYS, type SectorKey };

const moneyThreshold = z.object({
  amount: z.number().positive(),
  currency: z.literal('GBP'),
  period: z.string().min(1),
});

const textEntries = z.array(
  z.object({ key: z.string().min(1), title: z.string().min(1), description: z.string().min(1) }),
);

const sectorEntries = z.array(z.object({ key: z.enum(SECTOR_KEYS), label: z.string().min(1) }));

const rateState = z.object({
  mechanism: z.string().nullable(),
  currentRate: z.number().nullable(),
  publishedAt: isoDate.nullable(),
});

export const scenarioRateSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  ratePerTonne: z.number().nonnegative(),
  status: z.literal('scenario'),
  note: z.string().min(1),
});

export const changelogEntrySchema = z.object({
  date: isoDate,
  summary: z.string().min(1),
  affectedKeys: z.array(z.string().min(1)),
});

export const rulesSchema = z.object({
  rulesVersion: z.string().regex(/^public-rules-\d{4}-\d{2}-\d{2}(-[a-z]+)?$/),
  reviewedAt: isoDate,
  startDate: ruleValueSchema(isoDate),
  registrationThreshold: ruleValueSchema(moneyThreshold),
  thresholdTests: ruleValueSchema(textEntries),
  thresholdExclusions: ruleValueSchema(z.string()),
  sectors: ruleValueSchema(sectorEntries),
  commodityScopeBasis: ruleValueSchema(z.string()),
  registrationOpens: ruleValueSchema(isoDate),
  registrationDeadline: ruleValueSchema(isoDate),
  firstReturnDeadline: ruleValueSchema(isoDate),
  paymentDeadline: ruleValueSchema(isoDate),
  rateState: ruleValueSchema(rateState),
  scenarioRates: z.array(scenarioRateSchema),
  carbonPriceRelief: ruleValueSchema(z.string()),
  recordRetention: ruleValueSchema(z.string()),
  changelog: z.array(changelogEntrySchema).min(1),
});

export type Rules = z.infer<typeof rulesSchema>;
export type RuleValue<T> = {
  value: T | null;
  status: RuleStatus;
  sourceTitle: string;
  sourceUrl: string;
  sourceDate: string | null;
  effectiveFrom?: string;
  reviewedAt: string;
  note?: string;
};
