'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu } from 'lucide-react';
import type { NavItem } from '@/lib/config/navigation';

interface MobileNavProps {
  centre: readonly NavItem[];
  right: readonly NavItem[];
  signIn: { href: string | null; label: string };
}

// The Drawer (and its Mantine dependencies) load on first interaction so content pages stay light.
const loadDrawer = () => import('./MobileNavDrawer');
const MobileNavDrawer = dynamic(loadDrawer, { ssr: false });

export function MobileNav({ centre, right, signIn }: MobileNavProps) {
  const [opened, setOpened] = useState(false);
  const [requested, setRequested] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    setRequested(true);
    setOpened(true);
  };

  // The drawer mounts after the trigger was focused, so focus is returned explicitly.
  const close = () => {
    setOpened(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        onPointerEnter={() => void loadDrawer()}
        onFocus={() => void loadDrawer()}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={opened}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-transparent text-ink hover:bg-surface-alt"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      {requested ? (
        <MobileNavDrawer
          opened={opened}
          onClose={close}
          centre={centre}
          right={right}
          signIn={signIn}
        />
      ) : null}
    </>
  );
}
