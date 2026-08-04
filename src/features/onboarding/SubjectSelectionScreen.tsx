import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import subjects from '@/data/subjects.json';
import type { SubjectOption } from '@/types/onboarding';

interface SubjectSelectionScreenProps {
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
  onContinue: () => void;
}

export function SubjectSelectionScreen({
  selectedSubjectId,
  onSelectSubject,
  onContinue,
}: SubjectSelectionScreenProps) {
  return (
    <ScreenContainer>
      <ProgressIndicator step={3} totalSteps={4} />

      <div className="flex items-start gap-3 py-8">
        <AppLogo size="sm" />
        <SpeechBubble>Quelle matière souhaites-tu travailler ?</SpeechBubble>
      </div>

      <div className="flex flex-col gap-4">
        {(subjects as SubjectOption[]).map((subject) => (
          <SelectionCard
            key={subject.id}
            label={subject.label}
            selected={selectedSubjectId === subject.id}
            showIcon
            onClick={() => onSelectSubject(subject.id)}
          />
        ))}
      </div>

      <BottomCTA>
        <PrimaryButton disabled={!selectedSubjectId} onClick={onContinue}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
