import 'server-only';
import { parseServerEnv } from './env-schema';

/** Parsed server environment. Never import from client code. */
export const env = parseServerEnv(process.env);
