import Link from 'next/link';
import { LegalEntityBlock, LegalPage, LegalTable } from '@/components/legal/LegalPage';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { COOKIES, ICO_URL, TOOL_DATA } from '@/lib/config/legal';
import { siteConfig } from '@/lib/config/site';
import { routeMetadata } from '@/lib/seo/metadata';

export const metadata = routeMetadata('/privacy');

const SECTIONS = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          This notice explains how {siteConfig.brandName} handles personal information on its public
          website and tools. The public website is separate from the main application, which has its
          own terms and notices.
        </p>
        <LegalEntityBlock />
        <p>
          For the information described here we expect to act as the controller. That is a working
          assumption for the legal review to confirm.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <p>
          We collect as little as we can. You can use the threshold checker, the quick estimate and
          the liability preview without giving your name or email address.
        </p>
        <LegalTable
          caption="What each public tool sends and keeps"
          columns={['Tool', 'What is sent to our server', 'Stored?']}
          rows={TOOL_DATA.map((row) => [row.tool, row.sent, row.stored])}
        />
        <p>
          The data-processing page describes each step in more detail, including what stays in your
          browser: <Link href="/data-processing">how the public tools handle data</Link>.
        </p>
        <p>
          Customs files can contain supplier names and other business information. Please do not
          upload personal data about individuals unless you are entitled to, and do not put customs
          data in the contact form.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it, and why',
    body: (
      <>
        <ul>
          <li>
            <strong>To answer your request.</strong> We use your name, email address and message to
            reply to a contact or broker request. Our draft basis is legitimate interests in
            responding to people who contact us.
          </li>
          <li>
            <strong>To run the tools.</strong> Rows from a liability preview are used only to
            calculate the preview you asked for.
          </li>
          <li>
            <strong>To keep the site working and safe.</strong> We limit how often a form or tool
            can be used from one address, and we ignore forms filled in by automated scripts.
          </li>
          <li>
            <strong>Marketing, only if you ask.</strong> There is a separate, unticked box on our
            forms. We send marketing emails only if you tick it, and you can withdraw at any time.
            Sending a request is never taken as consent to marketing.
          </li>
        </ul>
        <p>
          The lawful bases above are a draft and are to be confirmed in the legal review. We do not
          make decisions about you by automated means that have legal or similarly significant
          effects.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and similar technologies',
    body: (
      <>
        <p>
          We use strictly necessary cookies only. We do not use advertising, tracking or analytics
          cookies, so there is no cookie banner. If that ever changes, we will ask for your consent
          first and give you equal-weight Accept and Reject choices and a way to change your mind.
        </p>
        <LegalTable
          caption="Cookies set by this website"
          columns={['Name', 'Purpose', 'Duration', 'Category']}
          rows={
            COOKIES.length > 0
              ? COOKIES.map((cookie) => [
                  cookie.name,
                  cookie.purpose,
                  cookie.duration,
                  cookie.category,
                ])
              : [
                  [
                    'None set',
                    'This website’s own code does not set any cookies today.',
                    'Not applicable',
                    'Not applicable',
                  ],
                ]
          }
        />
        <p>
          The website does not save your files, answers or results in your browser’s local storage.
          Our hosting provider is [to be confirmed]. If its platform sets a strictly necessary
          cookie, for example for security or load balancing, we will list it in this table before
          launch.
        </p>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytics',
    body: (
      <>
        <p>
          No analytics service is connected at present. The code that records a few interactions,
          such as which call-to-action was selected, is switched off by default and sends nothing
          anywhere.
        </p>
        <p>
          If we add analytics, the events are limited by design to fixed categories (for example
          “quick estimate completed”). They never contain file contents, supplier names, email
          addresses or the values you entered. We would choose a provider that does not use cookies
          or device storage, or ask for your consent first, and we would update this page.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    body: (
      <>
        <p>We do not sell personal information. We expect to use these kinds of provider:</p>
        <ul>
          <li>A hosting provider to run the website: [to be confirmed].</li>
          <li>
            In live mode, the backend of the main application, which receives preview rows and
            contact requests so it can respond to them: [to be confirmed].
          </li>
          <li>
            An email service for replying to requests and, if you opt in, sending updates: none is
            connected today.
          </li>
        </ul>
        <p>
          International transfers: not yet known, because the providers are not confirmed. We will
          say where information is processed and what safeguards apply before the live service
          starts.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <>
        <p>
          In demo mode, which is how this website runs until the live service is connected, previews
          are calculated in memory and not saved, and contact requests are checked and then
          discarded.
        </p>
        <p>
          In live mode, retention periods have not been set. We will not state one until it is
          confirmed. Until then, assume nothing about how long live information is kept and ask us
          before you send anything sensitive.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          Under UK data protection law you may ask for access to your information, correction,
          erasure, restriction, a portable copy, or to object to our use of it. Where we rely on
          consent, you can withdraw it at any time.
        </p>
        <p>
          To use these rights, contact us at {siteConfig.contact.privacy}. If you are unhappy with
          how we have handled your information, you can complain to the Information Commissioner’s
          Office at <ExternalLink href={ICO_URL}>ico.org.uk</ExternalLink>. We would welcome the
          chance to put things right first.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this notice',
    body: (
      <p>
        We will update this notice when the way the website handles information changes, and show
        the date of the latest version. The notice stays marked as a draft until it has been
        reviewed.
      </p>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      formLabel="Privacy"
      title="Privacy notice."
      lead="What the public website and tools do with information, in plain English."
      legalKey="privacy"
      sections={SECTIONS}
    />
  );
}
