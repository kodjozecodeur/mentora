'use client';

import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomNavigation } from '@/components/app-shell/BottomNavigation';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { REVISION_UNITS } from '@/data/revision-units';
import { RevisionNoteScreen } from '@/features/revision/RevisionNoteScreen';
import { RevisionPlanScreen } from '@/features/revision/RevisionPlanScreen';
import { ValidationQuizScreen } from '@/features/revision/ValidationQuizScreen';
import { ValidationResultScreen } from '@/features/revision/ValidationResultScreen';
import { bundledRevisionNotesEngine } from '@/services/revision-notes/bundled-source';
import {
  resolveRevisionSessionContent,
  type RevisionSessionContent,
} from '@/services/revision/experience';
import { getCompetencyStatuses, isReadyForExam } from '@/services/revision/progress';
import { getValidationQuestions } from '@/services/revision/validation';
import { exportStudyPackToPdf } from '@/services/study-pack';
import type { DiagnosticQuestion, DiagnosticResult } from '@/types/diagnostic';
import type { RevisionPlan, ValidationAttempt, ValidationResponse } from '@/types/revision';
import { cn } from '@/lib/utils';
import {
  getNextRevisionSession,
  getRevisionUnitForSession,
  getShellStudentName,
} from './appShellData';
import { DiagnosticScreen } from './DiagnosticScreen';
import { HomeScreen } from './HomeScreen';
import { ProfileScreen } from './ProfileScreen';
import type { AppTab, RevisionShellView } from './types';

const STUDY_PACK_EXPORT_ERROR_MESSAGE =
  "Le Study Pack n'a pas pu s'ouvrir. Autorise les fenêtres pop-up dans ton navigateur, puis réessaie.";

interface AppShellProps {
  diagnosticResult: DiagnosticResult;
  revisionPlan: RevisionPlan;
  diagnosticQuestions: DiagnosticQuestion[];
  firstName?: string;
  examLabel: string;
  subjectLabel: string;
  onRestartDiagnostic: () => void;
  onStartRevisionSession: (revisionUnitId: string) => void;
  onSubmitValidationAttempt: (
    revisionUnitId: string,
    responses: ValidationResponse[],
  ) => ValidationAttempt | null;
  /** Journey state-machine trigger: fires once every competency is validated (may re-fire on every
   * mount while the plan stays fully validated — callers must guard against re-entering the same step). */
  onReadyForExam?: () => void;
}

