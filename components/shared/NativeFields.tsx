import type { ComponentPropsWithoutRef } from 'react';
import { InlineFieldError } from './InlineFieldError';

/**
 * Plain HTML form fields with the site's styling, for the contact form and the lighter tool screens
 * (quick estimate, threshold checker). They carry no Mantine runtime; the liability preview keeps
 * the Mantine-backed inputs.
 */

export const controlClass =
  'w-full rounded-md border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-subtle transition-colors duration-150 hover:border-ink';

export interface FieldFrame {
  id: string;
  label: string;
  description?: string;
  error?: string | undefined;
}

export function Frame({
  id,
  label,
  description,
  error,
  children,
}: FieldFrame & { children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold text-ink">
        {label}
      </label>
      {description ? (
        <p id={`${id}-description`} className="mb-1.5 text-sm text-ink-subtle">
          {description}
        </p>
      ) : null}
      {children}
      <InlineFieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function fieldAria({ id, description, error }: FieldFrame) {
  const describedBy = [description ? `${id}-description` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  } as const;
}

export function TextField({
  id,
  label,
  description,
  error,
  required,
  ...rest
}: FieldFrame & Omit<ComponentPropsWithoutRef<'input'>, 'id'>) {
  return (
    <Frame id={id} label={label} description={description} error={error}>
      <input
        id={id}
        required={required}
        aria-required={required ? true : undefined}
        {...fieldAria({ id, label, description, error })}
        {...rest}
        className={`${controlClass} h-12`}
      />
    </Frame>
  );
}

export function TextAreaField({
  id,
  label,
  description,
  error,
  ...rest
}: FieldFrame & Omit<ComponentPropsWithoutRef<'textarea'>, 'id'>) {
  return (
    <Frame id={id} label={label} description={description} error={error}>
      <textarea
        id={id}
        {...fieldAria({ id, label, description, error })}
        {...rest}
        className={`${controlClass} min-h-28 resize-y py-2.5`}
      />
    </Frame>
  );
}

export function CheckboxField({
  id,
  label,
  description,
  ...rest
}: { id: string; label: string; description?: string } & Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type'
>) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-ink">
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-5 shrink-0 accent-[var(--cc-primary)]"
        {...rest}
      />
      <span>
        {label}
        {description ? <span className="block text-sm text-ink-subtle">{description}</span> : null}
      </span>
    </label>
  );
}
