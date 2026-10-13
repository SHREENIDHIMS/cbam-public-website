import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/shared/Skeleton';

export default function Loading() {
  return (
    <PageContainer className="py-12 md:py-16">
      <div role="status" aria-live="polite">
        <p className="text-lg font-medium text-ink">Preparing your preview…</p>
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-10 w-2/3" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    </PageContainer>
  );
}
