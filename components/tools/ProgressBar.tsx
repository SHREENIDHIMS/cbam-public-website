/** Step progress. A named progressbar with a text value, so it never relies on the fill alone. */
export function ProgressBar({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-valuetext={`Step ${current} of ${total}`}
      className="flex gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-1.5 flex-1 transition-colors duration-300 ${index < current ? 'bg-primary' : 'bg-line'}`}
        />
      ))}
    </div>
  );
}
