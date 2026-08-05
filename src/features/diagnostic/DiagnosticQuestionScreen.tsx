import { ArrowRight } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
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
  onClose?: () => void;
}

export function DiagnosticQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onValidate,
  onClose,
}: DiagnosticQuestionScreenProps) {
  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <DiagnosticProgress
        currentQuestion={questionNumber}
        totalQuestions={totalQuestions}
        onClose={onClose}
      />

      <div className="flex items-start gap-3 py-4 sm:py-6">
        <AppLogo size="sm" />
        <SpeechBubble>
          <p className="text-highlight text-xs font-bold tracking-wider uppercase">
            {question.competencyLabel}
          </p>
          <p>Prêt·e ? Regarde bien avant de répondre.</p>
        </SpeechBubble>
      </div>

      <div className="flex flex-1 flex-col gap-3 pb-3 sm:gap-4 sm:pb-6">
        <QuestionCard question={question} />

        <div className="flex flex-col gap-4">
          {question.options.map((option, index) => (
            <AnswerOption
              key={option.id}
              option={option}
              index={index}
              selected={selectedOptionId === option.id}
              onSelect={() => onSelectOption(option.id)}
            />
          ))}
        </div>
      </div>

      <BottomCTA>
        <PrimaryButton
          disabled={!selectedOptionId}
          onClick={onValidate}
          className="flex items-center justify-center gap-2"
        >
          Valider
          <ArrowRight className="size-5" aria-hidden="true" />
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
