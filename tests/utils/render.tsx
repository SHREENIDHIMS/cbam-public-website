import type { ReactElement } from 'react';
import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { theme } from '@/lib/design/theme';

export function renderWithMantine(ui: ReactElement) {
  return render(
    <MantineProvider theme={theme} forceColorScheme="light">
      {ui}
    </MantineProvider>,
  );
}
