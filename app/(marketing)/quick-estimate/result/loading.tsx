import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/shared/Skeleton';

export default function Loading() {
  return (
    <PageContainer className="py-12 md:py-16">
      <div className="mx-auto max-w-4xl" role="status" aria-live="polite">
        <p className="text-lg font-medium text-ink">Preparing your estimate…</p>
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
