import { rules } from '@/lib/config/rules';
import type { SectorKey } from '@/lib/config/rules-schema';

export function sectorLabel(key: SectorKey, source = rules): string {
  return source.sectors.value?.find((sector) => sector.key === key)?.label ?? key;
}
