'use client';

import dynamic from 'next/dynamic';
import type { LiabilityPreviewClientProps } from './LiabilityPreviewClient';

function ToolPlaceholder() {
  return (
    <div role="status" className="box min-h-[34rem] p-6 md:min-h-[32rem] md:p-8">
      <p className="text-ink-muted">Loading the upload tool.</p>
    </div>
  );
}

// The upload tool (Mantine, TanStack Query, schema validation) loads after the page shell, so the
// heading and intro paint without waiting for it. The page shows a placeholder of the same size.
const Island = dynamic(() => import('./LiabilityPreviewIsland'), {
  ssr: false,
  loading: () => <ToolPlaceholder />,
});

export function LiabilityPreviewLoader(props: LiabilityPreviewClientProps) {
  return <Island {...props} />;
}
