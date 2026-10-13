import { z } from 'zod';
import { PROVENANCE_ICON_NAMES, PROVENANCE_KEYS, type ProvenanceDefinition } from './provenance';
import { RESULT_STATUS_KEYS, STATUS_ICON_NAMES, TONES, type StatusDefinition } from './status';

/**
 * Zod checks for the status and provenance tables. Kept apart from the tables so browser code that
 * reads the labels does not load the schema library; the unit tests apply these to every entry.
 */

export const statusDefinitionSchema = z.object({
  key: z.enum(RESULT_STATUS_KEYS),
  label: z.string().min(1),
  description: z.string().min(1),
  resultHeadline: z.string().min(1),
  tone: z.enum(TONES),
  icon: z.enum(STATUS_ICON_NAMES),
}) satisfies z.ZodType<StatusDefinition>;

export const provenanceDefinitionSchema = z.object({
  key: z.enum(PROVENANCE_KEYS),
  label: z.string().min(1),
  meaning: z.string().min(1),
  tone: z.enum(TONES),
  icon: z.enum(PROVENANCE_ICON_NAMES),
}) satisfies z.ZodType<ProvenanceDefinition>;
