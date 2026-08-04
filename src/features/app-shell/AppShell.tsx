'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { BottomNavigation } from '@/components/app-shell/BottomNavigation';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { REVISION_UNITS } from '@/data/revision-units';
import { RevisionNoteScreen } from '@/features/revision/RevisionNoteScreen';
import { RevisionPlanScreen } from '@/features/revision/RevisionPlanScreen';
import { bundledRevisionNotesEngine } from '@/services/revision-notes/bundled-source';
import {
  resolveRevisionSessionContent,
  type RevisionSessionContent,
} from '@/services/revision/experience';
import { exportStudyPackToPdf } from '@/services/study-pack';
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionPlan } from '@/types/revision';
import { cn } from '@/lib/utils';
import {
  getNextRevisionSession,
  getRevisionUnitForSession,
  getShellStudentName,
} from './appShellData';
import { DiagnosticScreen } from './DiagnosticScreen';
import { HomeScreen } from './HomeScreen';
import { ProfileScreen } from './ProfileScreen';
import { RevisionOverviewScreen } from './RevisionOverviewScreen';
import type { AppTab, RevisionShellView } from './types';

interface AppShellProps {
  diagnosticResult: DiagnosticResult;
  revisionPlan: RevisionPlan;
  firstName?: string;
  examLabel: string;
  subjectLabel: string;
  onRestartDiagnostic: () => void;
  onStartRevisionSession: (revisionUnitId: string) => void;
  onCompleteRevisionSession: (revisionUnitId: string) => void;
  onDownloadStudyPack?: () => void;
}

const STUDY_PACK_EXPORT_ERROR_MESSAGE =
  "Le Study Pack n'a pas pu s'ouvrir. Autorise les fenêtres pop-up dans ton navigateur, puis réessaie.";

export function AppShell({
  diagnosticResult,
  revisionPlan,
  firstName,
  examLabel,
  subjectLabel,
  onRestartDiagnostic,
  onStartRevisionSession,
  onCompleteRevisionSession,
  onDownloadStudyPack,
}: AppShellProps) {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [revisionView, setRevisionView] = useState<RevisionShellView>('overview');
  const [activeRevisionUnitId, setActiveRevisionUnitId] = useState<string | null>(null);

  const studentName = getShellStudentName(firstName, revisionPlan);
  const avatarInitial = studentName.charAt(0).toUpperCase();
  const nextSession = getNextRevisionSession(revisionPlan);
  const nextUnit = getRevisionUnitForSession(nextSession, REVISION_UNITS);
  const activeRevisionContent: RevisionSessionContent | null = activeRevisionUnitId
    ? resolveRevisionSessionContent(revisionPlan, activeRevisionUnitId, bundledRevisionNotesEngine)
    : null;
  const showShellHeader = activeTab !== 'revision' || revisionView === 'overview';

  function openRevisionOverview() {
    setActiveTab('revision');
    setRevisionView('overview');
  }

  function openRevisionPlan() {
    setActiveTab('revision');
    setRevisionView('plan');
  }

  function openRevisionSession(revisionUnitId: string) {
    onStartRevisionSession(revisionUnitId);
    setActiveRevisionUnitId(revisionUnitId);
    setActiveTab('revision');
    setRevisionView('note');
  }

  function completeRevisionSession() {
    if (!activeRevisionContent) return;
    onCompleteRevisionSession(activeRevisionContent.session.revisionUnitId);
    setRevisionView('plan');
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
          onOpenRevision={openRevisionOverview}
          onRestartDiagnostic={onRestartDiagnostic}
        />
      );
    }

    if (activeTab === 'diagnostic') {
      return (
        <DiagnosticScreen result={diagnosticResult} onRestartDiagnostic={onRestartDiagnostic} />
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
        />
      );
    }

    if (revisionView === 'note' && activeRevisionContent) {
      return (
        <RevisionNoteScreen
          embedded
          content={activeRevisionContent}
          onBack={openRevisionPlan}
          onComplete={completeRevisionSession}
        />
      );
    }

    return (
      <RevisionOverviewScreen
        plan={revisionPlan}
        onContinue={openRevisionPlan}
        onDownloadStudyPack={onDownloadStudyPack ?? downloadStudyPack}
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
