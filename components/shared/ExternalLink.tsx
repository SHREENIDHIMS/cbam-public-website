import type { ComponentPropsWithoutRef } from 'react';
import { ExternalLink as ExternalIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { VisuallyHidden } from './VisuallyHidden';

type ExternalLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: string;
  newTab?: boolean;
};

export function ExternalLink({
  href,
  newTab = true,
  className,
  children,
  ...rest
}: ExternalLinkProps) {
  return (
    <a
      {...rest}
      href={href}
      className={cn(
        'inline-flex items-center gap-1 text-primary underline decoration-1 underline-offset-[0.2em] hover:text-primary-hover hover:decoration-2',
        className,
      )}
      rel="noopener noreferrer"
      {...(newTab ? { target: '_blank' } : {})}
    >
      {children}
      <ExternalIcon aria-hidden="true" className="size-3.5 shrink-0" />
      {newTab ? <VisuallyHidden>(opens in new tab)</VisuallyHidden> : null}
    </a>
  );
}
