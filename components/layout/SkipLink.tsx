export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
    >
      Skip to main content
    </a>
  );
}
