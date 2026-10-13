import { buildHandOffLink, siteConfig } from '@/lib/config/site';
import { TrackedAnchorClient } from './TrackedAnchorClient';

/**
 * Hands the visitor to the existing application. The preview id is never passed: whether a public
 * preview can be claimed into a workspace is unconfirmed, so the copy says the file is uploaded again.
 */
export function WorkspaceCta() {
  const link = buildHandOffLink('createWorkspace');
  return (
    <section
      aria-labelledby="cta-title"
      data-print-hide=""
      data-tone="inverse"
      className="no-print rounded-sm bg-inverse p-6 text-ink md:p-8"
    >
      <h2 id="cta-title" className="t-title">
        Save this position in {siteConfig.brandName}
      </h2>
      <p className="mt-3 max-w-prose text-ink-muted">
        Keep your ledger, add supplier emissions data and see this position change as the rules do.
        Previews can&apos;t be moved into a workspace yet, so you&apos;ll upload the file again
        there.
      </p>
      <div className="mt-6">
        {link.configured ? (
          <TrackedAnchorClient
            href={link.href}
            location="result"
            cta="create_workspace"
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            Create a workspace
          </TrackedAnchorClient>
        ) : (
          <p className="font-semibold">{link.label}</p>
        )}
      </div>
    </section>
  );
}
