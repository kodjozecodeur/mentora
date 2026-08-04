import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import exams from '@/data/exams.json';
import type { ExamOption } from '@/types/onboarding';

interface ExamSelectionScreenProps {
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
  onContinue: () => void;
}

export function ExamSelectionScreen({
  selectedExamId,
  onSelectExam,
  onContinue,
}: ExamSelectionScreenProps) {
  return (
    <ScreenContainer>
      <ProgressIndicator step={2} totalSteps={4} />

      <div className="flex items-start gap-3 py-8">
        <AppLogo size="sm" />
        <SpeechBubble>Quel examen prépares-tu ?</SpeechBubble>
      </div>

      <div className="flex flex-col gap-4">
        {(exams as ExamOption[]).map((exam) => (
          <SelectionCard
            key={exam.id}
            label={exam.label}
            selected={selectedExamId === exam.id}
            onClick={() => onSelectExam(exam.id)}
          />
        ))}
      </div>

      <BottomCTA>
        <PrimaryButton disabled={!selectedExamId} onClick={onContinue}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
