import type { RevisionPlan, RevisionSession, RevisionUnit } from '@/types/revision';

export type RevisionProgressSummary = {
  completedSessions: number;
  totalSessions: number;
  completionPercent: number;
  remainingMinutes: number;
};

export function getNextRevisionSession(
  plan: Pick<RevisionPlan, 'sessions'>,
): RevisionSession | null {
  return plan.sessions.find((session) => session.status !== 'completed') ?? null;
}

export function getRevisionUnitForSession(
  session: Pick<RevisionSession, 'revisionUnitId'> | null,
  units: readonly RevisionUnit[],
): RevisionUnit | null {
  if (!session) return null;
  return units.find((unit) => unit.id === session.revisionUnitId) ?? null;
}

export function getRevisionProgress(plan: Pick<RevisionPlan, 'sessions'>): RevisionProgressSummary {
  const completedSessions = plan.sessions.filter(
    (session) => session.status === 'completed',
  ).length;
  const totalSessions = plan.sessions.length;
  const remainingMinutes = plan.sessions
    .filter((session) => session.status !== 'completed')
    .reduce((total, session) => total + session.estimatedMinutes, 0);

  return {
    completedSessions,
    totalSessions,
    completionPercent:
      totalSessions === 0 ? 0 : Math.round((completedSessions / totalSessions) * 100),
    remainingMinutes,
  };
}

export function hasStartedRevision(plan: Pick<RevisionPlan, 'sessions'>): boolean {
  return plan.sessions.some((session) => session.status !== 'not-started');
}

export function getShellStudentName(
  currentName: string | undefined,
  plan: Pick<RevisionPlan, 'studentName'>,
): string {
  const name = currentName?.trim() || plan.studentName?.trim();
  return name || 'élève';
}
