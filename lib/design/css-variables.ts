import { brandRoles, cssVarName, inverseRoles, paperRoles, semantic, shadow } from './tokens';

/**
 * Every design token as a --cc-* custom property on :root. Rendered once by the root layout so
 * content pages get their colours without the Mantine provider; the Mantine resolver emits the
 * same values for tool pages.
 */
export function tokenVariables(): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const [token, value] of Object.entries(semantic)) {
    variables[cssVarName(token)] = value;
  }
  for (const [name, value] of Object.entries(shadow)) {
    variables[`--cc-shadow-${name}`] = value;
  }
  return variables;
}

function declarations(entries: Record<string, string>): string {
  return Object.entries(entries)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
}

function roleVariables(roles: Record<string, string | undefined>): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const [token, value] of Object.entries(roles)) {
    if (value) variables[cssVarName(token)] = value;
  }
  return variables;
}

export function tokensCss(): string {
  return [
    `:root{${declarations(tokenVariables())}}`,
    `[data-tone=inverse]{${declarations(roleVariables(inverseRoles))}}`,
    `[data-tone=brand]{${declarations(roleVariables(brandRoles))}}`,
    `[data-tone=paper]{${declarations(roleVariables(paperRoles))}}`,
  ].join('');
}
