'use client';

import { notFound } from 'next/navigation';
import { HomeScreen } from '@/features/app-shell/HomeScreen';
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionSession } from '@/types/revision';

const DIAGNOSTIC: DiagnosticResult = {
  responses: [],
  competencyMastery: [],
  readinessScore: 72,
  readinessLevel: 'mastered',
  strengths: [],
  weaknesses: [],
  revisionPriorities: [],
  totalEarnedPoints: 0,
  totalMaxPoints: 0,
  completedAt: '2026-08-04T10:00:00.000Z',
};

function session(id: string, status: RevisionSession['status']): RevisionSession {
  return {
    id,
    dayNumber: 1,
    order: 1,
    competencyId: 'calcul-litteral',
    competencyLabel: 'Calcul littéral',
    priorityLevel: 'critical',
    priorityReason: 'test',
    estimatedMinutes: 20,
    masteryBefore: 33,
    targetMastery: 70,
    confidence: 'low',
    revisionUnitId: 'revision-unit:calcul-litteral',
    exitCriteria: [],
    status,
  };
}

const CASES = [
  { label: '0% - plan vide', sessions: [] },
  {
    label: '0% - aucune session terminee',
    sessions: [session('s1', 'not-started'), session('s2', 'not-started')],
  },
  {
    label: 'partielle',
    sessions: [session('s1', 'completed'), session('s2', 'not-started'), session('s3', 'not-started'), session('s4', 'not-started'), session('s5', 'not-started')],
  },
  {
    label: '100%',
    sessions: [session('s1', 'completed'), session('s2', 'completed')],
  },
];

export default function HomePreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-10 p-4">
      {CASES.map((testCase) => (
        <div key={testCase.label} className="flex flex-col gap-2">
          <p className="text-xs font-bold">{testCase.label}</p>
          <HomeScreen
            firstName="Leo"
            diagnosticResult={DIAGNOSTIC}
            revisionPlan={{ sessions: testCase.sessions }}
            nextSession={testCase.sessions.find((s) => s.status !== 'completed') ?? null}
            nextUnit={null}
            subjectLabel="Mathématiques"
            onOpenRevision={() => {}}
            onRestartDiagnostic={() => {}}
          />
        </div>
      ))}
    </div>
  );
}
