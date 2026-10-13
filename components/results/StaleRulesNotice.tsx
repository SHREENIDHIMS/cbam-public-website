import { rules } from '@/lib/config/rules';
import { Alert } from '@/components/shared/Alert';

export const STALE_RULES_MESSAGE =
  'This result uses an earlier public rules snapshot. Refresh before relying on it.';

/** Renders only when a result's rulesVersion differs from the current snapshot. */
export function StaleRulesNotice({
  rulesVersion,
  currentVersion = rules.rulesVersion,
}: {
  rulesVersion: string;
  currentVersion?: string;
}) {
  if (rulesVersion === currentVersion) return null;
  return (
    <Alert tone="watch" title="Earlier rules snapshot">
      {STALE_RULES_MESSAGE}
    </Alert>
  );
}
