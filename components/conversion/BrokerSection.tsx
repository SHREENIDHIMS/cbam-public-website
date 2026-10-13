import { Check } from 'lucide-react';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { SplitFeature } from '@/components/content/SplitFeature';
import { BROKER_POINTS } from '@/lib/config/home-content';
import { BrokerPortfolioPreview } from './BrokerPortfolioPreview';

export function BrokerSection() {
  return (
    <SplitFeature
      reverse
      copy={
        <>
          <ChapterHeading
            id="brokers-title"
            title="Several importers, one clear view."
            lead="If you support clients with customs and compliance, see each portfolio position side by side and keep the evidence where you can find it."
          />
          <ul className="m-0 mt-8 list-none space-y-3 p-0">
            {BROKER_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-ink">
                <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <ButtonLink href="/for-brokers" variant="secondary" size="lg">
              Explore the broker view
            </ButtonLink>
          </div>
        </>
      }
      visual={<BrokerPortfolioPreview />}
    />
  );
}
