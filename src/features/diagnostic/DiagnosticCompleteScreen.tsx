import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import type { DiagnosticResult } from '@/types/diagnostic';

interface DiagnosticCompleteScreenProps {
  result: DiagnosticResult;
  onContinue: () => void;
}

/**
 * Stopgap screen: no Figma mockup exists yet for Analysis/Results/Plan (spec §16 requires
 * matching Figma). This only proves the engine end-to-end; swap for the real designed
 * screens once those mocks land.
 */
export function DiagnosticCompleteScreen({ result, onContinue }: DiagnosticCompleteScreenProps) {
  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-foreground text-2xl font-bold">Diagnostic terminé</h1>
        <p className="text-muted text-base font-medium">
          Readiness score : {result.readinessScore}% ({result.readinessLevel})
        </p>
        {result.revisionPriorities[0] && (
          <p className="text-muted text-sm">
            Priorité n°1 : {result.revisionPriorities[0].competencyLabel}
          </p>
        )}
      </div>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Continuer</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
