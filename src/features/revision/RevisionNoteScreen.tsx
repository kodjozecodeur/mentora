import { ArrowLeft, BookOpen, Check, ChevronDown, Clock3 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import type { RevisionSessionContent } from '@/services/revision/experience';
import { cn } from '@/lib/utils';
import { getNoteSummary, getUnderstandingContent, stripInlineMarkdown } from './notePresentation';

interface RevisionNoteScreenProps {
  content: RevisionSessionContent;
  onBack: () => void;
  onComplete: () => void;
  embedded?: boolean;
}

export function RevisionNoteScreen({
  content,
  onBack,
  onComplete,
  embedded = false,
}: RevisionNoteScreenProps) {
  const { note, session } = content;
  const understanding = getUnderstandingContent(note);

  const screenContent = (
    <>
      <header
        className="relative flex items-center justify-center pb-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Retourner à mon plan de révision"
          className="text-[#705d00] focus-visible:ring-highlight/40 absolute left-0 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:outline-none"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <span className="text-[#705d00] text-lg font-bold">Révision</span>
      </header>

      <div className="flex flex-col gap-3 pt-4 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-highlight/10 text-highlight rounded-full px-3 py-1 text-xs font-bold">
            Jour {session.dayNumber}
          </span>
          <span className="text-muted flex items-center gap-1 text-xs font-bold">
            <Clock3 className="size-4" aria-hidden="true" />
            {note.estimatedReadingMinutes} min de lecture
          </span>
        </div>
        <h1 className="text-foreground text-2xl font-bold">{note.title}</h1>
        <p className="text-muted text-sm font-medium">Version du contenu : {note.contentVersion}</p>
      </div>

      <main className="flex flex-col gap-4 pb-8">
        <NoteSection
          title="Résumé"
          icon={<BookOpen className="size-5" aria-hidden="true" />}
          defaultOpen
        >
          <p className="text-foreground text-base leading-7 font-medium">{getNoteSummary(note)}</p>
        </NoteSection>

        <NoteSection title="Comprendre simplement">
          <p className="text-foreground text-base leading-7 font-medium whitespace-pre-line">
            {understanding}
          </p>
        </NoteSection>

        <NoteSection title="Exemple">
          <div className="bg-surface border-border flex flex-col gap-3 rounded-2xl border-2 p-4">
            <p className="text-foreground text-sm leading-6 font-semibold">
              {stripInlineMarkdown(note.workedExample.problem)}
            </p>
            <ol className="flex flex-col gap-3">
              {note.workedExample.steps.map((step, index) => (
                <li key={`${note.id}-step-${index + 1}`} className="flex gap-3 text-sm leading-6">
                  <span className="bg-highlight/10 text-highlight flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold">
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium">{stripInlineMarkdown(step)}</span>
                </li>
              ))}
            </ol>
            <p className="border-highlight text-foreground border-l-4 pl-3 text-sm leading-6 font-bold">
              {stripInlineMarkdown(note.workedExample.conclusion)}
            </p>
          </div>
        </NoteSection>

        <NoteSection title="Erreurs fréquentes">
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
        </NoteSection>

        <NoteSection title="À retenir">
          <ul className="flex flex-col gap-2">
            {note.keyTakeaways.map((takeaway) => (
              <li
                key={takeaway}
                className="text-foreground flex gap-2 text-sm leading-6 font-semibold"
              >
                <Check className="text-highlight mt-1 size-4 shrink-0" aria-hidden="true" />
                <span>{stripInlineMarkdown(takeaway)}</span>
              </li>
            ))}
          </ul>
        </NoteSection>

        <NoteSection title="Mini exercices">
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
        </NoteSection>
      </main>

      <BottomCTA>
        <PrimaryButton
          onClick={onComplete}
          className="focus-visible:ring-highlight/40 focus-visible:ring-4 focus-visible:outline-none"
        >
          Terminer cette session
        </PrimaryButton>
      </BottomCTA>
    </>
  );

  return embedded ? (
    screenContent
  ) : (
    <ScreenContainer className="diagnostic-question-reveal">{screenContent}</ScreenContainer>
  );
}

function NoteSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const headingId = `note-section-${title}`;
  const contentId = `${headingId}-content`;

  return (
    <section className="bg-surface border-border overflow-hidden rounded-2xl border-2">
      <h2 className="text-foreground text-lg font-bold">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          id={headingId}
          className="focus-visible:ring-highlight/40 flex w-full items-center justify-between gap-2 px-4 py-4 text-left focus-visible:ring-4 focus-visible:outline-none"
        >
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <ChevronDown
            className={cn(
              'text-muted size-5 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </h2>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headingId}
        className={cn('note-accordion-content', isOpen && 'is-open')}
      >
        <div className="note-accordion-content-inner flex flex-col gap-3 px-4 pb-4">
          {children}
        </div>
      </div>
    </section>
  );
}
