import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import classes from '@/data/classes.json';
import type { ClassOption } from '@/types/onboarding';
import { isMvpClassAvailable } from './classAvailability';

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
  return (
    <ScreenContainer>
      <ProgressIndicator step={2} totalSteps={5} />

      <div className="flex items-start gap-3 py-8">
        <AppLogo size="sm" />
        <SpeechBubble>
          <p>Dans quelle classe es-tu ?</p>
          <p className="text-muted text-sm font-medium">
            Choisis ton niveau pour que je prépare un parcours adapté.
          </p>
        </SpeechBubble>
      </div>

      <div className="flex flex-col gap-4">
        {(classes as ClassOption[]).map((classOption) => (
          <SelectionCard
            key={classOption.id}
            label={classOption.label}
            sublabel={classOption.category}
            selected={selectedClassId === classOption.id}
            showIcon
            disabled={!isMvpClassAvailable(classOption.id)}
            onClick={() => onSelectClass(classOption.id)}
          />
        ))}
      </div>

      <BottomCTA>
        <PrimaryButton disabled={!selectedClassId} onClick={onContinue}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
