import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

interface DiagnosticIntroScreenProps {
  chapterLabel: string;
  onContinue: () => void;
}

export function DiagnosticIntroScreen({ chapterLabel, onContinue }: DiagnosticIntroScreenProps) {
  return (
    <ScreenContainer className="onboarding-reveal">
      <ProgressIndicator step={5} totalSteps={5} />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-24 shrink-0 items-center justify-center" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/logo-math.svg"
            alt=""
            width={96}
            height={96}
            className="size-full object-contain"
          />
        </div>
        <h1 className="text-foreground text-2xl font-bold">Vérifions ensemble</h1>
        <p className="text-muted text-base font-medium">
          Réponds à quelques questions sur le chapitre {chapterLabel.toLowerCase()} pour permettre à
          Mentora d&apos;identifier ce que tu maîtrises déjà et ce que tu dois encore renforcer.
        </p>
      </div>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>Commencer</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
