import { ArrowRight, Check, Clock3, Target } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { cn } from '@/lib/utils';
import type { RevisionPlan, RevisionSession, RevisionUnit } from '@/types/revision';
import { getCompletedSessionCount, isRevisionPlanComplete } from '@/services/revision/progress';

interface RevisionPlanScreenProps {
  plan: RevisionPlan;
  readinessScore: number;
  units: readonly RevisionUnit[];
  onStartSession: (revisionUnitId: string) => void;
  onRestartDiagnostic: () => void;
}

export function RevisionPlanScreen({
  plan,
  readinessScore,
  units,
  onStartSession,
  onRestartDiagnostic,
}: RevisionPlanScreenProps) {
  const isComplete = isRevisionPlanComplete(plan);
  const completedCount = getCompletedSessionCount(plan);

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <header className="flex flex-col items-center gap-3 pb-6 text-center">
        <AppLogo size="sm" />
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-2xl font-bold">Mon plan personnalisé</h1>
          <p className="text-muted text-base font-medium">
            Voici le programme recommandé pour améliorer ton niveau.
          </p>
        </div>
      </header>

      <section aria-label="Résumé du plan" className="grid grid-cols-3 gap-2 pb-7">
        <SummaryMetric label="Niveau" value={`${readinessScore}%`} />
        <SummaryMetric label="Jours" value={`${plan.estimatedDays}`} />
        <SummaryMetric label="Temps" value={`${plan.estimatedTotalMinutes} min`} />
      </section>

      {isComplete ? (
        <CompletedPlanState onRestartDiagnostic={onRestartDiagnostic} />
      ) : (
        <section aria-labelledby="revision-sessions-title" className="flex flex-col gap-3 pb-8">
          <div className="flex items-center justify-between gap-3">
            <h2 id="revision-sessions-title" className="text-foreground text-lg font-bold">
              Tes sessions
            </h2>
            <span className="text-muted text-sm font-semibold">
              {completedCount}/{plan.sessions.length} terminées
            </span>
          </div>

          <ol className="flex flex-col gap-3">
            {plan.sessions.map((session) => {
              const unit = units.find((candidate) => candidate.id === session.revisionUnitId);
              return (
                <RevisionSessionCard
                  key={session.id}
                  session={session}
                  objective={unit?.objective ?? 'Objectif de la session'}
                  onStart={() => onStartSession(session.revisionUnitId)}
                />
              );
            })}
          </ol>
        </section>
      )}
    </ScreenContainer>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border-border flex min-w-0 flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-center">
      <span className="text-highlight text-lg font-extrabold">{value}</span>
      <span className="text-muted text-xs font-bold">{label}</span>
    </div>
  );
}

interface RevisionSessionCardProps {
  session: RevisionSession;
  objective: string;
  onStart: () => void;
}

function RevisionSessionCard({ session, objective, onStart }: RevisionSessionCardProps) {
  const isCompleted = session.status === 'completed';

  return (
    <li className="bg-surface border-border flex flex-col gap-4 rounded-3xl border-2 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted text-sm font-bold">Jour {session.dayNumber}</span>
        <StatusBadge status={session.status} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-foreground min-w-0 text-lg font-bold">{session.competencyLabel}</h3>
          <span className="text-muted flex shrink-0 items-center gap-1 text-sm font-semibold">
            <Clock3 className="size-4" aria-hidden="true" />
            {session.estimatedMinutes} min
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="text-foreground flex gap-2 font-medium">
            <Target className="text-highlight mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong>Objectif :</strong> {objective}
            </span>
          </p>
          <p className="text-foreground flex gap-2 font-medium">
            <Check className="text-highlight mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong>Critère :</strong>{' '}
              {session.exitCriteria[0]?.description ?? 'Terminer les activités de la session.'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span
            className={cn(
              'text-xs font-bold',
              session.priorityLevel === 'critical' ? 'text-highlight' : 'text-muted',
            )}
          >
            Priorité {getPriorityLabel(session.priorityLevel)}
          </span>
          <span className="text-muted max-w-[230px] text-xs font-medium">
            {session.priorityReason}
          </span>
        </div>
        <button
          type="button"
          onClick={onStart}
          aria-label={`${isCompleted ? 'Revoir' : 'Commencer'} la session ${session.competencyLabel}`}
          className="text-highlight focus-visible:ring-highlight/40 flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-sm font-bold underline-offset-4 transition hover:underline focus-visible:ring-4 focus-visible:outline-none"
        >
          {isCompleted ? 'Revoir' : 'Commencer'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function getPriorityLabel(level: RevisionSession['priorityLevel']): string {
  if (level === 'critical') return 'critique';
  if (level === 'high') return 'haute';
  if (level === 'medium') return 'moyenne';
  return 'faible';
}

function StatusBadge({ status }: { status: RevisionSession['status'] }) {
  const label =
    status === 'completed' ? 'Terminée' : status === 'in-progress' ? 'En cours' : 'À commencer';

  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-bold',
        status === 'completed' && 'bg-highlight/10 text-highlight',
        status === 'in-progress' && 'bg-primary/25 text-foreground',
        status === 'not-started' && 'bg-border text-muted',
      )}
    >
      {label}
    </span>
  );
}

function CompletedPlanState({ onRestartDiagnostic }: { onRestartDiagnostic: () => void }) {
  return (
    <section
      aria-labelledby="completed-plan-title"
      className="bg-highlight/10 border-highlight flex flex-col items-center gap-3 rounded-3xl border-2 px-5 py-8 text-center"
    >
      <div
        className="bg-highlight flex size-12 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <Check className="text-highlight-foreground size-7" strokeWidth={3} />
      </div>
      <h2 id="completed-plan-title" className="text-foreground text-xl font-bold">
        Excellent !
      </h2>
      <p className="text-foreground text-sm font-medium">Tu as terminé ton plan actuel.</p>
      <BottomCTA>
        <PrimaryButton
          onClick={onRestartDiagnostic}
          className="focus-visible:ring-highlight/40 focus-visible:ring-4 focus-visible:outline-none"
        >
          Refaire un diagnostic
        </PrimaryButton>
      </BottomCTA>
    </section>
  );
}
