import '@/lib/validation/zod-browser';
import { z } from 'zod';
import { formatGBP } from '@/lib/utils/format';

/**
 * Commercial plans. `price: null` renders "Talk to us" until prices are approved (MASTER_PROMPT 20).
 * Features describe what a plan is intended to include and are not a commitment.
 */

export const planSchema = z.object({
  key: z.enum(['importer', 'broker_partner']),
  name: z.string().min(1),
  audience: z.string().min(1),
  price: z.number().nonnegative().nullable(),
  currency: z.literal('GBP'),
  features: z.array(z.string().min(1)).min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().regex(/^\/[a-z0-9\-/]*(#[a-z0-9-]+)?$/),
});
export type Plan = z.infer<typeof planSchema>;

export const PRICING_PLANS: readonly Plan[] = z.array(planSchema).parse([
  {
    key: 'importer',
    name: 'Importer',
    audience: 'For businesses importing goods that may fall under UK CBAM.',
    price: null,
    currency: 'GBP',
    features: [
      'Public tools: exposure check, threshold checker and liability preview',
      'A saved workspace, so a position can be revisited and updated',
      'Supplier workflows for requesting and tracking emissions data',
      'Evidence kept against each figure, with its source',
      'Reports you can share with colleagues and advisers',
    ],
    ctaLabel: 'Talk to us',
    ctaHref: '/pricing#talk-to-us',
  },
  {
    key: 'broker_partner',
    name: 'Broker and partner',
    audience: 'For brokers and advisers supporting several importers.',
    price: null,
    currency: 'GBP',
    features: [
      'Client portfolios: one view across the importers you support',
      'Onboarding for several clients, with a consistent set of checks',
      'Reporting for each client and across the portfolio',
      'A read-only API concept for portfolio positions',
    ],
    ctaLabel: 'Talk to us',
    ctaHref: '/for-brokers#talk-to-us',
  },
]);

export function priceLabel(plan: Plan): string {
  return plan.price === null ? 'Talk to us' : `From ${formatGBP(plan.price)}`;
}

export const PRICING_STATUS_NOTE =
  'No plan or price has been approved yet, so none is shown. The lists below describe what each plan is intended to include. They may change before anything is offered, and none of it is a commitment.';

export interface PricingClarification {
  question: string;
  answer: string;
}

export const PRICING_CLARIFICATIONS: readonly PricingClarification[] = [
  {
    question: 'Are the public tools free?',
    answer:
      'You can use the exposure check, quick estimate, threshold checker and liability preview without an account and without paying. If that changes, we will say so on those pages before you start.',
  },
  {
    question: 'Why is there no price?',
    answer:
      'Because none has been approved. We would rather say so than show a number we may not stand behind. When prices are set, they will appear on this page.',
  },
  {
    question: 'Will the price depend on the number of clients or lines?',
    answer:
      'We do not know yet. How plans are measured is part of what is still being decided, so we cannot say whether it will depend on clients, suppliers, import lines or something else.',
  },
  {
    question: 'Is there a trial, a discount or a limited offer?',
    answer:
      'Not at present. We do not run countdowns or limited-time offers, and we will not invent urgency.',
  },
  {
    question: 'What does talking to us commit me to?',
    answer:
      'Nothing. We will reply to your email, usually to arrange a short call. You will not be added to a marketing list unless you tick the separate box on the form.',
  },
];
