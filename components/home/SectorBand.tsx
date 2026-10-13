import { PageContainer } from '@/components/layout/PageContainer';
import { Marquee } from '@/components/motion/Marquee';
import { rules } from '@/lib/config/rules';

/**
 * Full-orange band (the reference's partner strip). It carries the sector groups from the rules
 * config in two rows that slide in opposite directions. No logos: none exist.
 */
export function SectorBand() {
  const labels = (rules.sectors.value ?? []).map((sector) => sector.label);
  if (labels.length === 0) return null;
  const reversed = [...labels].reverse();
  const pill =
    'inline-flex items-center gap-3 rounded-[80px] border border-[#060517]/30 px-6 py-3 font-display text-xl font-medium tracking-[-0.02em] whitespace-nowrap text-ink';
  return (
    <section
      aria-labelledby="sectors-band-title"
      data-tone="brand"
      className="bg-brand py-[calc(var(--section-gap)*0.7)] text-ink"
    >
      <PageContainer>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <h2 id="sectors-band-title" className="t-eyebrow lg:col-span-3">
            Sectors in scope
          </h2>
          <p className="t-chapter lg:col-span-8">
            The legislation names the goods in each sector group. Your invoices rarely use the same
            words, so we start from the codes.
          </p>
        </div>
      </PageContainer>
      <div className="mt-14 flex flex-col gap-4">
        <Marquee seconds={26}>
          {labels.map((label) => (
            <span key={label} className={pill}>
              <span aria-hidden="true" className="size-2 rounded-full bg-ink" />
              {label}
            </span>
          ))}
        </Marquee>
        <Marquee direction="ltr" seconds={30}>
          {reversed.map((label) => (
            <span key={label} className={pill}>
              <span aria-hidden="true" className="size-2 rounded-full bg-ink" />
              {label}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
