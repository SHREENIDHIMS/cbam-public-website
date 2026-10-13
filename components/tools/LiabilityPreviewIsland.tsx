'use client';

import { Providers } from '@/app/providers';
import { LiabilityPreviewClient, type LiabilityPreviewClientProps } from './LiabilityPreviewClient';

/** The tool with its Mantine provider. Loaded after the page shell by LiabilityPreviewLoader. */
export default function LiabilityPreviewIsland(props: LiabilityPreviewClientProps) {
  return (
    <Providers>
      <LiabilityPreviewClient {...props} />
    </Providers>
  );
}
