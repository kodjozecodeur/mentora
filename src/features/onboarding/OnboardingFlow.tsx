'use client';

import { useEffect, useState } from 'react';
import diagnosticQuestions from '@/data/diagnostic-questions.json';
import subjects from '@/data/subjects.json';
import { DiagnosticAnalysisScreen } from '@/features/diagnostic/DiagnosticAnalysisScreen';
import { DiagnosticCompleteScreen } from '@/features/diagnostic/DiagnosticCompleteScreen';
import { DiagnosticQuestionScreen } from '@/features/diagnostic/DiagnosticQuestionScreen';
import { useDiagnosticSession } from '@/hooks/useDiagnosticSession';
import type { DiagnosticQuestion } from '@/types/diagnostic';
import type { SubjectOption } from '@/types/onboarding';
import { WelcomeScreen } from './WelcomeScreen';
import { ExamSelectionScreen } from './ExamSelectionScreen';
import { SubjectSelectionScreen } from './SubjectSelectionScreen';
import { DiagnosticIntroScreen } from './DiagnosticIntroScreen';
import { PreparingScreen } from './PreparingScreen';

type Step =
  | 'welcome'
  | 'exam'
  | 'subject'
  | 'preparing'
  | 'diagnostic-intro'
  | 'diagnostic-question'
  | 'diagnostic-analysis'
  | 'diagnostic-result';

const DIAGNOSTIC_QUESTIONS = diagnosticQuestions as DiagnosticQuestion[];

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [examId, setExamId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const diagnostic = useDiagnosticSession(DIAGNOSTIC_QUESTIONS);

  const subjectLabel =
    (subjects as SubjectOption[]).find((subject) => subject.id === subjectId)?.label ?? '';

  // Result just got saved by the 12th validate() call -> hand off to the analysis transition.
  useEffect(() => {
    if (step === 'diagnostic-question' && diagnostic.result) {
      setStep('diagnostic-analysis');
    }
  }, [step, diagnostic.result]);

  // Defensive fallback: analysis/result steps require a saved result (e.g. direct access, stale state).
  useEffect(() => {
    if ((step === 'diagnostic-analysis' || step === 'diagnostic-result') && !diagnostic.result) {
      setStep('diagnostic-question');
    }
  }, [step, diagnostic.result]);

  switch (step) {
    case 'welcome':
      return (
        <WelcomeScreen name={name} onNameChange={setName} onContinue={() => setStep('exam')} />
      );
    case 'exam':
      return (
        <ExamSelectionScreen
          selectedExamId={examId}
          onSelectExam={setExamId}
          onContinue={() => setStep('subject')}
        />
      );
    case 'subject':
      return (
        <SubjectSelectionScreen
          selectedSubjectId={subjectId}
          onSelectSubject={setSubjectId}
          onContinue={() =>
            setStep(subjectId === 'mathematiques' ? 'preparing' : 'diagnostic-intro')
          }
        />
      );
    case 'preparing':
      return <PreparingScreen onComplete={() => setStep('diagnostic-intro')} />;
    case 'diagnostic-intro':
      return (
        <DiagnosticIntroScreen
          subjectLabel={subjectLabel}
          onContinue={() => setStep('diagnostic-question')}
        />
      );
    case 'diagnostic-question': {
      if (!diagnostic.currentQuestion) return null;

      return (
        <DiagnosticQuestionScreen
          key={diagnostic.currentQuestion.id}
          question={diagnostic.currentQuestion}
          questionNumber={diagnostic.questionNumber}
          totalQuestions={diagnostic.totalQuestions}
          selectedOptionId={diagnostic.selectedOptionId}
          onSelectOption={diagnostic.selectOption}
          onValidate={diagnostic.validate}
        />
      );
    }
    case 'diagnostic-analysis': {
      if (!diagnostic.result) return null;

      return (
        <DiagnosticAnalysisScreen
          result={diagnostic.result}
          onComplete={() => setStep('diagnostic-result')}
        />
      );
    }
    case 'diagnostic-result': {
      if (!diagnostic.result) return null;

      return (
        <DiagnosticCompleteScreen
          result={diagnostic.result}
          firstName={name}
          onContinue={() => {
            diagnostic.restart();
            setStep('welcome');
          }}
        />
      );
    }
  }
}
