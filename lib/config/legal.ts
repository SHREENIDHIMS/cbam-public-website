import { siteConfig, type SiteConfig } from './site';

/**
 * Facts shared by the legal and trust pages, so that /privacy, /data-processing and /security
 * never describe the same behaviour in different words. Wording here must match the code: read
 * lib/upload, app/api, lib/forms and lib/api before changing any entry.
 */

export const LEGAL_DRAFT_DATE = '2026-10-06';

export type LegalKey = keyof SiteConfig['legal'];

export const DRAFT_NOTICE_TITLE = 'Draft — pending legal review';

export const DRAFT_NOTICE_BODY =
  'This text is a working draft. It describes how the public website behaves today and has not yet been reviewed by a lawyer. It is not final and may change. Details marked in square brackets are still to be confirmed.';

export function isLegalApproved(key: LegalKey): boolean {
  return siteConfig.legal[key].approved;
}

export interface CookieEntry {
  name: string;
  purpose: string;
  duration: string;
  category: 'Strictly necessary';
}

/**
 * Cookies set by this website's own code. Empty because none are set today. Add an entry here (and
 * it will appear on /privacy) before shipping anything that sets a cookie. Non-essential cookies
 * need prior consent and a banner (MASTER_PROMPT 24.1).
 */
export const COOKIES: readonly CookieEntry[] = [];

export interface ToolDataRow {
  tool: string;
  route: string;
  sent: string;
  notSent: string;
  stored: string;
}

/** What each public tool does with data. The single source for the data-processing page. */
export const TOOL_DATA: readonly ToolDataRow[] = [
  {
    tool: 'Threshold checker',
    route: '/threshold-checker',
    sent: 'Nothing. The calculation runs in your browser.',
    notSent: 'The values you type.',
    stored: 'Not stored.',
  },
  {
    tool: 'Quick estimate',
    route: '/quick-estimate',
    sent: 'Your five answers, as ranges and groups (for example "£100,000 to £500,000"), in the address of the result page. No exact figures, names or contact details.',
    notSent: 'Company or contact details.',
    stored:
      'Not saved by the website. The address stays in your browser history and may appear in the hosting provider’s standard request logs.',
  },
  {
    tool: 'Liability preview',
    route: '/liability-preview',
    sent: 'When you run the preview: the rows that passed the checks, limited to the columns you mapped (import date, commodity code, description, origin country, supplier name, net mass, customs value, entry reference and supplier declaration, where you supplied them), a fingerprint (SHA-256 hash) of the file, the file type, the sheet name and counts of rows found and excluded.',
    notSent:
      'The file itself, its name, its column headings, unmapped columns and rows that failed the checks.',
    stored:
      'Demo mode: calculated in memory and not saved. Live mode: retention is to be confirmed.',
  },
  {
    tool: 'Contact and broker forms',
    route: '/for-brokers',
    sent: 'Name, email address, optional organisation, optional message and whether you ticked the separate marketing box.',
    notSent: 'Nothing beyond those fields.',
    stored:
      'Demo mode: checked and acknowledged, then discarded. Live mode: retention is to be confirmed.',
  },
];

export const ICO_URL = 'https://ico.org.uk/make-a-complaint/';

export function hasConfirmedEmail(address: string): boolean {
  return /^[^\s@[\]]+@[^\s@[\]]+\.[^\s@[\]]+$/.test(address);
}
