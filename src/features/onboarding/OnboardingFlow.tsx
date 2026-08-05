'use client';

import { useEffect, useMemo, useState } from 'react';
import diagnosticQuestions from '@/data/diagnostic-questions.json';
import subjects from '@/data/subjects.json';
import chapters from '@/data/chapters.json';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { AppShell } from '@/features/app-shell/AppShell';
import { DiagnosticAnalysisScreen } from '@/features/diagnostic/DiagnosticAnalysisScreen';
import { DiagnosticCompleteScreen } from '@/features/diagnostic/DiagnosticCompleteScreen';
import { DiagnosticQuestionScreen } from '@/features/diagnostic/DiagnosticQuestionScreen';
import { resolveResultsBranch } from '@/features/diagnostic/resultCopy';
import { useDiagnosticSession } from '@/hooks/useDiagnosticSession';
import { selectChapterQuestions } from '@/services/diagnostic/chapterScope';
import { useRevisionPlan } from '@/services/revision/useRevisionPlan';
import type { DiagnosticQuestion } from '@/types/diagnostic';
import type { ChapterOption, SubjectOption } from '@/types/onboarding';
import { SplashScreen } from './SplashScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { ClassSelectionScreen } from './ClassSelectionScreen';
import { SubjectSelectionScreen } from './SubjectSelectionScreen';
import { ChapterSelectionScreen } from './ChapterSelectionScreen';
import { DiagnosticIntroScreen } from './DiagnosticIntroScreen';
import { PreparingScreen } from './PreparingScreen';
import { isMvpClassAvailable } from './classAvailability';
import { isMvpSubjectAvailable } from './subjectAvailability';
import { isMvpChapterAvailable } from './chapterAvailability';

type Step =
  | 'splash'
  | 'welcome'
  | 'class'
  | 'subject'
  | 'chapter'
  | 'preparing'
  | 'diagnostic-intro'
  | 'diagnostic-question'
  | 'diagnostic-analysis'
  | 'diagnostic-result'
  | 'app-shell';

const DIAGNOSTIC_QUESTIONS = diagnosticQuestions as DiagnosticQuestion[];

/** Steps reachable only once the initial diagnostic has produced a result (spec §12 deep-link fallback). */
const STEPS_REQUIRING_INITIAL_RESULT: Step[] = [
  'diagnostic-analysis',
  'diagnostic-result',
  'app-shell',
];

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>('splash');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);
  const chapterQuestions = useMemo(
    () => selectChapterQuestions(DIAGNOSTIC_QUESTIONS, chapterId),
    [chapterId],
  );
  const diagnostic = useDiagnosticSession(chapterQuestions, 'initial');
  const revision = useRevisionPlan(diagnostic.result, name);

  const subjectLabel =
    (subjects as SubjectOption[]).find((subject) => subject.id === subjectId)?.label ?? '';
  const chapterLabel =
    (chapters as ChapterOption[]).find((chapter) => chapter.id === chapterId)?.label ?? '';

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
    if ((step === 'splash' || step === 'welcome') && diagnostic.result) {
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

  switch (step) {
    case 'splash':
      return <SplashScreen onContinue={() => setStep('welcome')} />;
    case 'welcome':
      return (
        <WelcomeScreen name={name} onNameChange={setName} onContinue={() => setStep('class')} />
      );
    case 'class':
      return (
        <ClassSelectionScreen
          selectedClassId={classId}
          onSelectClass={setClassId}
          onContinue={() => {
            if (!isMvpClassAvailable(classId)) return;
            setStep('subject');
          }}
        />
      );
    case 'subject':
      return (
        <SubjectSelectionScreen
          selectedSubjectId={subjectId}
          onSelectSubject={setSubjectId}
          onContinue={() => {
            if (!isMvpSubjectAvailable(subjectId)) return;
            setStep('chapter');
          }}
        />
      );
    case 'chapter':
      return (
        <ChapterSelectionScreen
          selectedChapterId={chapterId}
          onSelectChapter={setChapterId}
          onContinue={() => {
            if (!isMvpChapterAvailable(chapterId)) return;
            setStep('preparing');
          }}
        />
      );
    case 'preparing':
      return <PreparingScreen onComplete={() => setStep('diagnostic-intro')} />;
    case 'diagnostic-intro':
      return (
        <DiagnosticIntroScreen onContinue={() => setStep('diagnostic-question')} />
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
          chapterLabel={chapterLabel}
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
            subjectLabel={subjectLabel || 'Mathématiques'}
            resultsBranch={resolveResultsBranch(diagnostic.result.competencyMastery)}
            onRestartDiagnostic={requestRestartDiagnostic}
            onStartRevisionSession={revision.startSession}
            onSubmitValidationAttempt={revision.submitValidationAttempt}
          />
          <ConfirmationDialog
            open={isRestartDialogOpen}
            onCancel={() => setIsRestartDialogOpen(false)}
            onConfirm={confirmRestartDiagnostic}
          />
        </>
      );
    }
  }
}