export function AppShell({
  diagnosticResult,
  revisionPlan,
  diagnosticQuestions,
  firstName,
  examLabel,
  subjectLabel,
  onRestartDiagnostic,
  onStartRevisionSession,
  onSubmitValidationAttempt,
  onReadyForExam,
}: AppShellProps) {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [revisionView, setRevisionView] = useState<RevisionShellView>('plan');
  const [activeRevisionUnitId, setActiveRevisionUnitId] = useState<string | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ValidationAttempt | null>(null);
  const hasNotifiedReadyForExam = useRef(false);

  const studentName = getShellStudentName(firstName, revisionPlan);
  const avatarInitial = studentName.charAt(0).toUpperCase();
  const nextSession = getNextRevisionSession(revisionPlan);
  const nextUnit = getRevisionUnitForSession(nextSession, REVISION_UNITS);
  const activeRevisionContent: RevisionSessionContent | null = activeRevisionUnitId
    ? resolveRevisionSessionContent(revisionPlan, activeRevisionUnitId, bundledRevisionNotesEngine)
    : null;
  const activeValidationQuestions = activeRevisionContent
    ? getValidationQuestions(activeRevisionContent.session.competencyId, diagnosticQuestions)
    : [];
  const showShellHeader = activeTab !== 'revision';

  // Journey trigger (state machine only, no screen built yet): fires once when the last
  // competency in sequence is validated, per spec §3.1 revision -> ready-for-exam.
  useEffect(() => {
    if (hasNotifiedReadyForExam.current) return;
    if (isReadyForExam(revisionPlan)) {
      hasNotifiedReadyForExam.current = true;
      onReadyForExam?.();
    }
  }, [revisionPlan, onReadyForExam]);

  function openRevisionPlan() {
    setActiveTab('revision');
    setRevisionView('plan');
  }

  function openRevisionSession(revisionUnitId: string) {
    const sessionIndex = revisionPlan.sessions.findIndex(
      (session) => session.revisionUnitId === revisionUnitId,
    );
    if (sessionIndex === -1) return;
    // Defense in depth: RevisionPlanScreen already disables locked cards, but a locked
    // competency must never be openable from any entry point (Decision 2, §6).
    if (getCompetencyStatuses(revisionPlan)[sessionIndex] === 'locked') return;

    onStartRevisionSession(revisionUnitId);
    setActiveRevisionUnitId(revisionUnitId);
    setActiveTab('revision');
    setRevisionView('note');
  }

  // The note screen never marks a competency validated itself — it only hands off to validation.
  function startValidation() {
    if (!activeRevisionContent) return;
    setRevisionView('validation-question');
  }

  function submitValidation(responses: ValidationResponse[]) {
    if (!activeRevisionContent) return;
    const attempt = onSubmitValidationAttempt(
      activeRevisionContent.session.revisionUnitId,
      responses,
    );
    if (!attempt) return;
    setActiveAttempt(attempt);
    setRevisionView('validation-result');
  }

  function continueAfterPass() {
    setActiveAttempt(null);
    setRevisionView('plan');
  }

  function retryValidation() {
    setActiveAttempt(null);
    setRevisionView('validation-question');
  }

  function rereadLesson() {
    setActiveAttempt(null);
    setRevisionView('note');
  }

  function downloadStudyPack() {
    try {
      exportStudyPackToPdf({
        diagnosticResult,
        revisionPlan,
        revisionUnits: REVISION_UNITS,
        allRevisionNotes: bundledRevisionNotesEngine.getRevisionNotes(),
        studentName: firstName,
        subjectLabel,
        examLabel,
      });
    } catch {
      window.alert(STUDY_PACK_EXPORT_ERROR_MESSAGE);
    }
  }

  function renderContent() {
    if (activeTab === 'home') {
      return (
        <HomeScreen
          firstName={studentName}
          diagnosticResult={diagnosticResult}
          revisionPlan={revisionPlan}
          nextSession={nextSession}
          nextUnit={nextUnit}
          subjectLabel={subjectLabel}
          onOpenRevision={openRevisionPlan}
          onRestartDiagnostic={onRestartDiagnostic}
        />
      );
    }

    if (activeTab === 'diagnostic') {
      return (
        <DiagnosticScreen
          result={diagnosticResult}
          subjectLabel={subjectLabel}
          onRestartDiagnostic={onRestartDiagnostic}
        />
      );
    }

    if (activeTab === 'profile') {
      return (
        <ProfileScreen firstName={studentName} examLabel={examLabel} subjectLabel={subjectLabel} />
      );
    }

    if (revisionView === 'plan') {
      return (
        <RevisionPlanScreen
          embedded
          plan={revisionPlan}
          readinessScore={diagnosticResult.readinessScore}
          units={REVISION_UNITS}
          onStartSession={openRevisionSession}
          onRestartDiagnostic={onRestartDiagnostic}
          onDownloadStudyPack={downloadStudyPack}
        />
      );
    }

    if (revisionView === 'note' && activeRevisionContent) {
      return (
        <RevisionNoteScreen
          embedded
          content={activeRevisionContent}
          onBack={openRevisionPlan}
          onComplete={startValidation}
        />
      );
    }

    if (revisionView === 'validation-question' && activeRevisionContent) {
      return (
        <ValidationQuizScreen
          embedded
          competencyLabel={activeRevisionContent.session.competencyLabel}
          questions={activeValidationQuestions}
          onComplete={submitValidation}
        />
      );
    }

    if (revisionView === 'validation-result' && activeAttempt && activeRevisionContent) {
      return (
        <ValidationResultScreen
          embedded
          attempt={activeAttempt}
          questions={activeValidationQuestions}
          competencyLabel={activeRevisionContent.session.competencyLabel}
          onContinue={continueAfterPass}
          onRetry={retryValidation}
          onReread={rereadLesson}
        />
      );
    }

    return (
      <RevisionPlanScreen
        embedded
        plan={revisionPlan}
        readinessScore={diagnosticResult.readinessScore}
        units={REVISION_UNITS}
        onStartSession={openRevisionSession}
        onRestartDiagnostic={onRestartDiagnostic}
        onDownloadStudyPack={downloadStudyPack}
      />
    );
  }

  return (
    <div className="bg-background min-h-dvh">
      <ScreenContainer className={cn('pb-28', activeTab === 'home' && 'bg-[#FCF9F8]')}>
        <div className="flex min-h-[calc(100dvh-1.5rem)] flex-col">
          {showShellHeader &&
            (activeTab === 'home' ? (
              <header
                className="flex items-center justify-between gap-3 pb-5"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
              >
                <Menu className="size-6 shrink-0 text-[#705d00]" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icons/icon-mentora.svg" alt="Mentora" className="h-10 w-auto" />
                <div
                  className="border-border bg-surface text-foreground flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
                  aria-label={`Profil de ${studentName}`}
                >
                  {avatarInitial}
                </div>
              </header>
            ) : (
              <header className="flex items-center gap-3 pb-5">
                <AppLogo size="sm" className="size-10" />
                <div className="flex flex-col">
                  <span className="text-foreground text-base font-extrabold">Mentora</span>
                  <span className="text-muted text-xs font-semibold">{getTabTitle(activeTab)}</span>
                </div>
              </header>
            ))}
          <div className="flex min-h-0 flex-1 flex-col">{renderContent()}</div>
        </div>
      </ScreenContainer>
      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

function getTabTitle(tab: AppTab): string {
  if (tab === 'home') return 'Accueil';
  if (tab === 'diagnostic') return 'Diagnostic';
  if (tab === 'revision') return 'Révision';
  return 'Profil';
}
