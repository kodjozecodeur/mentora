import { ArrowRight, CheckCircle2, Clock3, Flag, Target, TrendingUp } from 'lucide-react';
import { ReadinessScoreRing } from '@/components/diagnostic/ReadinessScoreRing';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionSession, RevisionUnit } from '@/types/revision';
import {
  getMasteryStatusLabel,
  getReadinessMessage,
  PROGRESSION_GLOBALE_LABEL,
} from '@/features/diagnostic/resultCopy';
import { getRevisionProgress, hasStartedRevision } from './appShellData';

interface HomeScreenProps {
  firstName: string;
  diagnosticResult: DiagnosticResult;
  revisionPlan: {
    sessions: RevisionSession[];
  };
  nextSession: RevisionSession | null;
  nextUnit: RevisionUnit | null;
  subjectLabel: string;
  onOpenRevision: () => void;
  onRestartDiagnostic: () => void;
}

export function HomeScreen({
  firstName,
  diagnosticResult,
  revisionPlan,
  nextSession,
  nextUnit,
  subjectLabel,
  onOpenRevision,
  onRestartDiagnostic,
}: HomeScreenProps) {
  const progress = getRevisionProgress(revisionPlan);
  const progressPercent = Math.min(100, Math.max(0, progress.completionPercent));
  const isPlanComplete = progress.totalSessions > 0 && progress.completionPercent === 100;
  const revisionCtaLabel = isPlanComplete
    ? 'Refaire un diagnostic'
    : hasStartedRevision(revisionPlan)
      ? 'Reprendre ma révision'
      : 'Commencer ma révision';
  const nextCompetencyStatus =
    diagnosticResult.competencyMastery.find(
      (competency) => competency.competencyId === nextSession?.competencyId,
    )?.readinessLevel ?? 'priority';

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
          {PROGRESSION_GLOBALE_LABEL}
        </h2>
        <ReadinessScoreRing score={diagnosticResult.readinessScore} />
        <p className="text-muted max-w-[280px] text-sm font-medium">
          {getReadinessMessage(diagnosticResult.readinessScore)}
        </p>
      </section>

      <section aria-labelledby="daily-goal-title" className="flex flex-col gap-3">
        <h2 id="daily-goal-title" className="text-foreground text-lg font-bold">
          Continuer mon apprentissage
        </h2>

        {nextSession ? (
          <article className="border-primary flex flex-col gap-3 rounded-3xl border bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-800">
                <Flag className="size-4 fill-current" aria-hidden="true" />
                <span className="text-sm font-bold">{subjectLabel}</span>
                <span className="text-xs font-bold">
                  · {getMasteryStatusLabel(nextCompetencyStatus)}
                </span>
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
                Continue là où tu t&apos;es arrêté.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRevision}
              className="border-border focus-visible:ring-highlight/40 text-foreground flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border bg-white text-sm font-bold focus-visible:ring-4 focus-visible:outline-none"
            >
              Continuer
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </article>
        ) : (
          <div className="bg-highlight/10 border-highlight flex items-center gap-3 rounded-3xl border-2 p-4">
            <CheckCircle2 className="text-highlight size-6 shrink-0" aria-hidden="true" />
            <p className="text-foreground text-sm font-semibold">
              Bravo, tu as terminé toutes les sessions de ton parcours actuel.
            </p>
          </div>
        )}
      </section>

      <section
        aria-labelledby="progress-title"
        className="bg-surface border-border flex flex-col gap-3 rounded-3xl border p-4 shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          <TrendingUp className="text-highlight size-4 shrink-0" aria-hidden="true" />
          <h2 id="progress-title" className="text-foreground text-lg font-bold">
            Ma progression
          </h2>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground min-w-0 truncate text-sm font-bold">
              {subjectLabel}
            </span>
            <span className="text-foreground shrink-0 text-sm font-bold">{progressPercent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progression en ${subjectLabel}`}
            className="bg-border h-2.5 w-full overflow-hidden rounded-full"
          >
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <PrimaryButton onClick={isPlanComplete ? onRestartDiagnostic : onOpenRevision}>
        {revisionCtaLabel}
      </PrimaryButton>

      <div className="text-muted flex items-center justify-center gap-2 text-xs font-semibold">
        <Target className="size-4" aria-hidden="true" />
        Un petit pas chaque jour fait la différence.
      </div>
    </div>
  );
}
