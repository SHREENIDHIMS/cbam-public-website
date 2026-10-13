import { FlaskConical } from 'lucide-react';

/** Persistent marker shown on every tool result when the data source is a fixture. */
export function DemoDataIndicator({ dataSource }: { dataSource: 'fixture' | 'live' }) {
  if (dataSource !== 'fixture') return null;
  return (
    <p role="status" className="stamp bg-watch-bg text-watch-fg">
      <FlaskConical aria-hidden="true" className="size-4" />
      Demo data
    </p>
  );
}
