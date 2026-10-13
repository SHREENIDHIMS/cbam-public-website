import Link from 'next/link';
import { LegalEntityBlock, LegalPage } from '@/components/legal/LegalPage';
import { siteConfig } from '@/lib/config/site';
import { routeMetadata } from '@/lib/seo/metadata';

export const metadata = routeMetadata('/terms');

const SECTIONS = [
  {
    id: 'about',
    title: 'About these terms',
    body: (
      <>
        <p>
          These terms cover your use of the public {siteConfig.brandName} website and its free
          tools. They do not cover the main application, which has its own terms. By using the
          website you agree to them. If you do not agree, please do not use it.
        </p>
        <LegalEntityBlock />
      </>
    ),
  },
  {
    id: 'not-advice',
    title: 'Indicative results, not advice',
    body: (
      <>
        <p>
          The tools produce indicative previews based on the information you provide and a named
          snapshot of public rules. They are not legal, tax, customs or financial advice, and they
          do not tell you what you must declare or pay. This website does not submit anything to
          HMRC.
        </p>
        <p>
          Always check requirements against official guidance or with a qualified adviser before you
          rely on a result. We do not guarantee that a result is complete, current or free from
          error, and we do not say that anyone is compliant.
        </p>
      </>
    ),
  },
  {
    id: 'rules-and-sources',
    title: 'Rules, rates and sources',
    body: (
      <>
        <p>
          Values are taken from public sources and labelled by status: official, proposed, scenario
          or unverified. Some are not yet verified, and scenario values are assumptions for
          illustration. Each result names the rules snapshot it used, so you can see how current it
          is. The <Link href="/rules-changelog">rules changelog</Link> lists changes.
        </p>
        <p>
          Demo data is labelled as demo data. A sample figure or a fictional company is there to
          show how a screen works and says nothing about any real business.
        </p>
      </>
    ),
  },
  {
    id: 'your-data',
    title: 'Your data and uploads',
    body: (
      <>
        <p>
          You are responsible for what you provide. Only upload or enter information you are
          entitled to use for this purpose, and do not include personal data about individuals
          unless you have a lawful reason. Please do not put customs data in a contact form.
        </p>
        <p>
          The <Link href="/data-processing">data-processing page</Link> and the{' '}
          <Link href="/privacy">privacy notice</Link> describe what happens to information you
          provide.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <ul>
        <li>Do not try to disrupt the website, probe it for weaknesses or overload it.</li>
        <li>
          Do not use scripts to submit forms or tools at scale. We limit request rates to protect
          the service.
        </li>
        <li>Do not upload files containing malicious code.</li>
        <li>Do not misrepresent a result as an official assessment.</li>
      </ul>
    ),
  },
  {
    id: 'ownership',
    title: 'Ownership',
    body: (
      <p>
        The website, its text, design and software belong to us or our licensors. You may print or
        share a result for your own business purposes. Please do not copy the site or present it as
        your own. Third-party names and sources belong to their owners.
      </p>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and changes',
    body: (
      <p>
        The tools are provided as they are, and we may change, pause or withdraw any of them. We try
        to keep the website available but do not promise it will be uninterrupted. Some features run
        in demo mode until the live service is connected, and where that applies the page says so.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Our responsibility to you',
    body: (
      <>
        <p>
          Nothing in these terms limits liability that cannot be limited by law, including for death
          or personal injury caused by negligence or for fraud.
        </p>
        <p>
          Subject to that, [limitation of liability for use of the free tools, to be drafted in the
          legal review]. Because the tools are free and indicative, you should not make a business
          decision on a result alone.
        </p>
      </>
    ),
  },
  {
    id: 'law',
    title: 'Governing law and contact',
    body: (
      <>
        <p>
          [Governing law and jurisdiction, expected to be England and Wales, to be confirmed in the
          legal review.]
        </p>
        <p>Questions about these terms: {siteConfig.contact.general}.</p>
        <p>
          We may update these terms and will show the date of the latest version. They stay marked
          as a draft until they have been reviewed.
        </p>
      </>
    ),
  },
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      formLabel="Terms"
      title="Terms of use."
      lead="The ground rules for using the public website and its free tools."
      legalKey="terms"
      sections={SECTIONS}
    />
  );
}
