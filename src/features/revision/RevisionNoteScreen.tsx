import { ArrowLeft, BookOpen, Check, CheckCircle2, Flag, Sparkles } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import { MathContent } from '@/components/diagnostic/MathContent';
import type { RevisionSessionContent } from '@/services/revision/experience';
import {
  extractMathExpressions,
  getUnderstandingParagraphs,
  splitStepContent,
  stripInlineMarkdown,
} from './notePresentation';

interface RevisionNoteScreenProps {
  content: RevisionSessionContent;
  subjectLabel: string;
  chapterLabel: string;
  onBack: () => void;
  onComplete: () => void;
}

export function RevisionNoteScreen({
  content,
  subjectLabel,
  chapterLabel,
  onBack,
  onComplete,
}: RevisionNoteScreenProps) {
  const { note, unit } = content;
  const [explanation, ...bubbleParagraphs] = getUnderstandingParagraphs(note);
  const bubbleText = bubbleParagraphs.join(' ') || explanation;
  const exampleExpression = extractMathExpressions(note.workedExample.problem)[0] ?? null;
  const conclusionExpression = extractMathExpressions(note.workedExample.conclusion)[0] ?? null;

  return (
    <div className="pb-28" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>
      <div className="fixed inset-x-0 top-0 z-40 flex justify-center">
        <div
          className="bg-background border-border w-full max-w-[430px] border-b-2"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="Retourner à mon plan de révision"
              className="focus-visible:ring-highlight/40 text-foreground flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:outline-none"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
            <span className="text-primary-border text-base font-bold">{subjectLabel}</span>
            <div className="size-10" />
          </div>
        </div>
      </div>

      <main className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-3">
          <div className="text-highlight flex items-center gap-2 text-sm font-bold">
            <BookOpen className="size-4" aria-hidden="true" />
            <span>Chapitre : {chapterLabel}</span>
          </div>
          <h1 className="text-foreground text-3xl leading-tight font-bold">{note.title}</h1>
          <div className="bg-highlight/10 border-highlight/30 flex items-start gap-3 rounded-xl border-2 p-4">
            <Flag className="text-highlight mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-highlight mb-1 text-sm font-bold">Objectif de la leçon</h2>
              <p className="text-foreground text-sm font-medium">{unit.objective}</p>
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-xl font-bold">Comprendre simplement</h2>
          <p className="text-foreground text-base leading-7 font-medium">{explanation}</p>
          {bubbleText && (
            <div className="flex items-start gap-3">
              <AppLogo size="sm" />
              <SpeechBubble>{bubbleText}</SpeechBubble>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-xl font-bold">Exemple concret</h2>
          <div className="bg-border/20 border-border flex flex-col gap-3 rounded-2xl border-2 p-4">
            {exampleExpression && (
              <div className="flex justify-center py-2">
                <div
                  className="bg-primary border-primary-border inline-block rounded-lg border-2 px-4 py-2 font-bold"
                  style={{ boxShadow: '0 3px 0 var(--primary-border)' }}
                >
                  <MathContent
                    content={exampleExpression}
                    contentFormat="latex"
                    displayMode
                    className="text-primary-foreground"
                  />
                </div>
              </div>
            )}

            <ol className="flex flex-col gap-3">
              {note.workedExample.steps.map((step, index) => {
                const { explanation: stepExplanation, expression } = splitStepContent(step);
                return (
                  <li
                    key={`${note.id}-step-${index + 1}`}
                    className="bg-surface border-border flex items-start gap-3 rounded-xl border-2 p-3"
                  >
                    <span className="bg-highlight text-highlight-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-foreground text-sm leading-6 font-medium">
                        {stepExplanation}
                      </p>
                      {expression && (
                        <MathContent
                          content={expression}
                          contentFormat="latex"
                          className="text-highlight w-fit text-sm font-bold"
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {conclusionExpression && (
              <div className="border-highlight flex flex-col gap-1 border-l-4 pl-3">
                <span className="text-highlight text-xs font-bold">Conclusion</span>
                <MathContent
                  content={conclusionExpression}
                  contentFormat="latex"
                  className="text-foreground w-fit text-sm font-bold"
                />
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
            <Sparkles className="text-highlight size-5" aria-hidden="true" />
            Points clés
          </h2>
          <div className="flex flex-col gap-3">
            {note.keyTakeaways.map((takeaway) => (
              <div
                key={takeaway}
                className="bg-surface border-border flex items-start gap-3 rounded-2xl border-2 p-4"
              >
                <Check className="text-highlight mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <p className="text-foreground text-sm leading-6 font-medium">
                  {stripInlineMarkdown(takeaway)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-xl font-bold">Erreurs fréquentes</h2>
          <div className="flex flex-col gap-3">
            {note.commonMistakes.map((mistake) => (
              <article
                key={mistake.title}
                className="bg-surface border-border rounded-2xl border-2 p-4"
              >
                <h3 className="text-foreground text-base font-bold">{mistake.title}</h3>
                <dl className="text-foreground mt-3 flex flex-col gap-2 text-sm leading-6">
                  <div>
                    <dt className="text-highlight font-bold">Erreur</dt>
                    <dd className="font-medium">{stripInlineMarkdown(mistake.error)}</dd>
                  </div>
                  <div>
                    <dt className="text-highlight font-bold">Pourquoi</dt>
                    <dd className="font-medium">{stripInlineMarkdown(mistake.whyItHappens)}</dd>
                  </div>
                  <div>
                    <dt className="text-highlight font-bold">Comment éviter</dt>
                    <dd className="font-medium">{stripInlineMarkdown(mistake.howToAvoid)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-xl font-bold">Mini exercices</h2>
          <div className="flex flex-col gap-3">
            {note.miniExercises.map((exercise) => (
              <article
                key={exercise.id}
                className="bg-surface border-border rounded-2xl border-2 p-4"
              >
                <h3 className="text-foreground text-base font-bold">
                  Mini exercice {exercise.order}
                </h3>
                <p className="text-foreground mt-3 text-sm leading-6 font-semibold">
                  {stripInlineMarkdown(exercise.statement)}
                </p>
                <div className="border-border mt-4 flex flex-col gap-2 border-t pt-3 text-sm leading-6">
                  <p className="text-foreground font-bold">
                    Réponse :{' '}
                    <span className="font-medium">{stripInlineMarkdown(exercise.answer)}</span>
                  </p>
                  <p className="text-foreground font-medium">
                    <strong>Correction :</strong> {stripInlineMarkdown(exercise.correction)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div
          className="bg-background/90 border-border w-full max-w-[430px] border-t-2 px-4 pt-4 backdrop-blur-sm"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <PrimaryButton
            onClick={onComplete}
            className="focus-visible:ring-highlight/40 focus-visible:ring-4 focus-visible:outline-none"
          >
            <span className="inline-flex items-center justify-center gap-2">
              J&apos;ai compris
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
