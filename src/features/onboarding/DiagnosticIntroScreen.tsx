import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SpeechBubble } from '@/components/ui/SpeechBubble';

interface DiagnosticIntroScreenProps {
  onContinue: () => void;
}

export function DiagnosticIntroScreen({ onContinue }: DiagnosticIntroScreenProps) {
  return (
    <ScreenContainer className="onboarding-reveal">
      <ProgressIndicator step={5} totalSteps={5} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
        <div className="flex w-full">
          <SpeechBubble>
            Parfait ! Faisons un petit point pour découvrir ce que tu maîtrises déjà et construire
            ton parcours personnalisé.
          </SpeechBubble>
        </div>

        <div className="flex flex-col items-center gap-2">
          <AppLogo size="lg" />
          <p className="text-foreground text-base font-bold">Ton premier diagnostic</p>
        </div>
      </div>

      <p className="text-muted pb-4 text-center text-sm font-medium">
        ⏱ Environ 2 minutes • 6 questions
      </p>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Commencer mon diagnostic</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
