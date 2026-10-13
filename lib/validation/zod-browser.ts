import { z } from 'zod';

/**
 * Zod probes for `new Function` support to speed up parsing, which the site's CSP blocks (it logs a
 * script-src violation). In the browser, parse without that probe. Servers keep the fast path.
 */
if (typeof window !== 'undefined') {
  z.config({ jitless: true });
}
