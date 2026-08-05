'use client';

import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { cn } from '@/lib/utils';
import type { ValidationAttempt, ValidationQuestion } from '@/types/revision';

interface ValidationResultScreenProps {
  attempt: ValidationAttempt;
  questions: ValidationQuestion[];
  competencyLabel: string;
  /** Pass only. */
  onContinue: () => void;
  /** Fail only — Decision 5: retry or reread are the only two progressing actions. */
  onRetry: () => void;
  onReread: () => void;
  embedded?: boolean;
}

export function ValidationResultScreen({
  attempt,
  questions,
  competencyLabel,
  onContinue,
  onRetry,
  onReread,
  embedded = false,
}: ValidationResultScreenProps) {
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  const content = (
    <>
      <section
        aria-labelledby="validation-result-title"
        className={cn(
          'flex flex-col items-center gap-3 rounded-3xl border-2 px-5 py-8 text-center',
          attempt.passed ? 'bg-highlight/10 border-highlight' : 'bg-surface border-border',
        )}
      >
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-full',
            attempt.passed ? 'bg-highlight' : 'border-border border-2',
          )}
          aria-hidden="true"
        >
          {attempt.passed ? (
            <Check className="text-highlight-foreground size-7" strokeWidth={3} />
          ) : (
            <X className="text-muted size-7" strokeWidth={3} />
          )}
        </div>
        <h1 id="validation-result-title" className="text-foreground text-xl font-bold">
          {attempt.passed ? 'Compétence validée !' : 'Pas encore validé'}
        </h1>
        <p className="text-foreground text-sm font-medium">
          {competencyLabel} — {attempt.scorePercent}%
        </p>
        <p className="text-muted text-sm font-medium">
          {attempt.passed
            ? 'La compétence suivante est débloquée.'
            : 'Il faut au moins 70% pour valider cette compétence.'}
        </p>
      </section>

      <section className="bg-surface border-border mt-4 overflow-hidden rounded-2xl border-2">
        <h2 className="text-foreground text-base font-bold">
          <button
            type="button"
            onClick={() => setIsCorrectionOpen((open) => !open)}
            aria-expanded={isCorrectionOpen}
            aria-controls="validation-correction-content"
            className="focus-visible:ring-highlight/40 flex w-full items-center justify-between gap-2 px-4 py-4 text-left focus-visible:ring-4 focus-visible:outline-none"
          >
            <span>Voir le corrigé</span>
            <ChevronDown
              className={cn(
                'text-muted size-5 shrink-0 transition-transform duration-200',
                isCorrectionOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>
        </h2>
        {isCorrectionOpen && (
          <div id="validation-correction-content" className="flex flex-col gap-3 px-4 pb-4">
            {questions.map((question, index) => (
              <article key={question.id} className="border-border border-t pt-3 text-sm leading-6">
                <p className="text-foreground font-bold">Question {index + 1}</p>
                <p className="text-foreground font-medium">{question.correction}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomCTA>
        {attempt.passed ? (
          <PrimaryButton onClick={onContinue}>Continuer mon plan</PrimaryButton>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <PrimaryButton onClick={onRetry}>Réessayer la validation</PrimaryButton>
            <button
              type="button"
              onClick={onReread}
              className="text-highlight focus-visible:ring-highlight/40 min-h-11 rounded-full text-sm font-bold underline-offset-4 transition hover:underline focus-visible:ring-4 focus-visible:outline-none"
            >
              Relire le cours
            </button>
          </div>
        )}
      </BottomCTA>
    </>
  );

  return embedded ? (
    content
  ) : (
    <ScreenContainer className="diagnostic-question-reveal">{content}</ScreenContainer>
  );
}
