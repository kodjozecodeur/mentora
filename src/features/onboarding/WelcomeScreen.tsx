'use client';

import type { KeyboardEvent } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { useSubmitValidation } from '@/hooks/useSubmitValidation';
import { hasMinLength } from '@/lib/validation';

const MIN_NAME_LENGTH = 2;

interface WelcomeScreenProps {
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
}

export function WelcomeScreen({ name, onNameChange, onContinue }: WelcomeScreenProps) {
  const isValid = hasMinLength(name, MIN_NAME_LENGTH);
  const { error, attemptSubmit } = useSubmitValidation({
    isValid,
    errorMessage: 'Veuillez entrer votre prénom.',
  });

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      attemptSubmit(onContinue);
    }
  }

  return (
    <ScreenContainer>
      <ProgressIndicator step={1} totalSteps={5} />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
        <AppLogo size="lg" />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-muted text-sm font-bold">Continue d&apos;apprendre après les cours.</p>
          <p className="text-muted max-w-[280px] text-sm font-medium">
            Retrouve les notions vues en classe, comprends-les à ton rythme et progresse avec
            Mentora AI.
          </p>
        </div>
        <h1 className="text-foreground text-center text-2xl font-bold">Quel est ton nom ?</h1>
        <TextField
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Entrer ici..."
          error={error}
        />
      </div>

      <BottomCTA>
        <PrimaryButton disabled={!isValid} onClick={() => attemptSubmit(onContinue)}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
