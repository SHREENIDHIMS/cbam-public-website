import Link from 'next/link';
import { LegalEntityBlock, LegalPage, LegalTable } from '@/components/legal/LegalPage';
import { Alert } from '@/components/shared/Alert';
import { TOOL_DATA } from '@/lib/config/legal';
import { siteConfig } from '@/lib/config/site';
import { toolsConfig } from '@/lib/config/tools';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatInteger } from '@/lib/utils/format';

export const metadata = routeMetadata('/data-processing');

const MEGABYTE = 1024 * 1024;
const { maxFileBytes, maxDataRows } = toolsConfig.upload;

const SECTIONS = [
  {
    id: 'summary',
    title: 'The short version',
    body: (
      <>
        <ul>
          <li>
            When you upload a customs file to the liability preview, the file is read and checked in
            your browser. The file itself is not sent to us.
          </li>
          <li>
            When you run the preview, only the mapped columns of the rows that passed the checks are
            sent, with a fingerprint of the file and some counts.
          </li>
          <li>
            In demo mode nothing you send is saved. In live mode, how long it is kept has not been
            confirmed, and we say so rather than guess.
          </li>
          <li>Contact details are used to reply to you and for nothing else unless you opt in.</li>
        </ul>
        <LegalEntityBlock />
      </>
    ),
  },
  {
    id: 'modes',
    title: 'Demo mode and live mode',
    body: (
      <>
        <p>
          The website can run in two modes. The difference matters for what happens to your data.
        </p>
        <LegalTable
          caption="Behaviour in demo mode and in live mode"
          columns={['', 'Demo mode', 'Live mode']}
          rows={[
            [
              'What it is',
              'The website answers from built-in sample data and fixed rules. This is how it runs until the live service is connected.',
              'The website passes requests to the main application’s service. Not connected yet.',
            ],
            [
              'Preview rows',
              'Used in memory to build a labelled demo result, then discarded. Known sample files return a prepared sample result.',
              'Sent to the live service. Retention: to be confirmed.',
            ],
            [
              'Contact requests',
              'Checked, acknowledged and discarded. No email is sent.',
              'Sent to the live service. Retention: to be confirmed.',
            ],
            [
              'Fallback',
              'Not applicable.',
              'If the live service is unavailable the tool says so. It never falls back to demo results.',
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: 'tools',
    title: 'What each tool does with data',
    body: (
      <>
        <LegalTable
          caption="Data handling by public tool"
          columns={['Tool', 'Sent to our server', 'Not sent', 'Stored?']}
          rows={TOOL_DATA.map((row) => [row.tool, row.sent, row.notSent, row.stored])}
        />
      </>
    ),
  },
  {
    id: 'upload-steps',
    title: 'What happens to an upload',
    body: (
      <>
        <ol className="m-0 flex list-decimal flex-col gap-3 pl-5">
          <li>
            <strong>You choose a file.</strong> The browser checks the type (CSV or XLSX; macro
            files are refused), the size (up to {formatInteger(maxFileBytes / MEGABYTE)} MB) and the
            number of data rows (up to {formatInteger(maxDataRows)}). Nothing is sent yet.
          </li>
          <li>
            <strong>The browser reads it.</strong> It finds the heading row, suggests which column
            is which, and checks each row. This happens on your device, and the file stays there.
          </li>
          <li>
            <strong>You confirm the mapping.</strong> You can change any suggestion. Rows with
            problems are shown to you and left out.
          </li>
          <li>
            <strong>You run the preview.</strong> Only now does anything leave the browser: the rows
            that passed, limited to the columns you mapped, plus the file type, the sheet name, a
            SHA-256 fingerprint of the file and counts of rows found and excluded. Headings, the
            file name, unmapped columns and rejected rows are not included.
          </li>
          <li>
            <strong>The server checks and calculates.</strong> It limits request size and rate,
            validates the request against a schema, and passes it to the calculation. It does not
            write the rows to a log. If something fails it records an error code and nothing else.
          </li>
          <li>
            <strong>You see the result.</strong> The result page is built from the calculation. The
            website does not keep your file or rows in your browser’s local storage.
          </li>
        </ol>
        <p>
          Mapped columns can include supplier names, entry references and customs values. Treat them
          as business information, as we do.
        </p>
      </>
    ),
  },
  {
    id: 'contact-details',
    title: 'Contact details',
    body: (
      <>
        <p>
          The broker and pricing forms collect your name, email address, an optional organisation
          and an optional message. The same checks run in your browser and again on the server. A
          hidden field catches automated submissions, and we limit how many requests can come from
          one address in a short time.
        </p>
        <p>
          Marketing is a separate tickbox that is never ticked for you. Sending a request is not
          consent to marketing. In demo mode the request is acknowledged and discarded, and no email
          is sent.
        </p>
      </>
    ),
  },
  {
    id: 'rate-limiting',
    title: 'Rate limiting and logs',
    body: (
      <>
        <p>
          To limit abuse, the server counts requests per network address in memory for a few
          minutes. It stores a one-way hash of the address and route, not the address itself, and
          the counters disappear when the server restarts or the window ends.
        </p>
        <p>
          The hosting platform may keep standard request logs, such as time, address and requested
          page. Which provider and what it keeps is [to be confirmed]. Quick-estimate result
          addresses contain your range answers, so they may appear in such logs.
        </p>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytics',
    body: (
      <p>
        No analytics provider is connected. The built-in event code is off by default, drops any
        event that does not match a fixed list, and allows only fixed categories, never file
        contents, supplier names, email addresses or entered values.
      </p>
    ),
  },
  {
    id: 'roles',
    title: 'Roles and sub-processors',
    body: (
      <>
        <p>
          For contact details we expect to be the controller. For rows you send to the liability
          preview, our role (controller or processor) and the terms that apply once the live service
          is connected are [to be confirmed in the legal review]. Sub-processors, hosting location
          and any international transfers are [to be confirmed]. We will list them here before
          anything is processed in live mode.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security and your rights',
    body: (
      <>
        <p>
          The <Link href="/security">security page</Link> lists the controls in place. Your rights
          and how to use them are in the <Link href="/privacy">privacy notice</Link>. Questions
          about this page: {siteConfig.contact.privacy}.
        </p>
        <Alert tone="info">
          These limits and behaviours are those of the website as built today. If they change, this
          page changes with them.
        </Alert>
      </>
    ),
  },
] as const;

export default function DataProcessingPage() {
  return (
    <LegalPage
      formLabel="Data processing"
      title="What happens to the data you give the public tools."
      lead="A step-by-step account of uploads, previews and contact requests, including what we do not yet know."
      legalKey="dataProcessing"
      sections={SECTIONS}
    />
  );
}
