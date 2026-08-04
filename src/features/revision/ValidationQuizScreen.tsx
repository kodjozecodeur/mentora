'use client';

import { useState } from 'react';
import { AnswerOption } from '@/components/diagnostic/AnswerOption';
import { DiagnosticProgress } from '@/components/diagnostic/DiagnosticProgress';
import { QuestionCard } from '@/components/diagnostic/QuestionCard';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import type { ValidationQuestion, ValidationResponse } from '@/types/revision';

interface ValidationQuizScreenProps {
  competencyLabel: string;
  questions: ValidationQuestion[];
  onComplete: (responses: ValidationResponse[]) => void;
  embedded?: boolean;
}

/**
 * Reuses the diagnostic question layout/components (QuestionCard, AnswerOption,
 * DiagnosticProgress) since a targeted validation is structurally a mini diagnostic
 * scoped to one competency. Responses are only collected in memory; nothing is
 * persisted until onComplete fires (matches the diagnostic's refresh behavior — an
 * unsubmitted attempt never counts as a phantom pass or fail).
 */
export function ValidationQuizScreen({
  competencyLabel,
  questions,
  onComplete,
  embedded = false,
}: ValidationQuizScreenProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [responses, setResponses] = useState<ValidationResponse[]>([]);

  const currentQuestion = questions[questionIndex] ?? null;
  if (!currentQuestion) return null;

  function validate() {
    if (!currentQuestion || !selectedOptionId) return;

    const nextResponses = [
      ...responses,
      {
        questionId: currentQuestion.id,
        optionId: selectedOptionId,
        isCorrect: selectedOptionId === currentQuestion.correctOptionId,
      },
    ];
    setSelectedOptionId(null);

    if (questionIndex < questions.length - 1) {
      setResponses(nextResponses);
      setQuestionIndex(questionIndex + 1);
      return;
    }

    onComplete(nextResponses);
  }

  const content = (
    <>
      <DiagnosticProgress
        label={`Valider : ${competencyLabel}`}
        currentQuestion={questionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="flex flex-1 flex-col gap-3 py-3 sm:gap-4 sm:py-6">
        <QuestionCard question={currentQuestion} />

        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => (
            <AnswerOption
              key={option.id}
              option={option}
              selected={selectedOptionId === option.id}
              onSelect={() => setSelectedOptionId(option.id)}
            />
          ))}
        </div>
      </div>

      <BottomCTA>
        <PrimaryButton disabled={!selectedOptionId} onClick={validate}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </>
  );

  return embedded ? (
    content
  ) : (
    <ScreenContainer className="diagnostic-question-reveal">{content}</ScreenContainer>
  );
}
