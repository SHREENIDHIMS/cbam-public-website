'use client';

import Link from 'next/link';
import '@mantine/core/styles.layer.css';
import { Drawer, MantineProvider } from '@mantine/core';
import {
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  SIGN_IN_LABEL,
  type NavItem,
} from '@/lib/config/navigation';
import { ctaAttributes, signInAttributes } from '@/lib/analytics/attributes';
import { cssVariablesResolver, theme } from '@/lib/design/theme';

export interface MobileNavDrawerProps {
  opened: boolean;
  onClose: () => void;
  centre: readonly NavItem[];
  right: readonly NavItem[];
  signIn: { href: string | null; label: string };
}

const itemClass =
  'block border-b border-line px-1 py-3.5 font-display text-lg font-[650] tracking-[-0.01em] text-ink no-underline hover:text-primary';

/** Mantine Drawer with the mobile navigation. Loaded on first open only. */
export default function MobileNavDrawer({
  opened,
  onClose,
  centre,
  right,
  signIn,
}: MobileNavDrawerProps) {
  return (
    <MantineProvider
      theme={theme}
      forceColorScheme="light"
      cssVariablesResolver={cssVariablesResolver}
    >
      <Drawer
        opened={opened}
        onClose={onClose}
        position="right"
        size="min(22rem, 100%)"
        title="Menu"
        closeButtonProps={{ 'aria-label': 'Close menu' }}
      >
        <nav aria-label="Mobile">
          <Link
            href={PRIMARY_CTA_HREF}
            onClick={onClose}
            {...ctaAttributes({ location: 'mobile_nav', cta: 'check_exposure' })}
            className="btn btn-primary btn-lg mb-6 w-full"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
          <ul className="m-0 list-none border-t-2 border-ink p-0">
            {[...centre, ...right].map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} onClick={onClose} className={itemClass}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              {signIn.href ? (
                <a
                  href={signIn.href}
                  className={itemClass}
                  {...signInAttributes({ location: 'mobile_nav' })}
                >
                  {SIGN_IN_LABEL}
                </a>
              ) : (
                <span className="block px-2 py-3 text-base text-ink-subtle">{signIn.label}</span>
              )}
            </li>
          </ul>
        </nav>
      </Drawer>
    </MantineProvider>
  );
}
