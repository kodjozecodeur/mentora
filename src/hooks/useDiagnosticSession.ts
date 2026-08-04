'use client';

import { useEffect, useState } from 'react';
import { runDiagnosticEngine } from '@/services/diagnostic/engine';
import {
  clearDiagnosticProgress,
  loadDiagnosticProgress,
  saveDiagnosticProgress,
} from '@/services/diagnostic/storage';
import type { DiagnosticQuestion, DiagnosticResponse, DiagnosticResult } from '@/types/diagnostic';

interface UseDiagnosticSessionResult {
  currentQuestion: DiagnosticQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  selectOption: (optionId: string) => void;
  validate: () => void;
  result: DiagnosticResult | null;
  restart: () => void;
}

/** Restores in-progress state so a page refresh mid-diagnostic doesn't lose answers (spec: state = localStorage only). */
function restoreState(questions: DiagnosticQuestion[]) {
  const saved = loadDiagnosticProgress();
  if (!saved) return { questionIndex: 0, responses: {}, result: null };

  const questionIndex = Math.min(saved.questionIndex, questions.length - 1);
  return { questionIndex, responses: saved.responses, result: saved.result };
}

export function useDiagnosticSession(questions: DiagnosticQuestion[]): UseDiagnosticSessionResult {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, DiagnosticResponse>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const restored = restoreState(questions);
    setQuestionIndex(restored.questionIndex);
    setResponses(restored.responses);
    setResult(restored.result);
    setIsRestored(true);
    // Only ever restore once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRestored) return;
    saveDiagnosticProgress({ questionIndex, responses, result });
  }, [isRestored, questionIndex, responses, result]);

  const currentQuestion = questions[questionIndex] ?? null;

  function selectOption(optionId: string) {
    setSelectedOptionId(optionId);
  }

  function validate() {
    if (!currentQuestion || !selectedOptionId) return;

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const nextResponses = {
      ...responses,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        competencyId: currentQuestion.competencyId,
        optionId: selectedOptionId,
        isCorrect,
        points: isCorrect ? currentQuestion.points : 0,
      },
    };
    setResponses(nextResponses);
    setSelectedOptionId(null);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      return;
    }

    setResult(runDiagnosticEngine(questions, Object.values(nextResponses)));
  }

  function restart() {
    clearDiagnosticProgress();
    setQuestionIndex(0);
    setResponses({});
    setResult(null);
    setSelectedOptionId(null);
  }

  return {
    currentQuestion,
    questionNumber: questionIndex + 1,
    totalQuestions: questions.length,
    selectedOptionId,
    selectOption,
    validate,
    result,
    restart,
  };
}
