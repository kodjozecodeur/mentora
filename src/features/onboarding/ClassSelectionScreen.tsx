import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import classes from '@/data/classes.json';
import type { ClassOption } from '@/types/onboarding';
import { isMvpClassAvailable, MVP_UNAVAILABLE_CLASS_MESSAGE } from './classAvailability';

interface ClassSelectionScreenProps {
  selectedClassId: string | null;
  onSelectClass: (classId: string) => void;
  onContinue: () => void;
}

export function ClassSelectionScreen({
  selectedClassId,
  onSelectClass,
  onContinue,
}: ClassSelectionScreenProps) {
  const hasUnavailableClass = selectedClassId !== null && !isMvpClassAvailable(selectedClassId);

  return (
    <ScreenContainer>
      <ProgressIndicator step={2} totalSteps={5} />

      <div className="flex items-start gap-3 py-8">
        <AppLogo size="sm" />
        <SpeechBubble>Dans quelle classe es-tu ?</SpeechBubble>
      </div>

      <div className="flex flex-col gap-4">
        {(classes as ClassOption[]).map((classOption) => (
          <SelectionCard
            key={classOption.id}
            label={classOption.label}
            selected={selectedClassId === classOption.id}
            showIcon
            onClick={() => onSelectClass(classOption.id)}
          />
        ))}
      </div>

      {hasUnavailableClass && (
        <p
          role="alert"
          className="border-highlight bg-highlight/10 text-foreground mt-4 rounded-2xl border-2 px-4 py-3 text-sm font-semibold"
        >
          {MVP_UNAVAILABLE_CLASS_MESSAGE}
        </p>
      )}

      <BottomCTA>
        <PrimaryButton disabled={!selectedClassId || hasUnavailableClass} onClick={onContinue}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
