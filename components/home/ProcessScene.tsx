import type { CSSProperties } from 'react';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { PageContainer } from '@/components/layout/PageContainer';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { PROCESS_STAGES } from '@/lib/config/home-content';
import { ContainerArt } from './ContainerArt';

// Where each step appears in the pinned scene: progress at which it fades in, and its vertical
// position on the stage. Alternate sides, as on the reference.
const PLACEMENT = [
  { start: 0.02, top: '12%' },
  { start: 0.26, top: '34%' },
  { start: 0.5, top: '56%' },
  { start: 0.74, top: '72%' },
] as const;

/**
 * "How it works" as a pinned scene: a crane lowers a container as the four stages come in from
 * alternating sides. Static and stacked until the script pins it, and always for reduced motion.
 */
export function ProcessScene() {
  return (
    <section aria-labelledby="process-title" className="bg-canvas pt-[var(--section-gap)]">
      <PageContainer>
        <ChapterHeading
          id="process-title"
          eyebrow="How it works"
          title="From a customs ledger to a position you can explain."
          lead="Four stages turn the data you already hold into something concrete. Each one shows its working."
        />
      </PageContainer>
      <ScrollScene className="scene-track mt-12">
        <div className="scene-stage">
          <div className="scene-art mx-auto h-72 w-full max-w-2xl">
            <ContainerArt />
          </div>
          <ol className="scene-steps m-0 mx-auto mt-10 grid max-w-site list-none gap-10 p-0 px-5 pb-[var(--section-gap)] sm:grid-cols-2 md:px-10">
            {PROCESS_STAGES.map((stage, index) => {
              const place = PLACEMENT[index]!;
              return (
                <li
                  key={stage.key}
                  className="scene-step flex flex-col gap-3"
                  data-side={index % 2 === 0 ? 'right' : 'left'}
                  style={{ '--in': place.start, '--top': place.top } as CSSProperties}
                >
                  <span aria-hidden="true" className="t-label text-ink-subtle">
                    Step {stage.number}
                  </span>
                  <h3 className="t-title">{stage.title}</h3>
                  <p className="text-ink-muted">{stage.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </ScrollScene>
    </section>
  );
}
