import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { AnswerOption } from '@/components/diagnostic/AnswerOption';
import { DiagnosticProgress } from '@/components/diagnostic/DiagnosticProgress';
import { QuestionCard } from '@/components/diagnostic/QuestionCard';
import type { DiagnosticQuestion } from '@/types/diagnostic';

interface DiagnosticQuestionScreenProps {
  question: DiagnosticQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onValidate: () => void;
}

export function DiagnosticQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onValidate,
}: DiagnosticQuestionScreenProps) {
  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <DiagnosticProgress currentQuestion={questionNumber} totalQuestions={totalQuestions} />

      <div className="flex flex-1 flex-col gap-3 py-3 sm:gap-4 sm:py-6">
        <QuestionCard question={question} />

        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option) => (
            <AnswerOption
              key={option.id}
              option={option}
              selected={selectedOptionId === option.id}
              onSelect={() => onSelectOption(option.id)}
            />
          ))}
        </div>
      </div>

      <BottomCTA>
        <PrimaryButton disabled={!selectedOptionId} onClick={onValidate}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
