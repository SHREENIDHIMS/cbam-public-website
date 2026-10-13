/** Visually hidden bot trap. A non-empty value is silently ignored server-side. */
export function Honeypot({ name = 'website' }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name={name} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
