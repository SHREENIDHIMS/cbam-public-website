import Link from 'next/link';
import { LegalPage, LegalTable } from '@/components/legal/LegalPage';
import { Alert } from '@/components/shared/Alert';
import { Badge } from '@/components/shared/Badge';
import { siteConfig } from '@/lib/config/site';
import { routeMetadata } from '@/lib/seo/metadata';

export const metadata = routeMetadata('/security');

const IN_PLACE = <Badge tone="positive">In place</Badge>;
const PARTLY = <Badge tone="watch">In place, with limits</Badge>;
const TBC = <Badge tone="neutral">To be confirmed</Badge>;

const SECTIONS = [
  {
    id: 'approach',
    title: 'Our approach',
    body: (
      <>
        <p>
          This page describes the controls of the public website and tools at a high level. It does
          not describe internal configuration, and it does not claim more than is true. Where
          something is not in place, or not yet confirmed, it says so.
        </p>
        <Alert tone="info" title="What we do not claim">
          We hold no security certification and do not describe the website as certified, audited or
          approved by any body. The controls below are things the code does today.
        </Alert>
      </>
    ),
  },
  {
    id: 'your-data',
    title: 'Keeping your data on your device',
    body: (
      <>
        <ul>
          <li>
            A customs file is read, checked and mapped in your browser. The file itself is not sent
            to our server.
          </li>
          <li>
            When you run a preview, only the mapped columns of rows that passed the checks are sent,
            with a fingerprint of the file and some counts.
          </li>
          <li>The website does not save files, rows or results in your browser’s local storage.</li>
          <li>
            Uploads are limited by type (CSV or XLSX), size and row count before anything is read.
            Macro-enabled workbooks are refused.
          </li>
        </ul>
        <p>
          The <Link href="/data-processing">data-processing page</Link> gives the full account.
        </p>
      </>
    ),
  },
  {
    id: 'controls',
    title: 'Controls in the website',
    body: (
      <LegalTable
        caption="Security controls and their status"
        columns={['Control', 'What it does', 'Status']}
        rows={[
          [
            'Security headers',
            'Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, a restrictive Permissions-Policy, and a ban on being framed by other sites.',
            PARTLY,
          ],
          [
            'Script policy',
            'No script evaluation in production. The policy still allows inline scripts, because the framework needs them without per-request nonces.',
            PARTLY,
          ],
          [
            'Request checks',
            'Requests that change data are checked against the website’s own origin, validated against a schema, and limited in size.',
            IN_PLACE,
          ],
          [
            'Rate limiting',
            'Each tool and form limits how often one network address can use it. The counters are held in memory on each server instance and are not shared between instances.',
            PARTLY,
          ],
          [
            'Bot trap',
            'A hidden form field catches automated submissions. There is no CAPTCHA.',
            IN_PLACE,
          ],
          [
            'No raw data in logs',
            'The server does not write uploaded rows or form contents to logs. Failures record an error code only.',
            IN_PLACE,
          ],
          [
            'Secrets',
            'Credentials for the calculation service stay on the server and are never sent to the browser.',
            IN_PLACE,
          ],
          ['External links', 'Links to other sites open with safe link attributes.', IN_PLACE],
          [
            'Analytics',
            'No analytics provider is connected. Events are restricted by design to fixed categories and exclude file contents, names, emails and entered values.',
            IN_PLACE,
          ],
          ['Cookies', 'The website’s own code sets no cookies.', IN_PLACE],
        ]}
      />
    ),
  },
  {
    id: 'not-yet',
    title: 'What is not yet confirmed',
    body: (
      <>
        <p>
          The public website currently runs in demo mode. The controls that will protect data once
          it is processed by the live service belong partly to that service, and are not described
          here until they are confirmed:
        </p>
        <ul>
          <li>Encryption of stored data, and how long data is kept.</li>
          <li>Hosting provider, location and any international transfers.</li>
          <li>Access controls, staff access and audit logging.</li>
          <li>Backups, incident response and any independent testing.</li>
        </ul>
        <p>{TBC} We will add each item here as it is confirmed, not before.</p>
      </>
    ),
  },
  {
    id: 'report',
    title: 'Reporting a problem',
    body: (
      <>
        <p>
          If you think you have found a security problem, please tell us at{' '}
          {siteConfig.contact.general} and give us reasonable time to respond before sharing
          details. Please do not include customs data or personal information in your report. We do
          not yet publish a security.txt file or a formal disclosure programme.
        </p>
      </>
    ),
  },
] as const;

export default function SecurityPage() {
  return (
    <LegalPage
      formLabel="Security"
      title="How the public tools protect your data."
      lead="High-level controls, stated honestly, including what is not yet in place."
      sections={SECTIONS}
    />
  );
}
