import '@/lib/validation/zod-browser';
import { SCENARIO_ASSUMPTIONS } from './scenario-assumptions';
import { rulesSchema, type Rules } from './rules-schema';

/**
 * Regulatory values shown on the public site (MASTER_PROMPT 31, DECISIONS 7).
 *
 * A value is `official` only where its primary GOV.UK or legislation.gov.uk page was opened and
 * read on the review date (see the verification protocol in docs/DECISIONS.md section 7 and the
 * record in docs/PROGRESS.md). Anything not confirmed stays `unverified`.
 * A `null` value renders "To be confirmed", never a guessed figure.
 */

const POLICY_SUMMARY = {
  sourceTitle: 'Carbon Border Adjustment Mechanism (CBAM): Policy summary',
  sourceUrl:
    'https://www.gov.uk/government/publications/carbon-border-adjustment-mechanism-cbam-policy-summary/carbon-border-adjustment-mechanism-cbam-policy-summary',
  /** "Updated 9 September 2026" on the page. */
  sourceDate: '2026-09-09',
} as const;

const WORK_OUT_DATE = {
  sourceTitle:
    'Work out the date you will need to register for Carbon Border Adjustment Mechanism (CBAM)',
  sourceUrl:
    'https://www.gov.uk/guidance/work-out-the-date-youll-need-to-register-for-carbon-border-adjustment-mechanism-cbam',
  /** "Published: 16 July 2026" on the page. */
  sourceDate: '2026-07-16',
} as const;

const REGISTER_COLLECTION = {
  sourceTitle: 'Check if you will need to register for Carbon Border Adjustment Mechanism (CBAM)',
  sourceUrl:
    'https://www.gov.uk/government/collections/check-if-youll-need-to-register-for-carbon-border-adjustment-mechanism-cbam',
} as const;

const REVIEWED_AT = '2026-10-06';

