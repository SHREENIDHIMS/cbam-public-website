import type { ElementType, ReactNode } from 'react';

/** Server wrapper that opts a block into the entry motion handled by RevealClient. */
export function Reveal({
  as: Tag = 'div',
  delay,
  className,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      data-reveal=""
      {...(delay ? { 'data-reveal-delay': String(delay) } : {})}
      {...(className ? { className } : {})}
    >
      {children}
    </Tag>
  );
}
