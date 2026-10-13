'use client';

import { Button as MantineButton, type ButtonProps } from '@mantine/core';
import type { ComponentPropsWithoutRef, Ref } from 'react';

type Props = ButtonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonProps> & { ref?: Ref<HTMLButtonElement> };

/** Mantine-backed button for interactive tool screens. Content pages use ButtonLink. */
export function Button(props: Props) {
  return <MantineButton {...props} />;
}
