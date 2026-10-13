/**
 * Copy for /for-brokers. Everything here describes intended capability, so each item carries an
 * honest availability label. None of it is a promise of a feature or a commercial term.
 */

export type BrokerAvailability = 'concept' | 'in_scoping' | 'if_offered';

export const BROKER_AVAILABILITY_LABELS: Record<BrokerAvailability, string> = {
  concept: 'Concept',
  in_scoping: 'Being scoped',
  if_offered: 'Only if commercially offered',
};

export interface BrokerCapability {
  key: string;
  title: string;
  body: string;
  availability: BrokerAvailability;
}

export const BROKER_CAPABILITIES: readonly BrokerCapability[] = [
  {
    key: 'clients',
    title: 'Several client organisations',
    body: 'Each importer you support is kept as its own organisation, with its own data, suppliers and position. Nothing is blended between clients.',
    availability: 'in_scoping',
  },
  {
    key: 'portfolio',
    title: 'Portfolio visibility',
    body: 'One view across your clients: threshold position, indicative exposure and how much supplier data is still missing, so you can see where to spend time first.',
    availability: 'in_scoping',
  },
  {
    key: 'workspaces',
    title: 'Client workspaces',
    body: 'Open a client to see the same calculation, sources and evidence that the importer sees. Every figure traces back to its working.',
    availability: 'in_scoping',
  },
  {
    key: 'onboarding',
    title: 'Bulk onboarding',
    body: 'The idea is to bring several importers in at once from a spreadsheet of client details and customs ledgers, using the same checks as the public upload preview.',
    availability: 'concept',
  },
  {
    key: 'api',
    title: 'Read-only API',
    body: 'A read-only interface for portfolio positions, so they can sit beside your own tools. No write access to a client record is planned.',
    availability: 'concept',
  },
  {
    key: 'partnership',
    title: 'Partnership and referral',
    body: 'If you would rather introduce importers than manage them, we can talk about a referral arrangement. Terms are not set, and we will not quote any until they are.',
    availability: 'concept',
  },
];

export const BROKER_WHITE_LABEL_NOTE =
  'White-label or co-branded use may be possible for some partners. It is not a standard option and has not been priced, so treat it as a conversation rather than a feature.';

export const BROKER_PREVIEW_NOTE =
  'The clients in this table are fictional. The figures are sample values to show the shape of the view and say nothing about any real business.';

export const BROKER_BOUNDARY_NOTE =
  'The private broker dashboard is part of the main application and is not on this website. Use this page to start a conversation; nothing here creates an account.';

export const BROKER_FORM_COPY = {
  title: 'Talk to us about your portfolio',
  lead: 'Tell us a little about who you support and we will reply by email. This is a conversation, not a sign-up, and it does not commit you to anything.',
  whatNext: [
    'We reply to the email address you give, usually to arrange a short call.',
    'We use your details only to answer this request, as set out in the privacy notice.',
    'You will not be added to any marketing list unless you tick the separate box.',
  ],
} as const;
