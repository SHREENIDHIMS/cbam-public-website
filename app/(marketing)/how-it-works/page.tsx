import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Globe2, ShieldCheck } from 'lucide-react';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { CTASection } from '@/components/conversion/CTASection';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/shared/Badge';
import {
  AVAILABILITY_COPY,
  BROWSER_PROMISES,
  HOW_IT_WORKS_STEPS,
  type HowItWorksStep,
} from '@/lib/config/how-it-works';
import { routeMetadata } from '@/lib/seo/metadata';

export const metadata = routeMetadata('/how-it-works');

function AvailabilityBadge({ availability }: { availability: HowItWorksStep['availability'] }) {
  const Icon = availability === 'public' ? Globe2 : Building2;
  return (
    <Badge
      tone={availability === 'public' ? 'positive' : 'info'}
      icon={<Icon aria-hidden="true" className="size-4 shrink-0" />}
    >
      {AVAILABILITY_COPY[availability].label}
    </Badge>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        formLabel="How it works"
        title="From a customs ledger to a position you can explain."
        lead="Eight steps, in the order you would meet them. The first four you can try on this site today. The rest are planned for the workspace, and we say so on each one."
      />

      <Section spacing="compact" labelledBy="overview-title">
        <h2 id="overview-title" className="sr-only">
          The eight steps at a glance
        </h2>
        <ol className="box m-0 grid list-none grid-cols-1 overflow-hidden p-0 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li
              key={step.key}
              className="group relative -mt-px -ml-px flex flex-col gap-4 border-t border-l border-line p-5 hover:bg-primary-tint"
            >
              <p className="flex items-start gap-3">
                <span aria-hidden="true" className="box-no shrink-0 text-primary">
                  {index + 1}
                </span>
                <a
                  href={`#step-${step.key}`}
                  className="font-semibold text-ink no-underline group-hover:text-primary after:absolute after:inset-0 after:content-['']"
                >
                  {step.title}
                </a>
              </p>
              <div className="mt-auto pl-9">
                <AvailabilityBadge availability={step.availability} />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-2xl text-sm text-ink-subtle">
          Workspace steps are described from our product plan and may change before launch. The
          public tools give an indicative preview only and are not legal or tax advice.
        </p>
      </Section>

      <Section tone="alt" labelledBy="steps-title">
        <ChapterHeading id="steps-title" title="What happens, what you provide and what you see." />
        <ol className="ledger m-0 mt-14 list-none p-0">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.key} id={`step-${step.key}`} className="scroll-mt-24 py-10 md:py-14">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="min-w-0 lg:col-span-5">
                  <h3 className="flex items-start gap-4">
                    <span aria-hidden="true" className="box-no mt-1 text-primary">
                      {index + 1}
                    </span>
                    <span className="t-title">{step.title}</span>
                  </h3>
                  <div className="mt-4">
                    <AvailabilityBadge availability={step.availability} />
                  </div>
                  <p className="mt-5 max-w-md text-ink-muted">{step.summary}</p>
                  {step.link ? (
                    <p className="mt-5">
                      <Link
                        href={step.link.href as Route}
                        className="link inline-flex items-center gap-2 font-semibold"
                      >
                        {step.link.label}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </p>
                  ) : null}
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
                  <div className="box p-5">
                    <h4 className="t-label text-ink-subtle">You provide</h4>
                    <ul className="m-0 mt-3 flex list-disc flex-col gap-2 pl-5 text-ink-muted">
                      {step.provide.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="box p-5">
                    <h4 className="t-label text-ink-subtle">You see</h4>
                    <ul className="m-0 mt-3 flex list-disc flex-col gap-2 pl-5 text-ink-muted">
                      {step.see.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="privacy-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <ChapterHeading id="privacy-title" title="Read in your browser first." />
          </div>
          <ul className="m-0 flex min-w-0 list-none flex-col gap-5 p-0 lg:col-span-7">
            {BROWSER_PROMISES.map((promise) => (
              <li key={promise} className="flex items-start gap-4 border-t border-line pt-5">
                <ShieldCheck aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                <span className="text-lg text-ink-muted">{promise}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CTASection
        title="See the first four steps on your own data."
        body="Start with a rough estimate or a customs file. You will see an indicative position and what would sharpen it."
        note="Indicative, based on the information you provide. Not legal or tax advice."
      />
    </>
  );
}
