import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'default' | 'subtle';
type Size = 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary',
  default: 'btn-secondary',
  subtle: 'btn-ghost',
};

const SIZES: Record<Size, string> = {
  md: 'btn-md',
  lg: 'btn-lg',
};

interface NativeButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'type'> {
  type: 'button' | 'submit';
  variant?: Variant;
  size?: Size;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
}

/**
 * Plain button for the tool screens that carry no Mantine runtime. Uses the shared .btn element
 * language (styles/elements.css), so it matches ButtonLink exactly.
 */
export function NativeButton({
  variant = 'primary',
  size = 'md',
  leftSection,
  rightSection,
  className,
  children,
  ...rest
}: NativeButtonProps) {
  return (
    <button {...rest} className={cn('btn', VARIANTS[variant], SIZES[size], className)}>
      {leftSection}
      {children}
      {rightSection}
    </button>
  );
}
