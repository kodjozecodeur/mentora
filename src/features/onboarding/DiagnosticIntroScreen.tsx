import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

interface DiagnosticIntroScreenProps {
  subjectLabel: string;
  onContinue: () => void;
}

export function DiagnosticIntroScreen({ subjectLabel, onContinue }: DiagnosticIntroScreenProps) {
  return (
    <ScreenContainer className="onboarding-reveal">
      <ProgressIndicator step={4} totalSteps={4} />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-foreground text-2xl font-bold">{subjectLabel} !!</h1>
        <p className="text-muted text-base font-medium">
          Nous allons commencer par un diagnostic pour comprendre ton niveau actuel en{' '}
          {subjectLabel.toLowerCase()}.
        </p>
      </div>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Commencer</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
