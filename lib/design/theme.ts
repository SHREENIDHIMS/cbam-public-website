import { createTheme, type CSSVariablesResolver, type MantineColorsTuple } from '@mantine/core';
import { tokenVariables } from './css-variables';
import { amber, ember, green, radius, red, semantic, shadow, steel, zinc } from './tokens';

const tuple = (ramp: readonly string[]) => [...ramp] as unknown as MantineColorsTuple;

const FONT_STACK = 'var(--ff-sans), "Segoe UI", system-ui, sans-serif';
const DISPLAY_STACK = 'var(--ff-display), "Arial Narrow", Arial, sans-serif';

const focusRing = {
  outline: `2px solid ${semantic.focus}`,
  outlineOffset: 2,
};

export const theme = createTheme({
  colors: {
    zinc: tuple(zinc),
    ember: tuple(ember),
    steel: tuple(steel),
    green: tuple(green),
    amber: tuple(amber),
    red: tuple(red),
  },
  primaryColor: 'ember',
  primaryShade: 7,
  white: semantic.surface,
  black: semantic.ink,
  defaultRadius: 'sm',
  radius,
  fontFamily: FONT_STACK,
  headings: { fontFamily: DISPLAY_STACK, fontWeight: '650' },
  focusRing: 'auto',
  fontSmoothing: true,
  components: {
    Button: {
      defaultProps: { radius: 'xl', size: 'md' },
      styles: { root: { fontWeight: 650, boxShadow: shadow.print } },
    },
    Input: {
      defaultProps: { radius: 'md', size: 'md' },
      styles: {
        input: {
          backgroundColor: semantic.surface,
          borderColor: semantic.lineStrong,
          color: semantic.ink,
        },
      },
    },
    Select: {
      defaultProps: { radius: 'md', size: 'md', allowDeselect: false },
    },
    Checkbox: {
      defaultProps: { radius: 'xs', size: 'md' },
      styles: { input: { borderColor: semantic.lineStrong } },
    },
    Radio: {
      defaultProps: { size: 'md' },
      styles: { radio: { borderColor: semantic.lineStrong } },
    },
    Drawer: {
      defaultProps: { trapFocus: true, closeOnEscape: true, returnFocus: true },
      styles: {
        content: { backgroundColor: semantic.surface },
        header: { backgroundColor: semantic.surface, borderBottom: `1px solid ${semantic.line}` },
        title: { fontFamily: DISPLAY_STACK, fontWeight: 650, fontSize: '1.375rem' },
      },
    },
    Modal: {
      defaultProps: { radius: 'md', trapFocus: true, closeOnEscape: true, returnFocus: true },
      styles: { content: { backgroundColor: semantic.surface } },
    },
    Tooltip: {
      defaultProps: {
        color: 'zinc.9',
        withArrow: true,
        events: { hover: true, focus: true, touch: true },
      },
    },
  },
  other: { focusRing },
});

/** Emits every token as a --cc-* CSS variable on :root (same values as the root layout). */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: tokenVariables(),
  light: {},
  dark: {},
});
