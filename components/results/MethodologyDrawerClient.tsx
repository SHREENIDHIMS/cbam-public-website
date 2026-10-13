'use client';

import { BookOpen } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { Button } from '@/components/shared/Button';
import type { LiabilityPreview } from '@/lib/api/schemas';

const loadContent = () => import('./MethodologyDrawerContent');
// The Mantine Drawer loads on first use so the result page stays light.
const MethodologyDrawerContent = dynamic(loadContent, { ssr: false });

export function MethodologyDrawerClient({
  methodology,
  rulesVersion,
}: {
  methodology: LiabilityPreview['methodology'];
  rulesVersion: string;
}) {
  const [opened, setOpened] = useState(false);
  const [requested, setRequested] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function open() {
    setRequested(true);
    setOpened(true);
    track({ name: 'methodology_opened', properties: { tool: 'liability_preview' } });
  }

  // The drawer mounts after the trigger was focused, so focus is returned explicitly.
  function close() {
    setOpened(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  return (
    <div className="no-print">
      <Button
        ref={triggerRef}
        type="button"
        variant="default"
        size="md"
        aria-haspopup="dialog"
        styles={{ label: { whiteSpace: 'normal', textAlign: 'center' } }}
        style={{ height: 'auto', minHeight: 'var(--button-height)', paddingBlock: 8 }}
        className="w-full sm:w-auto"
        leftSection={<BookOpen aria-hidden="true" className="size-4" />}
        onClick={open}
        onPointerEnter={() => void loadContent()}
        onFocus={() => void loadContent()}
      >
        How these numbers are worked out
      </Button>
      {requested ? (
        <MethodologyDrawerContent
          opened={opened}
          onClose={close}
          methodology={methodology}
          rulesVersion={rulesVersion}
        />
      ) : null}
    </div>
  );
}
