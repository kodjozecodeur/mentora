import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { cn } from '@/lib/utils';
import { buildDiagnosticComparison } from '@/services/diagnostic/comparison';
import type { DiagnosticResult } from '@/types/diagnostic';

interface ComparisonScreenProps {
  initialResult: DiagnosticResult;
  finalResult: DiagnosticResult;
  onContinue: () => void;
}

/** Spec §11/§13: net-new, no Stitch mockup. Read-only — the terminal screen of the journey spec. */
export function ComparisonScreen({ initialResult, finalResult, onContinue }: ComparisonScreenProps) {
  const comparison = buildDiagnosticComparison(initialResult, finalResult);

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <div className="flex flex-col items-center gap-2 pb-4 text-center">
        <AppLogo size="sm" />
        <p className="text-muted text-xs font-bold tracking-wide uppercase">Ta progression</p>
      </div>

      <div className="flex flex-col items-center gap-1 pb-6 text-center">
        <h1 className="text-foreground text-2xl font-bold">Avant / après ta révision</h1>
        <p className="text-muted text-base font-medium">
          Compare ton niveau de préparation avant et après avoir travaillé ton plan de révision.
        </p>
      </div>

      <section
        aria-labelledby="comparison-overall-title"
        className="bg-surface border-border flex flex-col items-center gap-3 rounded-3xl border-2 p-5 text-center"
      >
        <h2 id="comparison-overall-title" className="text-foreground text-base font-bold">
          Niveau de préparation global
        </h2>
        <div className="flex items-center gap-4">
          <ScorePill label="Avant" score={comparison.readinessScoreBefore} />
          <DeltaBadge delta={comparison.readinessScoreDelta} />
          <ScorePill label="Après" score={comparison.readinessScoreAfter} />
        </div>
      </section>

      <section aria-labelledby="comparison-competencies-title" className="flex flex-col gap-3 py-6">
        <h2 id="comparison-competencies-title" className="text-foreground text-lg font-bold">
          Par compétence
        </h2>
        <ul className="flex flex-col gap-2">
          {comparison.rows.map((row) => (
            <li
              key={row.competencyId}
              className="bg-surface border-border flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3"
            >
              <span className="text-foreground min-w-0 text-sm font-bold">{row.competencyLabel}</span>
              <span className="flex shrink-0 items-center gap-2 text-sm font-semibold">
                <span className="text-muted">{row.masteryBefore}%</span>
                <span className="text-muted" aria-hidden="true">
                  →
                </span>
                <span className="text-foreground">{row.masteryAfter}%</span>
                <DeltaBadge delta={row.delta} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Retour à mon espace</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-muted text-xs font-bold tracking-wide uppercase">{label}</span>
      <span className="text-foreground text-2xl font-extrabold">{score}%</span>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
        isPositive && 'bg-highlight/10 text-highlight',
        isNegative && 'bg-primary/20 text-foreground',
        !isPositive && !isNegative && 'bg-border text-foreground',
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {isPositive ? `+${delta}` : delta}%
    </span>
  );
}
