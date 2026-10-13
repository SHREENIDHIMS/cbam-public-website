import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function PageContainer({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn('mx-auto w-full max-w-site px-5 md:px-10', className)}>{children}</Tag>;
}
