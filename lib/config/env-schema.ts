import { z } from 'zod';

/**
 * Pure Zod schemas for environment validation. No `server-only` import so that
 * `next.config.ts` and unit tests can use them directly.
 */

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());
const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

export const serverEnvSchema = z
  .object({
    PUBLIC_API_MODE: z.enum(['fixture', 'live']).default('fixture'),
    CBAM_API_URL: optionalUrl,
    CBAM_API_KEY: optionalString,
    CBAM_API_TIMEOUT_MS: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1000).max(30000).default(10000),
    ),
    RATE_LIMIT_DISABLED: booleanString,
    NEXT_PUBLIC_SITE_ENV: z.enum(['production', 'preview', 'development']).default('development'),
  })
  .superRefine((env, ctx) => {
    if (env.PUBLIC_API_MODE === 'live' && !env.CBAM_API_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['CBAM_API_URL'],
        message: 'CBAM_API_URL is required when PUBLIC_API_MODE=live.',
      });
    }
    if (
      env.PUBLIC_API_MODE === 'live' &&
      env.NEXT_PUBLIC_SITE_ENV === 'production' &&
      env.CBAM_API_URL &&
      !env.CBAM_API_URL.startsWith('https://')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['CBAM_API_URL'],
        message: 'CBAM_API_URL must be an https URL in production.',
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const sitePath = z
  .string()
  .regex(/^\/[^\s]*$/, 'Must be a path starting with "/".')
  .default('/');

export const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.preprocess(emptyToUndefined, z.url().default('http://localhost:3000')),
    NEXT_PUBLIC_SITE_ENV: z.enum(['production', 'preview', 'development']).default('development'),
    NEXT_PUBLIC_CBAM_APP_URL: optionalUrl,
    NEXT_PUBLIC_CBAM_SIGN_IN_PATH: z.preprocess(emptyToUndefined, sitePath),
    NEXT_PUBLIC_CBAM_CREATE_WORKSPACE_PATH: z.preprocess(emptyToUndefined, sitePath),
    NEXT_PUBLIC_CBAM_DASHBOARD_PATH: z.preprocess(emptyToUndefined, sitePath),
    NEXT_PUBLIC_ANALYTICS_DEBUG: booleanString,
  })
  .superRefine((env, ctx) => {
    if (env.NEXT_PUBLIC_SITE_ENV === 'production' && !env.NEXT_PUBLIC_CBAM_APP_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['NEXT_PUBLIC_CBAM_APP_URL'],
        message: 'NEXT_PUBLIC_CBAM_APP_URL is required when NEXT_PUBLIC_SITE_ENV=production.',
      });
    }
  });

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function formatEnvIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid server environment:\n${formatEnvIssues(result.error)}`);
  }
  return result.data;
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid public environment:\n${formatEnvIssues(result.error)}`);
  }
  return result.data;
}
