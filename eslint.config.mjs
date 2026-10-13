import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const clientApiRestriction = {
  patterns: [
    {
      group: ['@/lib/api/*', '!@/lib/api/schemas', '!@/lib/api/types', '!@/lib/api/errors'],
      message: 'Client code may only import lib/api/schemas, lib/api/types and lib/api/errors.',
    },
    {
      group: ['@/lib/config/env'],
      message: 'Server env is not available to client code. Use lib/config/public-env.',
    },
  ],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    '.next/**',
    '.claude/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
  ]),
  {
    files: ['components/{hero,content,layout}/**/*.{ts,tsx}'],
    ignores: ['components/layout/MobileNav.tsx', 'components/layout/MobileNavDrawer.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mantine/*'],
              message: 'Content and layout components are server components without Mantine.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*Client.tsx',
      'components/tools/**/*.{ts,tsx}',
      'components/results/**/*.{ts,tsx}',
      'app/providers.tsx',
      'app/error.tsx',
      'app/global-error.tsx',
    ],
    rules: {
      'no-restricted-imports': ['error', clientApiRestriction],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['lib/utils/format.ts', 'tests/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[property.name='toLocaleString']",
          message: 'Use lib/utils/format.ts for number and date formatting.',
        },
        {
          selector: "MemberExpression[object.name='Intl'][property.name='NumberFormat']",
          message: 'Use lib/utils/format.ts for number formatting.',
        },
      ],
    },
  },
]);

export default eslintConfig;
