'use client';

import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import { cssVariablesResolver, theme } from '@/lib/design/theme';

/**
 * Mantine runtime and styles. Only tool and form routes mount this; content pages and the shared
 * header and footer do not load it.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      forceColorScheme="light"
      cssVariablesResolver={cssVariablesResolver}
    >
      <Notifications position="bottom-right" />
      {children}
    </MantineProvider>
  );
}
