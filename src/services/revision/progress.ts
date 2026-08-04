import type { RevisionPlan, RevisionSession } from '@/types/revision';

export function updateRevisionSessionStatus(
  plan: RevisionPlan,
  revisionUnitId: string,
  status: RevisionSession['status'],
): RevisionPlan {
  const sessionIndex = plan.sessions.findIndex(
    (session) => session.revisionUnitId === revisionUnitId,
  );
  if (sessionIndex === -1) {
    throw new Error(`Aucune session trouvée pour l’unité de révision « ${revisionUnitId} »`);
  }

  return {
    ...plan,
    sessions: plan.sessions.map((session, index) =>
      index === sessionIndex ? { ...session, status } : { ...session },
    ),
  };
}

export function isRevisionPlanComplete(plan: RevisionPlan): boolean {
  return plan.sessions.every((session) => session.status === 'completed');
}

export function getCompletedSessionCount(plan: RevisionPlan): number {
  return plan.sessions.filter((session) => session.status === 'completed').length;
}
