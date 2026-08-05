import type { RevisionPlan, RevisionSession, ValidationAttempt } from '@/types/revision';

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

/** Records a targeted-validation attempt: pass -> session validated, fail -> stays in-progress (Decision 5/7). */
export function recordValidationAttempt(
  plan: RevisionPlan,
  revisionUnitId: string,
  attempt: ValidationAttempt,
): RevisionPlan {
  const sessionIndex = plan.sessions.findIndex(
    (session) => session.revisionUnitId === revisionUnitId,
  );
  if (sessionIndex === -1) {
    throw new Error(`Aucune session trouvée pour l’unité de révision « ${revisionUnitId} »`);
  }

  return {
    ...plan,
    sessions: plan.sessions.map((session, index) => {
      if (index !== sessionIndex) return { ...session };
      return {
        ...session,
        status: attempt.passed ? 'completed' : 'in-progress',
        validationAttempts: [...session.validationAttempts, attempt],
      };
    }),
  };
}

export type CompetencyStatus = 'locked' | 'available' | 'in-progress' | 'validated';

/** 'completed' now specifically means the latest validation attempt passed. */
export function isSessionValidated(session: RevisionSession): boolean {
  return session.status === 'completed';
}

/**
 * Locking rule: a competency is unlocked iff it's first in sequence, or the one immediately
 * before it is validated. Lock state is always derived, never independently stored.
 */
export function getCompetencyStatus(sessions: RevisionSession[], index: number): CompetencyStatus {
  const session = sessions[index];
  if (isSessionValidated(session)) return 'validated';

  const isUnlocked = index === 0 || isSessionValidated(sessions[index - 1]);
  if (!isUnlocked) return 'locked';

  return session.status === 'in-progress' ? 'in-progress' : 'available';
}

export function getCompetencyStatuses(plan: Pick<RevisionPlan, 'sessions'>): CompetencyStatus[] {
  const orderedSessions = [...plan.sessions].sort((left, right) => left.order - right.order);
  return orderedSessions.map((_, index) => getCompetencyStatus(orderedSessions, index));
}
