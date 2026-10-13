import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  Database,
  Eye,
  FileCheck,
  FileClock,
  FlaskConical,
  Landmark,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ProvenanceIconName } from '@/lib/config/provenance';
import type { StatusIconName } from '@/lib/config/status';

export const STATUS_ICONS: Record<StatusIconName, LucideIcon> = {
  CircleCheck,
  Eye,
  TriangleAlert,
  CircleAlert,
  OctagonAlert,
  CircleHelp,
};

export const PROVENANCE_ICONS: Record<ProvenanceIconName, LucideIcon> = {
  Landmark,
  Database,
  FileCheck,
  FlaskConical,
  CircleDashed,
  FileClock,
};
