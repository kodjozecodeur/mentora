'use client';

import { useEffect, useState } from 'react';
import diagnosticQuestions from '@/data/diagnostic-questions.json';
import exams from '@/data/exams.json';
import subjects from '@/data/subjects.json';
import { AppShell } from '@/features/app-shell/AppShell';
import { DiagnosticAnalysisScreen } from '@/features/diagnostic/DiagnosticAnalysisScreen';
import { DiagnosticCompleteScreen } from '@/features/diagnostic/DiagnosticCompleteScreen';
import { DiagnosticQuestionScreen } from '@/features/diagnostic/DiagnosticQuestionScreen';
import { useDiagnosticSession } from '@/hooks/useDiagnosticSession';
import { useRevisionPlan } from '@/services/revision/useRevisionPlan';
import type { DiagnosticQuestion } from '@/types/diagnostic';
import type { ExamOption, SubjectOption } from '@/types/onboarding';
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
  | 'diagnostic-result'
  | 'app-shell';

const DIAGNOSTIC_QUESTIONS = diagnosticQuestions as DiagnosticQuestion[];

interface OnboardingFlowProps {
  onDownloadStudyPack?: () => void;
}

export function OnboardingFlow({ onDownloadStudyPack = () => undefined }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [examId, setExamId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const diagnostic = useDiagnosticSession(DIAGNOSTIC_QUESTIONS);
  const revision = useRevisionPlan(diagnostic.result, name);

  const subjectLabel =
    (subjects as SubjectOption[]).find((subject) => subject.id === subjectId)?.label ?? '';
  const examLabel = (exams as ExamOption[]).find((exam) => exam.id === examId)?.label ?? '';

  function restartDiagnostic() {
    revision.clearPlan();
    diagnostic.restart();
    setStep('welcome');
  }

  // Result just got saved by the 12th validate() call -> hand off to the analysis transition.
  useEffect(() => {
    if (step === 'diagnostic-question' && diagnostic.result) {
      setStep('diagnostic-analysis');
    }
  }, [step, diagnostic.result]);

  // A restored diagnostic result resumes in the post-diagnostic app shell.
  useEffect(() => {
    if (step === 'welcome' && diagnostic.result) {
      setStep('app-shell');
    }
  }, [step, diagnostic.result]);

  // Defensive fallback: analysis/result steps require a saved result (e.g. direct access, stale state).
  useEffect(() => {
    if (
      (step === 'diagnostic-analysis' || step === 'diagnostic-result' || step === 'app-shell') &&
      !diagnostic.result
    ) {
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
          onContinue={() => setStep('app-shell')}
        />
      );
    }
    case 'app-shell': {
      if (!diagnostic.result || !revision.plan) return null;

      return (
        <AppShell
          diagnosticResult={diagnostic.result}
          revisionPlan={revision.plan}
          firstName={name}
          examLabel={examLabel || 'BEPC'}
          subjectLabel={subjectLabel || 'Mathématiques'}
          onRestartDiagnostic={restartDiagnostic}
          onStartRevisionSession={revision.startSession}
          onCompleteRevisionSession={revision.completeSession}
          onDownloadStudyPack={onDownloadStudyPack}
        />
      );
    }
  }
}
