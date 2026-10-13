'use client';

import { Printer } from 'lucide-react';
import { track } from '@/lib/analytics';
import { NativeButton } from '@/components/shared/NativeButton';

/** Opens the browser print dialog. The print stylesheet hides the site chrome. */
export function PrintButton({ label = 'Print this result' }: { label?: string }) {
  return (
    <NativeButton
      type="button"
      variant="default"
      size="md"
      className="no-print w-full sm:w-auto"
      leftSection={<Printer aria-hidden="true" className="size-4" />}
      onClick={() => {
        track({ name: 'cta_click', properties: { location: 'result', cta: 'print' } });
        window.print();
      }}
    >
      {label}
    </NativeButton>
  );
}
