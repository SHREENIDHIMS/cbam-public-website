import { describe, expect, it } from 'vitest';
import {
  LIABILITY_PREVIEW_STATUSES,
  QUICK_ESTIMATE_STATUSES,
  RESULT_STATUSES,
  RESULT_STATUS_KEYS,
  THRESHOLD_STATUSES,
  getStatus,
} from '@/lib/config/status';
import { PROVENANCE, PROVENANCE_KEYS } from '@/lib/config/provenance';
import {
  provenanceDefinitionSchema,
  statusDefinitionSchema,
} from '@/lib/config/definition-schemas';

describe('status vocabulary', () => {
  it('defines every status once and validates against the schema', () => {
    expect(Object.keys(RESULT_STATUSES).sort()).toEqual([...RESULT_STATUS_KEYS].sort());
    for (const key of RESULT_STATUS_KEYS) {
      const definition = RESULT_STATUSES[key];
      expect(statusDefinitionSchema.parse(definition).key).toBe(key);
    }
  });

  it('uses the canonical labels', () => {
    expect(getStatus('below').label).toBe('Below threshold');
    expect(getStatus('needs_data').label).toBe('Not enough information');
  });

  it('keeps per-tool allow-lists inside the vocabulary', () => {
    for (const list of [QUICK_ESTIMATE_STATUSES, THRESHOLD_STATUSES, LIABILITY_PREVIEW_STATUSES]) {
      for (const key of list) expect(RESULT_STATUS_KEYS).toContain(key);
    }
    expect(QUICK_ESTIMATE_STATUSES).toEqual([
      'below',
      'approaching',
      'likely_triggered',
      'needs_data',
    ]);
  });

  it('reserves the critical tone for triggered states', () => {
    const critical = RESULT_STATUS_KEYS.filter((key) => RESULT_STATUSES[key].tone === 'critical');
    expect(critical.sort()).toEqual(['likely_triggered', 'triggered']);
  });
});

describe('provenance', () => {
  it('validates every provenance definition', () => {
    for (const key of PROVENANCE_KEYS) {
      expect(provenanceDefinitionSchema.parse(PROVENANCE[key]).key).toBe(key);
    }
  });
});