const seed: Rules = {
  rulesVersion: 'public-rules-2026-10-06',
  reviewedAt: REVIEWED_AT,
  startDate: {
    value: '2027-01-01',
    status: 'official',
    ...POLICY_SUMMARY,
    effectiveFrom: '2027-01-01',
    reviewedAt: REVIEWED_AT,
    note: 'The policy summary gives 1 January 2027 as the commencement date. The Finance Act 2026 (Part 5, section 158) applies the charge to goods imported on or after that date.',
  },
  registrationThreshold: {
    value: { amount: 50000, currency: 'GBP', period: '12 months' },
    status: 'official',
    ...WORK_OUT_DATE,
    effectiveFrom: '2027-01-01',
    reviewedAt: REVIEWED_AT,
    note: 'The amount is the same on the policy summary. It is tested two ways (see thresholdTests): the previous 12 months, and the expected next 30 days.',
  },
  thresholdTests: {
    value: [
      {
        key: 'backward',
        title: 'Look-back test',
        description:
          'From 1 January 2027, on the first day of each month, check whether the CBAM goods you imported in the previous 12 months reach the registration threshold. Goods imported before 1 January 2027 are not counted.',
      },
      {
        key: 'forward',
        title: 'Forward-looking test',
        description:
          'You must register if you expect to import CBAM goods worth the registration threshold or more within the next 30 days. This applies from 1 January 2027.',
      },
    ],
    status: 'official',
    ...WORK_OUT_DATE,
    effectiveFrom: '2027-01-01',
    reviewedAt: REVIEWED_AT,
    note: 'Paraphrased from the HMRC guidance. If both tests apply, the earliest date you become liable is your registration start date.',
  },
  thresholdExclusions: {
    value:
      'Some imported goods may not count towards the threshold: goods imported for private use, goods of UK origin, goods eligible for returned goods relief, goods under temporary admission with full relief from customs duties, and goods under certain special customs procedures.',
    status: 'official',
    sourceTitle:
      'Imported Carbon Border Adjustment (CBAM) goods that may not contribute towards the registration threshold',
    sourceUrl:
      'https://www.gov.uk/guidance/imported-carbon-border-adjustment-cbam-goods-that-may-not-contribute-towards-the-registration-threshold',
    sourceDate: '2026-07-16',
    reviewedAt: REVIEWED_AT,
    note: 'A summary of the five categories on the guidance page. Conditions apply to each; read the page.',
  },
  sectors: {
    value: [
      { key: 'aluminium', label: 'Aluminium' },
      { key: 'cement', label: 'Cement' },
      { key: 'fertilisers', label: 'Fertilisers' },
      { key: 'hydrogen', label: 'Hydrogen' },
      { key: 'iron_steel', label: 'Iron and steel' },
    ],
    status: 'official',
    ...POLICY_SUMMARY,
    reviewedAt: REVIEWED_AT,
    note: 'Section 143 of the Finance Act 2026 lists aluminium goods, cement, fertilisers, hydrogen, and iron and steel goods. Only the specific goods in the legislation are CBAM goods.',
  },
  commodityScopeBasis: {
    value:
      'Whether goods are in scope is decided by their commodity code. HMRC tells importers to check the commodity codes of the goods they import.',
    status: 'official',
    sourceTitle: 'Check which goods are in scope of Carbon Border Adjustment Mechanism (CBAM)',
    sourceUrl:
      'https://www.gov.uk/government/publications/check-which-goods-are-in-scope-of-carbon-border-adjustment-mechanism-cbam',
    sourceDate: '2026-07-16',
    reviewedAt: REVIEWED_AT,
    note: 'The goods are specified by commodity code in Schedule 16 to the Finance Act 2026. This website does not resolve scope for you.',
  },
  registrationOpens: {
    value: null,
    status: 'unverified',
    ...REGISTER_COLLECTION,
    sourceDate: null,
    reviewedAt: REVIEWED_AT,
    note: 'The registration collection page appeared to say registration opens by 1 January 2028, but the exact wording was not confirmed in full. Not displayed.',
  },
  registrationDeadline: {
    value: '2028-01-31',
    status: 'official',
    ...POLICY_SUMMARY,
    reviewedAt: REVIEWED_AT,
    note: 'Ordinarily a liable person has 30 days from the day they become liable to register. During the first calendar year of CBAM, businesses have until this date.',
  },
  firstReturnDeadline: {
    value: '2028-05-31',
    status: 'official',
    ...POLICY_SUMMARY,
    reviewedAt: REVIEWED_AT,
    note: 'The first accounting period runs from 1 January 2027 to 31 December 2027. Later periods are quarterly and have their own dates on the policy summary.',
  },
  paymentDeadline: {
    value: '2028-05-31',
    status: 'official',
    ...POLICY_SUMMARY,
    reviewedAt: REVIEWED_AT,
    note: 'For the first accounting period only: returns and payments are due five months after the period ends. Later periods have their own dates.',
  },
  rateState: {
    value: {
      mechanism:
        'One rate per sector, calculated and published by the government at the start of each quarter from 1 January 2027. It starts from the average UK ETS auction clearing price in the previous quarter, reduced for free allocation.',
      currentRate: null,
      publishedAt: null,
    },
    status: 'official',
    ...POLICY_SUMMARY,
    reviewedAt: REVIEWED_AT,
    note: 'The mechanism is official. No CBAM rate was found on the pages read on the review date, so none is shown. The policy summary says an illustrative example rate would be set out in autumn 2026; it had not been seen.',
  },
  scenarioRates: [
    {
      key: 'scenario-illustrative',
      label: 'Illustrative scenario rate',
      ratePerTonne: SCENARIO_ASSUMPTIONS.rate.value,
      status: 'scenario',
      note: 'Invented for demonstration so results have a rate to work with. It is not a forecast and not an official rate.',
    },
  ],
  carbonPriceRelief: {
    value:
      'Relief can be claimed where the emissions embodied in the goods were subject to a qualifying carbon pricing scheme, and you hold a carbon pricing verification form completed by an independent verifier.',
    status: 'official',
    sourceTitle: 'Claiming Carbon Price Relief for Carbon Border Adjustment Mechanism (CBAM)',
    sourceUrl:
      'https://www.gov.uk/government/collections/claiming-carbon-price-relief-for-carbon-border-adjustment-mechanism-cbam',
    sourceDate: '2026-07-16',
    reviewedAt: REVIEWED_AT,
    note: 'Concept summary only. The relief is the effective carbon price multiplied by the embodied emissions covered by the scheme; the importer must check the current list of qualifying schemes.',
  },
  recordRetention: {
    value: '6 years',
    status: 'official',
    sourceTitle: 'Keeping records for Carbon Border Adjustment Mechanism (CBAM)',
    sourceUrl:
      'https://www.gov.uk/guidance/keeping-records-for-carbon-border-adjustment-mechanism-cbam',
    sourceDate: '2026-07-16',
    reviewedAt: REVIEWED_AT,
    note: 'Counted from the later of the date the record was created and the end of the accounting period it relates to.',
  },
  changelog: [
    {
      date: REVIEWED_AT,
      summary:
        'Checked the rules snapshot against GOV.UK and legislation.gov.uk pages. Start date, registration threshold, threshold tests, exclusions, sectors, commodity-code scope, first-year registration and return dates, rate mechanism, carbon price relief and record retention are now marked official with their source and date. The registration opening date and any published rate are still not shown.',
      affectedKeys: [
        'startDate',
        'registrationThreshold',
        'thresholdTests',
        'thresholdExclusions',
        'sectors',
        'commodityScopeBasis',
        'registrationDeadline',
        'firstReturnDeadline',
        'paymentDeadline',
        'rateState',
        'carbonPriceRelief',
        'recordRetention',
      ],
    },
    {
      date: REVIEWED_AT,
      summary:
        'Initial snapshot. All values were seeded as unverified pending a check against primary sources.',
      affectedKeys: [
        'startDate',
        'registrationThreshold',
        'thresholdTests',
        'thresholdExclusions',
        'sectors',
        'commodityScopeBasis',
        'registrationOpens',
        'firstReturnDeadline',
        'paymentDeadline',
        'rateState',
        'carbonPriceRelief',
        'recordRetention',
      ],
    },
  ],
};

/** Validated at import time so a malformed rules file fails the build. */
export const rules: Rules = rulesSchema.parse(seed);
export const currentRulesVersion = rules.rulesVersion;
