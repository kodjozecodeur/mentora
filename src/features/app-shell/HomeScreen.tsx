import { ArrowRight, CheckCircle2, Clock3, Flag, Target } from 'lucide-react';
import { ReadinessScoreRing } from '@/components/diagnostic/ReadinessScoreRing';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionSession, RevisionUnit } from '@/types/revision';
import { getReadinessMessage } from '@/features/diagnostic/resultCopy';
import { getRevisionProgress } from './appShellData';

interface HomeScreenProps {
  firstName: string;
  diagnosticResult: DiagnosticResult;
  revisionPlan: {
    sessions: RevisionSession[];
  };
  nextSession: RevisionSession | null;
  nextUnit: RevisionUnit | null;
  onOpenRevision: () => void;
  onRestartDiagnostic: () => void;
}

export function HomeScreen({
  firstName,
  diagnosticResult,
  revisionPlan,
  nextSession,
  nextUnit,
  onOpenRevision,
  onRestartDiagnostic,
}: HomeScreenProps) {
  const progress = getRevisionProgress(revisionPlan);
  const hasRemainingSession = nextSession !== null;

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold">Bonjour, {firstName}</h1>
        <p className="text-muted text-base font-medium">Prêt pour aujourd&apos;hui ?</p>
      </header>

      <section
        aria-labelledby="home-readiness-title"
        className="bg-surface border-border flex flex-col items-center gap-4 rounded-3xl border-2 p-5 text-center"
      >
        <h2 id="home-readiness-title" className="text-foreground text-lg font-bold">
          Niveau actuel
        </h2>
        <ReadinessScoreRing score={diagnosticResult.readinessScore} />
        <p className="text-muted max-w-[280px] text-sm font-medium">
          {getReadinessMessage(diagnosticResult.readinessScore)}
        </p>
      </section>

      <section aria-labelledby="daily-goal-title" className="flex flex-col gap-3">
        <h2 id="daily-goal-title" className="sr-only">
          Objectif du jour
        </h2>

        {nextSession && nextUnit ? (
          <article className="border-primary bg-amber-50 flex flex-col gap-3 rounded-3xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-amber-800 flex items-center gap-1.5">
                <Flag className="size-4 fill-current" aria-hidden="true" />
                <span className="text-sm font-bold">Objectif du jour</span>
              </div>
              <span className="text-muted flex shrink-0 items-center gap-1 text-xs font-semibold">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {nextSession.estimatedMinutes} min
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="text-foreground min-w-0 text-xl font-extrabold wrap-break-word">
                {nextSession.competencyLabel}
              </h3>
              <p className="text-foreground/70 min-w-0 text-sm font-medium wrap-break-word">
                {nextUnit.objective}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRevision}
              className="border-border focus-visible:ring-highlight/40 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border bg-white text-sm font-bold text-foreground focus-visible:ring-4 focus-visible:outline-none"
            >
              Voir les détails
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </article>
        ) : (
          <div className="bg-highlight/10 border-highlight flex items-center gap-3 rounded-3xl border-2 p-4">
            <CheckCircle2 className="text-highlight size-6 shrink-0" aria-hidden="true" />
            <p className="text-foreground text-sm font-semibold">
              Tu as terminé toutes les sessions de ton plan.
            </p>
          </div>
        )}
      </section>

      <section
        aria-labelledby="progress-title"
        className="bg-surface border-border flex flex-col gap-4 rounded-3xl border-2 p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="progress-title" className="text-foreground text-lg font-bold">
            Ma progression
          </h2>
          <span className="text-highlight text-sm font-extrabold">
            {progress.completedSessions}/{progress.totalSessions}
          </span>
        </div>
        <ProgressIndicator
          step={progress.completedSessions}
          totalSteps={Math.max(progress.totalSessions, 1)}
        />
        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
          <span className="text-muted">Sessions terminées</span>
          <span className="text-foreground">{progress.completionPercent}%</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
          <span className="text-muted">Temps restant</span>
          <span className="text-foreground">{progress.remainingMinutes} min</span>
        </div>
      </section>

      <PrimaryButton onClick={hasRemainingSession ? onOpenRevision : onRestartDiagnostic}>
        {hasRemainingSession ? 'Reprendre ma révision' : 'Refaire un diagnostic'}
      </PrimaryButton>

      <div className="text-muted flex items-center justify-center gap-2 text-xs font-semibold">
        <Target className="size-4" aria-hidden="true" />
        Un petit pas chaque jour fait la différence.
      </div>
    </div>
  );
}
