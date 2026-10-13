import { FileCheck, Lock, Rows3, Table2 } from 'lucide-react';
import { UPLOAD_FIELDS } from '@/lib/config/upload-fields';
import { Badge } from '@/components/shared/Badge';

interface FileRequirementsProps {
  maxFileMb: string;
  maxRows: string;
  dataSource: 'fixture' | 'live';
}

/**
 * What the upload step accepts, and what happens to the file. The privacy sentences describe
 * what this implementation does: parsing is local, and only the mapped, validated rows are sent
 * when the visitor runs the preview.
 */
export function FileRequirements({ maxFileMb, maxRows, dataSource }: FileRequirementsProps) {
  const required = UPLOAD_FIELDS.filter((field) => field.requirement === 'required');
  const helpful = UPLOAD_FIELDS.filter((field) => field.requirement !== 'required');

  return (
    <div className="flex flex-col gap-6">
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
        {[
          {
            icon: FileCheck,
            term: 'Accepted',
            detail: 'CSV or XLSX. The first sheet is used unless you pick another.',
          },
          { icon: Table2, term: 'Size', detail: `Up to ${maxFileMb} MB per file.` },
          { icon: Rows3, term: 'Rows', detail: `Up to ${maxRows} data rows.` },
        ].map(({ icon: Icon, term, detail }) => (
          <li key={term} className="flex items-start gap-3">
            <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-ink">{term}</p>
              <p className="text-sm text-ink-muted">{detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div>
        <h3 className="text-sm font-semibold text-ink">Columns we look for</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Headings can be worded your own way. You will check every match before anything is read.
        </p>
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
          {required.map((field) => (
            <li key={field.key}>
              <Badge tone="info">{field.label} (needed)</Badge>
            </li>
          ))}
          {helpful.map((field) => (
            <li key={field.key}>
              <Badge tone="neutral">{field.label}</Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-line bg-surface p-4">
        <Lock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="text-sm text-ink-muted">
          <p className="font-semibold text-ink">What happens to your file</p>
          <p className="mt-1">
            Your file is read in your browser. When you press Run the preview, only the mapped
            columns of the rows that passed the checks are sent, never the file itself, its name or
            the columns you left out.
          </p>
          <p className="mt-2">
            {dataSource === 'fixture'
              ? 'This is a demo: sample files get a pre-computed result and any other file gets a labelled demo result. The rows are not saved.'
              : 'We do not state how long the service keeps the rows until that is confirmed.'}
          </p>
        </div>
      </div>
    </div>
  );
}
