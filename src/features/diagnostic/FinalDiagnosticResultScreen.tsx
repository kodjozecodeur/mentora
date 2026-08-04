import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ReadinessScoreRing } from '@/components/diagnostic/ReadinessScoreRing';
import { cn } from '@/lib/utils';
import type { DiagnosticResult } from '@/types/diagnostic';
import { getGreeting, PROGRESSION_GLOBALE_LABEL, partitionByReadinessLevel } from './resultCopy';

interface FinalDiagnosticResultScreenProps {
  result: DiagnosticResult;
  firstName?: string;
  onContinue: () => void;
}

/** Spec §13 Decision 9: same engine/UI family as the initial result, but no "generate a plan" CTA —
 * there is nothing left to plan once the final diagnostic runs. CTA leads to the before/after comparison. */
export function FinalDiagnosticResultScreen({
  result,
  firstName,
  onContinue,
}: FinalDiagnosticResultScreenProps) {
  const { mastered, inProgress, priority } = partitionByReadinessLevel(result.competencyMastery);
  const topMastered = mastered.slice(0, 3);
  const topInProgress = inProgress.slice(0, 3);
  const topPriority = priority.slice(0, 3);

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <div className="flex flex-col items-center gap-2 pb-4 text-center">
        <AppLogo size="sm" />
        <p className="text-muted text-xs font-bold tracking-wide uppercase">
          Ton diagnostic final est terminé
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 pb-6 text-center">
        <h1 className="text-foreground text-2xl font-bold">
          {getGreeting(firstName, result.readinessScore)}
        </h1>
        <p className="text-muted text-base font-medium">
          Voici ton niveau de préparation au BEPC en mathématiques après ta révision.
        </p>
      </div>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">Tu maîtrises déjà</h2>
        {topMastered.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topMastered.map((competency) => (
              <CompetencyRow
                key={competency.competencyId}
                label={competency.competencyLabel}
                percent={competency.masteryPercent}
                badgeLabel="Maîtrisé"
                badgeTone="mastered"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Aucune compétence n&apos;est encore totalement maîtrisée.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">En cours d&apos;apprentissage</h2>
        {topInProgress.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topInProgress.map((competency) => (
              <CompetencyRow
                key={competency.competencyId}
                label={competency.competencyLabel}
                percent={competency.masteryPercent}
                badgeLabel="En apprentissage"
                badgeTone="in-progress"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Rien en cours d&apos;apprentissage pour l&apos;instant.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">À renforcer</h2>
        {topPriority.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topPriority.map((competency) => (
              <CompetencyRow
                key={competency.competencyId}
                label={competency.competencyLabel}
                percent={competency.masteryPercent}
                badgeLabel="À renforcer"
                badgeTone="priority"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Bravo, aucune notion prioritaire à renforcer pour l&apos;instant.
          </p>
        )}
      </section>

      <section className="flex flex-col items-center gap-2 pb-8 text-center">
        <ReadinessScoreRing score={result.readinessScore} />
        <p className="text-foreground text-sm font-bold">{PROGRESSION_GLOBALE_LABEL}</p>
        <p className="text-muted text-xs font-semibold">
          Préparation au BEPC — {result.totalEarnedPoints} points sur {result.totalMaxPoints}
        </p>
      </section>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Voir ma progression</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}

interface CompetencyRowProps {
  label: string;
  percent: number;
  badgeLabel: string;
  badgeTone: 'mastered' | 'priority' | 'in-progress';
}

function CompetencyRow({ label, percent, badgeLabel, badgeTone }: CompetencyRowProps) {
  return (
    <li className="bg-surface border-border flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3">
      <span className="text-foreground text-sm font-bold">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-muted text-sm font-semibold">{percent}%</span>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
            badgeTone === 'mastered' && 'bg-highlight/10 text-highlight',
            badgeTone === 'priority' && 'bg-primary/20 text-foreground',
            badgeTone === 'in-progress' && 'bg-border text-foreground',
          )}
        >
          {badgeLabel}
        </span>
      </span>
    </li>
  );
}
