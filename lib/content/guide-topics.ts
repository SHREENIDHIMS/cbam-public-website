/** Guide topics and labels, kept free of the schema library so browser code can import them. */

export const GUIDE_TOPICS = [
  'basics',
  'threshold',
  'scope',
  'suppliers',
  'relief',
  'returns',
] as const;
export type GuideTopic = (typeof GUIDE_TOPICS)[number];

export const GUIDE_TOPIC_LABELS: Readonly<Record<GuideTopic, string>> = {
  basics: 'Basics',
  threshold: 'Threshold',
  scope: 'Scope',
  suppliers: 'Suppliers',
  relief: 'Relief',
  returns: 'Returns',
};
