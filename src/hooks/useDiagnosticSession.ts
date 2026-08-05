'use client';

import { useEffect, useState } from 'react';
import { runDiagnosticEngine } from '@/services/diagnostic/engine';
import {
  clearDiagnosticProgress,
  loadDiagnosticProgress,
  saveDiagnosticProgress,
} from '@/services/diagnostic/storage';
import type {
  DiagnosticPhase,
  DiagnosticQuestion,
  DiagnosticResponse,
  DiagnosticResult,
} from '@/types/diagnostic';

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
function restoreState(phase: DiagnosticPhase, questions: DiagnosticQuestion[]) {
  const saved = loadDiagnosticProgress(phase);
  if (!saved) return { questionIndex: 0, responses: {}, result: null };

  // `questions` is chapter-scoped and still empty on first mount (the chapter isn't picked
  // yet) — clamping against it then would floor a valid index to -1 and permanently blank
  // the diagnostic screen for the rest of the session. Only clamp once we actually know the
  // chapter's question count; otherwise fall back to a safe start.
  const questionIndex =
    questions.length === 0 ? 0 : Math.min(saved.questionIndex, questions.length - 1);
  return { questionIndex, responses: saved.responses, result: saved.result };
}

export function useDiagnosticSession(
  questions: DiagnosticQuestion[],
  phase: DiagnosticPhase = 'initial',
): UseDiagnosticSessionResult {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, DiagnosticResponse>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const restored = restoreState(phase, questions);
    setQuestionIndex(restored.questionIndex);
    setResponses(restored.responses);
    setResult(restored.result);
    setIsRestored(true);
    // Only ever restore once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRestored) return;
    saveDiagnosticProgress(phase, { questionIndex, responses, result, phase });
  }, [isRestored, phase, questionIndex, responses, result]);

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

    setResult(runDiagnosticEngine(questions, Object.values(nextResponses), phase));
  }

  function restart() {
    clearDiagnosticProgress(phase);
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
