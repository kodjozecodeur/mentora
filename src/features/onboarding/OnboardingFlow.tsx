'use client';

import { useEffect, useState } from 'react';
import diagnosticQuestions from '@/data/diagnostic-questions.json';
import exams from '@/data/exams.json';
import subjects from '@/data/subjects.json';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { AppShell } from '@/features/app-shell/AppShell';
import { ComparisonScreen } from '@/features/diagnostic/ComparisonScreen';
import { DiagnosticAnalysisScreen } from '@/features/diagnostic/DiagnosticAnalysisScreen';
import { DiagnosticCompleteScreen } from '@/features/diagnostic/DiagnosticCompleteScreen';
import { DiagnosticQuestionScreen } from '@/features/diagnostic/DiagnosticQuestionScreen';
import { FinalDiagnosticResultScreen } from '@/features/diagnostic/FinalDiagnosticResultScreen';
import { useDiagnosticSession } from '@/hooks/useDiagnosticSession';
import { useRevisionPlan } from '@/services/revision/useRevisionPlan';
import type { DiagnosticQuestion } from '@/types/diagnostic';
import type { ExamOption, SubjectOption } from '@/types/onboarding';
import { WelcomeScreen } from './WelcomeScreen';
import { ExamSelectionScreen } from './ExamSelectionScreen';
import { SubjectSelectionScreen } from './SubjectSelectionScreen';
import { DiagnosticIntroScreen } from './DiagnosticIntroScreen';
import { PreparingScreen } from './PreparingScreen';
import { ReadyForExamScreen } from './ReadyForExamScreen';
import { isMvpSubjectAvailable } from './subjectAvailability';

type Step =
  | 'welcome'
  | 'exam'
  | 'subject'
  | 'preparing'
  | 'diagnostic-intro'
  | 'diagnostic-question'
  | 'diagnostic-analysis'
  | 'diagnostic-result'
  | 'app-shell'
  | 'ready-for-exam'
  | 'final-diagnostic-question'
  | 'final-diagnostic-analysis'
  | 'final-diagnostic-result'
  | 'comparison';

const DIAGNOSTIC_QUESTIONS = diagnosticQuestions as DiagnosticQuestion[];

/** Steps reachable only once the initial diagnostic has produced a result (spec §12 deep-link fallback). */
const STEPS_REQUIRING_INITIAL_RESULT: Step[] = [
  'diagnostic-analysis',
  'diagnostic-result',
  'app-shell',
  'ready-for-exam',
  'final-diagnostic-question',
  'final-diagnostic-analysis',
  'final-diagnostic-result',
  'comparison',
];

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [examId, setExamId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);
  const diagnostic = useDiagnosticSession(DIAGNOSTIC_QUESTIONS, 'initial');
  const finalDiagnostic = useDiagnosticSession(DIAGNOSTIC_QUESTIONS, 'final');
  const revision = useRevisionPlan(diagnostic.result, name);

  const subjectLabel =
    (subjects as SubjectOption[]).find((subject) => subject.id === subjectId)?.label ?? '';
  const examLabel = (exams as ExamOption[]).find((exam) => exam.id === examId)?.label ?? '';

  function restartDiagnostic() {
    revision.clearPlan();
    diagnostic.restart();
    setStep('welcome');
  }

  function requestRestartDiagnostic() {
    setIsRestartDialogOpen(true);
  }

  function confirmRestartDiagnostic() {
    setIsRestartDialogOpen(false);
    restartDiagnostic();
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

  // Defensive fallback: every post-diagnostic step requires a saved initial result (e.g. direct
  // access, stale state) — spec §12 deep-link fallback.
  useEffect(() => {
    if (STEPS_REQUIRING_INITIAL_RESULT.includes(step) && !diagnostic.result) {
      setStep('diagnostic-question');
    }
  }, [step, diagnostic.result]);

  // Final diagnostic's 12th validate() call -> hand off to the analysis transition, same as initial.
  useEffect(() => {
    if (step === 'final-diagnostic-question' && finalDiagnostic.result) {
      setStep('final-diagnostic-analysis');
    }
  }, [step, finalDiagnostic.result]);

  // Defensive fallback: the final-diagnostic result steps require a saved final result.
  useEffect(() => {
    if (
      (step === 'final-diagnostic-analysis' ||
        step === 'final-diagnostic-result' ||
        step === 'comparison') &&
      !finalDiagnostic.result
    ) {
      setStep('final-diagnostic-question');
    }
  }, [step, finalDiagnostic.result]);

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
          onContinue={() => {
            if (!isMvpSubjectAvailable(subjectId)) return;
            setStep('preparing');
          }}
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
        <>
          <AppShell
            diagnosticResult={diagnostic.result}
            revisionPlan={revision.plan}
            diagnosticQuestions={DIAGNOSTIC_QUESTIONS}
            firstName={name}
            examLabel={examLabel || 'BEPC'}
            subjectLabel={subjectLabel || 'Mathématiques'}
            onRestartDiagnostic={requestRestartDiagnostic}
            onStartRevisionSession={revision.startSession}
            onSubmitValidationAttempt={revision.submitValidationAttempt}
            onReadyForExam={() => {
              // A final result already exists (this journey, or a stale one from before a restart —
              // spec §12) -> the checkpoint has already been crossed, don't re-show it every time
              // AppShell remounts and re-derives isReadyForExam() as true.
              if (finalDiagnostic.result) return;
              setStep('ready-for-exam');
            }}
          />
          <ConfirmationDialog
            open={isRestartDialogOpen}
            onCancel={() => setIsRestartDialogOpen(false)}
            onConfirm={confirmRestartDiagnostic}
          />
        </>
      );
    }
    case 'ready-for-exam':
      return (
        <ReadyForExamScreen
          firstName={name}
          onStartFinalDiagnostic={() => setStep('final-diagnostic-question')}
        />
      );
    case 'final-diagnostic-question': {
      if (!finalDiagnostic.currentQuestion) return null;

      return (
        <DiagnosticQuestionScreen
          key={finalDiagnostic.currentQuestion.id}
          question={finalDiagnostic.currentQuestion}
          questionNumber={finalDiagnostic.questionNumber}
          totalQuestions={finalDiagnostic.totalQuestions}
          selectedOptionId={finalDiagnostic.selectedOptionId}
          onSelectOption={finalDiagnostic.selectOption}
          onValidate={finalDiagnostic.validate}
        />
      );
    }
    case 'final-diagnostic-analysis': {
      if (!finalDiagnostic.result) return null;

      return (
        <DiagnosticAnalysisScreen
          result={finalDiagnostic.result}
          onComplete={() => setStep('final-diagnostic-result')}
        />
      );
    }
    case 'final-diagnostic-result': {
      if (!finalDiagnostic.result) return null;

      return (
        <FinalDiagnosticResultScreen
          result={finalDiagnostic.result}
          firstName={name}
          onContinue={() => setStep('comparison')}
        />
      );
    }
    case 'comparison': {
      if (!diagnostic.result || !finalDiagnostic.result) return null;

      return (
        <ComparisonScreen
          initialResult={diagnostic.result}
          finalResult={finalDiagnostic.result}
          onContinue={() => setStep('app-shell')}
        />
      );
    }
  }
}
