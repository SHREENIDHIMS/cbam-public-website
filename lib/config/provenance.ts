import type { Tone } from './status';

/** Value-provenance badges, separate from result statuses (DECISIONS 6.2). */

export const PROVENANCE_ICON_NAMES = [
  'Landmark',
  'Database',
  'FileCheck',
  'FlaskConical',
  'CircleDashed',
  'FileClock',
] as const;
export type ProvenanceIconName = (typeof PROVENANCE_ICON_NAMES)[number];

export const PROVENANCE_KEYS = [
  'official',
  'default_value',
  'supplier_actual',
  'scenario',
  'unverified',
  'proposed',
] as const;
export type Provenance = (typeof PROVENANCE_KEYS)[number];

export interface ProvenanceDefinition {
  key: Provenance;
  label: string;
  meaning: string;
  tone: Tone;
  icon: ProvenanceIconName;
}

export const PROVENANCE: Readonly<Record<Provenance, ProvenanceDefinition>> = {
  official: {
    key: 'official',
    label: 'Official',
    meaning: 'From a cited primary source and verified',
    tone: 'positive',
    icon: 'Landmark',
  },
  default_value: {
    key: 'default_value',
    label: 'Default value',
    meaning: 'A published default emissions value used in place of supplier data',
    tone: 'info',
    icon: 'Database',
  },
  supplier_actual: {
    key: 'supplier_actual',
    label: 'Supplier actual',
    meaning: 'Actual emissions data supplied by the producer',
    tone: 'positive',
    icon: 'FileCheck',
  },
  scenario: {
    key: 'scenario',
    label: 'Scenario',
    meaning: 'An illustrative assumption, not an official figure',
    tone: 'watch',
    icon: 'FlaskConical',
  },
  unverified: {
    key: 'unverified',
    label: 'Unverified',
    meaning: 'Not yet checked against a primary source',
    tone: 'neutral',
    icon: 'CircleDashed',
  },
  proposed: {
    key: 'proposed',
    label: 'Proposed',
    meaning: 'Proposed in draft material and not yet confirmed as final',
    tone: 'info',
    icon: 'FileClock',
  },
};

export function getProvenance(key: Provenance): ProvenanceDefinition {
  return PROVENANCE[key];
}
