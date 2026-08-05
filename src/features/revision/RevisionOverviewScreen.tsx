import { ArrowRight, CheckCircle2, Clock3, Download, Lock } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { cn } from '@/lib/utils';
import type { RevisionPlan, RevisionUnit } from '@/types/revision';
import { isRevisionPlanComplete } from '@/services/revision/progress';
import {
  getRevisionTimeline,
  type RevisionTimelineBucketId,
  type RevisionTimelineEntry,
} from '@/services/revision/timeline';
import { CompletedPlanState } from './RevisionPlanScreen';

interface RevisionOverviewScreenProps {
  plan: RevisionPlan;
  units: readonly RevisionUnit[];
  onStartSession: (revisionUnitId: string) => void;
  onRestartDiagnostic: () => void;
  onDownloadStudyPack: () => void;
  embedded?: boolean;
}

const BUCKET_ORDER: RevisionTimelineBucketId[] = ['today', 'tomorrow', 'week'];
const BUCKET_LABELS: Record<RevisionTimelineBucketId, string> = {
  today: "Aujourd'hui",
  tomorrow: 'Demain',
  week: 'Cette semaine',
};

/** Persistent "Mon parcours" hub: where am I in this chapter, and what's next. */
export function RevisionOverviewScreen({
  plan,
  units,
  onStartSession,
  onRestartDiagnostic,
  onDownloadStudyPack,
  embedded = false,
}: RevisionOverviewScreenProps) {
  const isComplete = isRevisionPlanComplete(plan);
  const timeline = getRevisionTimeline(plan);

  const content = (
    <>
      <header className="flex flex-col items-center gap-3 pb-6 text-center">
        <AppLogo size="sm" />
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-2xl font-bold">Mon parcours</h1>
          <p className="text-muted text-base font-medium">
            Prêt à reprendre là où tu t&apos;es arrêté ?
          </p>
        </div>
      </header>

      <div className="pb-7">
        <SecondaryButton onClick={onDownloadStudyPack} className="w-auto px-4 py-2 text-sm">
          <span className="inline-flex items-center justify-center gap-2">
            <Download className="size-4" aria-hidden="true" />
            Télécharger mon Study Pack
          </span>
        </SecondaryButton>
      </div>

      {isComplete ? (
        <CompletedPlanState onRestartDiagnostic={onRestartDiagnostic} />
      ) : (
        <div className="relative flex flex-col gap-7 pb-8">
          {BUCKET_ORDER.map((bucket) => {
            const entries = timeline.filter((entry) => entry.bucket === bucket);
            if (entries.length === 0) return null;
            return (
              <TimelineSection
                key={bucket}
                label={BUCKET_LABELS[bucket]}
                entries={entries}
                units={units}
                onStartSession={onStartSession}
              />
            );
          })}
        </div>
      )}
    </>
  );

  return embedded ? (
    content
  ) : (
    <ScreenContainer className="diagnostic-question-reveal">{content}</ScreenContainer>
  );
}

interface TimelineSectionProps {
  label: string;
  entries: RevisionTimelineEntry[];
  units: readonly RevisionUnit[];
  onStartSession: (revisionUnitId: string) => void;
}

function TimelineSection({ label, entries, units, onStartSession }: TimelineSectionProps) {
  return (
    <section aria-labelledby={`timeline-${label}`} className="flex flex-col gap-3">
      <h2 id={`timeline-${label}`} className="text-foreground text-lg font-bold">
        {label}
      </h2>
      <ol className="flex flex-col gap-3">
        {entries.map((entry) => {
          const unit = units.find((candidate) => candidate.id === entry.session.revisionUnitId);
          return (
            <TimelineCard
              key={entry.session.id}
              entry={entry}
              objective={unit?.objective ?? 'Objectif de la session'}
              onStart={() => onStartSession(entry.session.revisionUnitId)}
            />
          );
        })}
      </ol>
    </section>
  );
}

function TimelineCard({
  entry,
  objective,
  onStart,
}: {
  entry: RevisionTimelineEntry;
  objective: string;
  onStart: () => void;
}) {
  const { session, status } = entry;
  const isLocked = status === 'locked';
  const isCompleted = status === 'validated';

  const cardBody = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <h3 className="text-foreground min-w-0 text-base font-bold">{session.competencyLabel}</h3>
        <p className="text-muted min-w-0 text-sm font-medium wrap-break-word">{objective}</p>
      </div>
      <TimelineStatusBadge status={status} minutes={session.estimatedMinutes} />
    </>
  );

  return (
    <li
      className={cn(
        'bg-surface border-border flex items-center gap-3 rounded-3xl border-2 p-4',
        isLocked && 'opacity-60',
      )}
    >
      {isLocked ? (
        <div className="flex w-full items-center gap-3" aria-disabled="true">
          {cardBody}
        </div>
      ) : (
        <button
          type="button"
          onClick={onStart}
          aria-label={`${isCompleted ? 'Revoir' : 'Continuer'} la session ${session.competencyLabel}`}
          className="focus-visible:ring-highlight/40 flex w-full items-center gap-3 rounded-2xl text-left focus-visible:ring-4 focus-visible:outline-none"
        >
          {cardBody}
        </button>
      )}
    </li>
  );
}

function TimelineStatusBadge({
  status,
  minutes,
}: {
  status: RevisionTimelineEntry['status'];
  minutes: number;
}) {
  if (status === 'validated') {
    return (
      <span className="bg-highlight/10 text-highlight flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Terminée
      </span>
    );
  }
  if (status === 'locked') {
    return (
      <span className="bg-border text-muted flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
        <Lock className="size-3.5" aria-hidden="true" />
        Verrouillée
      </span>
    );
  }
  return (
    <span className="bg-primary/25 text-foreground flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
      {status === 'in-progress' ? (
        <Clock3 className="size-3.5" aria-hidden="true" />
      ) : (
        <ArrowRight className="size-3.5" aria-hidden="true" />
      )}
      {status === 'in-progress' ? 'En cours' : `${minutes} min`}
    </span>
  );
}
