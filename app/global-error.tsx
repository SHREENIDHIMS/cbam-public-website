'use client';

import { semantic } from '@/lib/design/tokens';

/** Last-resort boundary. Renders its own html and body, so it uses inline styles only. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          padding: '4rem 1.5rem',
          background: semantic.canvas,
          color: semantic.ink,
          fontFamily: '"Segoe UI", system-ui, sans-serif',
        }}
      >
        <main>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
            The site could not be loaded
          </h1>
          <p style={{ maxWidth: '40rem', lineHeight: 1.6 }}>
            Something failed while loading the page layout. Nothing you entered has been saved or
            changed. Try again, or reload the page.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.25rem',
              background: semantic.primary,
              color: semantic.onPrimary,
              border: 0,
              borderRadius: 3,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
