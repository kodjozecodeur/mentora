import { CalendarDays, RotateCcw } from 'lucide-react';
import { ReadinessScoreRing } from '@/components/diagnostic/ReadinessScoreRing';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { DiagnosticResult } from '@/types/diagnostic';
import {
  getReadinessMessage,
  getWeaknessBadgeLabel,
  PREPARATION_BEPC_LABEL,
  PROGRESSION_GLOBALE_LABEL,
} from '@/features/diagnostic/resultCopy';

interface DiagnosticScreenProps {
  result: DiagnosticResult;
  subjectLabel: string;
  onRestartDiagnostic: () => void;
}

export function DiagnosticScreen({
  result,
  subjectLabel,
  onRestartDiagnostic,
}: DiagnosticScreenProps) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="flex flex-col items-center gap-1 text-center">
        <div className="flex size-16 shrink-0 items-center justify-center" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/logo-math.svg"
            alt=""
            width={64}
            height={64}
            className="size-full object-contain"
          />
        </div>
        <p className="text-muted text-sm font-bold">{subjectLabel}</p>
        <h1 className="text-foreground text-2xl font-bold">{PREPARATION_BEPC_LABEL}</h1>
        <p className="text-muted text-base font-medium">
          Voici les données de ton dernier diagnostic.
        </p>
      </header>

      <section
        aria-labelledby="diagnostic-score-title"
        className="bg-surface border-border flex flex-col items-center gap-3 rounded-3xl border-2 p-5 text-center"
      >
        <ReadinessScoreRing score={result.readinessScore} />
        <h2 id="diagnostic-score-title" className="text-foreground text-base font-bold">
          {PROGRESSION_GLOBALE_LABEL}
        </h2>
        <p className="text-muted text-xs font-semibold">{PREPARATION_BEPC_LABEL}</p>
        <p className="text-muted max-w-[300px] text-sm font-medium">
          {getReadinessMessage(result.readinessScore)}
        </p>
        <p className="text-muted flex items-center gap-2 text-xs font-semibold">
          <CalendarDays className="size-4" aria-hidden="true" />
          <time dateTime={result.completedAt}>{formatDiagnosticDate(result.completedAt)}</time>
        </p>
      </section>

      <section aria-labelledby="diagnostic-competencies-title" className="flex flex-col gap-3">
        <h2 id="diagnostic-competencies-title" className="text-foreground text-lg font-bold">
          Compétences
        </h2>
        <ul className="flex flex-col gap-2">
          {result.competencyMastery.map((competency) => (
            <li
              key={competency.competencyId}
              className="bg-surface border-border flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3"
            >
              <span className="text-foreground min-w-0 text-sm font-bold">
                {competency.competencyLabel}
              </span>
              <span className="text-muted shrink-0 text-sm font-semibold">
                {competency.masteryPercent}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="diagnostic-weaknesses-title" className="flex flex-col gap-3">
        <h2 id="diagnostic-weaknesses-title" className="text-foreground text-lg font-bold">
          Faiblesses identifiées
        </h2>
        {result.weaknesses.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {result.weaknesses.map((weakness) => (
              <li
                key={weakness.competencyId}
                className="bg-surface border-border flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3"
              >
                <span className="text-foreground min-w-0 text-sm font-bold">
                  {weakness.competencyLabel}
                </span>
                <span className="bg-primary/20 text-foreground shrink-0 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap">
                  {getWeaknessBadgeLabel(weakness.readinessLevel)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted bg-surface border-border rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Aucune faiblesse identifiée lors de ce diagnostic.
          </p>
        )}
      </section>

      <PrimaryButton onClick={onRestartDiagnostic}>
        <span className="inline-flex items-center justify-center gap-2">
          <RotateCcw className="size-5" aria-hidden="true" />
          Refaire le diagnostic
        </span>
      </PrimaryButton>
    </div>
  );
}

function formatDiagnosticDate(completedAt: string): string {
  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return completedAt;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
