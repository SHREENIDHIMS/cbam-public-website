import Link from 'next/link';
import {
  CENTRE_NAV,
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  RIGHT_NAV,
  SIGN_IN_LABEL,
} from '@/lib/config/navigation';
import { signInAttributes } from '@/lib/analytics/attributes';
import { buildHandOffLink } from '@/lib/config/site';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { BrandMark } from './BrandMark';
import { HeaderScrollState } from './HeaderScrollState';
import { MobileNav } from './MobileNav';

const HEADER_ID = 'site-header';

const linkClass = 'rounded-xs px-2 py-2 text-[0.9375rem] whitespace-nowrap text-ink no-underline';

/** Link label with the text-roll hover (styles/elements.css .roll). */
function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
    </span>
  );
}

export function SiteHeader() {
  const signIn = buildHandOffLink('signIn');
  return (
    <header
      id={HEADER_ID}
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-canvas transition-colors duration-300 data-[scrolled=true]:border-line"
    >
      <HeaderScrollState targetId={HEADER_ID} />
      <div className="mx-auto flex h-[4.5rem] w-full max-w-site items-center justify-between gap-6 px-5 md:px-10">
        <BrandMark />

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="nav-slash m-0 flex list-none items-center gap-1 p-0">
            {CENTRE_NAV.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={linkClass}>
                  <Roll>{item.label}</Roll>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-1 xl:flex">
          {RIGHT_NAV.map((item) => (
            <Link key={item.label} href={item.href} className={linkClass}>
              <Roll>{item.label}</Roll>
            </Link>
          ))}
          {signIn.configured ? (
            <a
              href={signIn.href}
              className={linkClass}
              {...signInAttributes({ location: 'header' })}
            >
              <Roll>{SIGN_IN_LABEL}</Roll>
            </a>
          ) : null}
          <ButtonLink
            href={PRIMARY_CTA_HREF}
            className="ml-3"
            track={{ location: 'header', cta: 'check_exposure' }}
          >
            {PRIMARY_CTA_LABEL}
          </ButtonLink>
        </div>

        <div className="xl:hidden">
          <MobileNav
            centre={CENTRE_NAV}
            right={RIGHT_NAV}
            signIn={{
              href: signIn.configured ? signIn.href : null,
              label: signIn.configured ? SIGN_IN_LABEL : 'Sign-in link to be confirmed',
            }}
          />
        </div>
      </div>
    </header>
  );
}
