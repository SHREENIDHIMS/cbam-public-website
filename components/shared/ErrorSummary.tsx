export interface FieldIssue {
  fieldId: string;
  message: string;
}

/** Lists form errors with links to the fields. Move focus here after a failed submit. */
export function ErrorSummary({
  id = 'error-summary',
  title,
  issues,
}: {
  id?: string;
  title: string;
  issues: readonly FieldIssue[];
}) {
  if (issues.length === 0) return null;
  return (
    <div
      id={id}
      role="alert"
      tabIndex={-1}
      className="rounded-sm border border-critical-fg/40 bg-critical-bg p-4"
    >
      <h2 className="font-display font-[680] text-critical-fg">{title}</h2>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {issues.map((issue) => (
          <li key={issue.fieldId}>
            <a
              href={`#${issue.fieldId}`}
              className="inline-flex min-h-6 items-center text-critical-fg underline underline-offset-2"
            >
              {issue.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
