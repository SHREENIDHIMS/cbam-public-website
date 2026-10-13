'use client';

import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/shared/Button';
import { ErrorState } from '@/components/shared/ErrorState';
import { USER_MESSAGES } from '@/lib/api/errors';

export default function LiabilityPreviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only the digest is logged; messages can carry request details.
    console.error('Liability preview route error', error.digest);
  }, [error]);

  return (
    <PageContainer className="py-16">
      <div className="mx-auto max-w-3xl">
        <ErrorState
          headingLevel={1}
          title="We could not show the liability preview"
          description={`${USER_MESSAGES.unavailable} Nothing you uploaded has been kept.`}
          action={<Button onClick={reset}>Try again</Button>}
        />
      </div>
    </PageContainer>
  );
}
