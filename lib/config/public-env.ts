import { parsePublicEnv } from './env-schema';

/**
 * Parsed NEXT_PUBLIC_* variables. Each variable is referenced literally so that
 * Next.js can inline it into the client bundle. Safe on the client.
 */
export const publicEnv = parsePublicEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_ENV: process.env.NEXT_PUBLIC_SITE_ENV,
  NEXT_PUBLIC_CBAM_APP_URL: process.env.NEXT_PUBLIC_CBAM_APP_URL,
  NEXT_PUBLIC_CBAM_SIGN_IN_PATH: process.env.NEXT_PUBLIC_CBAM_SIGN_IN_PATH,
  NEXT_PUBLIC_CBAM_CREATE_WORKSPACE_PATH: process.env.NEXT_PUBLIC_CBAM_CREATE_WORKSPACE_PATH,
  NEXT_PUBLIC_CBAM_DASHBOARD_PATH: process.env.NEXT_PUBLIC_CBAM_DASHBOARD_PATH,
  NEXT_PUBLIC_ANALYTICS_DEBUG: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG,
});
