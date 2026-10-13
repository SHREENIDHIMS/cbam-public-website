import { FEATURES } from '@/lib/config/home-content';
import { cn } from '@/lib/utils/cn';

/** Six capabilities as a two-column ruled ledger inside one box: name, then what it gives you. */
export function FeatureGrid() {
  return (
    <div className="box mt-14 md:mt-16">
      <p className="box-head">
        <span className="t-label text-ink">What the position shows</span>
        <span className="t-label">{FEATURES.length} items</span>
      </p>
      <ul className="m-0 list-none p-0">
        {FEATURES.map((feature, index) => (
          <li
            key={feature.key}
            className={cn(
              'grid grid-cols-1 gap-1 px-4 py-4 md:grid-cols-12 md:gap-8 md:px-6',
              index > 0 && 'border-t border-line',
            )}
          >
            <h3 className="font-display text-lg font-[680] tracking-[-0.01em] text-ink md:col-span-4">
              {feature.title}
            </h3>
            <p className="text-ink-muted md:col-span-8">{feature.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
