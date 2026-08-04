import { PartyPopper } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

interface ReadyForExamScreenProps {
  firstName?: string;
  onStartFinalDiagnostic: () => void;
}

/** Spec §13: net-new screen, no Stitch mockup — functional build, checkpoint before the final diagnostic. */
export function ReadyForExamScreen({ firstName, onStartFinalDiagnostic }: ReadyForExamScreenProps) {
  const trimmedName = firstName?.trim();

  return (
    <ScreenContainer className="onboarding-reveal">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <AppLogo size="sm" />
        <div
          className="border-highlight bg-highlight/10 flex size-20 shrink-0 items-center justify-center rounded-full border-2"
          aria-hidden="true"
        >
          <PartyPopper className="text-highlight size-9" />
        </div>
        <h1 className="text-foreground text-2xl font-bold">
          {trimmedName ? `Bravo ${trimmedName} !` : 'Bravo !'}
        </h1>
        <p className="text-muted text-base font-medium">
          Tu as validé toutes tes compétences de révision. Il est temps de mesurer ta progression
          avec un diagnostic final.
        </p>
      </div>

      <BottomCTA>
        <PrimaryButton onClick={onStartFinalDiagnostic}>Commencer le diagnostic final</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
