import {
  DECISION_COPY,
  DECISION_KINDS,
  type DecisionKind,
  type WorkedFile,
} from '@/lib/content/worked-example';
import { DecisionBadge } from './DecisionBadge';

/** Every decision the engine made, grouped under the four outcomes. */
export function DecisionList({
  files,
  counts,
}: {
  files: readonly WorkedFile[];
  counts: Record<DecisionKind, number>;
}) {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="max-w-3xl text-lg text-ink-muted">
          The engine does not quietly fix things. Each decision is listed here with what it saw and
          what it did. Anything it was unsure about is held for a person, and anything unusable is
          rejected.
        </p>
        <dl className="m-0 mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {DECISION_KINDS.map((kind) => (
            <div key={kind} className="rounded-sm border border-line bg-surface p-4">
              <dt>
                <DecisionBadge kind={kind} />
              </dt>
              <dd className="t-figure-lg m-0 mt-3">{counts[kind]}</dd>
              <dd className="m-0 mt-1 text-sm text-ink-muted">{DECISION_COPY[kind].meaning}</dd>
            </div>
          ))}
        </dl>
      </div>

      {DECISION_KINDS.map((kind) => {
        const items = files.flatMap((file) =>
          file.decisions.filter((entry) => entry.kind === kind),
        );
        return (
          <section key={kind} aria-labelledby={`decisions-${kind}`}>
            <h3 id={`decisions-${kind}`} className="t-title flex items-center gap-3">
              <DecisionBadge kind={kind} />
              <span className="text-ink-subtle">{items.length}</span>
            </h3>
            {items.length === 0 ? (
              <p className="mt-4 text-ink-muted">Nothing in this group.</p>
            ) : (
              <div
                className="relative mt-4 overflow-x-auto rounded-sm border border-line"
                role="region"
                aria-label={`${DECISION_COPY[kind].label} decisions`}
                tabIndex={0}
              >
                <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                  <caption className="sr-only">{DECISION_COPY[kind].label} decisions</caption>
                  <thead className="bg-surface-alt text-ink">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        File
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Where
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        What it saw
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        What it did
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-line align-top">
                        <th
                          scope="row"
                          className="px-4 py-3 font-medium whitespace-nowrap text-ink"
                        >
                          Supplier {item.file}
                        </th>
                        <td className="px-4 py-3 text-ink-muted">{item.where}</td>
                        <td className="px-4 py-3 text-ink-muted">{item.saw}</td>
                        <td className="px-4 py-3 text-ink-muted">{item.did}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
