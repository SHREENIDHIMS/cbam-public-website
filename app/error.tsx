'use client';

import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ErrorState } from '@/components/shared/ErrorState';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only the digest is logged; error messages can contain request details.
    console.error('Route error', error.digest);
  }, [error]);

  return (
    <PageContainer className="py-20">
      <ErrorState
        headingLevel={1}
        title="This page could not be loaded"
        description="We could not load this page. Nothing you entered has been saved or changed. Try again, and if the problem continues return to the home page."
        action={
          <button type="button" onClick={reset} className="btn btn-primary btn-md">
            Try again
          </button>
        }
      />
    </PageContainer>
  );
}
