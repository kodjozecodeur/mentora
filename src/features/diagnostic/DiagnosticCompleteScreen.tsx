import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ReadinessScoreRing } from '@/components/diagnostic/ReadinessScoreRing';
import { cn } from '@/lib/utils';
import type { DiagnosticResult } from '@/types/diagnostic';
import { getGreeting, getReadinessMessage, getWeaknessBadgeLabel } from './resultCopy';

interface DiagnosticCompleteScreenProps {
  result: DiagnosticResult;
  firstName?: string;
  onContinue: () => void;
}

export function DiagnosticCompleteScreen({
  result,
  firstName,
  onContinue,
}: DiagnosticCompleteScreenProps) {
  const topStrengths = result.strengths.slice(0, 3);
  const topWeaknesses = result.weaknesses.slice(0, 3);
  const topPriority = result.revisionPriorities[0];

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <div className="flex flex-col items-center gap-2 pb-4 text-center">
        <AppLogo size="sm" />
        <p className="text-muted text-xs font-bold tracking-wide uppercase">
          Ton diagnostic est terminé
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 pb-6 text-center">
        <h1 className="text-foreground text-2xl font-bold">{getGreeting(firstName)}</h1>
        <p className="text-muted text-base font-medium">
          Voici ton niveau de préparation au BEPC en mathématiques.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pb-8 text-center">
        <ReadinessScoreRing score={result.readinessScore} />
        <p className="text-foreground text-sm font-bold">Niveau de préparation</p>
        <p className="text-muted max-w-[280px] text-sm font-medium">
          {getReadinessMessage(result.readinessScore)}
        </p>
        <p className="text-muted text-sm font-semibold">
          {result.totalEarnedPoints} points sur {result.totalMaxPoints}
        </p>
      </div>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">Tes points forts</h2>
        {topStrengths.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topStrengths.map((strength) => (
              <CompetencyRow
                key={strength.competencyId}
                label={strength.competencyLabel}
                percent={strength.masteryPercent}
                badgeLabel="Maîtrisée"
                badgeTone="mastered"
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Aucune compétence n&apos;est encore totalement maîtrisée, mais ton plan va t&apos;aider
            à progresser.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-foreground text-lg font-bold">À renforcer</h2>
        {topWeaknesses.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topWeaknesses.map((weakness) => {
              const badgeLabel = getWeaknessBadgeLabel(weakness.readinessLevel);
              return (
                <CompetencyRow
                  key={weakness.competencyId}
                  label={weakness.competencyLabel}
                  percent={weakness.masteryPercent}
                  badgeLabel={badgeLabel}
                  badgeTone={badgeLabel === 'Prioritaire' ? 'priority' : 'in-progress'}
                />
              );
            })}
          </ul>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Bravo, aucune faiblesse identifiée pour l&apos;instant.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-8">
        <h2 className="text-foreground text-lg font-bold">Ta priorité</h2>
        {topPriority ? (
          <div className="border-highlight bg-highlight/10 flex flex-col gap-1 rounded-2xl border-2 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground text-base font-bold">
                {topPriority.competencyLabel}
              </span>
              <span className="text-highlight text-sm font-bold">
                {topPriority.masteryPercent}%
              </span>
            </div>
            <p className="text-foreground text-sm font-medium">
              Commence par cette compétence pour progresser plus rapidement.
            </p>
          </div>
        ) : (
          <p className="text-muted border-border bg-surface rounded-2xl border-2 px-4 py-3 text-sm font-medium">
            Tu as maîtrisé toutes les compétences évaluées.
          </p>
        )}
      </section>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Accéder à mon espace</PrimaryButton>
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
