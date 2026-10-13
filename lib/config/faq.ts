import { rules as defaultRules } from './rules';
import type { Rules } from './rules-schema';
import { formatDate, formatGBP } from '@/lib/utils/format';

/** FAQ entries. Every figure is interpolated from the rules config, never typed. */

export interface FaqSource {
  title: string;
  url: string;
  /** Status of the rules value the answer relies on, so the page can say when it is unverified. */
  status: Rules['startDate']['status'];
}

export interface FaqEntry {
  question: string;
  answer: string;
  source?: FaqSource;
}

function sourceOf(rule: {
  sourceTitle: string;
  sourceUrl: string;
  status: FaqSource['status'];
}): FaqSource {
  return { title: rule.sourceTitle, url: rule.sourceUrl, status: rule.status };
}

const TO_CONFIRM = 'to be confirmed';

export function getFaqEntries(source: Rules = defaultRules): FaqEntry[] {
  const threshold = source.registrationThreshold.value;
  const thresholdText = threshold
    ? `${formatGBP(threshold.amount)} over ${threshold.period}`
    : TO_CONFIRM;
  const start = source.startDate.value ? formatDate(source.startDate.value) : TO_CONFIRM;
  const sectors = source.sectors.value?.map((sector) => sector.label.toLowerCase()).join(', ');

  return [
    {
      question: 'What is UK CBAM?',
      answer: `The UK Carbon Border Adjustment Mechanism is intended to put a carbon price on certain carbon-intensive goods imported into the UK. The start date shown in our rules snapshot is ${start}. Check the linked GOV.UK source before relying on any date.`,
      source: sourceOf(source.startDate),
    },
    {
      question: 'Does the registration threshold apply to every import?',
      answer: `The threshold in our rules snapshot is ${thresholdText}. It relates to goods in scope and some goods may not count towards it. Read the GOV.UK guidance on goods that may not contribute before drawing conclusions.`,
      source: sourceOf(source.registrationThreshold),
    },
    {
      question: 'Which goods are covered?',
      answer: `Our rules snapshot lists these sectors: ${sectors ?? TO_CONFIRM}. Whether a specific product is in scope depends on its commodity code in the legislation, which this website does not resolve.`,
      source: sourceOf(source.sectors),
    },
    {
      question: 'What happens if supplier emissions are missing?',
      answer:
        'A published default value may be used in place of supplier data. Results using defaults are labelled as such so you can see where real supplier data would improve the position.',
    },
    {
      question: 'Can I upload my customs data?',
      answer:
        'The liability preview lets you upload a customs file and check it. Reading and checking the file happens in your browser, and only the mapped columns of the rows that passed the checks are sent when you run the preview. The file itself is not sent.',
    },
    {
      question: 'What is carbon price relief?',
      answer:
        'Relief is intended to avoid charging twice where a carbon price has already been paid in the country of production. We explain the concept and link the source; the details are still to be confirmed.',
      source: sourceOf(source.carbonPriceRelief),
    },
    {
      question: 'Does the software submit the return?',
      answer:
        'This website provides indicative previews and education. It does not submit anything to HMRC. Always check requirements with official guidance or a qualified adviser.',
    },
  ];
}
